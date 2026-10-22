<?php
require_once __DIR__ . '/../vendor/autoload.php';

use LucianoTonet\GroqPHP\Groq;

function getSelectedMonth(): ?int
{
    $bulan = $_GET['bulan'] ?? '00';

    if ($bulan === '00' || $bulan === 0 || $bulan === '') {
        return null;
    }

    if (!ctype_digit((string) $bulan)) {
        return null;
    }

    $bulan = (int) $bulan;

    return ($bulan >= 1 && $bulan <= 12) ? $bulan : null;
}

function getSelectedMonthLabel(?int $bulan): string
{
    return $bulan === null ? '00' : str_pad((string) $bulan, 2, '0', STR_PAD_LEFT);
}

function loadEnvFile(string $filePath): void
{
    if (!file_exists($filePath) || !is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            if (!empty($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

function getGroqApiKey(): string
{
    // Coba baca dari file .env atau .env.local jika tersedia
    $envFiles = [
        __DIR__ . '/../.env.local',
        __DIR__ . '/../.env',
    ];

    foreach ($envFiles as $file) {
        if (file_exists($file)) {
            loadEnvFile($file);
            break;
        }
    }

    return trim((string) (
        getenv('GROQ_API_KEY')
        ?: ($_ENV['GROQ_API_KEY'] ?? '')
        ?: ($_SERVER['GROQ_API_KEY'] ?? '')
    ));
}

function formatGroqContent(string $content): string
{
    $content = trim($content);
    $content = str_replace(["\r\n", "\r"], "\n", $content);
    $content = str_replace('*', '', $content);
    $content = preg_replace("/\n{3,}/", "\n\n", $content);

    return str_replace("\n", '<br>', $content);
}

function groqFallback(string $fallback, string $note): string
{
    return formatGroqContent($fallback . "\n\nCatatan: " . $note);
}

function getGroqCompletion(string $prompt, string $fallback): string
{
    $apiKey = getGroqApiKey();

    if ($apiKey === '') {
        return groqFallback($fallback, 'fitur AI belum aktif karena GROQ_API_KEY belum diset. Silakan masukkan API Key pada file .env');
    }

    try {
        $model = getenv('GROQ_MODEL') ?: 'qwen/qwen3.8-27b';
        $groq = new Groq($apiKey);

        $chatCompletion = $groq->chat()->completions()->create([
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
        ]);

        $content = $chatCompletion['choices'][0]['message']['content'] ?? '';

        if (trim($content) === '') {
            throw new RuntimeException('Respons Groq kosong.');
        }

        return formatGroqContent($content);
    } catch (Throwable $error) {
        $msg = $error->getMessage();
        error_log('Groq API error: ' . $msg);

        // Jika model tidak ditemukan atau ditutup, beri pesan spesifik
        if (str_contains($msg, 'does not exist') || str_contains($msg, 'decommissioned')) {
            return groqFallback($fallback, "model '$model' tidak tersedia di Groq. Coba gunakan 'qwen/qwen3.8-27b' atau 'openai/gpt-oss-20b' pada .env.");
        }

        if (str_contains($msg, '401 Unauthorized') || str_contains($msg, 'invalid_api_key')) {
            return groqFallback($fallback, 'API Key Groq tidak valid. Periksa kembali GROQ_API_KEY pada file .env.');
        }

        return groqFallback($fallback, 'respons Groq tidak dapat dimuat (' . htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') . ').');
    }
}
