<?php
require 'koneksi.php';

// Ambil data untuk grafik line (jumlah kasus per bulan)
$sqlLine = "SELECT MONTH(waktu) as bulan, COUNT(*) as jumlah FROM laporan_kejahatan GROUP BY MONTH(waktu)";
$resultLine = $conn->query($sqlLine);

$lineData = array_fill(0, 12, 0); // Inisialisasi array dengan 12 bulan
while($row = $resultLine->fetch_assoc()) {
    $lineData[$row['bulan'] - 1] = (int)$row['jumlah'];
}

// Ambil data untuk grafik pie (distribusi kasus berdasarkan lokasi)
$sqlPie = "
    SELECT tempat.nama_tempat AS lokasi, COUNT(laporan_kejahatan.id) AS jumlah 
    FROM laporan_kejahatan 
    JOIN tempat ON laporan_kejahatan.tempat_kejadian = tempat.id_tempat 
    GROUP BY tempat.nama_tempat 
    ORDER BY jumlah DESC";
$resultPie = $conn->query($sqlPie);

$pieData = [];
$pieLabels = [];
$otherCount = 0;
$threshold = 5; // Tampilkan hanya 5 lokasi dengan jumlah kasus terbesar

while($row = $resultPie->fetch_assoc()) {
    if (count($pieData) < $threshold) {
        $pieData[] = (int)$row['jumlah'];
        $pieLabels[] = $row['lokasi'];
    } else {
        $otherCount += (int)$row['jumlah'];
    }
}

if ($otherCount > 0) {
    $pieData[] = $otherCount;
    $pieLabels[] = "Lainnya";
}

// Ambil data untuk grafik pie polling jenis kejahatan
$sqlPollPie = "
    SELECT jenis_kejahatan.nama_jenis AS jenis, COUNT(laporan_kejahatan.id) AS jumlah 
    FROM laporan_kejahatan 
    JOIN jenis_kejahatan ON laporan_kejahatan.jenis_kejahatan = jenis_kejahatan.id_jenis 
    GROUP BY jenis_kejahatan.nama_jenis 
    ORDER BY jumlah DESC";
$resultPollPie = $conn->query($sqlPollPie);

$pollPieData = [];
$pollPieLabels = [];
$pollOtherCount = 0;

while($row = $resultPollPie->fetch_assoc()) {
    if (count($pollPieData) < $threshold-1) {
        $pollPieData[] = (int)$row['jumlah'];
        $pollPieLabels[] = $row['jenis'];
    } else {
        $pollOtherCount += (int)$row['jumlah'];
    }
}

if ($pollOtherCount > 0) {
    $pollPieData[] = $pollOtherCount;
    $pollPieLabels[] = "Lainnya";
}

$conn->close();
?>
