-- Dữ liệu mẫu cho CSDL `okr` (sinh từ dữ liệu minh họa của giao diện). Chạy SAU 01-migration.sql (cột users.avatar, users.status, deleted_at).
-- Dùng INSERT IGNORE nên không ghi đè bản ghi đã có cùng mã. Mật khẩu của mọi tài khoản mẫu là: 123456
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO `departments` (`department_id`,`department_name`) VALUES
(1,'Ban giám đốc'),
(2,'Phòng Công nghệ'),
(3,'Phòng Kinh doanh');

INSERT IGNORE INTO `users` (`user_id`,`username`,`fullname`,`role`,`department_id`,`superior`,`points`,`email`,`phone_number`,`gender`,`date_birth`,`month_birth`,`year_birth`,`avatar`,`status`,`password`) VALUES
(1,'hung.nv','Nguyễn Văn Hùng','director',1,1,0,'hung.nv@vhv.vn','0903 111 001','Nam','1982-04-12','1982-04-12',1982,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(2,'ha.tt','Trần Thu Hà','manager',2,1,85,'ha.tt@vhv.vn','0903 111 002','Nữ','1988-09-03','1988-09-03',1988,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(3,'quan.lm','Lê Minh Quân','staff',2,2,120,'quan.lm@vhv.vn','0903 111 003','Nam','1996-01-21','1996-01-21',1996,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(4,'anh.pn','Phạm Ngọc Anh','staff',2,2,64,'anh.pn@vhv.vn','0903 111 004','Nữ','1998-06-30','1998-06-30',1998,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(5,'tung.vt','Vũ Thanh Tùng','manager',3,1,92,'tung.vt@vhv.vn','0903 111 005','Nam','1986-11-15','1986-11-15',1986,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(6,'yen.dh','Đỗ Hải Yến','staff',3,5,148,'yen.dh@vhv.vn','0903 111 006','Nữ','1997-02-08','1997-02-08',1997,NULL,'ACTIVE','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2'),
(7,'long.bt','Bùi Thành Long','staff',3,5,40,'long.bt@vhv.vn','0903 111 007','Nam','1999-12-02','1999-12-02',1999,NULL,'LOCK','$2y$10$OKzTq3Od2M7JEYUWn4Mm1ObcVxF0uyB1VoJGEXkufB//ps1q4ohj2');

INSERT IGNORE INTO `okrs` (`okr_id`,`user_id`,`department_id`,`type`,`cycle`,`o_relevant`,`objective`,`key_results`,`target`,`unit`,`link_plans`,`link_results`,`kr_relevant`,`o_cross`,`display`,`status`) VALUES
(1,1,1,'company','Tháng 11/2026','','Đưa nền tảng quản trị hiệu suất OKR vào vận hành toàn công ty','{"krs":[{"id":11,"text":"Số nhân viên check-in OKR đúng hạn mỗi tuần","target":90,"current":71,"unit":"%"},{"id":12,"text":"Số phòng ban hoàn tất họp OKR hàng tuần","target":12,"current":9,"unit":"buổi"},{"id":13,"text":"Điểm hài lòng của nhân viên với quy trình mới","target":8,"current":6.8,"unit":"/10"}]}',90,'%','','','','',1,'approved'),
(2,2,2,'team','Tuần 47','1','Hoàn thiện module Check-in và Dashboard cho bản thử nghiệm','{"krs":[{"id":21,"text":"Số màn hình hoàn thành và qua kiểm thử","target":12,"current":8,"unit":"màn"},{"id":22,"text":"Số lỗi mức cao còn tồn đọng","target":0,"current":3,"unit":"lỗi","lowerIsBetter":true}]}',12,'màn','','','','',1,'approved'),
(3,3,2,'personal','Tuần 47','2','Hoàn thành giao diện và API cho chức năng Check-in OKR','{"krs":[{"id":31,"text":"Số API check-in hoàn thành","target":6,"current":4,"unit":"API"},{"id":32,"text":"Độ phủ kiểm thử đơn vị cho module check-in","target":80,"current":55,"unit":"%"}]}',6,'API','','','','',1,'approved'),
(4,4,2,'personal','Tuần 47','2','Xây dựng trang thống kê OKR theo phòng ban','{"krs":[{"id":41,"text":"Số biểu đồ thống kê hoàn thành","target":4,"current":1,"unit":"biểu đồ"},{"id":42,"text":"Thời gian tải trang thống kê","target":3,"current":4.2,"unit":"giây","lowerIsBetter":true}]}',4,'biểu đồ','','','','',1,'pending'),
(5,5,3,'team','Tuần 47','1','Giới thiệu hệ thống OKR cho 5 khách hàng tiềm năng','{"krs":[{"id":51,"text":"Số buổi demo đã thực hiện","target":5,"current":3,"unit":"buổi"},{"id":52,"text":"Số khách hàng đồng ý dùng thử","target":2,"current":1,"unit":"khách"}]}',5,'buổi','','','','',1,'approved'),
(6,6,3,'personal','Tuần 47','5','Chốt lịch demo với nhóm khách hàng khu vực phía Nam','{"krs":[{"id":61,"text":"Số cuộc gọi tư vấn đã thực hiện","target":20,"current":12,"unit":"cuộc"},{"id":62,"text":"Số lịch demo đã chốt","target":3,"current":1,"unit":"lịch"}]}',20,'cuộc','','','','',1,'needs_edit'),
(7,3,2,'personal','Tuần 47','2','Học và áp dụng kiến trúc phân lớp cho phần backend','{"krs":[{"id":71,"text":"Số tài liệu kiến trúc đã đọc và ghi chú","target":3,"current":0,"unit":"tài liệu"}]}',3,'tài liệu','','','','',0,'draft');

INSERT IGNORE INTO `todaylist` (`task_id`,`user_id`,`department_id`,`okr_id`,`task_name`,`description`,`status`,`priority`,`created_at`,`deadline`,`estimate_time`,`attachments`,`comments`) VALUES
(1,3,2,3,'Viết API lưu check-in nháp','Endpoint POST /checkins với trạng thái draft, kiểm tra KR thuộc OKR của người dùng.','doing','high','2026-11-16 08:00:00','2026-11-16 17:00:00',3,'','Chờ chốt cấu trúc bảng CheckinForm.'),
(2,3,2,3,'Viết test cho tính % tiến độ','','todo','medium','2026-11-16 08:00:00','2026-11-17 12:00:00',2,'',''),
(3,3,2,3,'Ghép form check-in với API','','review','high','2026-11-16 08:00:00','2026-11-16 15:00:00',4,'','Đã gửi chị Hà xem.'),
(4,3,2,2,'Sửa lỗi hiển thị biểu đồ trên Safari','','done','low','2026-11-16 08:00:00','2026-11-16 10:00:00',1,'',''),
(5,3,2,3,'Họp đồng bộ tiến độ với nhóm','','cancelled','low','2026-11-16 08:00:00','2026-11-16 09:00:00',0.5,'','Dời sang thứ Ba.'),
(6,4,2,4,'Dựng biểu đồ tiến độ theo phòng ban','','doing','high','2026-11-16 08:00:00','2026-11-16 17:00:00',5,'',''),
(7,6,3,6,'Gọi nhóm khách hàng Cần Thơ','','todo','medium','2026-11-16 08:00:00','2026-11-16 16:00:00',2,'',''),
(8,2,2,2,'Duyệt OKR tuần của nhóm','','doing','high','2026-11-16 08:00:00','2026-11-16 11:00:00',1,'','');

INSERT IGNORE INTO `checkinform` (`checkin_id`,`okr_id`,`user_id`,`checkin_date`,`progress_value`,`progress_percent`,`confidence_level`,`status`,`work_summary`,`slow_tasks`,`obstacles`,`solutions`) VALUES
(1,3,3,'2026-11-14',62,62,3,'draft','Đã xong 4/6 API, form check-in hiển thị đúng dữ liệu.','Test đơn vị cho module tính % chưa viết.','Cấu trúc bảng CheckinForm đổi hai lần trong tuần.','Chốt lược đồ với chị Hà vào sáng thứ Hai.'),
(2,3,3,'2026-11-09',100,100,3,'checked','Hoàn thành 3/3 API đăng nhập và hồ sơ.','','Không có.',''),
(3,4,4,'2026-11-15',38,38,2,'waiting','Mới xong 1/4 biểu đồ, trang tải chậm 4,2 giây.','Truy vấn tổng hợp theo phòng ban.','Dữ liệu mẫu quá ít để đo hiệu năng.','Sinh thêm 10.000 bản ghi để thử.'),
(4,6,6,'2026-11-15',48,48,2,'draft','12/20 cuộc gọi, chốt được 1 lịch demo.','','Khách hàng phía Nam khó sắp xếp lịch.','Đề xuất demo online.');

INSERT IGNORE INTO `checkinreview` (`review_id`,`checkin_id`,`okr_id`,`user_id`,`checkin_status`,`team_comment`,`personal_comment`,`summary_comment`) VALUES
(1,2,3,2,'checked','Đúng hạn, API chạy ổn định.','Quân chủ động báo sớm khi đổi lược đồ.','Hoàn thành tốt');

INSERT IGNORE INTO `conversation` (`conversation_id`,`manager_id`,`participant_id`,`week_id`,`topic`,`content`,`action`,`trust_score`,`conversation_date`) VALUES
(1,2,3,46,'Tổng kết tuần 46','Hoàn thành API đăng nhập và hồ sơ. Cần thêm test cho phần phân quyền.','Quân viết test phân quyền trước thứ Tư.',5,'2026-11-09'),
(2,5,6,46,'Kế hoạch demo khu vực phía Nam','Còn 2 khách hàng chưa trả lời. Thống nhất dùng demo online.','Yến gửi lịch cho cả 5 khách trong ngày.',4,'2026-11-09');

INSERT IGNORE INTO `feedback` (`feedback_id`,`sender_id`,`receiver_id`,`week_id`,`type`,`content`,`evidence`,`level_impact`,`feedback_date`) VALUES
(1,2,3,46,'praise','Báo cáo check-in rõ ràng, có số liệu và giải pháp cụ thể.','Check-in tuần 46','Cao','2026-11-10'),
(2,3,4,46,'improve','Nên ghi lại nguồn dữ liệu của biểu đồ để người sau kiểm tra lại được.','Trang thống kê OKR','Trung bình','2026-11-11'),
(3,6,5,46,'praise','Anh chốt nhanh hướng demo online, nhóm đỡ mất thời gian chờ.','Buổi họp tuần 46','Cao','2026-11-10');

INSERT IGNORE INTO `recognition` (`recognition_id`,`sender_id`,`receiver_id`,`week_id`,`reason`,`evidence`,`bonus_points`,`recognition_date`) VALUES
(1,2,3,46,'Hoàn thành sớm API đăng nhập và tự rà soát bảo mật mật khẩu.','Pull request #128',20,'2026-11-10'),
(2,5,6,46,'Vượt chỉ tiêu cuộc gọi tư vấn tuần 46 (24/20).','Báo cáo cuộc gọi',25,'2026-11-10');

INSERT IGNORE INTO `store` (`store_id`,`gift_name`,`gift_points`,`gift_description`) VALUES
(1,'Voucher cà phê 100.000đ',30,'Dùng tại chuỗi cà phê đối tác của công ty.'),
(2,'Bình giữ nhiệt VHV',60,'Bình inox 500 ml, khắc logo công ty.'),
(3,'Nửa ngày nghỉ có lương',120,'Đăng ký trước 2 ngày với trưởng phòng.'),
(4,'Sách OKR – Measure What Matters',80,'Bản tiếng Việt, nhà xuất bản Tổng hợp TP.HCM.'),
(5,'Tai nghe không dây',200,'Hết hàng. Dự kiến nhập thêm cuối tháng.'),
(6,'Bữa trưa cùng giám đốc',150,'Bữa trưa nhóm tối đa 4 người.');

INSERT IGNORE INTO `redeem` (`redeem_id`,`user_id`,`store_id`,`quantity`,`points_used`,`redeem_date`) VALUES
(1,3,1,1,30,'2026-11-03 00:00:00'),
(2,6,4,1,80,'2026-11-05 00:00:00');

INSERT IGNORE INTO `week` (`week_id`,`week_number`,`year`) VALUES
(40,40,2026),
(41,41,2026),
(42,42,2026),
(43,43,2026),
(44,44,2026),
(45,45,2026),
(46,46,2026),
(47,47,2026),
(48,48,2026),
(49,49,2026),
(50,50,2026),
(51,51,2026);

SET FOREIGN_KEY_CHECKS = 1;
