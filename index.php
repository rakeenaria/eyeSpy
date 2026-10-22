<?php
require_once __DIR__ . '/php/chart.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Kriminalitas DIY - eyeSpy</title>
    <link rel="stylesheet" href="css/navbar.css?v=<?php echo filemtime(__DIR__ . '/css/navbar.css'); ?>">
    <link rel="stylesheet" href="css/dashboard.css?v=<?php echo filemtime(__DIR__ . '/css/dashboard.css'); ?>">
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/navbar.js?v=<?php echo filemtime(__DIR__ . '/js/navbar.js'); ?>" defer></script>
    <script src="js/chatbot.js?v=<?php echo filemtime(__DIR__ . '/js/chatbot.js'); ?>" defer></script>
    <link rel="icon" href="gambar/icon.png" type="image/png">
</head>
<body>
    <?php include 'php/navbar.php'; ?>

    <main class="dashboard-page">
        <!-- Header -->
        <header class="dashboard-heading">
            <div class="dashboard-heading-text">
                <span class="dashboard-heading-badge"><i class="uil uil-shield-check"></i> Monitoring Kriminalitas DIY</span>
                <h1 class="dashboard-title">Dashboard Analitik Kriminalitas DIY</h1>
                <p class="dashboard-subtitle">Visualisasi komprehensif data kejahatan, pola waktu rawan, dan identifikasi wilayah berisiko di Daerah Istimewa Yogyakarta.</p>
            </div>
            <div class="dashboard-live-pill">
                <span class="live-pulse"></span>
                <span>Basis Data 2023 &bull; Terverifikasi</span>
            </div>
        </header>

        <!-- KPI Metrics Grid (4 Kartu Ringkasan Utama) -->
        <section class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Total Kasus Kejahatan</span>
                    <span class="kpi-value"><?php echo number_format($totalKasus, 0, ',', '.'); ?></span>
                    <span class="kpi-subtext">Tercatat di <?php echo $totalLokasi; ?> titik lokasi DIY</span>
                </div>
                <div class="kpi-icon-box kpi-icon-purple">
                    <i class="uil uil-file-shield-alt"></i>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Wilayah Kasus Tertinggi</span>
                    <span class="kpi-value"><?php echo htmlspecialchars($topKabupatenNama); ?></span>
                    <span class="kpi-subtext"><?php echo $topKabupatenKasus; ?> kasus (<?php echo $topKabupatenPersen; ?>% se-DIY)</span>
                </div>
                <div class="kpi-icon-box kpi-icon-red">
                    <i class="uil uil-map-pin-alt"></i>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Kejahatan Terbanyak</span>
                    <span class="kpi-value"><?php echo htmlspecialchars($topJenisNama); ?></span>
                    <span class="kpi-subtext"><?php echo $topJenisKasus; ?> kasus dilaporkan</span>
                </div>
                <div class="kpi-icon-box kpi-icon-orange">
                    <i class="uil uil-exclamation-triangle"></i>
                </div>
            </div>

            <div class="kpi-card">
                <div class="kpi-info">
                    <span class="kpi-label">Waktu Paling Rawan</span>
                    <span class="kpi-value"><?php echo htmlspecialchars(explode(' (', $waktuRawanNama)[0]); ?></span>
                    <span class="kpi-subtext"><?php echo $waktuRawanKasus; ?> kasus (pukul 18:00 - 24:00)</span>
                </div>
                <div class="kpi-icon-box kpi-icon-blue">
                    <i class="uil uil-moon"></i>
                </div>
            </div>
        </section>

        <!-- Main Row: Tren Kasus Bulanan + AI Forecasting Groq -->
        <section class="dashboard-main-row">
            <!-- Tren Bulanan Line Chart -->
            <article class="dashboard-card trend-card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3>Tren Fluktuasi Kasus Kejahatan Bulanan (2023)</h3>
                        <p>Dinamika jumlah kasus kriminalitas yang terjadi di Yogyakarta tiap bulan sepanjang tahun.</p>
                    </div>
                    <span class="card-chip"><i class="uil uil-calendar-alt"></i> 12 Bulan</span>
                </div>

                <div class="chart-trend-wrap">
                    <canvas id="lineChart"></canvas>
                </div>

                <div class="trend-stat-row">
                    <div class="trend-stat-pill">
                        <span>Bulan Puncak</span>
                        <span><?php echo $bulanPuncakNama; ?> &bull; <?php echo $bulanMaxVal; ?> Kasus</span>
                    </div>
                    <div class="trend-stat-pill">
                        <span>Bulan Terendah</span>
                        <span><?php echo $bulanTerendahNama; ?> &bull; <?php echo $bulanMinVal; ?> Kasus</span>
                    </div>
                    <div class="trend-stat-pill">
                        <span>Rata-Rata Bulanan</span>
                        <span><?php echo $rataRataBulanan; ?> Kasus / Bulan</span>
                    </div>
                </div>
            </article>

            <!-- Chatbot Asisten AI Kejahatan DIY (Ditenagai Groq AI) -->
            <article class="dashboard-card chatbot-card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3><i class="uil uil-comment-dots chatbot-header-icon"></i> Tanya Asisten AI eyeSpy</h3>
                        <p>Tanyakan data kejahatan, titik rawan, jam rawan, atau analisis keamanan DIY.</p>
                    </div>
                    <span class="card-chip ai-chip" title="Ditenagai Model Groq AI">
                        <span class="ai-status-pulse"></span> Groq AI Active
                    </span>
                </div>

                <!-- Chatbot Main Interface -->
                <div class="chatbot-wrapper">
                    <!-- Messages Stream -->
                    <div class="chatbot-messages" id="chatbotMessages" role="log" aria-live="polite">
                        <!-- Initial Welcome Message from Bot -->
                        <div class="chat-msg bot-msg">
                            <div class="chat-avatar bot-avatar">
                                <i class="uil uil-robot"></i>
                            </div>
                            <div class="chat-bubble">
                                <p>Halo! Saya <strong>eyeSpy AI</strong>, asisten pemantauan data kriminalitas DIY. Anda dapat bertanya tentang data kejahatan 2023, lokasi paling rawan, jam rawan, perbandingan antar kabupaten, maupun tips keamanan rute jalan di Yogyakarta.</p>
                                <div class="chat-suggestions">
                                    <span class="suggestion-chip" data-prompt="Di mana titik lokasi paling rawan di DIY?">📍 Titik paling rawan?</span>
                                    <span class="suggestion-chip" data-prompt="Kapan jam-jam paling rawan kejahatan terjadi?">🕒 Jam paling rawan?</span>
                                    <span class="suggestion-chip" data-prompt="Bagaimana perbandingan kasus antara Sleman dan Kota Yogyakarta?">📊 Sleman vs Kota Jogja?</span>
                                    <span class="suggestion-chip" data-prompt="Apa rekomendasi keamanan saat berkendara malam hari di Ringroad?">🛡️ Tips aman malam hari</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div class="chatbot-typing" id="chatbotTyping" style="display: none;">
                        <div class="chat-avatar bot-avatar mini">
                            <i class="uil uil-robot"></i>
                        </div>
                        <div class="typing-bubble">
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-text">eyeSpy AI sedang menganalisis data...</span>
                        </div>
                    </div>

                    <!-- Input Bar -->
                    <form class="chatbot-form" id="chatbotForm" autocomplete="off">
                        <div class="chatbot-input-wrapper">
                            <input 
                                type="text" 
                                id="chatbotInput" 
                                placeholder="Ketik pertanyaan terkait kejahatan DIY... (Tekan Enter)" 
                                maxlength="400"
                                required
                            />
                            <button type="button" class="btn-chat-clear" id="chatbotClearBtn" title="Hapus riwayat chat">
                                <i class="uil uil-trash-alt"></i>
                            </button>
                            <button type="submit" class="btn-chat-send" id="chatbotSendBtn" title="Kirim pertanyaan">
                                <i class="uil uil-message"></i>
                                <span>Kirim</span>
                            </button>
                        </div>
                    </form>
                </div>

                <div class="ai-footer-note">
                    <i class="uil uil-shield-check"></i>
                    <span>Didukung Groq AI &bull; Basis Data Kriminalitas Resmi DIY 2023</span>
                </div>
            </article>
        </section>

        <!-- Secondary Charts Grid (3 Kolom: Kabupaten, Kategori Kejahatan, Waktu Kejadian) -->
        <section class="dashboard-charts-grid">
            <!-- 1. Distribusi per Kabupaten / Kota -->
            <article class="dashboard-card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3>Sebaran Kasus per Kabupaten / Kota</h3>
                        <p>Beban kriminalitas di 4 kabupaten dan 1 kota se-DIY.</p>
                    </div>
                </div>
                <div class="chart-box-wrap">
                    <canvas id="kabupatenChart"></canvas>
                </div>
            </article>

            <!-- 2. Kategori Tindak Kejahatan Lengkap (9 Jenis) -->
            <article class="dashboard-card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3>Kategori Tindak Kejahatan di DIY</h3>
                        <p>Perbandingan 9 jenis tindak pidana yang tercatat.</p>
                    </div>
                </div>
                <div class="chart-box-wrap">
                    <canvas id="crimeTypeChart"></canvas>
                </div>
            </article>

            <!-- 3. Analisis Waktu Kejadian -->
            <article class="dashboard-card">
                <div class="card-header">
                    <div class="card-title-group">
                        <h3>Analisis Waktu Rawan Kejadian</h3>
                        <p>Pembagian intensitas kejahatan dalam periode 24 jam.</p>
                    </div>
                </div>
                <div class="chart-box-wrap">
                    <canvas id="timeChart"></canvas>
                </div>
            </article>
        </section>

        <!-- Hotspot Kriminalitas Teratas DIY -->
        <section class="dashboard-card hotspot-card">
            <div class="card-header">
                <div class="card-title-group">
                    <h3>Top 5 Titik Rawan (Hotspot) Kriminalitas di DIY</h3>
                    <p>Lokasi-lokasi dengan frekuensi tindak kejahatan tertinggi yang membutuhkan perhatian pengawasan intensif.</p>
                </div>
                <a href="laporan.php" class="hotspot-action-btn">Lihat Semua Laporan <i class="uil uil-arrow-right"></i></a>
            </div>

            <div class="hotspot-table-wrap">
                <table class="hotspot-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">Rank</th>
                            <th>Nama Tempat / Lokasi</th>
                            <th>Kabupaten / Wilayah</th>
                            <th>Total Kasus</th>
                            <th>Kejahatan Dominan</th>
                            <th>Tingkat Risiko</th>
                            <th style="text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($topHotspots as $index => $spot): ?>
                            <?php 
                                $rank = $index + 1;
                                $isHighRisk = $spot['total_kasus'] >= 20;
                            ?>
                            <tr>
                                <td><span class="rank-badge"><?php echo $rank; ?></span></td>
                                <td><strong><?php echo htmlspecialchars($spot['nama_tempat']); ?></strong></td>
                                <td><?php echo htmlspecialchars($spot['kabupaten']); ?></td>
                                <td><strong><?php echo $spot['total_kasus']; ?> Kasus</strong></td>
                                <td><?php echo htmlspecialchars($spot['jenis_dominan']); ?></td>
                                <td>
                                    <span class="risk-tag <?php echo $isHighRisk ? 'risk-high' : 'risk-medium'; ?>">
                                        <i class="uil <?php echo $isHighRisk ? 'uil-exclamation-octagon' : 'uil-exclamation-triangle'; ?>"></i>
                                        <?php echo $isHighRisk ? 'Tinggi' : 'Waspada'; ?>
                                    </span>
                                </td>
                                <td style="text-align: right;">
                                    <a href="isiLaporan.php?id=<?php echo $spot['id_tempat']; ?>" class="hotspot-action-btn">
                                        Rincian <i class="uil uil-arrow-right"></i>
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Chart.js Configuration -->
    <script>
        // Data dari PHP
        const lineData = <?php echo json_encode($lineData); ?>;
        const kabupatenLabels = <?php echo json_encode($kabupatenLabels); ?>;
        const kabupatenData = <?php echo json_encode($kabupatenData); ?>;
        const crimeLabels = <?php echo json_encode($jenisLabels); ?>;
        const crimeData = <?php echo json_encode($jenisData); ?>;
        const timeLabels = <?php echo json_encode($waktuLabels); ?>;
        const timeData = <?php echo json_encode($waktuData); ?>;

        // 1. Line Chart: Tren Kriminalitas Bulanan 2023
        const lineCtx = document.getElementById('lineChart').getContext('2d');
        const lineGradient = lineCtx.createLinearGradient(0, 0, 0, 280);
        lineGradient.addColorStop(0, 'rgba(255, 111, 0, 0.28)');
        lineGradient.addColorStop(1, 'rgba(255, 111, 0, 0.0)');

        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [{
                    label: 'Jumlah Kasus',
                    data: lineData,
                    borderColor: '#ff6f00',
                    backgroundColor: lineGradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#ff6f00',
                    pointBorderWidth: 2,
                    pointRadius: 4.5,
                    pointHoverRadius: 7,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1c0f2d',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.y} Kasus Kejahatan`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0e8f6' },
                        ticks: { color: '#746785', font: { family: 'Poppins', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#746785', font: { family: 'Poppins', size: 11 } }
                    }
                }
            }
        });

        // 2. Doughnut Chart: Sebaran Kasus per Kabupaten / Kota di DIY
        const kabCtx = document.getElementById('kabupatenChart').getContext('2d');
        new Chart(kabCtx, {
            type: 'doughnut',
            data: {
                labels: kabupatenLabels,
                datasets: [{
                    data: kabupatenData,
                    backgroundColor: ['#42007c', '#ff6f00', '#00bbff', '#10b981', '#a855f7'],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 12,
                            font: { family: 'Poppins', size: 11.5 },
                            color: '#423354'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const val = ctx.raw;
                                const pct = ((val / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${val} Kasus (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '62%'
            }
        });

        // 3. Horizontal Bar Chart: 9 Kategori Tindak Kejahatan Lengkap
        const crimeCtx = document.getElementById('crimeTypeChart').getContext('2d');
        new Chart(crimeCtx, {
            type: 'bar',
            data: {
                labels: crimeLabels,
                datasets: [{
                    label: 'Jumlah Kasus',
                    data: crimeData,
                    backgroundColor: [
                        '#ef4444', '#f97316', '#f59e0b', '#eab308',
                        '#84cc16', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7'
                    ],
                    borderRadius: 5,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.x} Kasus`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: '#f0e8f6' },
                        ticks: { color: '#746785', font: { family: 'Poppins', size: 10.5 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#312344', font: { family: 'Poppins', size: 11, weight: 500 } }
                    }
                }
            }
        });

        // 4. Bar Chart: Waktu Rawan Kejadian
        const timeCtx = document.getElementById('timeChart').getContext('2d');
        new Chart(timeCtx, {
            type: 'bar',
            data: {
                labels: ['Dini Hari\n(00-06)', 'Pagi\n(06-12)', 'Siang\n(12-18)', 'Malam\n(18-24)'],
                datasets: [{
                    label: 'Kasus',
                    data: timeData,
                    backgroundColor: ['#3b0764', '#0284c7', '#f59e0b', '#4338ca'],
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.y} Kasus Terjadi`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0e8f6' },
                        ticks: { color: '#746785', font: { family: 'Poppins', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#312344', font: { family: 'Poppins', size: 11, weight: 500 } }
                    }
                }
            }
        });
    </script>
</body>
</html>
