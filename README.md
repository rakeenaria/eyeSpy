# eyeSpy — Urban Safety Intelligence & Public CCTV Platform (D.I. Yogyakarta)

**eyeSpy** adalah platform web intelijen keamanan perkotaan untuk **Daerah Istimewa Yogyakarta (DIY)** yang memusatkan peta pemantauan CCTV publik secara langsung (*real-time HLS*), analitik data kriminalitas riil DIY (2023–2026 YTD), arsip laporan kejadian terverifikasi, pelaporan masyarakat, serta asisten analitik berbasis Groq AI yang terhubung langsung ke basis data MySQL.

---

## Fitur Utama

### 1. Dashboard Analitik Kriminalitas DIY (2023–2026 YTD)
- **Data Resmi Terverifikasi:** Menampilkan statistik resmi Rilis Akhir Tahun **Polda DIY (2023–2025)**, rekapitulasi 5 satuan **Polres/Polresta DIY** (Sleman, Kota Yogyakarta, Bantul, Kulon Progo, Gunungkidul), serta catatan **Pusiknas Bareskrim Polri (2026 YTD: 4.212 kasus Jan–7 Nov 2026, TKP dominan Jalan Umum 419, Perkantoran 338, Hotel 60)**.
- **Filter Periode Interaktif:** Beralih cepat antara `2024–2026`, `2026 YTD`, `2025`, dan `2024` dengan visualisasi grafik berbasis **Recharts**.
- **Asisten Analitik AI (Groq LLM):** Chatbot keamanan publik dengan *dynamic MySQL context retrieval* dan mekanisme *dual-model fallback* (`qwen/qwen3.8-27b` → `openai/gpt-oss-20b` → *live database query fallback*).

### 2. Peta Interaktif DIY & Live Streaming CCTV Publik
- **Peta Sebaran DIY (Leaflet + ArcGIS):** Memetakan **688 titik CCTV publik** lintas seluruh 5 kabupaten/kota DIY dengan tombol fokus wilayah cepat (*Seluruh DIY, Kota Jogja, Sleman, Bantul, Kulon Progo, Gunung Kidul*) serta pilihan **Mode Peta Jalan** dan **Mode Satelit** (tanpa perlu API key).
- **Siaran HLS Live 1080p:** Terintegrasi dengan jaringan publik **Pemkot Yogyakarta / JSS (`cctv.jogjakota.go.id` — 145 kamera live aktif)** serta sinkronisasi otomatis *Stale-While-Revalidate* untuk **Portal CCTV Jogja Istimewa (`cctv.jogjaprov.go.id` — 543 titik regional DIY)**.
- **Pratinjau Instan & Pelaporan Warga:** Klik pin kamera di peta untuk memutar siaran langsung di panel samping, atau buka layar penuh (`/cctv/[id]`) untuk mengirim laporan kejadian baru (`POST /api/reports`) yang langsung tersimpan ke MySQL.

### 3. Rekapitulasi Laporan & Analisis Mitigasi AI
- **Arsip Kasus Riil 2024–2026:** Menyajikan log insiden kriminalitas riil terverifikasi lintas 5 wilayah DIY lengkap dengan kategori, kronologi, sumber referensi, dan mode tampilan **Log Insiden** maupun **Rekap per Lokasi**.
- **Analisis AI & Rekomendasi Mitigasi:** Ringkasan dinamika kejahatan dan saran pencegahan terstruktur berbasis Markdown yang diperbarui mengikuti filter tahun/bulan dan di-cache selama 6 jam di MySQL (`ai_summary_cache`).

### 4. Performa & Sistem Desain
- **Instant Static App Shell:** Halaman utama (`/`, `/cctv`, `/laporan`) di-prerender statis dengan *shimmer skeleton* abu-abu muda untuk setiap bagian berbasis database, *lazy-loading* `hls.js`, dan *client memory cache* agar perpindahan antar halaman terasa instan.
- **Neutral-First Light Mode (CSS Modules):** Menggunakan token desain terpusat ([src/styles/tokens.css](src/styles/tokens.css)) tanpa framework utilitas eksternal — konsisten pada border, radius, tipografi (`Inter` + `JetBrains Mono` dengan `tabular-nums`), dan semantik warna status.

---

## Tech Stack

| Lapisan | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19, TypeScript 5.8 |
| **Styling** | CSS Modules (`*.module.css`) + CSS Custom Properties (`tokens.css`) |
| **Database** | MySQL / MariaDB (`mysql2/promise` connection pool) |
| **Visualisasi & Peta** | Recharts, Leaflet (`preferCanvas`), ArcGIS World Street & Imagery Tiles |
| **Streaming & Ikon** | `hls.js` (lazy-loaded), Lucide React |
| **AI & Validasi** | Groq SDK (`groq-sdk`), Zod |

---

## Struktur Direktori

