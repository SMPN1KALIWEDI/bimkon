// Pre-load data siswa saat aplikasi dibuka
document.addEventListener('DOMContentLoaded', async function() {
  loadDashboard();
  
  // Pre-load data siswa di background (tidak blocking UI)
  fetchSiswaData().then(() => {
    siswaDataReady = true;
    console.log('✅ Data siswa siap di cache');
  }).catch(e => console.error('Gagal pre-load:', e));
  
  loadDatabaseSaran();
  
  const deskripsiField = document.querySelector('#formLayanan textarea[name="deskripsi"]');
  const kategoriField = document.querySelector('#formLayanan select[name="kategori"]');
  if (deskripsiField) {
    deskripsiField.addEventListener('input', onDeskripsiChange);
    deskripsiField.addEventListener('blur', onDeskripsiChange);
  }
  if (kategoriField) kategoriField.addEventListener('change', onDeskripsiChange);
});

function switchPage(page, btn) {
  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('page-' + page).classList.add('active');
  
  if (page === 'dashboard') loadDashboard();
  if (page === 'administrasi') {
    loadAdministrasi();
    const firstTab = document.querySelector('#page-administrasi .admin-tab');
    if (firstTab) switchAdminTab('program', firstTab);
  }
  if (page === 'rpl-jadwal') {
    const firstTab = document.querySelector('#page-rpl-jadwal .admin-tab');
    if (firstTab) switchRJTab('rpl', firstTab);
  }
  if (page === 'layanan') {
    if (!siswaDataReady) {
      fetchSiswaData().then(() => { siswaDataReady = true; });
    }
    if (databaseSaranCache.length === 0) loadDatabaseSaran();
  }
  if (page === 'siswa') {
    resetSiswaForm();
    if (!siswaDataReady) {
      fetchSiswaData().then(() => { siswaDataReady = true; });
    }
  }
  if (page === 'laporan') {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('filter_tglMulai').value = firstDay.toISOString().split('T')[0];
    document.getElementById('filter_tglAkhir').value = today.toISOString().split('T')[0];
    loadLaporan();
  }
}
