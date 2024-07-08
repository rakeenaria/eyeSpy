<?php
include "koneksi.php";

// Ambil ID tempat dari URL
$id_tempat = isset($_GET['id']) ? $_GET['id'] : 0;

// Ambil nilai bulan dari URL, default ke '00' untuk semua bulan
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';

// Ambil nama tempat berdasarkan ID
$sql_tempat = "SELECT nama_tempat FROM tempat WHERE id_tempat = $id_tempat";
$result_tempat = $conn->query($sql_tempat);
if ($result_tempat->num_rows > 0) {
    $row_tempat = $result_tempat->fetch_assoc();
    $nama_tempat = $row_tempat['nama_tempat'];
} else {
    echo "Tempat tidak ditemukan.";
    exit;
}

// Ambil laporan kejadian berdasarkan ID tempat dan filter bulan
$sql_laporan = "
SELECT lk.id, lk.pelapor, jk.nama_jenis as jenis_kejahatan, t.nama_tempat, lk.waktu
FROM laporan_kejahatan lk
JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
WHERE lk.tempat_kejadian = $id_tempat
" . ($bulan !== '00' ? "AND MONTH(lk.waktu) = $bulan" : "") . "
ORDER BY lk.waktu DESC
";
$result_laporan = $conn->query($sql_laporan);
?>