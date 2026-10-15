// ============================================
// FILE: js/layanan.js
// FUNGSI: Input Layanan + Saran AI
// ============================================

let saranTimer = null;
let databaseSaranCache = [];

async function loadDatabaseSaran() {
  try { databaseSaranCache = await apiGet('getDatabaseSaran'); } catch (e) { console.error(e); }
}

function cariSaranLokal(deskripsi, kategori) {
  if (!deskripsi || databaseSaranCache.length === 0) return [];
  const teks = String(deskripsi).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const kataKunciInput = teks.split(' ').filter(k => k.length > 2);
  const hasil = databaseSaranCache.map(saran => {
    const kataKunciSaran = String(saran.KATA_KUNCI || '').toLowerCase().split(',').map(k => k.trim());
    let score = 0; const matched = [];
    kataKunciSaran.forEach(kk => {
      if (kk.length < 2) return;
      if (teks.includes(kk)) { score += 2; matched.push(kk); }
      else { kataKunciInput.forEach(ki => { if (ki.includes(kk) || kk.includes(ki)) { score += 1; if (!matched.includes(kk)) matched.push(kk); } }); }
    });
    if (kategori && saran.KATEGORI === kategori) score += 3;
    return { ...saran, score, matchedKeywords: matched };
  });
  return hasil.filter(h => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

function renderSaranAI(saranList) {
  const panel = document.getElementById('saranAiPanel');
  const content = document.getElementById('saranAiContent');
  if (!saranList || saranList.length === 0) {
    content.innerHTML = '<div class="saran-empty">😕 Tidak ada saran yang cocok.</div>';
    panel.classList.add('show'); return;
  }
  content.innerHTML = saranList.map((s, idx) => `
    <div class="saran-item">
      <div class="saran-item-header">
        <div><span class="saran-kategori">${s.KATEGORI || '-'}</span><span class="saran-score">Relevansi: ${s.score}</span></div>
        <button class="btn-terapkan" onclick="terapkanSaran(${idx})">✨ Terapkan Saran</button>
      </div>
      <div class="saran-text">${s.SARAN_TINDAK_LANJUT || '-'}</div>
      <div class="saran-keywords">🔍 Kata kunci: ${s.matchedKeywords.map(k => `<span>${k}</span>`).join('')}</div>
      ${s.REFERENSI ? `<div style="font-size:10px; color:#999; margin-top:4px;">📚 ${s.REFERENSI}</div>` : ''}
    </div>
  `).join('');
  panel.classList.add('show');
  window._currentSaranList = saranList;
}

function terapkanSaran(idx) {
  const saran = window._currentSaranList[idx];
  if (!saran) return;
  const textarea = document.querySelector('#formLayanan textarea[name="tindakLanjut"]');
  if (textarea) {
    const existing = textarea.value.trim();
    textarea.value = existing ? existing + '\n\n--- Saran AI ---\n' + saran.SARAN_TINDAK_LANJUT : saran.SARAN_TINDAK_LANJUT;
    textarea.focus();
    showAlert('layanan', '✅ Saran diterapkan! Silakan edit.', 'success');
  }
}

function onDeskripsiChange() {
  const deskripsi = document.querySelector('#formLayanan textarea[name="deskripsi"]')?.value || '';
  const kategori = document.querySelector('#formLayanan select[name="kategori"]')?.value || '';
  clearTimeout(saranTimer);
  if (deskripsi.length < 10) { document.getElementById('saranAiPanel').classList.remove('show'); return; }
  saranTimer = setTimeout(() => { renderSaranAI(cariSaranLokal(deskripsi, kategori)); }, 800);
}

async function submitLayanan(e) {
  e.preventDefault();
  if (!document.getElementById('lay_nisn').value) { showAlert('layanan', '⚠️ Pilih siswa!', 'error'); return; }
  const btn = document.getElementById('btnLayanan');
  btn.disabled = true; btn.innerText = '⏳ Menyimpan...';
  try {
    const formData = new FormData(document.getElementById('formLayanan'));
    const data = Object.fromEntries(formData);
    const res = await apiPost('simpanLayananDenganSaran', data);
    btn.disabled = false; btn.innerText = '💾 Simpan Layanan';
    showAlert('layanan', res.message, res.success ? 'success' : 'error');
    if (res.success) {
      document.getElementById('formLayanan').reset();
      document.getElementById('lay_selected').style.display = 'none';
      document.getElementById('lay_nama').innerHTML = '<option value="">Pilih Nama Siswa</option>';
      document.getElementById('lay_nama').disabled = true;
      document.getElementById('saranAiPanel').classList.remove('show');
    }
  } catch (err) { btn.disabled = false; showAlert('layanan', 'Error: ' + err.message, 'error'); }
}
