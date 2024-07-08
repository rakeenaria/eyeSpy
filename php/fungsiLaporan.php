<?php

include "koneksi.php";

// Ambil nilai bulan dari form
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';

// Modifikasi query SQL untuk memfilter dan mengurutkan berdasarkan jumlah laporan terbanyak
$sql = "SELECT t.id_tempat, t.nama_tempat, COUNT(lk.id) as jumlah_laporan, COUNT(DISTINCT lk.jenis_kejahatan) as variasi_kejahatan, 
    (SELECT jk.nama_jenis 
    FROM laporan_kejahatan lk2 
    JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis 
    WHERE lk2.tempat_kejadian = t.id_tempat 
    " . ($bulan !== '00' ? "AND MONTH(lk2.waktu) = $bulan" : "") . "
    GROUP BY lk2.jenis_kejahatan 
    ORDER BY COUNT(lk2.jenis_kejahatan) DESC 
    LIMIT 1) as jenis_kejahatan_terbanyak
    FROM tempat t
LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
" . ($bulan !== '00' ? "WHERE MONTH(lk.waktu) = $bulan" : "") . "
GROUP BY t.id_tempat, t.nama_tempat
ORDER BY jumlah_laporan DESC";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Output data dari setiap row
    while($row = $result->fetch_assoc()) {
        echo "<tr onclick=\"window.location.href='isiLaporan.php?id=" . $row["id_tempat"] . "'\">";
        echo "<td>" . $row["nama_tempat"] . "</td>";
        echo "<td>" . $row["jumlah_laporan"] . "</td>";
        echo "<td>" . $row["variasi_kejahatan"] . "</td>";
        echo "<td>" . $row["jenis_kejahatan_terbanyak"] . "</td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='4'>Tidak ada data</td></tr>";
}
$conn->close();


?>
