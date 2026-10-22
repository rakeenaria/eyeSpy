<?php
$currentPage = basename($_SERVER['SCRIPT_NAME'] ?? '');
?>
<nav class="nav">
    <div class="nav-container">
        <a href="index.php" class="logo">
            <span class="logo-text">eye<span>Spy</span></span>
        </a>

        <div class="nav-links-wrapper">
            <ul class="nav-links">
                <i class="uil uil-times navCloseBtn"></i>
                <li>
                    <a href="index.php" class="<?php echo ($currentPage === 'index.php' || $currentPage === 'dashboard.php' || $currentPage === '') ? 'active' : ''; ?>">
                        Dashboard
                    </a>
                </li>
                <li>
                    <a href="daftarCCTV.php" class="<?php echo ($currentPage === 'daftarCCTV.php' || $currentPage === 'isiCCTV.php') ? 'active' : ''; ?>">
                        CCTV Publik
                    </a>
                </li>
                <li>
                    <a href="laporan.php" class="<?php echo ($currentPage === 'laporan.php' || $currentPage === 'isiLaporan.php' || $currentPage === 'detailLaporan.php') ? 'active' : ''; ?>">
                        Laporan
                    </a>
                </li>
            </ul>
        </div>
        <i class="uil uil-bars navOpenBtn"></i>
    </div>
</nav>
