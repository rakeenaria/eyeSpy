<?php 
include "koneksi.php";

$kabupaten = isset($_GET['kabupaten']) ? $_GET['kabupaten'] : '0';

if ($kabupaten === '0') {
    $query = "SELECT * FROM tempat";
} else {
    $query = "SELECT * FROM tempat WHERE kabupaten = ?";
}

$stmt = $conn->prepare($query);
if ($kabupaten !== '0') {
    $stmt->bind_param("s", $kabupaten);
}
$stmt->execute();
$result1 = $stmt->get_result();

if ($result1->num_rows > 0) {
    while ($row = $result1->fetch_assoc()) {
?>
<a href="isiCCTV.php?id=<?php echo $row["id_tempat"];?>">
<div class="CCTV">
    <h3 class="lokasiCCTV"><?php echo $row["nama_tempat"];?></h3>
    <img src="<?php echo $row["gambar"];?>" alt="gambar">
</div>
</a>
<?php
    }
}
$stmt->close();
$conn->close();
?>
