<?php
include "koneksi.php";

// Ambil ID laporan dari URL
$id_laporan = isset($_GET['id']) ? $_GET['id'] : 0;

// Ambil detail laporan berdasarkan ID
$sql_laporan = "
SELECT lk.pelapor, jk.nama_jenis as jenis_kejahatan, t.nama_tempat, lk.waktu, lk.keterangan
FROM laporan_kejahatan lk
JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
WHERE lk.id = $id_laporan
";
$result_laporan = $conn->query($sql_laporan);

if ($result_laporan->num_rows > 0) {
    $row_laporan = $result_laporan->fetch_assoc();
} else {
    echo "Laporan tidak ditemukan.";
    exit;
}
?>