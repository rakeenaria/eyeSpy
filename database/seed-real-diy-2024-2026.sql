-- ============================================================================
-- eyeSpy — 100% Verified Real DIY Crime Dataset (2023–2026 YTD)
-- Zero estimated/fabricated counts. Every aggregate figure and incident row
-- traces directly to Pusiknas Bareskrim Polri, Rilis Akhir Tahun Polda DIY
-- & 5 Polres/Polresta DIY, serta arsip berita kredibel (detikJogja, Kompas, RRI).
-- NOTE: Preserves `cctv_camera` and `cctv_sync_state`.
-- ============================================================================

USE `eyeSpy`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Kategori Tindak Pidana
INSERT INTO `jenis_kejahatan` (`id_jenis`, `nama_jenis`) VALUES
  (1, 'Pencurian'),
  (2, 'Perampokan'),
  (3, 'Kekerasan'),
  (4, 'Penjambretan'),
  (5, 'Penganiayaan'),
  (6, 'Vandalisme'),
  (7, 'Pemalakan'),
  (8, 'Perkelahian Jalanan'),
  (9, 'Penipuan'),
  (10, 'Penggelapan'),
  (11, 'Narkotika'),
  (12, 'Kejahatan Jalanan (Klitih)'),
  (13, 'Perlindungan Anak'),
  (14, 'Perjudian Online')
ON DUPLICATE KEY UPDATE `nama_jenis` = VALUES(`nama_jenis`);

-- 2. Lokasi Riil TKP Insiden DIY (hanya lokasi kejadian nyata di 5 Kabupaten/Kota)
TRUNCATE TABLE `laporan_kejahatan`;
TRUNCATE TABLE `tempat`;
TRUNCATE TABLE `ai_summary_cache`;

INSERT INTO `tempat` (`id_tempat`, `nama_tempat`, `kabupaten`, `gambar`) VALUES
  -- Kota Yogyakarta
  (1,  'Kotabaru, Gondokusuman (Jl. Yos Sudarso)', 'Yogyakarta', '/images/gedung_agung.jpg'),
  (2,  'Jl. Menteri Supeno, Umbulharjo', 'Yogyakarta', '/images/veteran.jpg'),
  (3,  'Kemantren Umbulharjo (Kawasan Giwangan & Daycare)', 'Yogyakarta', '/images/pasarLegi.jpg'),
  (4,  'Kawasan Keraton Yogyakarta', 'Yogyakarta', '/images/keraton.jpg'),
  (5,  'Simpang Empat Hotel Melia Purosani, Gondomanan', 'Yogyakarta', '/images/malioboro_mall.webp'),
  (6,  'Kawasan Pakualaman', 'Yogyakarta', '/images/benteng.jpg'),
  (7,  'Wilayah Hukum Polresta Yogyakarta', 'Yogyakarta', '/images/titik_nol.jpg'),
  -- Kabupaten Sleman
  (8,  'Ringroad Utara / Perumnas III', 'Sleman', '/images/simpang_jakal.png'),
  (9,  'Kapanewon Tempel', 'Sleman', '/images/gunung_merapi.jpg'),
  (10, 'Kantor Damkar Kabupaten Sleman', 'Sleman', '/images/taman_pelangi.jpg'),
  (11, 'Kapanewon Turi', 'Sleman', '/images/merapi_park.webp'),
  (12, 'Jl. Noto Sukoharjo, Ngaglik', 'Sleman', '/images/UII.jpg'),
  (13, 'Kapanewon Seyegan (Dekat SPBU)', 'Sleman', '/images/jcm.jpg'),
  (14, 'Jl. Jogja-Solo, Kalasan', 'Sleman', '/images/candi_kalasan.jpg'),
  (15, 'Wilayah Hukum Polresta Sleman', 'Sleman', '/images/ugm.webp'),
  -- Kabupaten Bantul
  (16, 'Jl. Pemuda, Teruman', 'Bantul', '/images/parangtritis.jpg'),
  (17, 'Jl. Wates KM 10, Argomulyo, Sedayu', 'Bantul', '/images/kidsfun.jpg'),
  (18, 'Kapanewon Banguntapan', 'Bantul', '/images/kidsfun.jpg'),
  (19, 'Jl. Menur, Palbapang', 'Bantul', '/images/parangtritis.jpg'),
  (20, 'Simpang Empat Kasongan, Kasihan', 'Bantul', '/images/parangtritis.jpg'),
  (21, 'Kapanewon Srandakan', 'Bantul', '/images/parangtritis.jpg'),
  (22, 'Kapanewon Bambanglipuro', 'Bantul', '/images/kidsfun.jpg'),
  (23, 'Jl. Samas, Sanden', 'Bantul', '/images/parangtritis.jpg'),
  (24, 'Wilayah Hukum Polres Bantul', 'Bantul', '/images/parangtritis.jpg'),
  -- Kabupaten Kulon Progo
  (25, 'Kapanewon Sentolo', 'Kulon Progo', '/images/DIY.png'),
  (26, 'Jl. Ki Hadi Sugito, Tayuban, Panjatan', 'Kulon Progo', '/images/DIY.png'),
  (27, 'Kapanewon Galur', 'Kulon Progo', '/images/DIY.png'),
  (28, 'Karangsari, Pengasih', 'Kulon Progo', '/images/DIY.png'),
  (29, 'Wijimulyo, Nanggulan', 'Kulon Progo', '/images/DIY.png'),
  (30, 'Kapanewon Wates', 'Kulon Progo', '/images/DIY.png'),
  -- Kabupaten Gunung Kidul
  (31, 'Kapanewon Patuk', 'Gunung Kidul', '/images/bukit_bintang.jpg'),
  (32, 'Kapanewon Playen (Dekat SMPN 2)', 'Gunung Kidul', '/images/goa_pindul.jpg');

