<?php include 'php/fungsiIsiCCTV.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/CCTV.css?v=<?php echo filemtime('css/CCTV.css'); ?>">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="js/navbar.js" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
    <title><?php echo $camera ? 'CCTV - ' . htmlspecialchars((string) ($camera['alias_name'] ?: $camera['name']), ENT_QUOTES, 'UTF-8') : 'CCTV'; ?></title>
</head>
<body>
    <?php include 'php/navbar.php'; ?>
    <main class="cctv-detail-page">
        <?php if (!$cctvDetail['storage_ready']): ?>
            <div class="cctv-notice cctv-notice-error" role="alert">
                <i class="uil uil-exclamation-triangle"></i>
                <span>Katalog CCTV belum disiapkan. Silakan jalankan migrasi database yang disediakan.</span>
            </div>
        <?php elseif (!$camera): ?>
            <div class="cctv-notice cctv-notice-error" role="alert">
                <i class="uil uil-exclamation-octagon"></i>
                <span>Kamera tidak ditemukan atau sudah tidak tersedia pada sumber resmi.</span>
            </div>
            <a class="cctv-back-link" href="daftarCCTV.php"><i class="uil uil-arrow-left"></i> Kembali ke daftar CCTV</a>
        <?php else: ?>
            <?php
                $displayName = $camera['alias_name'] ?: $camera['name'];
                $canLoadLive = (bool) $camera['connected'] && !empty($camera['stream_url']);
                $liveUrl = $canLoadLive ? (string) $camera['stream_url'] : '';
            ?>
            <a class="cctv-back-link" href="daftarCCTV.php"><i class="uil uil-arrow-left"></i> Kembali ke daftar CCTV</a>
            <div class="cctv-detail-heading">
                <div>
                    <p class="cctv-eyebrow">CCTV Jogja Istimewa</p>
                    <h1 class="judul">CCTV - <?php echo htmlspecialchars((string) $displayName, ENT_QUOTES, 'UTF-8'); ?></h1>
                    <?php if (!empty($camera['group_name'])): ?>
                        <p class="cctv-subtitle"><?php echo htmlspecialchars((string) $camera['group_name'], ENT_QUOTES, 'UTF-8'); ?></p>
                    <?php endif; ?>
                </div>
                <span class="cctv-status <?php echo $canLoadLive ? 'cctv-status-ready' : 'cctv-status-offline'; ?>">
                    <?php echo $canLoadLive ? 'Terhubung' : 'Offline'; ?>
                </span>
            </div>

            <?php if ($cctvDetail['sync_error']): ?>
                <div class="cctv-notice" role="status">
                    <i class="uil uil-info-circle"></i>
                    <span>Metadata terbaru belum dapat dimuat. Status yang ditampilkan berasal dari data tersimpan terakhir.</span>
                </div>
            <?php endif; ?>

            <div class="isi2">
                <section class="videoCCTV" aria-label="Pemutar CCTV">
                    <video
                        id="cctvVideo"
                        controls
                        muted
                        playsinline
                        preload="metadata"
                        data-live-url="<?php echo htmlspecialchars($liveUrl, ENT_QUOTES, 'UTF-8'); ?>"
                        data-fallback-url="gambar/videoTugu.mp4"
                    ></video>
                    <div id="cctvPlayerStatus" class="cctv-player-status" data-state="loading" role="status" aria-live="polite">
                        Memuat stream dari portal CCTV Jogja Istimewa…
                    </div>
                    <button id="reloadCctvStream" class="cctv-reload-button" type="button"><i class="uil uil-redo"></i> Coba muat ulang stream</button>
                    <p class="cctv-attribution">Sumber: <a href="https://cctv.jogjaprov.go.id/" target="_blank" rel="noopener noreferrer">Portal CCTV Jogja Istimewa</a>. Status “terhubung” berasal dari metadata sumber dan belum menjamin pemutaran berhasil.</p>
                </section>

                <form action="submit_report.php" method="POST" class="report-form">
                    <h3><i class="uil uil-shield-exclamation"></i> Laporkan Kejadian</h3>
                    <input type="hidden" name="cctv_source" value="<?php echo htmlspecialchars((string) $camera['source'], ENT_QUOTES, 'UTF-8'); ?>">
                    <input type="hidden" name="cctv_camera_id" value="<?php echo htmlspecialchars((string) $camera['external_camera_id'], ENT_QUOTES, 'UTF-8'); ?>">
                    <textarea name="keterangan" placeholder="Tuliskan keterangan kejadian atau aktivitas yang terpantau pada kamera ini..." required></textarea>
                    <button type="submit"><i class="uil uil-message"></i> Kirim Laporan</button>
                </form>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js" defer></script>
            <script src="js/cctv-player.js" defer></script>
        <?php endif; ?>
    </main>
</body>
</html>
