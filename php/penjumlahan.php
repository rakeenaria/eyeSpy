<?php 
include 'koneksi.php';

// Total jumlah laporan
$sql_total_laporan = "SELECT COUNT(*) as total_laporan FROM laporan_kejahatan";
$result_total_laporan = $conn->query($sql_total_laporan);

if ($result_total_laporan->num_rows > 0) {
    $row = $result_total_laporan->fetch_assoc();
    $total_laporan = $row['total_laporan'];
    echo "Total jumlah laporan: " . $total_laporan . "<br>";
} else {
    echo "Tidak ada data laporan.<br>";
}

// Jumlah laporan per tempat
$sql_laporan_per_tempat = "SELECT tempat_kejadian, COUNT(*) as jumlah_laporan FROM laporan_kejahatan GROUP BY tempat_kejadian";
$result_laporan_per_tempat = $conn->query($sql_laporan_per_tempat);

if ($result_laporan_per_tempat->num_rows > 0) {
    echo "Jumlah laporan per tempat:<br>";
    while($row = $result_laporan_per_tempat->fetch_assoc()) {
        echo "Tempat ID " . $row['tempat_kejadian'] . ": " . $row['jumlah_laporan'] . "<br>";
    }
} else {
    echo "Tidak ada data laporan per tempat.<br>";
}

// Total jumlah masing-masing jenis kejahatan
$sql_total_jenis_kejahatan = "SELECT jenis_kejahatan, COUNT(*) as jumlah_jenis FROM laporan_kejahatan GROUP BY jenis_kejahatan";
$result_total_jenis_kejahatan = $conn->query($sql_total_jenis_kejahatan);

if ($result_total_jenis_kejahatan->num_rows > 0) {
    echo "Total jumlah masing-masing jenis kejahatan:<br>";
    while($row = $result_total_jenis_kejahatan->fetch_assoc()) {
        echo "Jenis Kejahatan ID " . $row['jenis_kejahatan'] . ": " . $row['jumlah_jenis'] . "<br>";
    }
} else {
    echo "Tidak ada data jenis kejahatan.<br>";
}

// Jumlah jenis kejahatan per tempat
$sql_jenis_per_tempat = "SELECT tempat_kejadian, jenis_kejahatan, COUNT(*) as jumlah_jenis FROM laporan_kejahatan GROUP BY tempat_kejadian, jenis_kejahatan";
$result_jenis_per_tempat = $conn->query($sql_jenis_per_tempat);

if ($result_jenis_per_tempat->num_rows > 0) {
    echo "Jumlah jenis kejahatan per tempat:<br>";
    while($row = $result_jenis_per_tempat->fetch_assoc()) {
        echo "Tempat ID " . $row['tempat_kejadian'] . ", Jenis Kejahatan ID " . $row['jenis_kejahatan'] . ": " . $row['jumlah_jenis'] . "<br>";
    }
} else {
    echo "Tidak ada data jenis kejahatan per tempat.<br>";
}

// Menutup koneksi
$conn->close();
?>