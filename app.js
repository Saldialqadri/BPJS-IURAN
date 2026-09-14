/* =========================================
   BPJS KETENAGAKERJAAN CALCULATOR - app.js
   ========================================= */
'use strict';

let jabatanList = [];
let rowCounter = 0;
let uploadedFiles = []; // Array to store { name, type, data, isImage }

function formatRp(n) {
  if (isNaN(n) || n === '') return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}
function formatAngka(n) { return isNaN(n) ? '0' : Math.round(n).toLocaleString('id-ID'); }
function parseNum(str) { if (!str) return 0; return parseFloat(String(str).replace(/[^0-9.]/g,''))||0; }
function formatBulanIndo(s) {
  if (!s) return '-';
  const [yr,mo] = s.split('-');
  const nm=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return (nm[parseInt(mo)-1]||mo)+' '+yr;
}

// PROGRAM NAVIGATION
function showProgram(prog) {
  if (prog === 'PU') {
    document.getElementById('page-welcome').style.display = 'none';
    document.getElementById('page-kalkulator').style.display = 'block';
    document.getElementById('page-bpu').style.display = 'none';
    document.getElementById('programLabel').textContent = 'PU (Penerima Upah)';
    window.scrollTo(0, 0);
  } else if (prog === 'BPU') {
    document.getElementById('page-welcome').style.display = 'none';
    document.getElementById('page-kalkulator').style.display = 'none';
    document.getElementById('page-bpu').style.display = 'block';
    window.scrollTo(0, 0);
  }
}

function kembali() {
  document.getElementById('page-kalkulator').style.display = 'none';
  document.getElementById('page-bpu').style.display = 'none';
  document.getElementById('page-welcome').style.display = 'flex';
  window.scrollTo(0, 0);
}

const bpuJobs = [
  'Administrasi','Agen BJB Laku Pandai','Agen Brilink','Agen Pos','Agen 46','Ahli Gizi','Apoteker','Arsitek','Artis','Atlet','Biarawati','Bidan','Buruh Bongkar Muat/Bagasi','Buruh Nelayan/Perikanan','Buruh Peternakan','Buruh Tani/Perkebunan','Daily Worker Hotel','Dokter','Dokter Gigi','Dosen','Fisikawan Medik','Guru','Imam Mesjid','Juru Masak','Juru Parkir','Konsultan','Kurir','Logistik','Mahasiswa Kerja Praktek','Mandiri Agen','Marbot Mesjid','Mekanik','Mitra Gojek','Mitra Gojek - Go Life','Mitra Grab','Mitra Indriver','Mitra Lalamove','Mitra Shopee','Mitra Teleport AirAsia','Mitra Uber','Narapidana D. P. Asimilasi','Nelayan/Perikanan','Notaris','O-Ranger Pos Indonesia','Ojek Pangkalan','Pelayan Gereja','Pastor','Pendeta','Peserta Bakat dan Minat','Peserta Magang','Pandita/Pemangku','Penatua','Perawat','Perekam Medik dan Infokes','Pramugolf','Psikolog Klinis','Pekerja Digital','Pemandu Lagu','Penyiar Radio','Promotor Acara','Paraji','Paranormal','Pelaut','Pemasar Ikan','Pemasar Pelabuhan','Pembudidaya Ikan','Pengolah Ikan','Petambak Garam','Petani/Pekebun','Peternak','Pemulung','Petugas Kebersihan','Pemandu Wisata','Pemasar','Pendamping Desa','Peneliti','Pengacara','Penterjemah','Perisai','Pialang','Psikiater/Psikdog','Pandai Besi','Pekerja Mandiri PNM','Pekerja Rumah Tangga','Penambang Rakyat','Petugas Keamanan','Pedagang','Pemilik Usaha','Penata Busana','Penata Rambut','Penata Rias','Penenun','Pengrajin','Perancang Busana','Relawan Baznas','Relawan Tagana/Relawan Bencana','Relawan Tokoh','Radiografer','Sekretaris','Surveyor','Seniman','Siswa Kerja Praktek','Sopir','Tabib','Tenaga Honorer (Selain P. Negara)','Transportasi','Teknisi Lab Medik','Tenaga Kesehatan Lingkungan','Tenaga Teknis Kefarmasian','Tukang Bangunan','Tukang Batu','Tukang Kayu','Tukang Las/Pandai Besi','Tukang Listrik','Tukang Sol Sepatu','Tukang Cukur','Tukang Gigi','Tukang Jahit','Tukang Pijat','Tukang Cuci','Tukang Kebun/Potong Rumput','Tukang Sampah','Ustadz/Mubaligh','Wartawan'
];

document.addEventListener('DOMContentLoaded', () => {
  const now=new Date(), yyyy=now.getFullYear(), mm=String(now.getMonth()+1).padStart(2,'0');
  document.getElementById('bulanTahun').value=`${yyyy}-${mm}`;
  tambahJabatan();
  ['rateJKK','rateJKM','rateJHT','rateJP'].forEach(id=>document.getElementById(id).addEventListener('input',updateTotalRate));
  updateTotalRate();

  const pek1 = document.getElementById('bpuPekerjaan1');
  const pek2 = document.getElementById('bpuPekerjaan2');
  if(pek1 && pek2) {
    bpuJobs.forEach((job, i) => {
      const o1 = document.createElement('option'); o1.value = job; o1.textContent = `${i+1}. ${job}`;
      const o2 = document.createElement('option'); o2.value = job; o2.textContent = `${i+1}. ${job}`;
      pek1.appendChild(o1);
      pek2.appendChild(o2);
    });
  }
});

// JENIS USAHA HANDLER
function onJenisUsahaChange() {
  const select = document.getElementById('jenisUsaha');
  const val = select.value;
  if (!val) return;
  const parts = val.split('|'); // [kelompok, rate, nama]
  if (parts.length >= 2) {
    const rate = parseFloat(parts[1]);
    const inputJKK = document.getElementById('rateJKK');
    inputJKK.value = rate;
    updateTotalRate();
    
    const infoBox = document.getElementById('jenisUsahaInfo');
    infoBox.style.display = 'block';
    infoBox.innerHTML = `<strong>Kelompok ${parts[0]}</strong> — Tarif JKK otomatis diubah menjadi <strong>${rate}%</strong>`;
    setTimeout(() => { infoBox.style.display = 'none'; }, 5000);
  }
}

// RATE HANDLER
function updateTotalRate() {
  const jkk=parseNum(document.getElementById('rateJKK').value);
  const jkm=parseNum(document.getElementById('rateJKM').value);
  const jht=parseNum(document.getElementById('rateJHT').value);
  const jp=parseNum(document.getElementById('rateJP').value);
  const total = jkk + jkm + jht + jp;
  
  document.getElementById('totalRateDisplay').textContent = parseFloat(total.toFixed(2)) + '%';
  document.getElementById('jpRateDisplay').textContent = parseFloat(jp.toFixed(2)) + '% dari Upah';
}

// JABATAN TABLE
function tambahJabatan() {
  rowCounter++;
  const id=rowCounter;
  const tbody=document.getElementById('jabatanBody');
  const tr=document.createElement('tr');
  tr.id=`row-${id}`;
  tr.innerHTML=`
    <td><span class="row-num">${jabatanList.length+1}</span></td>
    <td><input type="text" id="jabatan-${id}" placeholder="Nama Jabatan..." /></td>
    <td><input type="number" id="upah-${id}" placeholder="0" min="0" step="50000" oninput="updateTotalRow(${id})" /></td>
    <td><input type="number" id="jumlah-${id}" placeholder="0" min="1" step="1" value="1" oninput="updateTotalRow(${id})" /></td>
    <td id="totalRow-${id}" class="row-total">Rp 0</td>
    <td><button class="btn btn-danger" onclick="hapusJabatan(${id})">Hapus</button></td>
  `;
  tbody.appendChild(tr);
  jabatanList.push(id);
  renumberRows();
  return id;
}

