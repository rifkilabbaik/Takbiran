/**
 * Takbiran — penerima data penilaian untuk Google Spreadsheet.
 *
 * Pasang: Extensions ▸ Apps Script pada spreadsheet tujuan, tempel berkas ini,
 * lalu Deploy ▸ New deployment ▸ Web app
 *   Execute as       : Me
 *   Who has access   : Anyone
 * Salin URL yang berakhiran /exec ke Pengaturan aplikasi.
 *
 * Semua penulisan bersifat UPSERT berdasarkan kolom ID, jadi aplikasi boleh
 * mengirim ulang record yang sama tanpa memunculkan baris ganda. Itulah yang
 * membuat antrean offline di sisi aplikasi aman.
 */

var SPREADSHEET_ID = '159eILHT2HGI7lL8le4Eo32lZxJBE0xHM7JZr2peFMpY';

var SHEET_REKAP = 'Rekap';
var SHEET_DETAIL = 'Detail';

var HEAD_REKAP = [
  'ID', 'Waktu Input', 'Tanggal', 'Jam', 'Jenis', 'Area', 'Toko', 'Petugas',
  'Skor', 'Maks', 'Persen', 'Kategori', 'Jumlah Item', 'Item Tidak Memenuhi',
  'Jumlah Foto', 'Catatan', 'Perangkat'
];

var HEAD_DETAIL = [
  'ID', 'Tanggal', 'Toko', 'Petugas', 'Jenis', 'Grup', 'Item',
  'Nilai', 'Maks', 'Status', 'Keterangan', 'Foto'
];

/* ------------------------------------------------------------------ HTTP */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || 'ping';
  var out;

  try {
    if (action === 'ping') {
      var ss = book();
      out = { ok: true, sheet: ss.getName(), rows: Math.max(0, rekap().getLastRow() - 1), version: '2.0.0' };
    } else if (action === 'ids') {
      out = { ok: true, ids: allIds() };
    } else if (action === 'list') {
      out = { ok: true, rows: listRekap(Number(p.limit) || 800) };
    } else if (action === 'detail') {
      out = { ok: true, rows: listDetail(String(p.id || '')) };
    } else {
      out = { ok: false, error: 'Aksi tidak dikenal: ' + action };
    }
  } catch (err) {
    out = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  return reply(out, p.callback);
}

function doPost(e) {
  var out;
  var callback = (e && e.parameter && e.parameter.callback) || null;

  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action || 'save';

    if (action === 'save') {
      out = saveRecord(body.record);
    } else if (action === 'saveMany') {
      var results = (body.records || []).map(saveRecord);
      out = { ok: true, saved: results.length };
    } else if (action === 'delete') {
      out = deleteRecord(String(body.id || ''));
    } else {
      out = { ok: false, error: 'Aksi tidak dikenal: ' + action };
    }
  } catch (err) {
    out = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  return reply(out, callback);
}

function reply(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/* ----------------------------------------------------------------- SHEET */

function book() {
  return SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function sheetWithHeader(name, header) {
  var ss = book();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, header.length).setValues([header]);
  }
  var head = sh.getRange(1, 1, 1, header.length);
  head.setValues([header])
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground('#ea580c');
  sh.setFrozenRows(1);
  return sh;
}

function rekap() { return sheetWithHeader(SHEET_REKAP, HEAD_REKAP); }
function detail() { return sheetWithHeader(SHEET_DETAIL, HEAD_DETAIL); }

/* ----------------------------------------------------------------- TULIS */

function saveRecord(rec) {
  if (!rec || !rec.id) return { ok: false, error: 'Record tanpa ID' };

  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var shR = rekap();
    var row = [
      rec.id,
      rec.dibuat || new Date().toISOString(),
      rec.tanggal || '',
      rec.jam || '',
      rec.jenisLabel || rec.jenis || '',
      rec.area || '',
      rec.toko || '',
      rec.petugas || '',
      num(rec.skor),
      num(rec.maks),
      num(rec.persen),
      rec.kategori || '',
      num(rec.jumlahItem),
      num(rec.itemGagal),
      num(rec.jumlahFoto),
      rec.catatan || '',
      rec.perangkat || ''
    ];

    var at = findRow(shR, rec.id);
    if (at > 0) {
      shR.getRange(at, 1, 1, row.length).setValues([row]);
    } else {
      shR.appendRow(row);
      at = shR.getLastRow();
    }

    writeDetail(rec);
    return { ok: true, id: rec.id, row: at };
  } finally {
    lock.releaseLock();
  }
}

