CREATE DATABASE  IF NOT EXISTS `news_platform` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `news_platform`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: news_platform
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `body` text,
  `category_id` int NOT NULL,
  `submitter_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitter_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`submitter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'New Solar Park Opens','A new solar park is providing clean energy to thousands.',1,1,'2026-01-20 09:44:04'),(2,'Cities Go Green','More cities are investing in green public transport.',1,2,'2026-01-20 09:44:04'),(3,'Ocean Cleanup Success','Volunteers removed tons of plastic from coastal waters.',1,3,'2026-01-20 09:44:04'),(4,'Peace Talks Progress','Countries report positive outcomes from peace talks.',2,4,'2026-01-20 09:44:04'),(5,'Voter Turnout Rises','Recent elections saw record-high voter participation.',2,5,'2026-01-20 09:44:04'),(6,'Anti-Corruption Reform','New transparency laws were passed successfully.',2,6,'2026-01-20 09:44:04'),(7,'Aid Reaches Flood Victims','Emergency aid has reached affected communities.',3,1,'2026-01-20 09:44:04'),(8,'Global Food Program Expanded','More families now receive food assistance.',3,2,'2026-01-20 09:44:04'),(9,'Medical Teams Deployed','Doctors arrived quickly to help remote regions.',3,3,'2026-01-20 09:44:04');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Climate','Positive developments and solutions for the climate','2026-01-20 09:42:59'),(2,'Politics','Constructive political progress around the world','2026-01-20 09:42:59'),(3,'Aid','Humanitarian aid and global cooperation stories','2026-01-20 09:42:59');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'This is really encouraging news!',1,2,'2026-01-20 09:44:47'),(2,'Great to see progress like this.',1,3,'2026-01-20 09:44:47'),(3,'Green transport makes a big difference.',2,4,'2026-01-20 09:44:47'),(4,'Hope more cities follow this example.',2,5,'2026-01-20 09:44:47'),(5,'Amazing work by the volunteers!',3,6,'2026-01-20 09:44:47'),(6,'The oceans really need this.',3,1,'2026-01-20 09:44:47'),(7,'Peace is always worth working for.',4,2,'2026-01-20 09:44:47'),(8,'This gives me hope.',4,3,'2026-01-20 09:44:47'),(9,'High turnout shows strong democracy.',5,4,'2026-01-20 09:44:47'),(10,'People clearly care about change.',5,6,'2026-01-20 09:44:47'),(11,'Transparency is so important.',6,1,'2026-01-20 09:44:47'),(12,'Glad to see reforms happening.',6,2,'2026-01-20 09:44:47'),(13,'Happy help is reaching people quickly.',7,3,'2026-01-20 09:44:47'),(14,'Aid coordination really matters.',7,4,'2026-01-20 09:44:47'),(15,'Food security is essential.',8,5,'2026-01-20 09:44:47'),(16,'This program saves lives.',8,6,'2026-01-20 09:44:47'),(17,'Medical support is always needed.',9,1,'2026-01-20 09:44:47'),(18,'Big respect for the medical teams.',9,2,'2026-01-20 09:44:47');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'alice','alice@example.com','password','2026-01-20 09:42:38'),(2,'ben','ben@example.com','password','2026-01-20 09:42:38'),(3,'carla','carla@example.com','password','2026-01-20 09:42:38'),(4,'daniel','daniel@example.com','password','2026-01-20 09:42:38'),(5,'emma','emma@example.com','password','2026-01-20 09:42:38'),(6,'felix','felix@example.com','password','2026-01-20 09:42:38'),(7,'carina_test','carina-test@example.com','$2b$10$IPzy54AB9BsDTTMY2q4QseHet1sFsy17Kw9e./W2vL2Krr5/sve2O','2026-01-20 10:07:32');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-21 13:29:04
