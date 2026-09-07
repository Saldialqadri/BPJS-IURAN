/* =========================================
   BPJS KETENAGAKERJAAN CALCULATOR - app.js
   Logika Perhitungan Iuran & Manfaat
   ========================================= */

'use strict';

// ---- State ----
let jabatanList = [];
let rowCounter = 0;

// ---- Helpers Format Rupiah ----
function formatRp(n) {
  if (isNaN(n) || n === '') return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
function formatAngka(n) {
  if (isNaN(n)) return '0';
  return Math.round(n).toLocaleString('id-ID');
}
function parseNum(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
}

// ---- Format bulan Indonesia ----
function formatBulanIndo(monthStr) {
  if (!monthStr) return '-';
  const [yr, mo] = monthStr.split('-');
  const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return (names[parseInt(mo)-1] || mo) + ' ' + yr;
}

// ---- Init default rows ----
document.addEventListener('DOMContentLoaded', () => {
  // Set default periode ke bulan ini
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth()+1).padStart(2,'0');
  document.getElementById('bulanTahun').value = `${yyyy}-${mm}`;

  // Satu baris default
  tambahJabatan();

  // Live update total rate
  ['rateJKK','rateJKM','rateJHT'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateTotalRate);
  });
});

// ---- Update Total Rate Display ----
function updateTotalRate() {
  const jkk = parseNum(document.getElementById('rateJKK').value);
  const jkm = parseNum(document.getElementById('rateJKM').value);
  const jht = parseNum(document.getElementById('rateJHT').value);
  const total = (jkk + jkm + jht).toFixed(2);
  document.getElementById('totalRateDisplay').textContent = total + '%';
}

// ---- Tambah Row Jabatan ----
function tambahJabatan() {
  rowCounter++;
  const id = rowCounter;
  const tbody = document.getElementById('jabatanBody');
  const tr = document.createElement('tr');
  tr.id = `row-${id}`;
  tr.innerHTML = `
    <td><span class="row-num">${jabatanList.length + 1}</span></td>
    <td><input type="text" id="jabatan-${id}" placeholder="Nama Jabatan..." onchange="updateTotalRow(${id})" /></td>
    <td><input type="number" id="upah-${id}" placeholder="0" min="0" step="50000" onchange="updateTotalRow(${id})" oninput="updateTotalRow(${id})" /></td>
    <td><input type="number" id="jumlah-${id}" placeholder="0" min="1" step="1" value="1" onchange="updateTotalRow(${id})" oninput="updateTotalRow(${id})" /></td>
    <td id="totalRow-${id}" class="row-total">Rp 0</td>
    <td><button class="btn btn-danger" onclick="hapusJabatan(${id})">Hapus</button></td>
  `;
  tbody.appendChild(tr);
  jabatanList.push(id);
  renumberRows();
  return id;
}

function hapusJabatan(id) {
  if (jabatanList.length <= 1) {
    alert('Minimal harus ada 1 jabatan!');
    return;
  }
  const row = document.getElementById(`row-${id}`);
  if (row) row.remove();
  jabatanList = jabatanList.filter(x => x !== id);
  renumberRows();
  updateGrandTotal();
}

function renumberRows() {
  jabatanList.forEach((id, i) => {
    const num = document.querySelector(`#row-${id} .row-num`);
    if (num) num.textContent = i + 1;
  });
}

function updateTotalRow(id) {
  const upah   = parseNum(document.getElementById(`upah-${id}`)?.value);
  const jumlah = parseInt(document.getElementById(`jumlah-${id}`)?.value) || 0;
  const total  = upah * jumlah;
  const el = document.getElementById(`totalRow-${id}`);
  if (el) el.textContent = formatRp(total);
  updateGrandTotal();
}

function updateGrandTotal() {
  let totalP = 0, totalU = 0;
  jabatanList.forEach(id => {
    const jumlah = parseInt(document.getElementById(`jumlah-${id}`)?.value) || 0;
    const upah   = parseNum(document.getElementById(`upah-${id}`)?.value);
    totalP += jumlah;
    totalU += upah * jumlah;
  });
  document.getElementById('totalPekerja').textContent = formatAngka(totalP);
  document.getElementById('totalUpah').textContent     = formatRp(totalU);
}