function writeDetail(rec) {
  var shD = detail();
  removeDetail(shD, rec.id);

  var items = rec.detail || [];
  if (!items.length) return;

  var rows = items.map(function (d) {
    return [
      rec.id,
      rec.tanggal || '',
      rec.toko || '',
      rec.petugas || '',
      rec.jenisLabel || rec.jenis || '',
      d.grup || '',
      d.item || '',
      num(d.nilai),
      num(d.maks),
      d.status || '',
      d.keterangan || '',
      d.foto || ''
    ];
  });

  shD.getRange(shD.getLastRow() + 1, 1, rows.length, HEAD_DETAIL.length).setValues(rows);
}

function removeDetail(shD, id) {
  var last = shD.getLastRow();
  if (last < 2) return;
  var ids = shD.getRange(2, 1, last - 1, 1).getValues();
  // Hapus dari bawah agar indeks baris di atasnya tidak bergeser.
  var start = -1, count = 0;
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === id) {
      if (start === -1) { start = i + 2; count = 1; }
      else if (start - count === i + 2) { count++; }
      else { shD.deleteRows(start - count + 1, count); start = i + 2; count = 1; }
    }
  }
  if (start !== -1) shD.deleteRows(start - count + 1, count);
}

function deleteRecord(id) {
  if (!id) return { ok: false, error: 'ID kosong' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var shR = rekap();
    var at = findRow(shR, id);
    if (at > 0) shR.deleteRow(at);
    removeDetail(detail(), id);
    return { ok: true, id: id, deleted: at > 0 };
  } finally {
    lock.releaseLock();
  }
}

/* ----------------------------------------------------------------- BACA */

function findRow(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function allIds() {
  var sh = rekap();
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 1).getValues()
    .map(function (r) { return String(r[0]); })
    .filter(function (v) { return v; });
}

function listRekap(limit) {
  var sh = rekap();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var n = Math.min(limit, last - 1);
  var start = last - n + 1;
  var vals = sh.getRange(start, 1, n, HEAD_REKAP.length).getValues();
  return vals.map(function (r) {
    return {
      id: String(r[0]),
      dibuat: iso(r[1]),
      tanggal: ymd(r[2]),
      jam: hm(r[3]),
      jenisLabel: String(r[4]),
      jenis: jenisKey(String(r[4])),
      area: String(r[5]),
      toko: String(r[6]),
      petugas: String(r[7]),
      skor: Number(r[8]) || 0,
      maks: Number(r[9]) || 0,
      persen: Number(r[10]) || 0,
      kategori: String(r[11]),
      jumlahItem: Number(r[12]) || 0,
      itemGagal: Number(r[13]) || 0,
      jumlahFoto: Number(r[14]) || 0,
      catatan: String(r[15] || ''),
      perangkat: String(r[16] || '')
    };
  }).filter(function (r) { return r.id; });
}

function listDetail(id) {
  var sh = detail();
  var last = sh.getLastRow();
  if (last < 2 || !id) return [];
  var vals = sh.getRange(2, 1, last - 1, HEAD_DETAIL.length).getValues();
  return vals.filter(function (r) { return String(r[0]) === id; }).map(function (r) {
    return {
      grup: String(r[5]), item: String(r[6]),
      nilai: Number(r[7]) || 0, maks: Number(r[8]) || 0,
      status: String(r[9]), keterangan: String(r[10] || '')
    };
  });
}

/* ----------------------------------------------------------------- UTIL */

function num(v) {
  var n = Number(v);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function jenisKey(label) {
  var l = String(label).toLowerCase();
  if (l.indexOf('7 langkah') >= 0) return '7langkah';
  if (l.indexOf('double') >= 0) return 'doublecheck';
  if (l.indexOf('bersih') >= 0) return 'kebersihan';
  return '';
}

function ymd(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '');
}

function hm(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(v || '');
}

function iso(v) {
  if (v instanceof Date) return v.toISOString();
  return String(v || '');
}

/* Jalankan sekali dari editor untuk menyiapkan kedua sheet + memberi izin. */
function setup() {
  rekap();
  detail();
  return 'Siap: ' + book().getName();
}
