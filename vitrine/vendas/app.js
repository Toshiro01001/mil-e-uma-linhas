/* Empório Chapada. Painel de vendas de demonstração.
   As vendas são inventadas aqui mesmo, no navegador, a partir de uma semente fixa: quem abrir hoje vê os mesmos números.
   O que a pessoa marca (pedido ao fornecedor, mercadoria recebida, pedido despachado) fica só no localStorage deste aparelho. */
(function () {
  'use strict';

  var CHAVE = 'emporio-chapada-v1';
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  var PRODUTOS = [
    { id: 'cafe', nome: 'Café do cerrado 250 g', preco: 38, peso: 14, estoque: 7, minimo: 12 },
    { id: 'doce', nome: 'Doce de leite com castanha', preco: 29, peso: 13, estoque: 31, minimo: 10 },
    { id: 'mel', nome: 'Mel de aroeira 300 g', preco: 46, peso: 9, estoque: 4, minimo: 10 },
    { id: 'farofa', nome: 'Farofa de banana da terra', preco: 22, peso: 11, estoque: 26, minimo: 10 },
    { id: 'castanha', nome: 'Castanha-do-brasil 500 g', preco: 54, peso: 6, estoque: 18, minimo: 8 },
    { id: 'buriti', nome: 'Doce de buriti', preco: 26, peso: 6, estoque: 2, minimo: 8 },
    { id: 'rapadura', nome: 'Rapadura de gengibre', preco: 12, peso: 9, estoque: 44, minimo: 15 },
    { id: 'pacoca', nome: 'Paçoca de pilão', preco: 18, peso: 8, estoque: 37, minimo: 12 },
    { id: 'geleia', nome: 'Geleia de pequi', preco: 32, peso: 7, estoque: 15, minimo: 8 },
    { id: 'cesta', nome: 'Cesta Chapada (presente)', preco: 189, peso: 2, estoque: 9, minimo: 4 }
  ];
  var CANAIS = [
    { id: 'loja', nome: 'Loja física', peso: 46 },
    { id: 'site', nome: 'Site', peso: 24 },
    { id: 'whats', nome: 'WhatsApp', peso: 21 },
    { id: 'insta', nome: 'Instagram', peso: 9 }
  ];
  var CIDADES = ['Cuiabá', 'Cuiabá', 'Cuiabá', 'Várzea Grande', 'Várzea Grande', 'Chapada dos Guimarães', 'Rondonópolis', 'Sinop', 'Tangará da Serra'];
  var ENVIO = { 'Cuiabá': 'motoboy', 'Várzea Grande': 'motoboy', 'Chapada dos Guimarães': 'transportadora' };

  /* ---------- utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'texto') n.textContent = attrs[k];
      else if (k === 'classe') n.className = attrs[k];
      else if (k === 'aoClicar') n.addEventListener('click', attrs[k]);
      else if (k === 'estilo') Object.keys(attrs[k]).forEach(function (p) { n.style[p] = attrs[k][p]; });
      else n.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var f = arguments[i];
      if (f == null) continue;
      n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
    }
    return n;
  }
  function limpar(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  var fmtR = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var fmtC = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var fmtN = new Intl.NumberFormat('pt-BR');
  var fmtP = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  function reais(v) { return fmtR.format(v).replace(/ /g, ' '); }
  function centavos(v) { return fmtC.format(v).replace(/ /g, ' '); }
  function diaIni(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function somaDias(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function doisDig(n) { return (n < 10 ? '0' : '') + n; }
  function hora(d) { return doisDig(d.getHours()) + 'h' + doisDig(d.getMinutes()); }
  function dataCurta(d) { return doisDig(d.getDate()) + '/' + doisDig(d.getMonth() + 1); }
  function avisar(t) { var a = $('aviso'); a.textContent = ''; setTimeout(function () { a.textContent = t; }, 30); }

  /* Gerador com semente fixa (mulberry32): mesmos números em qualquer aparelho. */
  function semente(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sortear(lista, r) {
    var total = 0, i; for (i = 0; i < lista.length; i++) total += lista[i].peso;
    var x = r() * total; for (i = 0; i < lista.length; i++) { x -= lista[i].peso; if (x <= 0) return lista[i]; }
    return lista[lista.length - 1];
  }

  /* ---------- vendas inventadas: dois anos até agora ---------- */
  var AGORA = new Date();
  var HOJE = diaIni(AGORA);
  var PEDIDOS = (function gerar() {
    var r = semente(1001), lista = [], numero = 10000, clientes = 0;
    var ritmoMes = [0.72, 0.7, 0.85, 0.9, 0.95, 1.12, 1.15, 0.98, 0.95, 1.0, 1.1, 1.48];
    var ritmoSemana = [0.55, 0.95, 0.9, 0.95, 1.05, 1.25, 1.55];
    var inicio = somaDias(HOJE, -760);
    for (var d = 0; d <= 760; d++) {
      var dia = somaDias(inicio, d);
      var crescimento = 0.82 + 0.18 * (d / 760);
      var n = Math.round(17 * ritmoMes[dia.getMonth()] * ritmoSemana[dia.getDay()] * crescimento * (0.8 + 0.4 * r()));
      for (var k = 0; k < n; k++) {
        var canal = sortear(CANAIS, r);
        var h = canal.id === 'loja' ? 8 + Math.floor(r() * 11) : 7 + Math.floor(r() * 15);
        var quando = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, Math.floor(r() * 60));
        var itens = [], qtdItens = 1 + Math.floor(r() * r() * 4), total = 0;
        for (var j = 0; j < qtdItens; j++) {
          var p = sortear(PRODUTOS, r), q = r() < 0.75 ? 1 : 2;
          itens.push({ p: p.id, q: q, v: p.preco * q }); total += p.preco * q;
        }
        var cliente = clientes === 0 || r() < 0.3 ? ++clientes : 1 + Math.floor(Math.pow(r(), 1.6) * clientes);
        numero++;
        if (quando > AGORA) continue; // hoje, só o que já aconteceu
        lista.push({ n: numero, quando: quando, canal: canal.id, itens: itens, total: total, cliente: cliente, cidade: CIDADES[Math.floor(r() * CIDADES.length)] });
      }
    }
    return lista;
  })();
  var PRIMEIRA = {};
  PEDIDOS.forEach(function (p) { if (!PRIMEIRA[p.cliente]) PRIMEIRA[p.cliente] = p.quando; });

  function entre(a, b) { return PEDIDOS.filter(function (p) { return p.quando >= a && p.quando < b; }); }
  function soma(lista) { return lista.reduce(function (s, p) { return s + p.total; }, 0); }

  /* ---------- o que a pessoa marcou ---------- */
  function ler() {
    try { var d = JSON.parse(localStorage.getItem(CHAVE)); if (d && typeof d === 'object') return d; } catch (e) { /* janela privada */ }
    return {};
  }
  var E = ler();
  E.recebidos = Array.isArray(E.recebidos) ? E.recebidos : [];
  E.despachados = Array.isArray(E.despachados) ? E.despachados : [];
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* segue só na memória */ } }

  /* ---------- períodos ---------- */
  var periodo = 'mes';
  function intervalo(qual) {
    var amanha = somaDias(HOJE, 1), ini, prevIni, prevFim, rotulo, comp;
    if (qual === 'hoje') {
      ini = HOJE; prevIni = somaDias(HOJE, -1); prevFim = new Date(AGORA.getTime() - 864e5);
      rotulo = 'Faturamento de hoje'; comp = 'ontem, até esta hora';
    } else if (qual === '7d') {
      ini = somaDias(HOJE, -6); prevIni = somaDias(HOJE, -13); prevFim = ini;
      rotulo = 'Faturamento dos últimos 7 dias'; comp = 'os 7 dias anteriores';
    } else if (qual === '12m') {
      ini = new Date(HOJE.getFullYear(), HOJE.getMonth() - 11, 1); prevIni = new Date(HOJE.getFullYear(), HOJE.getMonth() - 23, 1); prevFim = ini;
      rotulo = 'Faturamento dos últimos 12 meses'; comp = 'os 12 meses anteriores';
    } else {
      ini = new Date(HOJE.getFullYear(), HOJE.getMonth(), 1); prevIni = new Date(HOJE.getFullYear(), HOJE.getMonth() - 1, 1);
      prevFim = new Date(HOJE.getFullYear(), HOJE.getMonth() - 1, Math.min(HOJE.getDate() + 1, diasNoMes(prevIni) + 1));
      rotulo = 'Faturamento de ' + MESES[HOJE.getMonth()]; comp = MESES[prevIni.getMonth()] + ' (até o dia ' + HOJE.getDate() + ')';
    }
    return { ini: ini, fim: amanha, prevIni: prevIni, prevFim: prevFim, rotulo: rotulo, comp: comp };
  }
  function diasNoMes(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
  var NOME_PERIODO = { hoje: 'de hoje', '7d': 'dos últimos 7 dias', mes: 'do mês', '12m': 'dos últimos 12 meses' };

  /* ---------- desenho ---------- */
  function desenharFaturamento() {
    var I = intervalo(periodo), lista = entre(I.ini, I.fim), total = soma(lista), antes = soma(entre(I.prevIni, I.prevFim));
    $('fat-rot').textContent = I.rotulo;
    $('fat-valor').textContent = reais(total);
    var ticket = lista.length ? total / lista.length : 0;
    limpar($('fat-sub')).append(fmtN.format(lista.length) + ' pedidos · ticket médio ', el('b', { classe: 'num', texto: centavos(ticket) }));
    var v = antes ? (total - antes) / antes * 100 : 0;
    $('fat-comp').textContent = (v >= 0 ? '+' : '−') + fmtP.format(Math.abs(v)) + '% sobre ' + I.comp;
    var meta = $('meta');
    if (periodo === 'mes') {
      var mesPassado = soma(entre(new Date(HOJE.getFullYear(), HOJE.getMonth() - 1, 1), new Date(HOJE.getFullYear(), HOJE.getMonth(), 1)));
      var alvo = Math.round(mesPassado * 1.1 / 1000) * 1000, pct = alvo ? Math.min(100, total / alvo * 100) : 0;
      $('meta-i').style.width = pct.toFixed(1) + '%';
      $('meta-barra').setAttribute('aria-valuenow', Math.round(pct));
      $('meta-barra').hidden = false;
      $('meta-txt').textContent = 'Meta do mês: ' + reais(alvo) + ' (10% acima de ' + MESES[(HOJE.getMonth() + 11) % 12] + ')';
      $('meta-pct').textContent = Math.round(pct) + '%';
    } else {
      var dias = Math.max(1, Math.round((Math.min(I.fim, AGORA) - I.ini) / 864e5));
      $('meta-barra').hidden = true;
      $('meta-txt').textContent = periodo === 'hoje' ? 'Último pedido às ' + (lista.length ? hora(lista[lista.length - 1].quando) : '--') : 'Média por dia';
      $('meta-pct').textContent = periodo === 'hoje' ? '' : reais(total / dias);
    }
    meta.hidden = false;
  }

  function desenharHoje() {
    var lista = entre(HOJE, somaDias(HOJE, 1)), total = soma(lista);
    $('hoje-qtd').textContent = fmtN.format(lista.length);
    var doSite = lista.filter(function (p) { return p.canal === 'site'; }).length;
    $('hoje-sub').textContent = 'até ' + hora(AGORA) + ' · ' + doSite + ' pelo site';
    $('hoje-valor').textContent = reais(total);
    $('hoje-ticket').textContent = reais(lista.length ? total / lista.length : 0);
  }

  function desenharEstoque() {
    var baixos = PRODUTOS.filter(function (p) { return p.estoque < p.minimo && E.recebidos.indexOf(p.id) < 0; });
    var ul = limpar($('est-lista')), pedido = E.pedidoFornecedor;
    baixos.forEach(function (p) {
      var li = el('li', null, el('span', null, p.nome, el('small', { texto: 'mínimo ' + p.minimo + ' un.' })), el('span', { classe: 'pill', texto: p.estoque + ' un.' }));
      if (pedido) li.appendChild(el('button', { type: 'button', classe: 'mini', 'aria-label': 'Chegou ' + p.nome, texto: 'Chegou', aoClicar: function () { receber(p); } }));
      ul.appendChild(li);
    });
    var tile = $('est-lista').closest('.t');
    tile.classList.toggle('ok', baixos.length === 0);
    $('est-tit').textContent = baixos.length ? baixos.length + (baixos.length === 1 ? ' produto acabando' : ' produtos acabando') : 'Estoque em dia';
    $('est-vazio').hidden = baixos.length > 0;
    $('est-pedir').hidden = baixos.length === 0;
    $('est-pedir').disabled = !!pedido;
    $('est-pedir').textContent = pedido ? 'Pedido feito ao fornecedor' : 'Fazer pedido ao fornecedor';
    var nota = $('est-nota');
    nota.hidden = !pedido || baixos.length === 0;
    if (pedido) nota.textContent = 'Pedido registrado em ' + pedido + '. Marque "Chegou" quando a mercadoria entrar. (Simulação: nada é enviado.)';
  }
  function receber(p) {
    E.recebidos.push(p.id);
    var restantes = PRODUTOS.filter(function (x) { return x.estoque < x.minimo && E.recebidos.indexOf(x.id) < 0; });
    if (!restantes.length) delete E.pedidoFornecedor;
    gravar(); desenharEstoque(); avisar(p.nome + ': estoque reposto.');
    var prox = document.querySelector('#est-lista .mini') || $('est-tit'); if (prox.focus) prox.focus();
  }

  var mesEscolhido = 11;
  function desenharAno() {
    var meses = [];
    for (var i = 11; i >= 0; i--) {
      var a = new Date(HOJE.getFullYear(), HOJE.getMonth() - i, 1), b = new Date(HOJE.getFullYear(), HOJE.getMonth() - i + 1, 1), l = entre(a, b);
      meses.push({ ini: a, total: soma(l), qtd: l.length, atual: i === 0 });
    }
    var max = Math.max.apply(null, meses.map(function (m) { return m.total; })) || 1;
    var pico = meses.reduce(function (x, m) { return m.total > x.total ? m : x; });
    $('ano-chip').textContent = 'pico: ' + MESES[pico.ini.getMonth()];
    var box = limpar($('barras'));
    meses.forEach(function (m, i) {
      var nome = MESES[m.ini.getMonth()] + ' de ' + m.ini.getFullYear();
      box.appendChild(el('button', { type: 'button', role: 'listitem', 'aria-pressed': String(i === mesEscolhido), 'aria-label': nome + ': ' + reais(m.total) + (m.atual ? ', até hoje' : ''),
        aoClicar: function () { mesEscolhido = i; desenharAno(); } },
        el('span', { estilo: { height: Math.max(4, Math.round(m.total / max * 100)) + '%' } }), el('small', { texto: MES_CURTO[m.ini.getMonth()] })));
    });
    var m = meses[mesEscolhido];
    $('ano-detalhe').textContent = MESES[m.ini.getMonth()] + ' de ' + m.ini.getFullYear() + ': ' + reais(m.total) + ' em ' + fmtN.format(m.qtd) + ' pedidos' + (m.atual ? ' (até hoje)' : '');
  }

  function desenharTop() {
    var I = intervalo(periodo), conta = {};
    entre(I.ini, I.fim).forEach(function (p) { p.itens.forEach(function (it) { conta[it.p] = (conta[it.p] || 0) + it.v; }); });
    var lista = PRODUTOS.map(function (p) { return { nome: p.nome, v: conta[p.id] || 0 }; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 5);
    $('top-rot').textContent = 'Mais vendidos ' + NOME_PERIODO[periodo];
    var ol = limpar($('top')), max = lista[0] && lista[0].v || 1;
    lista.forEach(function (x) {
      ol.appendChild(el('li', null, el('span', { texto: x.nome }), el('b', { classe: 'num', texto: reais(x.v) }),
        el('span', { classe: 'b', 'aria-hidden': 'true' }, el('i', { estilo: { width: Math.round(x.v / max * 100) + '%' } }))));
    });
  }

  function desenharCalendario() {
    var ini = new Date(HOJE.getFullYear(), HOJE.getMonth(), 1), n = diasNoMes(ini), totais = [];
    for (var d = 1; d <= n; d++) { var a = new Date(ini.getFullYear(), ini.getMonth(), d); totais.push(a <= HOJE ? soma(entre(a, somaDias(a, 1))) : null); }
    var feitos = totais.filter(function (v) { return v !== null; }).slice().sort(function (a, b) { return a - b; });
    function corte(q) { return feitos[Math.floor((feitos.length - 1) * q)] || 0; }
    var c1 = corte(0.34), c2 = corte(0.67);
    $('cal-tit').textContent = MESES[HOJE.getMonth()].charAt(0).toUpperCase() + MESES[HOJE.getMonth()].slice(1);
    var box = limpar($('cal'));
    SEMANA.forEach(function (s) { box.appendChild(el('b', { 'aria-hidden': 'true', texto: s })); });
    for (var v = 0; v < ini.getDay(); v++) box.appendChild(el('i', { 'aria-hidden': 'true' }));
    totais.forEach(function (t, i) {
      var dia = i + 1, data = new Date(ini.getFullYear(), ini.getMonth(), dia), futuro = t === null;
      var cls = futuro ? '' : t <= c1 ? 'v1' : t <= c2 ? 'v2' : 'v3';
      if (dia === HOJE.getDate()) cls += ' hoje';
      var b = el('button', { type: 'button', classe: cls.trim(), 'aria-label': dataCurta(data) + (futuro ? ', ainda não chegou' : ': ' + reais(t)) });
      if (futuro) b.disabled = true;
      else b.addEventListener('click', function () {
        var l = entre(data, somaDias(data, 1));
        $('cal-detalhe').textContent = dataCurta(data) + ': ' + reais(t) + ' em ' + l.length + ' pedidos' + (dia === HOJE.getDate() ? ' (até agora)' : '');
      });
      box.appendChild(b);
    });
  }

  function desenharCanais() {
    var I = intervalo(periodo), lista = entre(I.ini, I.fim), total = lista.length || 1;
    $('can-rot').textContent = 'De onde vêm os pedidos ' + NOME_PERIODO[periodo];
    var box = limpar($('canais'));
    CANAIS.forEach(function (c) {
      var pct = Math.round(lista.filter(function (p) { return p.canal === c.id; }).length / total * 100);
      box.appendChild(el('div', null, el('span', { classe: 'nome', texto: c.nome }), el('span', { classe: 'barra', 'aria-hidden': 'true' }, el('i', { estilo: { width: pct + '%' } })), el('b', { classe: 'num', texto: pct + '%' })));
    });
  }

  function desenharClientes() {
    var I = intervalo(periodo), vistos = {}, novos = 0, volta = 0;
    entre(I.ini, I.fim).forEach(function (p) {
      if (vistos[p.cliente]) return; vistos[p.cliente] = 1;
      if (PRIMEIRA[p.cliente] >= I.ini) novos++; else volta++;
    });
    $('cli-rot').textContent = 'Clientes ' + NOME_PERIODO[periodo];
    $('cli-volta').textContent = fmtN.format(volta);
    $('cli-novos').textContent = fmtN.format(novos);
  }

  function desenharDespacho() {
    var limite = somaDias(HOJE, -1);
    var lista = PEDIDOS.filter(function (p) { return p.canal !== 'loja' && p.quando >= limite && E.despachados.indexOf(p.n) < 0; }).slice(-5).reverse();
    var ul = limpar($('desp-lista'));
    lista.forEach(function (p) {
      var envio = ENVIO[p.cidade] || 'Correios';
      ul.appendChild(el('li', null,
        el('span', null, '#' + p.n + ' · ' + p.cidade, el('small', { texto: reais(p.total) + ' · ' + envio + ' · ' + (CANAIS.filter(function (c) { return c.id === p.canal; })[0].nome) })),
        el('button', { type: 'button', classe: 'mini', 'aria-label': 'Marcar o pedido ' + p.n + ' como despachado', texto: 'Despachado', aoClicar: function () {
          E.despachados.push(p.n); gravar(); desenharDespacho(); avisar('Pedido ' + p.n + ' despachado.');
          var prox = document.querySelector('#desp-lista .mini') || $('desp-tit'); if (prox.focus) prox.focus();
        } })));
    });
    $('desp-tit').textContent = lista.length ? lista.length + (lista.length === 1 ? ' pedido para despachar' : ' pedidos para despachar') : 'Pedidos do site';
    $('desp-vazio').hidden = lista.length > 0;
  }

  function desenharPeriodo() {
    document.querySelectorAll('.periodo button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.periodo === periodo)); });
    desenharFaturamento(); desenharTop(); desenharCanais(); desenharClientes();
  }
  function tudo() { desenharPeriodo(); desenharHoje(); desenharEstoque(); desenharAno(); desenharCalendario(); desenharDespacho(); }

  /* ---------- eventos ---------- */
  document.querySelectorAll('.periodo button').forEach(function (b) {
    b.addEventListener('click', function () { periodo = b.dataset.periodo; desenharPeriodo(); avisar('Mostrando ' + b.textContent.toLowerCase() + '.'); });
  });
  $('est-pedir').addEventListener('click', function () {
    E.pedidoFornecedor = dataCurta(AGORA) + ' às ' + hora(AGORA); gravar(); desenharEstoque(); avisar('Pedido ao fornecedor registrado.');
  });
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    E = { recebidos: [], despachados: [] }; periodo = 'mes'; mesEscolhido = 11; tudo();
    $('cal-detalhe').textContent = 'Toque num dia para ver o total.';
    avisar('Dados de exemplo restaurados.');
  });

  tudo();
})();