// ---- Contoh Data ----
function tambahContohData() {
  // Hapus semua row yang ada
  jabatanList.slice().forEach(id => {
    const row = document.getElementById(`row-${id}`);
    if (row) row.remove();
  });
  jabatanList = [];

  document.getElementById('namaInstansi').value = 'Desa Sejahtera Makmur';
  document.getElementById('jenisInstansi').value = 'desa';

  const contoh = [
    { jabatan: 'Kepala Desa', upah: 4500000, jumlah: 1 },
    { jabatan: 'Sekretaris Desa', upah: 3500000, jumlah: 1 },
    { jabatan: 'Kepala Seksi', upah: 2800000, jumlah: 3 },
    { jabatan: 'Staf / Petugas Administrasi', upah: 2200000, jumlah: 5 },
    { jabatan: 'Perangkat Desa / Kadus', upah: 1800000, jumlah: 4 },
    { jabatan: 'Petugas Kebersihan', upah: 1500000, jumlah: 3 },
  ];

  contoh.forEach(c => {
    const id = tambahJabatan();
    setTimeout(() => {
      document.getElementById(`jabatan-${id}`).value = c.jabatan;
      document.getElementById(`upah-${id}`).value    = c.upah;
      document.getElementById(`jumlah-${id}`).value  = c.jumlah;
      updateTotalRow(id);
    }, 50);
  });
}

