-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: e_izin_magang
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `e_izin_magang`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `e_izin_magang` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `e_izin_magang`;

--
-- Table structure for table `wp_eizin_mappings`
--

DROP TABLE IF EXISTS `wp_eizin_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wp_eizin_mappings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) NOT NULL,
  `lecturer_id` bigint(20) DEFAULT NULL,
  `mentor_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wp_eizin_mappings`
--

LOCK TABLES `wp_eizin_mappings` WRITE;
/*!40000 ALTER TABLE `wp_eizin_mappings` DISABLE KEYS */;
INSERT INTO `wp_eizin_mappings` VALUES (1,2,3,6),(2,5,3,6),(3,7,8,9),(4,10,11,12),(5,13,14,15);
/*!40000 ALTER TABLE `wp_eizin_mappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wp_eizin_requests`
--

DROP TABLE IF EXISTS `wp_eizin_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wp_eizin_requests`
--

LOCK TABLES `wp_eizin_requests` WRITE;
/*!40000 ALTER TABLE `wp_eizin_requests` DISABLE KEYS */;
INSERT INTO `wp_eizin_requests` VALUES (103,7,'Izin','2025-12-17','2025-12-17','sakit beneran','blob:http://localhost:5173/a5c8435f-f226-4790-bca0-ff4b207a9b3a','Approved','Approved','2025-12-16 09:37:05',NULL,NULL,NULL),(104,10,'Izin','2025-12-18','2025-12-18','Acara keluarga','blob:http://localhost:5173/19b6dcf2-0575-4d7f-bfd6-0b9345c3cdd6','Approved','Approved','2025-12-16 10:21:05',NULL,NULL,NULL),(105,10,'Izin','2025-12-31','2025-12-31','mudik tahun baru','','Approved','Approved','2025-12-16 10:33:45',NULL,NULL,NULL),(106,10,'Izin','2025-12-19','2025-12-19','sakit','','Approved','Approved','2025-12-16 10:53:29',NULL,NULL,NULL),(107,10,'Sakit','2025-12-29','2025-12-29','sakit','','Approved','Approved','2025-12-16 10:54:52',NULL,NULL,NULL),(108,10,'Sakit','2026-01-07','2026-01-07','sakit','','Approved','Approved','2025-12-16 11:01:06',NULL,NULL,NULL),(109,10,'Sakit','2026-01-22','2026-01-22','izin','','Rejected','Pending','2025-12-16 11:09:22',NULL,NULL,NULL),(110,10,'Dispensasi','2026-01-28','2026-01-28','lomba menyanyi','','Approved','Approved','2025-12-16 11:14:18',NULL,NULL,NULL),(111,10,'Sakit','2026-01-22','2026-01-22','sakit','','Approved','Approved','2025-12-16 11:19:35',NULL,NULL,NULL),(112,10,'Izin','2026-01-30','2026-01-30','akit\n','','Approved','Approved','2025-12-16 11:27:13',NULL,NULL,NULL),(113,13,'Sakit','2026-01-01','2026-01-01','sakit','','Approved','Approved','2025-12-16 11:37:15',NULL,'sakit yaa',NULL),(114,13,'Izin','2026-02-12','2026-02-18','acara keluarga','','Approved','Approved','2025-12-16 11:40:43','oke gppa','gpa juga\n',NULL),(115,13,'Izin','2025-12-26','2025-12-26','sakit','','Approved','Approved','2025-12-16 11:48:14','okay','gppa\n',NULL),(116,13,'Izin','2025-12-18','2025-12-18','izin','','Rejected','Pending','2025-12-16 11:52:09','kemarin sudah izin\n',NULL,NULL),(117,13,'Sakit','2025-12-19','2025-12-12','tes','','Approved','Approved','2025-12-16 12:04:19','ya','ya',NULL),(118,13,'Dispensasi','2025-12-31','2025-12-31','tes','','Approved','Approved','2025-12-16 12:04:41','ya','ya',NULL);
/*!40000 ALTER TABLE `wp_eizin_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wp_eizin_users`
--

DROP TABLE IF EXISTS `wp_eizin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wp_eizin_users`
--

LOCK TABLES `wp_eizin_users` WRITE;
/*!40000 ALTER TABLE `wp_eizin_users` DISABLE KEYS */;
INSERT INTO `wp_eizin_users` VALUES (1,'Administrator','admin','admin','admin','ADM001','admin@example.com','081234567890'),(2,'Budi Mahasiswa','student','student','student','2023001','budi@student.com','081298765432'),(3,'Dr. Dosen','lecturer','lecturer','lecturer','NIP001','dosen@univ.ac.id','081345678901'),(5,'agil','agil','agil','student','123','',''),(6,'yanto','yanto','yano','mentor','yanto','',''),(7,'santi','santi','santi3','student','123','santi@unisayogya.ac.id','santi@unisayogya.ac.i4'),(8,'apro','apro','APRO1','lecturer','123','',''),(9,'adit','adit','adit','mentor','123','',''),(10,'Nisa Kamila','nisakamila','nisakamila','student','258','','08990855006'),(11,'Tika Ainunnisa Fitria','tika','tika','lecturer','256','','08990855006'),(12,'Budi Putra','budiputra','budiputra','mentor','PT Sun Indo','','08990855006'),(13,'arga','arga','arga','student','125','',''),(14,'Hendratmo','hendratmo','hendratmo','lecturer','123','',''),(15,'sakti','sakti','sakti','mentor','PT Lima Sisi','','');
/*!40000 ALTER TABLE `wp_eizin_users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 12:23:09
