
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