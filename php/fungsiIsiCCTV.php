<?php
require_once __DIR__ . '/koneksi.php';
require_once __DIR__ . '/JogjaCctvService.php';

$cctvSource = isset($_GET['source']) ? (string) $_GET['source'] : JogjaCctvService::SOURCE;
$cctvCameraId = isset($_GET['id']) ? (string) $_GET['id'] : '';
$cctvDetail = JogjaCctvService::findCamera($conn, $cctvSource, $cctvCameraId);
$camera = $cctvDetail['camera'];
$conn->close();
?>
