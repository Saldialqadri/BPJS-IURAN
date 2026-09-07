/* =========================================
   BPJS KETENAGAKERJAAN CALCULATOR - app.js
   ========================================= */
'use strict';

let jabatanList = [];
let rowCounter = 0;

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

document.addEventListener('DOMContentLoaded', () => {
  const now=new Date(), yyyy=now.getFullYear(), mm=String(now.getMonth()+1).padStart(2,'0');
  document.getElementById('bulanTahun').value=`${yyyy}-${mm}`;
  tambahJabatan();
  ['rateJKK','rateJKM','rateJHT'].forEach(id=>document.getElementById(id).addEventListener('input',updateTotalRate));
});

function updateTotalRate() {
  const j=parseNum(document.getElementById('rateJKK').value)+parseNum(document.getElementById('rateJKM').value)+parseNum(document.getElementById('rateJHT').value);
  document.getElementById('totalRateDisplay').textContent=j.toFixed(2)+'%';
}

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
  document.getElementById('namaInstansi').value='Desa Sejahtera Makmur';
  document.getElementById('jenisInstansi').value='desa';
  const contoh=[
    {jabatan:'Kepala Desa',upah:4500000,jumlah:1},
    {jabatan:'Sekretaris Desa',upah:3500000,jumlah:1},
    {jabatan:'Kepala Seksi',upah:2800000,jumlah:3},
    {jabatan:'Staf / Petugas Administrasi',upah:2200000,jumlah:5},
    {jabatan:'Perangkat Desa / Kadus',upah:1800000,jumlah:4},
    {jabatan:'Petugas Kebersihan',upah:1500000,jumlah:3},
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

function hitungSemua() {
  const nama=document.getElementById('namaInstansi').value.trim();
  if(!nama){alert('Mohon isi Nama Perusahaan / Desa!');document.getElementById('namaInstansi').focus();return;}
  const rJKK=parseNum(document.getElementById('rateJKK').value)/100;
  const rJKM=parseNum(document.getElementById('rateJKM').value)/100;
  const rJHT=parseNum(document.getElementById('rateJHT').value)/100;
  if(rJKK+rJKM+rJHT===0){alert('Persentase iuran tidak boleh semua 0%!');return;}
  let rows=[],ok=true;
  jabatanList.forEach(id=>{
    const jb=document.getElementById(`jabatan-${id}`)?.value?.trim()||'';
    const u=parseNum(document.getElementById(`upah-${id}`)?.value);
    const j=parseInt(document.getElementById(`jumlah-${id}`)?.value)||0;
    if(!jb||u<=0||j<=0){ok=false;return;}
    rows.push({jabatan:jb,upah:u,jumlah:j});
  });
  if(!ok||rows.length===0){alert('Lengkapi data jabatan: Nama, Upah, dan Jumlah Pekerja!');return;}
  let gTP=0,gTU=0,gJKK=0,gJKM=0,gJHT=0,gTI=0;
  const rekapRows=rows.map((r,i)=>{
    const tu=r.upah*r.jumlah,jkk=tu*rJKK,jkm=tu*rJKM,jht=tu*rJHT,tot=jkk+jkm+jht;
    gTP+=r.jumlah;gTU+=tu;gJKK+=jkk;gJKM+=jkm;gJHT+=jht;gTI+=tot;
    return{no:i+1,jabatan:r.jabatan,upah:r.upah,jumlah:r.jumlah,totalUpah:tu,jkk,jkm,jht,total:tot};
  });
  const sc=document.getElementById('summaryCards');
  sc.innerHTML=`
    <div class="summary-card sc-total"><div class="sc-icon">👥</div><div class="sc-label">Total Pekerja</div><div class="sc-value">${formatAngka(gTP)} Org</div><div class="sc-sub">Seluruh jabatan</div></div>
    <div class="summary-card sc-jkk"><div class="sc-icon">🦺</div><div class="sc-label">Total Iuran JKK</div><div class="sc-value">${formatRp(gJKK)}</div><div class="sc-sub">${(rJKK*100).toFixed(2)}% / bulan</div></div>
    <div class="summary-card sc-jkm"><div class="sc-icon">🛡️</div><div class="sc-label">Total Iuran JKM</div><div class="sc-value">${formatRp(gJKM)}</div><div class="sc-sub">${(rJKM*100).toFixed(2)}% / bulan</div></div>
    <div class="summary-card sc-jht"><div class="sc-icon">🏦</div><div class="sc-label">Total Iuran JHT</div><div class="sc-value">${formatRp(gJHT)}</div><div class="sc-sub">${(rJHT*100).toFixed(2)}% / bulan</div></div>`;
  const ec=document.createElement('div');
  ec.className='summary-card sc-total';
  ec.style.cssText='grid-column:1/-1;background:linear-gradient(135deg,rgba(0,180,216,0.12),rgba(0,119,182,0.08));border-color:rgba(0,180,216,0.3);';
  ec.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
    <div style="display:flex;align-items:center;gap:12px"><div class="sc-icon" style="font-size:2rem">💰</div>
    <div><div class="sc-label" style="font-size:0.82rem">TOTAL IURAN SELURUH PROGRAM PER BULAN</div><div class="sc-value" style="font-size:2rem">${formatRp(gTI)}</div></div></div>
    <div style="text-align:right"><div class="sc-label">Total Upah Seluruh Pekerja</div>
    <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary)">${formatRp(gTU)}</div>
    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">Eff. Rate: ${((gTI/gTU)*100).toFixed(2)}% dari total upah</div></div></div>`;
  sc.appendChild(ec);
  const rb=document.getElementById('rekapBody');
  rb.innerHTML='';
  rekapRows.forEach(r=>{
    rb.innerHTML+=`<tr>
      <td><span class="row-num">${r.no}</span></td><td style="font-weight:600">${r.jabatan}</td>
      <td>${formatRp(r.upah)}</td><td class="text-center" style="font-weight:700">${r.jumlah} org</td>
      <td style="font-weight:600">${formatRp(r.totalUpah)}</td>
      <td class="cell-jkk">${formatRp(r.jkk)}</td><td class="cell-jkm">${formatRp(r.jkm)}</td>
      <td class="cell-jht">${formatRp(r.jht)}</td><td class="cell-total" style="font-weight:800">${formatRp(r.total)}</td></tr>`;
  });
  document.getElementById('rekapFoot').innerHTML=`<tr>
    <td colspan="3" style="text-align:right;font-weight:800;padding:14px 16px;">TOTAL</td>
    <td class="text-center" style="font-weight:800;padding:14px 16px">${gTP} org</td>
    <td style="font-weight:800;padding:14px 16px">${formatRp(gTU)}</td>
    <td class="cell-jkk" style="font-weight:800;padding:14px 16px">${formatRp(gJKK)}</td>
    <td class="cell-jkm" style="font-weight:800;padding:14px 16px">${formatRp(gJKM)}</td>
    <td class="cell-jht" style="font-weight:800;padding:14px 16px">${formatRp(gJHT)}</td>
    <td class="cell-total" style="font-weight:900;font-size:1rem;padding:14px 16px">${formatRp(gTI)}</td></tr>`;
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
    nama,periode:formatBulanIndo(document.getElementById('bulanTahun').value),
    jenis:document.getElementById('jenisInstansi').options[document.getElementById('jenisInstansi').selectedIndex].text,
    rateJKK:rJKK,rateJKM:rJKM,rateJHT:rJHT,rekapRows,
    gTotalPekerja:gTP,gTotalUpah:gTU,gTotalJKK:gJKK,gTotalJKM:gJKM,gTotalJHT:gJHT,gTotalIuran:gTI
  };
}

