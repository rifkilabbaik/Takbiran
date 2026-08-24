/* Takbiran — penyimpanan lokal.
   Metadata & hasil  -> localStorage (ringan, sinkron)
   Foto              -> IndexedDB    (besar, tidak muat di localStorage) */
(function (global) {
  'use strict';

  var K = {
    records:  'tkb.records.v1',
    draft:    'tkb.draft.v1',
    settings: 'tkb.settings.v1',
    remote:   'tkb.remote.v1'
  };

  var DEFAULT_SETTINGS = {
    endpoint: 'https://script.google.com/macros/s/AKfycbzbnUks4ELbcSkT7fHDsVhNjNq-aryDxnpC1Bvhb5uchOjkskLAY7RGebfxMPO3-RAn/exec',
    petugas: '',
    theme: 'auto',
    autoSync: true,
    showWeight: true
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val === null || val === undefined ? fallback : val;
    } catch (e) {
      console.warn('store.read', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('store.write', key, e);
      return false;
    }
  }

  function uid() {
    var t = Date.now().toString(36);
    var r = Math.random().toString(36).slice(2, 8);
    var r2 = Math.random().toString(36).slice(2, 6);
    return 'TKB-' + t + '-' + r + r2;
  }

  /* ---------- settings ---------- */
  var _settings = null;

  function settings() {
    if (!_settings) {
      var saved = read(K.settings, {});
      _settings = {};
      Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
        _settings[k] = saved[k] === undefined ? DEFAULT_SETTINGS[k] : saved[k];
      });
    }
    return _settings;
  }

  function saveSettings(patch) {
    var s = settings();
    Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
    write(K.settings, s);
    return s;
  }

  /* ---------- records ---------- */
  function records() {
    var list = read(K.records, []);
    return Array.isArray(list) ? list : [];
  }

  function saveRecord(rec) {
    var list = records();
    var i = list.findIndex(function (r) { return r.id === rec.id; });
    if (i >= 0) list[i] = rec; else list.unshift(rec);
    list.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    if (!write(K.records, list)) {
      // Kuota penuh: buang record tersinkron paling lama, lalu coba lagi.
      var trimmed = list.filter(function (r) { return r.sync !== 'ok'; })
        .concat(list.filter(function (r) { return r.sync === 'ok'; }).slice(0, 60));
      trimmed.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
      write(K.records, trimmed);
      return { ok: false, trimmed: true };
    }
    return { ok: true };
  }

  function getRecord(id) {
    return records().find(function (r) { return r.id === id; }) || null;
  }

  function deleteRecord(id) {
    var list = records().filter(function (r) { return r.id !== id; });
    write(K.records, list);
    return Photos.dropByRecord(id);
  }

  function pendingRecords() {
    return records().filter(function (r) { return r.sync !== 'ok'; });
  }

  /* ---------- draft ---------- */
  function draft() { return read(K.draft, null); }
  function saveDraft(d) { return write(K.draft, d); }
  function clearDraft() { try { localStorage.removeItem(K.draft); } catch (e) {} }

  /* ---------- cache hasil dari spreadsheet ---------- */
  function remoteCache() { return read(K.remote, { at: 0, rows: [] }); }
  function saveRemoteCache(rows) { return write(K.remote, { at: Date.now(), rows: rows || [] }); }

  /* ---------- foto (IndexedDB) ---------- */
  var Photos = (function () {
    var DB = 'tkb-photos', STORE = 'photos', VERSION = 1;
    var dbp = null;

    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (resolve, reject) {
        if (!global.indexedDB) { reject(new Error('IndexedDB tidak tersedia')); return; }
        var req = indexedDB.open(DB, VERSION);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(STORE)) {
            var os = db.createObjectStore(STORE, { keyPath: 'key' });
            os.createIndex('recordId', 'recordId', { unique: false });
          }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      }).catch(function (e) { dbp = null; throw e; });
      return dbp;
    }

    function tx(mode, fn) {
      return open().then(function (db) {
        return new Promise(function (resolve, reject) {
          var t = db.transaction(STORE, mode);
          var out = fn(t.objectStore(STORE));
          t.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : out); };
          t.onerror = function () { reject(t.error); };
          t.onabort = function () { reject(t.error); };
        });
      });
    }

    return {
      put: function (key, recordId, dataUrl) {
        return tx('readwrite', function (os) { os.put({ key: key, recordId: recordId, data: dataUrl }); })
          .catch(function (e) { console.warn('photo.put', e); });
      },
      get: function (key) {
        return open().then(function (db) {
          return new Promise(function (resolve) {
            var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
            req.onsuccess = function () { resolve(req.result ? req.result.data : null); };
            req.onerror = function () { resolve(null); };
          });
        }).catch(function () { return null; });
      },
      getMany: function (keys) {
        if (!keys || !keys.length) return Promise.resolve({});
        return open().then(function (db) {
          return new Promise(function (resolve) {
            var os = db.transaction(STORE, 'readonly').objectStore(STORE);
            var out = {}, left = keys.length;
            keys.forEach(function (k) {
              var req = os.get(k);
              req.onsuccess = function () { if (req.result) out[k] = req.result.data; if (!--left) resolve(out); };
              req.onerror = function () { if (!--left) resolve(out); };
            });
          });
        }).catch(function () { return {}; });
      },
      remove: function (key) {
        return tx('readwrite', function (os) { os.delete(key); }).catch(function () {});
      },
      dropByRecord: function (recordId) {
        return open().then(function (db) {
          return new Promise(function (resolve) {
            var t = db.transaction(STORE, 'readwrite');
            var idx = t.objectStore(STORE).index('recordId');
            var req = idx.openCursor(IDBKeyRange.only(recordId));
            req.onsuccess = function () {
              var c = req.result;
              if (c) { c.delete(); c.continue(); } else { resolve(); }
            };
            req.onerror = function () { resolve(); };
          });
        }).catch(function () {});
      },
      /* Buang foto yatim: milik draft lama atau record yang sudah dihapus. */
      gc: function (liveRecordIds) {
        var live = {};
        (liveRecordIds || []).forEach(function (id) { live[id] = 1; });
        return open().then(function (db) {
          return new Promise(function (resolve) {
            var t = db.transaction(STORE, 'readwrite');
            var req = t.objectStore(STORE).openCursor();
            var n = 0;
            req.onsuccess = function () {
              var c = req.result;
              if (!c) { resolve(n); return; }
              if (!live[c.value.recordId]) { c.delete(); n++; }
              c.continue();
            };
            req.onerror = function () { resolve(n); };
          });
        }).catch(function () { return 0; });
      },
      estimate: function () {
        if (navigator.storage && navigator.storage.estimate) return navigator.storage.estimate();
        return Promise.resolve({ usage: 0, quota: 0 });
      }
    };
  })();

  global.TKB_STORE = {
    KEYS: K,
    uid: uid,
    settings: settings,
    saveSettings: saveSettings,
    records: records,
    saveRecord: saveRecord,
    getRecord: getRecord,
    deleteRecord: deleteRecord,
    pendingRecords: pendingRecords,
    draft: draft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    remoteCache: remoteCache,
    saveRemoteCache: saveRemoteCache,
    Photos: Photos
  };
})(window);
