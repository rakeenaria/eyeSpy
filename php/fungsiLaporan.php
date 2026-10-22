<?php
include "koneksi.php";

$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : '00';
$bulanInt = ctype_digit((string)$bulan) ? (int)$bulan : 0;
$filterBulanLk = ($bulanInt >= 1 && $bulanInt <= 12) ? "WHERE MONTH(lk.waktu) = $bulanInt" : "";
$filterBulanLk2 = ($bulanInt >= 1 && $bulanInt <= 12) ? "AND MONTH(lk2.waktu) = $bulanInt" : "";

$sql = "SELECT t.id_tempat, t.nama_tempat, t.kabupaten, COUNT(lk.id) as jumlah_laporan, COUNT(DISTINCT lk.jenis_kejahatan) as variasi_kejahatan, 
    (SELECT jk.nama_jenis 
    FROM laporan_kejahatan lk2 
    JOIN jenis_kejahatan jk ON lk2.jenis_kejahatan = jk.id_jenis 
    WHERE lk2.tempat_kejadian = t.id_tempat 
    $filterBulanLk2
    GROUP BY lk2.jenis_kejahatan 
    ORDER BY COUNT(lk2.jenis_kejahatan) DESC 
    LIMIT 1) as jenis_kejahatan_terbanyak
    FROM tempat t
LEFT JOIN laporan_kejahatan lk ON t.id_tempat = lk.tempat_kejadian
$filterBulanLk
GROUP BY t.id_tempat, t.nama_tempat, t.kabupaten
ORDER BY jumlah_laporan DESC, t.nama_tempat ASC";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $no = 1;
    while($row = $result->fetch_assoc()) {
        $namaTempat = htmlspecialchars((string)$row["nama_tempat"], ENT_QUOTES, 'UTF-8');
        $kabupaten = htmlspecialchars((string)($row["kabupaten"] ?? ''), ENT_QUOTES, 'UTF-8');
        $jumlah = (int)$row["jumlah_laporan"];
        $variasi = (int)$row["variasi_kejahatan"];
        $jenisTerbanyak = !empty($row["jenis_kejahatan_terbanyak"]) ? htmlspecialchars((string)$row["jenis_kejahatan_terbanyak"], ENT_QUOTES, 'UTF-8') : '-';
        $idTempat = (int)$row["id_tempat"];
        $searchText = strtolower($namaTempat . ' ' . $kabupaten . ' ' . $jenisTerbanyak);
        
        echo "<tr data-table-row data-search='$searchText' onclick=\"window.location.href='isiLaporan.php?id=$idTempat'\">";
        echo "<td><span class='rank-badge'>$no</span></td>";
        echo "<td><span class='tempat-title'><i class='uil uil-map-pin'></i> $namaTempat</span>" . ($kabupaten ? " <small style='color:#746686;'>($kabupaten)</small>" : "") . "</td>";
        echo "<td><span class='badge-kasus'><i class='uil uil-file-alt'></i> $jumlah Kasus</span></td>";
        echo "<td><span class='badge-variasi'><i class='uil uil-apps'></i> $variasi Jenis</span></td>";
        echo "<td><span class='badge-jenis'><i class='uil uil-tag-alt'></i> $jenisTerbanyak</span></td>";
        echo "<td style='text-align: right;'><span class='btn-detail'>Rincian <i class='uil uil-arrow-right'></i></span></td>";
        echo "</tr>";
        $no++;
    }
} else {
    echo "<tr><td colspan='6' style='text-align: center; padding: 30px; color: #766986;'>Tidak ada data laporan untuk periode yang dipilih.</td></tr>";
}
$conn->close();
?>
