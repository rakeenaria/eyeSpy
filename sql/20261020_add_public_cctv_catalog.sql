-- Jalankan file ini sekali melalui phpMyAdmin pada database `eyeSpy`.
-- Migrasi ini tidak mengubah tabel `tempat` maupun `laporan_kejahatan`.

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
