// Test-only. The design's logic (SaunaFinder.dc.html, fdVals), kept so the port can be checked against it.
// Copied with the inline-style code removed; otherwise unchanged. Do not import from app code.

export function designFinder(data, S) {
  function money(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }
  function ft(n) { var f = Math.floor(n), i = Math.round((n - f) * 12); if (i === 12) { f++; i = 0; } return i ? f + '′ ' + i + '″' : f + '′'; }
  var W = parseFloat(S.w), D = parseFloat(S.d), H = parseFloat(S.h), ready = W > 0 && D > 0;
  var res = [], NEAR = 15;
  if (ready) {
    var sw = W * 12, sd = D * 12, sh = S.mode === 'in' && H > 0 ? H * 12 : 0;
    data.forEach(function (m) {
      if (m.k !== S.mode) return;
      var ok = [], tight = [];
      m.s.forEach(function (z) {
        if (S.ppl && z.seats < S.ppl) return;
        function fits(b) { return (sw >= z.w + b && sd >= z.d + b) || (sw >= z.d + b && sd >= z.w + b); }
        var hOk = !sh || sh >= z.h, hNear = !sh || sh >= z.h - 2;
        if (fits(0) && hOk) ok.push(z); else if (fits(-NEAR) && hNear) tight.push(z);
      });
      var use = ok.length ? ok : tight; if (!use.length) return;
      var minP = Math.min.apply(null, use.map(function (z) { return z.p; })), maxS = Math.max.apply(null, use.map(function (z) { return z.seats; }));
      var sm = use.slice().sort(function (a, b) { return a.w * a.d - b.w * b.d; })[0];
      var multi = m.s.length > 1;
      var good = ok.length > 0;
      var detail = (multi ? (good ? 'Fits: ' : 'Close: ') + use.map(function (z) { return z.l; }).join(', ') : 'Footprint about ' + ft(sm.w / 12) + ' × ' + ft(sm.d / 12) + (m.note ? ' · ' + m.note : '')) + (good ? '' : ' · within a foot of your space');
      res.push({ n: m.n, href: m.href, img: m.img, alt: m.n + ', The Toronto Sauna Co.', detail: detail, seats: 'Seats up to ' + maxS,
        price: (multi ? 'From ' : '') + money(minP), good: good, sortP: minP, core: S.mode === 'in' || !!m.c, best: !!m.b,
        badge: good ? 'Fits' : 'Close fit' });
    });
    var byFit = function (a, b) { return (a.good === b.good) ? a.sortP - b.sortP : (a.good ? -1 : 1); };
    var core = res.filter(function (r) { return r.core; }).sort(function (a, b) { return (a.good !== b.good) ? (a.good ? -1 : 1) : (a.best !== b.best) ? (a.best ? -1 : 1) : a.sortP - b.sortP; });
    var alt = res.filter(function (r) { return !r.core; }).sort(byFit).slice(0, core.length ? 2 : 4);
    alt.forEach(function (r) { r.badge = r.good ? 'Value pick' : 'Value pick · close fit'; });
    core.forEach(function (r) { if (r.best && r.good) r.badge = 'Best seller · fits'; });
    res = core.concat(alt);
  }
  var where = S.mode === 'in' ? 'indoor' : 'outdoor', nGood = res.filter(function (r) { return r.good; }).length;
  var summary = !ready ? '' : res.length === 0 ? '' : (res.length + ' ' + where + ' sauna' + (res.length === 1 ? ' fits' : 's fit') + ' or come' + (res.length === 1 ? 's' : '') + ' close to your ' + ft(W) + ' × ' + ft(D) + ' space' + (nGood < res.length ? ' (' + (res.length - nGood) + ' close)' : '') + '.');
  var lines = ['Hi, I\'d like a quote for a sauna.', 'Where: ' + where]; if (ready) lines.push('Space: ' + ft(W) + ' x ' + ft(D)); if (S.mode === 'in' && H > 0) lines.push('Ceiling: ' + ft(H)); if (S.ppl) lines.push('People: ' + S.ppl + '+');
  return { ready: ready, res: res, summary: summary, lines: lines };
}
