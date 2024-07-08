<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/CCTV.css">
    <link rel="icon" href="gambar/icon.png" type="png">

    <title>Daftar CCTV</title>

</head>
<body>
    <h1 class="judul">Daftar CCTV</h1>
    <select class="kabupaten" id="kbptn" onchange="filterByKabupaten()">
        <option value="0">Semua</option>
        <option value="Bantul">Bantul</option>
        <option value="Gunung Kidul">Gunung Kidul</option>
        <option value="Kulon Progo">Kulon Progo</option>
        <option value="Sleman">Sleman</option>
        <option value="Yogyakarta">Yogyakarta</option>
    </select>
    <div class="isi" id="tempatList">        
        <?php
            include "php/fungsiCCTV.php";
        ?>    
    </div>
    <?php include 'php/navbar.php'; ?>

    <script src="js/kabupaten.js"></script>
</body>
</html>