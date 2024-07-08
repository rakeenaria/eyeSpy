<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/navbar.css">
    
    <title>Document</title>

    <!-- Unicons CSS -->
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css" />
    <script src="js/navbar.js" defer></script>
</head>
<body>
    <nav class="nav">
        <i class="uil uil-bars navOpenBtn"></i>

        <a href="index.php" class="logo"> eyeSpy</a>
  
        <ul class="nav-links">
          <i class="uil uil-times navCloseBtn"></i>
          <li><a href="index.php">Dashboard</a></li>
          <li><a href="daftarCCTV.php">CCTV</a></li>
          <li><a href="laporan.php">Laporan</a></li>
        </ul>
  
        <i class="uil uil-search search-icon" id="searchIcon"></i>
        <div class="search-box">
          <i class="uil uil-search search-icon"></i>
          <input type="text" placeholder="Cari..." />
        </div>
    </nav>
</body>
</html>