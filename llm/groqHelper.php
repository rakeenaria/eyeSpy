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

function getGroqApiKey(): string
{
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
        return groqFallback($fallback, 'fitur AI belum aktif karena GROQ_API_KEY belum diset.');
    }

    try {
        $model = getenv('GROQ_MODEL') ?: 'llama-3.3-70b-versatile';
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
        error_log('Groq API error: ' . $error->getMessage());

        return groqFallback($fallback, 'respons Groq tidak dapat dimuat. Periksa GROQ_API_KEY dan koneksi internet.');
    }
}
