// ============================================
// FILE: js/siswa.js
// FUNGSI: Kelola Data Siswa
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

async function selectSiswaEdit(prefix) {
  const sel = document.getElementById(prefix + '_nama');
  const opt = sel.options[sel.selectedIndex];
  if (opt.value) {
    try {
      const res = await apiGet('cariSiswaByNISN', { nisn: opt.value });
      if (res.found) {
        document.getElementById('siswa_mode').value = 'edit';
        document.getElementById('s_nisn').value = res.data.NISN;
        document.getElementById('s_nama').value = res.data.NAMA;
        document.getElementById('s_kelas').value = res.data.KLS;
        document.getElementById('s_jk').value = res.data.L_P;
        document.getElementById('s_hp1').value = res.data.NO_SISWA;
        document.getElementById('s_hp2').value = res.data.NO_ORTU;
        document.getElementById('s_alamat').value = res.data.ALAMAT;
        document.getElementById('s_status').value = res.data.STATUS;
        document.getElementById('btnSiswa').innerText = '💾 Update Data';
        document.getElementById('btnSiswa').className = 'btn btn-warning';
        document.getElementById('btnReset').style.display = 'block';
        showAlert('siswa', 'Data dimuat. Silakan edit.', 'success');
      }
    } catch (e) { console.error(e); }
  }
}

async function submitSiswa(e) {
  e.preventDefault();
  const mode = document.getElementById('siswa_mode').value;
  const btn = document.getElementById('btnSiswa');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formSiswa'));
    const data = Object.fromEntries(formData);
    const res = await apiPost(mode === 'edit' ? 'updateSiswa' : 'tambahSiswa', data);
    btn.disabled = false;
    btn.innerText = mode === 'edit' ? '💾 Update Data' : '➕ Tambah Siswa';
    showAlert('siswa', res.message, res.success ? 'success' : 'error');
    if (res.success && mode === 'tambah') document.getElementById('formSiswa').reset();
  } catch (err) { btn.disabled = false; showAlert('siswa', 'Error: ' + err.message, 'error'); }
}

function resetSiswaForm() {
  document.getElementById('formSiswa').reset();
  document.getElementById('siswa_mode').value = 'tambah';
  document.getElementById('btnSiswa').innerText = '➕ Tambah Siswa';
  document.getElementById('btnSiswa').className = 'btn btn-success';
  document.getElementById('btnReset').style.display = 'none';
  document.getElementById('alert-siswa').style.display = 'none';
}
