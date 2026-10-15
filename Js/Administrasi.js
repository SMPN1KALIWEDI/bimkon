// ============================================
// FILE: js/administrasi.js
// FUNGSI: Administrasi BK + Template + Import
// ============================================

const TEMPLATES = [
  { id: 'template_tahunan', icon: '📅', nama: 'Program Tahunan BK', tag: 'Tahunan', jenis: 'Program Tahunan', periode: 'Tahun Pelajaran 2025/2026', tujuan: 'Meningkatkan kualitas layanan BK.', deskripsi: 'Program kerja BK selama satu tahun pelajaran.', targetSasaran: 'Seluruh peserta didik kelas 7, 8, 9', metode: 'Bimbingan klasikal, konseling', evaluasi: 'Evaluasi akhir semester.', petugas: 'Tim BK SMP' },
  { id: 'template_semester1', icon: '📚', nama: 'Program Semester 1', tag: 'Semester', jenis: 'Program Semester', periode: 'Semester Ganjil 2025/2026', tujuan: 'Layanan BK terstruktur.', deskripsi: 'Orientasi, bimbingan belajar, pencegahan bullying.', targetSasaran: 'Siswa kelas 7, 8, 9', metode: 'Bimbingan klasikal, home visit', evaluasi: 'Monitoring bulanan.', petugas: 'Tim BK SMP' },
  { id: 'template_bulanan', icon: '🗓️', nama: 'Program Bulanan', tag: 'Bulanan', jenis: 'Program Bulanan', periode: 'Oktober 2025', tujuan: 'Kegiatan BK terfokus.', deskripsi: 'Bimbingan klasikal, konseling kelompok.', targetSasaran: 'Kelas 7A-9A', metode: 'Ceramah, diskusi, role play', evaluasi: 'Pre-test dan post-test.', petugas: 'Tim BK SMP' },
  { id: 'template_mingguan', icon: '', nama: 'Program Mingguan', tag: 'Mingguan', jenis: 'Program Mingguan', periode: 'Minggu ke-2 Oktober 2025', tujuan: 'Layanan bimbingan klasikal.', deskripsi: 'Jadwal layanan BK mingguan.', targetSasaran: 'Kelas 7A, 7B', metode: 'Bimbingan klasikal 45 menit', evaluasi: 'Catatan hasil layanan.', petugas: 'Tim BK SMP' },
  { id: 'template_rpl', icon: '📝', nama: 'RPL Bimbingan Klasikal', tag: 'RPL', jenis: 'Program Mingguan', periode: 'RPL Standar', tujuan: 'Siswa mampu menerapkan teknik belajar efektif.', deskripsi: 'RPL topik Belajar Efektif.', targetSasaran: 'Siswa kelas 7/8/9', metode: 'Ceramah, diskusi, praktik', evaluasi: 'Observasi dan kuesioner.', petugas: 'Guru BK' },
  { id: 'template_laporan', icon: '📊', nama: 'Laporan Bulanan BK', tag: 'Laporan', jenis: 'Program Bulanan', periode: 'Laporan Bulan Berjalan', tujuan: 'Dokumentasi kegiatan BK.', deskripsi: 'Rekapitulasi layanan BK bulanan.', targetSasaran: 'Kepala Sekolah', metode: 'Rekap data buku kasus', evaluasi: 'Analisis capaian.', petugas: 'Koordinator BK' }
];

function renderTemplates() {
  const container = document.getElementById('templateList');
  container.innerHTML = TEMPLATES.map(t => `
    <div class="template-card" onclick="openTemplateEdit('${t.id}')">
      <div class="template-icon">${t.icon}</div>
      <div class="template-name">${t.nama}</div>
      <div class="template-desc">${t.deskripsi.substring(0, 100)}...</div>
      <span class="template-tag">${t.tag}</span>
      <span class="template-tag" style="background:#e8f5e9; color:#28a745;">✏️ Klik untuk Edit</span>
    </div>
  `).join('');
}

