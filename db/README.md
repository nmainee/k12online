# Cài đặt CSDL `okr` và API trên XAMPP

1. **Tạo CSDL**: mở `http://localhost/phpmyadmin`, tạo CSDL `okr` (bảng chữ `utf8mb4_general_ci`) rồi nhập `docs/okr.sql` nếu CSDL còn trống.
2. **Nâng cấp cấu trúc**: tab SQL của CSDL `okr`, dán toàn bộ `db/01-migration.sql`, bấm Thực hiện. Tệp chỉ thêm cột và bảng, chạy lại nhiều lần không sao.
3. **Nạp dữ liệu mẫu** (tùy chọn): dán `db/02-seed.sql`. Mọi tài khoản mẫu có mật khẩu `123456`: `hung.nv` (giám đốc), `ha.tt` (trưởng phòng), `quan.lm` (nhân viên)...
4. **Chép giao diện và API**: giải nén `okr-dist.zip` vào `C:\xampp\htdocs\okr\` (có `index.html`, `assets`, `api`, `.htaccess` ngay trong thư mục `okr`).
5. **Cấu hình kết nối** (chỉ cần nếu MySQL không phải `root`, không mật khẩu, cổng 3306): sao chép `okr\api\config.local.example.php` thành `config.local.php` rồi sửa.
6. Mở `http://localhost/okr/`.

Thiếu `pdo_mysql` hoặc MySQL chưa chạy thì trang đăng nhập báo "Chưa nối CSDL" và chạy bằng dữ liệu minh họa.

## Cách giao diện dùng các bảng
`01-migration.sql` chỉ thêm 3 cột vào bảng `users` (xem bảng ánh xạ ở `frontend/src/api.js`, biến `MAP`):
- `avatar`: ảnh đại diện.
- `status`: `ACTIVE` hoặc `LOCK`. Tài khoản `LOCK` không đăng nhập được; giám đốc khóa và mở khóa ở màn Quản lý tài khoản.
- `deleted_at`: **xóa mềm tài khoản**. Khi xóa, API chỉ đặt `deleted_at = NOW()`; mọi truy vấn về `users` đều lọc `deleted_at IS NULL` nên tài khoản đã xóa không còn hiển thị và không đăng nhập được, còn OKR, công việc... của họ vẫn giữ. Muốn khôi phục, đặt lại `deleted_at = NULL` trong phpMyAdmin.

Các bảng khác xóa thật. Xóa OKR thì công việc, check-in và review của OKR đó bị xóa theo.

Quy ước khác:
- OKR nhiều KR lưu dạng JSON trong `okrs.key_results`; `okrs.o_relevant` giữ mã OKR cấp trên; `okrs.display` = 1 là công khai.
- Giám đốc đứng đầu có `users.superior` trùng chính `user_id` (cột này bắt buộc khác rỗng).
- **Nhật ký hoạt động**: suy ra từ check-in, TodayList, ghi nhận, phản hồi, trò chuyện, đổi quà. Không ghi đăng nhập.
- Không lưu được vì thiếu cột: chức vụ (`title`), điểm của từng lần review, số lượng quà trong kho (quà luôn "còn hàng"). Điểm thưởng của người dùng (`users.points`) vẫn lưu bình thường.