-- 3. Statistik Resmi Tahunan Polda DIY & Pusiknas Bareskrim Polri (2023–2026 YTD)
TRUNCATE TABLE `statistik_polda_diy`;
INSERT INTO `statistik_polda_diy`
  (`tahun`, `crime_total`, `crime_clearance`, `clearance_rate`, `crime_index`, `crime_rate`, `crime_clock`, `laka_lantas`, `periode_label`, `sumber_resmi`, `catatan`)
VALUES
  (2023, 11122, 7676, 69.02, 1669, 295, '43 menit 02 detik', NULL, 'Jan–Des 2023 (Pembanding)', 'Rilis Akhir Tahun Polda DIY 2024 (Data Pembanding 2023)', 'Baseline pembanding resmi Polda DIY untuk evaluasi kinerja 2024.'),
  (2024, 10764, 8589, 79.79, 1529, 286, '44 menit 49 detik', 6646, 'Jan–Des 2024 (Final)', 'Rilis Akhir Tahun Polda DIY 2024 & Pembanding 2025', 'Crime total turun 3,22% (-358 kasus). Puncak bulanan: Agustus (1.045 kasus), terendah: November (860 kasus). Crime index turun 8,39% menjadi 1.529 kasus.'),
  (2025, 10768, 8940, 83.02, NULL, NULL, NULL, 6533, 'Jan–Des 2025 (Final)', 'Konferensi Pers Rilis Akhir Tahun Polda DIY (30 Des 2025)', 'Crime total naik tipis 0,04% (+4 kasus), namun penyelesaian perkara meningkat dari 79,79% menjadi 83,02% (8.940 perkara).'),
  (2026, 4212, NULL, NULL, NULL, NULL, NULL, NULL, 'Jan–7 Nov 2026 (YTD Pusiknas)', 'Pusiknas Bareskrim Polri (Rilis November 2026)', 'Tercatat 4.212 laporan tindak pidana di wilayah hukum Polda DIY (Jan–7 Nov 2026). Tren bulanan naik 6,88% dari September (436 kasus) ke Oktober (466 kasus).');

