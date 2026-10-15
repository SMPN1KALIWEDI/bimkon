// ============================================
// FILE: Js/siswa.js
// FUNGSI: HANYA LENGKAPI DATA SISWA (BUKAN CRUD)
// NISN = KUNCI PENGAIT (READONLY)
// ============================================

async function loadKelas(prefix) {
  const tingkat = document.getElementById(prefix + '_tingkat').value;
  const selKelas = document.getElementById(prefix + '_kelas');
  const selNama = document.getElementById(prefix + '_nama');
  selKelas.innerHTML = '<option value="">Memuat...</option>'; selKelas.disabled = true;
  selNama.innerHTML = '<option value="">Pilih Kelas dulu</option>'; selNama.disabled = true;
  if(prefix === 'lay') document.getElementById('lay_selected').style.display = 'none';
  if (!tingkat) { selKelas.innerHTML = '<option value="">Pilih Kelas</option>'; return; }
  try {
    const list = await apiGet('getDaftarKelas', { tingkat: tingkat });
    selKelas.innerHTML = '<option value="">Pilih Kelas</option>';
    list.forEach(k => selKelas.innerHTML += '<option value="'+k+'">'+k+'</option>');
    selKelas.disabled = false;
  } catch (e) { console.error(e); }
}

async function loadSiswa(prefix) {
  const kelas = document.getElementById(prefix + '_kelas').value;
  const selNama = document.getElementById(prefix + '_nama');
  selNama.innerHTML = '<option value="">Memuat...</option>'; selNama.disabled = true;
  if(prefix === 'lay') document.getElementById('lay_selected').style.display = 'none';
  if (!kelas) { selNama.innerHTML = '<option value="">Pilih Nama Siswa</option>'; return; }
  try {
    const list = await apiGet('getSiswaByKelas', { kelas: kelas });
    selNama.innerHTML = '<option value="">Pilih Nama Siswa</option>';
    list.forEach(s => selNama.innerHTML += '<option value="'+s.nisn+'" data-nama="'+s.nama+'" data-kelas="'+s.kelas+'">'+s.nama+'</option>');
    selNama.disabled = false;
  } catch (e) { console.error(e); }
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

// FUNGSI BARU: Hanya untuk melengkapi data (bukan tambah)
async function selectSiswaEdit(prefix) {
  const sel = document.getElementById(prefix + '_nama');
  const opt = sel.options[sel.selectedIndex];
  if (!opt.value) return;
  
  try {
    const res = await apiGet('cariSiswaByNISN', { nisn: opt.value });
    if (res.found) {
      // Tampilkan form
      document.getElementById('formSiswa').style.display = 'block';
      document.getElementById('siswaEmptyState').style.display = 'none';
      
      // Isi field READONLY (tidak bisa diubah)
      document.getElementById('s_nisn').value = res.data.NISN;
      document.getElementById('s_nama').value = res.data.NAMA;
      document.getElementById('s_kelas').value = res.data.KLS;
      
      // Isi field yang bisa diedit
      document.getElementById('s_jk').value = res.data.L_P || '';
      document.getElementById('s_status').value = res.data.STATUS || 'Aktif';
      document.getElementById('s_hp1').value = res.data.NO_SISWA || '';
      document.getElementById('s_hp2').value = res.data.NO_ORTU || '';
      document.getElementById('s_alamat').value = res.data.ALAMAT || '';
      
      // Scroll ke form
      document.getElementById('formSiswa').scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      showAlert('siswa', '✅ Data siswa dimuat. Silakan lengkapi yang masih kosong.', 'success');
    } else {
      showAlert('siswa', '❌ Siswa tidak ditemukan!', 'error');
    }
  } catch (e) { 
    console.error(e);
    showAlert('siswa', 'Error: ' + e.message, 'error');
  }
}

// FUNGSI BARU: Hanya update, tidak ada tambah
async function submitSiswa(e) {
  e.preventDefault();
  
  const nisn = document.getElementById('s_nisn').value;
  if (!nisn) {
    showAlert('siswa', '⚠️ NISN tidak valid!', 'error');
    return;
  }
  
  const btn = document.getElementById('btnSiswa');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  
  try {
    const formData = new FormData(document.getElementById('formSiswa'));
    const data = Object.fromEntries(formData);
    
    // PAKSA mode = update (tidak ada tambah)
    const res = await apiPost('updateSiswa', data);
    
    btn.disabled = false;
    btn.innerText = '💾 Simpan Perubahan';
    showAlert('siswa', res.message, res.success ? 'success' : 'error');
    
    if (res.success) {
      // Tetap tampilkan form untuk edit lanjutan
      setTimeout(() => {
        showAlert('siswa', '✅ Data berhasil diperbarui!', 'success');
      }, 1500);
    }
  } catch (err) { 
    btn.disabled = false;
    btn.innerText = '💾 Simpan Perubahan';
    showAlert('siswa', 'Error: ' + err.message, 'error'); 
  }
}

function resetSiswaForm() {
  // Sembunyikan form, tampilkan empty state
  document.getElementById('formSiswa').style.display = 'none';
  document.getElementById('siswaEmptyState').style.display = 'block';
  document.getElementById('formSiswa').reset();
  document.getElementById('alert-siswa').style.display = 'none';
  
  // Reset dropdown pencarian
  document.getElementById('siswa_tingkat').value = '';
  document.getElementById('siswa_kelas').innerHTML = '<option value="">Pilih Kelas</option>';
  document.getElementById('siswa_kelas').disabled = true;
  document.getElementById('siswa_nama').innerHTML = '<option value="">Pilih Nama Siswa</option>';
  document.getElementById('siswa_nama').disabled = true;
}
