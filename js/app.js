/* Takbiran — Cetak Biru Pelayanan
   Lapisan aplikasi: ikon, util, navigasi, dan seluruh layar. */
(function (global) {
  'use strict';

  var D = global.TKB_DATA;
  var Store = global.TKB_STORE;
  var Sync = global.TKB_SYNC;
  var C = global.TKB_CHART;

  /* =========================================================================
     1. UTIL
     ========================================================================= */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = C.esc;

  var ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    chart: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    settings: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    cloud: '<path d="M18 17.5a4 4 0 0 0-1.3-7.8A6 6 0 0 0 5.2 11 3.5 3.5 0 0 0 6 17.5z"/>',
    cloudOff: '<path d="M3 3l18 18"/><path d="M18 17.5a4 4 0 0 0-1.3-7.8 6 6 0 0 0-9-3.6"/><path d="M5.5 10.5A3.5 3.5 0 0 0 6 17.5h9"/>',
    alert: '<path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    xCircle: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    store: '<path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M3 9.5h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13.5V20h14v-6.5"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    up: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    dn: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    minus: '<path d="M5 12h14"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    file: '<path d="M14 3v5h5"/><path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7z"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.5 6.5 2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    broom: '<path d="M4 20 9 15"/><path d="m13 3 8 8-4.5 4.5a3 3 0 0 1-4.2 0l-3.8-3.8a3 3 0 0 1 0-4.2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>'
  };

  function ico(name, cls) {
    var p = ICONS[name] || '';
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function parseDate(s) { return new Date(String(s) + 'T00:00:00'); }
  function fmtTanggal(s) {
    if (!s) return '-';
    var d = parseDate(s);
    if (isNaN(d)) return s;
    return HARI[d.getDay()] + ', ' + pad(d.getDate()) + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtTanggalPendek(s) {
    if (!s) return '-';
    var d = parseDate(s);
    if (isNaN(d)) return s;
    return pad(d.getDate()) + ' ' + BULAN_S[d.getMonth()];
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function pct(v, dec) { return C.fmtPct(v, dec) + '%'; }
  function relTime(ts) {
    if (!ts) return 'belum pernah';
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'baru saja';
    if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
    if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
    return Math.floor(s / 86400) + ' hari lalu';
  }

  /* ---------- toast / busy / dialog ---------- */
  function toast(msg, kind) {
    var host = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    var mark = kind === 'ok' ? ico('checkCircle') : kind === 'err' ? ico('xCircle') : '';
    el.innerHTML = mark + '<span>' + esc(msg) + '</span>';
    host.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); }); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, kind === 'err' ? 3800 : 2600);
  }

  function busy(on, label) {
    var el = $('#busy');
    $('#busy-label').textContent = label || 'Memproses...';
    el.classList.toggle('show', !!on);
  }

  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var scrim = $('#dialog-scrim');
      $('#dialog-title').textContent = opts.title || 'Konfirmasi';
      $('#dialog-text').textContent = opts.text || '';
      var ok = $('#dialog-ok'), cancel = $('#dialog-cancel');
      ok.textContent = opts.okText || 'Lanjutkan';
      cancel.textContent = opts.cancelText || 'Batal';
      ok.className = 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary');
      function close(v) {
        scrim.classList.remove('show');
        ok.onclick = null; cancel.onclick = null; scrim.onclick = null;
        resolve(v);
      }
      ok.onclick = function () { close(true); };
      cancel.onclick = function () { close(false); };
      scrim.onclick = function (e) { if (e.target === scrim) close(false); };
      scrim.classList.add('show');
    });
  }

  function openSheet(title, subtitle, options) {
    var scrim = $('#sheet-scrim');
    $('#sheet-title').textContent = title;
    var sub = $('#sheet-sub');
    sub.textContent = subtitle || '';
    sub.hidden = !subtitle;
    var body = $('#sheet-body');
    body.innerHTML = '';
    options.forEach(function (opt) {
      if (opt.hidden) return;
      var b = document.createElement('button');
      b.className = 'sheet-opt' + (opt.danger ? ' danger' : '');
      b.innerHTML = '<span class="oi">' + ico(opt.icon || 'right') + '</span>' +
        '<span class="ot">' + esc(opt.label) + (opt.desc ? '<small>' + esc(opt.desc) + '</small>' : '') + '</span>';
      b.onclick = function () { closeSheet(); setTimeout(function () { opt.action(); }, 180); };
      body.appendChild(b);
    });
    scrim.classList.add('show');
    scrim.onclick = function (e) { if (e.target === scrim) closeSheet(); };
  }
  function closeSheet() { $('#sheet-scrim').classList.remove('show'); }

  function lightbox(src) {
    var scrim = $('#lightbox-scrim');
    $('#lightbox-img').src = src;
    scrim.classList.add('show');
    scrim.onclick = function () { scrim.classList.remove('show'); $('#lightbox-img').src = ''; };
  }

  /* ---------- tema ---------- */
  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
    var dark = mode === 'dark' || (mode === 'auto' && global.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0c0f14' : '#ea580c');
  }

  /* =========================================================================
     2. STATE SESI
     ========================================================================= */
  var app = {
    tab: 'home',
    wizardOpen: false,
    step: null,
    draft: null,            // draft aktif
    viewing: null,          // record yang sedang dibuka dari riwayat
    filters: { periode: 30, jenis: 'all', toko: '' },
    histFilter: { q: '', mode: 'all' }
  };

  function newDraft(jenis) {
    return {
      id: Store.uid(),
      jenis: jenis,
      areas: [],
      toko: '',
      petugas: Store.settings().petugas || '',
      tanggal: todayISO(),
      jam: nowHM(),
      catatan: '',
      answers: {},
      notes: {},
      photos: {},
      updatedAt: Date.now()
    };
  }

  var saveDraftSoon = debounce(function () {
    if (app.draft) {
      app.draft.updatedAt = Date.now();
      Store.saveDraft(app.draft);
    }
  }, 400);

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* =========================================================================
     3. NAVIGASI
     ========================================================================= */
  var TABS = ['home', 'dash', 'hist', 'set'];

  function showTab(tab, opts) {
    opts = opts || {};
    if (TABS.indexOf(tab) < 0) tab = 'home';
    app.tab = tab;
    TABS.forEach(function (t) {
      $('#view-' + t).classList.toggle('active', t === tab);
      $('#tab-' + t).classList.toggle('active', t === tab);
      $('#tab-' + t).setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    if (tab === 'home') renderHome();
    if (tab === 'dash') renderDash();
    if (tab === 'hist') renderHist();
    if (tab === 'set') renderSettings();
    window.scrollTo(0, 0);
    if (!opts.silent) pushRoute({ tab: tab });
  }

  var STEPS = ['jenis', 'area', 'form', 'isi', 'hasil'];

  function openWizard(step) {
    app.wizardOpen = true;
    $('#wizard').classList.add('open');
    $('.tabbar').style.display = 'none';
    gotoStep(step || 'jenis');
  }

  function closeWizard(opts) {
    opts = opts || {};
    app.wizardOpen = false;
    app.viewing = null;
    $('#wizard').classList.remove('open');
    $('.tabbar').style.display = '';
    if (!opts.keepDraft && app.draft && !app.draft.saved) { /* draft tetap tersimpan */ }
  }

  function gotoStep(step) {
    app.step = step;
    STEPS.concat(['detail']).forEach(function (s) {
      var el = $('#step-' + s);
      if (el) el.classList.toggle('active', s === step);
    });
    var scroller = $('#step-' + step + ' .body-scroll');
    if (scroller) scroller.scrollTop = 0;
    if (step === 'jenis') renderStepJenis();
    if (step === 'area') renderStepArea();
    if (step === 'form') renderStepForm();
    if (step === 'isi') renderStepIsi();
    updateWizProgress();
  }

  function updateWizProgress() {
    var order = app.draft && app.draft.jenis === 'kebersihan'
      ? ['jenis', 'area', 'form', 'isi', 'hasil']
      : ['jenis', 'form', 'isi', 'hasil'];
    var i = order.indexOf(app.step);
    if (i < 0) return;
    var totalSteps = order.length;
    $$('.wiz-progress').forEach(function (el) { el.style.width = ((i + 1) / totalSteps * 100) + '%'; });
    $$('.wiz-count').forEach(function (el) { el.textContent = 'Langkah ' + (i + 1) + '/' + totalSteps; });
  }

  /* Tombol kembali perangkat tidak boleh membuang pekerjaan. */
  function pushRoute(stateObj) {
    try { history.pushState(stateObj, '', location.pathname + location.search); } catch (e) {}
  }

  function handleBack() {
    if ($('#lightbox-scrim').classList.contains('show')) { $('#lightbox-scrim').classList.remove('show'); return true; }
    if ($('#sheet-scrim').classList.contains('show')) { closeSheet(); return true; }
    if ($('#dialog-scrim').classList.contains('show')) { $('#dialog-cancel').click(); return true; }
    if (app.wizardOpen) { wizardBack(); return true; }
    if (app.tab !== 'home') { showTab('home', { silent: true }); return true; }
    return false;
  }

  window.addEventListener('popstate', function () {
    if (handleBack()) pushRoute({ guard: 1 });
  });

  /* =========================================================================
     4. LAYAR: BERANDA
     ========================================================================= */
  function renderHome() {
    var s = Store.settings();
    var recs = Store.records();
    var hour = new Date().getHours();
    var salam = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
    $('#greet-hi').textContent = salam + ',';
    $('#greet-name').textContent = s.petugas ? s.petugas : 'Tim Labbaik';

    // Kartu ringkasan bulan berjalan
    var now = new Date();
    var bulanIni = recs.filter(function (r) {
      var d = parseDate(r.tanggal);
      return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    var avg = bulanIni.length ? bulanIni.reduce(function (a, r) { return a + r.persen; }, 0) / bulanIni.length : 0;
    var toko = {};
    bulanIni.forEach(function (r) { toko[r.toko] = 1; });

    $('#home-hero').innerHTML =
      '<div class="cap">Rata-rata ' + esc(BULAN[now.getMonth()]) + ' ' + now.getFullYear() + '</div>' +
      (bulanIni.length
        ? '<div class="big">' + pct(avg) + '</div><div class="sub">' + esc(D.kategori(avg).nama) + '</div>'
        : '<div class="big empty-val">Belum ada data</div><div class="sub">Mulai penilaian pertama bulan ini</div>') +
      '<div class="row-foot">' +
        '<div><div class="k">Penilaian</div><div class="v">' + bulanIni.length + '</div></div>' +
        '<div><div class="k">Toko</div><div class="v">' + Object.keys(toko).length + '</div></div>' +
        '<div><div class="k">Belum sinkron</div><div class="v">' + Store.pendingRecords().length + '</div></div>' +
      '</div>';

    // Banner draft tertunda
    var draft = Store.draft();
    var banner = $('#home-draft');
    if (draft && draft.jenis && countAnswered(draft) > 0) {
      var jn = D.JENIS[draft.jenis];
      banner.hidden = false;
      banner.innerHTML =
        ico('edit') +
        '<div class="grow"><b>Ada penilaian yang belum selesai</b><br>' +
        esc(jn ? jn.label : draft.jenis) + (draft.toko ? ' · ' + esc(draft.toko) : '') +
        ' · ' + countAnswered(draft) + ' item terisi</div>';
      banner.onclick = function () { resumeDraft(); };
      banner.style.cursor = 'pointer';
    } else {
      banner.hidden = true;
    }

    // Aksi cepat
    $('#home-actions').innerHTML = Object.keys(D.JENIS).map(function (k) {
      var j = D.JENIS[k];
      var iconName = k === '7langkah' ? 'target' : k === 'doublecheck' ? 'checkCircle' : 'broom';
      var desc = k === '7langkah' ? 'Evaluasi alur pelayanan kasir'
        : k === 'doublecheck' ? 'Pengecekan pesanan sebelum diserahkan'
        : 'Audit kebersihan 5 area outlet';
      return '<button class="pick" data-start="' + k + '">' +
        '<span class="pick-icon">' + ico(iconName) + '</span>' +
        '<span class="pick-body"><span class="pick-title">' + esc(j.label) + '</span>' +
        '<span class="pick-desc">' + esc(desc) + '</span></span>' +
        '<span class="pick-chevron">' + ico('right') + '</span></button>';
    }).join('');
    $$('#home-actions [data-start]').forEach(function (b) {
      b.onclick = function () { startPenilaian(b.getAttribute('data-start')); };
    });

    // Penilaian terakhir
    var recent = recs.slice(0, 3);
    var host = $('#home-recent');
    if (!recent.length) {
      host.innerHTML = '<div class="card card-pad center muted tiny">Belum ada penilaian tersimpan.</div>';
    } else {
      host.innerHTML = recent.map(histRowHTML).join('');
      $$('#home-recent [data-rec]').forEach(function (b) {
        b.onclick = function () { openRecord(b.getAttribute('data-rec')); };
      });
    }
    $('#home-recent-more').hidden = recs.length <= 3;
    renderSyncPill();
  }

  function countAnswered(draft) {
    return Object.keys(draft.answers || {}).filter(function (k) {
      return draft.answers[k] !== undefined && draft.answers[k] !== null && draft.answers[k] !== '';
    }).length;
  }

  function histRowHTML(r) {
    var tone = C.toneOf(r.persen);
    var syncCls = r.sync === 'ok' ? 'ok' : r.sync === 'error' ? 'err' : 'pending';
    var syncTxt = r.sync === 'ok' ? 'Tersimpan' : r.sync === 'sent' ? 'Terkirim' : r.sync === 'error' ? 'Gagal' : 'Menunggu';
    return '<button class="hist" data-rec="' + esc(r.id) + '">' +
      '<span class="hist-score" style="background:' + softOf(tone) + ';color:' + C.toneColor(tone) + '">' + pct(r.persen, 0) + '</span>' +
      '<span class="hist-body">' +
        '<span class="hist-title">' + esc(r.toko) + ' · ' + esc(D.JENIS[r.jenis] ? D.JENIS[r.jenis].short : r.jenis) + '</span>' +
        '<span class="hist-meta">' + esc(fmtTanggalPendek(r.tanggal)) + ' ' + esc(r.jam) +
          '<span class="sep"></span>' + esc(r.petugas || '-') +
          '<span class="sep"></span><span class="sync-pill ' + syncCls + '">' + syncTxt + '</span>' +
        '</span>' +
      '</span>' +
      '<span class="pick-chevron">' + ico('right') + '</span>' +
      '</button>';
  }

  function softOf(tone) {
    return tone === 'good' ? 'var(--good-soft)' : tone === 'warn' ? 'var(--warn-soft)' : 'var(--bad-soft)';
  }

  function renderSyncPill() {
    var st = Sync.status();
    $$('.js-sync-pill').forEach(function (el) {
      var cls = 'sync-pill', txt, icon;
      if (st.busy) { cls += ' busy'; txt = 'Menyinkron'; icon = 'refresh'; }
      else if (!st.configured) { cls += ' err'; txt = 'Belum diatur'; icon = 'cloudOff'; }
      else if (!st.online) { cls += ' pending'; txt = 'Offline'; icon = 'cloudOff'; }
      else if (st.pending > 0) { cls += ' pending'; txt = st.pending + ' menunggu'; icon = 'cloud'; }
      else { cls += ' ok'; txt = 'Tersinkron'; icon = 'cloud'; }
      el.className = cls + ' js-sync-pill';
      el.innerHTML = ico(icon) + '<span>' + txt + '</span>';
    });
  }

  /* =========================================================================
     5. WIZARD — pilih jenis
     ========================================================================= */
  function startPenilaian(jenis) {
    var existing = Store.draft();
    if (existing && existing.jenis && countAnswered(existing) > 0 && existing.jenis !== jenis) {
      confirmDialog({
        title: 'Ganti jenis penilaian?',
        text: 'Masih ada penilaian ' + (D.JENIS[existing.jenis] ? D.JENIS[existing.jenis].label : existing.jenis) +
              ' yang belum selesai (' + countAnswered(existing) + ' item terisi). Melanjutkan akan membuangnya.',
        okText: 'Buang & mulai baru',
        cancelText: 'Lanjutkan yang lama',
        danger: true
      }).then(function (yes) {
        if (yes) { discardDraft(); beginDraft(jenis); }
        else resumeDraft();
      });
      return;
    }
    if (existing && existing.jenis === jenis && countAnswered(existing) > 0) { resumeDraft(); return; }
    beginDraft(jenis);
  }

  function beginDraft(jenis) {
    app.draft = newDraft(jenis);
    Store.saveDraft(app.draft);
    openWizard(jenis === 'kebersihan' ? 'area' : 'form');
    pushRoute({ wizard: 1 });
  }

  function resumeDraft() {
    var d = Store.draft();
    if (!d) { openWizard('jenis'); return; }
    app.draft = d;
    var step = 'form';
    if (d.jenis === 'kebersihan' && (!d.areas || !d.areas.length)) step = 'area';
    else if (d.toko && d.petugas && countAnswered(d) > 0) step = 'isi';
    openWizard(step);
    pushRoute({ wizard: 1 });
    toast('Melanjutkan penilaian tersimpan');
  }

  function discardDraft() {
    if (app.draft) Store.Photos.dropByRecord(app.draft.id);
    Store.clearDraft();
    app.draft = null;
  }

  function renderStepJenis() {
    var host = $('#jenis-list');
    host.innerHTML = Object.keys(D.JENIS).map(function (k) {
      var j = D.JENIS[k];
      var iconName = k === '7langkah' ? 'target' : k === 'doublecheck' ? 'checkCircle' : 'broom';
      var n = k === 'kebersihan' ? '76 item · 5 area'
        : k === '7langkah' ? '20 item · 7 tahap' : '15 item · 4 tahap';
      return '<button class="pick" data-jenis="' + k + '">' +
        '<span class="pick-icon">' + ico(iconName) + '</span>' +
        '<span class="pick-body"><span class="pick-title">' + esc(j.label) + '</span>' +
        '<span class="pick-desc">' + n + '</span></span>' +
        '<span class="pick-chevron">' + ico('right') + '</span></button>';
    }).join('');
    $$('#jenis-list [data-jenis]').forEach(function (b) {
      b.onclick = function () { startPenilaian(b.getAttribute('data-jenis')); };
    });
  }

  /* ---------- pilih area kebersihan ---------- */
  function renderStepArea() {
    var d = app.draft;
    var host = $('#area-list');
    var all = D.AREAS.every(function (a) { return d.areas.indexOf(a) >= 0; });
    var rows = [{ key: '__all', label: 'Semua Area', desc: '76 item penilaian', on: all }].concat(
      D.AREAS.map(function (a) {
        return { key: a, label: D.KEBERSIHAN[a].label, desc: D.KEBERSIHAN[a].items.length + ' item penilaian', on: d.areas.indexOf(a) >= 0 };
      })
    );
    host.innerHTML = rows.map(function (r) {
      return '<button class="pick' + (r.on ? ' selected' : '') + '" data-area="' + r.key + '">' +
        '<span class="pick-body"><span class="pick-title">' + esc(r.label) + '</span>' +
        '<span class="pick-desc">' + esc(r.desc) + '</span></span>' +
        '<span class="pick-check">' + ico('check') + '</span></button>';
    }).join('');
    $$('#area-list [data-area]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-area');
        if (k === '__all') {
          d.areas = D.AREAS.every(function (a) { return d.areas.indexOf(a) >= 0; }) ? [] : D.AREAS.slice();
        } else {
          var i = d.areas.indexOf(k);
          if (i >= 0) d.areas.splice(i, 1); else d.areas.push(k);
        }
        d.areas.sort(function (a, b2) { return D.AREAS.indexOf(a) - D.AREAS.indexOf(b2); });
        saveDraftSoon();
        renderStepArea();
      };
    });
    var n = d.areas.reduce(function (s, a) { return s + D.KEBERSIHAN[a].items.length; }, 0);
    $('#area-summary').textContent = d.areas.length
      ? d.areas.length + ' area dipilih · ' + n + ' item'
      : 'Pilih minimal satu area';
    $('#area-next').disabled = d.areas.length === 0;
  }

  /* ---------- form identitas ---------- */
  function renderStepForm() {
    var d = app.draft;
    var j = D.JENIS[d.jenis];
    $('#form-jenis-label').textContent = j.label;
    $('#form-area-label').textContent = d.jenis === 'kebersihan'
      ? d.areas.map(function (a) { return D.KEBERSIHAN[a].label; }).join(', ')
      : '';
    $('#form-area-row').hidden = d.jenis !== 'kebersihan';
    $('#petugas-label').textContent = j.petugas;
    $('#petugas-input').placeholder = 'Masukkan ' + j.petugas.toLowerCase();
    $('#toko-input').value = d.toko || '';
    $('#petugas-input').value = d.petugas || '';
    $('#tanggal-input').value = d.tanggal || todayISO();
    $('#jam-input').value = d.jam || nowHM();
    $('#catatan-input').value = d.catatan || '';
    clearInvalid();
  }

  function clearInvalid() {
    $$('#step-form .input').forEach(function (i) { i.classList.remove('invalid'); });
    $$('#step-form .field-error').forEach(function (e) { e.remove(); });
  }

  function markInvalid(el, msg) {
    el.classList.add('invalid');
    var e = document.createElement('div');
    e.className = 'field-error';
    e.textContent = msg;
    el.parentNode.appendChild(e);
  }

  function submitForm() {
    var d = app.draft;
    clearInvalid();
    var toko = $('#toko-input').value.trim();
    var petugas = $('#petugas-input').value.trim();
    var tanggal = $('#tanggal-input').value;
    var jam = $('#jam-input').value;
    var bad = null;

    if (!toko || D.TOKO.indexOf(toko) < 0) { markInvalid($('#toko-input'), 'Pilih nama toko dari daftar'); bad = bad || $('#toko-input'); }
    if (!petugas) { markInvalid($('#petugas-input'), 'Wajib diisi'); bad = bad || $('#petugas-input'); }
    if (!tanggal) { markInvalid($('#tanggal-input'), 'Wajib diisi'); bad = bad || $('#tanggal-input'); }
    if (!jam) { markInvalid($('#jam-input'), 'Wajib diisi'); bad = bad || $('#jam-input'); }
    if (bad) { bad.focus(); toast('Lengkapi data terlebih dahulu', 'err'); return; }

    d.toko = toko; d.petugas = petugas; d.tanggal = tanggal; d.jam = jam;
    d.catatan = $('#catatan-input').value.trim();
    Store.saveDraft(d);
    if (Store.settings().petugas !== petugas) Store.saveSettings({ petugas: petugas });
    gotoStep('isi');
  }

  /* ---------- combobox toko ---------- */
  var comboCursor = -1;
  function comboRender(filter) {
    var list = $('#toko-list');
    var q = (filter || '').toLowerCase().trim();
    var items = D.TOKO.filter(function (t) { return t.toLowerCase().indexOf(q) >= 0; });
    if (!items.length) { list.innerHTML = '<div class="combo-empty">Toko tidak ditemukan</div>'; return; }
    var cur = $('#toko-input').value.trim();
    list.innerHTML = items.slice(0, 120).map(function (t, i) {
      return '<div class="combo-item' + (t === cur ? ' selected' : '') + '" role="option" data-i="' + i + '" data-val="' + esc(t) + '">' + esc(t) + '</div>';
    }).join('');
    comboCursor = -1;
    $$('#toko-list .combo-item').forEach(function (el) {
      el.onmousedown = function (e) { e.preventDefault(); };
      el.onclick = function () { pickToko(el.getAttribute('data-val')); };
    });
  }
  function comboOpen() { $('#toko-combo').classList.add('open'); comboRender($('#toko-input').value); }
  function comboClose() { $('#toko-combo').classList.remove('open'); }
  function pickToko(v) {
    $('#toko-input').value = v;
    if (app.draft) { app.draft.toko = v; saveDraftSoon(); }
    comboClose();
    $('#toko-input').classList.remove('invalid');
  }

  /* =========================================================================
     6. WIZARD — pengisian
     ========================================================================= */
  function isiGroups() {
    var d = app.draft;
    if (d.jenis === 'kebersihan') {
      return d.areas.map(function (a) {
        return {
          key: a,
          label: D.KEBERSIHAN[a].label,
          items: D.KEBERSIHAN[a].items.map(function (it, i) {
            return { key: a + ':' + i, name: it.name, bobot: it.bobot };
          })
        };
      });
    }
    var secs = D.sectionsFor(d.jenis);
    var n = 0;
    return secs.map(function (sec) {
      return {
        key: sec.section,
        label: sec.section,
        items: sec.items.map(function (it) {
          return { key: 's' + (n++), name: it.name, bobot: it.bobot };
        })
      };
    });
  }

  function renderStepIsi() {
    var d = app.draft;
    var j = D.JENIS[d.jenis];
    var groups = isiGroups();
    var showWeight = Store.settings().showWeight;
    $('#isi-title').textContent = j.label;
    $('#isi-sub').textContent = d.toko + ' · ' + fmtTanggalPendek(d.tanggal);

    var html = groups.map(function (g) {
      var items = g.items.map(function (it, i) {
        var ans = d.answers[it.key];
        var answered = ans !== undefined && ans !== null && ans !== '';
        var control = j.mode === 'skala' ? scaleHTML(it.key, ans) : yesnoHTML(it.key, ans);
        var extra = j.mode === 'checklist' ? photoExtraHTML(it.key, d) : noteOnlyHTML(it.key, d);
        return '<div class="q' + (answered ? ' answered' : '') + '" id="q_' + cssId(it.key) + '">' +
          '<div class="q-label">' +
            (showWeight ? '<span class="q-weight">' + fmtBobot(it.bobot) + '</span>' : '') +
            '<span class="idx">' + (i + 1) + '.</span>' + esc(it.name) +
          '</div>' + control + extra + '</div>';
      }).join('');
      return '<div class="group" data-group="' + esc(g.key) + '">' +
        '<div class="group-head"><span class="group-title">' + esc(g.label) + '</span>' +
        '<span class="group-count" data-count="' + esc(g.key) + '"></span></div>' + items + '</div>';
    }).join('');

    $('#isi-content').innerHTML = html;
    bindIsi();
    updateIsiProgress();
  }

  function cssId(key) { return key.replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function fmtBobot(b) { return (Math.round(b * 10) / 10) + ''; }

  function scaleHTML(key, val) {
    var btns = [1, 2, 3, 4, 5].map(function (v) {
      return '<button type="button" class="' + (Number(val) === v ? 'on' : '') + '" data-score="' + esc(key) + '" data-val="' + v + '">' + v + '</button>';
    }).join('');
    return '<div class="scale">' + btns + '</div>' +
      '<div class="scale-legend"><span>Sangat kurang</span><span>Sangat baik</span></div>';
  }

  function yesnoHTML(key, val) {
    return '<div class="yesno">' +
      '<button type="button" class="yes' + (val === 'yes' ? ' on' : '') + '" data-check="' + esc(key) + '" data-val="yes">' + ico('check') + 'Ya</button>' +
      '<button type="button" class="no' + (val === 'no' ? ' on' : '') + '" data-check="' + esc(key) + '" data-val="no">' + ico('x') + 'Tidak</button>' +
      '</div>';
  }

  function noteOnlyHTML(key, d) {
    return '<div class="q-extra">' +
      '<textarea class="input" rows="1" placeholder="Keterangan (opsional)" data-note="' + esc(key) + '">' + esc(d.notes[key] || '') + '</textarea>' +
      '</div>';
  }

  function photoExtraHTML(key, d) {
    return '<div class="q-extra">' +
      '<div class="photo-slot" data-slot="' + esc(key) + '">' + photoSlotHTML(key, d) + '</div>' +
      '<textarea class="input" rows="1" placeholder="Keterangan (opsional)" data-note="' + esc(key) + '">' + esc(d.notes[key] || '') + '</textarea>' +
      '<input type="file" accept="image/*" class="sr-only" data-file="' + esc(key) + '" id="file_' + cssId(key) + '">' +
      '</div>';
  }

  function photoSlotHTML(key, d) {
    if (d.photos[key]) {
      return '<div class="photo-thumb"><img data-view="' + esc(key) + '" alt="Foto bukti"><button type="button" class="photo-x" data-delphoto="' + esc(key) + '" aria-label="Hapus foto">&times;</button></div>';
    }
    return '<button type="button" class="photo-btn" data-addphoto="' + esc(key) + '" aria-label="Tambah foto">' + ico('camera') + '</button>';
  }

  function bindIsi() {
    var d = app.draft;

    $$('#isi-content [data-score]').forEach(function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-score'), v = Number(b.getAttribute('data-val'));
        if (Number(d.answers[key]) === v) delete d.answers[key];
        else d.answers[key] = v;
        $$('#isi-content [data-score="' + cssEsc(key) + '"]').forEach(function (x) {
          x.classList.toggle('on', Number(x.getAttribute('data-val')) === d.answers[key]);
        });
        markAnswered(key);
        saveDraftSoon();
        updateIsiProgress();
      };
    });

    $$('#isi-content [data-check]').forEach(function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-check'), v = b.getAttribute('data-val');
        if (d.answers[key] === v) delete d.answers[key];
        else d.answers[key] = v;
        $$('#isi-content [data-check="' + cssEsc(key) + '"]').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-val') === d.answers[key]);
        });
        markAnswered(key);
        saveDraftSoon();
        updateIsiProgress();
      };
    });

    $$('#isi-content [data-note]').forEach(function (t) {
      t.oninput = function () {
        var key = t.getAttribute('data-note');
        if (t.value.trim()) d.notes[key] = t.value; else delete d.notes[key];
        autoGrow(t);
        saveDraftSoon();
      };
      autoGrow(t);
    });

    $$('#isi-content [data-addphoto]').forEach(function (b) {
      b.onclick = function () { choosePhoto(b.getAttribute('data-addphoto')); };
    });
    $$('#isi-content [data-delphoto]').forEach(function (b) {
      b.onclick = function () { removePhoto(b.getAttribute('data-delphoto')); };
    });
    $$('#isi-content [data-file]').forEach(function (inp) {
      inp.onchange = function (e) { handlePhotoFile(e, inp.getAttribute('data-file')); };
    });

    // Muat thumbnail dari IndexedDB
    var keys = Object.keys(d.photos || {});
    if (keys.length) {
      Store.Photos.getMany(keys.map(function (k) { return d.photos[k]; })).then(function (map) {
        keys.forEach(function (k) {
          var img = $('#isi-content [data-view="' + cssEsc(k) + '"]');
          if (img && map[d.photos[k]]) img.src = map[d.photos[k]];
        });
      });
    }
    $$('#isi-content [data-view]').forEach(function (img) {
      img.onclick = function () { if (img.src) lightbox(img.src); };
    });
  }

  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }

  function autoGrow(t) {
    t.style.height = 'auto';
    t.style.height = Math.min(140, Math.max(44, t.scrollHeight)) + 'px';
  }

  function markAnswered(key) {
    var q = document.getElementById('q_' + cssId(key));
    if (!q) return;
    var d = app.draft;
    var has = d.answers[key] !== undefined && d.answers[key] !== null && d.answers[key] !== '';
    q.classList.toggle('answered', has);
    q.classList.remove('missing');
  }

  function updateIsiProgress() {
    var d = app.draft;
    var groups = isiGroups();
    var total = 0, done = 0;
    groups.forEach(function (g) {
      var gd = 0;
      g.items.forEach(function (it) {
        total++;
        if (d.answers[it.key] !== undefined && d.answers[it.key] !== null && d.answers[it.key] !== '') { done++; gd++; }
      });
      var el = $('#isi-content [data-count="' + cssEsc(g.key) + '"]');
      if (el) el.textContent = gd + '/' + g.items.length;
    });
    $('#isi-progress').style.width = (total ? (done / total * 100) : 0) + '%';
    $('#isi-count').textContent = done + ' / ' + total + ' terisi';
    $('#isi-next').textContent = done < total ? 'Lihat hasil (' + done + '/' + total + ')' : 'Lihat hasil';
  }

  /* ---------- foto ---------- */
  var pendingPhotoKey = null;

  function choosePhoto(key) {
    pendingPhotoKey = key;
    openSheet('Tambah foto bukti', 'Foto disimpan di perangkat ini saja — yang dikirim ke spreadsheet hanya teks.', [
      { label: 'Ambil dari kamera', icon: 'camera', action: function () { triggerFile(key, true); } },
      { label: 'Pilih dari galeri', icon: 'image', action: function () { triggerFile(key, false); } }
    ]);
  }

  function triggerFile(key, useCamera) {
    var inp = document.getElementById('file_' + cssId(key));
    if (!inp) return;
    if (useCamera) inp.setAttribute('capture', 'environment'); else inp.removeAttribute('capture');
    inp.click();
  }

  function handlePhotoFile(e, key) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('File harus berupa gambar', 'err'); return; }
    busy(true, 'Memproses foto...');
    compressImage(file, 1280, 0.72).then(function (dataUrl) {
      var d = app.draft;
      var pk = d.id + ':' + key;
      return Store.Photos.put(pk, d.id, dataUrl).then(function () {
        d.photos[key] = pk;
        Store.saveDraft(d);
        var slot = $('#isi-content [data-slot="' + cssEsc(key) + '"]');
        if (slot) {
          slot.innerHTML = photoSlotHTML(key, d);
          var img = slot.querySelector('[data-view]');
          if (img) { img.src = dataUrl; img.onclick = function () { lightbox(dataUrl); }; }
          var del = slot.querySelector('[data-delphoto]');
          if (del) del.onclick = function () { removePhoto(key); };
        }
        busy(false);
        toast('Foto ditambahkan', 'ok');
      });
    }).catch(function (err) {
      console.error(err);
      busy(false);
      toast('Gagal memproses foto', 'err');
    });
  }

  function removePhoto(key) {
    var d = app.draft;
    var pk = d.photos[key];
    delete d.photos[key];
    Store.saveDraft(d);
    if (pk) Store.Photos.remove(pk);
    var slot = $('#isi-content [data-slot="' + cssEsc(key) + '"]');
    if (slot) {
      slot.innerHTML = photoSlotHTML(key, d);
      var add = slot.querySelector('[data-addphoto]');
      if (add) add.onclick = function () { choosePhoto(key); };
    }
  }

  function compressImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w >= h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
          else if (h > w && h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
          var cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------- selesai mengisi ---------- */
  function finishIsi() {
    var d = app.draft;
    var j = D.JENIS[d.jenis];
    var groups = isiGroups();
    var missing = [];
    groups.forEach(function (g) {
      g.items.forEach(function (it) {
        var v = d.answers[it.key];
        if (v === undefined || v === null || v === '') missing.push(it.key);
      });
    });

    if (j.mode === 'checklist' && missing.length) {
      missing.forEach(function (k) {
        var q = document.getElementById('q_' + cssId(k));
        if (q) q.classList.add('missing');
      });
      var first = document.getElementById('q_' + cssId(missing[0]));
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast(missing.length + ' item kebersihan belum diisi', 'err');
      return;
    }

    if (missing.length) {
      confirmDialog({
        title: 'Masih ada ' + missing.length + ' item kosong',
        text: 'Item yang tidak diisi dihitung 0 dan akan menurunkan skor akhir. Lanjutkan?',
        okText: 'Ya, hitung sekarang',
        cancelText: 'Isi dulu'
      }).then(function (yes) {
        if (yes) computeAndShow();
        else {
          var first = document.getElementById('q_' + cssId(missing[0]));
          if (first) { first.classList.add('missing'); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
      });
      return;
    }
    computeAndShow();
  }

  /* =========================================================================
     7. PERHITUNGAN & HASIL
     ========================================================================= */
  function buildRecord(d) {
    var j = D.JENIS[d.jenis];
    var groups = isiGroups();
    var totalSkor = 0, totalMaks = 0, gagal = 0, jumlahItem = 0, fotoCount = 0;
    var outGroups = [];
    var detail = [];

    groups.forEach(function (g) {
      var gSkor = 0, gMaks = 0;
      var items = g.items.map(function (it) {
        var raw = d.answers[it.key];
        var nilai, status, ok;
        if (j.mode === 'skala') {
          var sk = Number(raw) || 0;
          nilai = (sk / 5) * it.bobot;
          status = sk + '/5';
          ok = sk >= 4;
          if (sk < 4) gagal++;
        } else {
          ok = raw === 'yes';
          nilai = ok ? it.bobot : 0;
          status = ok ? 'Ya' : 'Tidak';
          if (!ok) gagal++;
        }
        gSkor += nilai; gMaks += it.bobot; jumlahItem++;
        var photoKey = d.photos[it.key] || null;
        if (photoKey) fotoCount++;
        var row = {
          key: it.key,
          name: it.name,
          bobot: it.bobot,
          nilai: nilai,
          raw: raw === undefined ? null : raw,
          status: status,
          ok: ok,
          ket: d.notes[it.key] || '',
          photoKey: photoKey
        };
        detail.push({
          grup: g.label,
          item: it.name,
          nilai: nilai,
          maks: it.bobot,
          status: status,
          keterangan: row.ket,
          foto: !!photoKey
        });
        return row;
      });
      totalSkor += gSkor; totalMaks += gMaks;
      outGroups.push({
        key: g.key,
        label: g.label,
        skor: gSkor,
        maks: gMaks,
        persen: gMaks ? (gSkor / gMaks) * 100 : 0,
        items: items
      });
    });

    /* Skala: bobot sudah berjumlah 100, jadi skor = persen.
       Checklist multi-area: tiap area juga 100, jadi rata-rata tertimbang sama. */
    var persen = totalMaks ? (totalSkor / totalMaks) * 100 : 0;
    var kat = D.kategori(persen);

    return {
      id: d.id,
      createdAt: Date.now(),
      jenis: d.jenis,
      jenisLabel: j.label,
      mode: j.mode,
      toko: d.toko,
      petugas: d.petugas,
      tanggal: d.tanggal,
      jam: d.jam,
      catatan: d.catatan || '',
      areas: d.jenis === 'kebersihan' ? d.areas.slice() : [],
      areaLabels: d.jenis === 'kebersihan' ? d.areas.map(function (a) { return D.KEBERSIHAN[a].label; }) : [],
      skor: totalSkor,
      maks: totalMaks,
      persen: persen,
      kategori: kat.nama,
      tone: kat.tone,
      jumlahItem: jumlahItem,
      itemGagal: gagal,
      fotoCount: fotoCount,
      groups: outGroups,
      detail: detail,
      sync: 'pending',
      syncedAt: 0,
      syncError: null,
      device: navigator.userAgent.indexOf('Android') >= 0 ? 'Android'
        : /iPhone|iPad/.test(navigator.userAgent) ? 'iOS' : 'Desktop'
    };
  }

  function computeAndShow() {
    var rec = buildRecord(app.draft);
    var res = Store.saveRecord(rec);
    if (res.trimmed) toast('Penyimpanan penuh — riwayat lama dipangkas');
    Store.clearDraft();
    app.draft = null;
    app.viewing = rec;
    renderResult(rec, { fresh: true });
    gotoStep('hasil');

    if (Store.settings().autoSync && navigator.onLine && Sync.configured()) {
      Sync.pushRecord(rec).then(function () {
        toast('Tersimpan ke spreadsheet', 'ok');
        renderSyncPill();
        renderResultSyncRow(Store.getRecord(rec.id));
      }).catch(function (err) {
        toast('Belum terkirim: ' + err.message + ' — masuk antrean', 'err');
        renderSyncPill();
        renderResultSyncRow(Store.getRecord(rec.id));
      });
    }
  }

  function openRecord(id) {
    var rec = Store.getRecord(id);
    if (!rec) { toast('Data tidak ditemukan', 'err'); return; }
    app.viewing = rec;
    renderResult(rec, { fresh: false });
    openWizard('hasil');
    pushRoute({ record: id });
  }

  function renderResult(rec, opts) {
    var tone = rec.tone || C.toneOf(rec.persen);
    var hero = $('#result-hero');
    hero.className = 'result-hero is-' + tone;
    hero.innerHTML =
      '<div class="n">' + pct(rec.persen) + '</div>' +
      '<div class="cat">' + ico(tone === 'good' ? 'checkCircle' : tone === 'warn' ? 'alert' : 'xCircle') + esc(rec.kategori) + '</div>' +
      '<div class="meta">' + esc(rec.jenisLabel) + (rec.areaLabels.length ? ' · ' + esc(rec.areaLabels.join(', ')) : '') + '</div>';

    var kv = '<dl class="kv">' +
      row('Nama Toko', rec.toko) +
      row(D.JENIS[rec.jenis].petugas, rec.petugas) +
      row('Hari/Tanggal', fmtTanggal(rec.tanggal)) +
      row('Jam', rec.jam) +
      (rec.areaLabels.length ? row('Area', rec.areaLabels.join(', ')) : '') +
      row('Total Skor', C.fmtPct(rec.skor) + ' / ' + C.fmtPct(rec.maks)) +
      row('Item Tidak Memenuhi', rec.itemGagal + ' dari ' + rec.jumlahItem) +
      (rec.catatan ? row('Catatan', rec.catatan) : '') +
      '</dl>';

    var groupsHTML = rec.groups.map(function (g) {
      var gTone = C.toneOf(g.persen);
      var items = g.items.map(function (it) {
        var mark = rec.mode === 'checklist'
          ? '<span class="mk" style="color:' + (it.ok ? 'var(--good)' : 'var(--bad)') + '">' + (it.ok ? '&#10003;' : '&#10007;') + '</span>'
          : '';
        var scoreTxt = rec.mode === 'skala'
          ? '[' + (it.raw || 0) + '/5]'
          : '[' + C.fmtPct(it.nilai, 0) + '/' + C.fmtPct(it.bobot, 0) + ']';
        return '<div class="res-item">' +
          '<div class="res-item-row">' +
            '<span class="res-item-name">' + mark + esc(it.name) + '</span>' +
            '<span class="res-item-score" style="color:' + (it.ok ? 'var(--ink)' : 'var(--bad)') + '">' + scoreTxt + '</span>' +
          '</div>' +
          (it.ket ? '<div class="res-item-note">' + esc(it.ket) + '</div>' : '') +
          (it.photoKey ? '<div class="res-photo" data-photo="' + esc(it.photoKey) + '"></div>' : '') +
          '</div>';
      }).join('');
      var headScore = rec.mode === 'skala'
        ? g.items.reduce(function (s, i) { return s + (Number(i.raw) || 0); }, 0) + '/' + (g.items.length * 5)
        : C.fmtPct(g.skor, 0) + '/' + C.fmtPct(g.maks, 0);
      return '<div class="res-group">' +
        '<div class="res-group-head"><span class="t">' + esc(g.label) + '</span>' +
        '<span class="s" style="color:' + C.toneColor(gTone) + '">' + headScore + ' · ' + pct(g.persen, 0) + '</span></div>' +
        '<div class="res-group-meter" style="padding-top:10px"><div class="meter"><div class="meter-fill" style="width:' + g.persen.toFixed(1) + '%;background:' + C.toneColor(gTone) + '"></div></div></div>' +
        '<div class="res-items">' + items + '</div>' +
        '</div>';
    }).join('');

    $('#result-body').innerHTML =
      '<div class="card card-pad">' + kv + '</div>' +
      '<div id="result-sync-row" style="margin-top:var(--sp-3)"></div>' +
      '<div class="section-head"><h3>Rincian penilaian</h3></div>' + groupsHTML +
      '<div class="spacer-lg"></div>';

    renderResultSyncRow(rec);

    // Muat foto bukti
    var slots = $$('#result-body [data-photo]');
    if (slots.length) {
      Store.Photos.getMany(slots.map(function (s) { return s.getAttribute('data-photo'); })).then(function (map) {
        slots.forEach(function (s) {
          var src = map[s.getAttribute('data-photo')];
          if (!src) { s.remove(); return; }
          var img = document.createElement('img');
          img.src = src; img.alt = 'Foto bukti';
          img.onclick = function () { lightbox(src); };
          s.appendChild(img);
        });
      });
    }

    $('#result-done').textContent = opts && opts.fresh ? 'Selesai' : 'Tutup';
  }

  function row(k, v) {
    return '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>';
  }

  function renderResultSyncRow(rec) {
    var host = $('#result-sync-row');
    if (!host || !rec) return;
    var conf = Sync.configured();
    if (!conf) {
      host.innerHTML = '<div class="banner warn">' + ico('cloudOff') +
        '<div class="grow"><b>Belum terhubung spreadsheet.</b> Atur URL Web App di Pengaturan agar hasil ikut tersimpan online.</div></div>';
      return;
    }
    if (rec.sync === 'ok') {
      host.innerHTML = '<div class="banner info">' + ico('checkCircle') + '<div class="grow">Tersimpan di spreadsheet.</div></div>';
    } else if (rec.sync === 'sent') {
      host.innerHTML = '<div class="banner info">' + ico('cloud') + '<div class="grow">Terkirim, menunggu verifikasi saat sinkron berikutnya.</div></div>';
    } else {
      host.innerHTML = '<div class="banner warn">' + ico('cloud') +
        '<div class="grow"><b>Menunggu sinkronisasi.</b> ' + (rec.syncError ? esc(rec.syncError) + '. ' : '') +
        'Akan dikirim otomatis saat online.</div>' +
        '<button class="btn btn-sm btn-soft" id="retry-sync">Kirim</button></div>';
      var b = $('#retry-sync');
      if (b) b.onclick = function () {
        busy(true, 'Mengirim...');
        Sync.pushRecord(rec).then(function () {
          busy(false); toast('Terkirim', 'ok');
          renderResultSyncRow(Store.getRecord(rec.id)); renderSyncPill();
        }).catch(function (e) {
          busy(false); toast(e.message, 'err');
          renderResultSyncRow(Store.getRecord(rec.id));
        });
      };
    }
  }

  /* ---------- teks polos untuk berbagi ---------- */
  function plainText(rec) {
    var L = [];
    L.push('PENILAIAN ' + rec.jenisLabel.toUpperCase());
    L.push('');
    L.push('Toko      : ' + rec.toko);
    L.push(D.JENIS[rec.jenis].petugas.replace('Nama ', '').padEnd(10, ' ').slice(0, 10) + ': ' + rec.petugas);
    L.push('Tanggal   : ' + fmtTanggal(rec.tanggal) + ' ' + rec.jam);
    if (rec.areaLabels.length) L.push('Area      : ' + rec.areaLabels.join(', '));
    rec.groups.forEach(function (g) {
      L.push('');
      var head = rec.mode === 'skala'
        ? g.items.reduce(function (s, i) { return s + (Number(i.raw) || 0); }, 0) + '/' + (g.items.length * 5)
        : C.fmtPct(g.skor, 0) + '/' + C.fmtPct(g.maks, 0);
      L.push(g.label + ' [' + head + ' - ' + pct(g.persen, 0) + ']');
      g.items.forEach(function (it) {
        var sc = rec.mode === 'skala' ? '[' + (it.raw || 0) + '/5]' : (it.ok ? '[Ya]' : '[Tidak]');
        L.push('- ' + it.name + ' ' + sc);
        if (it.ket) L.push('  "' + it.ket + '"');
      });
    });
    if (rec.catatan) { L.push(''); L.push('Catatan: ' + rec.catatan); }
    L.push('');
    L.push('TOTAL     : ' + C.fmtPct(rec.skor) + '/' + C.fmtPct(rec.maks));
    L.push('POIN      : ' + pct(rec.persen));
    L.push('KATEGORI  : ' + rec.kategori);
    return L.join('\n');
  }

  function shortText(rec) {
    return 'PENILAIAN ' + rec.jenisLabel.toUpperCase() + '\n' +
      rec.toko + ' · ' + fmtTanggal(rec.tanggal) + ' ' + rec.jam + '\n' +
      D.JENIS[rec.jenis].petugas + ': ' + rec.petugas + '\n' +
      (rec.areaLabels.length ? 'Area: ' + rec.areaLabels.join(', ') + '\n' : '') +
      '\nPOIN: ' + pct(rec.persen) + ' (' + rec.kategori + ')\n' +
      'Item tidak memenuhi: ' + rec.itemGagal + ' dari ' + rec.jumlahItem;
  }

  function openShare(rec) {
    openSheet('Bagikan hasil', null, [
      { label: 'WhatsApp', icon: 'share', desc: 'Kirim sebagai pesan teks', action: function () { shareVia('wa', rec); } },
      { label: 'Telegram', icon: 'share', desc: 'Kirim sebagai pesan teks', action: function () { shareVia('tg', rec); } },
      { label: 'Salin teks lengkap', icon: 'copy', action: function () { shareVia('copy', rec); } },
      { label: 'Bagikan lewat aplikasi lain', icon: 'share', hidden: !navigator.share, action: function () { shareVia('native', rec); } }
    ]);
  }

  /* URL punya batas panjang; rincian penuh dipotong jadi ringkasan + clipboard. */
  var URL_LIMIT = 1800;

  function shareVia(target, rec) {
    var full = plainText(rec);
    if (target === 'copy') {
      copyText(full).then(function () { toast('Teks lengkap disalin', 'ok'); });
      return;
    }
    if (target === 'native') {
      navigator.share({ title: rec.jenisLabel + ' — ' + rec.toko, text: full })
        .catch(function (e) { if (e.name !== 'AbortError') toast('Gagal membagikan', 'err'); });
      return;
    }
    var body = full;
    var truncated = false;
    if (encodeURIComponent(full).length > URL_LIMIT) {
      body = shortText(rec) + '\n\n(Rincian lengkap sudah disalin ke clipboard — tempel di pesan berikutnya.)';
      truncated = true;
    }
    var url = target === 'wa'
      ? 'https://wa.me/?text=' + encodeURIComponent(body)
      : 'https://t.me/share/url?url=%20&text=' + encodeURIComponent(body);
    var go = function () { window.open(url, '_blank', 'noopener'); };
    if (truncated) copyText(full).then(function () { toast('Rincian panjang — ringkasan dikirim, teks penuh disalin'); go(); });
    else go();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(fallbackCopy);
    }
    return fallbackCopy();
    function fallbackCopy() {
      return new Promise(function (resolve) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        resolve();
      });
    }
  }

  /* =========================================================================
     8. DASHBOARD
     ========================================================================= */
  /* Gabungkan riwayat lokal dengan rekap dari spreadsheet supaya dashboard
     tetap utuh walau penilaian dibuat di perangkat lain. Lokal menang. */
  function dashRows() {
    var byId = {};
    Store.remoteCache().rows.forEach(function (r) {
      if (!r || !r.id) return;
      byId[r.id] = {
        id: r.id,
        tanggal: r.tanggal,
        jam: r.jam || '',
        jenis: r.jenis,
        toko: r.toko,
        petugas: r.petugas,
        persen: Number(r.persen) || 0,
        itemGagal: Number(r.itemGagal) || 0,
        jumlahItem: Number(r.jumlahItem) || 0,
        areaLabels: r.area ? String(r.area).split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
        groups: null,
        source: 'sheet'
      };
    });
    Store.records().forEach(function (r) {
      byId[r.id] = {
        id: r.id, tanggal: r.tanggal, jam: r.jam, jenis: r.jenis, toko: r.toko,
        petugas: r.petugas, persen: r.persen, itemGagal: r.itemGagal, jumlahItem: r.jumlahItem,
        areaLabels: r.areaLabels || [], groups: r.groups || null, source: 'lokal'
      };
    });
    return Object.keys(byId).map(function (k) { return byId[k]; }).filter(function (r) {
      return r.tanggal && !isNaN(parseDate(r.tanggal));
    }).sort(function (a, b) {
      return parseDate(b.tanggal) - parseDate(a.tanggal) || String(b.jam).localeCompare(String(a.jam));
    });
  }

  function inWindow(row, days, offsetDays) {
    if (!days) return true;
    var d = parseDate(row.tanggal);
    var end = new Date(); end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - (offsetDays || 0));
    var start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return d >= start && d <= end;
  }

  function renderDash() {
    var all = dashRows();
    var f = app.filters;

    var scoped = all.filter(function (r) {
      if (f.jenis !== 'all' && r.jenis !== f.jenis) return false;
      if (f.toko && r.toko !== f.toko) return false;
      return true;
    });
    var cur = scoped.filter(function (r) { return inWindow(r, f.periode, 0); });
    var prev = f.periode ? scoped.filter(function (r) { return inWindow(r, f.periode, f.periode); }) : [];

    // Filter UI
    $$('#dash-periode button').forEach(function (b) {
      b.classList.toggle('active', String(f.periode) === b.getAttribute('data-p'));
    });
    $('#dash-jenis').innerHTML = [{ k: 'all', l: 'Semua' }]
      .concat(Object.keys(D.JENIS).map(function (k) { return { k: k, l: D.JENIS[k].short }; }))
      .map(function (o) {
        return '<button class="chip' + (f.jenis === o.k ? ' active' : '') + '" data-j="' + o.k + '">' + esc(o.l) + '</button>';
      }).join('');
    $$('#dash-jenis .chip').forEach(function (b) {
      b.onclick = function () { f.jenis = b.getAttribute('data-j'); renderDash(); };
    });
    $('#dash-toko-btn').innerHTML = ico('store') + '<span>' + esc(f.toko || 'Semua toko') + '</span>' + ico('down');

    if (!cur.length) {
      $('#dash-content').innerHTML = emptyHTML('chart', 'Belum ada data pada rentang ini',
        'Ubah filter periode, atau buat penilaian baru untuk mulai mengisi dashboard.');
      var b = $('#dash-content .btn');
      if (b) b.onclick = function () { openWizard('jenis'); };
      return;
    }

    var avg = mean(cur.map(function (r) { return r.persen; }));
    var avgPrev = prev.length ? mean(prev.map(function (r) { return r.persen; })) : null;
    var toko = uniq(cur.map(function (r) { return r.toko; }));
    var below = cur.filter(function (r) { return r.persen < 80; });
    var gagal = cur.reduce(function (s, r) { return s + (r.itemGagal || 0); }, 0);

    var trend = cur.slice(0, 12).reverse();
    var spark = trend.map(function (r) { return r.persen; });

    $('#dash-content').innerHTML = [
      // KPI
      '<div class="kpi-grid">',
        statTile('Rata-rata skor', pct(avg), deltaHTML(avg, avgPrev, f.periode),
          spark.length > 1 ? C.sparkline(spark, { color: C.toneColor(C.toneOf(avg)) }) : ''),
        statTile('Penilaian', String(cur.length),
          '<span class="muted">' + toko.length + ' toko dinilai</span>', ''),
        statTile('Di bawah standar', String(below.length),
          '<span class="muted">skor &lt; 80%</span>', ''),
        statTile('Item tidak memenuhi', String(gagal),
          '<span class="muted">akumulasi periode</span>', ''),
      '</div>',

      // Tren
      '<div class="section-head"><h3>Tren skor</h3><span class="tiny muted">' + trend.length + ' penilaian terakhir</span></div>',
      '<div class="chart-card">',
        '<div class="chart-wrap" id="chart-trend" style="padding-top:var(--sp-4)"></div>',
      '</div>',

      // Distribusi
      '<div class="section-head"><h3>Sebaran kategori</h3></div>',
      '<div class="chart-card" style="padding-top:var(--sp-4)"><div id="chart-dist"></div></div>',

      // Per jenis
      '<div class="section-head"><h3>Rata-rata per jenis penilaian</h3></div>',
      '<div class="card card-pad"><div id="chart-jenis"></div></div>',

      // Area kebersihan
      '<div id="area-block"></div>',

      // Peringkat toko
      '<div class="section-head"><h3>Peringkat toko</h3></div>',
      '<div class="card"><div class="card-pad" style="padding-bottom:var(--sp-2)">',
        '<div class="segmented" id="rank-mode">',
          '<button class="active" data-r="top">Tertinggi</button>',
          '<button data-r="bottom">Terendah</button>',
        '</div></div>',
        '<div class="card-pad" style="padding-top:0" id="chart-toko"></div>',
      '</div>',

      '<div class="spacer-lg"></div>'
    ].join('');

    // Tren
    C.columns($('#chart-trend'), trend.map(function (r) {
      return {
        label: fmtTanggalPendek(r.tanggal).replace(' ', ' '),
        value: r.persen,
        row: r
      };
    }), {
      byTone: true,
      aria: 'Tren skor penilaian',
      tip: function (d) {
        return '<b>' + esc(d.row.toko) + '</b><br>' + esc(fmtTanggalPendek(d.row.tanggal)) + ' · ' + pct(d.row.persen);
      }
    });

    // Sebaran kategori (status: selalu bersama label)
    var baik = cur.filter(function (r) { return r.persen >= 80; }).length;
    var cukup = cur.filter(function (r) { return r.persen >= 75 && r.persen < 80; }).length;
    var buruk = cur.filter(function (r) { return r.persen < 75; }).length;
    C.stackedShare($('#chart-dist'), [
      { label: 'Baik ke atas (≥80)', value: baik, color: 'var(--good)' },
      { label: 'Cukup (75–79)', value: cukup, color: 'var(--warn)' },
      { label: 'Buruk (<75)', value: buruk, color: 'var(--bad)' }
    ], { aria: 'Sebaran kategori penilaian' });

    // Per jenis
    C.rankedBars($('#chart-jenis'), Object.keys(D.JENIS).map(function (k) {
      var rows = cur.filter(function (r) { return r.jenis === k; });
      return {
        label: D.JENIS[k].label,
        value: rows.length ? mean(rows.map(function (r) { return r.persen; })) : 0,
        sub: rows.length ? rows.length + ' penilaian' : 'belum ada data'
      };
    }).filter(function (r) { return r.value > 0 || r.sub === 'belum ada data'; }));

    renderAreaBlock(cur);

    // Peringkat toko
    var byToko = groupBy(cur, function (r) { return r.toko; });
    var tokoRows = Object.keys(byToko).map(function (t) {
      return { label: t, value: mean(byToko[t].map(function (r) { return r.persen; })), sub: byToko[t].length + ' penilaian' };
    });
    function drawToko(mode) {
      var sorted = tokoRows.slice().sort(function (a, b) { return mode === 'top' ? b.value - a.value : a.value - b.value; });
      C.rankedBars($('#chart-toko'), sorted.slice(0, 5));
    }
    drawToko('top');
    $$('#rank-mode button').forEach(function (b) {
      b.onclick = function () {
        $$('#rank-mode button').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        drawToko(b.getAttribute('data-r'));
      };
    });
  }

  function renderAreaBlock(rows) {
    var host = $('#area-block');
    var withGroups = rows.filter(function (r) { return r.jenis === 'kebersihan' && r.groups; });
    if (!withGroups.length) { host.innerHTML = ''; return; }
    var acc = {};
    withGroups.forEach(function (r) {
      r.groups.forEach(function (g) {
        if (!acc[g.label]) acc[g.label] = [];
        acc[g.label].push(g.persen);
      });
    });
    var areaRows = Object.keys(acc).map(function (k) {
      return { label: k, value: mean(acc[k]), sub: acc[k].length + ' kali dinilai' };
    }).sort(function (a, b) { return a.value - b.value; });
    host.innerHTML =
      '<div class="section-head"><h3>Kebersihan per area</h3><span class="tiny muted">urut terlemah</span></div>' +
      '<div class="card card-pad"><div id="chart-area"></div>' +
      '<div class="tiny muted" style="margin-top:var(--sp-3)">Dihitung dari riwayat di perangkat ini.</div></div>';
    C.rankedBars($('#chart-area'), areaRows);
  }

  function statTile(label, value, foot, spark) {
    return '<div class="stat">' +
      '<div class="stat-label">' + esc(label) + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
      (foot ? '<div class="stat-foot">' + foot + '</div>' : '') +
      (spark ? '<div class="stat-spark">' + spark + '</div>' : '') +
      '</div>';
  }

  function deltaHTML(cur, prev, days) {
    if (prev === null || prev === undefined) return '<span class="muted">tidak ada pembanding</span>';
    var d = cur - prev;
    var cls = Math.abs(d) < 0.05 ? 'flat' : d > 0 ? 'up' : 'down';
    var icon = cls === 'flat' ? 'minus' : cls === 'up' ? 'up' : 'dn';
    return '<span class="delta ' + cls + '">' + ico(icon) + C.fmtPct(Math.abs(d)) + '</span>' +
      '<span class="muted">vs ' + days + " hari sebelumnya</span>";
  }

  function emptyHTML(icon, title, text) {
    return '<div class="empty"><div class="empty-icon">' + ico(icon) + '</div>' +
      '<h4>' + esc(title) + '</h4><p>' + esc(text) + '</p>' +
      '<button class="btn btn-primary">' + ico('plus') + 'Buat penilaian</button></div>';
  }

  function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function uniq(a) { return a.filter(function (v, i, arr) { return arr.indexOf(v) === i; }); }
  function groupBy(arr, fn) {
    var out = {};
    arr.forEach(function (x) { var k = fn(x); (out[k] = out[k] || []).push(x); });
    return out;
  }

  function openTokoFilter() {
    var rows = dashRows();
    var tokos = uniq(rows.map(function (r) { return r.toko; })).sort();
    openSheet('Filter toko', tokos.length + ' toko punya data',
      [{ label: 'Semua toko', icon: 'store', action: function () { app.filters.toko = ''; renderDash(); } }]
        .concat(tokos.map(function (t) {
          return { label: t, icon: 'store', action: function () { app.filters.toko = t; renderDash(); } };
        })));
  }

  /* =========================================================================
     9. RIWAYAT
     ========================================================================= */
  function renderHist() {
    var recs = Store.records();
    var f = app.histFilter;
    var q = f.q.toLowerCase().trim();

    var list = recs.filter(function (r) {
      if (f.mode === 'pending' && r.sync === 'ok') return false;
      if (f.mode !== 'all' && f.mode !== 'pending' && r.jenis !== f.mode) return false;
      if (!q) return true;
      return (r.toko + ' ' + r.petugas + ' ' + r.jenisLabel + ' ' + r.tanggal).toLowerCase().indexOf(q) >= 0;
    });

    var chips = [{ k: 'all', l: 'Semua' }, { k: 'pending', l: 'Belum sinkron' }]
      .concat(Object.keys(D.JENIS).map(function (k) { return { k: k, l: D.JENIS[k].short }; }));
    $('#hist-chips').innerHTML = chips.map(function (o) {
      var n = o.k === 'all' ? recs.length
        : o.k === 'pending' ? recs.filter(function (r) { return r.sync !== 'ok'; }).length
        : recs.filter(function (r) { return r.jenis === o.k; }).length;
      return '<button class="chip' + (f.mode === o.k ? ' active' : '') + '" data-h="' + o.k + '">' + esc(o.l) + ' (' + n + ')</button>';
    }).join('');
    $$('#hist-chips .chip').forEach(function (b) {
      b.onclick = function () { app.histFilter.mode = b.getAttribute('data-h'); renderHist(); };
    });

    var host = $('#hist-list');
    if (!recs.length) {
      host.innerHTML = emptyHTML('history', 'Riwayat masih kosong',
        'Setiap penilaian yang Anda selesaikan tersimpan di sini, walau sedang offline.');
      var b = $('#hist-list .btn');
      if (b) b.onclick = function () { openWizard('jenis'); };
      return;
    }
    if (!list.length) {
      host.innerHTML = '<div class="card card-pad center muted tiny">Tidak ada yang cocok dengan filter.</div>';
      return;
    }

    var byDate = groupBy(list, function (r) { return r.tanggal; });
    host.innerHTML = Object.keys(byDate).sort(function (a, b) { return parseDate(b) - parseDate(a); }).map(function (t) {
      return '<div class="section-head"><h3>' + esc(fmtTanggal(t)) + '</h3>' +
        '<span class="tiny muted">' + byDate[t].length + ' penilaian</span></div>' +
        '<div class="stack-sm">' + byDate[t].map(histRowHTML).join('') + '</div>';
    }).join('') + '<div class="spacer-lg"></div>';

    $$('#hist-list [data-rec]').forEach(function (b) {
      var id = b.getAttribute('data-rec');
      b.onclick = function () { openRecord(id); };
      var timer = null;
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); recordMenu(id); });
      b.addEventListener('touchstart', function () { timer = setTimeout(function () { recordMenu(id); }, 550); }, { passive: true });
      ['touchend', 'touchmove', 'touchcancel'].forEach(function (ev) {
        b.addEventListener(ev, function () { clearTimeout(timer); }, { passive: true });
      });
    });
  }

  function recordMenu(id) {
    var rec = Store.getRecord(id);
    if (!rec) return;
    openSheet(rec.toko + ' · ' + D.JENIS[rec.jenis].short, fmtTanggal(rec.tanggal) + ' ' + rec.jam, [
      { label: 'Buka hasil', icon: 'file', action: function () { openRecord(id); } },
      { label: 'Bagikan', icon: 'share', action: function () { openShare(rec); } },
      { label: 'Kirim ke spreadsheet', icon: 'cloud', hidden: rec.sync === 'ok', action: function () {
          busy(true, 'Mengirim...');
          Sync.pushRecord(rec).then(function () { busy(false); toast('Terkirim', 'ok'); renderHist(); renderSyncPill(); })
            .catch(function (e) { busy(false); toast(e.message, 'err'); renderHist(); });
        } },
      { label: 'Hapus dari perangkat', icon: 'trash', danger: true, desc: 'Baris di spreadsheet tetap ada', action: function () {
          confirmDialog({
            title: 'Hapus penilaian ini?',
            text: 'Data lokal dan foto buktinya dihapus permanen. Baris yang sudah masuk spreadsheet tidak ikut terhapus.',
            okText: 'Hapus', danger: true
          }).then(function (yes) {
            if (!yes) return;
            Store.deleteRecord(id);
            toast('Penilaian dihapus');
            renderHist(); renderHome(); renderSyncPill();
          });
        } }
    ]);
  }

  /* =========================================================================
     10. PENGATURAN
     ========================================================================= */
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/159eILHT2HGI7lL8le4Eo32lZxJBE0xHM7JZr2peFMpY/edit';

  function renderSettings() {
    var s = Store.settings();
    var st = Sync.status();
    $('#set-endpoint').value = s.endpoint || '';
    $('#set-petugas').value = s.petugas || '';
    $$('#set-theme button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-t') === s.theme);
    });
    $('#set-autosync').classList.toggle('on', !!s.autoSync);
    $('#set-autosync').setAttribute('aria-checked', s.autoSync ? 'true' : 'false');
    $('#set-weight').classList.toggle('on', !!s.showWeight);
    $('#set-weight').setAttribute('aria-checked', s.showWeight ? 'true' : 'false');

    var recs = Store.records();
    $('#set-stats').innerHTML =
      '<div class="row-between"><span class="muted tiny">Penilaian tersimpan</span><b class="tnum">' + recs.length + '</b></div>' +
      '<div class="row-between" style="margin-top:6px"><span class="muted tiny">Menunggu sinkron</span><b class="tnum">' + st.pending + '</b></div>' +
      '<div class="row-between" style="margin-top:6px"><span class="muted tiny">Sinkron terakhir</span><b>' + relTime(st.lastSyncAt) + '</b></div>' +
      '<div class="row-between" style="margin-top:6px"><span class="muted tiny">Rekap dari spreadsheet</span><b class="tnum">' + Store.remoteCache().rows.length + ' baris</b></div>';

    Store.Photos.estimate().then(function (e) {
      if (!e || !e.usage) return;
      var mb = (e.usage / 1048576).toFixed(1);
      var q = e.quota ? ' dari ' + (e.quota / 1048576).toFixed(0) + ' MB' : '';
      var el = $('#set-storage');
      if (el) el.textContent = 'Terpakai ' + mb + ' MB' + q + ' (termasuk foto bukti).';
    });
  }

  function testConnection() {
    var url = $('#set-endpoint').value.trim();
    Store.saveSettings({ endpoint: url });
    if (!Sync.configured()) { toast('URL harus berakhiran /exec dari Apps Script', 'err'); return; }
    busy(true, 'Menguji koneksi...');
    Sync.ping().then(function (res) {
      busy(false);
      if (res && res.ok) {
        toast('Terhubung: ' + (res.sheet || 'spreadsheet'), 'ok');
        $('#set-conn').innerHTML = '<div class="banner info">' + ico('checkCircle') +
          '<div class="grow">Terhubung ke <b>' + esc(res.sheet || 'spreadsheet') + '</b>' +
          (res.rows !== undefined ? ' · ' + res.rows + ' baris rekap' : '') + '</div></div>';
      } else {
        throw new Error((res && res.error) || 'Balasan tidak dikenali');
      }
    }).catch(function (err) {
      busy(false);
      toast('Gagal: ' + err.message, 'err');
      $('#set-conn').innerHTML = '<div class="banner bad">' + ico('alert') +
        '<div class="grow"><b>Tidak terhubung.</b> ' + esc(err.message) +
        '. Pastikan Web App di-deploy dengan akses <b>Anyone</b>.</div></div>';
    });
  }

  function doSync() {
    busy(true, 'Menyinkronkan...');
    Sync.syncAll({ pull: true }).then(function (r) {
      busy(false);
      renderSyncPill();
      renderSettings();
      if (r.skipped) return;
      if (r.ok) toast(r.sent ? r.sent + ' penilaian terkirim' : 'Semua sudah tersinkron', 'ok');
      else toast(r.error || 'Sebagian gagal terkirim', 'err');
      if (app.tab === 'dash') renderDash();
    });
  }

  function wipeLocal() {
    confirmDialog({
      title: 'Hapus semua data lokal?',
      text: 'Seluruh riwayat dan foto di perangkat ini dihapus. Baris yang sudah masuk spreadsheet tetap aman. Tindakan ini tidak bisa dibatalkan.',
      okText: 'Hapus semua', danger: true
    }).then(function (yes) {
      if (!yes) return;
      var pending = Store.pendingRecords().length;
      if (pending) {
        confirmDialog({
          title: 'Masih ada ' + pending + ' yang belum terkirim',
          text: 'Data itu belum ada di spreadsheet dan akan hilang selamanya. Tetap hapus?',
          okText: 'Tetap hapus', danger: true
        }).then(function (y2) { if (y2) reallyWipe(); });
        return;
      }
      reallyWipe();
    });
  }

  function reallyWipe() {
    Store.Photos.gc([]);
    try {
      localStorage.removeItem(Store.KEYS.records);
      localStorage.removeItem(Store.KEYS.draft);
      localStorage.removeItem(Store.KEYS.remote);
    } catch (e) {}
    app.draft = null;
    toast('Data lokal dihapus');
    renderSettings(); renderHome(); renderSyncPill();
  }

  /* =========================================================================
     11. TOMBOL KEMBALI WIZARD
     ========================================================================= */
  function wizardBack() {
    if (app.step === 'hasil') {
      closeWizard();
      showTab(app.viewing && app.tab === 'hist' ? 'hist' : 'home', { silent: true });
      renderHome(); renderHist();
      return;
    }
    if (app.step === 'isi') { gotoStep('form'); return; }
    if (app.step === 'form') {
      if (app.draft && app.draft.jenis === 'kebersihan') gotoStep('area');
      else exitWizardToHome();
      return;
    }
    if (app.step === 'area') { exitWizardToHome(); return; }
    exitWizardToHome();
  }

  function exitWizardToHome() {
    var d = app.draft;
    if (d && countAnswered(d) > 0) {
      Store.saveDraft(d);
      toast('Disimpan sebagai draft');
    } else if (d) {
      discardDraft();
    }
    closeWizard();
    showTab('home', { silent: true });
  }

  /* =========================================================================
     12. INIT
     ========================================================================= */
  function bindStatic() {
    // Tab bar
    TABS.forEach(function (t) {
      $('#tab-' + t).onclick = function () { showTab(t); };
    });
    $('#fab-new').onclick = function () { openWizard('jenis'); pushRoute({ wizard: 1 }); };
    $('#home-recent-more').onclick = function () { showTab('hist'); };

    // Wizard
    $$('.js-wiz-back').forEach(function (b) { b.onclick = wizardBack; });
    $('#area-next').onclick = function () {
      if (!app.draft.areas.length) return;
      Store.saveDraft(app.draft);
      gotoStep('form');
    };
    $('#form-next').onclick = submitForm;
    $('#form-reset').onclick = function () {
      $('#toko-input').value = ''; $('#petugas-input').value = '';
      $('#tanggal-input').value = todayISO(); $('#jam-input').value = nowHM();
      $('#catatan-input').value = '';
      clearInvalid();
      toast('Form dikosongkan');
    };
    $('#isi-next').onclick = finishIsi;
    $('#isi-reset').onclick = function () {
      confirmDialog({ title: 'Kosongkan semua jawaban?', text: 'Keterangan dan foto yang sudah diisi ikut terhapus.', okText: 'Kosongkan', danger: true })
        .then(function (yes) {
          if (!yes) return;
          var d = app.draft;
          Store.Photos.dropByRecord(d.id);
          d.answers = {}; d.notes = {}; d.photos = {};
          Store.saveDraft(d);
          renderStepIsi();
          toast('Semua jawaban dikosongkan');
        });
    };
    $('#result-done').onclick = function () {
      closeWizard();
      showTab('home', { silent: true });
      renderHome(); renderHist();
    };
    $('#result-share').onclick = function () { if (app.viewing) openShare(app.viewing); };
    $('#result-export').onclick = function () {
      if (!app.viewing) return;
      global.TKB_EXPORT.openMenu(app.viewing, { plainText: plainText, ico: ico, openSheet: openSheet, busy: busy, toast: toast });
    };

    // Combobox toko
    var tokoInput = $('#toko-input');
    tokoInput.oninput = function () { comboOpen(); comboRender(tokoInput.value); };
    tokoInput.onfocus = comboOpen;
    tokoInput.onkeydown = function (e) {
      var items = $$('#toko-list .combo-item');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        comboCursor += e.key === 'ArrowDown' ? 1 : -1;
        comboCursor = Math.max(0, Math.min(items.length - 1, comboCursor));
        items.forEach(function (el, i) { el.classList.toggle('cursor', i === comboCursor); });
        if (items[comboCursor]) items[comboCursor].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (comboCursor >= 0 && items[comboCursor]) { e.preventDefault(); pickToko(items[comboCursor].getAttribute('data-val')); }
      } else if (e.key === 'Escape') { comboClose(); }
    };
    document.addEventListener('click', function (e) {
      if (!$('#toko-combo').contains(e.target)) comboClose();
    });

    ['petugas-input', 'tanggal-input', 'jam-input', 'catatan-input'].forEach(function (id) {
      $('#' + id).oninput = function () {
        if (!app.draft) return;
        var map = { 'petugas-input': 'petugas', 'tanggal-input': 'tanggal', 'jam-input': 'jam', 'catatan-input': 'catatan' };
        app.draft[map[id]] = $('#' + id).value;
        saveDraftSoon();
      };
    });

    // Dashboard
    $$('#dash-periode button').forEach(function (b) {
      b.onclick = function () {
        app.filters.periode = Number(b.getAttribute('data-p'));
        renderDash();
      };
    });
    $('#dash-toko-btn').onclick = openTokoFilter;
    $('#dash-refresh').onclick = doSync;

    // Riwayat
    $('#hist-search').oninput = debounce(function () {
      app.histFilter.q = $('#hist-search').value;
      renderHist();
    }, 200);

    // Pengaturan
    $('#set-endpoint').onchange = function () { Store.saveSettings({ endpoint: $('#set-endpoint').value.trim() }); renderSyncPill(); };
    $('#set-test').onclick = testConnection;
    $('#set-petugas').onchange = function () { Store.saveSettings({ petugas: $('#set-petugas').value.trim() }); renderHome(); };
    $$('#set-theme button').forEach(function (b) {
      b.onclick = function () {
        var t = b.getAttribute('data-t');
        Store.saveSettings({ theme: t });
        applyTheme(t);
        renderSettings();
      };
    });
    $('#set-autosync').onclick = function () {
      var v = !Store.settings().autoSync;
      Store.saveSettings({ autoSync: v });
      renderSettings();
    };
    $('#set-weight').onclick = function () {
      var v = !Store.settings().showWeight;
      Store.saveSettings({ showWeight: v });
      renderSettings();
    };
    $('#set-sync').onclick = doSync;
    $('#set-pull').onclick = function () {
      busy(true, 'Mengambil data...');
      Sync.pullList().then(function (rows) {
        busy(false); toast(rows.length + ' baris rekap diambil', 'ok');
        renderSettings(); if (app.tab === 'dash') renderDash();
      }).catch(function (e) { busy(false); toast('Gagal: ' + e.message, 'err'); });
    };
    $('#set-wipe').onclick = wipeLocal;
    $('#set-sheet-link').href = SHEET_URL;

    // Bayangan appbar saat digulir
    $$('.view').forEach(function (v) {
      v.addEventListener('scroll', function () {
        var bar = v.querySelector('.appbar');
        if (bar) bar.classList.toggle('scrolled', v.scrollTop > 4);
      }, { passive: true });
    });
    window.addEventListener('scroll', function () {
      var bar = $('.view.active .appbar');
      if (bar) bar.classList.toggle('scrolled', window.scrollY > 4);
    }, { passive: true });
  }

  function init() {
    var s = Store.settings();
    applyTheme(s.theme);
    if (global.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if (Store.settings().theme === 'auto') applyTheme('auto'); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    bindStatic();
    Sync.onChange(function () { renderSyncPill(); });

    showTab('home', { silent: true });
    pushRoute({ tab: 'home' });
    pushRoute({ guard: 1 });   // satu entri cadangan agar back pertama tertangkap

    // Bersihkan foto yatim dari draft/record yang sudah tidak ada
    var live = Store.records().map(function (r) { return r.id; });
    var dr = Store.draft();
    if (dr) live.push(dr.id);
    Store.Photos.gc(live);

    // Pintasan PWA: ?mulai=<jenis> langsung membuka form
    try {
      var q = new URLSearchParams(location.search).get('mulai');
      if (q && D.JENIS[q]) setTimeout(function () { startPenilaian(q); }, 60);
    } catch (e) {}

    // Sinkron latar saat aplikasi dibuka
    if (s.autoSync && navigator.onLine && Sync.configured()) {
      setTimeout(function () {
        Sync.syncAll({ pull: true }).then(function () {
          renderSyncPill();
          if (app.tab === 'dash') renderDash();
          if (app.tab === 'home') renderHome();
        });
      }, 1200);
    }
  }

  global.TKB_APP = { init: init, toast: toast, openRecord: openRecord, plainText: plainText };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
