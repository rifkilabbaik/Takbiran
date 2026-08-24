/* Takbiran — grafik SVG inline. Tanpa library: harus tetap hidup saat offline.
   Aturan bentuk: batang ≤24px, ujung data membulat 4px & rata di baseline,
   celah 2px antar batang, grid setipis rambut, label langsung hanya seperlunya. */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtPct(v, dec) {
    var n = Math.round(Number(v || 0) * 100) / 100;
    if (dec === 0 || Number.isInteger(n)) return String(Math.round(n));
    return n.toFixed(dec === undefined ? 1 : dec);
  }

  function toneOf(pct) {
    if (pct >= 80) return 'good';
    if (pct >= 75) return 'warn';
    return 'bad';
  }

  function toneColor(tone) {
    return tone === 'good' ? 'var(--good)' : tone === 'warn' ? 'var(--warn)' : tone === 'bad' ? 'var(--bad)' : 'var(--brand)';
  }

  /* Path batang dengan dua sudut atas membulat, dasar tetap siku di baseline. */
  function barPath(x, y, w, h, r) {
    if (h <= 0.5) h = 0.5;
    var rad = Math.min(r, w / 2, h);
    return 'M' + x + ',' + (y + h) +
           'V' + (y + rad) +
           'a' + rad + ',' + rad + ' 0 0 1 ' + rad + ',' + (-rad) +
           'h' + (w - 2 * rad) +
           'a' + rad + ',' + rad + ' 0 0 1 ' + rad + ',' + rad +
           'V' + (y + h) + 'Z';
  }

  /* ---------------------------------------------------------------
     Kolom tren — satu seri, jadi tanpa kotak legenda (judul kartu sudah
     menyebutkan apa yang diplot). Label langsung hanya di batang terakhir
     dan batang tertinggi.
     --------------------------------------------------------------- */
  function columns(host, data, opts) {
    opts = opts || {};
    host.innerHTML = '';
    if (!data || !data.length) return;

    var W = 328, H = opts.height || 158;
    var padL = 26, padR = 8, padT = 18, padB = 24;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = opts.max || 100;
    var band = plotW / data.length;
    var barW = Math.max(6, Math.min(24, band - 8));
    var ticks = opts.ticks || [0, 50, 100];

    var maxIdx = 0;
    data.forEach(function (d, i) { if (d.value > data[maxIdx].value) maxIdx = i; });

    /* Sumbu X hanya memuat ~6 label; sisanya diwakili tooltip.
       Label yang bertabrakan lebih buruk daripada label yang tidak ada. */
    var labelStep = Math.max(1, Math.ceil(data.length / 6));
    function showLabel(i) { return i === data.length - 1 || (data.length - 1 - i) % labelStep === 0; }

    var svg = ['<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria || 'Grafik tren') + '">'];

    ticks.forEach(function (t) {
      var y = padT + plotH - (t / max) * plotH;
      svg.push('<line class="grid-line" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>');
      svg.push('<text class="axis-text" x="' + (padL - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + t + '</text>');
    });

    data.forEach(function (d, i) {
      var v = Math.max(0, Math.min(max, Number(d.value) || 0));
      var h = (v / max) * plotH;
      var x = padL + i * band + (band - barW) / 2;
      var y = padT + plotH - h;
      var fill = d.color || (opts.byTone ? toneColor(toneOf(v)) : 'var(--brand)');
      svg.push('<path class="bar-mark" data-i="' + i + '" d="' + barPath(x, y, barW, h, 4) + '" fill="' + fill + '"/>');
      svg.push('<rect class="bar-hit" data-i="' + i + '" x="' + (padL + i * band) + '" y="' + padT + '" width="' + band + '" height="' + plotH + '"/>');
      if (d.label && showLabel(i)) {
        svg.push('<text class="axis-text" x="' + (x + barW / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(d.label) + '</text>');
      }
      if (i === data.length - 1 || i === maxIdx) {
        svg.push('<text class="value-text" x="' + (x + barW / 2) + '" y="' + (y - 5) + '" text-anchor="middle">' + fmtPct(v, 0) + '</text>');
      }
    });

    svg.push('<line class="base-line" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '"/>');
    svg.push('</svg>');

    host.innerHTML = svg.join('');
    attachTip(host, data, opts.tip);
  }

  function attachTip(host, data, tipFn) {
    var svg = host.querySelector('svg');
    if (!svg) return;
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    host.appendChild(tip);

    function show(i, clientX) {
      var d = data[i];
      if (!d) return;
      tip.innerHTML = tipFn ? tipFn(d) : ('<b>' + esc(d.label || '') + '</b> ' + fmtPct(d.value) + '%');
      var box = host.getBoundingClientRect();
      var x = Math.max(50, Math.min(box.width - 50, clientX - box.left));
      var hit = svg.querySelector('.bar-hit[data-i="' + i + '"]');
      var top = hit ? hit.getBoundingClientRect().top - box.top + 8 : 20;
      tip.style.left = x + 'px';
      tip.style.top = top + 'px';
      tip.classList.add('show');
      svg.classList.add('dim');
      Array.prototype.forEach.call(svg.querySelectorAll('.bar-mark'), function (m) {
        m.classList.toggle('hot', m.getAttribute('data-i') === String(i));
      });
    }

    function hide() {
      tip.classList.remove('show');
      svg.classList.remove('dim');
      Array.prototype.forEach.call(svg.querySelectorAll('.bar-mark'), function (m) { m.classList.remove('hot'); });
    }

    Array.prototype.forEach.call(svg.querySelectorAll('.bar-hit'), function (hit) {
      var i = parseInt(hit.getAttribute('data-i'), 10);
      hit.addEventListener('mouseenter', function (e) { show(i, e.clientX); });
      hit.addEventListener('mousemove', function (e) { show(i, e.clientX); });
      hit.addEventListener('mouseleave', hide);
      hit.addEventListener('touchstart', function (e) {
        show(i, e.touches[0].clientX);
        e.stopPropagation();
      }, { passive: true });
    });
    host.addEventListener('touchend', function () { setTimeout(hide, 1600); }, { passive: true });
  }

  /* --------------------------------------------------------------- */
  function sparkline(values, opts) {
    opts = opts || {};
    if (!values || values.length < 2) return '';
    var W = 100, H = opts.height || 26;
    var min = opts.min, max = opts.max;
    if (min === undefined || max === undefined) {
      var lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
      var padv = Math.max(2, (hi - lo) * 0.3);
      if (min === undefined) min = Math.max(0, lo - padv);
      if (max === undefined) max = Math.min(100, hi + padv);
      if (max - min < 4) { min = Math.max(0, min - 2); max = min + 4; }
    }
    var span = Math.max(1, max - min);
    /* Sisakan 3px di kiri-kanan supaya titik ujung tidak terpotong tepi SVG. */
    var inset = 3;
    var pts = values.map(function (v, i) {
      var x = inset + (i / (values.length - 1)) * (W - inset * 2);
      var y = H - ((Math.max(min, Math.min(max, v)) - min) / span) * (H - 6) - 3;
      return [x, y];
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var area = d + ' L' + (W - inset) + ',' + H + ' L' + inset + ',' + H + ' Z';
    var last = pts[pts.length - 1];
    var color = opts.color || 'var(--brand)';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:' + H + 'px" aria-hidden="true">' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.1"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.6" fill="' + color + '" stroke="var(--surface)" stroke-width="2"/>' +
      '</svg>';
  }

  /* Meter melingkar: jalur = langkah lebih terang dari ramp yang sama. */
  function ring(pct, opts) {
    opts = opts || {};
    var size = opts.size || 108, sw = opts.stroke || 10;
    var r = (size - sw) / 2, c = size / 2;
    var circ = 2 * Math.PI * r;
    var v = Math.max(0, Math.min(100, Number(pct) || 0));
    var color = opts.color || toneColor(toneOf(v));
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" style="width:100%;height:100%" role="img" aria-label="' + esc(opts.aria || (fmtPct(v) + ' persen')) + '">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="var(--surface-3)" stroke-width="' + sw + '"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"' +
      ' stroke-linecap="round" stroke-dasharray="' + circ.toFixed(2) + '"' +
      ' stroke-dashoffset="' + (circ * (1 - v / 100)).toFixed(2) + '"' +
      ' transform="rotate(-90 ' + c + ' ' + c + ')"/>' +
      '</svg>';
  }

  /* Bagian-terhadap-keseluruhan: batang bertumpuk horizontal + legenda.
     Warna status selalu berpasangan dengan label — tidak pernah warna saja. */
  function stackedShare(host, slices, opts) {
    opts = opts || {};
    host.innerHTML = '';
    var total = slices.reduce(function (s, x) { return s + x.value; }, 0);
    if (!total) return;

    var W = 328, H = 26, gap = 2, r = 4;
    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria || 'Komposisi') + '">'];
    var used = slices.filter(function (s) { return s.value > 0; });
    var avail = W - gap * Math.max(0, used.length - 1);
    var x = 0;
    used.forEach(function (s, i) {
      var w = (s.value / total) * avail;
      var rl = i === 0 ? r : 0, rr = i === used.length - 1 ? r : 0;
      svg.push('<path d="' + roundedRectPath(x, 0, Math.max(w, 3), H, rl, rr) + '" fill="' + s.color + '"><title>' + esc(s.label) + ': ' + s.value + '</title></path>');
      if (w > 34) {
        svg.push('<text x="' + (x + w / 2) + '" y="' + (H / 2 + 4) + '" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">' + s.value + '</text>');
      }
      x += w + gap;
    });
    svg.push('</svg>');

    var legend = used.map(function (s) {
      return '<span class="legend-item"><span class="legend-swatch" style="background:' + s.color + '"></span>' +
             esc(s.label) + ' <b class="tnum">' + s.value + '</b></span>';
    }).join('');

    host.innerHTML = '<div style="padding:0 var(--sp-4)">' + svg.join('') + '</div>' +
                     '<div class="legend" style="padding-top:var(--sp-3)">' + legend + '</div>';
  }

  function roundedRectPath(x, y, w, h, rl, rr) {
    return 'M' + (x + rl) + ',' + y +
      'h' + (w - rl - rr) +
      (rr ? 'a' + rr + ',' + rr + ' 0 0 1 ' + rr + ',' + rr : '') +
      'v' + (h - rr * 2) +
      (rr ? 'a' + rr + ',' + rr + ' 0 0 1 ' + (-rr) + ',' + rr : '') +
      'h' + (-(w - rl - rr)) +
      (rl ? 'a' + rl + ',' + rl + ' 0 0 1 ' + (-rl) + ',' + (-rl) : '') +
      'v' + (-(h - rl * 2)) +
      (rl ? 'a' + rl + ',' + rl + ' 0 0 1 ' + rl + ',' + (-rl) : '') + 'Z';
  }

  /* Peringkat horizontal — DOM, bukan SVG: nama panjang perlu ellipsis nyata. */
  function rankedBars(host, rows, opts) {
    opts = opts || {};
    host.innerHTML = '';
    if (!rows || !rows.length) return;
    var max = opts.max || 100;
    rows.forEach(function (row) {
      var pct = Math.max(0, Math.min(max, Number(row.value) || 0));
      var tone = row.tone || toneOf(pct);
      var el = document.createElement('div');
      el.className = 'hbar-row';
      el.innerHTML =
        '<div class="hbar-name"><span class="nm">' + esc(row.label) + '</span></div>' +
        '<div class="hbar-val" style="color:' + toneColor(tone) + '">' + fmtPct(pct) + '%</div>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + (pct / max * 100).toFixed(1) + '%;background:' + toneColor(tone) + '"></div></div>' +
        (row.sub ? '<div class="hbar-sub">' + esc(row.sub) + '</div>' : '');
      host.appendChild(el);
    });
  }

  global.TKB_CHART = {
    columns: columns,
    sparkline: sparkline,
    ring: ring,
    stackedShare: stackedShare,
    rankedBars: rankedBars,
    toneOf: toneOf,
    toneColor: toneColor,
    fmtPct: fmtPct,
    esc: esc
  };
})(window);