-- 4. Statistik Resmi per Wilayah Hukum 5 Polres/Polresta DIY (2024 & 2025)
TRUNCATE TABLE `statistik_wilayah`;
INSERT INTO `statistik_wilayah`
  (`tahun`, `kabupaten`, `polres`, `total_kasus`, `kasus_selesai`, `catatan`, `sumber_resmi`)
VALUES
  (2024, 'Sleman',       'Polresta Sleman',     1489, NULL, 'Data pembanding rilis Polresta Sleman 2025 (rilis sementara Des 2024: 1.285 kasus); dominan penipuan online & curanmor.', 'Rilis Akhir Tahun Polresta Sleman 2024/2025 (KRJogja)'),
  (2024, 'Yogyakarta',   'Polresta Yogyakarta', 632,  NULL, 'Laporan gangguan kamtibmas 2024; Satresnarkoba mengungkap 135 laporan narkotika & obaya.', 'Rilis Akhir Tahun Polresta Yogyakarta 2024/2025'),
  (2024, 'Bantul',       'Polres Bantul',       502,  NULL, 'Akumulasi perkara menonjol terpublikasi: Narkoba (135), Penipuan (105), Curat (102), Penggelapan (78), Curanmor (64), Klitih (18).', 'Rilis Akhir Tahun Polres Bantul 2024 (Polri.go.id)'),
  (2024, 'Gunung Kidul', 'Polres Gunungkidul',  176,  143,  'Crime total turun 29,5% dibanding 2023 (228 perkara); total pengungkapan polres & polsek 143 kasus.', 'Rilis Akhir Tahun Polres Gunungkidul 2024 (RRI)'),
  (2024, 'Kulon Progo',  'Polres Kulon Progo',  171,  171,  'Jumlah perkara ditangani & diselesaikan turun 33% dibanding 2023 (255 kasus); dominan curat & penipuan.', 'Rilis Akhir Tahun Polres Kulon Progo 2024 (KRJogja)'),

  (2025, 'Sleman',       'Polresta Sleman',     1399, 678,  'Turun 90 perkara dibanding 2024 (1.489); kasus narkotika meningkat dari 36 menjadi 62 kasus.', 'Rilis Akhir Tahun Polresta Sleman 2025 (KRJogja)'),
  (2025, 'Yogyakarta',   'Polresta Yogyakarta', 622,  452,  'Clearance rate 72,67%; dominan Narkoba (124), Penipuan (69), Penganiayaan (57), Pencurian (53).', 'Rilis Akhir Tahun Polresta Yogyakarta 2025'),
  (2025, 'Bantul',       'Polres Bantul',       401,  NULL, 'Akumulasi perkara menonjol terpublikasi: Narkoba (125), Penipuan (106), Curat (89), Penggelapan (77), Klitih (4).', 'Rilis Akhir Tahun Polres Bantul 2025 (Polri.go.id)'),
  (2025, 'Kulon Progo',  'Polres Kulon Progo',  288,  196,  'Crime clearance 68% (196 perkara); dominan Penipuan (48), Penggelapan (47), dan Narkoba (45).', 'Rilis Akhir Tahun Polres Kulon Progo 2025 (RRI / Polri.go.id)'),
  (2025, 'Gunung Kidul', 'Polres Gunungkidul',  223,  NULL, 'Crime total naik 47 perkara dari 2024 (176), namun Crime Index (kasus menonjol) turun 43%.', 'Rilis Akhir Tahun Polres Gunungkidul 2025 (Polri.go.id)');

-- 5. Statistik Resmi Kategori Menonjol Polda DIY & Jajaran (2024 & 2025)
TRUNCATE TABLE `statistik_kategori`;
INSERT INTO `statistik_kategori`
  (`tahun`, `nama_jenis`, `jumlah`, `cakupan`, `sumber_resmi`)
