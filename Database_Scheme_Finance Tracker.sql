-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mydotnetapp
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Food','https://cdn-icons-png.flaticon.com/128/737/737967.png'),(2,'Travel','https://cdn-icons-png.flaticon.com/128/826/826070.png'),(3,'Shopping','https://cdn-icons-png.flaticon.com/128/102/102665.png'),(4,'Groceries','https://cdn-icons-png.flaticon.com/128/2203/2203206.png'),(5,'Entertainment','https://cdn-icons-png.flaticon.com/128/1655/1655698.png'),(6,'Bills','https://cdn-icons-png.flaticon.com/128/1052/1052815.png'),(7,'Health','https://cdn-icons-png.flaticon.com/128/2382/2382461.png'),(8,'Education','https://cdn-icons-png.flaticon.com/128/3976/3976625.png');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `user_id` int NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,1,50.00,'2025-03-14',1,NULL),(2,1,50.00,'2025-03-14',2,NULL),(3,1,50.00,'2025-03-14',2,NULL),(4,1,50.00,'2025-03-14',2,NULL),(5,1,50.00,'2025-03-14',2,NULL),(6,1,50.00,'2025-03-14',2,NULL),(7,2,4.00,'2025-03-15',1,NULL),(8,1,434.00,'2025-03-15',1,NULL),(9,1,50.00,'2025-03-14',1,NULL),(10,1,50.00,'2025-03-14',1,'Lunch with friends'),(11,1,56565656.00,'2025-03-15',1,'hello'),(12,3,43.00,'2025-03-15',1,'w'),(13,1,7887.00,'2025-03-11',1,'sadsa'),(14,1,4545.00,'2025-03-15',1,'sadasd'),(15,5,43534.00,'2025-03-15',1,'dsffs'),(16,6,45.00,'2025-03-15',1,'fgssd'),(17,8,89.00,'2025-03-21',1,'heloo'),(18,1,78.00,'2025-03-15',3,'heelo'),(19,6,154.00,'2025-03-12',4,'hello i am tesadt '),(24,5,45.00,'2025-03-16',6,'movie'),(25,1,748.00,'2025-03-16',6,'v'),(26,1,84.00,'2025-03-15',8,'4');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Doe','john.doe@example.com','password123'),(2,'Johny Doe','john.doe@examplee.com','$2a$11$MrgCJZC/NfemM7NuAGPXWuuj6cBI.jTpDXgPjy1TGmMn97P6suP7u'),(3,'ak','ankitsingh44844844@gmail.com','$2a$11$Eq8Aat6yTNG8llUsJJIQPeEVqmOwp7UYX7km2DbbCw.Ug5pRB9iEi'),(4,'harshit','spankule@gmail.com','$2a$11$CCfxrNKSCxV06kRDc9xfD.9X5Q988lUcNKOM7be5n0WA1GDkJJ9e.'),(5,'harshit ','HARSHIT@GMAIL.COM','$2a$11$Sz7p6QvRMKyM9IOhsMR0aeXTJ1KqFP3/PRcqeln8rRCi778HjmHkS'),(6,'harshit','HARSHIT1@GMAIL.COM','$2a$11$0RU/RwAJDe6szaSnoXJLPuMV1/UA/He4pPKNXtLGY.bv.Vg8b9iM.'),(7,'harshit','HARasdSHIT@GMAIL.COM','$2a$11$vPnWEqjeSxiKkztLg.EnyOsAQ2Z0WBzGdXccBWAe38ZKtLxxqSMwO'),(8,'harshit','ankitsingh44844@gmail.com','$2a$11$PnrWISdLLuDbYRhYc0q5T.qW26FrO5ggBx9RRGjT77gCfiyXf4LcK');
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

-- Dump completed on 2025-03-20  8:48:43
