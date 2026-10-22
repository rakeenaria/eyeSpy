<?php
include "koneksi.php";

// Ambil ID tempat dari URL secara aman
$id_tempat = isset($_GET['id']) ? (int)$_GET['id'] : 0;

// Ambil nilai bulan dari URL, default ke '00' untuk semua bulan
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';
$bulanInt = ctype_digit((string)$bulan) ? (int)$bulan : 0;
$filterBulan = ($bulanInt >= 1 && $bulanInt <= 12) ? "AND MONTH(lk.waktu) = $bulanInt" : "";

// Ambil nama tempat dan kabupaten berdasarkan ID
$sql_tempat = "SELECT nama_tempat, kabupaten FROM tempat WHERE id_tempat = $id_tempat";
$result_tempat = $conn->query($sql_tempat);
if ($result_tempat && $result_tempat->num_rows > 0) {
    $row_tempat = $result_tempat->fetch_assoc();
    $nama_tempat = $row_tempat['nama_tempat'];
    $kabupaten_tempat = $row_tempat['kabupaten'];
} else {
    $nama_tempat = "Tempat Tidak Ditemukan";
    $kabupaten_tempat = "";
}

// Ambil laporan kejadian berdasarkan ID tempat dan filter bulan
$sql_laporan = "
SELECT lk.id, lk.pelapor, jk.nama_jenis as jenis_kejahatan, t.nama_tempat, lk.waktu, lk.keterangan
FROM laporan_kejahatan lk
JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
WHERE lk.tempat_kejadian = $id_tempat
$filterBulan
ORDER BY lk.waktu DESC
";
$result_laporan = $conn->query($sql_laporan);
?>