// ================================================================
// DOWNLOAD PDF — Layout Bersih 3 Halaman A4 Portrait
// ================================================================
function downloadPDF() {
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
  doc.setFontSize(9);doc.text('Jaminan Kecelakaan Kerja (JKK)  •  Jaminan Kematian (JKM)  •  Jaminan Hari Tua (JHT)',ML+10,y+17);
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(160,210,240);
  doc.text('Berdasarkan PP 44/2015 & PP 82/2019',ML+10,y+23);
  y+=30;

  doc.setFillColor(247,250,253);doc.roundedRect(ML,y,CW,19,2,2,'F');
  doc.setDrawColor(215,225,235);doc.setLineWidth(0.3);doc.roundedRect(ML,y,CW,19,2,2,'S');doc.setLineWidth(0.2);
  [['Nama Instansi',d.nama],['Jenis Instansi',d.jenis],['Periode',d.periode],['Dasar Hukum','PP 44/2015 & PP 82/2019']].forEach(([k,v],i)=>{
    const col=i%2,row=Math.floor(i/2),ix=ML+5+col*(CW/2),iy=y+6+row*9;
    doc.setTextColor(140,160,185);doc.setFontSize(5.5);doc.setFont('helvetica','normal');doc.text(k.toUpperCase(),ix,iy);
    doc.setTextColor(20,40,70);doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.text(v,ix,iy+4.5);
  });
  y+=23;

  const rW=CW/4;
  [{lbl:'JKK',val:`${(d.rateJKK*100).toFixed(2)}%`,sub:'Kecelakaan Kerja',fc:[255,244,230],tc:[160,60,10],bc:[230,95,20]},
   {lbl:'JKM',val:`${(d.rateJKM*100).toFixed(2)}%`,sub:'Jaminan Kematian',fc:[248,235,255],tc:[90,30,145],bc:[140,60,220]},
   {lbl:'JHT',val:`${(d.rateJHT*100).toFixed(2)}%`,sub:'Jaminan Hari Tua',fc:[230,255,238],tc:[20,100,45],bc:[30,170,75]},
   {lbl:'TOTAL',val:`${((d.rateJKK+d.rateJKM+d.rateJHT)*100).toFixed(2)}%`,sub:'Rate / Upah',fc:[225,238,255],tc:[25,75,200],bc:[55,120,240]}
  ].forEach((r,i)=>{
    const rx=ML+i*rW;
    doc.setFillColor(...r.fc);doc.roundedRect(rx,y,rW-2,19,2,2,'F');
    doc.setDrawColor(...r.bc);doc.setLineWidth(0.5);doc.roundedRect(rx,y,rW-2,19,2,2,'S');doc.setLineWidth(0.2);
    doc.setFillColor(...r.bc);doc.roundedRect(rx+2,y+2,10,4,1,1,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(5);doc.setFont('helvetica','bold');doc.text(r.lbl,rx+7,y+4.7,{align:'center'});
    doc.setTextColor(...r.tc);doc.setFontSize(12);doc.setFont('helvetica','bold');doc.text(r.val,rx+(rW-2)/2,y+13,{align:'center'});
    doc.setFontSize(5.5);doc.setFont('helvetica','normal');doc.text(r.sub,rx+(rW-2)/2,y+17,{align:'center'});
  });
  y+=23;

  doc.setFillColor(0,68,130);doc.rect(ML,y,CW,7,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont('helvetica','bold');
  doc.text('REKAP IURAN PER JABATAN — PER BULAN',ML+4,y+4.7);y+=9;

  const tb=d.rekapRows.map((r,i)=>[i+1,r.jabatan,
    {content:formatRp(r.upah),styles:{halign:'right'}},
    {content:`${r.jumlah} org`,styles:{halign:'center'}},
    {content:formatRp(r.totalUpah),styles:{halign:'right'}},
    {content:formatRp(r.jkk),styles:{halign:'right',textColor:[170,65,10],fontStyle:'bold'}},
    {content:formatRp(r.jkm),styles:{halign:'right',textColor:[95,30,155],fontStyle:'bold'}},
    {content:formatRp(r.jht),styles:{halign:'right',textColor:[20,115,50],fontStyle:'bold'}},
    {content:formatRp(r.total),styles:{halign:'right',textColor:[20,70,170],fontStyle:'bold'}},
  ]);
  tb.push([
    {content:'',styles:{fillColor:[0,52,105]}},{content:'TOTAL KESELURUHAN',styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold'}},
    {content:'',styles:{fillColor:[0,52,105]}},
    {content:`${d.gTotalPekerja} org`,styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold',halign:'center'}},
    {content:formatRp(d.gTotalUpah),styles:{fillColor:[0,52,105],textColor:[255,255,255],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJKK),styles:{fillColor:[0,52,105],textColor:[255,185,110],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJKM),styles:{fillColor:[0,52,105],textColor:[205,155,255],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalJHT),styles:{fillColor:[0,52,105],textColor:[110,235,155],fontStyle:'bold',halign:'right'}},
    {content:formatRp(d.gTotalIuran),styles:{fillColor:[0,52,105],textColor:[110,210,255],fontStyle:'bold',halign:'right'}},
  ]);
  doc.autoTable({startY:y,margin:{left:ML,right:MR},
    head:[['No','Jabatan','Upah/Org','Jml','Total Upah','JKK (Rp)','JKM (Rp)','JHT (Rp)','Total Iuran (Rp)']],
    body:tb,theme:'grid',
    styles:{font:'helvetica',fontSize:7,cellPadding:{top:2.5,bottom:2.5,left:2.5,right:2.5},lineColor:[205,218,230],lineWidth:0.22,textColor:[25,45,75],fillColor:[255,255,255]},
    headStyles:{fillColor:[0,95,175],textColor:[255,255,255],fontStyle:'bold',fontSize:7,halign:'center',cellPadding:{top:3,bottom:3,left:2.5,right:2.5}},
    alternateRowStyles:{fillColor:[245,249,255]},
    columnStyles:{0:{halign:'center',cellWidth:8},1:{cellWidth:38},2:{halign:'right',cellWidth:23},3:{halign:'center',cellWidth:14},4:{halign:'right',cellWidth:23},5:{halign:'right',cellWidth:20},6:{halign:'right',cellWidth:20},7:{halign:'right',cellWidth:20},8:{halign:'right',cellWidth:24}},
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
  doc.text(`Eff. Rate: ${((d.gTotalIuran/d.gTotalUpah)*100).toFixed(2)}% dari total upah`,W-MR,y+13,{align:'right'});

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
      ['Cacat Sebagian Anatomi','% Cacat x 80 x Rp 2.500.000'],
      ['Cacat Sebagian Fungsi','% Fungsi x % Cacat x 80 x 2.500.000'],
      ['Cacat Total Tetap (56 x 2.500.000)',{content:'Rp 112.000.000',styles:{textColor:[155,55,15],fontStyle:'bold',halign:'right'}}],
      [{content:'--- Kematian Akibat KK ---',styles:{fillColor:[255,230,200],textColor:[130,60,10],fontStyle:'bold',colSpan:2}},''],
      ['Santunan Kematian (48 x Rp 2.500.000)','Rp 96.000.000'],
      ['Santunan Pemakaman','Rp 10.000.000'],
      ['Santunan Berkala (sekaligus)','Rp 12.000.000'],
      [{content:'TOTAL SANTUNAN KEMATIAN KK',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold'}},{content:'Rp 118.000.000',styles:{fillColor:[225,85,10],textColor:[255,255,255],fontStyle:'bold',halign:'right'}}],
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
      ['TK / SD (Sederajat)','Rp 1.500.000','—'],['SMP (Sederajat)','Rp 2.000.000','—'],
      ['SMA (Sederajat)','Rp 3.000.000','—'],['Perguruan Tinggi / Kuliah','Rp 12.000.000','—'],
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
  doc.text(`Metode Future Value Anuitas Bulanan. Bunga pengembangan 5%/tahun setara deposito bank. Iuran JHT = Upah x ${(d.rateJHT*100).toFixed(2)}% per orang per bulan.`,ML+34,y+4);
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
  y=doc.lastAutoTable.finalY+6;

  if(y+10>H-12){doc.addPage();drawHeader();y=18;}
  doc.setFillColor(238,255,244);doc.roundedRect(ML,y,CW,9,2,2,'F');
  doc.setTextColor(55,125,70);doc.setFontSize(6.2);doc.setFont('helvetica','italic');
  doc.text('* Simulasi JHT menggunakan metode Future Value Anuitas dengan bunga 5%/tahun setara deposito bank. Nilai aktual JHT ditentukan oleh hasil investasi BPJS Ketenagakerjaan.',ML+3,y+4);
  doc.text('  Pencairan JHT dilakukan saat peserta berhenti bekerja, habis kontrak, atau memasuki usia pensiun.',ML+3,y+8);

  drawAllFooters(doc.internal.getNumberOfPages());
  doc.save(`Simulasi_BPJS_${d.nama.replace(/[^a-zA-Z0-9]/g,'_')}_${d.periode.replace(/\s+/g,'_')}.pdf`);
}

function resetForm() {
  if(!confirm('Reset semua data dan hasil perhitungan?')) return;
  document.getElementById('namaInstansi').value='';
  document.getElementById('resultsSection').style.display='none';
  jabatanList.slice().forEach(id=>{document.getElementById(`row-${id}`)?.remove();});
  jabatanList=[];rowCounter=0;
  tambahJabatan();
  window.scrollTo({top:0,behavior:'smooth'});
  window._pdfData=null;
}
