<?php
require_once __DIR__ . '/groqHelper.php';
include __DIR__ . '/../php/koneksi.php';

// Ambil nilai bulan dari form
$bulanInt = getSelectedMonth();
$bulanLabel = $bulanInt !== null ? str_pad((string)$bulanInt, 2, '0', STR_PAD_LEFT) : '00';

// Periksa apakah sudah ada hasil analisis AI yang tersimpan di cache (TTL 6 jam)
$cacheDir = __DIR__ . '/../cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}
$cacheFile = $cacheDir . '/laporan_mitigasi_' . $bulanLabel . '.json';
$cacheTtl = 21600; // 6 jam (data 2023 adalah data historis)

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (!empty($cached['content'])) {
        $content = $cached['content'];
        return;
    }
}

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

// Memproses data menjadi format yang ringkas agar hemat token
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'tempat' => $row['nama_tempat'],
        'waktu' => date('d-m-Y H:i', strtotime($row['waktu'])),
        'jenis' => $row['nama_jenis'],
        'ket' => mb_substr((string)$row['keterangan'], 0, 80)
    ];
}

// Menutup koneksi database
$conn->close();

// Data yang diambil dari database
$dataJson = json_encode($data);
$bulanText = $bulanInt !== null ? "bulan ke-$bulanInt tahun 2023" : "tahun 2023";
$prompt = "Berikut sampel 10 laporan kejahatan $bulanText di DIY: $dataJson. Berikan ringkasan singkat dinamika kejahatan pada periode ini dan berikan 3-4 rekomendasi mitigasi keamanan konkret bagi aparat/warga dalam format poin yang jelas dalam bahasa Indonesia.";
$fallback = "Ringkasan analitik AI sedang dalam antrean pemrosesan. Anda dapat menggunakan tabel data di bawah untuk melihat rincian lokasi kejadian, variasi kejahatan, dan tren kasus di wilayah DIY.";

$content = getGroqCompletion($prompt, $fallback);

// Simpan ke cache bila berhasil mendapatkan respons valid dari AI
if ($content && !str_contains($content, 'tidak dapat dimuat') && !str_contains($content, 'mencapai batas kuota') && !str_contains($content, 'belum tersedia')) {
    @file_put_contents($cacheFile, json_encode([
        'content' => $content,
        'created_at' => time()
    ]));
} elseif (file_exists($cacheFile)) {
    // Jika panggilan Groq terkena limit namun ada file cache sebelumnya, gunakan cache tersebut
    $stale = json_decode(file_get_contents($cacheFile), true);
    if (!empty($stale['content'])) {
        $content = $stale['content'];
    }
}
?>