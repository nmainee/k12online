-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 17, 2026 lúc 06:02 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `okr`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `checkinform`
--

CREATE TABLE `checkinform` (
  `checkin_id` int(11) NOT NULL,
  `okr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `checkin_date` date NOT NULL,
  `progress_value` int(11) NOT NULL,
  `progress_percent` int(11) NOT NULL,
  `confidence_level` tinyint(4) NOT NULL,
  `status` varchar(50) NOT NULL,
  `work_summary` text NOT NULL,
  `slow_tasks` text NOT NULL,
  `obstacles` text NOT NULL,
  `solutions` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `checkinreview`
--

CREATE TABLE `checkinreview` (
  `review_id` int(11) NOT NULL,
  `checkin_id` int(11) NOT NULL,
  `okr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `checkin_status` varchar(50) NOT NULL DEFAULT 'not_checked',
  `team_comment` text DEFAULT NULL,
  `personal_comment` text DEFAULT NULL,
  `summary_comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `conversation`
--

CREATE TABLE `conversation` (
  `conversation_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL,
  `week_id` int(11) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `action` text DEFAULT NULL,
  `trust_score` tinyint(4) DEFAULT NULL,
  `conversation_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `week_id` int(11) NOT NULL,
  `type` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `level_impact` text DEFAULT NULL,
  `feedback_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `okrs`
--

CREATE TABLE `okrs` (
  `okr_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `cycle` varchar(50) NOT NULL,
  `o_relevant` varchar(50) NOT NULL,
  `objective` text NOT NULL,
  `key_results` text NOT NULL,
  `target` int(11) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `link_plans` text NOT NULL,
  `link_results` text NOT NULL,
  `kr_relevant` text NOT NULL,
  `o_cross` text NOT NULL,
  `display` tinyint(1) NOT NULL,
  `status` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recognition`
--

CREATE TABLE `recognition` (
  `recognition_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `week_id` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `evidence` text DEFAULT NULL,
  `bonus_points` int(11) DEFAULT 0,
  `recognition_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `redeem`
--

CREATE TABLE `redeem` (
  `redeem_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `points_used` int(11) NOT NULL,
  `redeem_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `store`
--

CREATE TABLE `store` (
  `store_id` int(11) NOT NULL,
  `gift_name` varchar(255) NOT NULL,
  `gift_points` int(11) NOT NULL,
  `gift_description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `todaylist`
--

CREATE TABLE `todaylist` (
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `okr_id` int(11) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) NOT NULL,
  `priority` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `deadline` datetime NOT NULL,
  `estimate_time` float NOT NULL,
  `attachments` text NOT NULL,
  `comments` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `date_birth` date NOT NULL,
  `month_birth` date NOT NULL,
  `year_birth` year(4) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `department_id` int(11) NOT NULL,
  `superior` int(11) NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `week`
--

CREATE TABLE `week` (
  `week_id` int(11) NOT NULL,
  `week_number` int(11) NOT NULL,
  `year` year(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `weeklymeeting`
--

CREATE TABLE `weeklymeeting` (
  `meeting_id` int(11) NOT NULL,
  `week_id` int(11) NOT NULL,
  `checkin_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `checkinform`
--
ALTER TABLE `checkinform`
  ADD PRIMARY KEY (`checkin_id`);

--
-- Chỉ mục cho bảng `checkinreview`
--
ALTER TABLE `checkinreview`
  ADD PRIMARY KEY (`review_id`);

--
-- Chỉ mục cho bảng `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`conversation_id`);

--
-- Chỉ mục cho bảng `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Chỉ mục cho bảng `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`);

--
-- Chỉ mục cho bảng `okrs`
--
ALTER TABLE `okrs`
  ADD PRIMARY KEY (`okr_id`),
  ADD KEY `fk_okrs_user` (`user_id`),
  ADD KEY `fk_okrs_department` (`department_id`);

--
-- Chỉ mục cho bảng `recognition`
--
ALTER TABLE `recognition`
  ADD PRIMARY KEY (`recognition_id`);

--
-- Chỉ mục cho bảng `redeem`
--
ALTER TABLE `redeem`
  ADD PRIMARY KEY (`redeem_id`);

--
-- Chỉ mục cho bảng `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`store_id`);

--
-- Chỉ mục cho bảng `todaylist`
--
ALTER TABLE `todaylist`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `fk_todaylist_user` (`user_id`),
  ADD KEY `fk_todaylist_department` (`department_id`),
  ADD KEY `fk_todaylist_okr` (`okr_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_users_department` (`department_id`),
  ADD KEY `fk_users_superior` (`superior`);

--
-- Chỉ mục cho bảng `week`
--
ALTER TABLE `week`
  ADD PRIMARY KEY (`week_id`);

--
-- Chỉ mục cho bảng `weeklymeeting`
--
ALTER TABLE `weeklymeeting`
  ADD PRIMARY KEY (`meeting_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `checkinform`
--
ALTER TABLE `checkinform`
  MODIFY `checkin_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `checkinreview`
--
ALTER TABLE `checkinreview`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `conversation`
--
ALTER TABLE `conversation`
  MODIFY `conversation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `okrs`
--
ALTER TABLE `okrs`
  MODIFY `okr_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `recognition`
--
ALTER TABLE `recognition`
  MODIFY `recognition_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `redeem`
--
ALTER TABLE `redeem`
  MODIFY `redeem_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `store`
--
ALTER TABLE `store`
  MODIFY `store_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `todaylist`
--
ALTER TABLE `todaylist`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `week`
--
ALTER TABLE `week`
  MODIFY `week_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `weeklymeeting`
--
ALTER TABLE `weeklymeeting`
  MODIFY `meeting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `okrs`
--
ALTER TABLE `okrs`
  ADD CONSTRAINT `fk_okrs_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_okrs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `todaylist`
--
ALTER TABLE `todaylist`
  ADD CONSTRAINT `fk_todaylist_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_todaylist_okr` FOREIGN KEY (`okr_id`) REFERENCES `okrs` (`okr_id`),
  ADD CONSTRAINT `fk_todaylist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `fk_users_superior` FOREIGN KEY (`superior`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