function openTemplateEdit(id) {
  const tpl = TEMPLATES.find(t => t.id === id);
  if (!tpl) return;
  document.getElementById('tpl_id').value = tpl.id;
  document.getElementById('tpl_jenis').value = tpl.jenis;
  document.getElementById('tpl_periode').value = tpl.periode;
  document.getElementById('tpl_tujuan').value = tpl.tujuan;
  document.getElementById('tpl_deskripsi').value = tpl.deskripsi;
  document.getElementById('tpl_target').value = tpl.targetSasaran;
  document.getElementById('tpl_metode').value = tpl.metode;
  document.getElementById('tpl_evaluasi').value = tpl.evaluasi;
  document.getElementById('tpl_petugas').value = tpl.petugas;
  document.getElementById('modalEdit').classList.add('show');
}

function closeModal() { document.getElementById('modalEdit').classList.remove('show'); }

async function submitTemplateEdit(e) {
  e.preventDefault();
  const formData = new FormData(document.getElementById('formTemplateEdit'));
  const data = Object.fromEntries(formData);
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const res = await apiPost('simpanDariTemplate', data);
    btn.disabled = false; btn.innerText = '💾 Simpan ke Administrasi BK';
    showAlert('template', res.message, res.success ? 'success' : 'error');
    if (res.success) closeModal();
  } catch (err) { btn.disabled = false; showAlert('template', 'Error: ' + err.message, 'error'); }
}

async function importFromUrl() {
  const url = document.getElementById('importUrl').value.trim();
  const resultDiv = document.getElementById('importUrlResult');
  if (!url) { resultDiv.innerHTML = '<div class="alert alert-error" style="display:block;">⚠️ Masukkan URL!</div>'; return; }
  resultDiv.innerHTML = '<div class="loading">⏳ Mengambil data...</div>';
  try {
    const res = await apiGet('parseUrlContent', { url: url });
    if (res.success) {
      if (res.type === 'json' && Array.isArray(res.data)) {
        resultDiv.innerHTML = `<div class="alert alert-success" style="display:block;">✅ ${res.data.length} data diambil!</div>` +
          res.data.slice(0, 5).map((item, idx) => `<div class="template-card" onclick='openImportedEdit(${JSON.stringify(item).replace(/'/g, "\\'")})'><div class="template-name">Data ${idx + 1}: ${item.nama || item.nama_program || item.JENIS_PROGRAM || 'Tanpa Nama'}</div><div class="template-desc">${(item.deskripsi || item.DESKRIPSI || '').substring(0, 100)}</div><span class="template-tag">📥 Imported</span></div>`).join('');
      } else if (res.type === 'text') {
        resultDiv.innerHTML = `<div class="alert alert-success" style="display:block;">✅ Konten diambil!</div><textarea style="width:100%; height:150px; margin-top:10px;">${res.data}</textarea>`;
      } else { resultDiv.innerHTML = '<div class="alert alert-error" style="display:block;">⚠️ Format tidak dikenali.</div>'; }
    } else { resultDiv.innerHTML = `<div class="alert alert-error" style="display:block;">❌ ${res.message}</div>`; }
  } catch (e) { resultDiv.innerHTML = `<div class="alert alert-error" style="display:block;">❌ ${e.message}</div>`; }
}

function openImportedEdit(item) {
  document.getElementById('tpl_id').value = 'imported_' + Date.now();
  document.getElementById('tpl_jenis').value = item.jenisProgram || item.JENIS_PROGRAM || 'Program Bulanan';
  document.getElementById('tpl_periode').value = item.periode || item.PERIODE || '';
  document.getElementById('tpl_tujuan').value = item.tujuan || item.TUJUAN || '';
  document.getElementById('tpl_deskripsi').value = item.deskripsi || item.DESKRIPSI || '';
  document.getElementById('tpl_target').value = item.targetSasaran || item.TARGET_SASARAN || '';
  document.getElementById('tpl_metode').value = item.metode || item.METODE || '';
  document.getElementById('tpl_evaluasi').value = item.evaluasi || item.EVALUASI || '';
  document.getElementById('tpl_petugas').value = item.petugas || item.PETUGAS || '';
  document.getElementById('modalEdit').classList.add('show');
}

