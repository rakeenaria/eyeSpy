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
    <title>Daftar CCTV Publik</title>
</head>
<body>
    <main class="cctv-catalog-page">
        <div class="cctv-catalog-heading">
            <div>
                <h1 class="judul">Daftar CCTV Publik</h1>
                <p class="cctv-subtitle">Data dan stream bersumber dari portal resmi CCTV Jogja Istimewa.</p>
            </div>
            <a class="cctv-source-link" href="https://cctv.jogjaprov.go.id/" target="_blank" rel="noopener noreferrer">Portal resmi <i class="uil uil-external-link-alt"></i></a>
        </div>

        <?php if (!$cctvCatalog['storage_ready']): ?>
            <div class="cctv-notice cctv-notice-error" role="alert">Katalog CCTV belum disiapkan. Silakan jalankan migrasi database yang disediakan.</div>
        <?php elseif ($cctvCatalog['sync_error']): ?>
            <div class="cctv-notice" role="status">Metadata terbaru belum dapat dimuat. Menampilkan data tersimpan terakhir bila tersedia.</div>
        <?php endif; ?>

        <label class="cctv-search" for="cctvSearch">
            <i class="uil uil-search"></i>
            <input id="cctvSearch" type="search" placeholder="Cari nama kamera atau pengelola…" autocomplete="off">
        </label>
        <p id="cctvResultCount" class="cctv-result-count"><?php echo count($cctvCatalog['cameras']); ?> kamera ditampilkan</p>

        <div class="isi" id="cctvList">
            <?php foreach ($cctvCatalog['cameras'] as $camera): ?>
                <?php
                    $displayName = $camera['alias_name'] ?: $camera['name'];
                    $searchText = strtolower($displayName . ' ' . $camera['name'] . ' ' . ($camera['group_name'] ?? ''));
                    $isConnected = (bool) $camera['connected'];
                ?>
                <a
                    class="cctv-card-link"
                    data-cctv-card
                    data-search="<?php echo htmlspecialchars($searchText, ENT_QUOTES, 'UTF-8'); ?>"
                    href="isiCCTV.php?source=<?php echo rawurlencode((string) $camera['source']); ?>&amp;id=<?php echo rawurlencode((string) $camera['external_camera_id']); ?>"
                >
                    <article class="CCTV">
                        <div class="cctv-card-visual" aria-hidden="true"><i class="uil uil-video"></i></div>
                        <div class="cctv-card-content">
                            <div class="cctv-card-title-row">
                                <h2 class="lokasiCCTV"><?php echo htmlspecialchars((string) $displayName, ENT_QUOTES, 'UTF-8'); ?></h2>
                                <span class="cctv-status <?php echo $isConnected ? 'cctv-status-ready' : 'cctv-status-offline'; ?>">
                                    <?php echo $isConnected ? 'Terhubung' : 'Offline'; ?>
                                </span>
                            </div>
                            <?php if (!empty($camera['group_name'])): ?>
                                <p class="cctv-group"><?php echo htmlspecialchars((string) $camera['group_name'], ENT_QUOTES, 'UTF-8'); ?></p>
                            <?php else: ?>
                                <p class="cctv-group">CCTV Jogja Istimewa</p>
                            <?php endif; ?>
                            <p class="cctv-card-help"><?php echo $isConnected ? 'Buka untuk memuat siaran.' : 'Sumber menandai kamera tidak terhubung.'; ?></p>
                        </div>
                    </article>
                </a>
            <?php endforeach; ?>
        </div>

        <p id="cctvEmptyState" class="cctv-empty-state" hidden>Tidak ada kamera yang sesuai dengan pencarian.</p>
    </main>
    <?php include 'php/navbar.php'; ?>
</body>
</html>
