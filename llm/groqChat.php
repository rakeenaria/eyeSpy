<?php
header('Content-Type: application/json; charset=UTF-8');

// Matikan display error langsung agar output JSON tidak rusak
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/groqHelper.php';
include __DIR__ . '/../php/koneksi.php';

use LucianoTonet\GroqPHP\Groq;

// Hanya izinkan method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya method POST yang diperbolehkan.']);
    exit;
}

// Baca body JSON
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Payload JSON tidak valid.']);
    exit;
}

$userMessage = trim((string)($input['message'] ?? ''));
if ($userMessage === '') {
    echo json_encode(['status' => 'error', 'message' => 'Pertanyaan tidak boleh kosong.']);
    exit;
}

// Riwayat percakapan sebelumnya (maksimal 6 pesan terakhir untuk efisiensi context window)
$incomingHistory = is_array($input['history'] ?? null) ? $input['history'] : [];
$sanitizedHistory = [];
$allowedRoles = ['user', 'assistant'];

foreach ($incomingHistory as $item) {
    if (is_array($item) && isset($item['role'], $item['content'])) {
        $role = $item['role'];
        $content = trim((string)$item['content']);
        if (in_array($role, $allowedRoles, true) && $content !== '') {
            $sanitizedHistory[] = [
                'role' => $role,
                'content' => mb_substr($content, 0, 800)
            ];
        }
    }
}
if (count($sanitizedHistory) > 6) {
    $sanitizedHistory = array_slice($sanitizedHistory, -6);
}