function hapusJabatan(id) {
  if (jabatanList.length<=1){alert('Minimal harus ada 1 jabatan!');return;}
  document.getElementById(`row-${id}`)?.remove();
  jabatanList=jabatanList.filter(x=>x!==id);
  renumberRows(); updateGrandTotal();
}

function renumberRows() {
  jabatanList.forEach((id,i)=>{const n=document.querySelector(`#row-${id} .row-num`);if(n)n.textContent=i+1;});
}

function updateTotalRow(id) {
  const u=parseNum(document.getElementById(`upah-${id}`)?.value);
  const j=parseInt(document.getElementById(`jumlah-${id}`)?.value)||0;
  const el=document.getElementById(`totalRow-${id}`);
  if(el)el.textContent=formatRp(u*j);
  updateGrandTotal();
}

function updateGrandTotal() {
  let tp=0,tu=0;
  jabatanList.forEach(id=>{
    const j=parseInt(document.getElementById(`jumlah-${id}`)?.value)||0;
    const u=parseNum(document.getElementById(`upah-${id}`)?.value);
    tp+=j; tu+=u*j;
  });
  document.getElementById('totalPekerja').textContent=formatAngka(tp);
  document.getElementById('totalUpah').textContent=formatRp(tu);
}

function tambahContohData() {
  jabatanList.slice().forEach(id=>{document.getElementById(`row-${id}`)?.remove();});
  jabatanList=[];
  document.getElementById('namaInstansi').value='PT. Maju Bersama Sejahtera';
  
  // Set jenis usaha example
  const select = document.getElementById('jenisUsaha');
  if(select.options.length > 2) {
    select.selectedIndex = 3; // Pilih salah satu Kel. I
    onJenisUsahaChange();
  }

  const contoh=[
    {jabatan:'Direktur Utama',upah:15000000,jumlah:1},
    {jabatan:'Manajer Operasional',upah:10000000,jumlah:2},
    {jabatan:'Supervisor',upah:7500000,jumlah:4},
    {jabatan:'Staf Administrasi',upah:5500000,jumlah:6},
    {jabatan:'Operator Lapangan',upah:4800000,jumlah:20},
  ];
  contoh.forEach(c=>{
    const id=tambahJabatan();
    setTimeout(()=>{
      document.getElementById(`jabatan-${id}`).value=c.jabatan;
      document.getElementById(`upah-${id}`).value=c.upah;
      document.getElementById(`jumlah-${id}`).value=c.jumlah;
      updateTotalRow(id);
    },50);
  });
}

