// Site background (C3): a skyline out of focus. Towers are stations, pipes join them, and each
// station changes the data's form. Positions depend only on the wall clock and fixed seeds.
(() => {
  const d = document, root = d.documentElement, mq = (q) => matchMedia(q), c = d.getElementById("site-bg");
  // FC: the media where global.css hides the canvas; the loop stops there too.
  const RM = mq("(prefers-reduced-motion: reduce)"), FC = mq("(forced-colors: active), (prefers-contrast: more), print");
  const gap = 1000 / (mq("(pointer: coarse)").matches ? 24 : 30) - 2;
  const x = c?.getContext("2d"), s = d.createElement("canvas"), sx = s.getContext("2d"), DA = [0, 0];
  let paused = false, W = 0, H = 0, sc = 1, L = [], key, C, raf = 0, last = 0, t = 0, rt;
  try { paused = localStorage.getItem("lfpl47-motion") == "paused"; } catch {}
  // Set first: the header's pause button must always find the API.
  window.siteBg = { pause() { paused = true; x && sync(); }, play() { paused = false; x && sync(); }, get paused() { return paused; } };
  if (!x) return;

  const prng = (n) => () => (n = n * 16807 % 2147483647) / 2147483647;
  const mx = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const css = (a) => `rgb(${a})`;
  const lum = (a) => a.reduce((y, v, i) => y + [.2126, .7152, .0722][i] * ((v /= 255) < .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4), 0);
  const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  // Per depth, far to near, canvas px: tower width min, max, gap max, height min, max (x H),
  // station spacing, packet speed /s, radius, spacing, blur, pipe width, first form. No ticks on
  // pipes, and near spacing 70 (140 css px), off the charts' year steps: nothing reads as an axis.
  const SPEC = [
    [7, 20, 3, .3, .7, 56, 3.5, 3.4, 50, 3, 1, 1],
    [12, 28, 10, .22, .55, 70, 5.5, 2.8, 44, 2.5, 2, 3],
    [16, 36, 22, .14, .42, 90, 8, 3, 48, 2.1, 4, 2],
    [30, 70, 60, .06, .3, 120, 12, 4.2, 70, 1.8, 6, 0],
  ];
  const U = [.45, .65, .85, 1];

  function build() {
    sc = Math.min(1, Math.max(.72, W / 720));
    // G lifts the near depths on tall screens, so phones see a pipeline.
    const VW = W / sc, VH = H / sc, G = Math.max(0, H - W) * .6 / sc;
    L = SPEC.map(([w0, w1, g1, h0, h1, sp, v, r, ps, b, tw, o], k) => {
      const R = prng(k * 7919 + 17), T = [], S = [], P = [], cx = (q) => q.x + (q.w >> 1);
      for (let X = -Math.round(R() * w1), i = 0, pX = -1e9; X < VW + w1; i++) {
        const w = Math.round(w0 + R() * (w1 - w0)), st = X - pX > sp, hr = (h0 + R() ** 1.7 * (h1 - h0)) * (.8 + .3 * Math.sin(X / 210 + k * 2));
        const q = { x: X, w, h: Math.round(Math.max(hr, st ? (h0 + h1) / 2 : 0) * VH + G * k / 3), a: R(), f: R(), i };
        T.push(q);
        if (st) { S.push(q); pX = X; }
        X += w + Math.round(R() * g1);
      }
      let y = VH - Math.round(S[0].h * (.15 + .2 * S[0].a));
      P.push([-30, y]);
      S.forEach((q, j) => {
        const n = S[j + 1], top = Math.min(q.h, n ? n.h : q.h);
        P.push([cx(q), y]);
        y = VH - Math.round(top * (j % 2 ? .15 + .2 * q.f : .6 + .25 * q.f));
        P.push([cx(q), y]);
      });
      P.push([VW + 30, y]);
      const cum = [0];
      for (let j = 1; j < P.length; j++) cum.push(cum[j - 1] + Math.abs(P[j][0] - P[j - 1][0]) + Math.abs(P[j][1] - P[j - 1][1]));
      const len = cum[cum.length - 1];
      return { T, P, cum, len, n: Math.max(2, Math.round(len / ps)), v, r, b, tw, o, k, c: d.createElement("canvas") };
    });
  }

  function pal() {
    const cs = getComputedStyle(root), get = (n) => {
      x.fillStyle = "#0000"; x.fillStyle = cs.getPropertyValue(n).trim();
      const v = x.fillStyle;
      return v[0] == "#" && [1, 3, 5].map((i) => parseInt(v.substr(i, 2), 16));
    };
    const P = get("--paper"), I = get("--ink"), A = get("--accent"), T = get("--ink-3"), k = [P, I, A, T] + "";
    if (k == key) return false;
    key = k;
    // Fail closed: a token that is not opaque sRGB hides the city.
    if (c.hidden = !(P && I && A && T)) return false;
    // cap(Y): most paper-to-Y mix that keeps --ink-3 and --accent at min(7.3, .86 x their ratio
    // on paper). Masses go the safe way: white by day, black at night.
    const lp = lum(P), D = lp < .2, Q = [T, A].map((y) => [lum(y), Math.min(7.3, .86 * cr(lum(y), lp))]);
    const cap = (Y) => { let k = 0; for (let h = .5; h > .001; h /= 2) if (Q.every(([l, n]) => cr(l, lum(mx(P, Y, k + h))) >= n)) k += h; return k; };
    const kI = cap(I), pI = mx(P, I, kI), pA = mx(P, A, cap(A)), f = (Y, k) => css(mx(P, Y, k)), Z = D ? [0, 0, 0] : [255, 255, 255];
    C = U.map((u) => ({
      face: f(Z, (D ? .8 : 1) * u),
      edge: f(I, kI * (D ? .25 : .7) * u),
      pipe: f(I, kI * (D ? .4 : .8) * u),
      win: f(I, kI * .5 * (.5 + .5 * u)),
      pk: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => css(mx(P, mx(pI, pA, i / 7), .5 + .5 * u))),
    }));
    C.D = D;
    return true;
  }

  function paint() {
    const m = 12;
    s.width = W + 2 * m; s.height = H + 2 * m;
    const VH = H / sc, lw = 1 / sc;
    L.forEach((l) => {
      const { k, P, tw } = l, cc = C[k], g = l.c.getContext("2d");
      l.c.width = W; l.c.height = H;
      sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.clearRect(0, 0, s.width, s.height);
      sx.setTransform(sc, 0, 0, sc, m, m);
      sx.lineWidth = lw;
      for (const q of l.T) {
        const { x: X, w, h } = q, top = VH - h;
        sx.fillStyle = cc.face;
        sx.fillRect(X, top, w, h + m);
        sx.beginPath();
        sx.rect(X + .5, top + .5, w - 1, h + m);
        sx.strokeStyle = cc.edge;
        sx.stroke();
      }
      sx.beginPath();
      sx.moveTo(P[0][0], P[0][1] + .5);
      for (let j = 1; j < P.length - 1; j++) sx.arcTo(P[j][0] + .5, P[j][1] + .5, P[j + 1][0] + .5, P[j + 1][1] + .5, 5);
      sx.lineTo(P[P.length - 1][0], P[P.length - 1][1] + .5);
      sx.strokeStyle = cc.face; sx.lineWidth = (tw + 4) * lw; sx.stroke();
      sx.strokeStyle = cc.pipe; sx.lineWidth = tw * lw; sx.stroke();
      if (tw > 2) { sx.strokeStyle = cc.face; sx.lineWidth = (tw - 2) * lw; sx.stroke(); }
      g.filter = `blur(${l.b}px)`;
      g.drawImage(s, -m, -m);
      if (!C.D) return;
      // Lit windows get half the blur: soft points of light that stay visible.
      g.filter = `blur(${l.b / 2}px)`;
      g.setTransform(sc, 0, 0, sc, 0, 0);
      g.fillStyle = cc.win;
      g.beginPath();
      for (const q of l.T) {
        const R = prng(q.i * 977 + k * 31 + 1), st = [7, 6, 6, 7][k];
        for (let yy = VH - q.h + 4; yy < VH; yy += st) for (let xx = q.x + 3; xx < q.x + q.w - 2; xx += st - 2) if (R() < [.05, .07, .1, .12][k]) { g.moveTo(xx + 2, yy); g.arc(xx, yy, [2.4, 1.8, 1.3, 1][k], 0, 7); }
      }
      g.fill();
    });
  }

  // Stage q rises by one per riser: dots, ring, dot, block. Three dashes grow from dots (round
  // caps) into a ring. In a riser the disc swells: the station lights up.
  function pk(l) {
    const { P, cum, len, n, v, r, o, b } = l, col = C[l.k].pk, cl = (u) => Math.min(1, Math.max(0, u));
    x.setTransform(sc, 0, 0, sc, 0, 0);
    x.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const p = (k * len / n + t * v) % len;
      let j = 1;
      while (cum[j] < p) j++;
      const f = (p - cum[j - 1]) / (cum[j] - cum[j - 1] || 1), A = P[j - 1], B = P[j], ri = (j - 1) & 1;
      const X = A[0] + (B[0] - A[0]) * f, Y = A[1] + (B[1] - A[1]) * f;
      const q = (((j - 1) >> 1) + ri * f + o) % 4, e = cl(q - 3), gl = ri * Math.sin(Math.PI * f);
      const ring = cl(q) - e, fill = cl(q - 1) - e, blk = cl(q - 2) - e, cn = r * (1 - .7 * blk), per = (8 * r - 1.7168 * cn) / 3;
      const cc = col[Math.round(blk * 7)];
      x.fillStyle = C.D ? cc : "#fff";
      x.globalAlpha = C.D ? .1 + .25 * fill + .15 * gl : .7;
      x.beginPath();
      x.arc(X, Y, r * (1 + 2 * gl) + 1.5 * (C.D ? b : 1), 0, 7);
      x.fill();
      x.fillStyle = x.strokeStyle = cc;
      x.beginPath();
      x.roundRect ? x.roundRect(X - r, Y - r, 2 * r, 2 * r, cn) : x.arc(X, Y, r, 0, 7);
      x.globalAlpha = fill;
      x.fill();
      x.globalAlpha = 1;
      DA[0] = per * ring + .01; DA[1] = per * (1 - ring);
      x.setLineDash(DA);
      x.lineDashOffset = DA[0] / 2;
      x.lineWidth = 1.5 + .7 * r * (1 - ring);
      x.stroke();
    }
  }

  function draw(tt) {
    t = tt;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, W, H);
    for (const l of L) { x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(l.c, 0, 0); pk(l); }
  }
  function fit() {
    const w = c.clientWidth >> 1, h = c.clientHeight >> 1;
    if (!w || !h || (w == W && h == H)) return false;
    c.width = W = w; c.height = H = h;
    build(); paint();
    return true;
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last >= gap) { last = now; draw(Date.now() / 1000); }
  }
  function sync() {
    if (fit()) draw(t);
    const run = W && !c.hidden && !paused && !RM.matches && !FC.matches && !d.hidden;
    if (run && !raf) raf = requestAnimationFrame(loop);
    else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  const theme = () => { if (pal() && W) { paint(); draw(raf ? Date.now() / 1000 : t); } sync(); };

  t = paused || RM.matches ? 0 : Date.now() / 1000;
  pal();
  sync();
  RM.addEventListener("change", sync);
  FC.addEventListener("change", sync);
  d.addEventListener("visibilitychange", sync);
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(sync, 200); });
  mq("(prefers-color-scheme: dark)").addEventListener("change", theme);
  new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();
