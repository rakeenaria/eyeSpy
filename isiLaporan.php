<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Isi Laporan</title>
    <link rel="stylesheet" href="css/laporan.css">
    <link rel="icon" href="gambar/icon.png" type="png">
    
</head>
<body>
    <?php include 'php/navbar.php';
    include 'php/fungsiIsiLaporan.php'; ?>
    <div class="content">
        <h1>Laporan Kejadian - <?php echo htmlspecialchars($nama_tempat); ?></h1>
        <form method="GET" action="">
        <input type="hidden" name="id" value="<?php echo $id_tempat; ?>">
        <select class="bulan" name="bulan" onchange="this.form.submit()">
            <option value="00" <?php if ($bulan == '00') echo 'selected'; ?>>Satu Tahun</option>
            <option value="01" <?php if ($bulan == '01') echo 'selected'; ?>>Januari</option>
            <option value="02" <?php if ($bulan == '02') echo 'selected'; ?>>Februari</option>
            <option value="03" <?php if ($bulan == '03') echo 'selected'; ?>>Maret</option>
            <option value="04" <?php if ($bulan == '04') echo 'selected'; ?>>April</option>
            <option value="05" <?php if ($bulan == '05') echo 'selected'; ?>>Mei</option>
            <option value="06" <?php if ($bulan == '06') echo 'selected'; ?>>Juni</option>
            <option value="07" <?php if ($bulan == '07') echo 'selected'; ?>>Juli</option>
            <option value="08" <?php if ($bulan == '08') echo 'selected'; ?>>Agustus</option>
            <option value="09" <?php if ($bulan == '09') echo 'selected'; ?>>September</option>
            <option value="10" <?php if ($bulan == '10') echo 'selected'; ?>>Oktober</option>
            <option value="11" <?php if ($bulan == '11') echo 'selected'; ?>>November</option>
            <option value="12" <?php if ($bulan == '12') echo 'selected'; ?>>Desember</option>
        </select>
    </form>
        <table class="data">
            <thead>
                <tr>
                    <th>Pelapor</th>
                    <th>Kejahatan</th>
                    <th>Tempat Kejadian</th>
                    <th>Waktu</th>
                </tr>
            </thead>
            <tbody>
                <?php
                
                if ($result_laporan->num_rows > 0) {
                    while ($row_laporan = $result_laporan->fetch_assoc()) {
                        echo "<tr onclick=\"window.location.href='detailLaporan.php?id=" . $row_laporan['id'] . "'\">";
                        echo "<td>" . htmlspecialchars($row_laporan['pelapor']) . "</td>";
                        echo "<td>" . htmlspecialchars($row_laporan['jenis_kejahatan']) . "</td>";
                        echo "<td>" . htmlspecialchars($row_laporan['nama_tempat']) . "</td>";
                        echo "<td>" . htmlspecialchars($row_laporan['waktu']) . "</td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='4'>Tidak ada laporan untuk tempat ini.</td></tr>";
                }
                ?>         
            </tbody>
        </table>
    </div>    
</body>
</html>
