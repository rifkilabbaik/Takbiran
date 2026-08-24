/* Takbiran — sinkronisasi ke Google Spreadsheet lewat Apps Script Web App.
 *
 * Kontrak:
 *   POST  body JSON (Content-Type: text/plain — sengaja, agar tidak memicu
 *         CORS preflight yang selalu ditolak Apps Script)
 *         { action:'save', record:{...} }              -> { ok, id }
 *   GET   ?action=ids                                   -> { ok, ids:[...] }
 *   GET   ?action=list&limit=n                          -> { ok, rows:[...] }
 *   GET   ?action=ping                                  -> { ok, sheet }
 *
 * Semua tulisan bersifat upsert berdasarkan ID, jadi mengirim ulang record
 * yang sama tidak pernah menghasilkan baris ganda. Itu yang membuat antrean
 * offline dan fallback no-cors aman.
 */
(function (global) {
  'use strict';

  var Store = global.TKB_STORE;
  var listeners = [];
  var state = { busy: false, lastError: null, lastSyncAt: 0 };

  function emit() {
    var snap = {
      busy: state.busy,
      lastError: state.lastError,
      lastSyncAt: state.lastSyncAt,
      pending: Store.pendingRecords().length,
      online: navigator.onLine
    };
    listeners.forEach(function (fn) { try { fn(snap); } catch (e) { console.warn(e); } });
  }

  function onChange(fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }

  function endpoint() {
    var url = (Store.settings().endpoint || '').trim();
    return url.replace(/\s+/g, '');
  }

  function configured() { return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(endpoint()); }

  function withTimeout(ms) {
    if (!global.AbortController) return { signal: undefined, done: function () {} };
    var ac = new AbortController();
    var t = setTimeout(function () { ac.abort(); }, ms);
    return { signal: ac.signal, done: function () { clearTimeout(t); } };
  }

  /* ---------- GET: fetch dulu, JSONP kalau CORS memblokir ---------- */
  function getJSON(params, timeoutMs) {
    if (!configured()) return Promise.reject(new Error('URL Web App belum diatur'));
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var url = endpoint() + '?' + qs;
    var t = withTimeout(timeoutMs || 20000);

    return fetch(url, { method: 'GET', redirect: 'follow', signal: t.signal })
      .then(function (res) {
        t.done();
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .catch(function (err) {
        t.done();
        if (err && err.name === 'AbortError') throw new Error('Waktu tunggu habis');
        return jsonp(url, timeoutMs || 20000);
      });
  }

  var jsonpSeq = 0;
  function jsonp(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var cb = '__tkbjsonp' + (++jsonpSeq) + '_' + Date.now();
      var s = document.createElement('script');
      var timer = setTimeout(function () { cleanup(); reject(new Error('Tidak dapat menghubungi server')); }, timeoutMs);
      function cleanup() {
        clearTimeout(timer);
        try { delete global[cb]; } catch (e) { global[cb] = undefined; }
        if (s.parentNode) s.parentNode.removeChild(s);
      }
      global[cb] = function (data) { cleanup(); resolve(data); };
      s.onerror = function () { cleanup(); reject(new Error('Tidak dapat menghubungi server')); };
      s.src = url + '&callback=' + cb;
      document.head.appendChild(s);
    });
  }

  /* ---------- POST ---------- */
  function postJSON(payload, timeoutMs) {
    if (!configured()) return Promise.reject(new Error('URL Web App belum diatur'));
    var t = withTimeout(timeoutMs || 25000);
    var body = JSON.stringify(payload);

    return fetch(endpoint(), {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      signal: t.signal
    }).then(function (res) {
      t.done();
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!data || data.ok !== true) throw new Error((data && data.error) || 'Ditolak server');
      return { verified: true, data: data };
    }).catch(function (err) {
      t.done();
      if (err && err.name === 'AbortError') throw new Error('Waktu tunggu habis');
      // Terakhir: kirim buta (opaque). Server tetap menulis; kita verifikasi
      // belakangan lewat ?action=ids — aman karena penulisan bersifat upsert.
      return fetch(endpoint(), {
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body
      }).then(function () {
        return { verified: false, data: null };
      }).catch(function () {
        throw new Error(err && err.message ? err.message : 'Gagal mengirim');
      });
    });
  }

  /* ---------- payload: TEKS SAJA, foto tidak ikut ---------- */
  function toPayload(rec) {
    return {
      id: rec.id,
      dibuat: new Date(rec.createdAt).toISOString(),
      jenis: rec.jenis,
      jenisLabel: rec.jenisLabel,
      area: (rec.areaLabels || []).join(', '),
      toko: rec.toko,
      petugas: rec.petugas,
      tanggal: rec.tanggal,
      jam: rec.jam,
      skor: round2(rec.skor),
      maks: round2(rec.maks),
      persen: round2(rec.persen),
      kategori: rec.kategori,
      jumlahItem: rec.jumlahItem,
      itemGagal: rec.itemGagal,
      jumlahFoto: rec.fotoCount || 0,
      catatan: rec.catatan || '',
      perangkat: rec.device || '',
      detail: (rec.detail || []).map(function (d) {
        return {
          grup: d.grup,
          item: d.item,
          nilai: round2(d.nilai),
          maks: round2(d.maks),
          status: d.status,
          keterangan: d.keterangan || '',
          foto: d.foto ? 'Ada' : ''
        };
      })
    };
  }

  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }

  /* ---------- API ---------- */
  function pushRecord(rec) {
    return postJSON({ action: 'save', record: toPayload(rec) }).then(function (r) {
      var fresh = Store.getRecord(rec.id) || rec;
      fresh.sync = r.verified ? 'ok' : 'sent';
      fresh.syncedAt = Date.now();
      fresh.syncError = null;
      Store.saveRecord(fresh);
      return fresh;
    }).catch(function (err) {
      var fresh = Store.getRecord(rec.id) || rec;
      fresh.sync = 'error';
      fresh.syncError = err.message || String(err);
      Store.saveRecord(fresh);
      throw err;
    });
  }

  /* Cocokkan record lokal berstatus "sent" dengan ID yang benar-benar ada di sheet. */
  function verifySent() {
    var sent = Store.records().filter(function (r) { return r.sync === 'sent'; });
    if (!sent.length) return Promise.resolve(0);
    return getJSON({ action: 'ids' }, 15000).then(function (res) {
      if (!res || !res.ok || !Array.isArray(res.ids)) return 0;
      var have = {};
      res.ids.forEach(function (id) { have[id] = 1; });
      var n = 0;
      sent.forEach(function (r) {
        if (have[r.id]) {
          var fresh = Store.getRecord(r.id) || r;
          fresh.sync = 'ok';
          fresh.syncedAt = Date.now();
          Store.saveRecord(fresh);
          n++;
        }
      });
      return n;
    }).catch(function () { return 0; });
  }

  function syncAll(opts) {
    opts = opts || {};
    if (state.busy) return Promise.resolve({ skipped: true });
    if (!configured()) {
      state.lastError = 'URL Web App belum diatur';
      emit();
      return Promise.resolve({ ok: false, error: state.lastError });
    }
    if (!navigator.onLine) {
      state.lastError = 'Perangkat sedang offline';
      emit();
      return Promise.resolve({ ok: false, error: state.lastError });
    }

    var queue = Store.records().filter(function (r) { return r.sync !== 'ok'; });
    state.busy = true;
    state.lastError = null;
    emit();

    var sent = 0, failed = 0, lastErr = null;

    return queue.reduce(function (chain, rec) {
      return chain.then(function () {
        if (rec.sync === 'sent') return null;               // tinggal diverifikasi
        return pushRecord(rec).then(function () { sent++; })
          .catch(function (e) { failed++; lastErr = e.message || String(e); });
      });
    }, Promise.resolve())
      .then(verifySent)
      .then(function () {
        if (opts.pull !== false) return pullList().catch(function () { return null; });
        return null;
      })
      .then(function () {
        state.busy = false;
        state.lastSyncAt = Date.now();
        state.lastError = failed ? lastErr : null;
        emit();
        return { ok: !failed, sent: sent, failed: failed, error: lastErr };
      })
      .catch(function (err) {
        state.busy = false;
        state.lastError = err.message || String(err);
        emit();
        return { ok: false, error: state.lastError };
      });
  }

  /* Tarik rekap dari spreadsheet supaya dashboard tetap utuh di perangkat lain. */
  function pullList(limit) {
    return getJSON({ action: 'list', limit: limit || 800 }, 25000).then(function (res) {
      if (!res || !res.ok || !Array.isArray(res.rows)) throw new Error((res && res.error) || 'Data tidak terbaca');
      Store.saveRemoteCache(res.rows);
      return res.rows;
    });
  }

  function ping() {
    return getJSON({ action: 'ping' }, 15000);
  }

  function status() {
    return {
      busy: state.busy,
      lastError: state.lastError,
      lastSyncAt: state.lastSyncAt,
      pending: Store.pendingRecords().length,
      online: navigator.onLine,
      configured: configured()
    };
  }

  global.addEventListener('online', function () {
    emit();
    if (Store.settings().autoSync && Store.pendingRecords().length) syncAll({ pull: false });
  });
  global.addEventListener('offline', emit);

  global.TKB_SYNC = {
    onChange: onChange,
    status: status,
    configured: configured,
    endpoint: endpoint,
    pushRecord: pushRecord,
    syncAll: syncAll,
    pullList: pullList,
    ping: ping,
    toPayload: toPayload,
    emit: emit
  };
})(window);
