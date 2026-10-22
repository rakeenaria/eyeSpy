<?php
include 'php/fungsiIsiLaporan.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Kejadian - <?php echo htmlspecialchars($nama_tempat); ?> - eyeSpy</title>
    <link rel="stylesheet" href="css/navbar.css?v=<?php echo filemtime(__DIR__ . '/css/navbar.css'); ?>">
    <link rel="stylesheet" href="css/laporan.css?v=<?php echo filemtime(__DIR__ . '/css/laporan.css'); ?>">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="js/navbar.js?v=<?php echo filemtime(__DIR__ . '/js/navbar.js'); ?>" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
</head>
<body>
    <?php include 'php/navbar.php'; ?>

    <main class="isi-laporan-page">
        <a class="laporan-back-btn" href="laporan.php">
            <i class="uil uil-arrow-left"></i> Kembali ke Rekapitulasi Laporan
        </a>

        <header class="laporan-heading">
            <div class="laporan-heading-text">
                <span class="laporan-heading-badge"><i class="uil uil-map-pin-alt"></i> Detail Titik Lokasi</span>
                <h1 class="laporan-title">Laporan Kejadian &bull; <?php echo htmlspecialchars($nama_tempat); ?></h1>
                <p class="laporan-subtitle">
                    Wilayah: <?php echo htmlspecialchars($kabupaten_tempat ?: 'Daerah Istimewa Yogyakarta'); ?> &bull; Menampilkan riwayat kasus kriminalitas terdata pada lokasi ini.
                </p>
            </div>
            <div class="laporan-meta-info">
                <span class="laporan-info-chip"><i class="uil uil-file-alt"></i> <?php echo ($result_laporan ? $result_laporan->num_rows : 0); ?> Kasus Ditemukan</span>
            </div>
        </header>

        <!-- Toolbar Filter Bulan -->
        <div class="laporan-toolbar">
            <div class="laporan-filter-group">
                <label class="toolbar-label"><i class="uil uil-calendar-alt"></i> Filter Periode:</label>
                <form method="GET" action="" class="filter-form">
                    <input type="hidden" name="id" value="<?php echo $id_tempat; ?>">
                    <div class="select-wrapper">
                        <select class="bulan-select" name="bulan" onchange="this.form.submit()" aria-label="Filter bulan">
                            <option value="00" <?php if ($bulan == '00') echo 'selected'; ?>>Satu Tahun Penuh</option>
                            <option value="01" <?php if ($bulan == '01') echo 'selected'; ?>>Januari</option>
                            <option value="02" <?php if ($bulan == '02') echo 'selected'; ?>>Februari</option>
                            <option value="03" <?php if ($bulan == '03') echo 'selected'; ?>>Maret</option>
                            <option value="04" <?php if ($bulan == '04') echo 'selected'; ?>>April</option>
                            <option value="05" <?php if ($bulan == '05') echo 'selected'; ?>>Mei</option>
                            <option value="06" <?php if ($bulan == '06') echo 'selected'; ?>>Juni</option>
                            <option value="07" <?php if ($bulan == '07') echo 'selected'; ?>>Juli</option>
                            <option value="08" <?php if ($bulan == '08') echo 'selected'; ?>>Agustus</option>
                            <option value="09" <?php if ($bulan == '09') echo 'selected'; ?>>September</option>
                            <option value="10" <?php if ($bulan == '10') echo 'selected'; ?>>Oktober</option>
                            <option value="11" <?php if ($bulan == '11') echo 'selected'; ?>>November</option>
                            <option value="12" <?php if ($bulan == '12') echo 'selected'; ?>>Desember</option>
                        </select>
                    </div>
                </form>
            </div>
        </div>

        <!-- Tabel Rincian Kasus -->
        <section class="laporan-table-card">
            <div class="table-responsive">
                <table class="laporan-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">No</th>
                            <th>Sumber Pelapor</th>
                            <th>Jenis Kejahatan</th>
                            <th>Waktu Kejadian</th>
                            <th>Keterangan / Kronologi Singkat</th>
                            <th style="text-align: right; width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        if ($result_laporan && $result_laporan->num_rows > 0) {
                            $no = 1;
                            while ($row_laporan = $result_laporan->fetch_assoc()) {
                                $isSystem = $row_laporan['pelapor'] === 'sistem';
                                $pelaporLabel = $isSystem ? 'Sistem CCTV' : 'Masyarakat';
                                $pelaporClass = $isSystem ? 'system' : 'user';
                                $pelaporIcon = $isSystem ? 'uil-robot' : 'uil-user';
                                $idLaporan = (int)$row_laporan['id'];
                                $keterangan = htmlspecialchars((string)($row_laporan['keterangan'] ?? '-'), ENT_QUOTES, 'UTF-8');
                                $jenis = htmlspecialchars((string)$row_laporan['jenis_kejahatan'], ENT_QUOTES, 'UTF-8');
                                $waktuFormatted = date('d M Y', strtotime($row_laporan['waktu'])) . ' &bull; ' . date('H:i', strtotime($row_laporan['waktu']));

                                echo "<tr onclick=\"window.location.href='detailLaporan.php?id=$idLaporan'\">";
                                echo "<td><span class='rank-badge'>$no</span></td>";
                                echo "<td><span class='badge-pelapor $pelaporClass'><i class='uil $pelaporIcon'></i> $pelaporLabel</span></td>";
                                echo "<td><span class='badge-jenis'><i class='uil uil-tag-alt'></i> $jenis</span></td>";
                                echo "<td><span class='waktu-text'><i class='uil uil-clock'></i> $waktuFormatted WIB</span></td>";
                                echo "<td><span style='color: #4b3d5b;'>" . (strlen($keterangan) > 75 ? substr($keterangan, 0, 75) . '...' : $keterangan) . "</span></td>";
                                echo "<td style='text-align: right;'><span class='btn-detail'>Detail <i class='uil uil-arrow-right'></i></span></td>";
                                echo "</tr>";
                                $no++;
                            }
                        } else {
                            echo "<tr><td colspan='6' style='text-align: center; padding: 32px; color: #766986;'>Tidak ada laporan kejahatan untuk lokasi ini pada periode yang dipilih.</td></tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</body>
</html>
