<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/CCTV.css">
    <link rel="icon" href="gambar/icon.png" type="png">
    
    <title>CCTV</title>
</head>
<body>
    <?php include 'php/navbar.php'; ?>
    <?php
        if (isset($_GET['id'])) {
            $id_tempat = $_GET['id'];
            include "PHP/fungsiIsiCCTV.php";
            if($result->num_rows > 0){
                $row = $result->fetch_assoc();
    ?>
        <h1 class="judul">CCTV - <?php echo $row["nama_tempat"] ?></h1>
    <?php
            }
        }
    ?>
    
    <div class="isi2">
        <div class="videoCCTV">
            <video controls src = "gambar/videoTugu.mp4">
        </div>

        <form action="submit_report.php" method="POST" class="report-form">
            <textarea name="keterangan" placeholder="Tuliskan keterangan kejadian" required></textarea>
            <button type="submit">Laporkan</button>
        </form>
    </div>

</body>
</html>