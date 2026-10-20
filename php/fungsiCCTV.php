<?php
require_once __DIR__ . '/koneksi.php';
require_once __DIR__ . '/JogjaCctvService.php';

$cctvCatalog = JogjaCctvService::listCameras($conn);
$conn->close();
?>
