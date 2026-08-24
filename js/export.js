/* Takbiran — ekspor PDF / Excel / Markdown.
   Library berat dimuat saat dibutuhkan saja; service worker sudah menyimpannya
   di cache supaya ekspor tetap jalan waktu outlet tidak ada sinyal. */
(function (global) {
  'use strict';

  var Store = global.TKB_STORE;
  var C = global.TKB_CHART;
  var D = global.TKB_DATA;

  var LIB = {
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    exceljs: 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js'
  };
  var loaded = {};

  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { loaded[src] = null; reject(new Error('Gagal memuat pustaka ekspor')); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }

  function fileBase(rec) {
    var d = (rec.tanggal || '').replace(/-/g, '');
    var jenis = rec.jenis === '7langkah' ? '7-Langkah' : rec.jenis === 'doublecheck' ? 'Double-Check' : 'Kebersihan';
    var area = rec.areaLabels && rec.areaLabels.length && rec.areaLabels.length < 5
      ? '-' + rec.areaLabels.map(function (a) { return a.replace(/\s+/g, ''); }).join('-')
      : (rec.areaLabels && rec.areaLabels.length === 5 ? '-Semua' : '');
    return jenis + area + '_' + String(rec.toko || '').replace(/\s+/g, '-') + '_' + d;
  }

  function photosOf(rec) {
    var keys = [];
    rec.groups.forEach(function (g) {
      g.items.forEach(function (it) { if (it.photoKey) keys.push(it.photoKey); });
    });
    if (!keys.length) return Promise.resolve({});
    return Store.Photos.getMany(keys);
  }

  /* ------------------------------------------------------------------ MD */
  function buildMarkdown(rec) {
    var L = [];
    L.push('# Penilaian ' + rec.jenisLabel);
    L.push('');
    L.push('| | |');
    L.push('|---|---|');
    L.push('| **Nama Toko** | ' + rec.toko + ' |');
    L.push('| **' + D.JENIS[rec.jenis].petugas + '** | ' + rec.petugas + ' |');
    L.push('| **Hari/Tanggal** | ' + fmtTanggalMD(rec.tanggal) + ' |');
    L.push('| **Jam** | ' + rec.jam + ' |');
    if (rec.areaLabels.length) L.push('| **Area** | ' + rec.areaLabels.join(', ') + ' |');
    L.push('| **Poin** | **' + C.fmtPct(rec.persen) + '%** (' + rec.kategori + ') |');
    L.push('| **Item tidak memenuhi** | ' + rec.itemGagal + ' dari ' + rec.jumlahItem + ' |');
    L.push('');
    rec.groups.forEach(function (g) {
      L.push('## ' + g.label + ' — ' + C.fmtPct(g.persen) + '%');
      L.push('');
      L.push('| Item | Nilai | Keterangan |');
      L.push('|---|---:|---|');
      g.items.forEach(function (it) {
        var nilai = rec.mode === 'skala' ? (it.raw || 0) + '/5' : (it.ok ? 'Ya' : 'Tidak');
        L.push('| ' + mdCell(it.name) + ' | ' + nilai + ' | ' + mdCell(it.ket || '') + ' |');
      });
      L.push('');
    });
    if (rec.catatan) { L.push('> **Catatan:** ' + rec.catatan); L.push(''); }
    L.push('---');
    L.push('');
    L.push('**TOTAL:** ' + C.fmtPct(rec.skor) + ' / ' + C.fmtPct(rec.maks) + '  ');
    L.push('**POIN:** ' + C.fmtPct(rec.persen) + '%  ');
    L.push('**KATEGORI:** ' + rec.kategori);
    return L.join('\n');
  }

  function mdCell(s) { return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' '); }

  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function fmtTanggalMD(s) {
    var d = new Date(String(s) + 'T00:00:00');
    if (isNaN(d)) return s;
    return HARI[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ----------------------------------------------------------------- PDF */
  function buildPdf(rec) {
    return loadScript(LIB.jspdf).then(photosOf.bind(null, rec)).then(function (photos) {
      var jsPDF = global.jspdf.jsPDF;
      var pdf = new jsPDF('p', 'mm', 'a4');
      var pw = pdf.internal.pageSize.getWidth();
      var ph = pdf.internal.pageSize.getHeight();
      var mx = 15, mt = 16, mb = 16;
      var cw = pw - mx * 2;
      var y = mt;

      var ORANGE = [234, 88, 12], INK = [31, 41, 55], MUTED = [107, 114, 128];
      var GOOD = [12, 163, 12], WARN = [180, 125, 0], BAD = [208, 59, 59];
      var toneRGB = rec.persen >= 80 ? GOOD : rec.persen >= 75 ? WARN : BAD;

      function space(h) { if (y + h > ph - mb) { pdf.addPage(); y = mt; } }

      function text(str, o) {
        o = o || {};
        var size = o.size || 10, style = o.style || 'normal', col = o.color || INK, ind = o.indent || 0;
        pdf.setFont('helvetica', style); pdf.setFontSize(size);
        pdf.setTextColor(col[0], col[1], col[2]);
        var lines = pdf.splitTextToSize(String(str), cw - ind - (o.right || 0));
        var lh = size * 0.42;
        lines.forEach(function (ln) {
          space(lh);
          pdf.text(ln, mx + ind, y + lh * 0.78);
          y += lh;
        });
      }

      function rule(col) {
        space(3);
        var c = col || [222, 226, 230];
        pdf.setDrawColor(c[0], c[1], c[2]); pdf.setLineWidth(0.2);
        pdf.line(mx, y, pw - mx, y);
        y += 3;
      }

      function kv(k, v) {
        var size = 9.5, lh = size * 0.45;
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(size);
        pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        space(lh);
        pdf.text(k, mx, y + lh * 0.75);
        pdf.setFont('helvetica', 'bold'); pdf.setTextColor(INK[0], INK[1], INK[2]);
        var lines = pdf.splitTextToSize(String(v), cw - 38);
        lines.forEach(function (ln, i) {
          if (i) space(lh);
          pdf.text(ln, mx + 38, y + lh * 0.75);
          y += lh;
        });
        y += 0.6;
      }

      /* Kepala laporan */
      pdf.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
      pdf.rect(0, 0, pw, 26, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16); pdf.setTextColor(255, 255, 255);
      pdf.text('Takbiran', mx, 12);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5);
      pdf.text('Cetak Biru Pelayanan — Labbaik Chicken', mx, 18.5);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(19);
      pdf.text(C.fmtPct(rec.persen) + '%', pw - mx, 13, { align: 'right' });
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
      pdf.text(rec.kategori, pw - mx, 19, { align: 'right' });
      y = 34;

      text('PENILAIAN ' + rec.jenisLabel.toUpperCase(), { size: 13, style: 'bold', color: ORANGE });
      y += 1.5;
      rule();
      kv('Nama Toko', rec.toko);
      kv(D.JENIS[rec.jenis].petugas, rec.petugas);
      kv('Hari/Tanggal', fmtTanggalMD(rec.tanggal));
      kv('Jam', rec.jam);
      if (rec.areaLabels.length) kv('Area', rec.areaLabels.join(', '));
      kv('Total Skor', C.fmtPct(rec.skor) + ' / ' + C.fmtPct(rec.maks));
      kv('Tidak Memenuhi', rec.itemGagal + ' dari ' + rec.jumlahItem + ' item');
      if (rec.catatan) kv('Catatan', rec.catatan);
      rule();

      rec.groups.forEach(function (g) {
        y += 2.5;
        space(9);
        var head = rec.mode === 'skala'
          ? g.items.reduce(function (s, i) { return s + (Number(i.raw) || 0); }, 0) + '/' + (g.items.length * 5)
          : C.fmtPct(g.skor, 0) + '/' + C.fmtPct(g.maks, 0);
        pdf.setFillColor(255, 247, 237);
        pdf.rect(mx, y - 1, cw, 7, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
        pdf.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2]);
        pdf.text(g.label, mx + 2, y + 3.8);
        pdf.text(head + '  ·  ' + C.fmtPct(g.persen, 0) + '%', pw - mx - 2, y + 3.8, { align: 'right' });
        y += 9;

        g.items.forEach(function (it) {
          var mark = rec.mode === 'checklist' ? (it.ok ? '[v] ' : '[x] ') : '';
          var val = rec.mode === 'skala' ? '[' + (it.raw || 0) + '/5]' : (it.ok ? '[Ya]' : '[Tidak]');
          var size = 9.5, lh = size * 0.45;
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(size);
          var col = it.ok ? INK : BAD;
          pdf.setTextColor(col[0], col[1], col[2]);
          var lines = pdf.splitTextToSize(mark + it.name, cw - 20);
          lines.forEach(function (ln, i) {
            space(lh);
            pdf.text(ln, mx + 2, y + lh * 0.78);
            if (i === 0) {
              pdf.setFont('helvetica', 'bold');
              pdf.text(val, pw - mx, y + lh * 0.78, { align: 'right' });
              pdf.setFont('helvetica', 'normal');
            }
            y += lh;
          });
          if (it.ket) text('"' + it.ket + '"', { size: 8.5, style: 'italic', color: MUTED, indent: 6 });
          if (it.photoKey && photos[it.photoKey]) y = drawImage(pdf, photos[it.photoKey], mx + 6, y, ph, mb, mt);
        });
      });

      y += 4;
      rule(toneRGB);
      space(16);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(mx, y, cw, 14, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
      pdf.setTextColor(INK[0], INK[1], INK[2]);
      pdf.text('POIN AKHIR', mx + 3, y + 6);
      pdf.setTextColor(toneRGB[0], toneRGB[1], toneRGB[2]);
      pdf.setFontSize(15);
      pdf.text(C.fmtPct(rec.persen) + '%', pw - mx - 3, y + 7, { align: 'right' });
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      pdf.text('Kategori: ' + rec.kategori, mx + 3, y + 11);
      y += 18;

      /* Nomor halaman */
      var pages = pdf.internal.getNumberOfPages();
      for (var p = 1; p <= pages; p++) {
        pdf.setPage(p);
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Takbiran · ' + rec.toko + ' · ' + rec.tanggal, mx, ph - 8);
        pdf.text(p + ' / ' + pages, pw - mx, ph - 8, { align: 'right' });
      }

      return pdf.output('blob');
    });
  }

  function drawImage(pdf, dataUrl, x, y, ph, mb, mt) {
    var props;
    try { props = pdf.getImageProperties(dataUrl); } catch (e) { return y; }
    var maxW = 62, maxH = 50;
    var w = maxW, h = props.height / props.width * w;
    if (h > maxH) { h = maxH; w = props.width / props.height * h; }
    if (y + h + 3 > ph - mb) { pdf.addPage(); y = mt; }
    try { pdf.addImage(dataUrl, 'JPEG', x, y + 1, w, h); } catch (e) { return y; }
    return y + h + 4;
  }

  /* ---------------------------------------------------------------- XLSX */
  function buildXlsx(rec) {
    return loadScript(LIB.exceljs).then(photosOf.bind(null, rec)).then(function (photos) {
      var wb = new global.ExcelJS.Workbook();
      wb.creator = 'Takbiran';
      wb.created = new Date();

      var ws = wb.addWorksheet('Hasil', { views: [{ state: 'frozen', ySplit: 9 }] });
      ws.getColumn(1).width = 5;
      ws.getColumn(2).width = 58;
      ws.getColumn(3).width = 11;
      ws.getColumn(4).width = 38;
      ws.getColumn(5).width = 20;

      var thin = {
        top: { style: 'thin', color: { argb: 'FFE0E3E8' } },
        left: { style: 'thin', color: { argb: 'FFE0E3E8' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E3E8' } },
        right: { style: 'thin', color: { argb: 'FFE0E3E8' } }
      };
      function border(r, a, b) { for (var c = a; c <= b; c++) ws.getCell(r, c).border = thin; }

      var r = 1;
      ws.mergeCells(r, 1, r, 5);
      var t = ws.getCell(r, 1);
      t.value = 'PENILAIAN ' + rec.jenisLabel.toUpperCase();
      t.font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' } };
      t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
      t.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(r).height = 28;
      r += 2;

      var info = [
        ['Nama Toko', rec.toko],
        [D.JENIS[rec.jenis].petugas, rec.petugas],
        ['Hari/Tanggal', fmtTanggalMD(rec.tanggal)],
        ['Jam', rec.jam]
      ];
      if (rec.areaLabels.length) info.push(['Area', rec.areaLabels.join(', ')]);
      info.push(['Total Skor', C.fmtPct(rec.skor) + ' / ' + C.fmtPct(rec.maks)]);
      info.push(['Poin', C.fmtPct(rec.persen) + '%']);
      info.push(['Kategori', rec.kategori]);
      if (rec.catatan) info.push(['Catatan', rec.catatan]);

      info.forEach(function (pair) {
        ws.getCell(r, 1).value = pair[0];
        ws.getCell(r, 1).font = { bold: true, size: 10 };
        ws.mergeCells(r, 2, r, 5);
        ws.getCell(r, 2).value = pair[1];
        ws.getCell(r, 2).alignment = { wrapText: true, vertical: 'top' };
        border(r, 1, 5);
        r++;
      });
      r++;

      var headers = ['No', 'Item Penilaian', 'Nilai', 'Keterangan', 'Foto'];
      headers.forEach(function (h, i) {
        var c = ws.getCell(r, i + 1);
        c.value = h;
        c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = thin;
      });
      ws.autoFilter = { from: { row: r, column: 1 }, to: { row: r, column: 5 } };
      r++;

      rec.groups.forEach(function (g) {
        ws.mergeCells(r, 1, r, 5);
        var gc = ws.getCell(r, 1);
        var head = rec.mode === 'skala'
          ? g.items.reduce(function (s, i) { return s + (Number(i.raw) || 0); }, 0) + '/' + (g.items.length * 5)
          : C.fmtPct(g.skor, 0) + '/' + C.fmtPct(g.maks, 0);
        gc.value = g.label + '  [' + head + ' · ' + C.fmtPct(g.persen, 0) + '%]';
        gc.font = { bold: true, color: { argb: 'FFC2410C' }, size: 10.5 };
        gc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
        border(r, 1, 5);
        r++;

        g.items.forEach(function (it, i) {
          ws.getCell(r, 1).value = i + 1;
          ws.getCell(r, 2).value = it.name;
          ws.getCell(r, 3).value = rec.mode === 'skala' ? (it.raw || 0) + '/5' : (it.ok ? 'Ya' : 'Tidak');
          ws.getCell(r, 4).value = it.ket || '';
          ws.getCell(r, 1).alignment = { horizontal: 'center', vertical: 'top' };
          ws.getCell(r, 2).alignment = { wrapText: true, vertical: 'top' };
          ws.getCell(r, 3).alignment = { horizontal: 'center', vertical: 'middle' };
          ws.getCell(r, 4).alignment = { wrapText: true, vertical: 'top' };
          if (!it.ok) {
            ws.getCell(r, 3).font = { bold: true, color: { argb: 'FFD03B3B' } };
          } else {
            ws.getCell(r, 3).font = { bold: true, color: { argb: 'FF0CA30C' } };
          }
          border(r, 1, 5);

          if (it.photoKey && photos[it.photoKey]) {
            try {
              var id = wb.addImage({ base64: photos[it.photoKey].split(',')[1], extension: 'jpeg' });
              ws.getRow(r).height = 86;
              ws.addImage(id, { tl: { col: 4.1, row: r - 1 + 0.06 }, ext: { width: 128, height: 104 }, editAs: 'oneCell' });
            } catch (e) { console.warn('xlsx image', e); }
          }
          r++;
        });
      });

      r++;
      [['TOTAL', C.fmtPct(rec.skor) + ' / ' + C.fmtPct(rec.maks)],
       ['POIN', C.fmtPct(rec.persen) + '%'],
       ['KATEGORI', rec.kategori]].forEach(function (pair, i) {
        ws.getCell(r, 1).value = pair[0];
        ws.getCell(r, 1).font = { bold: true };
        ws.mergeCells(r, 2, r, 5);
        ws.getCell(r, 2).value = pair[1];
        ws.getCell(r, 2).font = { bold: true, size: i ? 11 : 10, color: { argb: i ? 'FFEA580C' : 'FF10151C' } };
        border(r, 1, 5);
        r++;
      });

      /* Lembar kedua: data mentah, siap di-pivot */
      var raw = wb.addWorksheet('Data');
      raw.columns = [
        { header: 'ID', key: 'id', width: 26 },
        { header: 'Tanggal', key: 'tgl', width: 12 },
        { header: 'Jam', key: 'jam', width: 8 },
        { header: 'Toko', key: 'toko', width: 20 },
        { header: 'Petugas', key: 'petugas', width: 18 },
        { header: 'Jenis', key: 'jenis', width: 22 },
        { header: 'Grup', key: 'grup', width: 26 },
        { header: 'Item', key: 'item', width: 52 },
        { header: 'Nilai', key: 'nilai', width: 9 },
        { header: 'Maks', key: 'maks', width: 9 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Keterangan', key: 'ket', width: 38 }
      ];
      raw.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      raw.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
      raw.views = [{ state: 'frozen', ySplit: 1 }];
      rec.groups.forEach(function (g) {
        g.items.forEach(function (it) {
          raw.addRow({
            id: rec.id, tgl: rec.tanggal, jam: rec.jam, toko: rec.toko, petugas: rec.petugas,
            jenis: rec.jenisLabel, grup: g.label, item: it.name,
            nilai: Math.round(it.nilai * 100) / 100, maks: Math.round(it.bobot * 100) / 100,
            status: it.status, ket: it.ket || ''
          });
        });
      });
      raw.autoFilter = { from: 'A1', to: 'L1' };

      return wb.xlsx.writeBuffer().then(function (buf) {
        return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      });
    });
  }

  /* --------------------------------------------------------------- keluar */
  function deliver(blob, filename, mime, helpers) {
    var file;
    try { file = new File([blob], filename, { type: mime }); }
    catch (e) { file = blob; }

    var canShareFile = navigator.canShare && navigator.canShare({ files: [file] });
    if (navigator.share && canShareFile) {
      return navigator.share({ files: [file], title: filename })
        .then(function () { helpers.toast('File dibagikan', 'ok'); })
        .catch(function (err) {
          if (err && err.name === 'AbortError') return;
          download(blob, filename);
          helpers.toast('File diunduh', 'ok');
        });
    }
    download(blob, filename);
    helpers.toast('File diunduh', 'ok');
    return Promise.resolve();
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function run(kind, rec, helpers) {
    var base = fileBase(rec);
    if (kind === 'md') {
      var blob = new Blob([buildMarkdown(rec)], { type: 'text/markdown;charset=utf-8' });
      return deliver(blob, base + '.md', 'text/markdown', helpers);
    }
    helpers.busy(true, kind === 'pdf' ? 'Menyusun PDF...' : 'Menyusun Excel...');
    var job = kind === 'pdf' ? buildPdf(rec) : buildXlsx(rec);
    return job.then(function (blob) {
      helpers.busy(false);
      return deliver(blob, base + (kind === 'pdf' ? '.pdf' : '.xlsx'),
        kind === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        helpers);
    }).catch(function (err) {
      helpers.busy(false);
      console.error(err);
      helpers.toast(err.message || 'Gagal membuat file', 'err');
    });
  }

  function openMenu(rec, helpers) {
    var punyaFoto = rec.fotoCount > 0;
    helpers.openSheet('Ekspor hasil', punyaFoto ? 'PDF dan Excel menyertakan foto bukti' : null, [
      { label: 'PDF (.pdf)', icon: 'file', desc: 'Laporan rapi siap cetak', action: function () { run('pdf', rec, helpers); } },
      { label: 'Excel (.xlsx)', icon: 'table', desc: 'Termasuk lembar data mentah', action: function () { run('xlsx', rec, helpers); } },
      { label: 'Markdown (.md)', icon: 'file', desc: 'Teks ringan untuk dokumentasi', action: function () { run('md', rec, helpers); } }
    ]);
  }

  global.TKB_EXPORT = { openMenu: openMenu, run: run, buildMarkdown: buildMarkdown, fileBase: fileBase };
})(window);
