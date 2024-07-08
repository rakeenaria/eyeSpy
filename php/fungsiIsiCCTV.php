<?php 
include "koneksi.php";

$query = "SELECT * FROM tempat
        WHERE tempat.id_tempat = $id_tempat";

$result = $conn->query($query);

$conn->close();

?>