<?php
require_once __DIR__ . '/koneksi.php';

// 1. Total Kasus Kejahatan
$sqlTotal = "SELECT COUNT(*) as total FROM laporan_kejahatan";
$resTotal = $conn->query($sqlTotal);
$totalKasus = ($resTotal && $row = $resTotal->fetch_assoc()) ? (int)$row['total'] : 0;

// 2. Total Titik Lokasi Terdata
$sqlLokasi = "SELECT COUNT(*) as total FROM tempat";
$resLokasi = $conn->query($sqlLokasi);
$totalLokasi = ($resLokasi && $row = $resLokasi->fetch_assoc()) ? (int)$row['total'] : 0;

// 3. Sumber Pelapor (Masyarakat vs Sistem CCTV)
$sqlPelapor = "SELECT pelapor, COUNT(*) as jumlah FROM laporan_kejahatan GROUP BY pelapor";
$resPelapor = $conn->query($sqlPelapor);
$laporanPengguna = 0;
$laporanSistem = 0;
while ($row = $resPelapor->fetch_assoc()) {
    if ($row['pelapor'] === 'pengguna') {
        $laporanPengguna = (int)$row['jumlah'];
    } elseif ($row['pelapor'] === 'sistem') {
        $laporanSistem = (int)$row['jumlah'];
    }
}

// 4. Data Tren Bulanan (Januari - Desember)
$sqlLine = "SELECT MONTH(waktu) as bulan, COUNT(*) as jumlah FROM laporan_kejahatan GROUP BY MONTH(waktu) ORDER BY bulan ASC";
$resultLine = $conn->query($sqlLine);
$lineData = array_fill(0, 12, 0);
while ($row = $resultLine->fetch_assoc()) {
    $lineData[$row['bulan'] - 1] = (int)$row['jumlah'];
}

// Hitung Statistik Tren Bulanan
$namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
$bulanMaxVal = max($lineData);
$bulanMaxIdx = array_search($bulanMaxVal, $lineData);
$bulanPuncakNama = $namaBulan[$bulanMaxIdx] ?? 'Januari';

$lineDataFiltered = array_filter($lineData, fn($val) => $val > 0);
$bulanMinVal = !empty($lineDataFiltered) ? min($lineDataFiltered) : 0;
$bulanMinIdx = array_search($bulanMinVal, $lineData);
$bulanTerendahNama = $namaBulan[$bulanMinIdx] ?? 'November';

$rataRataBulanan = round($totalKasus / 12, 1);

// 5. Distribusi Kasus Berdasarkan Kabupaten / Kota di DIY
$sqlKabupaten = "
    SELECT t.kabupaten, COUNT(lk.id) as jumlah 
    FROM tempat t 
    LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian 
    GROUP BY t.kabupaten 
    ORDER BY jumlah DESC";
$resKabupaten = $conn->query($sqlKabupaten);

$kabupatenLabels = [];
$kabupatenData = [];
$topKabupatenNama = 'Yogyakarta';
$topKabupatenKasus = 0;

while ($row = $resKabupaten->fetch_assoc()) {
    $kab = $row['kabupaten'] ?: 'Lainnya';
    $jml = (int)$row['jumlah'];
    $kabupatenLabels[] = $kab;
    $kabupatenData[] = $jml;
    if ($jml > $topKabupatenKasus) {
        $topKabupatenKasus = $jml;
        $topKabupatenNama = $kab;
    }
}
$topKabupatenPersen = $totalKasus > 0 ? round(($topKabupatenKasus / $totalKasus) * 100, 1) : 0;

// 6. Distribusi Berdasarkan Semua Jenis Kejahatan (9 Kategori Lengkap)
$sqlJenis = "
    SELECT jk.nama_jenis, COUNT(lk.id) as jumlah 
    FROM jenis_kejahatan jk 
    LEFT JOIN laporan_kejahatan lk ON jk.id_jenis = lk.jenis_kejahatan 
    GROUP BY jk.id_jenis, jk.nama_jenis 
    ORDER BY jumlah DESC";
$resJenis = $conn->query($sqlJenis);

$jenisLabels = [];
$jenisData = [];
$topJenisNama = '-';
$topJenisKasus = 0;

while ($row = $resJenis->fetch_assoc()) {
    $nama = $row['nama_jenis'];
    $jml = (int)$row['jumlah'];
    $jenisLabels[] = $nama;
    $jenisData[] = $jml;
    if ($jml > $topJenisKasus) {
        $topJenisKasus = $jml;
        $topJenisNama = $nama;
    }
}

// 7. Distribusi Berdasarkan Waktu Kejadian (Kapan Kejahatan Sering Terjadi di DIY?)
$sqlWaktu = "
    SELECT 
      CASE 
        WHEN HOUR(waktu) BETWEEN 0 AND 5 THEN 'Dini Hari (00:00 - 05:59)'
        WHEN HOUR(waktu) BETWEEN 6 AND 11 THEN 'Pagi (06:00 - 11:59)'
        WHEN HOUR(waktu) BETWEEN 12 AND 17 THEN 'Siang-Sore (12:00 - 17:59)'
        ELSE 'Malam (18:00 - 23:59)'
      END AS waktu_kategori,
      COUNT(*) as jumlah
    FROM laporan_kejahatan
    GROUP BY waktu_kategori
    ORDER BY FIELD(waktu_kategori, 'Dini Hari (00:00 - 05:59)', 'Pagi (06:00 - 11:59)', 'Siang-Sore (12:00 - 17:59)', 'Malam (18:00 - 23:59)')";
$resWaktu = $conn->query($sqlWaktu);

$waktuLabels = [];
$waktuData = [];
$waktuRawanNama = 'Malam';
$waktuRawanKasus = 0;

while ($row = $resWaktu->fetch_assoc()) {
    $kat = $row['waktu_kategori'];
    $jml = (int)$row['jumlah'];
    $waktuLabels[] = $kat;
    $waktuData[] = $jml;
    if ($jml > $waktuRawanKasus) {
        $waktuRawanKasus = $jml;
        $waktuRawanNama = $kat;
    }
}

// 8. Top 5 Titik Hotspot Rawan Kriminalitas di DIY
$sqlHotspots = "
    SELECT t.id_tempat, t.nama_tempat, t.kabupaten, COUNT(lk.id) as total_kasus,
           (SELECT jk.nama_jenis 
            FROM laporan_kejahatan lk2 
            JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis 
            WHERE lk2.tempat_kejadian = t.id_tempat 
            GROUP BY lk2.jenis_kejahatan 
            ORDER BY COUNT(*) DESC 
            LIMIT 1) as jenis_dominan
    FROM tempat t
    JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
    GROUP BY t.id_tempat, t.nama_tempat, t.kabupaten
    ORDER BY total_kasus DESC
    LIMIT 5";
$resHotspots = $conn->query($sqlHotspots);
$topHotspots = [];
if ($resHotspots) {
    while ($row = $resHotspots->fetch_assoc()) {
        $topHotspots[] = $row;
    }
}
$topHotspotNama = !empty($topHotspots) ? $topHotspots[0]['nama_tempat'] : '-';
$topHotspotKasus = !empty($topHotspots) ? $topHotspots[0]['total_kasus'] : 0;

// Variabel kompatibilitas backward jika dibutuhkan
$pieData = $kabupatenData;
$pieLabels = $kabupatenLabels;
$pollPieData = $jenisData;
$pollPieLabels = $jenisLabels;

$conn->close();
?>