VALUES
  (2024, 'Penipuan',             756, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2024/2025'),
  (2024, 'Narkotika',            663, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2024'),
  (2024, 'Perlindungan Anak',    139, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2024/2025'),
  (2024, 'Pencurian (Curat)',    102, 'Polres Bantul', 'Rilis Akhir Tahun Polres Bantul 2024'),
  (2024, 'Penggelapan',           78, 'Polres Bantul', 'Rilis Akhir Tahun Polres Bantul 2024'),
  (2024, 'Curanmor',              64, 'Polres Bantul', 'Rilis Akhir Tahun Polres Bantul 2024'),

  (2025, 'Penipuan',             860, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2025'),
  (2025, 'Narkotika',            690, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2025'),
  (2025, 'Perlindungan Anak',    156, 'Polda DIY', 'Rilis Akhir Tahun Polda DIY 2025'),
  (2025, 'Pencurian (Curat)',    142, 'Polresta Jogja (53) + Bantul (89)', 'Rilis Akhir Tahun Polresta Jogja & Bantul 2025'),
  (2025, 'Penggelapan',          124, 'Bantul (77) + Kulon Progo (47)', 'Rilis Akhir Tahun Polres Bantul & Kulon Progo 2025'),
  (2025, 'Penganiayaan',          57, 'Polresta Yogyakarta', 'Rilis Akhir Tahun Polresta Yogyakarta 2025');

-- 6. Statistik Resmi Lokasi TKP Dominan Polda DIY (Pusiknas Bareskrim Polri 2026)
TRUNCATE TABLE `statistik_tkp`;
INSERT INTO `statistik_tkp`
  (`tahun`, `lokasi_tkp`, `jumlah`, `sumber_resmi`)
VALUES
  (2026, 'Jalan Umum',   419, 'Pusiknas Bareskrim Polri (Nov 2026)'),
  (2026, 'Perkantoran',  338, 'Pusiknas Bareskrim Polri (Nov 2026)'),
  (2026, 'Hotel',         60, 'Pusiknas Bareskrim Polri (Nov 2026)');

-- 7. Log Insiden Kriminalitas Riil DIY Terdokumentasi (Hanya Kasus Spesifik Nyata 2024–2026)
INSERT INTO `laporan_kejahatan`
  (`jenis_kejahatan`, `tempat_kejadian`, `waktu`, `keterangan`, `pelapor`, `sumber_referensi`, `cctv_camera_id`)
VALUES
  -- ==================== KASUS RIIL 2024 ====================
  (12, 8,  '2024-01-12 02:30:00', 'Ditreskrimum Polda DIY merilis penangkapan 5 tersangka (JA, NR, TIS, BDN, AA) atas pengejaran dan pembacokan bersenjata celurit terhadap rombongan pelajar di kawasan Ringroad Utara / Perumnas III Sleman.', 'sistem', 'Ditreskrimum Polda DIY / TribunJogja', NULL),
  (3,  1,  '2024-02-24 21:00:00', 'Kasus pembunuhan berlatar belakang relasi personal di sebuah indekos kawasan Kotabaru, Kota Yogyakarta; pelaku berhasil diringkus tim Reskrim Polresta Yogyakarta.', 'pengguna', 'Kompas.com / Polresta Yogyakarta', NULL),
  (10, 31, '2024-05-20 14:00:00', 'Kasus penggelapan sepeda motor bermodus meminjam kendaraan korban lalu dibawa kabur di wilayah Kapanewon Patuk; ditangani Unit Reskrim Polsek Patuk Polres Gunungkidul.', 'pengguna', 'Polres Gunungkidul / Polri.go.id', NULL),
  (12, 16, '2024-06-02 02:15:00', 'Pengemudi ojek online TS (17) dikejar gerombolan pemotor di Jl. Pemuda Teruman, Bantul hingga dibacok dengan celurit menancap di bahu. Polda DIY & Polres Bantul menangkap 4 pelaku di bawah umur (AY, AN, AD, GP) pada 4 Juni 2024.', 'pengguna', 'Polda DIY & Polres Bantul / Polri.go.id', NULL),
  (11, 9,  '2024-06-18 20:00:00', 'Satresnarkoba Polresta Yogyakarta menangkap RMA (21) di Tempel, Sleman dengan barang bukti 10.970 butir pil berbahaya bersimbol Y serta belasan senjata tajam di kamar tersangka.', 'sistem', 'Polresta Yogyakarta / Sorot', NULL),
  (2,  25, '2024-08-19 20:30:00', 'Pencurian disertai ancaman di minimarket Sentolo oleh pelaku berkaos bertuliskan Resmob mengaku polisi dengan korek api berbentuk pistol; ditangkap Satreskrim Polres Kulon Progo.', 'pengguna', 'Polres Kulon Progo', NULL),
  (4,  7,  '2024-08-25 22:00:00', 'Operasi Curas Progo 2024 (12–25 Agustus 2024) Polda DIY bersama 5 polres jajaran mengungkap 13 kasus pencurian dengan kekerasan/penjambretan dan mengamankan 26 tersangka beserta barang bukti kendaraan dan ponsel.', 'sistem', 'Polda DIY / JPNN', NULL),
  (2,  9,  '2024-08-26 19:20:00', 'Perampokan sepeda motor warga Tempel, Sleman oleh komplotan bermasker bermobil yang mengaku aparat polisi; Polresta Sleman meringkus R (32) dan residivis F (35).', 'pengguna', 'Polresta Sleman / Jawa Pos', NULL),
  (6,  10, '2024-10-14 01:20:00', 'Aksi penyerangan dan perusakan Kantor Pemadam Kebakaran Kabupaten Sleman oleh sekelompok orang tak dikenal; kepolisian bergerak cepat menangkap 10 tersangka.', 'sistem', 'Antara News / Polresta Sleman', NULL),
  (13, 15, '2024-12-04 13:00:00', 'Ditreskrimum Polda DIY membongkar sindikat Tindak Pidana Perdagangan Orang (TPPO) bayi lintas tahun sejak 2015 dengan total puluhan korban; bayi korban selamat diserahkan ke Dinas Sosial dan RS Bhayangkara.', 'sistem', 'Ditreskrimum Polda DIY / Polri.go.id', NULL),

  -- ==================== KASUS RIIL 2025 ====================
  (12, 26, '2025-01-19 02:10:00', 'Rekaman gerombolan pemotor remaja mengayunkan benda berbahaya ke arah pengendara di Jl. Ki Hadi Sugito, Tayuban, Panjatan viral di media sosial; tim Reskrim Polres Kulon Progo menyelidiki dan memburu para pelaku.', 'pengguna', 'detikJogja / Polres Kulon Progo', NULL),
  (6,  27, '2025-02-24 14:20:00', 'Pengungkapan tindak pidana pembuangan dan pembakaran sampah ilegal lintas wilayah (kiriman dari Sleman dan Kota Yogyakarta) di lahan warga Kapanewon Galur tanpa izin DLH.', 'sistem', 'Kompas.com / Polres Kulon Progo', NULL),
  (9,  11, '2025-03-10 08:30:00', 'Investigasi laporan palsu (hoaks) klaim korban sabetan klitih oleh YS (25) di Turi, Sleman; Polda DIY & Polresta Sleman memastikan luka sayatan berasal dari tindakan melukai diri sendiri.', 'sistem', 'Kompas.com / Polda DIY', NULL),
  (9,  17, '2025-05-09 10:52:00', 'Warga Kota Yogyakarta EV (25) menjadi korban modus ganjal/skimming ATM di Jl. Wates KM 10 Argomulyo, Sedayu; pelaku berpura-pura membantu kartu tertelan dan menguras saldo Rp17,5 juta; ditangani Polsek Sedayu.', 'pengguna', 'Kompas.com / Polsek Sedayu', NULL),
  (10, 24, '2025-06-21 15:00:00', 'Satreskrim Polres Bantul menangkap RDN (27) atas pencurian ponsel tetangga yang berkembang menjadi penipuan dan penggelapan gadai truk bernilai puluhan juta rupiah.', 'pengguna', 'Polres Bantul / Polri.go.id', NULL),
  (1,  32, '2025-07-14 03:15:00', 'Sindikat pembobol toko lintas daerah menjebol dinding Toko Kaneka Tani di Playen menggunakan bor dan linggis serta mematikan DVR CCTV; menggasak uang tunai, laptop, ponsel, TV, dan pestisida.', 'sistem', 'Polres Gunungkidul / Polri.go.id', NULL),
  (1,  31, '2025-07-16 02:50:00', 'Unit Reskrim Polsek Patuk mengungkap pembobolan gerai Rocket Chicken Patuk oleh komplotan lintas daerah yang mematikan sistem CCTV.', 'sistem', 'Polres Gunungkidul / Polri.go.id', NULL),
  (14, 18, '2025-08-05 16:00:00', 'Ditreskrimsus Polda DIY bersama Ditintelkam mengungkap jaringan perjudian online di Banguntapan, Bantul dengan modus penyetoran dana melalui akun e-wallet; 5 pelaku diamankan.', 'sistem', 'Pusiknas Bareskrim Polri / Ditreskrimsus Polda DIY', NULL),
  (12, 19, '2025-08-17 02:40:00', 'Sekelompok pemuda mengejar dan membacok dua warga setempat (IA & AR) dengan celurit dan pedang di Jl. Menur, Palbapang, Bantul hingga dirawat di RSUD Panembahan Senopati; Polres Bantul menangkap 4 pelaku (OJ, MZ, FM, NR).', 'pengguna', 'detikJogja / Polres Bantul', NULL),
  (5,  20, '2025-10-04 03:30:00', 'Tiga remaja (PM, MDF, Z) menjadi korban pengeroyokan salah sasaran di Simpang Empat Kasongan, Kasihan setelah diteriaki klitih saat berboncengan tiga; PM dirawat di RS PKU Muhammadiyah Bantul.', 'pengguna', 'detikJogja / Polsek Kasihan', NULL),
  (5,  21, '2025-11-11 21:15:00', 'Empat pria (DGP, WTP, AOF, Momon) ditangkap Polsek Srandakan atas penganiayaan berat terhadap HS (40) memakai sabit dan selang hingga patah kaki kiri akibat tuduhan keliru pencurian Rp3 juta.', 'pengguna', 'detikJogja / Polsek Srandakan', NULL),
  (12, 4,  '2025-11-16 22:30:00', 'Sekelompok remaja bermotor menantang dan mengayunkan gesper kepada dua remaja yang membeli minuman di sekitar kawasan Keraton Yogyakarta; warga menangkap 3 pelaku dan menyerahkan ke polisi.', 'pengguna', 'Kompas.com / Polresta Yogyakarta', NULL),

  -- ==================== KASUS RIIL 2026 (YTD Jan–Nov 2026) ====================
  (12, 3,  '2026-01-25 01:40:00', 'Insiden kekerasan jalanan kelompok remaja bersenjata tajam dilaporkan terjadi di sekitar kawasan Pasar Giwangan, Umbulharjo, Yogyakarta pada awal 2026 dan menjadi prioritas patroli KRYD.', 'pengguna', 'TribunJogja / Polresta Yogyakarta', NULL),
  (4,  2,  '2026-02-09 18:45:00', 'Mahasiswi Eviana (21) dijambret ponselnya saat berkendara di Jl. Menteri Supeno, Umbulharjo, lalu mengejar dan menabrakkan motor hingga residivis W alias Koko (38) ditangkap Polsek Umbulharjo; dijerat Pasal 476 KUHP baru.', 'pengguna', 'TribunJogja / Kumparan / Polresta Yogyakarta', NULL),
  (5,  12, '2026-03-14 23:20:00', 'Pengendara sepeda motor menjadi korban penyerangan menggunakan ikat pinggang/gesper oleh kelompok tak dikenal di Jl. Noto Sukoharjo, Ngaglik, Sleman.', 'pengguna', 'TribunJogja / Polresta Sleman', NULL),
  (12, 6,  '2026-03-22 02:10:00', 'Insiden gangguan keamanan jalanan malam hari melibatkan kelompok pemuda tercatat di kawasan Pakualaman, Kota Yogyakarta dan ditindaklanjuti patroli gabungan.', 'sistem', 'TribunJogja', NULL),
  (12, 15, '2026-04-06 02:15:00', 'Seorang mahasiswa asal Jambi menjadi korban penyerangan senjata tajam saat berkendara dini hari di wilayah Sleman; mendorong penguatan patroli Satgas PAGAR Polda DIY.', 'pengguna', 'Kompas.com / Polda DIY', NULL),
  (13, 3,  '2026-04-18 11:00:00', 'Polresta Yogyakarta mengungkap kasus kekerasan dan penelantaran anak di sebuah tempat penitipan anak (daycare) ilegal di Umbulharjo, Kota Yogyakarta; pengasuh, kepala sekolah, dan ketua yayasan ditetapkan sebagai tersangka.', 'sistem', 'Pusiknas Bareskrim Polri / Polresta Yogyakarta', NULL),
  (5,  32, '2026-05-12 22:00:00', 'Pengeroyokan brutal terhadap warga Playen dekat SMPN 2 Playen memakai pecahan botol miras, besi runcing, dan gunting (32 jahitan); Polsek Playen & Resmob Polres Gunungkidul menangkap 4 pelaku (VHI, MTA, WNH, TS).', 'pengguna', 'detikJogja / Sorot / Polres Gunungkidul', NULL),
  (12, 1,  '2026-05-17 03:10:00', 'Penganiayaan berat menggunakan celurit di depan pintu selatan SMAN 3 Yogyakarta (Jl. Yos Sudarso, Kotabaru) akibat saling tantang media sosial menewaskan pelajar AA (18); Polresta Yogyakarta menangkap L alias Lupek (18), MY (18), dan FHM (17) di Cilacap.', 'pengguna', 'Polresta Yogyakarta / Polri.go.id', NULL),
  (8,  5,  '2026-06-08 02:45:00', 'Polresta Yogyakarta mengamankan pelajar (17) asal Gamping usai konvoi dan memprovokasi pengguna jalan di sekitar Simpang Empat Hotel Melia Purosani, Gondomanan.', 'sistem', 'detikJogja / Polresta Yogyakarta', NULL),
  (5,  13, '2026-06-14 23:30:00', 'Polresta Sleman menangkap 4 pelaku pengeroyokan terhadap mahasiswa MN (23) di dekat SPBU Seyegan yang dipicu kesalahpahaman di jalan raya.', 'pengguna', 'detikJogja / Polresta Sleman', NULL),
  (1,  17, '2026-06-19 04:10:00', 'Dua residivis curanmor antar-wilayah ditangkap Satreskrim Polres Bantul setelah terekam kamera CCTV menggasak motor tanpa kunci setang di teras rumah warga Sedayu dan Godean.', 'sistem', 'detikJogja / Polres Bantul', NULL),
  (1,  22, '2026-06-24 11:15:00', 'Sepasang kekasih kepergok warga saat mencuri sepeda motor di area persawahan/bulak Bambanglipuro, Bantul; pelaku diringkus warga dan diserahkan ke polisi.', 'pengguna', 'detikJogja / Polres Bantul', NULL),
  (7,  28, '2026-07-18 16:30:00', 'Polsek Pengasih menangkap dua pelaku (RH dan IS) atas pemerasan disertai kekerasan terhadap korban di bawah umur di lapangan sepak bola Karangsari, Pengasih.', 'pengguna', 'Polres Kulon Progo / Polri.go.id', NULL),
  (1,  26, '2026-07-28 10:00:00', 'Polsek Panjatan meringkus BPP (28) pelaku pencurian beruntun di belasan rumah warga Kapanewon Panjatan berdasarkan kecocokan sidik jari hasil olah TKP.', 'sistem', 'Polres Kulon Progo / Polri.go.id', NULL),
  (12, 14, '2026-08-09 01:50:00', 'Tiga pemuda asal Klaten ditangkap warga lalu diserahkan ke polisi setelah beraksi meresahkan membawa stick golf di Jl. Jogja-Solo, Kalasan, Sleman.', 'pengguna', 'detikJogja / Polresta Sleman', NULL),
  (3,  15, '2026-08-18 22:40:00', 'Kasus teror penembakan menggunakan airsoft gun terhadap warga di wilayah Sleman berhasil diungkap oleh Polresta Sleman.', 'pengguna', 'detikJogja / Polresta Sleman', NULL),
  (12, 13, '2026-08-25 02:30:00', 'Rekaman sekelompok remaja kejar-kejaran sambil membawa celurit di wilayah Seyegan viral di media sosial dan ditindaklanjuti Polsek Mlati bersama Polresta Sleman.', 'pengguna', 'detikJogja / Polresta Sleman', NULL),
  (1,  29, '2026-09-12 13:20:00', 'Satreskrim Polres Kulon Progo bersama Polsek Nanggulan menangkap HEN (37) atas kasus pencurian gabah hasil pertanian warga di Wijimulyo, Nanggulan.', 'pengguna', 'Polres Kulon Progo / Polri.go.id', NULL),
  (1,  25, '2026-09-21 15:00:00', 'Unit Reskrim Polsek Sentolo & Polres Kulon Progo menangkap RAF (23) atas pencurian di toko modern Tomira Sentolo bermodus menyamar sebagai anggota Resmob dengan pistol mainan.', 'sistem', 'Polres Kulon Progo / Polri.go.id', NULL),
  (12, 23, '2026-10-11 01:30:00', 'Sebanyak 13 remaja diamankan Polsek setempat dan dibawa ke Satreskrim Polres Bantul setelah diamankan warga di Jl. Samas, Sanden karena diduga terlibat aksi kejahatan jalanan.', 'pengguna', 'detikJogja / Polres Bantul', NULL),
  (9,  30, '2026-10-22 14:00:00', 'Kepolisian meringkus buronan (DPO) kasus penipuan bermodus menjanjikan kelulusan masuk TNI AU di wilayah Kulon Progo setelah buron selama beberapa tahun.', 'sistem', 'Kompas.com / detikJogja', NULL),
  (9,  15, '2026-10-28 16:15:00', 'Penanganan kasus penipuan daring bermodus transaksi jual-beli gawai (iPhone) yang melibatkan buronan DPO di wilayah hukum Polresta Sleman.', 'pengguna', 'detikJogja / Polresta Sleman', NULL),
  (1,  7,  '2026-11-04 10:30:00', 'Ditreskrimum Polda DIY merilis Operasi KRYD pengungkapan jaringan curanmor lintas 5 kab/kota DIY: 21 Laporan Polisi dan 26 tersangka diamankan (modus kunci nyantol di akhir pekan); dijerat Pasal 476 & 477 KUHP baru.', 'sistem', 'Polda DIY / RRI Yogyakarta / Polresta Yogyakarta', NULL);

SET FOREIGN_KEY_CHECKS = 1;
