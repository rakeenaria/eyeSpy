<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/dashboard.css">
    <title>Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/groqResponse.js"></script>
    <link rel="icon" href="gambar/icon.png" type="png">
</head>
<body>
  <?php 
    include 'php/navbar.php'; 
    include 'php/chart.php';
  ?>

  <h1>Dashboard</h1>
  <div class="statistik" id="segmen">
    <h3>Data Kejahatan di Daerah Istimewa Yogyakarta</h3>
    <p class="deskripsiS">Grafik di bawah ini menampilkan jumlah kasus kejahatan yang terjadi di Yogyakarta sepanjang tahun 2023.</p>

    <!-- Grafik Biasa -->
    <div class="section center-text">
      <div class="chart-grafik">
        <canvas id="lineChart" class="chart"></canvas>
      </div>
    </div>
  </div>
  
  <div class="prediksi" id="segmen">
    <h3>Prediksi Jumlah Kejahatan 2024</h3>
    <div class="isiPrediksi" id="output">
      <?php include 'llm/groqPrediksi.php' ?>
      <input type="hidden" id="content" value="<?php echo htmlspecialchars($content, ENT_QUOTES, 'UTF-8'); ?>">
    </div>
  </div>

  <div class="lingkaran_lokasi" id="segmen">
      <h3>Distribusi Jumlah Kejahatan Berdasarkan Kabupaten</h3>
          <div class="chart-lingkaran">
            <canvas id="pieChart" class="chart"></canvas>
          </div>
  </div>

  <div class="lingkaran_kejahatan" id="segmen">
    <h3>Distribusi Jumlah Kejahatan Berdasarkan Jenis Kejahatan</h3>
           <div class="chart-container">
            <canvas id="pieChart2" class="chart"></canvas>
          </div>
  </div>

  <script>
    // PHP to JavaScript: Line Chart Data
    const lineData = <?php echo json_encode($lineData); ?>;

    // PHP to JavaScript: Pie Chart Data
    const pieData = <?php echo json_encode($pieData); ?>;
    const pieLabels = <?php echo json_encode($pieLabels); ?>;

    // PHP to JavaScript: Polling Pie Chart Data
    const pollPieData = <?php echo json_encode($pollPieData); ?>;
    const pollPieLabels = <?php echo json_encode($pollPieLabels); ?>;

    // Grafik Biasa
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
        datasets: [
          {
            label: 'Kejahatan',
            data: lineData,
            backgroundColor: '#ff6f00',
            borderColor: '#ff6f00',
            borderWidth: 5
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Grafik Lingkaran
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: pieLabels,
        datasets: [
          {
            label: 'Kasus',
            data: pieData,
            backgroundColor: ['#ff0000', '#ffea00', '#00bbff', '#0077ff', '#4c00ff', '#ff8800', '#ff6f00'],
            borderColor: ['#ffffff'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw || '';
                return `${label}: ${value}`;
              },
            },
          },
        },
      },
    });

    // Grafik Lingkaran Polling
    const pollPieCtx = document.getElementById('pieChart2').getContext('2d');
    const pollPieChart = new Chart(pollPieCtx, {
      type: 'pie',
      data: {
        labels: pollPieLabels,
        datasets: [
          {
            data: pollPieData,
            backgroundColor: ['#ff0000', '#ffea00', '#0077ff', '#4c00ff', '#ff8800'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.raw;
              },
            },
          },
        },
      },
    });
  </script>
</body>
</html>