// ---- HITUNG SEMUA ----
function hitungSemua() {
  // Validasi
  const nama = document.getElementById('namaInstansi').value.trim();
  if (!nama) {
    alert('Mohon isi Nama Perusahaan / Desa terlebih dahulu!');
    document.getElementById('namaInstansi').focus();
    return;
  }

  const rateJKK = parseNum(document.getElementById('rateJKK').value) / 100;
  const rateJKM = parseNum(document.getElementById('rateJKM').value) / 100;
  const rateJHT = parseNum(document.getElementById('rateJHT').value) / 100;

  if (rateJKK + rateJKM + rateJHT === 0) {
    alert('Persentase iuran tidak boleh semua 0%!');
    return;
  }

  // Ambil data jabatan
  let rows = [];
  let validasi = true;
  jabatanList.forEach(id => {
    const jabatan = document.getElementById(`jabatan-${id}`)?.value?.trim() || '';
    const upah    = parseNum(document.getElementById(`upah-${id}`)?.value);
    const jumlah  = parseInt(document.getElementById(`jumlah-${id}`)?.value) || 0;
    if (!jabatan || upah <= 0 || jumlah <= 0) {
      validasi = false;
      return;
    }
    rows.push({ jabatan, upah, jumlah });
  });

  if (!validasi || rows.length === 0) {
    alert('Mohon lengkapi data jabatan: Nama Jabatan, Upah, dan Jumlah Pekerja harus diisi dengan benar!');
    return;
  }

  // Hitung
  let gTotalPekerja = 0, gTotalUpah = 0, gTotalJKK = 0, gTotalJKM = 0, gTotalJHT = 0, gTotalIuran = 0;
  const rekapRows = rows.map((r, i) => {
    const totalUpah = r.upah * r.jumlah;
    const jkk       = totalUpah * rateJKK;
    const jkm       = totalUpah * rateJKM;
    const jht       = totalUpah * rateJHT;
    const total     = jkk + jkm + jht;
    gTotalPekerja += r.jumlah;
    gTotalUpah    += totalUpah;
    gTotalJKK     += jkk;
    gTotalJKM     += jkm;
    gTotalJHT     += jht;
    gTotalIuran   += total;
    return { no: i+1, jabatan: r.jabatan, upah: r.upah, jumlah: r.jumlah, totalUpah, jkk, jkm, jht, total };
  });

  // ---- Render Summary Cards ----
  const sc = document.getElementById('summaryCards');
  sc.innerHTML = `
    <div class="summary-card sc-total">
      <div class="sc-icon">👥</div>
      <div class="sc-label">Total Pekerja</div>
      <div class="sc-value">${formatAngka(gTotalPekerja)} Org</div>
      <div class="sc-sub">Seluruh jabatan</div>
    </div>
    <div class="summary-card sc-jkk">
      <div class="sc-icon">🦺</div>
      <div class="sc-label">Total Iuran JKK</div>
      <div class="sc-value">${formatRp(gTotalJKK)}</div>
      <div class="sc-sub">${(rateJKK*100).toFixed(2)}% × total upah / bulan</div>
    </div>
    <div class="summary-card sc-jkm">
      <div class="sc-icon">🛡️</div>
      <div class="sc-label">Total Iuran JKM</div>
      <div class="sc-value">${formatRp(gTotalJKM)}</div>
      <div class="sc-sub">${(rateJKM*100).toFixed(2)}% × total upah / bulan</div>
    </div>
    <div class="summary-card sc-jht">
      <div class="sc-icon">🏦</div>
      <div class="sc-label">Total Iuran JHT</div>
      <div class="sc-value">${formatRp(gTotalJHT)}</div>
      <div class="sc-sub">${(rateJHT*100).toFixed(2)}% × total upah / bulan</div>
    </div>
  `;

  // Kartu total keseluruhan
  const extraCard = document.createElement('div');
  extraCard.className = 'summary-card sc-total';
  extraCard.style.cssText = 'grid-column: 1/-1; background: linear-gradient(135deg, rgba(0,180,216,0.12), rgba(0,119,182,0.08)); border-color: rgba(0,180,216,0.3);';
  extraCard.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="sc-icon" style="font-size:2rem">💰</div>
        <div>
          <div class="sc-label" style="font-size:0.82rem">TOTAL IURAN SELURUH PROGRAM PER BULAN</div>
          <div class="sc-value" style="font-size:2rem">${formatRp(gTotalIuran)}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="sc-label">Total Upah Seluruh Pekerja</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${formatRp(gTotalUpah)}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">
          Eff. Rate: ${((gTotalJKK+gTotalJKM+gTotalJHT)/gTotalUpah*100).toFixed(2)}% dari total upah
        </div>
      </div>
    </div>
  `;
  sc.appendChild(extraCard);

  // ---- Render Rekap Table ----
  const rb = document.getElementById('rekapBody');
  rb.innerHTML = '';
  rekapRows.forEach(r => {
    rb.innerHTML += `
      <tr>
        <td><span class="row-num">${r.no}</span></td>
        <td style="font-weight:600">${r.jabatan}</td>
        <td>${formatRp(r.upah)}</td>
        <td class="text-center" style="font-weight:700">${r.jumlah} org</td>
        <td style="font-weight:600">${formatRp(r.totalUpah)}</td>
        <td class="cell-jkk">${formatRp(r.jkk)}</td>
        <td class="cell-jkm">${formatRp(r.jkm)}</td>
        <td class="cell-jht">${formatRp(r.jht)}</td>
        <td class="cell-total" style="font-weight:800">${formatRp(r.total)}</td>
      </tr>
    `;
  });

  const rf = document.getElementById('rekapFoot');
  rf.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:right;font-weight:800;font-size:0.9rem;padding:14px 16px;">TOTAL</td>
      <td class="text-center" style="font-weight:800;padding:14px 16px">${gTotalPekerja} org</td>
      <td style="font-weight:800;padding:14px 16px">${formatRp(gTotalUpah)}</td>
      <td class="cell-jkk" style="font-weight:800;padding:14px 16px">${formatRp(gTotalJKK)}</td>
      <td class="cell-jkm" style="font-weight:800;padding:14px 16px">${formatRp(gTotalJKM)}</td>
      <td class="cell-jht" style="font-weight:800;padding:14px 16px">${formatRp(gTotalJHT)}</td>
      <td class="cell-total" style="font-weight:900;font-size:1rem;padding:14px 16px">${formatRp(gTotalIuran)}</td>
    </tr>
  `;

  // ---- Render JHT Simulasi ----
  const jhtDiv = document.getElementById('jhtSimTable');
  // Simulasi per jabatan: iuran JHT per org × bulan × faktor pengembangan bank deposito
  // Asumsi bunga deposito 5% per tahun
  const bungaBank = 0.05;
  const periodeList = [1, 2, 3, 5, 10];

  let jhtHtml = `<div class="jht-sim-table-wrap"><table class="jht-sim-table">
    <thead>
      <tr>
        <th>Jabatan</th>
        <th>Upah / Org</th>
        <th>Iuran JHT/Bln</th>`;
  periodeList.forEach(p => { jhtHtml += `<th>${p} Tahun</th>`; });
  jhtHtml += `</tr></thead><tbody>`;

  rows.forEach(r => {
    const iuranPerBln = r.upah * rateJHT;
    jhtHtml += `<tr>
      <td style="font-weight:600">${r.jabatan}</td>
      <td>${formatRp(r.upah)}</td>
      <td class="td-jht">${formatRp(iuranPerBln)}</td>`;
    periodeList.forEach(p => {
      // FV = PMT × [((1+r)^n - 1) / r]  (r per bulan, n bulan)
      const rBulan = bungaBank / 12;
      const nBulan = p * 12;
      const fv = iuranPerBln * (Math.pow(1 + rBulan, nBulan) - 1) / rBulan;
      jhtHtml += `<td class="td-jht">${formatRp(fv)}</td>`;
    });
    jhtHtml += `</tr>`;
  });

  // Baris total semua pekerja gabungan
  const totalIuranJHTBln = rows.reduce((s, r) => s + r.upah * r.jumlah * rateJHT, 0);
  jhtHtml += `<tr style="background:rgba(34,197,94,0.08);font-weight:800">
    <td colspan="2" style="font-weight:800;text-align:right;padding:14px 16px;">TOTAL SEMUA PEKERJA</td>
    <td class="td-jht" style="padding:14px 16px">${formatRp(totalIuranJHTBln)}</td>`;
  periodeList.forEach(p => {
    const rBulan = bungaBank / 12;
    const nBulan = p * 12;
    const fv = totalIuranJHTBln * (Math.pow(1 + rBulan, nBulan) - 1) / rBulan;
    jhtHtml += `<td class="td-jht" style="padding:14px 16px">${formatRp(fv)}</td>`;
  });
  jhtHtml += `</tr></tbody></table></div>
  <p style="font-size:0.77rem;color:var(--text-muted);margin-top:12px">* Simulasi JHT menggunakan asumsi bunga pengembangan setara deposito bank ${(bungaBank*100).toFixed(0)}%/tahun (anuitas). Nilai aktual tergantung hasil investasi BPJS.</p>`;

  jhtDiv.innerHTML = jhtHtml;

  // ---- Tampilkan Results ----
  const sec = document.getElementById('resultsSection');
  sec.style.display = 'flex';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Store for PDF
  window._pdfData = {
    nama, periode: formatBulanIndo(document.getElementById('bulanTahun').value),
    jenis: document.getElementById('jenisInstansi').options[document.getElementById('jenisInstansi').selectedIndex].text,
    rateJKK, rateJKM, rateJHT, rekapRows,
    gTotalPekerja, gTotalUpah, gTotalJKK, gTotalJKM, gTotalJHT, gTotalIuran
  };
}

