function switchRPLJadwalMode(mode) {
  document.getElementById('rpl_jadwal_mode').value = mode;
  if (mode === 'rpl') {
    document.getElementById('formRPLFields').style.display = 'block';
    document.getElementById('formJadwalFields').style.display = 'none';
    document.getElementById('btnModeRPL').className = 'btn btn-info';
    document.getElementById('btnModeJadwal').className = 'btn btn-secondary';
    document.getElementById('btnRPLJadwal').innerText = '💾 Simpan RPL';
  } else {
    document.getElementById('formRPLFields').style.display = 'none';
    document.getElementById('formJadwalFields').style.display = 'block';
    document.getElementById('btnModeRPL').className = 'btn btn-secondary';
    document.getElementById('btnModeJadwal').className = 'btn btn-info';
    document.getElementById('btnRPLJadwal').innerText = '💾 Simpan Jadwal';
  }
}

async function submitRPLJadwal(e) {
  e.preventDefault();
  const mode = document.getElementById('rpl_jadwal_mode').value;
  const btn = document.getElementById('btnRPLJadwal');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formRPLJadwal'));
    const data = Object.fromEntries(formData);
    
    // Sesuaikan nama field jika mode jadwal
    if (mode === 'jadwal') {
      data.topik = data.topikJadwal;
      data.kelasTarget = data.kelasJadwal;
      data.jenisLayanan = data.jenisLayananJadwal;
    }

    const action = mode === 'rpl' ? 'simpanRPL' : 'simpanJadwal';
    const res = await apiPost(action, data);
    
    btn.disabled = false; 
    btn.innerText = mode === 'rpl' ? '💾 Simpan RPL' : '💾 Simpan Jadwal';
    showAlert('rpl-jadwal', res.message, res.success ? 'success' : 'error');
    if (res.success) { 
      document.getElementById('formRPLJadwal').reset(); 
      loadRPLJadwal(); 
    }
  } catch (err) { 
    btn.disabled = false; 
    showAlert('rpl-jadwal', 'Error: ' + err.message, 'error'); 
  }
}

async function loadRPLJadwal() {
  const filter = { 
    tanggal: document.getElementById('filter_rplj_tanggal').value, 
    kelas: document.getElementById('filter_rplj_kelas').value 
  };
  const listContainer = document.getElementById('rplJadwalList');
  listContainer.innerHTML = '<div class="loading">⏳ Memuat...</div>';
  try {
    // Kita ambil data RPL dan Jadwal sekaligus (opsional, atau pisah)
    // Untuk simplisitas, kita ambil Jadwal dulu
    const dataJadwal = await apiGet('getJadwal', filter);
    
    if (dataJadwal.length === 0) { listContainer.innerHTML = '<div class="loading">📭 Tidak ada data</div>'; return; }
    
    listContainer.innerHTML = dataJadwal.map(d => {
      const status = d['STATUS'] || 'Terjadwal';
      let badgeClass = 'badge-baru';
      if (status === 'Selesai') badgeClass = 'badge-selesai';
      else if (status === 'Dibatalkan') badgeClass = 'badge-rujuk';
      return '<div class="laporan-item"><div style="display:flex; justify-content:space-between;"><div><div class="laporan-nama">'+(d['TOPIK']||'-')+'</div><div class="laporan-kelas">'+(d['HARI']||'-')+', '+(d['TANGGAL']||'-')+' • '+(d['JAM_MULAI']||'-')+' - '+(d['JAM_SELESAI']||'-')+'</div></div><div style="text-align:right;"><div style="font-size:11px; color:#666;">'+(d['ID_JADWAL']||'-')+'</div><div style="font-size:11px; color:#999;">'+(d['KELAS']||'-')+'</div></div></div><div class="laporan-detail"><b>Jenis:</b> '+(d['JENIS_LAYANAN']||'-')+'</div><div class="laporan-detail"><b>Lokasi:</b> '+(d['LOKASI']||'-')+' • Petugas: '+(d['PETUGAS']||'-')+'</div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;"><span class="badge '+badgeClass+'">'+status+'</span><select onchange="updateStatusJadwal(\''+d['ID_JADWAL']+'\', this.value)" style="padding:4px; font-size:11px; width:auto;"><option value="Terjadwal" '+(status==='Terjadwal'?'selected':'')+'>Terjadwal</option><option value="Selesai" '+(status==='Selesai'?'selected':'')+'>Selesai</option><option value="Dibatalkan" '+(status==='Dibatalkan'?'selected':'')+'>Dibatalkan</option></select></div></div>';
    }).join('');
  } catch (e) { console.error(e); }
}

async function updateStatusJadwal(id, status) {
  try { const res = await apiPost('updateStatusJadwal', { id: id, status: status }); if (res.success) { showAlert('rpl-jadwal', '✅ Status diupdate!', 'success'); loadRPLJadwal(); } } catch (e) { console.error(e); }
}