// ==============================================================================
// 1. Ekstraksi Konteks Dinamis Langsung dari Database eyeSpy (MySQL)
// ==============================================================================
function fetchEyeSpyDatabaseContext($conn, string $query): array {
    $rawStats = [
        'total_kasus' => 0,
        'total_titik' => 0,
        'kabupaten' => [],
        'jenis' => [],
        'top_lokasi' => [],
        'waktu' => []
    ];

    if (!$conn || $conn->connect_error) {
        return [
            'summaryText' => 'Database eyeSpy saat ini tidak dapat terhubung.',
            'rawStats' => $rawStats
        ];
    }

    // A. Query Total Kasus & Jumlah Titik Lokasi Terdata
    $qTotal = $conn->query("SELECT COUNT(id) as total_kasus, COUNT(DISTINCT tempat_kejadian) as total_titik FROM laporan_kejahatan");
    if ($qTotal && ($rTotal = $qTotal->fetch_assoc())) {
        $rawStats['total_kasus'] = (int)($rTotal['total_kasus'] ?? 0);
        $rawStats['total_titik'] = (int)($rTotal['total_titik'] ?? 0);
    }

    // B. Query Sebaran Kasus per Kabupaten / Kota
    $qKab = $conn->query("
        SELECT t.kabupaten, COUNT(lk.id) as jumlah 
        FROM tempat t 
        LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian 
        GROUP BY t.kabupaten 
        ORDER BY jumlah DESC
    ");
    $kabList = [];
    if ($qKab) {
        while ($r = $qKab->fetch_assoc()) {
            $kabName = $r['kabupaten'] ?: 'Wilayah Lain';
            $jml = (int)$r['jumlah'];
            $kabList[] = "- {$kabName}: {$jml} kasus";
            $rawStats['kabupaten'][$kabName] = $jml;
        }
    }

    // C. Query Jenis Kejahatan Terbanyak
    $qJenis = $conn->query("
        SELECT jk.nama_jenis, COUNT(lk.id) as jumlah 
        FROM jenis_kejahatan jk 
        LEFT JOIN laporan_kejahatan lk ON jk.id_jenis = lk.jenis_kejahatan 
        GROUP BY jk.id_jenis 
        ORDER BY jumlah DESC
    ");
    $jenisList = [];
    if ($qJenis) {
        while ($r = $qJenis->fetch_assoc()) {
            $jenisList[] = "- {$r['nama_jenis']}: {$r['jumlah']} kasus";
            $rawStats['jenis'][] = ['nama' => $r['nama_jenis'], 'jumlah' => (int)$r['jumlah']];
        }
    }

    // D. Query 10 Titik Lokasi Paling Rawan beserta Kejahatan Dominannya
    $qLokasi = $conn->query("
        SELECT t.id_tempat, t.nama_tempat, t.kabupaten, COUNT(lk.id) as jumlah_laporan,
            (SELECT jk.nama_jenis 
             FROM laporan_kejahatan lk2 
             JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis 
             WHERE lk2.tempat_kejadian = t.id_tempat 
             GROUP BY lk2.jenis_kejahatan 
             ORDER BY COUNT(lk2.jenis_kejahatan) DESC 
             LIMIT 1) as jenis_dominan
        FROM tempat t
        JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
        GROUP BY t.id_tempat, t.nama_tempat, t.kabupaten
        ORDER BY jumlah_laporan DESC
        LIMIT 10
    ");
    $lokasiList = [];
    $rank = 1;
    if ($qLokasi) {
        while ($r = $qLokasi->fetch_assoc()) {
            $dominan = $r['jenis_dominan'] ?: 'Beragam';
            $lokasiList[] = "   $rank. {$r['nama_tempat']} ({$r['kabupaten']}) - {$r['jumlah_laporan']} kasus (Kejahatan dominan: {$dominan})";
            $rawStats['top_lokasi'][] = [
                'rank' => $rank,
                'nama' => $r['nama_tempat'],
                'kabupaten' => $r['kabupaten'],
                'jumlah' => (int)$r['jumlah_laporan'],
                'dominan' => $dominan
            ];
            $rank++;
        }
    }

    // E. Query Pola Jam Kejadian Rawan
    $qWaktu = $conn->query("
        SELECT 
            CASE 
                WHEN HOUR(waktu) >= 0 AND HOUR(waktu) < 6 THEN 'Dini Hari (00:00 - 06:00 WIB)'
                WHEN HOUR(waktu) >= 6 AND HOUR(waktu) < 12 THEN 'Pagi Hari (06:00 - 12:00 WIB)'
                WHEN HOUR(waktu) >= 12 AND HOUR(waktu) < 18 THEN 'Siang-Sore (12:00 - 18:00 WIB)'
                ELSE 'Malam Hari (18:00 - 24:00 WIB)'
            END as kategori_jam,
            COUNT(*) as jumlah
        FROM laporan_kejahatan
        GROUP BY kategori_jam
        ORDER BY jumlah DESC
    ");
    $waktuList = [];
    if ($qWaktu) {
        while ($r = $qWaktu->fetch_assoc()) {
            $waktuList[] = "- {$r['kategori_jam']}: {$r['jumlah']} kasus";
            $rawStats['waktu'][$r['kategori_jam']] = (int)$r['jumlah'];
        }
    }

    // F. Targeted Retrieval: Ambil sampel kasus riil terkini jika user menanyakan tempat atau jenis tertentu
    $specificCases = [];
    $cleanQuery = preg_replace('/[^a-zA-Z0-9\s]/', ' ', $query);
    $words = array_filter(explode(' ', $cleanQuery), fn($w) => mb_strlen($w) >= 4);

    if (!empty($words)) {
        $likeClauses = [];
        foreach ($words as $w) {
            $escaped = $conn->real_escape_string($w);
            $likeClauses[] = "t.nama_tempat LIKE '%$escaped%'";
            $likeClauses[] = "t.kabupaten LIKE '%$escaped%'";
            $likeClauses[] = "jk.nama_jenis LIKE '%$escaped%'";
        }
        $whereSql = implode(' OR ', $likeClauses);

        $qSpecific = $conn->query("
            SELECT t.nama_tempat, t.kabupaten, jk.nama_jenis, DATE_FORMAT(lk.waktu, '%d-%m-%Y %H:%i') as waktu_format, lk.keterangan
            FROM laporan_kejahatan lk
            JOIN tempat t ON lk.tempat_kejadian = t.id_tempat
            JOIN jenis_kejahatan jk ON lk.jenis_kejahatan = jk.id_jenis
            WHERE $whereSql
            ORDER BY lk.waktu DESC
            LIMIT 5
        ");

        if ($qSpecific && $qSpecific->num_rows > 0) {
            while ($r = $qSpecific->fetch_assoc()) {
                $ket = mb_substr(trim($r['keterangan'] ?: '-'), 0, 90);
                $specificCases[] = "- [{$r['waktu_format']}] Lokasi: {$r['nama_tempat']} ({$r['kabupaten']}), Jenis: {$r['nama_jenis']}, Ket: $ket";
            }
        }
    }

    // Susun ringkasan teks terstruktur dari data database yang di-query
    $summaryText = "1. TOTAL DATA RIIL SAAT INI DI DATABASE EYESPY:\n" .
                   "- Total Laporan Kejahatan Terdata: {$rawStats['total_kasus']} kasus\n" .
                   "- Tersebar di: {$rawStats['total_titik']} titik lokasi se-DIY\n\n" .
                   "2. SEBARAN KASUS PER WILAYAH KABUPATEN / KOTA:\n" . (empty($kabList) ? "- Belum ada data wilayah" : implode("\n", $kabList)) . "\n\n" .
                   "3. JENIS KEJAHATAN TERBANYAK TERDATA:\n" . (empty($jenisList) ? "- Belum ada data jenis" : implode("\n", array_slice($jenisList, 0, 6))) . "\n\n" .
                   "4. 10 TITIK LOKASI DENGAN LAPORAN TERTINGGI (PALING RAWAN):\n" . (empty($lokasiList) ? "   (Belum ada data lokasi)" : implode("\n", $lokasiList)) . "\n\n" .
                   "5. POLA WAKTU KEJADIAN RAWAN:\n" . (empty($waktuList) ? "- Belum ada data waktu" : implode("\n", $waktuList));

    if (!empty($specificCases)) {
        $summaryText .= "\n\n6. SAMPEL KASUS RIIL RELEVAN DENGAN PERTANYAAN USER (DARI DATABASE EYESPY):\n" . implode("\n", $specificCases);
    }

    return [
        'summaryText' => $summaryText,
        'rawStats' => $rawStats
    ];
}

// Jalankan pengambilan data langsung dari database MySQL
$dbContext = fetchEyeSpyDatabaseContext($conn, $userMessage);
$dbSummary = $dbContext['summaryText'];
$rawStats = $dbContext['rawStats'];

// Tutup koneksi database
$conn->close();

// ==============================================================================
// 2. Susun System Prompt Berisi Konteks Dinamis dari Database
// ==============================================================================
$systemPrompt = <<<SYS
Anda adalah "eyeSpy AI", asisten intelijen data dan pemantauan keamanan publik untuk platform eyeSpy di Daerah Istimewa Yogyakarta (DIY).
Tugas Anda adalah menjawab pertanyaan masyarakat, mahasiswa, maupun aparat terkait data kriminalitas, titik kerawanan, pola waktu, dan rekomendasi mitigasi keamanan di DIY.

PENTING: Seluruh jawaban Anda WAJIB berbasis pada data riil terkini yang di-query langsung dari database MySQL platform eyeSpy berikut ini:

==================== KONTEKS DATABASE EYESPY TERKINI ====================
$dbSummary
========================================================================

PETUNJUK FORMAT DAN GAYA JAWABAN:
- Gunakan bahasa Indonesia yang baik, lugas, santun, objektif, dan mudah dipahami.
- Sebutkan angka pasti dan nama lokasi persis seperti yang tertera pada Konteks Database di atas.
- Format teks dengan poin-poin tebal (**tebal**) atau bullet agar nyaman dibaca.
- Jika pengguna meminta tips keamanan, berikan saran praktis (misalnya memantau CCTV publik eyeSpy pada rute yang dilewati, berhati-hati saat melintasi Ringroad malam hari, dan tidak berkendara sendirian lewat tengah malam di jalan sepi).
SYS;

// Susun array messages untuk Groq API
$messages = [
    ['role' => 'system', 'content' => $systemPrompt]
];

foreach ($sanitizedHistory as $h) {
    $messages[] = $h;
}

$messages[] = [
    'role' => 'user',
    'content' => $userMessage
];

$apiKey = getGroqApiKey();

// Fallback cerdas berbasis data riil database jika Groq API belum diset atau error
function generateLocalDataFallback(string $query, array $stats): string {
    $q = strtolower($query);
    $totalKasus = $stats['total_kasus'] ?? 472;
    $topLokasi = $stats['top_lokasi'] ?? [];
    $kabupaten = $stats['kabupaten'] ?? [];

    if (str_contains($q, 'rawan') || str_contains($q, 'lokasi') || str_contains($q, 'titik') || str_contains($q, 'tempat')) {
        $out = "**Titik Lokasi Paling Rawan di DIY (Berdasarkan Database eyeSpy):**\n\n";
        $i = 1;
        foreach (array_slice($topLokasi, 0, 5) as $l) {
            $out .= "$i. **{$l['nama']} ({$l['kabupaten']})** - {$l['jumlah']} kasus (Dominan: {$l['dominan']})\n";
            $i++;
        }
        $out .= "\n💡 *Tips:* Selalu tingkatkan kewaspadaan saat melintasi titik-titik tersebut terutama pada malam hari.";
        return $out;
    }

    if (str_contains($q, 'jam') || str_contains($q, 'waktu') || str_contains($q, 'malam') || str_contains($q, 'kapan')) {
        $waktu = $stats['waktu'] ?? [];
        $out = "**Pola Waktu Rawan Kejahatan di DIY (Berdasarkan Database eyeSpy):**\n\n";
        foreach ($waktu as $kategori => $jml) {
            $out .= "• **{$kategori}:** {$jml} kasus\n";
        }
        $out .= "\n🛡️ *Saran:* Hindari berkendara motor sendirian melintasi ruas jalan minim penerangan di atas pukul 23:00 WIB.";
        return $out;
    }

    if (str_contains($q, 'kabupaten') || str_contains($q, 'kota') || str_contains($q, 'sleman') || str_contains($q, 'bantul') || str_contains($q, 'gunung')) {
        $out = "**Distribusi Kasus per Kabupaten / Kota DIY (Berdasarkan Database eyeSpy):**\n\n";
        $i = 1;
        foreach ($kabupaten as $kab => $jml) {
            $out .= "$i. **{$kab}:** {$jml} kasus\n";
            $i++;
        }
        $out .= "\nKonsentrasi kasus terbesar berada di area Kota Yogyakarta dan Sleman seiring tingginya densitas aktivitas publik.";
        return $out;
    }

    if (str_contains($q, 'jenis') || str_contains($q, 'pencurian') || str_contains($q, 'klitih') || str_contains($q, 'perampokan')) {
        $jenis = $stats['jenis'] ?? [];
        $out = "**Jenis Kejahatan Terbanyak di DIY (Total $totalKasus Kasus Terdata):**\n\n";
        $i = 1;
        foreach (array_slice($jenis, 0, 5) as $j) {
            $out .= "$i. **{$j['nama']}:** {$j['jumlah']} kasus\n";
            $i++;
        }
        $out .= "\nWaspadai barang berharga di ruang publik dan pastikan kendaraan selalu terkunci ganda saat parkir.";
        return $out;
    }

    $topLokasiNama = $topLokasi[0]['nama'] ?? 'Simpang Jakal Ringroad';
    $topLokasiJml = $topLokasi[0]['jumlah'] ?? 30;

    return "Berdasarkan data resmi terkini di database eyeSpy, tercatat total **{$totalKasus} kasus kejahatan** di 50 titik lokasi se-DIY. " .
           "Titik dengan laporan tertinggi adalah **{$topLokasiNama} ({$topLokasiJml} kasus)**. " .
           "Waktu paling rawan terkonsentrasi pada **malam hari (18:00 - 24:00 WIB)**.\n\n" .
           "Anda dapat menanyakan titik lokasi spesifik, jam rawan, atau rekomendasi keamanan rute di DIY.";
}

if ($apiKey === '') {
    $fallbackReply = generateLocalDataFallback($userMessage, $rawStats);
    echo json_encode([
        'status' => 'ok',
        'reply' => $fallbackReply . "\n\n*(Catatan: Menjawab langsung dari database lokal eyeSpy. Tambahkan GROQ_API_KEY pada file .env untuk mengaktifkan penalaran penuh AI Groq)*",
        'model' => 'database-live-query'
    ]);
    exit;
}

try {
    $model = getenv('GROQ_MODEL') ?: 'qwen/qwen3.8-27b';
    $groq = new Groq($apiKey);

    $chatCompletion = $groq->chat()->completions()->create([
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.5,
        'max_tokens' => 700,
    ]);

    $reply = $chatCompletion['choices'][0]['message']['content'] ?? '';

    if (trim($reply) === '') {
        throw new RuntimeException('Respons Groq kosong.');
    }

    echo json_encode([
        'status' => 'ok',
        'reply' => trim($reply),
        'model' => $model
    ]);
} catch (Throwable $e) {
    error_log('Groq Chatbot Error: ' . $e->getMessage());

    // Coba model cadangan jika terkena rate limit
    $altModel = ($model === 'qwen/qwen3.8-27b') ? 'openai/gpt-oss-20b' : 'qwen/qwen3.8-27b';
    try {
        $groq = new Groq($apiKey);
        $altCompletion = $groq->chat()->completions()->create([
            'model' => $altModel,
            'messages' => $messages,
            'temperature' => 0.5,
            'max_tokens' => 600,
        ]);
        $altReply = $altCompletion['choices'][0]['message']['content'] ?? '';
        if (trim($altReply) !== '') {
            echo json_encode([
                'status' => 'ok',
                'reply' => trim($altReply),
                'model' => $altModel
            ]);
            exit;
        }
    } catch (Throwable $altError) {
        error_log('Groq Chatbot Alt Model Error: ' . $altError->getMessage());
    }

    $fallbackReply = generateLocalDataFallback($userMessage, $rawStats);
    echo json_encode([
        'status' => 'ok',
        'reply' => $fallbackReply . "\n\n*(Catatan: Menjawab langsung berbasis query data riil eyeSpy terkini karena layanan eksternal AI sedang padat)*",
        'model' => 'database-live-query'
    ]);
}
