// ===== TAB RPL/JADWAL =====
function switchRJTab(tabName, btn) {
  document.querySelectorAll('#page-rpl-jadwal .admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#page-rpl-jadwal .admin-tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('rj-tab-' + tabName).style.display = 'block';
  
  if (tabName === 'rpl') loadRPL();
  if (tabName === 'jadwal') loadJadwal();
}

// ===== RPL =====
async function submitRPL(e) {
  e.preventDefault();
  const btn = document.getElementById('btnRPL');
  btn.disabled = true; btn.innerText = ' Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formRPL'));
    const data = Object.fromEntries(formData);
    const res = await apiPost('simpanRPL', data);
    btn.disabled = false; btn.innerText = '💾 Simpan RPL';
    showAlert('rpl', res.message, res.success ? 'success' : 'error');
    if (res.success) { document.getElementById('formRPL').reset(); loadRPL(); }
  } catch (err) { btn.disabled = false; showAlert('rpl', 'Error: ' + err.message, 'error'); }
}

async function loadRPL() {
  const filter = { jenisLayanan: document.getElementById('filter_rpl_jenis').value, kelas: document.getElementById('filter_rpl_kelas').value };
  const listContainer = document.getElementById('rplList');
  if (!listContainer) return;
  listContainer.innerHTML = '<div class="loading">⏳ Memuat...</div>';
  try {
    const data = await apiGet('getRPL', filter);
    if (data.length === 0) { listContainer.innerHTML = '<div class="loading">📭 Tidak ada data</div>'; return; }
    listContainer.innerHTML = data.map(d => '<div class="laporan-item"><div style="display:flex; justify-content:space-between;"><div><div class="laporan-nama">'+(d['TOPIK']||'-')+'</div><div class="laporan-kelas">'+(d['JENIS_LAYANAN']||'-')+' • Kelas: '+(d['KELAS_TARGET']||'-')+'</div></div><div style="text-align:right;"><div style="font-size:11px; color:#666;">'+(d['ID_RPL']||'-')+'</div><div style="font-size:11px; color:#999;">'+(d['TANGGAL']||'-')+'</div></div></div><div class="laporan-detail"><b>Tujuan:</b> '+(d['TUJUAN_LAYANAN']||'-')+'</div><div class="laporan-detail"><b>Materi:</b> '+(d['MATERI']||'-')+'</div><div class="laporan-detail"><b>Metode:</b> '+(d['METODE']||'-')+' • '+(d['WAKTU']||'0')+' menit</div></div>').join('');
  } catch (e) { console.error(e); }
}

// ===== JADWAL =====
async function submitJadwal(e) {
  e.preventDefault();
  const btn = document.getElementById('btnJadwal');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formJadwal'));
    const data = Object.fromEntries(formData);
    const res = await apiPost('simpanJadwal', data);
    btn.disabled = false; btn.innerText = '💾 Simpan Jadwal';
    showAlert('jadwal', res.message, res.success ? 'success' : 'error');
    if (res.success) { document.getElementById('formJadwal').reset(); loadJadwal(); }
  } catch (err) { btn.disabled = false; showAlert('jadwal', 'Error: ' + err.message, 'error'); }
}

async function loadJadwal() {
  const filter = { tanggal: document.getElementById('filter_jadwal_tanggal').value, kelas: document.getElementById('filter_jadwal_kelas').value };
  const listContainer = document.getElementById('jadwalList');
  if (!listContainer) return;
  listContainer.innerHTML = '<div class="loading"> Memuat...</div>';
  try {
    const data = await apiGet('getJadwal', filter);
    if (data.length === 0) { listContainer.innerHTML = '<div class="loading"> Tidak ada jadwal</div>'; return; }
    listContainer.innerHTML = data.map(d => {
      const status = d['STATUS'] || 'Terjadwal';
      let badgeClass = 'badge-baru';
      if (status === 'Selesai') badgeClass = 'badge-selesai';
      else if (status === 'Dibatalkan') badgeClass = 'badge-rujuk';
      return '<div class="laporan-item"><div style="display:flex; justify-content:space-between;"><div><div class="laporan-nama">'+(d['TOPIK']||'-')+'</div><div class="laporan-kelas">'+(d['HARI']||'-')+', '+(d['TANGGAL']||'-')+' • '+(d['JAM_MULAI']||'-')+' - '+(d['JAM_SELESAI']||'-')+'</div></div><div style="text-align:right;"><div style="font-size:11px; color:#666;">'+(d['ID_JADWAL']||'-')+'</div><div style="font-size:11px; color:#999;">'+(d['KELAS']||'-')+'</div></div></div><div class="laporan-detail"><b>Jenis:</b> '+(d['JENIS_LAYANAN']||'-')+'</div><div class="laporan-detail"><b>Lokasi:</b> '+(d['LOKASI']||'-')+' • Petugas: '+(d['PETUGAS']||'-')+'</div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;"><span class="badge '+badgeClass+'">'+status+'</span><select onchange="updateStatusJadwal(\''+d['ID_JADWAL']+'\', this.value)" style="padding:4px; font-size:11px; width:auto;"><option value="Terjadwal" '+(status==='Terjadwal'?'selected':'')+'>Terjadwal</option><option value="Selesai" '+(status==='Selesai'?'selected':'')+'>Selesai</option><option value="Dibatalkan" '+(status==='Dibatalkan'?'selected':'')+'>Dibatalkan</option></select></div></div>';
    }).join('');
  } catch (e) { console.error(e); }
}

async function updateStatusJadwal(id, status) {
  try { const res = await apiPost('updateStatusJadwal', { id: id, status: status }); if (res.success) { showAlert('jadwal', '✅ Status diupdate!', 'success'); loadJadwal(); } } catch (e) { console.error(e); }
}