// FILE UPLOAD HANDLER
function handleFileUpload(files) {
  if (!files || files.length === 0) return;
  const listEl = document.getElementById('fileList');
  
  Array.from(files).forEach(file => {
    const isImage = file.type.startsWith('image/');
    
    // Create UI item
    const item = document.createElement('div');
    item.className = 'file-item';
    const id = 'file_' + Date.now() + Math.floor(Math.random() * 1000);
    item.id = id;
    
    // File reader to get DataURL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      uploadedFiles.push({
        id: id,
        name: file.name,
        type: file.type,
        size: file.size,
        data: dataUrl,
        isImage: isImage
      });
      
      const kb = Math.round(file.size / 1024);
      let previewHtml = isImage ? `<img src="${dataUrl}" alt="Preview" />` : 'PDF';
      
      item.innerHTML = `
        <div class="file-info">
          <div class="file-preview">${previewHtml}</div>
          <div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${kb} KB</div>
          </div>
        </div>
        <button class="file-remove" onclick="removeFile('${id}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      listEl.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

function removeFile(id) {
  document.getElementById(id)?.remove();
  uploadedFiles = uploadedFiles.filter(f => f.id !== id);
}

// CALCULATION LOGIC
function hitungSemua() {
  const nama=document.getElementById('namaInstansi').value.trim();
  if(!nama){alert('Mohon isi Nama Perusahaan / Instansi!');document.getElementById('namaInstansi').focus();return;}
  
  const jenisUsahaVal = document.getElementById('jenisUsaha').value;
  let jenisUsahaLabel = "Tidak ada";
  if (jenisUsahaVal) {
    const parts = jenisUsahaVal.split('|');
    jenisUsahaLabel = `Kel. ${parts[0]} - ${parts[2] || ''}`;
  }

  const rJKK=parseNum(document.getElementById('rateJKK').value)/100;
  const rJKM=parseNum(document.getElementById('rateJKM').value)/100;
  const rJHT=parseNum(document.getElementById('rateJHT').value)/100;
  const rJP=parseNum(document.getElementById('rateJP').value)/100;
  
  if(rJKK+rJKM+rJHT+rJP===0){alert('Persentase iuran tidak boleh semua 0%!');return;}
  
  let rows=[],ok=true;
  jabatanList.forEach(id=>{
    const jb=document.getElementById(`jabatan-${id}`)?.value?.trim()||'';
    const u=parseNum(document.getElementById(`upah-${id}`)?.value);
    const j=parseInt(document.getElementById(`jumlah-${id}`)?.value)||0;
    if(!jb||u<=0||j<=0){ok=false;return;}
    rows.push({jabatan:jb,upah:u,jumlah:j});
  });
  if(!ok||rows.length===0){alert('Lengkapi data jabatan: Nama, Upah, dan Jumlah Pekerja!');return;}
  
  let gTP=0,gTU=0,gJKK=0,gJKM=0,gJHT=0,gJP=0,gTI=0;
  const rekapRows=rows.map((r,i)=>{
    const tu=r.upah*r.jumlah;
    const jkk=tu*rJKK;
    const jkm=tu*rJKM;
    const jht=tu*rJHT;
    const jp=tu*rJP;
    const tot=jkk+jkm+jht+jp;
    
    gTP+=r.jumlah; gTU+=tu; gJKK+=jkk; gJKM+=jkm; gJHT+=jht; gJP+=jp; gTI+=tot;
    return{no:i+1,jabatan:r.jabatan,upah:r.upah,jumlah:r.jumlah,totalUpah:tu,jkk,jkm,jht,jp,total:tot};
  });
  
  const sc=document.getElementById('summaryCards');
  sc.innerHTML=`
    <div class="summary-card sc-total"><div class="sc-icon">👥</div><div class="sc-label">Total Pekerja</div><div class="sc-value">${formatAngka(gTP)} Org</div><div class="sc-sub">Seluruh jabatan</div></div>
    <div class="summary-card sc-jkk"><div class="sc-icon">🦺</div><div class="sc-label">Total Iuran JKK</div><div class="sc-value">${formatRp(gJKK)}</div><div class="sc-sub">${parseFloat((rJKK*100).toFixed(2))}% / bulan</div></div>
    <div class="summary-card sc-jkm"><div class="sc-icon">🛡️</div><div class="sc-label">Total Iuran JKM</div><div class="sc-value">${formatRp(gJKM)}</div><div class="sc-sub">${parseFloat((rJKM*100).toFixed(2))}% / bulan</div></div>
    <div class="summary-card sc-jht"><div class="sc-icon">🏦</div><div class="sc-label">Total Iuran JHT</div><div class="sc-value">${formatRp(gJHT)}</div><div class="sc-sub">${parseFloat((rJHT*100).toFixed(2))}% / bulan</div></div>
    <div class="summary-card sc-jp"><div class="sc-icon">👴</div><div class="sc-label">Total Iuran JP</div><div class="sc-value">${formatRp(gJP)}</div><div class="sc-sub">${parseFloat((rJP*100).toFixed(2))}% / bulan</div></div>
  `;
  
  // Total Banner
  const ec=document.createElement('div');
  ec.className='summary-card sc-total';
  ec.style.cssText='grid-column:1/-1;background:linear-gradient(135deg,rgba(0,180,216,0.12),rgba(0,119,182,0.08));border-color:rgba(0,180,216,0.3);';
  ec.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <div style="display:flex;align-items:center;gap:12px"><div class="sc-icon" style="font-size:2rem">💰</div>
    <div><div class="sc-label" style="font-size:0.82rem">TOTAL IURAN SELURUH PROGRAM PER BULAN</div><div class="sc-value" style="font-size:2rem">${formatRp(gTI)}</div></div></div>
    <div style="text-align:right"><div class="sc-label">Total Upah Seluruh Pekerja</div>
    <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${formatRp(gTU)}</div>
    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Eff. Rate: ${parseFloat(((gTI/gTU)*100).toFixed(2))}% dari total upah</div></div></div>`;
  sc.appendChild(ec);
  
  document.getElementById('jpTotalDisplay').textContent = formatRp(gJP);
  
  const rb=document.getElementById('rekapBody');
  rb.innerHTML='';
  rekapRows.forEach(r=>{
    rb.innerHTML+=`<tr>
      <td><span class="row-num">${r.no}</span></td><td style="font-weight:600">${r.jabatan}</td>
      <td>${formatRp(r.upah)}</td><td class="text-center" style="font-weight:700">${r.jumlah}</td>
      <td style="font-weight:600">${formatRp(r.totalUpah)}</td>
      <td class="cell-jkk">${formatRp(r.jkk)}</td><td class="cell-jkm">${formatRp(r.jkm)}</td>
      <td class="cell-jht">${formatRp(r.jht)}</td><td class="cell-jp">${formatRp(r.jp)}</td>
      <td class="cell-total" style="font-weight:800">${formatRp(r.total)}</td></tr>`;
  });
  
  document.getElementById('rekapFoot').innerHTML=`<tr>
    <td colspan="3" style="text-align:right;font-weight:800;padding:14px 16px;">TOTAL</td>
    <td class="text-center" style="font-weight:800;padding:14px 16px">${gTP}</td>
    <td style="font-weight:800;padding:14px 16px">${formatRp(gTU)}</td>
    <td class="cell-jkk" style="font-weight:800;padding:14px 16px">${formatRp(gJKK)}</td>
    <td class="cell-jkm" style="font-weight:800;padding:14px 16px">${formatRp(gJKM)}</td>
    <td class="cell-jht" style="font-weight:800;padding:14px 16px">${formatRp(gJHT)}</td>
    <td class="cell-jp" style="font-weight:800;padding:14px 16px">${formatRp(gJP)}</td>
    <td class="cell-total" style="font-weight:900;font-size:1rem;padding:14px 16px">${formatRp(gTI)}</td></tr>`;
    
  // JHT Simulation  
  const jhtDiv=document.getElementById('jhtSimTable');
  const bB=0.05,rB=bB/12,pL=[1,2,3,5,10];
  let jhtHtml=`<div class="jht-sim-table-wrap"><table class="jht-sim-table"><thead><tr><th>Jabatan</th><th>Upah/Org</th><th>Iuran JHT/Bln</th>`;
  pL.forEach(p=>{jhtHtml+=`<th>${p} Tahun</th>`;});
  jhtHtml+=`</tr></thead><tbody>`;
  rows.forEach(r=>{
    const ib=r.upah*rJHT;
    jhtHtml+=`<tr><td style="font-weight:600">${r.jabatan}</td><td>${formatRp(r.upah)}</td><td class="td-jht">${formatRp(ib)}</td>`;
    pL.forEach(p=>{jhtHtml+=`<td class="td-jht">${formatRp(ib*(Math.pow(1+rB,p*12)-1)/rB)}</td>`;});
    jhtHtml+=`</tr>`;
  });
  const totJHT=rows.reduce((s,r)=>s+r.upah*r.jumlah*rJHT,0);
  jhtHtml+=`<tr style="background:rgba(34,197,94,0.08);font-weight:800"><td colspan="2" style="text-align:right;padding:14px 16px;">TOTAL SEMUA PEKERJA</td><td class="td-jht" style="padding:14px 16px">${formatRp(totJHT)}</td>`;
  pL.forEach(p=>{jhtHtml+=`<td class="td-jht" style="padding:14px 16px">${formatRp(totJHT*(Math.pow(1+rB,p*12)-1)/rB)}</td>`;});
  jhtHtml+=`</tr></tbody></table></div><p style="font-size:0.77rem;color:var(--text-muted);margin-top:12px">* Simulasi menggunakan asumsi bunga pengembangan setara deposito bank 5%/tahun.</p>`;
  jhtDiv.innerHTML=jhtHtml;
  
  const sec=document.getElementById('resultsSection');
  sec.style.display='flex';
  sec.scrollIntoView({behavior:'smooth',block:'start'});
  
  window._pdfData={
    nama,
    periode:formatBulanIndo(document.getElementById('bulanTahun').value),
    jenis: jenisUsahaLabel,
    rateJKK:rJKK,rateJKM:rJKM,rateJHT:rJHT,rateJP:rJP,
    rekapRows,
    gTotalPekerja:gTP,gTotalUpah:gTU,gTotalJKK:gJKK,gTotalJKM:gJKM,gTotalJHT:gJHT,gTotalJP:gJP,gTotalIuran:gTI
  };
}

