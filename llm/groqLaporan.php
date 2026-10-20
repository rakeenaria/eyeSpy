<?php
require_once __DIR__ . '/groqHelper.php';
include __DIR__ . '/../php/koneksi.php';

// Ambil nilai bulan dari form
$bulanInt = getSelectedMonth();
$filterBulan = $bulanInt !== null ? "WHERE MONTH(lk.waktu) = $bulanInt" : "";

// Modifikasi query SQL untuk memfilter dan mengurutkan berdasarkan waktu terbaru dan membatasi jumlah laporan
$sql = "SELECT t.id_tempat, t.nama_tempat, lk.waktu, jk.nama_jenis, lk.keterangan
        FROM laporan_kejahatan lk
        JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
        JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
        $filterBulan
        ORDER BY lk.waktu DESC
        LIMIT 10"; // Batasi jumlah laporan terbaru yang diambil

$result = $conn->query($sql);

// Memproses data menjadi format yang bisa dibaca Groq
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'nama_tempat' => $row['nama_tempat'],
        'waktu' => $row['waktu'],
        'jenis_kejahatan' => $row['nama_jenis'],
        'keterangan' => $row['keterangan']
    ];
}

// Menutup koneksi database
$conn->close();

// Data yang diambil dari database
$data = json_encode($data);
$prompt = "Berikut adalah data laporan kejahatan di tahun 2023: $data. Berdasarkan data ini, informasikan tentang laporan per-minggu di bulan terakhir. Berikan saran apa yang sebaiknya dilakukan untuk memitigasi hal tersebut. Jelaskan dalam bahasa indonesia secara singkat.";
$fallback = "Ringkasan AI belum tersedia. Gunakan tabel laporan di bawah untuk melihat lokasi, jumlah laporan, variasi kejahatan, dan jenis kejahatan terbanyak.";

$content = getGroqCompletion($prompt, $fallback);
?>
