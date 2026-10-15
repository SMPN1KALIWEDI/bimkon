// ============================================
// FILE: js/app.js
// FUNGSI: Navigasi & Inisialisasi Aplikasi
// ============================================

function switchPage(page, btn) {
  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('page-' + page).classList.add('active');
  if (page === 'dashboard') loadDashboard();
  if (page === 'administrasi') loadAdministrasi();
  if (page === 'template') renderTemplates();
  if (page === 'rpl') loadRPL();
  if (page === 'jadwal') loadJadwal();
  if (page === 'layanan' && databaseSaranCache.length === 0) loadDatabaseSaran();
  if (page === 'laporan') {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('filter_tglMulai').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filter_tglAkhir').value = today.toISOString().split('T')[0];
    loadLaporan();
  }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  loadDashboard();
  loadDatabaseSaran();
  
  // Pasang listener untuk Saran AI
  const deskripsiField = document.querySelector('#formLayanan textarea[name="deskripsi"]');
  const kategoriField = document.querySelector('#formLayanan select[name="kategori"]');
  if (deskripsiField) {
    deskripsiField.addEventListener('input', onDeskripsiChange);
    deskripsiField.addEventListener('blur', onDeskripsiChange);
  }
  if (kategoriField) kategoriField.addEventListener('change', onDeskripsiChange);
});
