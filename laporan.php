<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Kejadian</title>
    <link rel="stylesheet" href="css/laporan.css">
    <script src="js/groqResponse.js"></script>
    <link rel="icon" href="gambar/icon.png" type="png">
    
</head>
<body>
    <?php include 'php/navbar.php'; ?>

        <div class="content">
            <h1>Laporan Kejadian</h1>
            <div class="llm" id="output" >
                <?php include 'llm/groqLaporan.php' ?>
                <input type="hidden" id="content" value="<?php echo htmlspecialchars($content, ENT_QUOTES, 'UTF-8'); ?>">
            </div>
            <?php include 'php/dropdownBulan.php'; ?>
            <table class="data">
                <thead>
                    <tr>
                        <th>Tempat Kejadian</th>
                        <th>Jumlah Laporan</th>
                        <th>Variasi Kejahatan</th>
                        <th>Kejahatan Terbanyak</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    include "php/fungsiLaporan.php";
                    ?>
                </tbody>
            </table>
        </div>

</body>
</html>