// ---- DOWNLOAD PDF ----
function downloadPDF() {
  const d = window._pdfData;
  if (!d) { alert('Silakan klik "Hitung" terlebih dahulu!'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();
  let   y   = 14;

  // ---- Header ----
  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, W, 38, 'F');

  doc.setTextColor(0, 180, 216);
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('SIMULASI IURAN & MANFAAT BPJAMSOSTEK', W/2, 13, { align:'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text(`${d.nama}  —  ${d.jenis}  |  Periode: ${d.periode}`, W/2, 21, { align:'center' });

  doc.setFontSize(8); doc.setTextColor(150, 150, 170);
  doc.text(`JKK: ${(d.rateJKK*100).toFixed(2)}%  |  JKM: ${(d.rateJKM*100).toFixed(2)}%  |  JHT: ${(d.rateJHT*100).toFixed(2)}%  |  Total Rate: ${((d.rateJKK+d.rateJKM+d.rateJHT)*100).toFixed(2)}%`, W/2, 28, { align:'center' });

  doc.setFontSize(8); doc.setTextColor(100, 100, 120);
  doc.text('Berdasarkan PP 44/2015 & PP 82/2019', W/2, 35, { align:'center' });
  y = 48;

  // ---- Summary Box ----
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(10, y-6, W-20, 22, 3, 3, 'F');
  const summaries = [
    { label: 'Total Pekerja',     val: `${formatAngka(d.gTotalPekerja)} Orang` },
    { label: 'Total Upah/Bulan',  val: formatRp(d.gTotalUpah) },
    { label: 'Total Iuran JKK',   val: formatRp(d.gTotalJKK) },
    { label: 'Total Iuran JKM',   val: formatRp(d.gTotalJKM) },
    { label: 'Total Iuran JHT',   val: formatRp(d.gTotalJHT) },
    { label: 'TOTAL IURAN/BULAN', val: formatRp(d.gTotalIuran) },
  ];
  const colW = (W-20) / summaries.length;
  summaries.forEach((s, i) => {
    const cx = 10 + i * colW + colW/2;
    doc.setTextColor(150, 170, 200); doc.setFontSize(6); doc.setFont('helvetica','normal');
    doc.text(s.label, cx, y+2, { align:'center' });
    const color = i < 1 ? [0,180,216] : i === 1 ? [200,200,220] : i === 2 ? [249,115,22] : i === 3 ? [168,85,247] : i === 4 ? [34,197,94] : [0,180,216];
    doc.setTextColor(...color); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text(s.val, cx, y+10, { align:'center' });
  });
  y += 26;

  // ---- Rekap Tabel ----
  doc.setTextColor(0, 180, 216); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text('REKAP IURAN PER JABATAN (per bulan)', 10, y); y += 6;

  const tableBody = d.rekapRows.map(r => [
    r.no, r.jabatan,
    formatRp(r.upah), `${r.jumlah} org`, formatRp(r.totalUpah),
    formatRp(r.jkk), formatRp(r.jkm), formatRp(r.jht),
    formatRp(r.total)
  ]);
  tableBody.push([
    '', 'TOTAL', '', `${d.gTotalPekerja} org`, formatRp(d.gTotalUpah),
    formatRp(d.gTotalJKK), formatRp(d.gTotalJKM), formatRp(d.gTotalJHT),
    formatRp(d.gTotalIuran)
  ]);

  doc.autoTable({
    startY: y,
    head: [['No','Jabatan','Upah/Org','Jml','Total Upah','JKK (Rp)','JKM (Rp)','JHT (Rp)','Total Iuran']],
    body: tableBody,
    theme: 'grid',
    styles: { font:'helvetica', fontSize:7.5, cellPadding:3, textColor:[220,230,240], fillColor:[17,24,39], lineColor:[40,55,80], lineWidth:0.3 },
    headStyles: { fillColor:[10,30,60], textColor:[0,180,216], fontStyle:'bold', fontSize:7.5 },
    alternateRowStyles: { fillColor:[22,33,52] },
    columnStyles: {
      0: { halign:'center', cellWidth:8 },
      2: { halign:'right' }, 3: { halign:'center', cellWidth:16 },
      4: { halign:'right' }, 5: { halign:'right', textColor:[249,115,22] },
      6: { halign:'right', textColor:[168,85,247] },
      7: { halign:'right', textColor:[34,197,94] },
      8: { halign:'right', textColor:[0,180,216], fontStyle:'bold' }
    },
    didParseCell(data) {
      if (data.row.index === tableBody.length - 1) {
        data.cell.styles.fillColor = [10, 25, 50];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize  = 8;
      }
    }
  });

  y = doc.lastAutoTable.finalY + 10;

  // ---- Check page ----
  const pageH = doc.internal.pageSize.getHeight();
  const manfaatNeedsPage = y + 100 > pageH;
  if (manfaatNeedsPage) { doc.addPage(); y = 14; }

  // ---- Manfaat JKK ----
  doc.setFillColor(30, 15, 5);
  doc.roundedRect(10, y, (W-24)/3, 100, 3, 3, 'F');
  let yc = y + 8;
  doc.setTextColor(249,115,22); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
  doc.text('JAMINAN KECELAKAAN KERJA (JKK)', 16, yc); yc += 7;
  const jkkItems = [
    ['Perawatan & Pengobatan','Kelas 1 — Tanpa Batas'],
    ['Transportasi Darat','Rp 5.000.000'],
    ['Transportasi Udara','Rp 10.000.000'],
    ['STMB (12 bln pertama)','100% Upah'],
    ['STMB (setelah 12 bln)','50% Upah hingga sembuh'],
    ['Gigi Tiruan','Maks. Rp 5.000.000'],
    ['Alat Bantu Dengar','Maks. Rp 2.500.000'],
    ['Homecare','Maks. Rp 20.000.000'],
    ['Cacat Total Tetap','Rp 112.000.000'],
    ['Santunan Kematian KK','Rp 118.000.000'],
    ['Beasiswa (2 anak, maks)','Rp 174.000.000'],
  ];
  jkkItems.forEach(([l,v]) => {
    doc.setTextColor(170,180,200); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.text(l, 16, yc);
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
    doc.text(v, 10+(W-24)/3-6, yc, { align:'right' });
    yc += 6;
  });

  // ---- Manfaat JKM ----
  const cx2 = 10 + (W-24)/3 + 7;
  doc.setFillColor(20, 10, 35);
  doc.roundedRect(cx2, y, (W-24)/3, 100, 3, 3, 'F');
  let yc2 = y + 8;
  doc.setTextColor(168,85,247); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
  doc.text('JAMINAN KEMATIAN (JKM)', cx2+6, yc2); yc2 += 7;
  const jkmItems = [
    ['Santunan Kematian','Rp 20.000.000'],
    ['Biaya Pemakaman','Rp 10.000.000'],
    ['Santunan Berkala','Rp 12.000.000'],
    ['TOTAL Santunan','Rp 42.000.000'],
    ['',''],
    ['Beasiswa Usia Sekolah','Maks. Rp 174.000.000'],
    ['(syarat: 3 thn kepesertaan)',''],
  ];
  jkmItems.forEach(([l,v]) => {
    doc.setTextColor(170,180,200); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.text(l, cx2+6, yc2);
    if (v) {
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
      doc.text(v, cx2+(W-24)/3-6, yc2, { align:'right' });
    }
    yc2 += 6;
  });

  // ---- Manfaat JHT ----
  const cx3 = 10 + 2*((W-24)/3) + 14;
  doc.setFillColor(5, 25, 15);
  doc.roundedRect(cx3, y, (W-24)/3, 100, 3, 3, 'F');
  let yc3 = y + 8;
  doc.setTextColor(34,197,94); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
  doc.text('JAMINAN HARI TUA (JHT)', cx3+6, yc3); yc3 += 7;
  doc.setTextColor(150,180,160); doc.setFontSize(6); doc.setFont('helvetica','italic');
  doc.text('Simulasi akumulasi + bunga deposito ~5%/thn', cx3+6, yc3); yc3 += 7;

  const rateJHT = d.rateJHT;
  const bungaBank = 0.05;
  const rBulan = bungaBank / 12;
  d.rekapRows.slice(0, 6).forEach(r => {
    doc.setTextColor(200,220,210); doc.setFontSize(6.5); doc.setFont('helvetica','bold');
    doc.text(r.jabatan.length > 22 ? r.jabatan.substring(0,20)+'...' : r.jabatan, cx3+6, yc3);
    yc3 += 4;
    const iuranBln = r.upah * rateJHT;
    [1,3,5].forEach(p => {
      const n = p * 12;
      const fv = iuranBln * (Math.pow(1+rBulan,n)-1) / rBulan;
      doc.setTextColor(150,180,160); doc.setFontSize(6); doc.setFont('helvetica','normal');
      doc.text(`  ${p} thn:`, cx3+6, yc3);
      doc.setTextColor(34,197,94); doc.setFont('helvetica','bold');
      doc.text(formatRp(fv), cx3+(W-24)/3-6, yc3, { align:'right' });
      yc3 += 5;
    });
    yc3 += 2;
    if (yc3 > y + 96) return;
  });

  y += 110;

  // ---- Footer ----
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(10,15,30);
    doc.rect(0, pageH-10, W, 10, 'F');
    doc.setTextColor(100,110,140); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.text(`BPJS Ketenagakerjaan — Simulasi Iuran & Manfaat | ${d.nama} | ${d.periode}  |  PP 44/2015 & PP 82/2019`, W/2, pageH-4, { align:'center' });
    doc.text(`Hal ${i}/${totalPages}`, W-10, pageH-4, { align:'right' });
  }

  // ---- Save ----
  const filename = `BPJS_${d.nama.replace(/\s+/g,'_')}_${d.periode.replace(/\s+/g,'_')}.pdf`;
  doc.save(filename);
}

// ---- Reset Form ----
function resetForm() {
  if (!confirm('Reset semua data dan hasil perhitungan?')) return;
  document.getElementById('namaInstansi').value = '';
  document.getElementById('resultsSection').style.display = 'none';

  // Hapus semua row
  jabatanList.slice().forEach(id => {
    const row = document.getElementById(`row-${id}`);
    if (row) row.remove();
  });
  jabatanList = [];
  rowCounter = 0;

  tambahJabatan();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window._pdfData = null;
}
