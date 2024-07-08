<?php

//Inisiasi nilai-nilai paramater koneksi
$namaServer = "localhost"; // isikan sesuai nama server Anda
$namaPengguna = "root"; //isikan sesuai nama pengguna Basisdata Anda
$password = ""; //isikan sesuai password Anda
$nama_db = "eyeSpy";
//Membuat koneksi
$conn = new mysqli($namaServer, $namaPengguna, $password, $nama_db);
//memeriksa apakah koneksi sukses dilakukan
if ($conn->connect_error) {
	die("Koneksi gagal : " . $conn->connect_error. "<br>");
}
?>