```text
├── database/
│   ├── schema.sql                    # Skema lengkap MySQL/MariaDB (statistik, insiden, CCTV, cache AI)
│   └── seed-real-diy-2024-2026.sql   # Dataset resmi Polda DIY/Polres/Pusiknas & kasus riil 2024–2026
├── public/
│   └── images/                       # Aset ikon & visual lokasi DIY
├── scripts/
│   └── setup-db.mjs                  # Skrip otomatis migrasi & seed database (`npm run db:setup`)
└── src/
    ├── app/
    │   ├── layout.tsx                # Root shell, font Inter & JetBrains Mono, TopNavbar
    │   ├── page.tsx                  # Dashboard Analitik (`/`)
    │   ├── cctv/
    │   │   ├── page.tsx              # Peta DIY & Daftar CCTV Publik (`/cctv`)
    │   │   └── [id]/page.tsx         # Pemutar Live HLS & Form Lapor (`/cctv/[id]`)
    │   ├── laporan/
    │   │   ├── page.tsx              # Rekapitulasi Laporan & AI Mitigasi (`/laporan`)
    │   │   ├── lokasi/[id]/page.tsx  # Riwayat Kasus per Lokasi
    │   │   └── [id]/page.tsx         # Detail Laporan & Kronologi
    │   └── api/
    │       ├── analytics/route.ts    # GET analitik tahunan & wilayah (cached)
    │       ├── cctv/route.ts         # GET katalog CCTV dual-source (SWR)
    │       ├── cctv/[id]/route.ts    # GET detail kamera CCTV
    │       ├── reports/route.ts      # GET daftar/rekap & POST laporan warga
    │       ├── reports/[id]/route.ts # GET detail laporan
    │       └── ai/
    │           ├── chat/route.ts     # POST chatbot Groq AI berbasis konteks MySQL
    │           └── summary/route.ts  # GET ringkasan mitigasi AI (cached 6 jam)
    ├── components/
    │   ├── ui/                       # Card, Badge, Button, Skeleton, MarkdownView
    │   ├── layout/                   # TopNavbar, PageHeader
    │   ├── dashboard/                # KpiGrid, AnalyticsCharts, HotspotTable, AiChatbot
    │   ├── cctv/                     # DiyCctvMap, CctvCatalogClient, CctvPlayer, ReportIncidentForm
    │   └── laporan/                  # LaporanClient, AiMitigationCard
    ├── lib/
    │   ├── db/pool.ts                # Singleton MySQL2 connection pool
    │   ├── services/                 # analytics.ts, reports.ts, jogja-cctv.ts, groq-ai.ts
    │   └── format.ts                 # Formatter tanggal, angka, dan konstanta filter
    ├── styles/
    │   ├── tokens.css                # Single source of truth Design Tokens (Light Mode)
    │   └── globals.css               # Base styles + Leaflet CSS
    └── types/
        └── eyespy.ts                 # Shared TypeScript interfaces
```

---

## Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** v20+ (disarankan v22 LTS)
- **MySQL / MariaDB** (misalnya via XAMPP)
- **Groq API Key** *(opsional — aplikasi tetap berjalan normal dengan fallback query database lokal jika kunci belum diisi)*

### Langkah Instalasi

1. **Clone repositori & masuk ke direktori proyek:**
   ```bash
   git clone https://github.com/rakeenaria/eyeSpy.git
   cd eyeSpy
   ```

2. **Konfigurasi environment:**
   Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial MySQL dan API key Groq Anda:
   ```env
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=eyeSpy

   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=qwen/qwen3.8-27b
   ```

3. **Pasang dependensi & siapkan basis data:**
   Pastikan service MySQL sudah menyala, lalu jalankan:
   ```bash
   npm install
   npm run db:setup
   ```

4. **Jalankan aplikasi:**
   - Mode pengembangan:
     ```bash
     npm run dev
     ```
   - Mode produksi:
     ```bash
     npm run build
     npm run start
     ```
   Buka `http://localhost:3000` di browser Anda.

---

## Sumber Data & Atribusi
- **Statistik Kriminalitas Resmi:** Rilis Akhir Tahun Polda DIY (2024 & 2025), Polresta Yogyakarta, Polresta Sleman, Polres Bantul, Polres Kulon Progo, Polres Gunungkidul, serta Pusiknas Bareskrim Polri (2026 YTD).
- **Arsip Kasus Terdokumentasi:** Rilis resmi Polri (`polri.go.id`, Pusiknas) dan liputan media regional/nasional (*detikJogja, Kompas.com, RRI Yogyakarta, Antara, KRJogja, TribunJogja*).
- **Siaran CCTV Publik:** Portal CCTV Pemkot Yogyakarta / Jogja Smart Service (`cctv.jogjakota.go.id`) dan Portal CCTV Jogja Istimewa (`cctv.jogjaprov.go.id`).
- **Peta Dasar:** Esri ArcGIS World Street Map & World Imagery melalui Leaflet.
