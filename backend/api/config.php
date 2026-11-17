<?php
// Cấu hình kết nối CSDL. Mặc định là XAMPP: người dùng root, không mật khẩu.
// Muốn đổi, tạo tệp config.local.php cạnh tệp này (xem config.local.example.php). Tệp đó không đưa vào git.
$cfg = ['host' => '127.0.0.1', 'port' => 3306, 'name' => 'okr', 'user' => 'root', 'pass' => ''];
$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $cfg = array_merge($cfg, require $local);
}
return $cfg;
