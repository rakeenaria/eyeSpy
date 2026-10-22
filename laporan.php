<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekapitulasi Laporan Kejahatan DIY - eyeSpy</title>
    <link rel="stylesheet" href="css/navbar.css?v=<?php echo filemtime(__DIR__ . '/css/navbar.css'); ?>">
    <link rel="stylesheet" href="css/laporan.css?v=<?php echo filemtime(__DIR__ . '/css/laporan.css'); ?>">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="js/groqResponse.js" defer></script>
    <script src="js/navbar.js?v=<?php echo filemtime(__DIR__ . '/js/navbar.js'); ?>" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
</head>
<body>
    <?php include 'php/navbar.php'; ?>

    <main class="laporan-page">
        <!-- Header -->
        <header class="laporan-heading">
            <div class="laporan-heading-text">
                <span class="laporan-heading-badge"><i class="uil uil-shield-exclamation"></i> Pusat Data Kejadian DIY</span>
                <h1 class="laporan-title">Rekapitulasi Laporan Kejahatan</h1>
                <p class="laporan-subtitle">Daftar agregasi kasus kriminalitas per tempat kejadian di wilayah Daerah Istimewa Yogyakarta.</p>
            </div>
            <div class="laporan-meta-info">
                <span class="laporan-info-chip"><i class="uil uil-map-pin"></i> 50 Titik Pantau</span>
                <span class="laporan-info-chip"><i class="uil uil-clock-three"></i> Periode 2023</span>
            </div>
        </header>

        <!-- AI Groq Analysis Card (Ringkasan Kejadian & Saran Mitigasi) -->
        <article class="laporan-ai-card">
            <div class="laporan-ai-header">
                <div class="laporan-ai-title">
                    <span class="ai-badge-icon"><i class="uil uil-brain"></i></span>
                    <div>
                        <h3>Analisis AI & Rekomendasi Mitigasi</h3>
                        <p>Ringkasan kejadian kriminalitas dan rekomendasi pencegahan otomatis oleh Groq AI.</p>
                    </div>
                </div>
                <span class="ai-status-pill"><span class="ai-pulse-dot"></span> Analisis Aktif</span>
            </div>
            
            <div class="laporan-ai-body" id="output">
                <?php include 'llm/groqLaporan.php'; ?>
                <input type="hidden" id="content" value="<?php echo htmlspecialchars($content, ENT_QUOTES, 'UTF-8'); ?>">
            </div>
        </article>

        <!-- Toolbar: Filter Bulan & Pencarian Instan -->
        <div class="laporan-toolbar">
            <div class="laporan-filter-group">
                <label class="toolbar-label"><i class="uil uil-calendar-alt"></i> Filter Periode:</label>
                <?php include 'php/dropdownBulan.php'; ?>
            </div>
            <div class="laporan-search-group">
                <i class="uil uil-search"></i>
                <input type="search" id="tabelSearch" placeholder="Cari nama lokasi, jalan, atau kejahatan..." autocomplete="off">
            </div>
        </div>

        <!-- Tabel Rekapitulasi Laporan -->
        <section class="laporan-table-card">
            <div class="table-responsive">
                <table class="laporan-table" id="laporanTable">
                    <thead>
                        <tr>
                            <th style="width: 50px;">No</th>
                            <th>Tempat Kejadian</th>
                            <th>Jumlah Laporan</th>
                            <th>Variasi Kejahatan</th>
                            <th>Kejahatan Terbanyak</th>
                            <th style="text-align: right; width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php include "php/fungsiLaporan.php"; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Client-side filter script untuk tabel -->
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const searchInput = document.getElementById("tabelSearch");
            const tableRows = document.querySelectorAll("#laporanTable tbody tr[data-table-row]");

            if (searchInput && tableRows.length > 0) {
                searchInput.addEventListener("input", function () {
                    const query = this.value.trim().toLowerCase();
                    tableRows.forEach(row => {
                        const searchData = row.getAttribute("data-search") || row.innerText.toLowerCase();
                        if (searchData.includes(query)) {
                            row.style.display = "";
                        } else {
                            row.style.display = "none";
                        }
                    });
                });
            }
        });
    </script>
</body>
</html>
