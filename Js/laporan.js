async function loadLaporan() {
  const filter = { tanggalMulai: document.getElementById('filter_tglMulai').value, tanggalAkhir: document.getElementById('filter_tglAkhir').value, kelas: document.getElementById('filter_kelas').value, jenisLayanan: document.getElementById('filter_jenis').value };
  const listContainer = document.getElementById('laporanList');
  listContainer.innerHTML = '<div class="loading">⏳ Memuat...</div>';
  try {
    const data = await apiGet('getLaporanLayanan', filter);
    if (data.length === 0) { listContainer.innerHTML = '<div class="loading">📭 Tidak ada data</div>'; document.getElementById('laporanSummary').style.display = 'none'; return; }
    let selesai=0, proses=0, rujuk=0;
    data.forEach(d => { const s = String(d['STATUS'] || 'Baru'); if (s === 'Selesai') selesai++; else if (s === 'Dalam Proses') proses++; else if (s === 'Rujuk') rujuk++; });
    document.getElementById('r_total').innerText = data.length;
    document.getElementById('r_selesai').innerText = selesai;
    document.getElementById('r_proses').innerText = proses;
    document.getElementById('r_rujuk').innerText = rujuk;
    document.getElementById('laporanSummary').style.display = 'block';
    listContainer.innerHTML = data.map(d => {
      const status = d['STATUS'] || 'Baru';
      let badgeClass = 'badge-baru';
      if (status === 'Selesai') badgeClass = 'badge-selesai';
      else if (status === 'Dalam Proses') badgeClass = 'badge-proses';
      else if (status === 'Rujuk') badgeClass = 'badge-rujuk';
      return '<div class="laporan-item"><div style="display:flex; justify-content:space-between;"><div><div class="laporan-nama">'+(d['NAMA_SISWA']||'-')+'</div><div class="laporan-kelas">Kelas: '+(d['KELAS']||'-')+' | NISN: '+(d['NISN']||'-')+'</div></div><div style="text-align:right;"><div style="font-size:11px; color:#666;">'+(d['ID_LAYANAN']||'-')+'</div><div style="font-size:11px; color:#999;">'+(d['TANGGAL']||'-')+'</div></div></div><div class="laporan-detail"><b>'+(d['JENIS_LAYANAN']||'-')+'</b> • '+(d['KATEGORI']||'-')+'</div><div class="laporan-detail"><b>Masalah:</b> '+(d['DESKRIPSI']||'-')+'</div><div class="laporan-detail"><b>Tindak Lanjut:</b> '+(d['TINDAK_LANJUT']||'-')+'</div><div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;"><span class="badge '+badgeClass+'">'+status+'</span><select onchange="changeStatus(\''+d['ID_LAYANAN']+'\', this.value)" class="no-print" style="padding:4px; font-size:11px; width:auto;"><option value="Baru" '+(status==='Baru'?'selected':'')+'>Baru</option><option value="Dalam Proses" '+(status==='Dalam Proses'?'selected':'')+'>Proses</option><option value="Selesai" '+(status==='Selesai'?'selected':'')+'>Selesai</option><option value="Rujuk" '+(status==='Rujuk'?'selected':'')+'>Rujuk</option></select></div></div>';
    }).join('');
  } catch (e) { console.error(e); }
}

async function changeStatus(id, statusBaru) {
  try { const res = await apiPost('updateStatusLayanan', { id: id, status: statusBaru }); if (res.success) { showAlert('laporan', '✅ Status diupdate!', 'success'); loadLaporan(); } } catch (e) { console.error(e); }
}

function exportCSV() {
  const items = document.querySelectorAll('#laporanList .laporan-item');
  if (items.length === 0) { alert('Tidak ada data untuk diexport!'); return; }
  let csv = 'ID,Tanggal,NISN,Nama,Kelas,Jenis Layanan,Kategori,Deskripsi,Tindak Lanjut,Status\n';
  items.forEach(item => {
    const nama = item.querySelector('.laporan-nama')?.innerText || '-';
    const kelasInfo = item.querySelector('.laporan-kelas')?.innerText || '';
    const kelas = kelasInfo.split('|')[0].replace('Kelas:','').trim();
    const nisn = kelasInfo.split('NISN:')[1]?.trim() || '-';
    const id = item.querySelector('div[style*="font-size:11px"]')?.innerText || '-';
    const tgl = item.querySelectorAll('div[style*="font-size:11px"]')[1]?.innerText || '-';
    const details = item.querySelectorAll('.laporan-detail');
    const jenisKat = details[0]?.innerText || '-';
    const masalah = details[1]?.innerText.replace('Masalah:','').trim() || '-';
    const tl = details[2]?.innerText.replace('Tindak Lanjut:','').trim() || '-';
    const status = item.querySelector('.badge')?.innerText || '-';
    csv += `"${id}","${tgl}","${nisn}","${nama}","${kelas}","${jenisKat}","${masalah}","${tl}","${status}"\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Laporan_BK_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}