// ================================================================
// DOWNLOAD PDF 
// ================================================================
async function downloadPDF() {
  const d=window._pdfData;
  if(!d){alert('Silakan klik "Hitung" terlebih dahulu!');return;}
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
  const ML=14,MR=14,CW=W-ML-MR;

  function drawHeader(){
    doc.setFillColor(0,68,130);doc.rect(0,0,W,14,'F');
    doc.setFillColor(0,148,199);doc.rect(0,12.5,W,1.5,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(8.5);doc.setFont('helvetica','bold');
    doc.text('SIMULASI IURAN & MANFAAT BPJAMSOSTEK',ML,9.5);
    doc.setFontSize(6.5);doc.setFont('helvetica','normal');doc.setTextColor(180,210,240);
    doc.text(`${d.nama}  |  ${d.periode}`,W-MR,9.5,{align:'right'});
  }

  function drawAllFooters(total){
    for(let i=1;i<=total;i++){
      doc.setPage(i);
      doc.setFillColor(243,246,250);doc.rect(0,H-9,W,9,'F');
      doc.setDrawColor(210,220,230);doc.setLineWidth(0.3);doc.line(0,H-9,W,H-9);doc.setLineWidth(0.2);
      doc.setTextColor(130,145,165);doc.setFontSize(6);doc.setFont('helvetica','normal');
      doc.text(`BPJS Ketenagakerjaan  —  ${d.nama}  |  Periode: ${d.periode}  |  PP 44/2015 & PP 82/2019`,ML,H-3.5);
      doc.text(`Halaman ${i} / ${total}`,W-MR,H-3.5,{align:'right'});
    }
  }

  function secBar(y,lbl,sub,fRGB,tRGB,sRGB){
    doc.setFillColor(...fRGB);doc.roundedRect(ML,y,CW,8,1.5,1.5,'F');
    doc.setFillColor(...tRGB);doc.rect(ML,y,3.5,8,'F');
    doc.setTextColor(...tRGB);doc.setFontSize(8.5);doc.setFont('helvetica','bold');
    doc.text(lbl,ML+7,y+5.5);
    if(sub){doc.setTextColor(...(sRGB||[120,140,160]));doc.setFontSize(6);doc.setFont('helvetica','normal');doc.text(sub,W-MR,y+5.5,{align:'right'});}
    return y+11;
  }

  // ── HAL 1: COVER + REKAP ──
  drawHeader();let y=18;

  doc.setFillColor(0,52,105);doc.roundedRect(ML,y,CW,26,3,3,'F');
  doc.setFillColor(0,148,199);doc.roundedRect(ML,y,4,26,2,2,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('LAPORAN SIMULASI IURAN BPJAMSOSTEK',ML+10,y+9);
  doc.setFontSize(9);doc.text('JKK (Kecelakaan Kerja)  •  JKM (Kematian)  •  JHT (Hari Tua)  •  JP (Pensiun)',ML+10,y+17);
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(160,210,240);
  doc.text('Berdasarkan PP 44/2015, PP 45/2015 & PP 82/2019',ML+10,y+23);
  y+=30;

  doc.setFillColor(247,250,253);doc.roundedRect(ML,y,CW,19,2,2,'F');
  doc.setDrawColor(215,225,235);doc.setLineWidth(0.3);doc.roundedRect(ML,y,CW,19,2,2,'S');doc.setLineWidth(0.2);
  [['Nama Instansi',d.nama],['Jenis Usaha',d.jenis],['Periode',d.periode],['Dasar Hukum','PP 44/15, PP 45/15, PP 82/19']].forEach(([k,v],i)=>{
    const col=i%2,row=Math.floor(i/2),ix=ML+5+col*(CW/2),iy=y+6+row*9;
    doc.setTextColor(140,160,185);doc.setFontSize(5.5);doc.setFont('helvetica','normal');doc.text(k.toUpperCase(),ix,iy);
    doc.setTextColor(20,40,70);doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.text(v,ix,iy+4.5);
  });
  y+=23;

  const rW=CW/5;
  [{lbl:'JKK',val:`${parseFloat((d.rateJKK*100).toFixed(2))}%`,sub:'Kec. Kerja',fc:[255,244,230],tc:[160,60,10],bc:[230,95,20]},
   {lbl:'JKM',val:`${parseFloat((d.rateJKM*100).toFixed(2))}%`,sub:'Kematian',fc:[248,235,255],tc:[90,30,145],bc:[140,60,220]},
   {lbl:'JHT',val:`${parseFloat((d.rateJHT*100).toFixed(2))}%`,sub:'Hari Tua',fc:[230,255,238],tc:[20,100,45],bc:[30,170,75]},
   {lbl:'JP',val:`${parseFloat((d.rateJP*100).toFixed(2))}%`,sub:'Pensiun',fc:[255,235,240],tc:[180,20,60],bc:[244,63,94]},
   {lbl:'TOTAL',val:`${parseFloat(((d.rateJKK+d.rateJKM+d.rateJHT+d.rateJP)*100).toFixed(2))}%`,sub:'Rate / Upah',fc:[225,238,255],tc:[25,75,200],bc:[55,120,240]}
  ].forEach((r,i)=>{
    const rx=ML+i*rW;
    doc.setFillColor(...r.fc);doc.roundedRect(rx,y,rW-2,19,2,2,'F');
    doc.setDrawColor(...r.bc);doc.setLineWidth(0.5);doc.roundedRect(rx,y,rW-2,19,2,2,'S');doc.setLineWidth(0.2);
    doc.setFillColor(...r.bc);doc.roundedRect(rx+2,y+2,10,4,1,1,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(4.5);doc.setFont('helvetica','bold');doc.text(r.lbl,rx+7,y+4.7,{align:'center'});
    doc.setTextColor(...r.tc);doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text(r.val,rx+(rW-2)/2,y+13,{align:'center'});
    doc.setFontSize(5);doc.setFont('helvetica','normal');doc.text(r.sub,rx+(rW-2)/2,y+17,{align:'center'});
  });
  y+=23;

  doc.setFillColor(0,68,130);doc.rect(ML,y,CW,7,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont('helvetica','bold');
  doc.text('REKAP IURAN PER JABATAN — PER BULAN',ML+4,y+4.7);y+=9;

  const tb=d.rekapRows.map((r,i)=>[i+1,r.jabatan,
    {content:formatRp(r.upah),styles:{halign:'right'}},
    {content:`${r.jumlah}`,styles:{halign:'center'}},
    {content:formatRp(r.totalUpah),styles:{halign:'right'}},
    {content:formatRp(r.jkk),styles:{halign:'right',textColor:[170,65,10],fontStyle:'bold'}},
    {content:formatRp(r.jkm),styles:{halign:'right',textColor:[95,30,155],fontStyle:'bold'}},
    {content:formatRp(r.jht),styles:{halign:'right',textColor:[20,115,50],fontStyle:'bold'}},
    {content:formatRp(r.jp),styles:{halign:'right',textColor:[180,20,60],fontStyle:'bold'}},
    {content:formatRp(r.total),styles:{halign:'right',textColor:[20,70,170],fontStyle:'bold'}},
  ]);
  tb.push([
    {content:'',styles:{fillColor:[0,52,105]}},{content:'TOTAL KESELURUHAN',styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold'}},
    {content:'',styles:{fillColor:[0,52,105]}},
    {content:`${d.gTotalPekerja}`,styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold',halign:'center'}},
    {content:formatRp(d.gTotalUpah),styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJKK),styles:{fillColor:[0,52,105],textColor:[255,185,110],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJKM),styles:{fillColor:[0,52,105],textColor:[205,155,255],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJHT),styles:{fillColor:[0,52,105],textColor:[110,235,155],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJP),styles:{fillColor:[0,52,105],textColor:[255,140,160],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalIuran),styles:{fillColor:[0,52,105],textColor:[110,210,255],fontStyle:'bold',halign:'right'}},
  ]);
  
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['No','Jabatan','Upah/Org','Jml','Total Upah','JKK (Rp)','JKM (Rp)','JHT (Rp)','JP (Rp)','Total Iuran (Rp)']],
    body:tb,theme:'grid',
    styles:{font:'helvetica',fontSize:6.5,cellPadding:{top:2.5,bottom:2.5,left:2,right:2},lineColor:[205,218,230],lineWidth:0.22,textColor:[25,45,75],fillColor:[255,255,255]},
    headStyles:{fillColor:[0,95,175],textColor:[255,255,255],fontStyle:'bold',fontSize:6.5,halign:'center',cellPadding:{top:3,bottom:3,left:2,right:2}},
    alternateRowStyles:{fillColor:[245,249,255]},
    columnStyles:{0:{halign:'center',cellWidth:7},1:{cellWidth:34},2:{halign:'right',cellWidth:19},3:{halign:'center',cellWidth:9},4:{halign:'right',cellWidth:20},5:{halign:'right',cellWidth:18},6:{halign:'right',cellWidth:18},7:{halign:'right',cellWidth:18},8:{halign:'right',cellWidth:18},9:{halign:'right',cellWidth:21}},
    didDrawPage:()=>drawHeader(),
  });
  y=doc.lastAutoTable.finalY+6;
  if(y+18>H-12){doc.addPage();drawHeader();y=18;}
  
  doc.setFillColor(0,52,105);doc.roundedRect(ML,y,CW,16,2,2,'F');
  doc.setTextColor(160,200,240);doc.setFontSize(6.5);doc.setFont('helvetica','normal');
  doc.text('TOTAL IURAN SELURUH PROGRAM PER BULAN',ML+5,y+5.5);
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont('helvetica','bold');doc.text(formatRp(d.gTotalIuran),ML+5,y+13);
  doc.setTextColor(160,200,240);doc.setFontSize(6.5);doc.setFont('helvetica','normal');
  doc.text(`${d.gTotalPekerja} orang pekerja  |  Total upah: ${formatRp(d.gTotalUpah)}`,W-MR,y+5.5,{align:'right'});
  doc.setTextColor(110,210,255);doc.setFontSize(8.5);doc.setFont('helvetica','bold');
  doc.text(`Eff. Rate: ${parseFloat(((d.gTotalIuran/d.gTotalUpah)*100).toFixed(2))}% dari total upah`,W-MR,y+13,{align:'right'});

  // ── HAL 2: MANFAAT JKK & JKM ──
  doc.addPage();drawHeader();y=18;
  doc.setFillColor(240,245,252);doc.roundedRect(ML,y,CW,8,1.5,1.5,'F');
  doc.setFillColor(0,95,175);doc.rect(ML,y,3.5,8,'F');
  doc.setTextColor(0,50,110);doc.setFontSize(9.5);doc.setFont('helvetica','bold');doc.text('DETAIL MANFAAT PROGRAM',ML+7,y+5.5);
  doc.setTextColor(100,130,170);doc.setFontSize(6.5);doc.setFont('helvetica','normal');doc.text('PP 44 Tahun 2015 & PP 82 Tahun 2019',W-MR,y+5.5,{align:'right'});
  y+=12;

  y=secBar(y,'JAMINAN KECELAKAAN KERJA (JKK)','Perlindungan risiko kecelakaan saat bekerja',[255,239,215],[225,85,10],[190,110,50]);
  const hW=(CW-4)/2;

  doc.autoTable({startY:y,margin:{left:ML,right:ML+hW+4},
    head:[['Perawatan & Pengobatan','Nilai / Keterangan']],
    body:[['Kelas Perawatan','Kelas 1 — Tanpa Batas Biaya'],['Transportasi (Darat)','Rp 5.000.000'],['Transportasi (Laut)','Rp 2.000.000'],['Transportasi (Udara)','Rp 10.000.000'],['STMB (12 Bulan Pertama)','100% Upah'],['STMB (Setelah 12 Bulan)','50% Upah hingga sembuh'],['Gigi Tiruan','Maks. Rp 5.000.000'],['Alat Bantu Dengar','Maks. Rp 2.500.000'],['Homecare / Perawatan Rumah','Maks. Rp 20.000.000']],
    theme:'grid',
    styles:{font:'helvetica',fontSize:6.8,cellPadding:2.5,lineColor:[245,215,185],lineWidth:0.2,textColor:[55,35,15],fillColor:[255,251,246]},
    headStyles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold',fontSize:7,cellPadding:3},
    alternateRowStyles:{fillColor:[255,243,230]},
    columnStyles:{0:{cellWidth:40},1:{halign:'right',fontStyle:'bold',textColor:[155,55,15]}},
    didDrawPage:()=>drawHeader(),
  });
  const yL1=doc.lastAutoTable.finalY;

  doc.autoTable({startY:y,margin:{left:ML+hW+4,right:MR},
    head:[['Santunan Kecacatan & Kematian KK','Nilai']],
    body:[
      ['Cacat Sebagian Anatomi','% Cacat x 80 x Upah Terlapor'],
      ['Cacat Sebagian Fungsi','% Fungsi x % Cacat x 80 x Upah Terlapor'],
      ['Cacat Total Tetap (56 x Upah Terlapor)',{content:'56 x Upah',styles:{textColor:[155,55,15],fontStyle:'bold',halign:'right'}}],
      [{content:'--- Kematian Akibat KK ---',styles:{fillColor:[255,230,200],textColor:[130,60,10],fontStyle:'bold',colSpan:2}},''],
      ['Santunan Kematian (48 x Upah Terlapor)','48 x Upah'],
      ['Santunan Pemakaman','Rp 10.000.000'],
      ['Santunan Berkala (sekaligus)','Rp 12.000.000'],
      [{content:'TOTAL SANTUNAN KEMATIAN KK',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold'}},{content:'Bervariasi',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold',halign:'right'}}],
    ],
    theme:'grid',
    styles:{font:'helvetica',fontSize:6.8,cellPadding:2.5,lineColor:[245,215,185],lineWidth:0.2,textColor:[55,35,15],fillColor:[255,251,246]},
    headStyles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold',fontSize:7,cellPadding:3},
    alternateRowStyles:{fillColor:[255,243,230]},
    columnStyles:{0:{cellWidth:58},1:{halign:'right',fontStyle:'bold',textColor:[155,55,15]}},
    didDrawPage:()=>drawHeader(),
  });
  y=Math.max(yL1,doc.lastAutoTable.finalY)+4;

  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['Beasiswa JKK (untuk 2 Anak Peserta — meninggal/cacat total akibat kecelakaan kerja)','Per Tahun/Anak','Total Maks.']],
    body:[
      ['TK / SD (Sederajat)','Rp 1.500.000','Rp 24.000.000'],['SMP (Sederajat)','Rp 2.000.000','Rp 12.000.000'],
      ['SMA (Sederajat)','Rp 3.000.000','Rp 18.000.000'],['Perguruan Tinggi / Kuliah','Rp 12.000.000','Rp 120.000.000'],
      [{content:'TOTAL MAKSIMAL BEASISWA JKK',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold'}},{content:'',styles:{fillColor:[225,85,10]}},{content:'Rp 174.000.000',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold',halign:'right'}}],
    ],
    theme:'grid',
    styles:{font:'helvetica',fontSize:7,cellPadding:2.5,lineColor:[245,215,185],lineWidth:0.2,textColor:[55,35,15],fillColor:[255,251,246]},
    headStyles:{fillColor:[175,55,0],textColor:[255,255,255],fontStyle:'bold',fontSize:7,cellPadding:3},
    alternateRowStyles:{fillColor:[255,243,230]},
    columnStyles:{0:{cellWidth:110},1:{halign:'right',fontStyle:'bold',textColor:[155,55,15]},2:{halign:'right',fontStyle:'bold',textColor:[155,55,15]}},
    didDrawPage:()=>drawHeader(),
  });
  y=doc.lastAutoTable.finalY+8;

  if(y+55>H-12){doc.addPage();drawHeader();y=18;}
  y=secBar(y,'JAMINAN KEMATIAN (JKM)','Bukan akibat kecelakaan kerja  |  Syarat beasiswa: min. 3 tahun kepesertaan',[245,235,255],[110,30,205],[140,80,200]);
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['Komponen Manfaat JKM','Nilai','Keterangan']],
    body:[
      ['Santunan Kematian','Rp 20.000.000','Dibayarkan kepada ahli waris'],
      ['Biaya Pemakaman','Rp 10.000.000','Biaya pengurusan jenazah'],
      ['Santunan Berkala (dibayar sekaligus)','Rp 12.000.000','24 bulan x Rp 500.000'],
      [{content:'TOTAL SANTUNAN KEMATIAN',styles:{fillColor:[110,30,205],textColor:[255,255,255],fontStyle:'bold'}},{content:'Rp 42.000.000',styles:{fillColor:[110,30,205],textColor:[255,255,255],fontStyle:'bold',halign:'right'}},{content:'',styles:{fillColor:[110,30,205]}}],
      ['Beasiswa Usia Sekolah (Maks.)','Rp 174.000.000','Untuk 2 anak, syarat 3 thn kepesertaan'],
    ],
    theme:'grid',
    styles:{font:'helvetica',fontSize:7.5,cellPadding:3,lineColor:[225,200,250],lineWidth:0.2,textColor:[45,15,85],fillColor:[252,248,255]},
    headStyles:{fillColor:[110,30,205],textColor:[255,255,255],fontStyle:'bold',fontSize:7.5,cellPadding:3.5},
    alternateRowStyles:{fillColor:[246,240,255]},
    columnStyles:{0:{cellWidth:80},1:{halign:'right',fontStyle:'bold',textColor:[90,25,170]},2:{fontSize:6.5,textColor:[110,75,155]}},
    didDrawPage:()=>drawHeader(),
  });
  
  y=doc.lastAutoTable.finalY+8;
  if(y+40>H-12){doc.addPage();drawHeader();y=18;}
  y=secBar(y,'JAMINAN PENSIUN (JP)','Manfaat bulanan setelah mencapai usia pensiun',[255,235,240],[225,20,60],[225,60,100]);
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['Komponen JP','Nilai / Keterangan']],
    body:[
      ['Iuran JP', '3% dari Upah (Maks upah dibatasi Rp 11.086.300/bulan) (batas maksimal berubah setiap tahun)'],
      ['Usia Pensiun', '59 Tahun (bertambah 1 tahun setiap 3 tahun sekali maksimal 65 tahun)'],
      ['Masa Iuran Minimum', '15 Tahun'],
      ['Manfaat', 'Uang tunai bulanan seumur hidup jika masa iuran memenuhi'],
    ],
    theme:'grid',
    styles:{font:'helvetica',fontSize:7.5,cellPadding:3,lineColor:[250,200,220],lineWidth:0.2,textColor:[85,15,30],fillColor:[255,248,250]},
    headStyles:{fillColor:[225,20,60],textColor:[255,255,255],fontStyle:'bold',fontSize:7.5,cellPadding:3.5},
    alternateRowStyles:{fillColor:[255,240,245]},
    columnStyles:{0:{cellWidth:80,fontStyle:'bold'},1:{textColor:[155,20,50]}},
    didDrawPage:()=>drawHeader(),
  });

  // ── HAL 3: SIMULASI JHT ──
  doc.addPage();drawHeader();y=18;
  doc.setFillColor(235,252,242);doc.roundedRect(ML,y,CW,8,1.5,1.5,'F');
  doc.setFillColor(22,163,74);doc.rect(ML,y,3.5,8,'F');
  doc.setTextColor(15,80,40);doc.setFontSize(9.5);doc.setFont('helvetica','bold');
  doc.text('JAMINAN HARI TUA (JHT) — SIMULASI AKUMULASI TABUNGAN',ML+7,y+5.5);
  doc.setTextColor(60,130,75);doc.setFontSize(6.5);doc.setFont('helvetica','normal');
  doc.text('PP 46 & PP 60/2015  |  Cair saat berhenti kerja / habis kontrak / pengangkatan',W-MR,y+5.5,{align:'right'});
  y+=12;

  doc.setFillColor(238,255,244);doc.roundedRect(ML,y,CW,10,2,2,'F');
  doc.setDrawColor(40,190,90);doc.setLineWidth(0.3);doc.roundedRect(ML,y,CW,10,2,2,'S');doc.setLineWidth(0.2);
  doc.setTextColor(15,80,40);doc.setFontSize(6.5);doc.setFont('helvetica','bold');doc.text('Asumsi Simulasi:',ML+4,y+4);
  doc.setFont('helvetica','normal');doc.setTextColor(35,100,55);
  doc.text(`Metode Future Value Anuitas Bulanan. Bunga pengembangan 5%/tahun setara deposito bank. Iuran JHT = Upah x ${parseFloat((d.rateJHT*100).toFixed(2))}% per orang per bulan.`,ML+34,y+4);
  doc.text('Nilai aktual JHT ditentukan hasil investasi BPJS Ketenagakerjaan. Simulasi ini bersifat informatif.',ML+4,y+8);
  y+=14;

  const bB=0.05,rB=bB/12,ps=[1,2,3,5,10];

  const jhtB1=d.rekapRows.map((r,i)=>{
    const ib=r.upah*d.rateJHT;
    return[i+1,r.jabatan,
      {content:formatRp(r.upah),styles:{halign:'right'}},
      {content:formatRp(ib),styles:{halign:'right',textColor:[22,163,74],fontStyle:'bold'}},
      ...ps.map(p=>({content:formatRp(ib*(Math.pow(1+rB,p*12)-1)/rB),styles:{halign:'right',textColor:[20,115,50],fontStyle:'bold'}})),
    ];
  });
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['No','Jabatan','Upah/Org','Iuran JHT\n/Org/Bln',...ps.map(p=>`Akumulasi\n${p} Tahun`)]],
    body:jhtB1,theme:'grid',
    styles:{font:'helvetica',fontSize:6.8,cellPadding:{top:2.5,bottom:2.5,left:2,right:2},lineColor:[185,230,200],lineWidth:0.2,textColor:[15,55,25],fillColor:[248,255,251]},
    headStyles:{fillColor:[22,163,74],textColor:[255,255,255],fontStyle:'bold',fontSize:6.8,halign:'center',cellPadding:{top:3,bottom:3,left:2,right:2}},
    alternateRowStyles:{fillColor:[237,252,243]},
    columnStyles:{0:{halign:'center',cellWidth:8},1:{cellWidth:36},2:{halign:'right',cellWidth:22},3:{halign:'right',cellWidth:22},4:{halign:'right',cellWidth:19},5:{halign:'right',cellWidth:19},6:{halign:'right',cellWidth:19},7:{halign:'right',cellWidth:19},8:{halign:'right',cellWidth:19}},
    didDrawPage:()=>drawHeader(),
  });
  y=doc.lastAutoTable.finalY+8;

  if(y+20>H-12){doc.addPage();drawHeader();y=18;}
  doc.setFillColor(0,90,45);doc.roundedRect(ML,y,CW,7,1,1,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont('helvetica','bold');
  doc.text('AKUMULASI JHT TOTAL PER JABATAN — Iuran JHT x Jumlah Pekerja / Bulan',ML+4,y+4.7);
  y+=9;

  const totJB=d.rekapRows.reduce((s,r)=>s+r.upah*d.rateJHT*r.jumlah,0);
  const jhtB2=d.rekapRows.map((r,i)=>{
    const ig=r.upah*d.rateJHT*r.jumlah;
    return[i+1,r.jabatan,
      {content:`${r.jumlah} org`,styles:{halign:'center'}},
      {content:formatRp(ig),styles:{halign:'right',textColor:[22,163,74],fontStyle:'bold'}},
      ...ps.map(p=>({content:formatRp(ig*(Math.pow(1+rB,p*12)-1)/rB),styles:{halign:'right',textColor:[20,115,50],fontStyle:'bold'}})),
    ];
  });
  jhtB2.push([
    {content:'',styles:{fillColor:[0,90,45]}},
    {content:'TOTAL SEMUA JABATAN',styles:{fillColor:[0,90,45],textColor:[255,255,255],fontStyle:'bold'}},
    {content:`${d.gTotalPekerja} org`,styles:{fillColor:[0,90,45],textColor:[255,255,255],fontStyle:'bold',halign:'center'}},
    {content:formatRp(totJB),styles:{fillColor:[0,90,45],textColor:[200,255,220],fontStyle:'bold',halign:'right'}},
    ...ps.map(p=>({content:formatRp(totJB*(Math.pow(1+rB,p*12)-1)/rB),styles:{fillColor:[0,90,45],textColor:[255,255,255],fontStyle:'bold',halign:'right'}})),
  ]);
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['No','Jabatan','Jml Org','Iuran JHT\n/Bulan (Grp)',...ps.map(p=>`Akumulasi\n${p} Tahun`)]],
    body:jhtB2,theme:'grid',
    styles:{font:'helvetica',fontSize:6.8,cellPadding:{top:2.5,bottom:2.5,left:2,right:2},lineColor:[185,230,200],lineWidth:0.2,textColor:[15,55,25],fillColor:[248,255,251]},
    headStyles:{fillColor:[0,90,45],textColor:[255,255,255],fontStyle:'bold',fontSize:6.8,halign:'center',cellPadding:{top:3,bottom:3,left:2,right:2}},
    alternateRowStyles:{fillColor:[237,252,243]},
    columnStyles:{0:{halign:'center',cellWidth:8},1:{cellWidth:36},2:{halign:'center',cellWidth:16},3:{halign:'right',cellWidth:25},4:{halign:'right',cellWidth:19},5:{halign:'right',cellWidth:19},6:{halign:'right',cellWidth:19},7:{halign:'right',cellWidth:19},8:{halign:'right',cellWidth:21}},
    didDrawPage:()=>drawHeader(),
  });
  
  // ── ATTACHMENTS ──
  if (uploadedFiles.length > 0) {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.isImage) {
        doc.addPage();
        drawHeader();
        
        doc.setFillColor(245,245,245);
        doc.rect(ML, 18, CW, 8, 'F');
        doc.setTextColor(50,50,50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Lampiran Gambar: ${file.name}`, ML+2, 23);
        
        // Add image (need to calculate aspect ratio to fit page)
        try {
          const imgProps = doc.getImageProperties(file.data);
          const pdfWidth = CW;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          let finalHeight = pdfHeight;
          let finalWidth = pdfWidth;
          let yPos = 30;
          
          // if height exceeds page, scale by height instead
          if (pdfHeight > H - 45) {
            finalHeight = H - 45;
            finalWidth = (imgProps.width * finalHeight) / imgProps.height;
          }
          
          const xOffset = ML + (CW - finalWidth) / 2;
          
          const format = file.type === 'image/png' ? 'PNG' : 'JPEG';
          doc.addImage(file.data, format, xOffset, yPos, finalWidth, finalHeight);
        } catch (e) {
          console.error("Gagal merender gambar ke PDF", e);
          doc.setTextColor(255,0,0);
          doc.text("Gagal memuat gambar ini ke PDF.", ML, 40);
        }
      }
    }
  }

  drawAllFooters(doc.internal.getNumberOfPages());
  doc.save(`Simulasi_BPJS_${d.nama.replace(/[^a-zA-Z0-9]/g,'_')}_${d.periode.replace(/\s+/g,'_')}.pdf`);
}

function resetForm() {
  if(!confirm('Reset semua data dan hasil perhitungan?')) return;
  document.getElementById('namaInstansi').value='';
  document.getElementById('resultsSection').style.display='none';
  jabatanList.slice().forEach(id=>{document.getElementById(`row-${id}`)?.remove();});
  jabatanList=[];rowCounter=0;
  
  // Reset uploads
  document.getElementById('fileList').innerHTML = '';
  uploadedFiles = [];
  
  tambahJabatan();
  window.scrollTo({top:0,behavior:'smooth'});
  window._pdfData=null;
}

// ================================================================
// LOGIKA BPU (Bukan Penerima Upah)
// ================================================================
let bpuUploadedFiles = [];

function handleFileUploadBPU(files) {
  if (!files || files.length === 0) return;
  const listEl = document.getElementById('bpuFileList');
  
  Array.from(files).forEach(file => {
    const isImage = file.type.startsWith('image/');
    const item = document.createElement('div');
    item.className = 'file-item';
    const id = 'bpu_file_' + Date.now() + Math.floor(Math.random() * 1000);
    item.id = id;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      bpuUploadedFiles.push({ id, name: file.name, type: file.type, size: file.size, data: dataUrl, isImage });
      const kb = Math.round(file.size / 1024);
      let previewHtml = isImage ? `<img src="${dataUrl}" alt="Preview" />` : 'PDF';
      
      item.innerHTML = `
        <div class="file-info"><div class="file-preview">${previewHtml}</div><div><div class="file-name">${file.name}</div><div class="file-size">${kb} KB</div></div></div>
        <button class="file-remove" onclick="removeFileBPU('${id}')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      listEl.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

function removeFileBPU(id) {
  document.getElementById(id)?.remove();
  bpuUploadedFiles = bpuUploadedFiles.filter(f => f.id !== id);
}

function hitungBPU() {
  const nik = document.getElementById('bpuNIK').value.trim();
  const hp = document.getElementById('bpuHP').value.trim();
  const upah = parseNum(document.getElementById('bpuUpah').value);
  const bulan = parseInt(document.getElementById('bpuBulan').value) || 1;
  const pek1 = document.getElementById('bpuPekerjaan1').value;
  const pek2 = document.getElementById('bpuPekerjaan2').value;

  if (!nik || !hp || upah <= 0 || !pek1) {
    alert("Harap lengkapi NIK, No. HP, Upah, dan Jenis Pekerjaan 1!");
    return;
  }

  const jkkBln = upah * 0.01; // 1%
  const jkmBln = 6800;        // Flat Rp6.800
  const jhtBln = upah * 0.02; // 2%
  const totalBln = jkkBln + jkmBln + jhtBln;
  const grandTotal = totalBln * bulan;

  const sc = document.getElementById('summaryCardsBPU');
  sc.innerHTML = `
    <div class="summary-card sc-jkk"><div class="sc-icon">🦺</div><div class="sc-label">Iuran JKK (1%)</div><div class="sc-value">${formatRp(jkkBln)}</div><div class="sc-sub">Per bulan</div></div>
    <div class="summary-card sc-jkm"><div class="sc-icon">🛡️</div><div class="sc-label">Iuran JKM (Flat)</div><div class="sc-value">${formatRp(jkmBln)}</div><div class="sc-sub">Per bulan</div></div>
    <div class="summary-card sc-jht"><div class="sc-icon">🏦</div><div class="sc-label">Iuran JHT (2%)</div><div class="sc-value">${formatRp(jhtBln)}</div><div class="sc-sub">Per bulan</div></div>
    
    <div class="summary-card sc-total" style="grid-column:1/-1; background:linear-gradient(135deg,rgba(0,180,216,0.12),rgba(0,119,182,0.08));border-color:rgba(0,180,216,0.3);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="sc-icon" style="font-size:2rem">💰</div>
          <div><div class="sc-label" style="font-size:0.82rem">TOTAL BAYAR (${bulan} BULAN)</div><div class="sc-value" style="font-size:2rem">${formatRp(grandTotal)}</div></div>
        </div>
        <div style="text-align:right">
          <div class="sc-label">Total Iuran Per Bulan</div>
          <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${formatRp(totalBln)}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Dari pelaporan penghasilan ${formatRp(upah)}/bln</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('resultsSectionBPU').style.display = 'block';
  document.getElementById('resultsSectionBPU').scrollIntoView({behavior:'smooth', block:'start'});

  window._pdfDataBPU = { nik, hp, upah, bulan, pek1, pek2, jkkBln, jkmBln, jhtBln, totalBln, grandTotal };
}

function resetFormBPU() {
  if(!confirm('Reset form BPU?')) return;
  document.getElementById('bpuNIK').value = '';
  document.getElementById('bpuHP').value = '';
  document.getElementById('bpuUpah').value = '';
  document.getElementById('bpuBulan').value = '1';
  document.getElementById('bpuPekerjaan1').selectedIndex = 0;
  document.getElementById('bpuPekerjaan2').selectedIndex = 0;
  document.getElementById('resultsSectionBPU').style.display = 'none';
  document.getElementById('bpuFileList').innerHTML = '';
  bpuUploadedFiles = [];
  window._pdfDataBPU = null;
  window.scrollTo({top:0, behavior:'smooth'});
}

function downloadPDFBpu() {
  const d = window._pdfDataBPU;
  if(!d) { alert('Silakan klik Hitung terlebih dahulu!'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  const ML=14, MR=14, CW=W-ML-MR;

  function drawHeaderBPU(){
    doc.setFillColor(0,68,130);doc.rect(0,0,W,14,'F');
    doc.setFillColor(0,148,199);doc.rect(0,12.5,W,1.5,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(8.5);doc.setFont('helvetica','bold');
    doc.text('SIMULASI IURAN MANDIRI BPJAMSOSTEK (BPU)',ML,9.5);
    doc.setFontSize(6.5);doc.setFont('helvetica','normal');doc.setTextColor(180,210,240);
    doc.text(`NIK: ${d.nik}`,W-MR,9.5,{align:'right'});
  }

  drawHeaderBPU(); let y=18;
  doc.setFillColor(0,52,105);doc.roundedRect(ML,y,CW,26,3,3,'F');
  doc.setFillColor(0,148,199);doc.roundedRect(ML,y,4,26,2,2,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text('LAPORAN IURAN BUKAN PENERIMA UPAH (BPU)',ML+10,y+9);
  doc.setFontSize(9);doc.text('Jaminan Kecelakaan Kerja (JKK)  •  Jaminan Kematian (JKM)  •  Jaminan Hari Tua (JHT)',ML+10,y+17);
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(160,210,240);
  doc.text('Perhitungan Iuran Pekerja Mandiri',ML+10,y+23);
  y+=30;

  doc.setFillColor(247,250,253);doc.roundedRect(ML,y,CW,19,2,2,'F');
  doc.setDrawColor(215,225,235);doc.setLineWidth(0.3);doc.roundedRect(ML,y,CW,19,2,2,'S');doc.setLineWidth(0.2);
  let pekerjaanText = d.pek1;
  if(d.pek2) pekerjaanText += ` / ${d.pek2}`;
  [['NIK', d.nik],['No. HP', d.hp],['Pekerjaan', pekerjaanText],['Upah Dilaporkan', formatRp(d.upah)]].forEach(([k,v],i)=>{
    const col=i%2,row=Math.floor(i/2),ix=ML+5+col*(CW/2),iy=y+6+row*9;
    doc.setTextColor(140,160,185);doc.setFontSize(5.5);doc.setFont('helvetica','normal');doc.text(k.toUpperCase(),ix,iy);
    doc.setTextColor(20,40,70);doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.text(v,ix,iy+4.5);
  });
  y+=25;

  doc.setFillColor(0,68,130);doc.rect(ML,y,CW,7,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont('helvetica','bold');
  doc.text('RINCIAN IURAN PER BULAN',ML+4,y+4.7);y+=9;

  const tb = [
    ['Jaminan Kecelakaan Kerja (JKK)', '1%', formatRp(d.jkkBln)],
    ['Jaminan Kematian (JKM)', 'Flat', formatRp(d.jkmBln)],
    ['Jaminan Hari Tua (JHT)', '2%', formatRp(d.jhtBln)],
    [{content:'TOTAL IURAN PER BULAN',styles:{fontStyle:'bold',fillColor:[245,249,255]}}, {content:'',styles:{fillColor:[245,249,255]}}, {content:formatRp(d.totalBln),styles:{fontStyle:'bold',fillColor:[245,249,255]}}]
  ];

  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['Program','Persentase / Aturan','Nominal Iuran']],
    body:tb,theme:'grid',
    styles:{font:'helvetica',fontSize:7.5,cellPadding:3.5,lineColor:[205,218,230],lineWidth:0.2,textColor:[25,45,75]},
    headStyles:{fillColor:[0,95,175],textColor:[255,255,255],fontStyle:'bold',fontSize:7.5},
    columnStyles:{0:{cellWidth:80},1:{cellWidth:40,halign:'center'},2:{halign:'right',fontStyle:'bold',textColor:[20,70,170]}}
  });
  y=doc.lastAutoTable.finalY+8;

  doc.setFillColor(235,252,242);doc.roundedRect(ML,y,CW,20,2,2,'F');
  doc.setDrawColor(40,190,90);doc.setLineWidth(0.4);doc.roundedRect(ML,y,CW,20,2,2,'S');
  doc.setTextColor(15,80,40);doc.setFontSize(8.5);doc.setFont('helvetica','bold');
  doc.text(`TOTAL BAYAR UNTUK ${d.bulan} BULAN:`, ML+6, y+8);
  doc.setFontSize(14); doc.text(formatRp(d.grandTotal), ML+6, y+16);
  doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(40,110,60);
  doc.text(`${formatRp(d.totalBln)}  x  ${d.bulan} Bulan`, W-MR-6, y+12, {align:'right'});

  y+=28;
  doc.setFontSize(6.5); doc.setTextColor(100,100,100);
  doc.text('* Simulasi BPU menggunakan tarif khusus pekerja mandiri.', ML, y);
  doc.text('* Iuran dibayarkan paling lambat tanggal 15 bulan berikutnya untuk menghindari denda.', ML, y+4);

  // ── ATTACHMENTS ──
  if (bpuUploadedFiles.length > 0) {
    for (let i = 0; i < bpuUploadedFiles.length; i++) {
      const file = bpuUploadedFiles[i];
      if (file.isImage) {
        doc.addPage();
        drawHeaderBPU();
        
        doc.setFillColor(245,245,245);
        doc.rect(ML, 18, CW, 8, 'F');
        doc.setTextColor(50,50,50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Lampiran Gambar (BPU): ${file.name}`, ML+2, 23);
        
        try {
          const imgProps = doc.getImageProperties(file.data);
          const pdfWidth = CW;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          let finalHeight = pdfHeight, finalWidth = pdfWidth, yPos = 30;
          if (pdfHeight > H - 45) {
            finalHeight = H - 45;
            finalWidth = (imgProps.width * finalHeight) / imgProps.height;
          }
          const xOffset = ML + (CW - finalWidth) / 2;
          const format = file.type === 'image/png' ? 'PNG' : 'JPEG';
          doc.addImage(file.data, format, xOffset, yPos, finalWidth, finalHeight);
        } catch (e) {
          console.error("Gagal merender gambar", e);
        }
      }
    }
  }

  doc.save(`Simulasi_BPJS_BPU_${d.nik}.pdf`);
}

