<?php include 'php/fungsiCCTV.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/CCTV.css">
    <link rel="stylesheet" href="css/navbar.css">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="js/navbar.js" defer></script>
    <script src="js/cctv-catalog.js" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
    <title>Daftar CCTV Publik - eyeSpy</title>
</head>
<body>
    <?php include 'php/navbar.php'; ?>

    <main class="cctv-catalog-page">
        <header class="cctv-catalog-heading">
            <div class="cctv-heading-text">
                <span class="cctv-heading-badge"><i class="uil uil-broadcast"></i> Pemantauan Real-time</span>
                <h1 class="judul">Daftar CCTV Publik</h1>
                <p class="cctv-subtitle">Akses siaran langsung kamera keamanan publik bersumber dari portal resmi CCTV Jogja Istimewa.</p>
            </div>
            <a class="cctv-source-link" href="https://cctv.jogjaprov.go.id/" target="_blank" rel="noopener noreferrer">
                <span>Portal Resmi DIY</span>
                <i class="uil uil-external-link-alt"></i>
            </a>
        </header>

        <?php if (!$cctvCatalog['storage_ready']): ?>
            <div class="cctv-notice cctv-notice-error" role="alert">
                <i class="uil uil-exclamation-triangle"></i>
                <span>Katalog CCTV belum disiapkan. Silakan jalankan migrasi database yang disediakan.</span>
            </div>
        <?php elseif ($cctvCatalog['sync_error']): ?>
            <div class="cctv-notice" role="status">
                <i class="uil uil-info-circle"></i>
                <span>Metadata terbaru belum dapat dimuat. Menampilkan data tersimpan terakhir bila tersedia.</span>
            </div>
        <?php endif; ?>

        <div class="cctv-toolbar">
            <label class="cctv-search" for="cctvSearch">
                <i class="uil uil-search"></i>
                <input id="cctvSearch" type="search" placeholder="Cari nama lokasi, jalan, atau dinas pengelola…" autocomplete="off">
            </label>
            <div class="cctv-counter-badge">
                <i class="uil uil-video"></i>
                <span id="cctvResultCount" class="cctv-result-count"><?php echo count($cctvCatalog['cameras']); ?> kamera ditampilkan</span>
            </div>
        </div>

        <div class="isi" id="cctvList">
            <?php foreach ($cctvCatalog['cameras'] as $camera): ?>
                <?php
                    $displayName = $camera['alias_name'] ?: $camera['name'];
                    $groupName = !empty($camera['group_name']) ? $camera['group_name'] : 'CCTV Jogja Istimewa';
                    $searchText = strtolower($displayName . ' ' . $camera['name'] . ' ' . $groupName);
                    $isConnected = (bool) $camera['connected'];
                ?>
                <a
                    class="cctv-card-link"
                    data-cctv-card
                    data-search="<?php echo htmlspecialchars($searchText, ENT_QUOTES, 'UTF-8'); ?>"
                    href="isiCCTV.php?source=<?php echo rawurlencode((string) $camera['source']); ?>&amp;id=<?php echo rawurlencode((string) $camera['external_camera_id']); ?>"
                    title="<?php echo htmlspecialchars((string) $displayName, ENT_QUOTES, 'UTF-8'); ?>"
                >
                    <article class="CCTV <?php echo $isConnected ? 'is-connected' : 'is-offline'; ?>">
                        <div class="cctv-card-visual" aria-hidden="true">
                            <i class="uil uil-video"></i>
                            <span class="cctv-pulse-dot <?php echo $isConnected ? 'pulse-ready' : 'pulse-offline'; ?>"></span>
                        </div>
                        <div class="cctv-card-content">
                            <div class="cctv-card-meta">
                                <span class="cctv-group" title="<?php echo htmlspecialchars((string) $groupName, ENT_QUOTES, 'UTF-8'); ?>">
                                    <i class="uil uil-map-pin"></i>
                                    <span><?php echo htmlspecialchars((string) $groupName, ENT_QUOTES, 'UTF-8'); ?></span>
                                </span>
                                <span class="cctv-status <?php echo $isConnected ? 'cctv-status-ready' : 'cctv-status-offline'; ?>">
                                    <?php echo $isConnected ? 'Terhubung' : 'Offline'; ?>
                                </span>
                            </div>

                            <h2 class="lokasiCCTV">
                                <?php echo htmlspecialchars((string) $displayName, ENT_QUOTES, 'UTF-8'); ?>
                            </h2>

                            <div class="cctv-card-footer">
                                <span class="cctv-card-help">
                                    <?php echo $isConnected ? 'Siaran aktif &bull; Buka kamera' : 'Kamera saat ini offline'; ?>
                                </span>
                                <span class="cctv-card-action">
                                    Lihat <i class="uil uil-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </article>
                </a>
            <?php endforeach; ?>
        </div>

        <div id="cctvEmptyState" class="cctv-empty-state" hidden>
            <div class="cctv-empty-icon"><i class="uil uil-search-alt"></i></div>
            <h3>Tidak ada kamera yang sesuai</h3>
            <p>Silakan coba kata kunci lain seperti nama jalan, persimpangan, atau dinas pengelola.</p>
        </div>
    </main>
</body>
</html>
