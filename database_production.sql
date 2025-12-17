-- Database clean script for E-Izin Magang
-- Use this for importing to CleverCloud / Aiven / Live Database

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `wp_eizin_users`
--

DROP TABLE IF EXISTS `wp_eizin_users`;
CREATE TABLE `wp_eizin_users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT '',
  `phone` varchar(50) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wp_eizin_users`
-- (Only 1 Admin User as requested)
--

LOCK TABLES `wp_eizin_users` WRITE;
INSERT INTO `wp_eizin_users` VALUES (1,'Administrator','admin','admin','admin','ADM001','admin@example.com','081234567890');
UNLOCK TABLES;

--
-- Table structure for table `wp_eizin_requests`
--

DROP TABLE IF EXISTS `wp_eizin_requests`;
CREATE TABLE `wp_eizin_requests` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `lecturer_status` varchar(50) DEFAULT 'Pending',
  `mentor_status` varchar(50) DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `lecturer_comment` text DEFAULT NULL,
  `mentor_comment` text DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `wp_eizin_mappings`
--

DROP TABLE IF EXISTS `wp_eizin_mappings`;
CREATE TABLE `wp_eizin_mappings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) NOT NULL,
  `lecturer_id` bigint(20) DEFAULT NULL,
  `mentor_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
