// ============================================
// FILE: Js/siswa.js
// FUNGSI: Lengkapi Data Siswa (menggunakan cache GitHub)
// ============================================

// Load data siswa saat halaman dimuat
let siswaDataReady = false;

async function ensureSiswaData() {
  if (!siswaDataReady) {
    await fetchSiswaData();
    siswaDataReady = true;
  }
}

// ===== POPULATE DROPDOWN DARI CACHE (INSTAN!) =====
async function loadKelas(prefix) {
  await ensureSiswaData();
  const tingkat = document.getElementById(prefix + '_tingkat').value;
  const selKelas = document.getElementById(prefix + '_kelas');
  const selNama = document.getElementById(prefix + '_nama');
  
  selKelas.innerHTML = '<option value="">Pilih Kelas</option>';
  selKelas.disabled = true;
  selNama.innerHTML = '<option value="">Pilih Kelas dulu</option>';
  selNama.disabled = true;
  
  if (prefix === 'lay') document.getElementById('lay_selected').style.display = 'none';
  if (!tingkat) return;
  
  const kelasList = _dataCache.kelas[tingkat] || [];
  kelasList.forEach(k => {
    selKelas.innerHTML += `<option value="${k}">${k}</option>`;
  });
  selKelas.disabled = false;
}

async function loadSiswa(prefix) {
  await ensureSiswaData();
  const kelas = document.getElementById(prefix + '_kelas').value;
  const selNama = document.getElementById(prefix + '_nama');
  
  selNama.innerHTML = '<option value="">Pilih Nama Siswa</option>';
  selNama.disabled = true;
  
  if (prefix === 'lay') document.getElementById('lay_selected').style.display = 'none';
  if (!kelas) return;
  
  const siswaList = _dataCache.siswaByKelas[kelas] || [];
  siswaList.forEach(s => {
    selNama.innerHTML += `<option value="${s.nisn}" data-nama="${s.nama}" data-kelas="${s.kelas}">${s.nama}</option>`;
  });
  selNama.disabled = false;
}

function selectSiswa(prefix) {
  const sel = document.getElementById(prefix + '_nama');
  const opt = sel.options[sel.selectedIndex];
  if (opt.value) {
    document.getElementById('lay_nisn').value = opt.value;
    document.getElementById('lay_nama_display').innerText = opt.getAttribute('data-nama');
    document.getElementById('lay_nisn_display').innerText = opt.value;
    document.getElementById('lay_kelas_display').innerText = opt.getAttribute('data-kelas');
    document.getElementById('lay_selected').style.display = 'block';
  }
}

// ===== LENGKAPI DATA SISWA =====
async function selectSiswaEdit(prefix) {
  const sel = document.getElementById(prefix + '_nama');
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value) return;
  
  // Ambil dari cache (INSTAN, tanpa API call!)
  const siswa = cariSiswaFromCache(opt.value);
  if (!siswa) {
    showAlert('siswa', '❌ Siswa tidak ditemukan!', 'error');
    return;
  }
  
  // Tampilkan form
  document.getElementById('formSiswa').style.display = 'block';
  document.getElementById('siswaEmptyState').style.display = 'none';
  
  // Isi field READONLY
  document.getElementById('s_nisn').value = siswa.nisn;
  document.getElementById('s_nama').value = siswa.nama;
  document.getElementById('s_kelas').value = siswa.kelas;
  
  // Isi field yang bisa diedit
  document.getElementById('s_jk').value = siswa.jk || '';
  document.getElementById('s_status').value = siswa.status || 'Aktif';
  document.getElementById('s_hp1').value = siswa.no_hp || '';
  document.getElementById('s_hp2').value = siswa.no_ortu || '';
  document.getElementById('s_alamat').value = siswa.alamat || '';
  
  document.getElementById('formSiswa').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showAlert('siswa', '✅ Data dimuat. Silakan lengkapi yang kosong.', 'success');
}

async function submitSiswa(e) {
  e.preventDefault();
  const nisn = document.getElementById('s_nisn').value;
  if (!nisn) { showAlert('siswa', '⚠️ NISN tidak valid!', 'error'); return; }
  
  const btn = document.getElementById('btnSiswa');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  
  try {
    const formData = new FormData(document.getElementById('formSiswa'));
    const data = Object.fromEntries(formData);
    const res = await apiPost('updateSiswa', data);
    
    btn.disabled = false;
    btn.innerText = '💾 Simpan Perubahan';
    showAlert('siswa', res.message, res.success ? 'success' : 'error');
    
    if (res.success) {
      // Update cache lokal agar data terbaru
      const idx = _dataCache.siswa.findIndex(s => s.nisn === nisn);
      if (idx !== -1) {
        _dataCache.siswa[idx].jk = data.jenisKelamin;
        _dataCache.siswa[idx].status = data.status;
        _dataCache.siswa[idx].no_hp = data.noHpSiswa;
        _dataCache.siswa[idx].no_ortu = data.noHpOrtu;
        _dataCache.siswa[idx].alamat = data.alamat;
        try { localStorage.setItem('bk_siswa_cache', JSON.stringify(_dataCache)); } catch(e){}
      }
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerText = '💾 Simpan Perubahan';
    showAlert('siswa', 'Error: ' + err.message, 'error');
  }
}

function resetSiswaForm() {
  document.getElementById('formSiswa').style.display = 'none';
  document.getElementById('siswaEmptyState').style.display = 'block';
  document.getElementById('formSiswa').reset();
  document.getElementById('alert-siswa').style.display = 'none';
  document.getElementById('siswa_tingkat').value = '';
  document.getElementById('siswa_kelas').innerHTML = '<option value="">Pilih Kelas</option>';
  document.getElementById('siswa_kelas').disabled = true;
  document.getElementById('siswa_nama').innerHTML = '<option value="">Pilih Nama Siswa</option>';
  document.getElementById('siswa_nama').disabled = true;
}