function importFromFile() {
  const fileInput = document.getElementById('importFile');
  const resultDiv = document.getElementById('importFileResult');
  const file = fileInput.files[0];
  if (!file) { resultDiv.innerHTML = '<div class="alert alert-error" style="display:block;">️ Pilih file!</div>'; return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      let data = [];
      if (file.name.endsWith('.json')) data = JSON.parse(content);
      else if (file.name.endsWith('.csv')) {
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(/[,;]/).map(h => h.trim().replace(/"/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/"/g, ''));
          const row = {}; headers.forEach((h, idx) => row[h] = values[idx] || ''); data.push(row);
        }
      }
      if (Array.isArray(data) && data.length > 0) {
        resultDiv.innerHTML = `<div class="alert alert-success" style="display:block;">✅ ${data.length} data dari file!</div>` +
          data.slice(0, 5).map((item, idx) => `<div class="template-card" onclick='openImportedEdit(${JSON.stringify(item).replace(/'/g, "\\'")})'><div class="template-name">Data ${idx + 1}: ${item.nama || item.nama_program || item.JENIS_PROGRAM || 'Tanpa Nama'}</div><div class="template-desc">${(item.deskripsi || item.DESKRIPSI || '').substring(0, 100)}</div><span class="template-tag">📁 From File</span></div>`).join('');
      } else { resultDiv.innerHTML = '<div class="alert alert-error" style="display:block;">⚠️ File kosong.</div>'; }
    } catch (err) { resultDiv.innerHTML = `<div class="alert alert-error" style="display:block;">❌ ${err.message}</div>`; }
  };
  reader.readAsText(file);
}

async function submitAdministrasi(e) {
  e.preventDefault();
  const btn = document.getElementById('btnAdministrasi');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formAdministrasi'));
    const data = Object.fromEntries(formData);
    const res = await apiPost('simpanAdministrasi', data);
    btn.disabled = false; btn.innerText = '💾 Simpan Program';
    showAlert('administrasi', res.message, res.success ? 'success' : 'error');
    if (res.success) { document.getElementById('formAdministrasi').reset(); loadAdministrasi(); }
  } catch (err) { btn.disabled = false; showAlert('administrasi', 'Error: ' + err.message, 'error'); }
}

async function loadAdministrasi() {
  const filter = { jenisProgram: document.getElementById('filter_admin_jenis').value, status: document.getElementById('filter_admin_status').value };
  const listContainer = document.getElementById('administrasiList');
  listContainer.innerHTML = '<div class="loading">⏳ Memuat...</div>';
  try {
    const data = await apiGet('getAdministrasi', filter);
    if (data.length === 0) { listContainer.innerHTML = '<div class="loading">📭 Tidak ada data</div>'; return; }
    listContainer.innerHTML = data.map(d => {
      const status = d['STATUS'] || 'Draft';
      let badgeClass = 'badge-baru';
      if (status === 'Aktif') badgeClass = 'badge-proses';
      else if (status === 'Selesai') badgeClass = 'badge-selesai';
      return '<div class="laporan-item"><div style="display:flex; justify-content:space-between;"><div><div class="laporan-nama">'+(d['JENIS_PROGRAM']||'-')+'</div><div class="laporan-kelas">Periode: '+(d['PERIODE']||'-')+'</div></div><div style="text-align:right;"><div style="font-size:11px; color:#666;">'+(d['ID_PROGRAM']||'-')+'</div><div style="font-size:11px; color:#999;">'+(d['TANGGAL_MULAI']||'-')+'</div></div></div><div class="laporan-detail"><b>Tujuan:</b> '+(d['TUJUAN']||'-')+'</div><div class="laporan-detail"><b>Target:</b> '+(d['TARGET_SASARAN']||'-')+'</div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;"><span class="badge '+badgeClass+'">'+status+'</span><select onchange="updateStatusAdmin(\''+d['ID_PROGRAM']+'\', this.value)" style="padding:4px; font-size:11px; width:auto;"><option value="Draft" '+(status==='Draft'?'selected':'')+'>Draft</option><option value="Aktif" '+(status==='Aktif'?'selected':'')+'>Aktif</option><option value="Selesai" '+(status==='Selesai'?'selected':'')+'>Selesai</option></select></div></div>';
    }).join('');
  } catch (e) { console.error(e); }
}

async function updateStatusAdmin(id, status) {
  try { const res = await apiPost('updateStatusAdministrasi', { id: id, status: status }); if (res.success) { showAlert('administrasi', '✅ Status diupdate!', 'success'); loadAdministrasi(); } } catch (e) { console.error(e); }
}
