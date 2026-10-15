// ============================================
// FILE: Js/api.js
// FUNGSI: API Communication + GitHub Data Fetch
// ============================================

const API_URL = 'https://script.google.com/macros/s/AKfycbxMJaZ7GLeA9xH92YQCvan4JWvMxR3GxQ1bxXDQSxsEwCqaXU4LxZpMMedv8LTOAAhqeg/exec';
const GITHUB_DATA_URL = 'https://smpn1kaliwedi.github.io/bimkon/data';

// ===== API APPS SCRIPT (untuk write operations) =====
async function apiGet(action, params = {}) {
  params.action = action;
  const queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
  const response = await fetch(API_URL + '?' + queryString);
  return await response.json();
}

async function apiPost(action, data = {}) {
  await fetch(API_URL + '?action=' + action, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return { success: true, message: 'Data berhasil dikirim!' };
}

// ===== GITHUB DATA FETCH (untuk read - SUPER CEPAT) =====
let _dataCache = {
  siswa: null,
  kelas: null,
  siswaByKelas: null,
  lastUpdate: null
};

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 jam

async function fetchSiswaData(forceRefresh = false) {
  const now = Date.now();
  
  // Cek cache localStorage
  if (!forceRefresh && _dataCache.siswa && (now - _dataCache.lastUpdate) < CACHE_EXPIRY) {
    return _dataCache;
  }
  
  // Coba load dari localStorage dulu
  try {
    const cached = localStorage.getItem('bk_siswa_cache');
    if (cached && !forceRefresh) {
      const parsed = JSON.parse(cached);
      if (now - parsed.lastUpdate < CACHE_EXPIRY) {
        _dataCache = parsed;
        return _dataCache;
      }
    }
  } catch (e) {}
  
  // Fetch dari GitHub (cepat!)
  try {
    const [siswaRes, kelasRes, byKelasRes] = await Promise.all([
      fetch(GITHUB_DATA_URL + '/siswa.json?t=' + now),
      fetch(GITHUB_DATA_URL + '/kelas.json?t=' + now),
      fetch(GITHUB_DATA_URL + '/siswa_by_kelas.json?t=' + now)
    ]);
    
    _dataCache = {
      siswa: await siswaRes.json(),
      kelas: await kelasRes.json(),
      siswaByKelas: await byKelasRes.json(),
      lastUpdate: now
    };
    
    // Simpan ke localStorage
    try {
      localStorage.setItem('bk_siswa_cache', JSON.stringify(_dataCache));
    } catch (e) {}
    
    console.log('✅ Data siswa dimuat dari GitHub:', _dataCache.siswa.length, 'siswa');
    return _dataCache;
  } catch (e) {
    console.error('❌ Gagal fetch dari GitHub, fallback ke API:', e);
    // Fallback ke API Apps Script (lambat tapi pasti ada)
    return await fallbackToApi();
  }
}

async function fallbackToApi() {
  try {
    const semuaSiswa = await apiGet('getAllSiswa');
    const kelas = {};
    const siswaByKelas = {};
    
    semuaSiswa.forEach(s => {
      if (s.STATUS === 'Aktif') {
        const tingkat = s.KLS.charAt(0);
        if (!kelas[tingkat]) kelas[tingkat] = new Set();
        kelas[tingkat].add(s.KLS);
        
        if (!siswaByKelas[s.KLS]) siswaByKelas[s.KLS] = [];
        siswaByKelas[s.KLS].push({ nisn: s.NISN, nama: s.NAMA, kelas: s.KLS });
      }
    });
    
    // Convert Set ke Array
    Object.keys(kelas).forEach(t => kelas[t] = Array.from(kelas[t]).sort());
    Object.keys(siswaByKelas).forEach(k => siswaByKelas[k].sort((a,b) => a.nama.localeCompare(b.nama)));
    
    _dataCache = {
      siswa: semuaSiswa.map(s => ({
        nisn: s.NISN, nama: s.NAMA, kelas: s.KLS,
        jk: s.L_P, no_hp: s.NO_SISWA, no_ortu: s.NO_ORTU,
        alamat: s.ALAMAT, status: s.STATUS
      })),
      kelas: kelas,
      siswaByKelas: siswaByKelas,
      lastUpdate: Date.now()
    };
    
    return _dataCache;
  } catch (e) {
    console.error('Fallback API juga gagal:', e);
    return { siswa: [], kelas: {}, siswaByKelas: {}, lastUpdate: 0 };
  }
}

// Helper untuk cari siswa by NISN dari cache
function cariSiswaFromCache(nisn) {
  if (!_dataCache.siswa) return null;
  return _dataCache.siswa.find(s => s.nisn === String(nisn).trim()) || null;
}

// ===== UI HELPERS =====
function showAlert(page, msg, type) {
  const el = document.getElementById('alert-' + page);
  if (!el) { alert(msg); return; }
  el.innerText = msg;
  el.className = 'alert alert-' + type;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}
