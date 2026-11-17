-- Bổ sung cột cho CSDL `okr`. Chạy lại nhiều lần không sao (MariaDB 10.4 trở lên).
-- Chạy trong phpMyAdmin: chọn CSDL `okr` > tab SQL > dán > Thực hiện.

-- Chỉ bảng users cần thêm cột:
--   avatar     ảnh đại diện
--   status     'ACTIVE' (đang hoạt động) hoặc 'LOCK' (bị khóa, không đăng nhập được)
--   deleted_at xóa mềm: có giá trị (thời điểm xóa) nghĩa là tài khoản đã bị xóa, API và giao diện không hiển thị nữa
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `avatar`     mediumtext  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `status`     varchar(20) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS `deleted_at` timestamp   NULL DEFAULT NULL;
