<?php
// API cho giao diện OKR VHV: đăng nhập bằng phiên (session) và CRUD tổng quát trên các bảng của CSDL `okr`.
// Địa chỉ dạng /okr/api/index.php/<đường dẫn>, ví dụ: POST .../index.php/login, GET .../index.php/bootstrap, PUT .../index.php/okrs/3
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out($data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function fail(string $msg, int $code): never
{
    out(['error' => $msg], $code);
}

// ---------- Kết nối ----------
$cfg = require __DIR__ . '/config.php';
try {
    $pdo = new PDO(
        "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['name']};charset=utf8mb4",
        $cfg['user'],
        $cfg['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
} catch (PDOException $e) {
    error_log('OKR API: không kết nối được CSDL: ' . $e->getMessage());
    fail('Không kết nối được CSDL. Kiểm tra MySQL đã chạy và tệp config.local.php.', 503);
}

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
session_start();

// Bảng cho phép thao tác → khóa chính.
const TABLES = [
    'users' => 'user_id', 'departments' => 'department_id', 'okrs' => 'okr_id', 'todaylist' => 'task_id',
    'checkinform' => 'checkin_id', 'checkinreview' => 'review_id', 'conversation' => 'conversation_id',
    'feedback' => 'feedback_id', 'recognition' => 'recognition_id', 'store' => 'store_id', 'redeem' => 'redeem_id',
];

function columns(PDO $pdo, string $table): array
{
    static $cache = [];
    if (!isset($cache[$table])) {
        $cache[$table] = array_column($pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll(), 'Field');
    }
    return $cache[$table];
}

function currentUser(PDO $pdo): ?array
{
    if (empty($_SESSION['uid'])) {
        return null;
    }
    // Bản ghi đã xóa mềm (deleted_at có giá trị) hoặc tài khoản bị khóa thì không còn phiên làm việc.
    $st = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND deleted_at IS NULL AND status <> 'LOCK'");
    $st->execute([$_SESSION['uid']]);
    return $st->fetch() ?: null;
}

function publicUser(array $u): array
{
    $u['active'] = ($u['status'] ?? 'ACTIVE') === 'LOCK' ? 0 : 1;
    unset($u['password']);
    return $u;
}

/** Nhật ký hoạt động suy ra từ các bảng sẵn có (không cần bảng riêng). */
function activityFeed(PDO $pdo): array
{
    $sql = <<<'SQL'
SELECT ROW_NUMBER() OVER (ORDER BY t DESC) AS log_id, t AS log_time, who AS user_name, action FROM (
        SELECT c.updated_at AS t, u.fullname AS who,
               CONCAT('Check-in OKR #', c.okr_id, CASE c.status WHEN 'draft' THEN ': lưu nháp' WHEN 'waiting' THEN ': gửi chờ phản hồi' WHEN 'checked' THEN ': đã được review' ELSE '' END) AS action
          FROM checkinform c JOIN users u ON u.user_id = c.user_id
        UNION ALL SELECT t.created_at, u.fullname, CONCAT('Tạo công việc "', t.task_name, '"')
          FROM todaylist t JOIN users u ON u.user_id = t.user_id
        UNION ALL SELECT CAST(r.recognition_date AS DATETIME), s.fullname, CONCAT('Ghi nhận ', v.fullname, ' +', r.bonus_points, ' điểm')
          FROM recognition r JOIN users s ON s.user_id = r.sender_id JOIN users v ON v.user_id = r.receiver_id
        UNION ALL SELECT CAST(f.feedback_date AS DATETIME), s.fullname, CONCAT('Gửi phản hồi cho ', v.fullname)
          FROM feedback f JOIN users s ON s.user_id = f.sender_id JOIN users v ON v.user_id = f.receiver_id
        UNION ALL SELECT CAST(c.conversation_date AS DATETIME), m.fullname, CONCAT('Trò chuyện 1-1 với ', p.fullname)
          FROM conversation c JOIN users m ON m.user_id = c.manager_id JOIN users p ON p.user_id = c.participant_id
        UNION ALL SELECT d.redeem_date, u.fullname, CONCAT('Đổi quà: ', g.gift_name, ' x', d.quantity)
          FROM redeem d JOIN users u ON u.user_id = d.user_id JOIN store g ON g.store_id = d.store_id
    ) x ORDER BY t DESC LIMIT 150
SQL;
    return $pdo->query($sql)->fetchAll();
}

// ---------- Đọc yêu cầu ----------
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';
if ($path === '' && isset($_SERVER['REQUEST_URI'])) {
    $uri = strtok($_SERVER['REQUEST_URI'], '?');
    $pos = strpos($uri, 'index.php');
    $path = $pos === false ? '' : substr($uri, $pos + strlen('index.php'));
}
$parts = array_values(array_filter(explode('/', trim($path, '/')), 'strlen'));
$route = $parts[0] ?? '';
$id = $parts[1] ?? null;

$body = [];
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    // Chặn yêu cầu giả mạo từ trang khác: chỉ giao diện của chúng ta gửi tiêu đề tùy biến này.
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'okr') {
        fail('Yêu cầu không hợp lệ.', 400);
    }
    $raw = file_get_contents('php://input');
    if ($raw !== '' && $raw !== false) {
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            fail('Dữ liệu gửi lên không đúng định dạng JSON.', 400);
        }
    }
}

