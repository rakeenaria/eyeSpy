<?php
$currentPage = basename($_SERVER['SCRIPT_NAME'] ?? '');
$navCssVer = @filemtime(__DIR__ . '/../css/navbar.css') ?: time();
$navJsVer = @filemtime(__DIR__ . '/../js/navbar.js') ?: time();
?>
<!-- Inlined link ensures latest navbar styling is always applied regardless of page cache -->
<link rel="stylesheet" href="css/navbar.css?v=<?php echo $navCssVer; ?>">
<script src="js/navbar.js?v=<?php echo $navJsVer; ?>" defer></script>

<nav class="nav">
    <div class="nav-container">
        <a href="index.php" class="logo">
            <span class="logo-mark"><i class="uil uil-eye"></i></span>
            <span class="logo-text">eye<span>Spy</span></span>
            <span class="logo-badge">DIY</span>
        </a>

        <div class="nav-links-wrapper">
            <ul class="nav-links">
                <i class="uil uil-times navCloseBtn"></i>
                <li>
                    <a href="index.php" class="<?php echo ($currentPage === 'index.php' || $currentPage === 'dashboard.php' || $currentPage === '') ? 'active' : ''; ?>">
                        <i class="uil uil-estate"></i> Dashboard
                    </a>
                </li>
                <li>
                    <a href="daftarCCTV.php" class="<?php echo ($currentPage === 'daftarCCTV.php' || $currentPage === 'isiCCTV.php') ? 'active' : ''; ?>">
                        <i class="uil uil-video"></i> CCTV Publik
                    </a>
                </li>
                <li>
                    <a href="laporan.php" class="<?php echo ($currentPage === 'laporan.php' || $currentPage === 'isiLaporan.php' || $currentPage === 'detailLaporan.php') ? 'active' : ''; ?>">
                        <i class="uil uil-file-shield-alt"></i> Laporan
                    </a>
                </li>
            </ul>
        </div>

        <div class="nav-actions">
            <div class="search-box">
                <i class="uil uil-search search-icon"></i>
                <input type="text" id="navbarSearch" placeholder="Cari info wilayah atau CCTV..." />
            </div>
            <i class="uil uil-bars navOpenBtn"></i>
        </div>
    </div>
</nav>
