/* Mil e Uma Linhas!  Fundos vivos e cor de destaque do tema ASCII.
   Aurora: manchas de luz grandes e lentas, na cor de destaque, misturadas com "screen".
   Chuva de luz: a mesma aurora mais fraca, com riscos de luz que caem na diagonal e alguns orbes.
   Tudo em canvas 2D próprio, sem biblioteca. Para quem pede menos movimento, um quadro parado.
   A escolha fica neste aparelho (localStorage: mul-acento e mul-fundo). */
window.MUL_FUNDO = (function () {
  'use strict';
  var raiz = document.documentElement;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var caixa = document.getElementById('fundo-vivo'), cv = document.getElementById('fundo-canvas');
  if (!caixa || !cv) return {};
  var ctx = cv.getContext('2d', { alpha: true });
  var ACENTOS = ['verde', 'ciano', 'ambar', 'laranja', 'rosa', 'lilas', 'menta', 'gelo'];
  var FUNDOS = ['aurora', 'chuva', 'nenhum'];
  var acento = 'verde', fundo = 'nenhum'; /* padrão: sem fundo animado; aurora e chuva são escolha de quem visita */
  try { acento = localStorage.getItem('mul-acento') || acento; fundo = localStorage.getItem('mul-fundo') || fundo; } catch (e) {}
  if (ACENTOS.indexOf(acento) < 0) acento = 'verde';
  if (FUNDOS.indexOf(fundo) < 0) fundo = 'nenhum';

  function rgb() {
    var v = getComputedStyle(raiz).getPropertyValue('--verde-rgb').trim().split(',').map(function (x) { return +x; });
    return v.length === 3 && !v.some(isNaN) ? v : [184, 243, 74];
  }
  function marcar(sel, attr, valor) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (b) { b.setAttribute('aria-checked', b.dataset[attr] === valor ? 'true' : 'false'); });
  }
  function aplicarAcento(a, inicial) {
    acento = a;
    if (a === 'verde') raiz.removeAttribute('data-acento'); else raiz.setAttribute('data-acento', a);
    marcar('.acentos button', 'acento', a);
    if (!inicial) { try { localStorage.setItem('mul-acento', a); } catch (e) {} }
    cor = rgb(); sementes(); if (!inicial) window.dispatchEvent(new Event('mul:acento'));
    if (!animando) { acc = 1; quadro(performance.now()); }
  }
  function aplicarFundo(f, inicial) {
    fundo = f; caixa.setAttribute('data-fundo', f);
    marcar('.fundos button', 'fundo', f);
    if (!inicial) { try { localStorage.setItem('mul-fundo', f); } catch (e) {} }
    ligar();
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.acentos button[data-acento]');
    if (b) { aplicarAcento(b.dataset.acento); return; }
    b = ev.target.closest('.fundos button[data-fundo]');
    if (b) aplicarFundo(b.dataset.fundo);
  });

  /* ---------- cena: aurora e chuva feitas de caracteres ----------
     A luz é calculada em baixa resolução (manchas em degradê) e depois "impressa" numa grade de células mono:
     quanto mais luz na célula, mais denso o caractere (de "." a "#") e mais forte a cor. É aurora em ASCII.
     A chuva são colunas de código que caem, com rastro que apaga, como uma impressora de luz. */
  var W = 0, H = 0, cor = [184, 243, 74], manchas = [], colunas = [], raf = 0, animando = false, ultimo = 0, acc = 0;
  var CEL_W = 13, CEL_H = 21, cols = 0, rows = 0;
  var luz = document.createElement('canvas'), lctx = luz.getContext('2d', { willReadFrequently: true });
  var GLIFOS = ' .:-=+*#%@', NIVEIS = GLIFOS.length - 1, atlas = [], CODIGO = '01{}[]()<>/\;:=+*#$%&!?abcdefxyz';
  function medir() {
    var r = caixa.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    W = w; H = h; cols = Math.ceil(W / CEL_W); rows = Math.ceil(H / CEL_H);
    luz.width = cols; luz.height = rows;
  }
  function azar(a, b) { return a + Math.random() * (b - a); }
  function fazerAtlas() {
    /* um pequeno canvas por nível de luz, com o caractere já pintado na cor de destaque */
    atlas = [];
    for (var n = 1; n <= NIVEIS; n++) {
      var c = document.createElement('canvas'); c.width = CEL_W; c.height = CEL_H;
      var x = c.getContext('2d');
      x.font = '700 ' + (CEL_H * .72).toFixed(0) + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
      x.textBaseline = 'middle'; x.textAlign = 'center';
      var a = .14 + .3 * (n / NIVEIS);
      x.fillStyle = 'rgba(' + cor[0] + ',' + cor[1] + ',' + cor[2] + ',' + a.toFixed(2) + ')';
      x.fillText(GLIFOS[n], CEL_W / 2, CEL_H / 2 + 1);
      atlas.push(c);
    }
  }
  function sementes() {
    manchas = [];
    for (var i = 0; i < 4; i++) manchas.push({ x: azar(.1, .9), y: azar(.15, .85), r: azar(.3, .5), f: azar(0, 6.28), a: azar(.4, .65) });
    colunas = [];
    fazerAtlas();
  }
  function pintarLuz(tempo, forca) {
    lctx.clearRect(0, 0, cols, rows);
    lctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < manchas.length; i++) {
      var m = manchas[i];
      var x = (m.x + Math.sin(tempo * .00011 + m.f) * .07) * cols, y = (m.y + Math.cos(tempo * .00008 + m.f) * .06) * rows;
      var r = m.r * Math.max(cols, rows);
      var g = lctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,' + (m.a * forca).toFixed(3) + ')'); g.addColorStop(.5, 'rgba(255,255,255,' + (m.a * forca * .3).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      lctx.fillStyle = g; lctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    lctx.globalCompositeOperation = 'source-over';
  }
  function imprimir(limiar) {
    var d = lctx.getImageData(0, 0, cols, rows).data;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var v = d[(y * cols + x) * 4 + 3] / 255;              /* alfa acumulado = quantidade de luz na célula */
      if (v < limiar) continue;
      /* um pouco de ruído fixo por célula para a grade não parecer carimbada */
      var ruido = (Math.abs((x * 73856093) ^ (y * 19349663)) % 7) / 40;
      var n = Math.min(NIVEIS, Math.max(1, Math.round(Math.pow(Math.max(0, v - limiar + ruido) / (1 - limiar), 1.7) * NIVEIS)));
      if (!atlas[n - 1]) continue;
      ctx.drawImage(atlas[n - 1], x * CEL_W, y * CEL_H);
    }
  }
  function novaColuna() {
    return { x: Math.floor(Math.random() * cols), y: -Math.floor(azar(2, 14)), v: azar(6, 14), rastro: Math.floor(azar(8, 22)), seq: Math.floor(Math.random() * 1000) };
  }
  function glifo(seq, i) { return CODIGO[(seq * 7 + i * 13) % CODIGO.length]; }
  function pintarChuva(dt) {
    if (colunas.length < Math.max(5, cols / 14) && Math.random() < .18) colunas.push(novaColuna());
    ctx.font = '700 ' + (CEL_H * .72).toFixed(0) + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    var base = cor[0] + ',' + cor[1] + ',' + cor[2] + ',';
    for (var i = colunas.length - 1; i >= 0; i--) {
      var c = colunas[i]; c.y += c.v * dt;
      var topo = Math.floor(c.y);
      for (var k = 0; k < c.rastro; k++) {
        var yy = topo - k; if (yy < 0 || yy >= rows) continue;
        var a = k === 0 ? .8 : Math.max(0, .45 * (1 - k / c.rastro));
        ctx.fillStyle = k === 0 ? 'rgba(244,241,232,.8)' : 'rgba(' + base + a.toFixed(2) + ')';
        ctx.fillText(glifo(c.seq, yy), c.x * CEL_W + CEL_W / 2, yy * CEL_H + CEL_H / 2 + 1);
      }
      if (topo - c.rastro > rows) colunas.splice(i, 1);
    }
  }
  function quadro(ts) {
    raf = 0;
    if (!ativo()) { animando = false; return; }
    medir();
    var dt = ultimo ? Math.min(.05, (ts - ultimo) / 1000) : .016; ultimo = ts;
    acc += dt;
    if (acc >= 1 / 24 || calmo) {                              /* 24 quadros por segundo bastam para texto */
      acc = 0;
      ctx.clearRect(0, 0, W, H);
      if (fundo === 'aurora') { pintarLuz(ts, 1); imprimir(.2); }
      else if (fundo === 'chuva') { pintarLuz(ts, .6); imprimir(.34); pintarChuva(1 / 24); }
    }
    if (calmo) { animando = false; return; }
    animando = true; raf = requestAnimationFrame(quadro);
  }
  function ativo() { return raiz.getAttribute('data-tema') === 'ascii' && fundo !== 'nenhum' && !document.hidden; }
  function ligar() {
    if (!ativo()) { if (raf) cancelAnimationFrame(raf); raf = 0; animando = false; ctx.clearRect(0, 0, W, H); return; }
    if (!animando && !raf) { ultimo = 0; acc = 1; raf = requestAnimationFrame(quadro); }
  }
  var rz = 0;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { medir(); if (!animando) { acc = 1; quadro(performance.now()); } }, 160); });
  document.addEventListener('visibilitychange', ligar);
  window.addEventListener('mul:tema', ligar);

  medir(); cor = rgb(); sementes();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fazerAtlas(); });
  aplicarAcento(acento, true);
  aplicarFundo(fundo, true);
  return { acento: function () { return acento; }, fundo: function () { return fundo; } };
})();
