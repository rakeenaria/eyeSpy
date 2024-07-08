<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Laporan</title>
    <link rel="stylesheet" href="css/detailLaporan.css">
    <link rel="icon" href="gambar/icon.png" type="png">
    
</head>
<body>
    <?php 
        include 'php/navbar.php'; 
        include 'php/fungsiDetailLaporan.php';
    ?>
    <div class="container">
        <div class="header">
            <h1>Laporan Kejadian - <?php echo htmlspecialchars($row_laporan['nama_tempat']); ?></h1>
        </div>
        <div class="content">
            <img src="gambar/footage.webp" alt="gambar">
        </div>
        <div class="details">
            <div>
                <span>Pelapor</span>
                <?php echo htmlspecialchars($row_laporan['pelapor']); ?>
            </div>
            <div>
                <span>Tempat Kejadian</span>
                <?php echo htmlspecialchars($row_laporan['nama_tempat']); ?>
            </div>
            <div>
                <span>Waktu</span>
                <?php echo htmlspecialchars($row_laporan['waktu']); ?>
            </div>
            <div>
                <span>Keterangan</span>
                <?php echo htmlspecialchars($row_laporan['keterangan']); ?>
            </div>
        </div>
    </div>
</body>
</html>
