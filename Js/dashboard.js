async function loadDashboard() {
  try {
    const stats = await apiGet('getDashboardStats');
    document.getElementById('d_totalSiswa').innerText = stats.siswa.total;
    document.getElementById('d_kelas7').innerText = stats.siswa.kelas7;
    document.getElementById('d_kelas8').innerText = stats.siswa.kelas8;
    document.getElementById('d_kelas9').innerText = stats.siswa.kelas9;
    document.getElementById('d_totalLayanan').innerText = stats.layanan.total;
    document.getElementById('d_bulanIni').innerText = stats.layanan.bulanIni;
    renderChart('chartJenis', stats.layanan.jenis, stats.layanan.total);
  } catch (e) { console.error(e); }
}

function renderChart(containerId, data, total) {
  const container = document.getElementById(containerId);
  if (!total || total === 0) { container.innerHTML = '<p style="text-align:center; color:#999; font-size:12px;">Belum ada data</p>'; return; }
  const entries = Object.entries(data).sort((a,b) => b[1]-a[1]);
  container.innerHTML = entries.map(([label, count]) => {
    const pct = Math.round((count/total)*100);
    return '<div class="chart-bar"><div class="chart-label"><span>'+label+'</span><span><b>'+count+'</b> ('+pct+'%)</span></div><div class="chart-track"><div class="chart-fill" style="width:'+pct+'%"></div></div></div>';
  }).join('');
}
