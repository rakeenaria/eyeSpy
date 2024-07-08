<?php
require 'vendor/autoload.php';

include "php/koneksi.php";

// Ambil nilai bulan dari form
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';

// Modifikasi query SQL untuk memfilter dan mengurutkan berdasarkan jumlah laporan terbanyak
$sql = "SELECT t.id_tempat, t.nama_tempat, COUNT(lk.id) as jumlah_laporan, COUNT(DISTINCT lk.jenis_kejahatan) as variasi_kejahatan, 
    (SELECT jk.nama_jenis 
    FROM laporan_kejahatan lk2 
    JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis 
    WHERE lk2.tempat_kejadian = t.id_tempat 
    " . ($bulan !== '00' ? "AND MONTH(lk2.waktu) = $bulan" : "") . "
    GROUP BY lk2.jenis_kejahatan 
    ORDER BY COUNT(lk2.jenis_kejahatan) DESC 
    LIMIT 1) as jenis_kejahatan_terbanyak
    FROM tempat t
LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
" . ($bulan !== '00' ? "WHERE MONTH(lk.waktu) = $bulan" : "") . "
GROUP BY t.id_tempat, t.nama_tempat
ORDER BY jumlah_laporan DESC";

$result = $conn->query($sql);

// Memproses data menjadi format yang bisa dibaca Groq
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'nama_tempat' => $row['nama_tempat'],
        'jumlah_laporan' => $row['jumlah_laporan'],
        'bulan' => $bulan
    ];
}

// Menutup koneksi database
$conn->close();

use LucianoTonet\GroqPHP\Groq;

// Inisialisasi Groq dengan API key
$groq = new Groq('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');

// Data yang diambil dari database
$data = json_encode($data);

$chatCompletion = $groq->chat()->completions()->create([
  'model'    => 'llama3-8b-8192',
  'messages' => [
    [
      'role'    => 'user',
      'content' => "Berikut adalah data jumlah laporan kejahatan per bulan di tahun 2023: $data. Berdasarkan data ini, berikan prediksi jumlah total laporan yang akan terjadi tiap bulan  dari januari sampai desember di tahun 2024. Jumlah laporan kira-kira sekitar 20-60 per-bulannya. Sebutkan saja perbulannya dalam bahasa indonesia secara singkat."
    ],
  ]
]);

$content = $chatCompletion['choices'][0]['message']['content'];
$content = str_replace('*', '<br>', $content);
?>