try {
    // ---------- Đăng nhập, đăng xuất ----------
    if ($route === 'login' && $method === 'POST') {
        $username = trim((string)($body['username'] ?? ''));
        $password = (string)($body['password'] ?? '');
        $st = $pdo->prepare('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL');
        $st->execute([$username]);
        $u = $st->fetch();
        $ok = false;
        if ($u) {
            $stored = (string)$u['password'];
            if (preg_match('/^\$2[aby]\$/', $stored)) {
                $ok = password_verify($password, $stored);
            } else {
                // Mật khẩu cũ lưu dạng thường: chấp nhận một lần rồi mã hóa lại.
                $ok = $stored !== '' && hash_equals($stored, $password);
                if ($ok) {
                    $pdo->prepare('UPDATE users SET password = ? WHERE user_id = ?')->execute([password_hash($password, PASSWORD_BCRYPT), $u['user_id']]);
                }
            }
        }
        if (!$ok) {
            usleep(400000);
            fail('Tên đăng nhập hoặc mật khẩu chưa đúng.', 401);
        }
        if (($u['status'] ?? 'ACTIVE') === 'LOCK') {
            fail('Tài khoản này đang bị khóa. Liên hệ giám đốc để mở lại.', 403);
        }
        session_regenerate_id(true);
        $_SESSION['uid'] = (int)$u['user_id'];
        out(['user' => publicUser($u)]);
    }
    if ($route === 'logout' && $method === 'POST') {
        $_SESSION = [];
        session_destroy();
        out(['ok' => true]);
    }

    // Các đường còn lại cần đăng nhập.
    $me = currentUser($pdo);
    if (!$me) {
        fail('Phiên đăng nhập đã hết. Hãy đăng nhập lại.', 401);
    }
    $isDirector = $me['role'] === 'director';

    if ($route === 'me' && $method === 'GET') {
        out(['user' => publicUser($me)]);
    }

    // ---------- Dữ liệu khởi tạo ----------
    if ($route === 'bootstrap' && $method === 'GET') {
        $data = [];
        foreach (TABLES as $table => $pk) {
            // Chỉ bảng users có xóa mềm (deleted_at).
            $where = $table === 'users' ? ' WHERE deleted_at IS NULL' : '';
            $rows = $pdo->query("SELECT * FROM `$table`$where ORDER BY `$pk`")->fetchAll();
            if ($table === 'users') {
                $rows = array_map('publicUser', $rows);
            }
            $data[$table] = $rows;
        }
        $data['activity_log'] = $isDirector ? activityFeed($pdo) : [];
        out(['me' => (int)$me['user_id'], 'tables' => $data]);
    }

    // ---------- CRUD tổng quát ----------
    if (!isset(TABLES[$route])) {
        fail('Không tìm thấy đường dẫn.', 404);
    }
    $table = $route;
    $pk = TABLES[$table];
    $cols = columns($pdo, $table);

    if ($method === 'GET' && $id === null) {
        $rows = $pdo->query("SELECT * FROM `$table`" . ($table === 'users' ? ' WHERE deleted_at IS NULL' : ''))->fetchAll();
        out($table === 'users' ? array_map('publicUser', $rows) : $rows);
    }

    // Phân quyền ghi dữ liệu.
    if (!$isDirector) {
        if (in_array($table, ['departments'], true)) {
            fail('Chỉ giám đốc được thay đổi dữ liệu này.', 403);
        }
        if (in_array($table, ['users', 'store'], true) && in_array($method, ['POST', 'DELETE'], true)) {
            fail('Chỉ giám đốc được thêm hoặc xóa dữ liệu này.', 403);
        }
    }

    $clean = static function (array $row) use ($cols): array {
        unset($row['deleted_at']); // chỉ API được đặt cờ xóa
        return array_intersect_key($row, array_flip($cols));
    };

    if ($method === 'POST' && $id === null) {
        $row = $clean($body);
        if ($table === 'users') {
            // Tài khoản mới có mật khẩu tạm; người dùng nên đổi sau khi đăng nhập.
            $row['password'] = password_hash((string)($body['password'] ?? '123456'), PASSWORD_BCRYPT);
        }
        if (!$row) {
            fail('Thiếu dữ liệu.', 400);
        }
        $names = array_keys($row);
        $sql = 'INSERT INTO `' . $table . '` (`' . implode('`,`', $names) . '`) VALUES (' . implode(',', array_fill(0, count($names), '?')) . ')';
        $pdo->prepare($sql)->execute(array_values($row));
        $newId = $row[$pk] ?? (int)$pdo->lastInsertId();
        out(['id' => (int)$newId], 201);
    }

    if ($id === null || !ctype_digit($id)) {
        fail('Thiếu mã bản ghi.', 400);
    }
    $rid = (int)$id;

    if ($method === 'PUT') {
        $row = $clean($body);
        unset($row[$pk]);
        if ($table === 'users') {
            if (!$isDirector && $rid !== (int)$me['user_id']) {
                // Người không phải giám đốc chỉ được cộng/trừ điểm của người khác (ghi nhận, đổi quà).
                $row = array_intersect_key($row, ['points' => 1]);
            }
            if (!$isDirector) {
                // Vai trò, phòng ban, cấp trên và trạng thái khóa do giám đốc quản lý.
                unset($row['role'], $row['department_id'], $row['superior'], $row['username'], $row['status']);
                if (isset($row['points'])) {
                    // Điểm của mình chỉ được giảm (đổi quà); điểm của người khác chỉ được tăng (ghi nhận, phản hồi).
                    $st = $pdo->prepare('SELECT points FROM users WHERE user_id = ?');
                    $st->execute([$rid]);
                    $old = (int)$st->fetchColumn();
                    $new = (int)$row['points'];
                    $self = $rid === (int)$me['user_id'];
                    if (($self && $new > $old) || (!$self && $new < $old)) {
                        unset($row['points']);
                    }
                }
            }
            if (isset($row['password'])) {
                $row['password'] = password_hash((string)$row['password'], PASSWORD_BCRYPT);
            }
            if ($rid === (int)$me['user_id']) {
                unset($row['status']); // không tự khóa tài khoản của mình
            }
        }
        if ($table === 'store' && !$isDirector) {
            $row = []; // kho quà không có cột số lượng; giám đốc mới được sửa quà
        }
        if (!$row) {
            out(['ok' => true]);
        }
        $set = implode(',', array_map(static fn($c) => "`$c` = ?", array_keys($row)));
        $pdo->prepare("UPDATE `$table` SET $set WHERE `$pk` = ?" . ($table === 'users' ? ' AND deleted_at IS NULL' : ''))->execute([...array_values($row), $rid]);
        out(['ok' => true]);
    }

    if ($method === 'DELETE') {
        if ($table === 'users') {
            // Xóa mềm tài khoản: chỉ đặt deleted_at, giữ lại OKR, công việc... của họ.
            if ($rid === (int)$me['user_id']) {
                fail('Không thể xóa chính tài khoản đang đăng nhập.', 400);
            }
            $pdo->prepare('UPDATE users SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL')->execute([$rid]);
            out(['ok' => true]);
        }
        $pdo->beginTransaction();
        if ($table === 'okrs') {
            // Bỏ các dữ liệu gắn với OKR này để không vướng ràng buộc khóa ngoại.
            foreach (['todaylist', 'checkinreview', 'checkinform'] as $child) {
                $pdo->prepare("DELETE FROM `$child` WHERE okr_id = ?")->execute([$rid]);
            }
        }
        $pdo->prepare("DELETE FROM `$table` WHERE `$pk` = ?")->execute([$rid]);
        $pdo->commit();
        out(['ok' => true]);
    }

    fail('Phương thức không được hỗ trợ.', 405);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('OKR API: ' . $e->getMessage());
    $msg = $e->getCode() === '23000'
        ? 'Dữ liệu bị trùng hoặc đang được dữ liệu khác sử dụng nên chưa lưu được.'
        : 'Lỗi CSDL, chưa lưu được. Xem nhật ký của Apache để biết chi tiết.';
    fail($msg, $e->getCode() === '23000' ? 409 : 500);
}
