-- ============================================================================
-- eyeSpy — Unified MySQL / MariaDB Schema
-- Database: eyeSpy (utf8mb4_general_ci)
-- Preserves existing `cctv_camera` and `cctv_sync_state` public CCTV tables.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `eyeSpy`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `eyeSpy`;

CREATE TABLE IF NOT EXISTS `jenis_kejahatan` (
  `id_jenis` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_jenis` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_jenis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tempat` (
  `id_tempat` INT(11) NOT NULL AUTO_INCREMENT,
  `nama_tempat` VARCHAR(255) NOT NULL,
  `kabupaten` ENUM('Bantul','Sleman','Gunung Kidul','Kulon Progo','Yogyakarta') NOT NULL,
  `gambar` VARCHAR(1000) NOT NULL DEFAULT '/images/footage.webp',
  PRIMARY KEY (`id_tempat`),
  KEY `idx_tempat_kabupaten` (`kabupaten`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `laporan_kejahatan` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `jenis_kejahatan` INT(11) NOT NULL,
  `tempat_kejadian` INT(11) NOT NULL,
  `waktu` DATETIME NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `pelapor` ENUM('pengguna','sistem') DEFAULT 'sistem',
  `sumber_referensi` VARCHAR(255) DEFAULT NULL,
  `cctv_camera_id` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_laporan_jenis` (`jenis_kejahatan`),
  KEY `idx_laporan_tempat` (`tempat_kejadian`),
  KEY `idx_laporan_waktu` (`waktu`),
  CONSTRAINT `fk_laporan_jenis` FOREIGN KEY (`jenis_kejahatan`) REFERENCES `jenis_kejahatan` (`id_jenis`),
  CONSTRAINT `fk_laporan_tempat` FOREIGN KEY (`tempat_kejadian`) REFERENCES `tempat` (`id_tempat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Statistik Resmi Tahunan Polda DIY & Pusiknas Bareskrim Polri (2023–2026 YTD)
CREATE TABLE IF NOT EXISTS `statistik_polda_diy` (
  `tahun` INT(4) NOT NULL,
  `crime_total` INT(11) DEFAULT NULL,
  `crime_clearance` INT(11) DEFAULT NULL,
  `clearance_rate` DECIMAL(5,2) DEFAULT NULL,
  `crime_index` INT(11) DEFAULT NULL,
  `crime_rate` INT(11) DEFAULT NULL,
  `crime_clock` VARCHAR(64) DEFAULT NULL,
  `laka_lantas` INT(11) DEFAULT NULL,
  `periode_label` VARCHAR(100) NOT NULL,
  `sumber_resmi` VARCHAR(255) NOT NULL,
  `catatan` TEXT DEFAULT NULL,
  PRIMARY KEY (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Statistik Resmi per Wilayah Hukum Polres/Polresta DIY (2024 & 2025)
CREATE TABLE IF NOT EXISTS `statistik_wilayah` (
  `tahun` INT(4) NOT NULL,
  `kabupaten` ENUM('Bantul','Sleman','Gunung Kidul','Kulon Progo','Yogyakarta') NOT NULL,
  `polres` VARCHAR(120) NOT NULL,
  `total_kasus` INT(11) NOT NULL,
  `kasus_selesai` INT(11) DEFAULT NULL,
  `catatan` VARCHAR(255) DEFAULT NULL,
  `sumber_resmi` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`tahun`, `kabupaten`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Statistik Resmi Kategori Menonjol Polda DIY & Jajaran (2024 & 2025)
CREATE TABLE IF NOT EXISTS `statistik_kategori` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tahun` INT(4) NOT NULL,
  `nama_jenis` VARCHAR(120) NOT NULL,
  `jumlah` INT(11) NOT NULL,
  `cakupan` VARCHAR(120) NOT NULL,
  `sumber_resmi` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_stat_kat_tahun_jenis` (`tahun`, `nama_jenis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Statistik Resmi Lokasi TKP Dominan Polda DIY (Pusiknas Bareskrim Polri)
CREATE TABLE IF NOT EXISTS `statistik_tkp` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tahun` INT(4) NOT NULL,
  `lokasi_tkp` VARCHAR(120) NOT NULL,
  `jumlah` INT(11) NOT NULL,
  `sumber_resmi` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tkp_tahun_lokasi` (`tahun`, `lokasi_tkp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Cache Ringkasan Mitigasi AI Groq (TTL 6 jam)
CREATE TABLE IF NOT EXISTS `ai_summary_cache` (
  `cache_key` VARCHAR(64) NOT NULL,
  `content` TEXT NOT NULL,
  `model` VARCHAR(120) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cache_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Katalog CCTV Publik Jogja Istimewa (dipertahankan utuh)
CREATE TABLE IF NOT EXISTS `cctv_camera` (
  `source` VARCHAR(64) NOT NULL,
  `external_camera_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `alias_name` VARCHAR(255) DEFAULT NULL,
  `stream_url` VARCHAR(2048) DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `group_name` VARCHAR(255) DEFAULT NULL,
  `visible` TINYINT(1) NOT NULL DEFAULT 0,
  `connected` TINYINT(1) NOT NULL DEFAULT 0,
  `source_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_metadata_sync_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`source`, `external_camera_id`),
  KEY `idx_cctv_camera_listing` (`source`, `source_active`, `visible`, `connected`),
  KEY `idx_cctv_camera_group` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `cctv_sync_state` (
  `source` VARCHAR(64) NOT NULL,
  `last_successful_sync_at` DATETIME DEFAULT NULL,
  `last_attempt_at` DATETIME DEFAULT NULL,
  `last_error_at` DATETIME DEFAULT NULL,
  `last_error_message` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
