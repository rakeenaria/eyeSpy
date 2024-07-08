<?php
require 'vendor/autoload.php';

include "php/koneksi.php";

// Ambil nilai bulan dari form
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';

// Modifikasi query SQL untuk memfilter dan mengurutkan berdasarkan waktu terbaru dan membatasi jumlah laporan
$sql = "SELECT t.id_tempat, t.nama_tempat, lk.waktu, jk.nama_jenis, lk.keterangan
        FROM laporan_kejahatan lk
        JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
        JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
        " . ($bulan !== '00' ? "WHERE MONTH(lk.waktu) = $bulan" : "") . "
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
      'content' => "Berikut adalah data laporan kejahatan di tahun 2023: $data. Berdasarkan data ini, informasikan tentang laporan seminggu terakhir. Berikan saran apa yang sebaiknya dilakukan untuk memitigasi hal tersebut. Jelaskan dalam bahasa indonesia secara singkat."
    ],
  ]
]);

$content = $chatCompletion['choices'][0]['message']['content'];
$content = str_replace('*', '<br>', $content);
?>
