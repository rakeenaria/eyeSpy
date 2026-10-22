<?php 
require_once 'php/fungsiDetailLaporan.php';
$isSystem = $row_laporan['pelapor'] === 'sistem';
$pelaporLabel = $isSystem ? 'Sistem CCTV (Automated)' : 'Laporan Masyarakat (User)';
$pelaporClass = $isSystem ? 'system' : 'user';
$pelaporIcon = $isSystem ? 'uil-robot' : 'uil-user';
$waktuFormatted = date('d F Y', strtotime($row_laporan['waktu'])) . ' &bull; ' . date('H:i', strtotime($row_laporan['waktu']));
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Laporan #<?php echo $row_laporan['id']; ?> - eyeSpy</title>
    <link rel="stylesheet" href="css/navbar.css?v=<?php echo filemtime(__DIR__ . '/css/navbar.css'); ?>">
    <link rel="stylesheet" href="css/laporan.css?v=<?php echo filemtime(__DIR__ . '/css/laporan.css'); ?>">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="js/navbar.js?v=<?php echo filemtime(__DIR__ . '/js/navbar.js'); ?>" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
</head>
<body>
    <?php include 'php/navbar.php'; ?>

    <main class="detail-laporan-page">
        <a class="laporan-back-btn" href="isiLaporan.php?id=<?php echo $row_laporan['id_tempat']; ?>">
            <i class="uil uil-arrow-left"></i> Kembali ke Daftar Kasus di <?php echo htmlspecialchars($row_laporan['nama_tempat']); ?>
        </a>

        <header class="laporan-heading">
            <div class="laporan-heading-text">
                <span class="laporan-heading-badge"><i class="uil uil-file-shield-alt"></i> Kasus ID #<?php echo $row_laporan['id']; ?></span>
                <h1 class="laporan-title">Detail Laporan Kejadian &bull; <?php echo htmlspecialchars($row_laporan['jenis_kejahatan']); ?></h1>
                <p class="laporan-subtitle">
                    Lokasi: <?php echo htmlspecialchars($row_laporan['nama_tempat']); ?> (<?php echo htmlspecialchars($row_laporan['kabupaten']); ?>) &bull; Wilayah Daerah Istimewa Yogyakarta.
                </p>
            </div>
        </header>

        <article class="detail-card">
            <!-- Footage Visual Media -->
            <div class="detail-footage-box">
                <img src="gambar/footage.webp" alt="Bukti Rekaman CCTV / Kejadian">
                <span class="footage-badge">
                    <i class="uil uil-check-circle"></i> Rekaman Kamera Terverifikasi
                </span>
            </div>

            <!-- Detail Info 4 Grid -->
            <div class="detail-info-grid">
                <div class="detail-item">
                    <span class="detail-label">Sumber Pelapor</span>
                    <span class="detail-val">
                        <span class="badge-pelapor <?php echo $pelaporClass; ?>">
                            <i class="uil <?php echo $pelaporIcon; ?>"></i> <?php echo $pelaporLabel; ?>
                        </span>
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Jenis Kejahatan</span>
                    <span class="detail-val">
                        <span class="badge-jenis"><i class="uil uil-tag-alt"></i> <?php echo htmlspecialchars($row_laporan['jenis_kejahatan']); ?></span>
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Tempat Kejadian</span>
                    <span class="detail-val">
                        <strong><?php echo htmlspecialchars($row_laporan['nama_tempat']); ?></strong>
                        <small style="color: #695e77; display: block; font-weight: normal; font-size: 12px;"><?php echo htmlspecialchars($row_laporan['kabupaten']); ?></small>
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Waktu Kejadian</span>
                    <span class="detail-val">
                        <span class="waktu-text"><i class="uil uil-clock"></i> <?php echo $waktuFormatted; ?> WIB</span>
                    </span>
                </div>
            </div>

            <!-- Kronologi & Keterangan -->
            <div class="detail-keterangan-box">
                <div class="keterangan-title">
                    <i class="uil uil-align-left"></i> Kronologi & Keterangan Laporan
                </div>
                <div class="keterangan-body">
                    <?php echo nl2br(htmlspecialchars($row_laporan['keterangan'] ?: 'Tidak ada keterangan tambahan yang dicatat untuk laporan kejadian ini.')); ?>
                </div>
            </div>
        </article>
    </main>
</body>
</html>
