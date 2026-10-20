-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 05 Jul 2024 pada 10.02
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eyespy`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `jenis_kejahatan`
--

CREATE TABLE `jenis_kejahatan` (
  `id_jenis` int(11) NOT NULL,
  `nama_jenis` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jenis_kejahatan`
--

INSERT INTO `jenis_kejahatan` (`id_jenis`, `nama_jenis`) VALUES
(1, 'Pencurian'),
(2, 'Perampokan'),
(3, 'Kekerasan'),
(4, 'Penjambretan'),
(5, 'Penganiayaan'),
(6, 'Vandalisme'),
(7, 'Pemalakan'),
(8, 'Perkelahian Jalanan'),
(9, 'Penipuan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `laporan_kejahatan`
--

CREATE TABLE `laporan_kejahatan` (
  `id` int(11) NOT NULL,
  `jenis_kejahatan` int(255) NOT NULL,
  `tempat_kejadian` int(11) NOT NULL,
  `waktu` datetime NOT NULL,
  `keterangan` text DEFAULT NULL,
  `pelapor` enum('pengguna','sistem') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `laporan_kejahatan`
--

INSERT INTO `laporan_kejahatan` (`id`, `jenis_kejahatan`, `tempat_kejadian`, `waktu`, `keterangan`, `pelapor`) VALUES
(1, 7, 6, '2023-10-13 06:34:16', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 30.', 'pengguna'),
(2, 2, 6, '2023-03-22 12:08:25', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 5.', 'sistem'),
(3, 8, 6, '2023-12-26 18:28:26', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 39.', 'pengguna'),
(4, 9, 6, '2023-12-13 01:19:21', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 35.', 'pengguna'),
(5, 3, 6, '2023-12-26 07:08:35', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 36.', 'pengguna'),
(6, 1, 12, '2023-09-25 04:19:33', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 11.', 'sistem'),
(8, 1, 12, '2023-03-19 04:24:43', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 3.', 'sistem'),
(11, 4, 12, '2023-12-13 08:36:01', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 12.', 'pengguna'),
(12, 2, 6, '2023-09-06 05:59:12', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 6.', 'sistem'),
(13, 5, 12, '2023-01-31 14:11:39', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 34.', 'sistem'),
(15, 7, 32, '2023-06-13 10:11:01', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 50.', 'pengguna'),
(16, 2, 6, '2023-08-29 22:51:16', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 6.', 'sistem'),
(17, 6, 32, '2023-03-26 04:44:33', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 17.', 'sistem'),
(18, 7, 32, '2023-01-12 14:23:44', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 42.', 'pengguna'),
(19, 3, 6, '2023-09-18 15:52:22', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 6.', 'pengguna'),
(23, 4, 6, '2023-05-01 23:07:37', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 6.', 'pengguna'),
(24, 9, 50, '2023-01-21 15:52:40', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 50.', 'pengguna'),
(25, 6, 8, '2023-05-20 17:07:24', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 8.', 'pengguna'),
(26, 7, 48, '2023-05-27 10:45:53', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 48.', 'pengguna'),
(27, 5, 19, '2023-12-11 15:55:54', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 19.', 'sistem'),
(28, 9, 32, '2023-08-24 20:41:56', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 32.', 'sistem'),
(29, 9, 26, '2023-12-21 06:16:28', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 26.', 'pengguna'),
(30, 1, 46, '2023-06-22 11:08:26', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 46.', 'sistem'),
(31, 9, 18, '2023-09-28 14:16:14', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 18.', 'pengguna'),
(32, 9, 11, '2023-10-31 06:50:24', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 11.', 'sistem'),
(33, 9, 2, '2023-10-17 23:12:46', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 2.', 'pengguna'),
(34, 7, 18, '2023-01-18 21:06:12', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 18.', 'sistem'),
(35, 2, 37, '2023-02-12 16:03:21', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 37.', 'pengguna'),
(36, 3, 9, '2023-06-08 17:09:35', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 9.', 'pengguna'),
(37, 7, 2, '2023-08-07 02:43:22', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 2.', 'pengguna'),
(39, 2, 48, '2023-10-05 04:22:29', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 48.', 'sistem'),
(40, 1, 37, '2023-01-08 03:32:58', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 37.', 'sistem'),
(41, 2, 10, '2023-03-18 12:30:33', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 10.', 'pengguna'),
(42, 8, 13, '2023-12-19 10:10:09', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 13.', 'pengguna'),
(43, 3, 9, '2023-12-02 02:57:23', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 9.', 'sistem'),
(45, 1, 8, '2023-10-02 22:10:30', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 8.', 'sistem'),
(46, 3, 16, '2023-03-02 03:49:29', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 16.', 'sistem'),
(48, 2, 38, '2023-11-25 06:56:03', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 38.', 'sistem'),
(49, 7, 32, '2023-02-12 07:09:44', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 32.', 'pengguna'),
(50, 6, 18, '2023-02-22 15:29:41', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 18.', 'pengguna'),
(51, 4, 27, '2023-01-05 01:18:25', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 27.', 'sistem'),
(54, 5, 14, '2023-10-10 04:27:30', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 14.', 'pengguna'),
(55, 1, 49, '2023-07-20 01:19:21', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 49.', 'pengguna'),
(56, 4, 38, '2023-06-23 21:31:43', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 38.', 'pengguna'),
(58, 4, 34, '2023-03-29 10:46:46', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 34.', 'sistem'),
(59, 1, 6, '2023-06-12 19:05:08', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 6.', 'pengguna'),
(60, 2, 6, '2023-10-16 09:44:23', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 28.', 'pengguna'),
(62, 8, 6, '2023-02-15 01:25:04', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 16.', 'sistem'),
(63, 2, 6, '2023-01-20 23:25:18', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 20.', 'pengguna'),
(64, 8, 6, '2023-02-25 06:13:32', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 39.', 'sistem'),
(65, 9, 12, '2023-04-15 23:11:36', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 30.', 'pengguna'),
(66, 7, 12, '2023-04-24 04:27:12', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 44.', 'sistem'),
(68, 6, 12, '2023-03-29 04:31:18', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 19.', 'sistem'),
(69, 6, 6, '2023-02-09 22:05:27', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 6.', 'pengguna'),
(70, 7, 12, '2023-07-14 23:52:39', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 13.', 'sistem'),
(73, 8, 32, '2023-11-05 03:57:08', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 3.', 'pengguna'),
(74, 7, 32, '2023-03-03 04:44:29', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 49.', 'pengguna'),
(75, 6, 32, '2023-07-22 05:28:02', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 43.', 'sistem'),
(77, 3, 12, '2023-01-04 15:08:08', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 23.', 'sistem'),
(78, 4, 6, '2023-06-26 01:44:40', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 3.', 'pengguna'),
(79, 8, 6, '2023-05-06 00:41:11', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 26.', 'sistem'),
(80, 1, 12, '2023-09-04 13:07:11', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 16.', 'sistem'),
(81, 8, 12, '2023-07-15 11:39:34', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 2.', 'pengguna'),
(82, 4, 12, '2023-07-13 23:37:21', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 38.', 'sistem'),
(83, 6, 6, '2023-11-10 18:46:20', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 24.', 'sistem'),
(84, 2, 6, '2023-10-04 07:53:12', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 31.', 'pengguna'),
(85, 6, 32, '2023-03-30 02:18:06', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 37.', 'pengguna'),
(86, 8, 32, '2023-10-17 17:20:58', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 45.', 'sistem'),
(87, 6, 32, '2023-08-26 09:53:24', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 32.', 'pengguna'),
(88, 5, 7, '2023-01-01 07:13:54', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 22.', 'sistem'),
(89, 9, 7, '2023-09-17 14:58:25', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 19.', 'pengguna'),
(90, 5, 7, '2023-09-24 21:33:16', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 8.', 'sistem'),
(91, 7, 7, '2023-12-09 16:31:41', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 45.', 'sistem'),
(92, 5, 40, '2023-08-24 11:26:59', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 40.', 'sistem'),
(93, 1, 12, '2023-02-14 06:56:31', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 12.', 'pengguna'),
(94, 5, 46, '2023-01-01 07:48:18', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 46.', 'pengguna'),
(95, 9, 30, '2023-05-14 18:01:06', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 30.', 'pengguna'),
(96, 1, 20, '2023-11-30 03:55:39', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 20.', 'sistem'),
(97, 3, 24, '2023-02-10 10:46:19', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 24.', 'pengguna'),
(98, 6, 3, '2023-06-02 05:57:26', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 3.', 'pengguna'),
(102, 5, 7, '2023-02-09 23:35:57', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 7.', 'pengguna'),
(103, 9, 47, '2023-01-09 04:45:53', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 47.', 'pengguna'),
(104, 3, 19, '2023-07-05 10:26:46', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 19.', 'pengguna'),
(105, 4, 39, '2023-10-31 05:36:39', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 39.', 'pengguna'),
(107, 3, 33, '2023-07-06 11:37:45', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 33.', 'pengguna'),
(108, 4, 6, '2023-03-24 15:17:19', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 6.', 'sistem'),
(109, 3, 24, '2023-09-15 11:43:54', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 24.', 'pengguna'),
(110, 2, 21, '2023-12-27 08:20:56', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 21.', 'sistem'),
(111, 1, 26, '2023-11-25 20:11:20', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 26.', 'sistem'),
(112, 4, 13, '2023-12-15 00:34:17', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 13.', 'pengguna'),
(113, 9, 5, '2023-05-22 11:43:03', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 5.', 'sistem'),
(114, 7, 25, '2023-03-31 10:07:31', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 25.', 'pengguna'),
(115, 9, 20, '2023-02-27 22:32:56', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 20.', 'pengguna'),
(116, 3, 13, '2023-04-16 01:56:49', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 13.', 'sistem'),
(117, 8, 21, '2023-07-16 13:58:50', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 21.', 'sistem'),
(119, 1, 30, '2023-08-16 15:28:14', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 30.', 'sistem'),
(120, 3, 31, '2023-12-14 08:25:33', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 31.', 'pengguna'),
(121, 8, 18, '2023-01-05 08:40:25', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 18.', 'pengguna'),
(122, 5, 16, '2023-09-25 18:05:26', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 16.', 'sistem'),
(123, 5, 2, '2023-10-15 02:06:30', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 2.', 'sistem'),
(124, 9, 6, '2023-08-13 03:17:31', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 6.', 'pengguna'),
(125, 3, 34, '2023-09-29 12:07:25', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 34.', 'pengguna'),
(127, 1, 33, '2023-03-29 00:46:27', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 33.', 'pengguna'),
(128, 1, 33, '2023-01-22 09:15:01', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 33.', 'sistem'),
(129, 9, 7, '2023-12-07 12:27:12', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 7.', 'pengguna'),
(130, 8, 33, '2023-01-11 14:34:04', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 33.', 'pengguna'),
(131, 2, 33, '2023-03-18 05:00:48', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 33.', 'sistem'),
(132, 8, 9, '2023-12-07 01:01:20', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 9.', 'sistem'),
(134, 7, 4, '2023-04-14 03:31:10', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 4.', 'sistem'),
(135, 5, 9, '2023-12-22 17:12:54', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 9.', 'pengguna'),
(136, 5, 45, '2023-09-07 08:33:10', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 45.', 'pengguna'),
(138, 7, 39, '2023-01-03 03:22:10', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 39.', 'sistem'),
(140, 7, 20, '2023-08-27 22:48:56', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 20.', 'sistem'),
(141, 8, 13, '2023-07-24 08:30:10', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 13.', 'sistem'),
(142, 1, 24, '2023-07-05 06:06:27', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 24.', 'pengguna'),
(143, 4, 23, '2023-07-26 16:57:00', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 23.', 'sistem'),
(144, 6, 35, '2023-02-25 22:02:26', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 35.', 'pengguna'),
(145, 8, 13, '2023-02-12 14:17:31', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 13.', 'sistem'),
(146, 3, 43, '2023-09-13 12:47:56', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 43.', 'pengguna'),
(147, 2, 12, '2023-10-30 04:50:58', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 12.', 'pengguna'),
(148, 7, 12, '2023-02-09 14:46:58', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 12.', 'sistem'),
(149, 5, 9, '2023-12-23 14:48:10', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 9.', 'pengguna'),
(150, 8, 11, '2023-01-25 07:51:14', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 11.', 'pengguna'),
(151, 1, 29, '2023-01-19 23:20:40', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 29.', 'sistem'),
(152, 4, 20, '2023-11-11 09:17:43', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 20.', 'sistem'),
(153, 9, 17, '2023-01-30 14:15:45', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 17.', 'pengguna'),
(155, 9, 44, '2023-04-28 18:13:09', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 44.', 'sistem'),
(157, 9, 24, '2023-05-05 15:19:55', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 24.', 'sistem'),
(158, 3, 34, '2023-07-03 03:39:08', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 34.', 'pengguna'),
(159, 9, 15, '2023-12-03 04:01:34', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 15.', 'sistem'),
(160, 5, 25, '2023-07-13 22:20:58', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 25.', 'sistem'),
(161, 7, 43, '2023-07-06 02:22:03', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 43.', 'pengguna'),
(162, 5, 43, '2023-04-29 21:38:53', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 43.', 'pengguna'),
(163, 4, 43, '2023-01-22 12:14:06', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 43.', 'pengguna'),
(164, 2, 46, '2023-10-27 01:27:48', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 46.', 'sistem'),
(165, 4, 6, '2023-06-10 18:07:34', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 6.', 'pengguna'),
(166, 1, 41, '2023-05-20 16:58:38', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 41.', 'pengguna'),
(167, 2, 47, '2023-09-04 20:52:30', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 47.', 'sistem'),
(168, 2, 3, '2023-11-20 08:46:14', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 3.', 'sistem'),
(170, 1, 19, '2023-08-15 00:45:51', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 19.', 'pengguna'),
(171, 7, 33, '2023-07-16 20:42:15', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 33.', 'sistem'),
(172, 9, 1, '2023-10-13 08:21:55', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 1.', 'pengguna'),
(173, 5, 41, '2023-02-03 13:30:00', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 41.', 'pengguna'),
(175, 9, 26, '2023-08-08 00:06:56', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 26.', 'pengguna'),
(176, 4, 46, '2023-02-18 21:43:52', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 46.', 'sistem'),
(177, 5, 3, '2023-11-17 09:42:26', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 3.', 'sistem'),
(178, 6, 32, '2023-08-24 14:15:50', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 32.', 'sistem'),
(179, 2, 46, '2023-12-04 12:30:22', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 46.', 'pengguna'),
(180, 2, 41, '2023-08-16 11:40:54', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 41.', 'pengguna'),
(181, 8, 43, '2023-04-22 02:04:02', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 43.', 'sistem'),
(182, 6, 21, '2023-02-15 04:32:02', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 21.', 'sistem'),
(183, 5, 45, '2023-12-08 01:52:04', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 45.', 'pengguna'),
(184, 4, 26, '2023-10-15 09:53:06', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 26.', 'sistem'),
(185, 5, 42, '2023-01-19 05:19:33', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 42.', 'sistem'),
(186, 3, 23, '2023-04-05 12:32:09', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 23.', 'pengguna'),
(187, 3, 21, '2023-12-05 06:26:17', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 21.', 'sistem'),
(188, 7, 50, '2023-05-25 01:26:29', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 50.', 'sistem'),
(189, 4, 32, '2023-07-09 12:33:21', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 32.', 'pengguna'),
(190, 8, 10, '2023-05-03 21:12:39', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 10.', 'pengguna'),
(191, 1, 17, '2023-02-09 15:53:28', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 17.', 'sistem'),
(192, 1, 39, '2023-10-18 04:31:58', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 39.', 'pengguna'),
(193, 5, 21, '2023-05-15 13:27:45', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 21.', 'sistem'),
(194, 3, 35, '2023-05-17 22:48:38', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 35.', 'sistem'),
(195, 3, 21, '2023-03-20 14:11:11', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 21.', 'sistem'),
(196, 8, 8, '2023-06-27 07:13:24', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 8.', 'pengguna'),
(197, 8, 21, '2023-01-20 07:38:29', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 21.', 'sistem'),
(198, 7, 38, '2023-05-29 01:24:57', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 38.', 'sistem'),
(200, 1, 11, '2023-04-10 21:55:15', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 11.', 'pengguna'),
(202, 9, 32, '2023-10-31 21:49:50', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 32.', 'sistem'),
(203, 5, 6, '2023-07-09 01:24:08', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 6.', 'sistem'),
(205, 5, 40, '2023-02-23 12:32:37', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 40.', 'sistem'),
(207, 3, 35, '2023-06-19 20:24:16', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 35.', 'sistem'),
(208, 6, 2, '2023-05-26 22:58:01', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 2.', 'sistem'),
(209, 7, 48, '2023-05-27 21:55:41', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 48.', 'pengguna'),
(210, 6, 21, '2023-09-22 04:53:33', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 21.', 'sistem'),
(211, 8, 40, '2023-08-28 05:26:09', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 40.', 'sistem'),
(212, 7, 2, '2023-03-23 01:26:21', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 2.', 'pengguna'),
(213, 6, 28, '2023-06-12 22:46:21', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 28.', 'pengguna'),
(214, 3, 50, '2023-03-29 11:43:44', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 50.', 'pengguna'),
(215, 2, 18, '2023-02-01 11:28:13', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 18.', 'sistem'),
(216, 5, 16, '2023-08-03 03:02:44', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 16.', 'sistem'),
(217, 2, 11, '2023-03-17 11:31:08', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 11.', 'pengguna'),
(219, 8, 2, '2023-09-07 21:38:49', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 2.', 'pengguna'),
(221, 5, 40, '2023-12-11 07:50:36', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 40.', 'sistem'),
(222, 9, 14, '2023-07-18 11:16:56', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 14.', 'sistem'),
(223, 4, 15, '2023-07-24 05:02:54', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 15.', 'pengguna'),
(224, 9, 33, '2023-07-10 01:30:40', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 33.', 'pengguna'),
(225, 8, 23, '2023-05-04 18:10:19', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 23.', 'sistem'),
(226, 8, 21, '2023-03-20 19:26:52', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 21.', 'pengguna'),
(227, 1, 31, '2023-09-12 12:00:48', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 31.', 'sistem'),
(228, 7, 24, '2023-03-08 04:04:15', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 24.', 'sistem'),
(229, 1, 49, '2023-05-05 20:19:30', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 49.', 'pengguna'),
(230, 8, 27, '2023-09-18 16:59:04', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 27.', 'pengguna'),
(232, 1, 38, '2023-10-10 19:42:57', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 38.', 'sistem'),
(236, 2, 44, '2023-09-02 06:14:09', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 44.', 'pengguna'),
(237, 2, 25, '2023-09-08 02:08:46', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 25.', 'sistem'),
(238, 5, 46, '2023-09-19 00:01:33', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 46.', 'sistem'),
(239, 9, 34, '2023-08-04 06:20:48', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 34.', 'pengguna'),
(241, 8, 31, '2023-04-25 18:17:41', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 31.', 'sistem'),
(242, 6, 39, '2023-05-07 19:44:04', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 39.', 'sistem'),
(245, 6, 12, '2023-10-30 22:23:53', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 12.', 'sistem'),
(246, 8, 45, '2023-10-23 04:39:34', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 45.', 'sistem'),
(247, 2, 38, '2023-05-20 23:28:40', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 38.', 'sistem'),
(248, 5, 42, '2023-04-02 13:46:53', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 42.', 'pengguna'),
(249, 9, 29, '2023-06-24 03:40:09', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 29.', 'pengguna'),
(250, 3, 30, '2023-08-15 03:48:10', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 30.', 'pengguna'),
(251, 1, 1, '2023-04-17 23:55:23', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 1.', 'pengguna'),
(254, 6, 50, '2023-08-25 05:17:20', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 50.', 'pengguna'),
(255, 6, 29, '2023-06-25 21:01:23', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 29.', 'sistem'),
(259, 9, 12, '2023-01-25 14:18:54', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 12.', 'pengguna'),
(260, 8, 14, '2023-12-31 06:05:31', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 14.', 'sistem'),
(261, 4, 39, '2023-03-30 04:13:52', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 39.', 'sistem'),
(264, 3, 22, '2023-11-13 10:53:53', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 22.', 'sistem'),
(265, 7, 26, '2023-10-25 08:15:48', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 26.', 'pengguna'),
(266, 9, 40, '2023-01-29 12:19:33', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 40.', 'pengguna'),
(267, 6, 26, '2023-02-25 18:19:56', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 26.', 'sistem'),
(268, 3, 15, '2023-05-21 10:26:46', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 15.', 'sistem'),
(269, 8, 31, '2023-02-22 22:57:30', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 31.', 'pengguna'),
(270, 7, 29, '2023-12-29 06:36:51', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 29.', 'pengguna'),
(271, 7, 7, '2023-12-18 19:09:36', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 7.', 'pengguna'),
(272, 4, 7, '2023-04-05 04:24:03', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 7.', 'sistem'),
(273, 1, 37, '2023-12-16 20:07:40', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 37.', 'pengguna'),
(274, 9, 32, '2023-06-25 16:14:37', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 32.', 'sistem'),
(277, 7, 42, '2023-04-26 09:07:07', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 42.', 'sistem'),
(278, 1, 48, '2023-08-15 08:01:49', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 48.', 'sistem'),
(279, 8, 44, '2023-04-17 03:38:15', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 44.', 'sistem'),
(280, 4, 42, '2023-08-12 17:46:34', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 42.', 'pengguna'),
(282, 9, 12, '2023-07-01 10:57:03', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 12.', 'pengguna'),
(283, 4, 21, '2023-10-15 14:35:11', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 21.', 'pengguna'),
(284, 4, 47, '2023-02-26 23:38:00', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 47.', 'pengguna'),
(285, 3, 31, '2023-10-17 03:05:58', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 31.', 'pengguna'),
(287, 6, 2, '2023-08-14 08:09:16', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 2.', 'sistem'),
(289, 7, 45, '2023-09-22 07:57:15', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 45.', 'pengguna'),
(291, 3, 9, '2023-03-14 08:46:16', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 9.', 'sistem'),
(294, 4, 10, '2023-12-31 05:36:46', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 10.', 'sistem'),
(296, 2, 16, '2023-09-06 13:03:36', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 16.', 'sistem'),
(297, 3, 24, '2023-12-14 09:10:10', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 24.', 'pengguna'),
(298, 7, 16, '2023-01-13 03:11:24', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 16.', 'pengguna'),
(299, 7, 9, '2023-10-01 19:37:10', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 9.', 'sistem'),
(301, 8, 20, '2023-08-19 18:19:25', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 20.', 'sistem'),
(302, 7, 44, '2023-09-15 20:26:27', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 44.', 'sistem'),
(303, 3, 2, '2023-09-03 19:35:03', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 2.', 'sistem'),
(304, 4, 8, '2023-08-14 09:34:16', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 8.', 'sistem'),
(305, 9, 12, '2023-05-27 16:50:48', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 12.', 'pengguna'),
(306, 2, 4, '2023-08-01 18:42:24', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 4.', 'sistem'),
(307, 7, 16, '2023-11-19 01:50:37', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 16.', 'pengguna'),
(308, 1, 47, '2023-07-21 18:00:38', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 47.', 'sistem'),
(309, 1, 12, '2023-01-03 11:32:52', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 12.', 'sistem'),
(311, 2, 25, '2023-04-23 14:40:33', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 25.', 'pengguna'),
(312, 6, 13, '2023-01-06 05:04:38', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 13.', 'sistem'),
(313, 1, 36, '2023-03-13 17:21:35', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 36.', 'sistem'),
(314, 9, 25, '2023-06-24 16:18:32', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 25.', 'pengguna'),
(315, 4, 1, '2023-11-17 03:18:31', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 1.', 'sistem'),
(317, 8, 14, '2023-09-18 15:18:28', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 14.', 'pengguna'),
(318, 8, 9, '2023-02-15 18:58:46', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 9.', 'pengguna'),
(319, 4, 11, '2023-04-22 07:15:22', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 11.', 'pengguna'),
(320, 2, 42, '2023-11-17 17:07:58', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 42.', 'sistem'),
(321, 1, 27, '2023-11-26 06:37:52', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 27.', 'pengguna'),
(322, 5, 1, '2023-08-03 08:00:18', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 1.', 'pengguna'),
(323, 4, 34, '2023-04-05 02:17:12', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 34.', 'sistem'),
(324, 1, 35, '2023-10-29 19:19:48', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 35.', 'pengguna'),
(325, 8, 38, '2023-01-19 07:16:24', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 38.', 'pengguna'),
(326, 6, 10, '2023-06-08 19:53:14', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 10.', 'sistem'),
(327, 4, 4, '2023-03-03 14:23:22', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 4.', 'sistem'),
(328, 1, 18, '2023-05-21 22:24:44', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 18.', 'sistem'),
(329, 8, 48, '2023-06-17 10:40:30', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 48.', 'pengguna'),
(330, 9, 15, '2023-03-04 19:38:56', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 15.', 'sistem'),
(331, 4, 27, '2023-01-15 14:21:49', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 27.', 'pengguna'),
(333, 1, 7, '2023-06-27 03:55:00', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 7.', 'sistem'),
(334, 3, 37, '2023-03-12 21:51:28', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 37.', 'sistem'),
(337, 1, 41, '2023-05-09 19:44:39', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 41.', 'sistem'),
(338, 5, 36, '2023-02-17 15:37:55', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 36.', 'sistem'),
(339, 9, 23, '2023-04-03 15:49:46', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 23.', 'sistem'),
(340, 9, 15, '2023-08-30 22:02:31', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 15.', 'pengguna'),
(341, 7, 14, '2023-02-09 00:33:09', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 14.', 'pengguna'),
(342, 3, 25, '2023-05-04 02:46:46', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 25.', 'sistem'),
(343, 3, 50, '2023-04-30 12:02:31', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 50.', 'pengguna'),
(344, 2, 38, '2023-08-03 02:07:18', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 38.', 'sistem'),
(345, 7, 38, '2023-01-06 17:13:59', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 38.', 'pengguna'),
(346, 2, 30, '2023-06-14 15:14:02', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 30.', 'sistem'),
(347, 9, 50, '2023-11-02 09:08:21', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 50.', 'sistem'),
(349, 6, 31, '2023-01-05 20:08:16', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 31.', 'pengguna'),
(350, 8, 43, '2023-07-07 15:17:06', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 43.', 'sistem'),
(351, 2, 22, '2023-05-26 07:58:19', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 22.', 'pengguna'),
(353, 1, 11, '2023-06-10 18:11:59', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 11.', 'sistem'),
(354, 7, 42, '2023-11-20 20:07:38', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 42.', 'sistem'),
(355, 6, 22, '2023-01-09 19:25:19', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 22.', 'pengguna'),
(356, 3, 48, '2023-12-22 19:35:38', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 48.', 'pengguna'),
(357, 4, 33, '2023-11-16 17:27:58', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 33.', 'pengguna'),
(358, 2, 32, '2023-07-18 15:35:35', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 32.', 'sistem'),
(359, 8, 29, '2023-11-14 13:30:52', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 29.', 'sistem'),
(360, 2, 48, '2023-06-20 07:22:58', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 48.', 'pengguna'),
(363, 2, 12, '2023-06-11 09:52:38', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 12.', 'pengguna'),
(364, 4, 3, '2023-06-28 16:24:27', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 3.', 'sistem'),
(366, 2, 6, '2023-06-17 09:17:02', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 6.', 'pengguna'),
(367, 6, 32, '2023-02-02 13:35:01', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 32.', 'sistem'),
(368, 7, 3, '2023-04-23 23:36:37', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 3.', 'sistem'),
(369, 9, 36, '2023-04-27 14:16:48', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 36.', 'pengguna'),
(370, 2, 47, '2023-01-07 23:45:16', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 47.', 'pengguna'),
(371, 4, 16, '2023-01-24 03:24:54', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 16.', 'pengguna'),
(372, 1, 44, '2023-05-16 22:11:58', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 44.', 'sistem'),
(374, 2, 47, '2023-07-23 01:48:42', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 47.', 'pengguna'),
(376, 2, 2, '2023-03-15 15:13:59', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 2.', 'pengguna'),
(379, 1, 29, '2023-07-08 03:46:51', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 29.', 'pengguna'),
(380, 3, 12, '2023-04-11 06:23:34', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 12.', 'sistem'),
(381, 3, 12, '2023-11-05 00:40:14', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 12.', 'pengguna'),
(382, 3, 29, '2023-11-05 15:34:18', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 29.', 'sistem'),
(383, 2, 40, '2023-04-08 09:42:17', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 40.', 'pengguna'),
(384, 8, 21, '2023-03-14 16:51:17', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 21.', 'sistem'),
(385, 8, 30, '2023-07-18 01:55:53', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 30.', 'pengguna'),
(386, 3, 32, '2023-02-05 09:36:17', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 32.', 'pengguna'),
(387, 4, 20, '2023-11-07 16:31:01', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 20.', 'pengguna'),
(389, 5, 31, '2023-10-30 16:14:59', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 31.', 'pengguna'),
(390, 5, 10, '2023-09-13 15:25:29', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 10.', 'pengguna'),
(391, 3, 3, '2023-01-26 18:00:05', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 3.', 'sistem'),
(392, 3, 48, '2023-07-04 18:39:14', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 48.', 'sistem'),
(393, 2, 11, '2023-04-11 14:12:45', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 11.', 'pengguna'),
(394, 6, 6, '2023-05-23 02:20:37', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 6.', 'pengguna'),
(396, 5, 15, '2023-08-05 08:10:52', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 15.', 'sistem'),
(397, 3, 6, '2023-03-26 13:33:43', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 6.', 'pengguna'),
(398, 2, 27, '2023-02-01 11:30:53', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 27.', 'sistem'),
(399, 1, 21, '2023-04-10 22:49:30', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 21.', 'pengguna'),
(400, 8, 44, '2023-02-15 22:05:07', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 44.', 'pengguna'),
(401, 8, 37, '2023-05-18 18:51:15', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 37.', 'pengguna'),
(402, 6, 1, '2023-02-21 10:04:38', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 1.', 'pengguna'),
(403, 6, 24, '2023-09-17 17:50:26', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 24.', 'sistem'),
(405, 4, 12, '2023-01-20 12:05:54', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 12.', 'pengguna'),
(406, 1, 38, '2023-09-19 18:40:55', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 38.', 'pengguna'),
(407, 2, 2, '2023-10-10 21:54:20', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 2.', 'sistem'),
(408, 5, 4, '2023-08-11 07:13:47', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 4.', 'pengguna'),
(409, 3, 50, '2023-03-19 00:14:34', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 50.', 'pengguna'),
(410, 1, 34, '2023-09-28 05:26:24', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 34.', 'pengguna'),
(412, 9, 6, '2023-07-20 18:50:12', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 6.', 'sistem'),
(413, 1, 17, '2023-02-07 09:31:14', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 17.', 'sistem'),
(415, 7, 14, '2023-01-21 10:47:17', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 14.', 'sistem'),
(416, 1, 25, '2023-07-26 20:56:52', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 25.', 'sistem'),
(417, 1, 25, '2023-04-09 20:39:44', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 25.', 'pengguna'),
(421, 8, 19, '2023-05-29 04:42:29', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 19.', 'sistem'),
(422, 4, 46, '2023-06-05 21:59:10', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 46.', 'sistem'),
(424, 4, 43, '2023-02-05 10:47:05', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 43.', 'pengguna'),
(425, 9, 49, '2023-08-10 01:52:04', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 49.', 'sistem'),
(426, 7, 37, '2023-02-13 14:34:29', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 37.', 'sistem'),
(428, 9, 40, '2023-03-30 09:55:42', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 40.', 'sistem'),
(429, 7, 14, '2023-09-15 22:25:13', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 14.', 'pengguna'),
(431, 9, 21, '2023-08-08 01:31:33', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 21.', 'sistem'),
(432, 8, 35, '2023-09-25 09:36:28', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 35.', 'sistem'),
(433, 2, 35, '2023-04-15 18:55:07', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 35.', 'pengguna'),
(434, 4, 17, '2023-10-19 08:05:46', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 17.', 'pengguna'),
(437, 3, 50, '2023-03-14 04:43:26', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 50.', 'pengguna'),
(439, 2, 2, '2023-02-27 03:54:21', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 2.', 'pengguna'),
(442, 7, 7, '2023-04-02 02:31:25', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 7.', 'pengguna'),
(443, 4, 11, '2023-12-04 18:19:42', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 11.', 'pengguna'),
(444, 4, 2, '2023-09-26 14:14:21', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 2.', 'pengguna'),
(445, 2, 5, '2023-04-01 09:23:53', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 5.', 'pengguna'),
(446, 5, 44, '2023-08-04 20:53:12', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 44.', 'sistem'),
(447, 1, 44, '2023-06-18 12:17:23', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 44.', 'pengguna'),
(448, 2, 23, '2023-03-23 18:08:11', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 23.', 'sistem'),
(450, 4, 48, '2023-04-29 19:41:12', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 48.', 'pengguna'),
(451, 1, 25, '2023-06-23 14:53:20', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 25.', 'sistem'),
(453, 4, 47, '2023-05-03 18:33:11', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 47.', 'sistem'),
(457, 7, 32, '2023-05-07 06:24:11', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 32.', 'sistem'),
(460, 5, 34, '2023-02-22 00:59:37', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 34.', 'sistem'),
(462, 6, 36, '2023-07-29 13:02:18', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 36.', 'sistem'),
(463, 9, 30, '2023-09-14 03:20:00', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 30.', 'sistem'),
(464, 6, 11, '2023-10-10 10:59:55', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 11.', 'pengguna'),
(465, 5, 18, '2023-10-28 09:03:51', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 18.', 'pengguna'),
(466, 6, 1, '2023-08-31 14:26:30', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 1.', 'pengguna'),
(467, 3, 12, '2023-09-25 12:39:55', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 12.', 'pengguna'),
(468, 9, 1, '2023-02-28 04:23:04', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 1.', 'pengguna'),
(471, 7, 27, '2023-02-21 21:04:01', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 27.', 'pengguna'),
(472, 9, 11, '2023-11-03 08:29:39', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 11.', 'pengguna'),
(474, 4, 15, '2023-08-14 19:28:46', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 15.', 'pengguna'),
(475, 7, 46, '2023-12-12 09:01:19', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 46.', 'sistem'),
(476, 4, 19, '2023-07-18 16:21:57', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 19.', 'pengguna'),
(477, 3, 49, '2023-05-08 14:53:58', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 49.', 'sistem'),
(478, 7, 26, '2023-07-11 15:31:14', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 26.', 'sistem'),
(479, 8, 20, '2023-11-24 19:05:03', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 20.', 'pengguna'),
(481, 2, 40, '2023-08-16 18:47:57', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 40.', 'pengguna'),
(482, 1, 34, '2023-03-17 11:47:38', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 34.', 'sistem'),
(483, 7, 16, '2023-07-17 08:26:32', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 16.', 'pengguna'),
(484, 1, 24, '2023-06-19 19:51:26', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 24.', 'pengguna'),
(485, 8, 31, '2023-05-22 19:08:56', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 31.', 'pengguna'),
(486, 7, 33, '2023-10-18 19:13:55', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 33.', 'sistem'),
(489, 6, 34, '2023-07-15 02:10:21', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 34.', 'sistem'),
(490, 3, 36, '2023-02-23 10:17:05', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 36.', 'sistem'),
(492, 5, 4, '2023-01-03 04:59:00', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 4.', 'pengguna'),
(493, 3, 36, '2023-09-14 19:33:40', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 36.', 'sistem'),
(494, 4, 40, '2023-01-03 09:40:22', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 40.', 'sistem'),
(496, 4, 6, '2023-10-21 19:40:59', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 6.', 'sistem'),
(497, 5, 46, '2023-08-18 09:45:02', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 46.', 'sistem'),
(498, 8, 32, '2023-02-13 15:27:36', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 32.', 'sistem'),
(499, 2, 1, '2023-03-27 13:52:09', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 1.', 'pengguna'),
(500, 5, 28, '2023-12-18 15:10:04', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 28.', 'sistem'),
(502, 3, 12, '2023-02-27 17:27:48', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 12.', 'sistem'),
(503, 3, 22, '2023-04-19 22:48:45', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 22.', 'sistem'),
(504, 3, 14, '2023-05-06 03:18:28', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 14.', 'sistem'),
(505, 3, 25, '2023-06-16 08:28:38', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 25.', 'pengguna'),
(506, 3, 9, '2023-01-26 22:35:37', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 9.', 'pengguna'),
(507, 8, 35, '2023-07-17 04:24:28', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 35.', 'sistem'),
(509, 8, 31, '2023-01-09 09:57:40', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 31.', 'pengguna'),
(511, 5, 15, '2023-02-16 16:48:45', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 15.', 'pengguna'),
(512, 4, 11, '2023-01-10 09:21:22', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 11.', 'pengguna'),
(513, 9, 48, '2023-10-18 09:21:28', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 48.', 'sistem'),
(514, 6, 31, '2023-03-31 02:03:38', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 31.', 'pengguna'),
(515, 8, 19, '2023-09-14 07:00:05', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 19.', 'pengguna'),
(516, 7, 49, '2023-04-22 02:47:12', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 49.', 'pengguna'),
(518, 1, 7, '2023-12-08 19:01:33', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 7.', 'sistem'),
(519, 1, 18, '2023-04-08 07:10:59', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 18.', 'sistem'),
(522, 2, 18, '2023-04-03 10:01:58', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 18.', 'sistem'),
(523, 8, 23, '2023-06-26 23:33:55', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 23.', 'sistem'),
(524, 2, 5, '2023-07-14 14:09:04', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 5.', 'pengguna'),
(525, 4, 9, '2023-08-08 17:40:10', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 9.', 'sistem'),
(527, 9, 2, '2023-08-06 02:53:10', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 2.', 'pengguna'),
(528, 5, 16, '2023-01-05 22:07:03', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 16.', 'pengguna'),
(529, 6, 34, '2023-01-02 22:17:08', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 34.', 'pengguna'),
(530, 8, 38, '2023-07-31 07:49:03', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 38.', 'sistem'),
(531, 8, 22, '2023-07-20 10:31:35', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 22.', 'pengguna'),
(534, 5, 35, '2023-05-29 22:27:22', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 35.', 'sistem'),
(535, 5, 3, '2023-08-15 17:41:20', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 3.', 'sistem'),
(536, 7, 10, '2023-12-05 17:55:38', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 10.', 'sistem'),
(538, 2, 33, '2023-05-16 21:42:43', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 33.', 'sistem'),
(542, 1, 39, '2023-06-15 03:47:04', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 39.', 'pengguna'),
(543, 1, 32, '2023-06-04 03:58:38', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 32.', 'pengguna'),
(544, 1, 1, '2023-01-17 08:23:18', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 1.', 'sistem'),
(545, 8, 9, '2023-03-13 10:00:29', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 9.', 'sistem'),
(547, 9, 6, '2023-12-05 18:02:33', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 6.', 'sistem'),
(549, 7, 33, '2023-03-12 14:04:41', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 33.', 'sistem'),
(550, 9, 22, '2023-09-07 14:46:49', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 22.', 'pengguna'),
(551, 7, 27, '2023-08-03 00:20:18', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 27.', 'sistem'),
(552, 2, 27, '2023-05-01 05:45:25', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 27.', 'sistem'),
(553, 3, 24, '2023-09-26 10:58:47', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 24.', 'sistem'),
(554, 1, 28, '2023-05-03 12:10:11', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 28.', 'sistem');
INSERT INTO `laporan_kejahatan` (`id`, `jenis_kejahatan`, `tempat_kejadian`, `waktu`, `keterangan`, `pelapor`) VALUES
(556, 2, 12, '2023-02-20 07:28:32', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 12.', 'pengguna'),
(557, 8, 26, '2023-05-04 20:27:49', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 26.', 'pengguna'),
(558, 3, 25, '2023-06-02 20:08:45', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 25.', 'pengguna'),
(559, 8, 41, '2023-03-15 06:40:32', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 41.', 'sistem'),
(560, 7, 38, '2023-11-03 22:48:08', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 38.', 'pengguna'),
(561, 9, 6, '2023-10-09 02:57:33', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 6.', 'pengguna'),
(562, 2, 36, '2023-10-06 22:25:37', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 36.', 'sistem'),
(563, 5, 31, '2023-05-23 17:43:25', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 31.', 'pengguna'),
(564, 1, 32, '2023-01-22 16:58:22', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 32.', 'pengguna'),
(565, 4, 48, '2023-11-29 19:27:40', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 48.', 'pengguna'),
(566, 9, 40, '2023-06-27 18:44:49', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 40.', 'sistem'),
(567, 2, 24, '2023-02-28 14:29:17', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 24.', 'sistem'),
(568, 1, 4, '2023-09-05 20:05:29', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 4.', 'sistem'),
(569, 2, 36, '2023-03-29 07:38:39', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 36.', 'sistem'),
(570, 5, 10, '2023-09-13 22:54:21', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 10.', 'pengguna'),
(571, 6, 9, '2023-09-22 03:27:33', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 9.', 'pengguna'),
(572, 4, 3, '2023-06-12 06:34:23', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 3.', 'sistem'),
(573, 1, 15, '2023-03-09 10:50:58', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 15.', 'pengguna'),
(575, 6, 41, '2023-04-06 07:56:27', 'Kronologi kejadian vandalisme yang terjadi di tempat kejadian 41.', 'sistem'),
(577, 3, 10, '2023-06-23 17:00:43', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 10.', 'sistem'),
(578, 7, 36, '2023-12-11 19:04:58', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 36.', 'pengguna'),
(580, 5, 3, '2023-11-16 06:04:04', 'Kronologi kejadian penganiayaan yang terjadi di tempat kejadian 3.', 'pengguna'),
(581, 7, 47, '2023-07-28 02:46:01', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 47.', 'sistem'),
(582, 1, 50, '2023-03-26 19:17:00', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 50.', 'sistem'),
(583, 7, 11, '2023-07-04 16:43:12', 'Kronologi kejadian pemalakan yang terjadi di tempat kejadian 11.', 'sistem'),
(584, 2, 18, '2023-09-28 01:53:03', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 18.', 'pengguna'),
(585, 9, 4, '2023-09-23 04:27:55', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 4.', 'pengguna'),
(586, 4, 34, '2023-07-03 01:45:47', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 34.', 'sistem'),
(587, 1, 15, '2023-09-28 09:20:30', 'Kronologi kejadian pencurian yang terjadi di tempat kejadian 15.', 'sistem'),
(588, 3, 2, '2023-05-12 11:59:30', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 2.', 'sistem'),
(589, 3, 18, '2023-01-06 07:36:05', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 18.', 'sistem'),
(591, 4, 13, '2023-11-29 19:28:53', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 13.', 'sistem'),
(592, 9, 47, '2023-08-06 17:09:57', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 47.', 'sistem'),
(594, 9, 35, '2023-02-04 22:28:40', 'Kronologi kejadian penipuan yang terjadi di tempat kejadian 35.', 'sistem'),
(595, 2, 16, '2023-07-07 08:50:21', 'Kronologi kejadian perampokan yang terjadi di tempat kejadian 16.', 'sistem'),
(596, 3, 19, '2023-03-27 09:10:46', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 19.', 'pengguna'),
(597, 4, 7, '2023-02-12 04:24:12', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 7.', 'pengguna'),
(598, 3, 3, '2023-11-20 18:26:03', 'Kronologi kejadian perampasan yang terjadi di tempat kejadian 3.', 'sistem'),
(599, 8, 46, '2023-01-27 20:48:27', 'Kronologi kejadian perkelahian jalanan yang terjadi di tempat kejadian 46.', 'sistem'),
(600, 4, 23, '2023-02-02 16:15:42', 'Kronologi kejadian penjambretan yang terjadi di tempat kejadian 23.', 'pengguna');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tempat`
--

CREATE TABLE `tempat` (
  `id_tempat` int(11) NOT NULL,
  `nama_tempat` varchar(255) NOT NULL,
  `kabupaten` enum('Bantul','Sleman','Gunung Kidul','Kulon Progo','Yogyakarta') NOT NULL,
  `gambar` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tempat`
--

INSERT INTO `tempat` (`id_tempat`, `nama_tempat`, `kabupaten`, `gambar`) VALUES
(1, 'Malioboro', 'Yogyakarta', 'gambar/malioboro.jpg'),
(2, 'Tugu Jogja', 'Yogyakarta', 'gambar/tugu.png'),
(3, 'Keraton Yogyakarta', 'Yogyakarta', 'gambar/keraton.jpg'),
(4, 'Alun-alun Kidul', 'Yogyakarta', 'gambar/alkid.jpg'),
(5, 'Jogja City Mall', 'Sleman', 'gambar/jcm.jpg'),
(6, 'Simpang Jakal Ringroad', 'Sleman', 'gambar/simpang_jakal.png'),
(7, 'Jalan Prawirotaman', 'Yogyakarta', 'gambar/jlPrawirotaman.jpg'),
(8, 'UGM (Universitas Gadjah Mada)', 'Sleman', 'gambar/ugm.webp'),
(9, 'Museum Affandi', 'Sleman', 'gambar/afandi.webp'),
(10, 'Titik Nol Kilometer Jogja', 'Yogyakarta', 'gambar/titik_nol.jpg'),
(11, 'Gembira Loka Zoo', 'Yogyakarta', 'gambar/gembira_loka.webp'),
(12, 'XT Square', 'Yogyakarta', 'gambar/xt-square.jpg'),
(13, 'UII (Universitas Islam Indonesia)', 'Sleman', 'gambar/UII.jpg'),
(14, 'Pasar Beringharjo', 'Yogyakarta', 'gambar/beringharjo.jpg'),
(15, 'Jogja National Museum', 'Yogyakarta', 'gambar/jnm.jpg'),
(16, 'Malioboro Mall', 'Yogyakarta', 'gambar/malioboro_mall.webp'),
(17, 'Goa Pindul', 'Gunung Kidul', 'gambar/goa_pindul.jpg'),
(18, 'Pantai Parangtritis', 'Bantul', 'gambar/parangtritis.jpg'),
(19, 'Bukit Bintang', 'Gunung Kidul', 'gambar/bukit_bintang.jpg'),
(20, 'Pasar Legi Kotagede', 'Yogyakarta', 'gambar/pasarLegi.jpg'),
(21, 'Jalan Veteran', 'Yogyakarta', 'gambar/veteran.jpg'),
(22, 'Candi Ratu Boko', 'Sleman', 'gambar/ratuboko.webp'),
(23, 'Candi Sambisari', 'Sleman', 'gambar/sambisari.jpg'),
(24, 'Candi Kalasan', 'Sleman', 'gambar/candi_kalasan.jpg'),
(25, 'Benteng Vredeburg', 'Yogyakarta', 'gambar/benteng.jpg'),
(26, 'Jogja City Mall', 'Sleman', 'gambar/jcm.jpg'),
(27, 'Gedung Agung Yogyakarta', 'Yogyakarta', 'gambar/gedung_agung.jpg'),
(28, 'Tamansari Water Castle', 'Yogyakarta', 'gambar/tamansari.jpg'),
(29, 'Pojok Benteng', 'Yogyakarta', 'gambar/pojok_benteng.jpg'),
(30, 'Taman Pelangi Jogja', 'Sleman', 'gambar/taman_pelangi.jpg'),
(31, 'Ambarukmo Plaza', 'Sleman', 'gambar/ambarukmo.jpg'),
(32, 'Jalan Gedongkuning', 'Yogyakarta', 'gambar/gedongkuning.jpg'),
(33, 'Kaliurang Park', 'Sleman', 'gambar/kaliurang_park.jpg'),
(34, 'Gumuling Well', 'Yogyakarta', 'gambar/gumuling_well.jpg'),
(35, 'Pasar Ngasem', 'Yogyakarta', 'gambar/pasar_ngasem.webp'),
(36, 'Indrayanti Beach', 'Bantul', 'gambar/indrayanti.webp'),
(37, 'Jogja Expo Center', 'Yogyakarta', 'gambar/jec.jpg'),
(38, 'Jogja Bay Pirates Adventure Waterpark', 'Sleman', 'gambar/jogja_bay.jpg'),
(39, 'Merapi Park', 'Sleman', 'gambar/merapi_park.webp'),
(40, 'Jalan Malioboro', 'Yogyakarta', 'gambar/jalan_malioboro.jpeg'),
(41, 'Candi Prambanan', 'Sleman', 'gambar/prambanan.jpg'),
(42, 'Gunung Merapi', 'Sleman', 'gambar/gunung_merapi.jpg'),
(43, 'Pantai Baron', 'Gunung Kidul', 'gambar/baron.jpg'),
(44, 'Pantai Kukup', 'Gunung Kidul', 'gambar/kukup.jpg'),
(45, 'Pantai Krakal', 'Gunung Kidul', 'gambar/krakal.webp'),
(46, 'Pantai Ngrawe', 'Gunung Kidul', 'gambar/ngrawe.jpg'),
(47, 'Pantai Sadranan', 'Gunung Kidul', 'gambar/sadranan.webp'),
(48, 'Kids Fun', 'Bantul', 'gambar/kidsfun.jpg'),
(49, 'Kebun Binatang Gembira Loka', 'Yogyakarta', 'gambar/gembira_loka.webp'),
(50, 'Taman Pintar', 'Yogyakarta', 'gambar/taman_pintar.jpg');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `jenis_kejahatan`
--
ALTER TABLE `jenis_kejahatan`
  ADD PRIMARY KEY (`id_jenis`);

--
-- Indeks untuk tabel `laporan_kejahatan`
--
ALTER TABLE `laporan_kejahatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jenis` (`jenis_kejahatan`),
  ADD KEY `tempat` (`tempat_kejadian`);

--
-- Indeks untuk tabel `tempat`
--
ALTER TABLE `tempat`
  ADD PRIMARY KEY (`id_tempat`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `jenis_kejahatan`
--
ALTER TABLE `jenis_kejahatan`
  MODIFY `id_jenis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `laporan_kejahatan`
--
ALTER TABLE `laporan_kejahatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=601;

--
-- AUTO_INCREMENT untuk tabel `tempat`
--
ALTER TABLE `tempat`
  MODIFY `id_tempat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `laporan_kejahatan`
--
ALTER TABLE `laporan_kejahatan`
  ADD CONSTRAINT `jenis` FOREIGN KEY (`jenis_kejahatan`) REFERENCES `jenis_kejahatan` (`id_jenis`),
  ADD CONSTRAINT `tempat` FOREIGN KEY (`tempat_kejadian`) REFERENCES `tempat` (`id_tempat`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
