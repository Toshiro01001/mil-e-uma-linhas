/* Móveis Cerrado Alto. Painel de anúncios com dados simulados, gráficos em SVG feitos à mão. */
(function () {
  'use strict';
  var CHAVE = 'vitrine-trafego:prefs';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var HIST = 180; /* dias de histórico simulado, o dobro do maior período, para comparar */
  /* A cor segue a campanha: filtrar nunca repinta as outras. Paleta validada para daltonismo. */
  var CAMP = [
    { id: 'busca', nome: 'Busca: sofá retrátil', cor: '#2a78d6', c: 's0', gasto: 95, cpc: 1.9, cvr: 0.006, ticket: 1480 },
    { id: 'insta', nome: 'Instagram: mesa de jantar', cor: '#eb6834', c: 's1', gasto: 70, cpc: 0.85, cvr: 0.0025, ticket: 1100 },
    { id: 'remk', nome: 'Remarketing: carrinho', cor: '#1baf7a', c: 's2', gasto: 30, cpc: 0.7, cvr: 0.005, ticket: 950 },
    { id: 'alcance', nome: 'Facebook: alcance regional', cor: '#eda100', c: 's3', gasto: 55, cpc: 0.45, cvr: 0.0005, ticket: 800 },
    { id: 'video', nome: 'YouTube: visita à fábrica', cor: '#6250d6', c: 's4', gasto: 40, cpc: 0.6, cvr: 0.0012, ticket: 1200 }
  ];
  var MET = { gasto: { nome: 'Gasto', fmt: moeda0, eixo: moedaCurta }, receita: { nome: 'Receita', fmt: moeda0, eixo: moedaCurta }, cliques: { nome: 'Cliques', fmt: inteiro, eixo: inteiro }, conv: { nome: 'Vendas', fmt: inteiro, eixo: inteiro } };
  var COLS = [
    { k: 'nome', t: 'Campanha' }, { k: 'gasto', t: 'Gasto', f: moeda0 }, { k: 'cliques', t: 'Cliques', f: inteiro }, { k: 'cpc', t: 'CPC', f: moeda2 },
    { k: 'conv', t: 'Vendas', f: inteiro }, { k: 'cpa', t: 'CPA', f: moedaOuNada }, { k: 'receita', t: 'Receita', f: moeda0 }, { k: 'roas', t: 'ROAS', f: vezes }
  ];

  function moeda0(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function moeda2(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function moedaOuNada(v) { return v === null ? 'sem venda' : moeda2(v); }
  function moedaCurta(v) { return v >= 10000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil' : 'R$ ' + v.toLocaleString('pt-BR'); }
  function inteiro(v) { return Math.round(v).toLocaleString('pt-BR'); }
  function vezes(v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'x'; }
  function $(id) { return document.getElementById(id); }
  function h(t, p) {
    var e = document.createElement(t), k, v, i;
    for (k in p || {}) {
      v = p[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) { if (arguments[i] !== null && arguments[i] !== undefined) e.append(arguments[i]); }
    return e;
  }
  function s(t, p, texto) {
    var e = document.createElementNS(SVGNS, t);
    for (var k in p || {}) { if (p[k] !== null && p[k] !== undefined) e.setAttribute(k, p[k]); }
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  /* Datas como número de dia, para a mesma data sempre gerar os mesmos dados. */
  function diaNum(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function deNum(n) { var u = new Date(n * 864e5); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); }
  function isoDe(n) { var d = deNum(n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function numDe(st) { var p = st.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function curta(n) { return deNum(n).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
  var HOJE = diaNum(new Date());

  function acaso(sem) {
    var a = (sem * 2654435761) >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /* A fórmula que simula cada dia de cada campanha */
  function diaDe(c, i, n) {
    var r = acaso(n * 31 + i * 7919), sem = deNum(n).getDay();
    var fator = (sem === 0 || sem === 6 ? 1.2 : 1) * (0.8 + r() * 0.4) * (1 + 0.15 * Math.sin(n / 13 + i));
    var gasto = c.gasto * fator, cpc = c.cpc * (0.9 + r() * 0.2), cliques = Math.round(gasto / cpc);
    var conv = Math.floor(cliques * c.cvr * (0.7 + r() * 0.6) + r());
    return { gasto: gasto, cliques: cliques, conv: conv, receita: conv * c.ticket * (0.85 + r() * 0.3) };
  }
  var DADOS = CAMP.map(function (c, i) {
    var m = {};
    for (var n = HOJE - HIST + 1; n <= HOJE; n++) m[n] = diaDe(c, i, n);
    return m;
  });

  var PADRAO = { dias: 30, de: null, ate: null, ativas: CAMP.map(function (c) { return c.id; }), metrica: 'gasto', ordem: 'receita', sentido: -1, calc: { verba: 3000, cpc: 1.2, tx: 0.4, ticket: 1200, meta: 10 } };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function lerPrefs() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE));
      if (d && Array.isArray(d.ativas) && d.calc) return d;
    } catch (e) { /* usa o padrão */ }
    return clone(PADRAO);
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(P)); } catch (e) { /* segue só na memória */ } }
  var P = lerPrefs();

  function faixa() {
    if (P.de && P.ate) return [numDe(P.de), numDe(P.ate)];
    return [HOJE - P.dias + 1, HOJE];
  }
  function soma(ci, de, ate) {
    var t = { gasto: 0, cliques: 0, conv: 0, receita: 0 };
    for (var n = de; n <= ate; n++) {
      var d = DADOS[ci][n];
      if (d) { t.gasto += d.gasto; t.cliques += d.cliques; t.conv += d.conv; t.receita += d.receita; }
    }
    return t;
  }
  function derivar(t) {
    t.cpc = t.cliques ? t.gasto / t.cliques : 0;
    t.cpa = t.conv ? t.gasto / t.conv : null;
    t.roas = t.gasto ? t.receita / t.gasto : 0;
    return t;
  }
  function ativasIdx() { return CAMP.map(function (c, i) { return i; }).filter(function (i) { return P.ativas.indexOf(CAMP[i].id) >= 0; }); }
  function total(de, ate) {
    var t = { gasto: 0, cliques: 0, conv: 0, receita: 0 };
    ativasIdx().forEach(function (i) { var x = soma(i, de, ate); for (var k in t) t[k] += x[k]; });
    return derivar(t);
  }

  /* Cabeçalho e indicadores */
  function desenharFrase() {
    var f = faixa(), t = total(f[0], f[1]), e = $('frase');
    e.textContent = '';
    if (!ativasIdx().length) { e.textContent = 'Nenhuma campanha selecionada. Marque ao menos uma abaixo.'; return; }
    e.append('De ' + curta(f[0]) + ' a ' + curta(f[1]) + ', ', h('b', { text: moeda0(t.gasto) }), ' em anúncios simulados trouxeram ', h('b', { text: inteiro(t.conv) + (t.conv === 1 ? ' venda' : ' vendas') }), ' e ', h('b', { text: moeda0(t.receita) }), ' de receita, ou ', h('b', { text: vezes(t.roas) }), ' sobre o gasto.');
  }
  function variacao(a, b) {
    if (!b) return 'sem base anterior';
    var p = Math.round((a - b) / b * 100);
    if (!isFinite(p)) return 'sem base anterior';
    return (p > 0 ? '+' : '') + p + '% sobre o período anterior';
  }
  function desenharKpis() {
    var f = faixa(), t = total(f[0], f[1]), len = f[1] - f[0] + 1, temBase = f[0] - len >= HOJE - HIST + 1, a = temBase ? total(f[0] - len, f[0] - 1) : { gasto: 0, cliques: 0, cpc: 0, cpa: null, roas: 0 }, k = $('kpis');
    k.textContent = '';
    [['Gasto', moeda0(t.gasto), variacao(t.gasto, a.gasto)], ['Cliques', inteiro(t.cliques), variacao(t.cliques, a.cliques)], ['CPC médio', moeda2(t.cpc), variacao(t.cpc, a.cpc)], ['CPA médio', moedaOuNada(t.cpa), t.cpa && a.cpa ? variacao(t.cpa, a.cpa) : 'sem base anterior'], ['ROAS', vezes(t.roas), variacao(t.roas, a.roas)]].forEach(function (x) {
      k.append(h('div', {}, h('dt', { text: x[0] }), h('dd', {}, x[1], h('small', { text: x[2] }))));
    });
  }
  function desenharPeriodos() {
    var b = $('periodos');
    b.textContent = '';
    [7, 14, 30, 90].forEach(function (d) {
      var ligado = !P.de && P.dias === d;
      b.append(h('button', { type: 'button', 'data-dias': d, 'aria-pressed': String(ligado), text: d + ' dias', onclick: function () {
        P.dias = d; P.de = null; P.ate = null; $('erro-data').textContent = ''; salvar(); tudo();
        var n = document.querySelector('[data-dias="' + d + '"]'); if (n) n.focus();
      } }));
    });
    var f = faixa();
    $('de').value = isoDe(f[0]); $('ate').value = isoDe(f[1]);
    $('de').min = $('ate').min = isoDe(HOJE - HIST + 1); $('de').max = $('ate').max = isoDe(HOJE);
  }
  function aoMudarData() {
    var de = $('de').value, ate = $('ate').value, e = $('erro-data');
    if (!de || !ate) return;
    var a = numDe(de), b = numDe(ate);
    if (a > b) { e.textContent = 'A data inicial precisa vir antes da final.'; return; }
    if (a < HOJE - HIST + 1 || b > HOJE) { e.textContent = 'Há dados simulados apenas dos últimos ' + HIST + ' dias.'; return; }
    e.textContent = ''; P.de = de; P.ate = ate; salvar(); tudo();
  }
  function desenharLegenda() {
    var l = $('legenda');
    l.textContent = '';
    CAMP.forEach(function (c) {
      l.append(h('label', { class: 'leg' }, h('input', { type: 'checkbox', 'data-camp': c.id, checked: P.ativas.indexOf(c.id) >= 0, onchange: function () {
        var pos = P.ativas.indexOf(c.id);
        if (this.checked && pos < 0) P.ativas.push(c.id);
        if (!this.checked && pos >= 0) P.ativas.splice(pos, 1);
        salvar(); desenharDados();
      } }), h('i', { class: c.c }), h('span', { text: c.nome })));
    });
  }

  /* Dica: uma só, usada por todos os gráficos */
  function posDica(x, y) {
    var d = $('dica'), r = d.getBoundingClientRect(), L = Math.min(window.innerWidth - r.width - 8, x + 14), T = y - r.height - 12;
    if (L < 8) L = 8;
    if (T < 8) T = y + 16;
    d.style.left = L + 'px'; d.style.top = T + 'px';
  }
  function dica(titulo, linhas, x, y) {
    var d = $('dica');
    d.textContent = '';
    d.append(h('p', { class: 'tit', text: titulo }));
    linhas.forEach(function (l) {
      var i = h('i'); i.style.background = l.cor || 'transparent';
      d.append(h('p', { class: 'ln' }, i, h('b', { text: l.valor }), h('span', { text: l.nome })));
    });
    d.hidden = false;
    posDica(x, y);
  }
  function semDica() { $('dica').hidden = true; }

  function passoBonito(max, n) {
    if (max <= 0) return 1;
    var bruto = max / n, m = Math.pow(10, Math.floor(Math.log10(bruto))), r = bruto / m;
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * m;
  }

  /* Gráfico de linhas: dias ou semanas no eixo X, um único eixo Y */
  var linhaEstado = null;
  function desenharLinha() {
    var cx = $('g-linha'), W = Math.max(280, cx.clientWidth || 600), H = W < 500 ? 240 : 300, f = faixa(), len = f[1] - f[0] + 1;
    var m = P.metrica, ativas = ativasIdx();
    var bloco = len > 45 ? 7 : 1;
    $('t-linha').textContent = MET[m].nome + (bloco > 1 ? ' por semana' : ' por dia');
    cx.textContent = '';
    if (!ativas.length) { cx.append(h('p', { class: 'sub', text: 'Marque ao menos uma campanha para ver o gráfico.' })); linhaEstado = null; return; }
    var pts = [];
    for (var a = f[0]; a <= f[1]; a += bloco) pts.push([a, Math.min(f[1], a + bloco - 1)]);
    var series = ativas.map(function (ci) { return { ci: ci, v: pts.map(function (p) { return soma(ci, p[0], p[1])[m]; }) }; });
    var max = 0;
    series.forEach(function (x) { x.v.forEach(function (v) { if (v > max) max = v; }); });
    var passo = passoBonito(max || 1, 4), topo = Math.ceil((max || 1) / passo) * passo;
    var E = W < 500 ? 56 : 66, D = 12, T = 10, B = 26, x = function (i) { return pts.length < 2 ? E : E + i * (W - E - D) / (pts.length - 1); }, y = function (v) { return T + (H - T - B) * (1 - v / topo); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', tabindex: 0, 'aria-label': MET[m].nome + ' por campanha, de ' + curta(f[0]) + ' a ' + curta(f[1]) + '. Os valores totais estão na tabela abaixo. Use as setas para ler cada ponto.' });
    for (var g = 0; g <= topo + passo / 2; g += passo) {
      svg.append(s('line', { x1: E, x2: W - D, y1: y(g), y2: y(g), stroke: '#dfe3da', 'stroke-width': 1 }));
      svg.append(s('text', { x: E - 8, y: y(g) + 4, 'text-anchor': 'end', 'font-size': 12, fill: '#46534a' }, MET[m].eixo(g)));
    }
    var nx = W < 500 ? 3 : 6;
    for (var t = 0; t < nx; t++) {
      var ix = Math.round(t * (pts.length - 1) / Math.max(1, nx - 1));
      svg.append(s('text', { x: x(ix), y: H - 7, 'text-anchor': t === 0 ? 'start' : t === nx - 1 ? 'end' : 'middle', 'font-size': 12, fill: '#46534a' }, curta(pts[ix][0])));
    }
    series.forEach(function (sr) {
      var d = sr.v.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
      svg.append(s('path', { d: d, fill: 'none', stroke: CAMP[sr.ci].cor, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    });
    var cruz = s('line', { x1: 0, x2: 0, y1: T, y2: H - B, stroke: '#18211c', 'stroke-width': 1, visibility: 'hidden' });
    svg.append(cruz);
    var pontos = series.map(function (sr) { var c = s('circle', { r: 4, fill: CAMP[sr.ci].cor, stroke: '#fcfcfb', 'stroke-width': 2, visibility: 'hidden' }); svg.append(c); return c; });
    function marcar(i, px, py) {
      cruz.setAttribute('x1', x(i)); cruz.setAttribute('x2', x(i)); cruz.setAttribute('visibility', 'visible');
      pontos.forEach(function (c, k) { c.setAttribute('cx', x(i)); c.setAttribute('cy', y(series[k].v[i])); c.setAttribute('visibility', 'visible'); });
      var tit = bloco > 1 ? 'Semana de ' + curta(pts[i][0]) : deNum(pts[i][0]).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      dica(tit, series.map(function (sr) { return { cor: CAMP[sr.ci].cor, valor: MET[m].fmt(sr.v[i]), nome: CAMP[sr.ci].nome }; }), px, py);
      linhaEstado.i = i;
    }
    function apagar() { cruz.setAttribute('visibility', 'hidden'); pontos.forEach(function (c) { c.setAttribute('visibility', 'hidden'); }); semDica(); }
    linhaEstado = { i: null };
    function indice(ev) {
      var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
      return Math.max(0, Math.min(pts.length - 1, Math.round((px - E) / Math.max(1, (W - E - D)) * (pts.length - 1))));
    }
    svg.addEventListener('pointermove', function (ev) { marcar(indice(ev), ev.clientX, ev.clientY); });
    svg.addEventListener('pointerdown', function (ev) { marcar(indice(ev), ev.clientX, ev.clientY); });
    svg.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') apagar(); });
    svg.addEventListener('blur', apagar);
    svg.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (ev.key === 'Escape') { apagar(); return; }
      if (!d) return;
      ev.preventDefault();
      var i = linhaEstado.i === null ? (d > 0 ? 0 : pts.length - 1) : Math.max(0, Math.min(pts.length - 1, linhaEstado.i + d));
      var r = svg.getBoundingClientRect();
      marcar(i, r.left + x(i) * r.width / W, r.top + 30);
    });
    cx.append(svg);
  }

  /* Barras horizontais. Nome em cima da barra, assim cabe também em 320 px. */
  function desenharBarras(idCx, chave, fmt, ordemDesc, ref, refNome) {
    var cx = $(idCx), W = Math.max(240, cx.clientWidth || 400), f = faixa();
    var linhas = ativasIdx().map(function (ci) { var t = derivar(soma(ci, f[0], f[1])); return { ci: ci, v: t[chave] }; });
    cx.textContent = '';
    if (!linhas.length) { cx.append(h('p', { class: 'sub', text: 'Marque ao menos uma campanha para ver o gráfico.' })); return; }
    linhas.sort(function (a, b) { var A = a.v === null ? Infinity : a.v, B = b.v === null ? Infinity : b.v; return ordemDesc ? B - A : A - B; });
    var ROW = 50, B = ref ? 22 : 4, H = linhas.length * ROW + B, E = 0, D = 8;
    var max = Math.max.apply(null, linhas.map(function (l) { return l.v === null ? 0 : l.v; }).concat(ref || 0)) || 1;
    /* reserva espaço para o valor na ponta da barra */
    var larg = W - E - D - 76, x = function (v) { return E + v / max * larg; };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'group', 'aria-label': 'Barras por campanha' });
    linhas.forEach(function (l, i) {
      var c = CAMP[l.ci], yb = i * ROW + 22, alt = 18, wv = l.v === null ? 0 : Math.max(2, x(l.v) - E);
      var g = s('g', { class: 'barra', tabindex: 0, role: 'img', 'aria-label': c.nome + ': ' + fmt(l.v) });
      g.append(s('rect', { class: 'fundo-foco', x: 0, y: yb - 20, width: W, height: ROW - 2, fill: 'transparent' }));
      g.append(s('text', { x: E, y: yb - 5, 'font-size': 13, fill: '#18211c' }, c.nome));
      if (l.v !== null) {
        var r = Math.min(4, wv);
        g.append(s('path', { class: 'marca', fill: c.cor, d: 'M' + E + ' ' + yb + 'h' + (wv - r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + (alt - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 -' + r + ' ' + r + 'h-' + (wv - r) + 'z' }));
      }
      var xv = E + wv + 6;
      if (ref && xv < x(ref) + 4 && xv + 44 > x(ref)) xv = x(ref) + 6;
      g.append(s('text', { x: xv, y: yb + 14, 'font-size': 13, 'font-weight': 600, fill: '#18211c' }, fmt(l.v)));
      function ver(ev) { dica(c.nome, [{ cor: c.cor, valor: fmt(l.v), nome: chave.toUpperCase() }], ev.clientX, ev.clientY); }
      g.addEventListener('pointermove', ver);
      g.addEventListener('pointerdown', ver);
      g.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') semDica(); });
      g.addEventListener('focus', function () { var q = g.getBoundingClientRect(); dica(c.nome, [{ cor: c.cor, valor: fmt(l.v), nome: chave.toUpperCase() }], q.left + 40, q.top + 6); });
      g.addEventListener('blur', semDica);
      svg.append(g);
    });
    if (ref) {
      /* a marca de referência passa só pelas faixas das barras, nunca por cima dos nomes */
      linhas.forEach(function (l, i) { var yb = i * ROW + 22; svg.append(s('line', { x1: x(ref), x2: x(ref), y1: yb - 3, y2: yb + 21, stroke: '#18211c', 'stroke-width': 1.5 })); });
      svg.append(s('text', { x: x(ref), y: H - 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#46534a' }, refNome));
    }
    cx.append(svg);
  }

  function desenharTabela() {
    var f = faixa(), tb = $('tabela'), lin = ativasIdx().map(function (ci) { var t = derivar(soma(ci, f[0], f[1])); t.nome = CAMP[ci].nome; t.ci = ci; return t; });
    lin.sort(function (a, b) {
      var A = a[P.ordem], B = b[P.ordem];
      if (typeof A === 'string') return A.localeCompare(B, 'pt-BR') * P.sentido;
      if (A === null) A = Infinity; if (B === null) B = Infinity;
      return (A - B) * P.sentido;
    });
    tb.textContent = '';
    tb.append(h('caption', { class: 'so-leitor', text: 'Resultados simulados por campanha' }));
    var tr = h('tr');
    COLS.forEach(function (c) {
      var ord = P.ordem === c.k;
      tr.append(h('th', { scope: 'col', 'aria-sort': ord ? (P.sentido > 0 ? 'ascending' : 'descending') : null }, h('button', { type: 'button', 'data-col': c.k, text: c.t + (ord ? (P.sentido > 0 ? ' \u2191' : ' \u2193') : ''), onclick: function () {
        if (P.ordem === c.k) P.sentido = -P.sentido; else { P.ordem = c.k; P.sentido = c.k === 'nome' ? 1 : -1; }
        salvar(); desenharTabela();
        var n = document.querySelector('[data-col="' + c.k + '"]'); if (n) n.focus();
      } })));
    });
    tb.append(h('thead', {}, tr));
    var body = h('tbody');
    lin.forEach(function (l) {
      var r = h('tr', { 'data-camp': CAMP[l.ci].id });
      COLS.forEach(function (c) {
        if (c.k === 'nome') r.append(h('td', {}, h('span', { class: 'nome-c' }, h('i', { class: CAMP[l.ci].c }), h('span', { text: l.nome }))));
        else r.append(h('td', { class: c.k === 'roas' && l.roas < 1 ? 'alerta' : null, text: c.f(l[c.k]) }));
      });
      body.append(r);
    });
    tb.append(body);
    if (lin.length) {
      var t = total(f[0], f[1]), rf = h('tr');
      COLS.forEach(function (c) { rf.append(h('td', { text: c.k === 'nome' ? 'Total do período' : c.f(t[c.k]) })); });
      tb.append(h('tfoot', {}, rf));
    }
  }

  /* Calculadora */
  var CAMPOS = { verba: 'c-verba', cpc: 'c-cpc', tx: 'c-tx', ticket: 'c-ticket', meta: 'c-meta' };
  function preencherCalc() { for (var k in CAMPOS) $(CAMPOS[k]).value = P.calc[k]; }
  function calcular() {
    var v = {}, ruim = false, k;
    for (k in CAMPOS) { v[k] = Number($(CAMPOS[k]).value); if (!$(CAMPOS[k]).value || !(v[k] > 0)) ruim = true; }
    var res = $('c-res'), err = $('c-erro');
    res.textContent = '';
    if (ruim) { err.textContent = 'Preencha todos os campos com números maiores que zero.'; return; }
    err.textContent = '';
    P.calc = v; salvar();
    var cliques = v.verba / v.cpc, vendas = cliques * v.tx / 100, receita = vendas * v.ticket;
    var cpa = vendas ? v.verba / vendas : 0, necess = v.meta * v.cpc / (v.tx / 100);
    [['Cliques por mês', inteiro(cliques), 'r-cliques'], ['Vendas por mês', vendas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), 'r-vendas'], ['CPA estimado', moeda2(cpa), 'r-cpa'], ['Receita estimada', moeda0(receita), 'r-receita'], ['ROAS estimado', vezes(receita / v.verba), 'r-roas'], ['Verba para a meta', moeda0(necess), 'r-necess']].forEach(function (x) {
      res.append(h('dt', { text: x[0] }), h('dd', { id: x[2], text: x[1] }));
    });
  }
  function usarMedias() {
    var f = faixa(), t = total(f[0], f[1]);
    if (!t.cliques || !t.conv) { $('c-erro').textContent = 'O período escolhido não tem vendas simuladas para tirar a média.'; return; }
    P.calc.cpc = +t.cpc.toFixed(2);
    P.calc.tx = +(t.conv / t.cliques * 100).toFixed(2);
    P.calc.ticket = Math.round(t.receita / t.conv);
    preencherCalc(); calcular();
    $('aviso').textContent = 'Calculadora preenchida com as médias do período.';
  }

  function desenharDados() {
    desenharFrase(); desenharKpis(); desenharLinha();
    desenharBarras('g-roas', 'roas', vezes, true, 1, 'Empate em 1x');
    desenharBarras('g-cpa', 'cpa', moedaOuNada, false, null);
    desenharTabela();
  }
  function tudo() { semDica(); desenharPeriodos(); desenharDados(); }

  $('de').addEventListener('change', aoMudarData);
  $('ate').addEventListener('change', aoMudarData);
  $('metrica').addEventListener('change', function () { P.metrica = this.value; salvar(); desenharLinha(); });
  $('form-calc').addEventListener('input', calcular);
  $('form-calc').addEventListener('submit', function (e) { e.preventDefault(); calcular(); });
  $('usar-medias').addEventListener('click', usarMedias);
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    P = clone(PADRAO);
    $('metrica').value = P.metrica; $('erro-data').textContent = ''; $('c-erro').textContent = '';
    preencherCalc(); calcular(); desenharLegenda(); tudo();
    $('aviso').textContent = 'Dados de exemplo restaurados.';
  });
  document.addEventListener('pointerdown', function (ev) { if (!ev.target.closest || !ev.target.closest('.grafico')) semDica(); });
  var ultimaL = 0, pend = 0;
  if (window.ResizeObserver) {
    new ResizeObserver(function (en) {
      var w = Math.round(en[0].contentRect.width);
      if (w === ultimaL) return;
      ultimaL = w;
      cancelAnimationFrame(pend);
      pend = requestAnimationFrame(function () { desenharLinha(); desenharBarras('g-roas', 'roas', vezes, true, 1, 'Empate em 1x'); desenharBarras('g-cpa', 'cpa', moedaOuNada, false, null); });
    }).observe($('g-linha'));
  }
  $('metrica').value = P.metrica;
  preencherCalc(); calcular(); desenharLegenda(); tudo();
})();
