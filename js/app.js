/* Mil e Uma Linhas!  Abas, logo em ASCII, números de linha e terminal.
   Nada aqui envia dados: o site não faz nenhuma requisição além dos próprios arquivos. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ABAS = ['inicio', 'servicos', 'projetos', 'demos', 'linguagens', 'orcamento', 'contato'];
  var ROTULO = { inicio: '1:início', servicos: '2:serviços', projetos: '3:projetos', demos: '4:demos', linguagens: '5:linguagens', orcamento: '6:orçamento', contato: '7:contato' };
  var main = $('main');
  var calha = $('.calha');
  var abaAtual = null;

  function temaAscii() { return document.documentElement.getAttribute('data-tema') === 'ascii'; }

  /* ---------- abas e endereço ---------- */
  function rota() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h === 'conteudo') h = 'inicio';
    var p = h.split('/');
    return { aba: ABAS.indexOf(p[0]) >= 0 ? p[0] : 'inicio', sub: (p[1] || '').replace(/[^a-z-]/g, '') };
  }

  function aplicarRota(foco) {
    var r = rota();
    var mudou = r.aba !== abaAtual;
    abaAtual = r.aba;
    $$('.folha').forEach(function (f) { f.classList.toggle('ativa', f.id === r.aba); });
    $$('.abas nav a').forEach(function (a) {
      if (a.dataset.aba === r.aba) { a.setAttribute('aria-current', 'page'); if (a.scrollIntoView && a.parentNode.scrollWidth > a.parentNode.clientWidth) a.parentNode.scrollLeft = a.offsetLeft - 40; } else a.removeAttribute('aria-current');
    });
    $('#st-aba').textContent = ROTULO[r.aba];
    if (r.aba === 'servicos') abrirServico(r.sub || servicoAtual);
    if (r.aba === 'demos') abrirDemo(r.sub || demoAtual);
    if (r.aba === 'projetos' && r.sub) abrirProjeto(r.sub);
    if (mudou) {
      main.scrollTop = 0;
      document.title = (r.aba === 'inicio' ? '' : tituloDa(r.aba) + ' | ') + (r.aba === 'inicio' ? 'Sites e sistemas para todo o Brasil | ' : '') + 'Mil e Uma Linhas!';
      if (foco) { var t = Array.prototype.filter.call(document.querySelectorAll('#' + r.aba + ' h2'), function (x) { return x.offsetParent; })[0]; if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }
    }
    if (window.MUL_ORC && r.aba === 'orcamento') window.MUL_ORC.rota(r.sub);
    if (window.MUL_GUIA && r.aba === 'linguagens') window.MUL_GUIA.abrir(r.sub);
    if (r.aba === 'inicio' && temaAscii()) campo.mostrar(); else campo.parar();
    if (r.aba === 'contato' && temaAscii()) iniciarObra(); else pararObra();
    if (r.aba === 'contato' && r.sub === 'dados') { var dd = document.getElementById('dados'); if (dd) setTimeout(function () { dd.setAttribute('tabindex', '-1'); dd.scrollIntoView({ block: 'start' }); dd.focus({ preventScroll: true }); }, 30); }
    numerar();
    atualizarLinha();
  }
  function tituloDa(a) { return ROTULO[a].split(':')[1].replace(/^./, function (c) { return c.toUpperCase(); }); }

  /* ---------- serviços ---------- */
  var servicoAtual = 'sites';
  function abrirServico(id) {
    if (!$('.painel[data-svc="' + id + '"]')) id = 'sites';
    servicoAtual = id;
    $$('.arvore button').forEach(function (b) {
      var on = b.dataset.svc === id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    $$('.painel').forEach(function (p) { p.classList.toggle('ativo', p.dataset.svc === id); });
    numerar();
  }
  $$('.arvore button').forEach(function (b) {
    b.addEventListener('click', function () { abrirServico(b.dataset.svc); history.replaceState(null, '', '#servicos/' + b.dataset.svc); });
  });
  setasEmTabs($('.arvore'), 'button');

  /* ---------- projetos ---------- */
  function abrirProjeto(id) {
    var g = $('#projetos [data-grupo="' + id + '"]');
    if (g) { setTimeout(function () { g.scrollIntoView({ block: 'start' }); }, 30); return true; }
    var d = $('details[data-proj="' + id + '"]');
    if (!d) return false;
    d.open = true;
    numerar();
    setTimeout(function () { d.scrollIntoView({ block: 'nearest' }); }, 30);
    return true;
  }
  $$('.lista details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      // navegadores sem o atributo name fecham os outros aqui
      if (d.open) $$('.lista details').forEach(function (o) { if (o !== d) o.open = false; });
      numerar();
    });
  });

  /* ---------- demos ---------- */
  var demoAtual = 'pedidos';
  function abrirDemo(id) {
    if (!$('.demo[data-demo="' + id + '"]')) id = 'pedidos';
    demoAtual = id;
    $$('.demo-abas button').forEach(function (b) {
      var on = b.dataset.demo === id;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    $$('.demo').forEach(function (d) { d.classList.toggle('ativa', d.dataset.demo === id); });
    if (window.MUL_DEMOS) window.MUL_DEMOS.abrir(id);
    numerar();
  }
  $$('.demo-abas button').forEach(function (b) {
    b.addEventListener('click', function () { abrirDemo(b.dataset.demo); history.replaceState(null, '', '#demos/' + b.dataset.demo); });
  });
  setasEmTabs($('.demo-abas'), 'button');

  function setasEmTabs(lista, sel) {
    lista.addEventListener('keydown', function (e) {
      var k = e.key;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(k) < 0) return;
      var bs = $$(sel, lista), i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      if (k === 'Home') i = 0; else if (k === 'End') i = bs.length - 1;
      else i = (i + (k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 1) + bs.length) % bs.length;
      bs[i].focus(); bs[i].click();
    });
  }

  /* ---------- números de linha e barra inferior ---------- */
  var numTimer = 0;
  function numerar() {
    clearTimeout(numTimer);
    numTimer = setTimeout(function () {
      if (getComputedStyle(calha).display === 'none') return;
      var alt = $('.folhas').offsetHeight;
      var n = Math.ceil(alt / 24);
      var s = '';
      for (var i = 1; i <= n; i++) s += (i < 10 ? '00' : i < 100 ? '0' : '') + i + '\n';
      calha.textContent = s;
    }, 20);
  }
  function atualizarLinha() {
    var max = main.scrollHeight - main.clientHeight;
    var l = max > 4 ? 1 + Math.round((main.scrollTop / max) * 1000) : 1001;
    $('#st-linha').textContent = 'linha ' + l + ' de 1001';
  }
  main.addEventListener('scroll', atualizarLinha, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(numerar).observe($('.folhas'));

  /* ---------- o logo feito de código ---------- */
  var campo = (function () {
    var cv = $('#campo'), ctx = cv.getContext('2d', { alpha: false });
    var base = document.createElement('canvas'), bctx = base.getContext('2d', { alpha: false });
    var FUNDO = '#101418', DIM = '#28313a', PAPEL = '#F4F1E8', VERDE = '#B8F34A';
    var FONTE = 'JetBrains Mono';
    var CODIGO = [
      'const site = novo("sua empresa");', 'site.celular = true;', 'if (cliente.chegou) responda();',
      'for (let linha = 1; linha <= 1001; linha++) escreva(linha);', 'function entregar(projeto) { testar(projeto); return "200 OK"; }',
      'pedido.status = "em preparo";', 'conserto: botao.href = "whatsapp";', 'SELECT nome FROM clientes WHERE voltou = 1;',
      'await publicar({ https: true, testado: true });', 'ideia > escopo > codigo > entrega;', 'while (!pronto) { revise(); }',
      'git commit -m "meu codigo, seu site";', 'return mil_e_uma_linhas;', 'const prazo = definirAntes(escopo);'
    ].join('   ');
    var RUIDO = '01{}[]()<>/\\;:=+*#$%&!?';
    var W = 0, H = 0, dpr = 1, cw = 0, ch = 0, cols = 0, rows = 0, fs = 12;
    var cel = [], pronto = false, animando = false, raf = 0;
    var ponteiro = { x: -999, y: -999, f: 0 }, ondas = [], sujo = null, tique = 0, visivel = false, revelou = false;

    function mascara() {
      // Monta o logo: "10" sobre "01", com o último 1 verde e um ponto de exclamação ao lado.
      var c = document.createElement('canvas');
      c.width = cols; c.height = rows;
      var m = c.getContext('2d', { willReadFrequently: true });
      var estreito = W < 901;
      var aw = estreito ? cols * 0.92 : cols * (W < 1200 ? 0.42 : 0.5);                // largura da área do logo
      var ah = rows * (estreito ? 0.88 : 0.82);
      var cwr = cw / ch;                                           // células são mais altas que largas
      // tamanho medido em "linhas"; a largura é compensada pela proporção da célula
      var alturaL = Math.min(ah / 2, (aw * cwr) / (1.2 * 1.25));
      var ox = estreito ? (cols - aw) / 2 : cols * (W < 1200 ? 0.56 : 0.47);
      var oy = (rows - alturaL * 2) / 2;
      m.save();
      m.scale(1 / cwr, 1);
      m.fillStyle = '#fff'; m.textBaseline = 'alphabetic';
      m.font = '700 ' + (alturaL * 1.26).toFixed(1) + 'px "' + FONTE + '"';
      var lg = m.measureText('10').width;
      var x0 = ox * cwr;
      var y1 = oy + alturaL * 0.92, y2 = y1 + alturaL;
      m.fillText('10', x0, y1); m.fillText('0', x0, y2);
      m.fillStyle = '#0f0';
      m.fillText('1', x0 + lg / 2, y2);
      var bx = x0 + lg + alturaL * 0.16, bw = alturaL * 0.26;
      m.fillRect(bx, oy + alturaL * 0.1, bw, alturaL * 1.34);
      m.beginPath(); m.arc(bx + bw / 2, oy + alturaL * 1.82, bw * 0.56, 0, 7); m.fill();
      m.restore();
      return m.getImageData(0, 0, cols, rows).data;
    }

    function montar() {
      var r = cv.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      if (!W || !H) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      fs = W < 901 ? 7 : 11;
      cw = fs * 0.6; ch = fs * 1.2;
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      cv.width = base.width = W * dpr; cv.height = base.height = H * dpr;
      var d = mascara();
      cel = new Array(cols * rows);
      var p = 0;
      for (var y = 0; y < rows; y++) {
        p = (y * 37) % CODIGO.length;
        for (var x = 0; x < cols; x++) {
          var i = (y * cols + x) * 4, a = d[i + 3], verde = d[i + 1] > 150 && d[i] < 90;
          var c = CODIGO.charAt((p + x) % CODIGO.length);
          var dentro = a > 100;
          if (dentro && c === ' ') c = RUIDO.charAt((x * 7 + y * 13) % RUIDO.length);
          cel[y * cols + x] = { c: c, cor: dentro ? (verde || sobreExclamacao(x) ? VERDE : PAPEL) : DIM, dentro: dentro };
        }
      }
      [ctx, bctx].forEach(function (k) {
        k.setTransform(dpr, 0, 0, dpr, 0, 0);
        k.font = '400 ' + fs + 'px "' + FONTE + '", monospace';
        k.textBaseline = 'top';
      });
      return true;
    }
    var limiteExcl = 0;
    function sobreExclamacao(x) { return x >= limiteExcl; }

    function pintarBase(ate) {
      bctx.fillStyle = FUNDO; bctx.fillRect(0, 0, W, H);
      var ult = null, y, x, k;
      bctx.font = '400 ' + fs + 'px "' + FONTE + '", monospace';
      bctx.fillStyle = DIM;
      for (y = 0; y < Math.min(rows, ate); y++) {
        for (x = 0; x < cols; x++) {
          k = cel[y * cols + x];
          if (!k.dentro && k.c !== ' ') bctx.fillText(k.c, x * cw, y * ch);
        }
      }
      bctx.font = '700 ' + fs + 'px "' + FONTE + '", monospace';
      for (y = 0; y < Math.min(rows, ate); y++) {
        for (x = 0; x < cols; x++) {
          k = cel[y * cols + x];
          if (!k.dentro || k.c === ' ') continue;
          if (k.cor !== ult) { bctx.fillStyle = k.cor; ult = k.cor; }
          bctx.fillText(k.c, x * cw, y * ch);
        }
      }
    }
    function blit() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }

    function calcularExcl() {
      // o ponto de exclamação começa depois dos dígitos: é a última coluna contínua do logo
      var estreito = W < 901;
      var aw = estreito ? cols * 0.92 : cols * (W < 1200 ? 0.42 : 0.5), ah = rows * (estreito ? 0.88 : 0.82), r = cw / ch;
      var alturaL = Math.min(ah / 2, (aw * r) / (1.2 * 1.25));
      var ox = estreito ? (cols - aw) / 2 : cols * (W < 1200 ? 0.56 : 0.47);
      var fonte = alturaL * 1.26;
      // JetBrains Mono tem avanço de 0.6 em; dois dígitos = 1.2 em
      var lg = fonte * 1.2;
      limiteExcl = ((ox * r + lg + alturaL * 0.08) / r);
    }

    function revelar() {
      if (calmo || revelou) { revelou = true; pintarBase(rows); blit(); $('#st-linha').textContent = 'linha 1 de 1001'; return; }
      revelou = true;
      var t0 = performance.now(), dur = 1100;
      (function passo(t) {
        if (!visivel) { pintarBase(rows); blit(); return; }
        var f = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - f, 2);
        pintarBase(Math.ceil(e * rows)); blit();
        $('#st-linha').textContent = 'linha ' + (1 + Math.round(e * 1000)) + ' de 1001';
        if (f < 1) requestAnimationFrame(passo);
        else setTimeout(function () { if (abaAtual === 'inicio') atualizarLinha(); }, 1400);
      })(t0);
    }

    function quadro() {
      raf = 0;
      if (!visivel) { animando = false; return; }
      tique++;
      ponteiro.f *= 0.965;
      ondas.forEach(function (o) { o.r += 15; });
      ondas = ondas.filter(function (o) { return o.r < o.max; });
      var R = W < 901 ? 70 : 120;
      var ativo = ponteiro.f > 0.02 || ondas.length;
      if (!ativo) { blit(); animando = false; return; }

      var x0, y0, x1, y1;
      if (ondas.length) { x0 = 0; y0 = 0; x1 = cols - 1; y1 = rows - 1; }
      else {
        x0 = Math.max(0, Math.floor((ponteiro.x - R - 20) / cw)); x1 = Math.min(cols - 1, Math.ceil((ponteiro.x + R + 20) / cw));
        y0 = Math.max(0, Math.floor((ponteiro.y - R - 20) / ch)); y1 = Math.min(rows - 1, Math.ceil((ponteiro.y + R + 20) / ch));
      }
      if (sujo) { ctx.setTransform(1, 0, 0, 1, 0, 0); var s = sujo; ctx.drawImage(base, s[0] * dpr, s[1] * dpr, s[2] * dpr, s[3] * dpr, s[0] * dpr, s[1] * dpr, s[2] * dpr, s[3] * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      var rx = x0 * cw, ry = y0 * ch, rw = (x1 - x0 + 1) * cw + 2, rh = (y1 - y0 + 1) * ch + 2;
      ctx.fillStyle = FUNDO; ctx.fillRect(rx, ry, rw, rh);
      sujo = [Math.max(0, rx - 2), Math.max(0, ry - 2), Math.min(W - Math.max(0, rx - 2), rw + 4), Math.min(H - Math.max(0, ry - 2), rh + 4)];

      var forte = false;
      ctx.font = '400 ' + fs + 'px "' + FONTE + '", monospace';
      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          var k = cel[y * cols + x], px = x * cw + cw / 2, py = y * ch + ch / 2, f = 0, dx = 0, dy = 0;
          if (ponteiro.f > 0.02) {
            dx = px - ponteiro.x; dy = py - ponteiro.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < R * R) { var v = 1 - Math.sqrt(d2) / R; f = v * v * ponteiro.f; }
          }
          for (var o = 0; o < ondas.length; o++) {
            var w = ondas[o], ax = px - w.x, ay = py - w.y, dist = Math.sqrt(ax * ax + ay * ay), g = (dist - w.r) / 46;
            if (g > -1.6 && g < 1.6) {
              var q = Math.exp(-g * g) * (1 - w.r / w.max);
              if (q > f) { f = q; dx = ax; dy = ay; }
            }
          }
          var ch0 = k.c, cor = k.cor, ox = 0, oy = 0;
          if (f > 0.03) {
            var n = Math.sqrt(dx * dx + dy * dy) || 1;
            ox = dx / n * f * 16; oy = dy / n * f * 16;
            if (f > 0.14) { var h = (x * 31 + y * 17 + (tique >> 1) * 7) % RUIDO.length; ch0 = RUIDO.charAt(h); }
            if (f > 0.22) cor = VERDE;
            else if (!k.dentro && f > 0.06) cor = '#6f7c88';
          }
          if (ch0 === ' ') continue;
          if (k.dentro !== forte) { forte = k.dentro; ctx.font = (forte ? '700 ' : '400 ') + fs + 'px "' + FONTE + '", monospace'; }
          ctx.fillStyle = cor;
          ctx.fillText(ch0, x * cw + ox, y * ch + oy);
        }
      }
      raf = requestAnimationFrame(quadro);
    }
    function acordar() { if (!animando && pronto && visivel && !calmo) { animando = true; raf = requestAnimationFrame(quadro); } }

    var hero = $('.hero');
    function coords(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    if (!calmo) {
      hero.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var p = coords(e); ponteiro.x = p.x; ponteiro.y = p.y; ponteiro.f = 1; acordar();
      }, { passive: true });
      hero.addEventListener('pointerdown', function (e) {
        var p = coords(e);
        if (p.y < 0 || p.y > H) return;
        var max = Math.sqrt(W * W + H * H) * 0.75;
        if (ondas.length < 3) ondas.push({ x: p.x, y: p.y, r: 0, max: max });
        if (e.pointerType === 'touch') { ponteiro.x = p.x; ponteiro.y = p.y; ponteiro.f = 1; }
        acordar();
      }, { passive: true });
    }

    var tamanho = '';
    function preparar() {
      var r = cv.getBoundingClientRect(), t = Math.round(r.width) + 'x' + Math.round(r.height);
      if (t === tamanho && pronto) { blit(); return; }
      tamanho = t;
      if (!montar()) return;
      calcularExcl();
      montar();
      sujo = null; ondas = []; ponteiro.f = 0;
      pronto = true;
      if (revelou) { pintarBase(rows); blit(); } else revelar();
    }
    function mostrar() {
      visivel = true;
      var f = document.fonts && document.fonts.load ? document.fonts.load('700 40px "' + FONTE + '"').then(function () { return document.fonts.load('400 12px "' + FONTE + '"'); }) : Promise.resolve();
      f.catch(function () {}).then(function () { if (visivel) preparar(); });
    }
    var rz = 0;
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (visivel) preparar(); }, 160); });
    return {
      mostrar: mostrar,
      parar: function () { visivel = false; if (raf) cancelAnimationFrame(raf); raf = 0; animando = false; ondas = []; ponteiro.f = 0; sujo = null; },
      onda: function () { if (!visivel || calmo) return; ondas.push({ x: W * 0.72, y: H * 0.5, r: 0, max: Math.sqrt(W * W + H * H) * 0.75 }); acordar(); }
    };
  })();

  /* ---------- obra na aba de contato ---------- */
  var obraTimer = 0;
  var OBRA = [
    '          ____________________________',
    '         /_|_/_|_/_|_/_|_/_|_/_|_/_|_/|',
    '        |[]|      |            |',
    '        |__|      |            |',
    '         ||       |          __|__',
    '         ||       |         |     |',
    '         ||      [#]        | zap |',
    '         ||                 |_____|',
    '      ___||___',
    '  BARRA'
  ];
  function desenharObra(p) {
    var cheio = Math.round(p / 100 * 24);
    var barra = new Array(cheio + 1).join('#') + new Array(25 - cheio).join('.');
    var linhas = OBRA.slice(0, -1);
    linhas.push('    [' + barra + '] ' + p + '%');
    $('#obra').textContent = linhas.join('\n');
  }
  function iniciarObra() {
    pararObra();
    if (calmo) { desenharObra(72); return; }
    var p = 0;
    desenharObra(0);
    obraTimer = setInterval(function () {
      p += 3;
      if (p >= 72) { p = 72; clearInterval(obraTimer); obraTimer = 0; }
      desenharObra(p);
    }, 45);
  }
  function pararObra() { if (obraTimer) { clearInterval(obraTimer); obraTimer = 0; } }

  /* ---------- terminal ---------- */
  var term = $('#terminal'), saida = $('#term-saida'), entrada = $('#term-in'), botaoT = $('#term-botao');
  var historico = [], hPos = 0, saudou = false;
  var LINKS = {
    instagram: 'https://www.instagram.com/mileumalinhas/',
    linkedin: 'https://www.linkedin.com/in/rodrigo-terroso-junior-9b900935b',
    github: 'https://github.com/Toshiro01001'
  };
  var PROJETOS = {
    planta: 'Planta da Caixa: mapa 3D em tempo real', cartao: 'Cartão Resposta: plataforma de estudos',
    crowsrest: 'SIIC Crowsrest: terminal estilo Windows 95', hub: 'Hub de Campanhas: menu estilo jogo',
    ecos: 'Ecos das Ruínas: arquivo que funciona offline', orfeu: 'Terminal ORFEU: site que se usa por comandos',
    parede: 'Parede de Desejos: site com IA e chave protegida', nex: 'Calculadora de NEX: ferramenta de mesa'
  };
  var DEMOS = { pedidos: 1, atendimento: 1, funil: 1, pagina: 1, banco: 1, linguagens: 1, ascii: 1 };
  var TEMAS = { ascii: 1, empresa: 1, loja: 1, painel: 1, agenda: 1 };

  function linha(txt, cls) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = txt;
    saida.appendChild(d);
    saida.scrollTop = saida.scrollHeight;
    return d;
  }
  function chips(lista) {
    var d = document.createElement('div'); d.className = 'term-chips';
    lista.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { rodar(c); entrada.focus({ preventScroll: true }); });
      d.appendChild(b);
    });
    saida.appendChild(d); saida.scrollTop = saida.scrollHeight;
  }
  function linkT(nome, url) {
    var d = document.createElement('div'), a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = nome + ': ' + url.replace('https://', '');
    d.appendChild(a); saida.appendChild(d); saida.scrollTop = saida.scrollHeight;
  }
  function ir(h) { location.hash = h; }
  var AJUDA = [
    'ajuda              esta lista',
    'ls                 o que tem neste site',
    'tema <nome>        ascii, empresa, loja, painel ou agenda',
    'orcamento          abre o montador de orçamento',
    'linguagens         o que cada linguagem faz',
    'cd <aba>           vai para início, serviços, projetos, demos, linguagens, orçamento ou contato',
    'servicos           lista o que eu faço',
    'projetos           lista os projetos',
    'abrir <projeto>    abre os detalhes de um projeto',
    'demo <nome>        pedidos, atendimento, funil, pagina, banco ou ascii',
    'contato            onde falar comigo',
    'whatsapp           situação do WhatsApp',
    'seguranca          como este site cuida dos seus dados',
    'sobre              quem fez e com quais ferramentas',
    'onda               agita o logo',
    'limpar             limpa esta tela'
  ].join('\n');

  function semAcento(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  function rodar(bruto) {
    var txt = bruto.trim();
    linha('$ ' + txt, 'cmd');
    if (!txt) return;
    historico.push(txt); hPos = historico.length;
    var t = semAcento(txt), p = t.split(/\s+/), c = p[0], a = p[1] || '';
    if (c === 'ajuda' || c === 'help' || c === '?') return void linha(AJUDA);
    if (c === 'ls' || c === 'dir') return void linha('inicio/  servicos/  projetos/  demos/  linguagens/  orcamento/  contato/');
    if (c === 'cd') {
      var alvo = a.replace(/\/$/, '');
      if (alvo === '..' || alvo === '~' || alvo === '') alvo = 'inicio';
      if (ABAS.indexOf(alvo) >= 0) { ir('#' + alvo); return void linha('Aba ' + ROTULO[alvo] + ' aberta.'); }
      return void linha('Essa aba não existe. Tente: ' + ABAS.join(', ') + '.', 'err');
    }
    if (ABAS.indexOf(c) >= 0 && c !== 'contato' && c !== 'servicos' && c !== 'projetos') { ir('#' + c); return void linha('Aba ' + ROTULO[c] + ' aberta.'); }
    if (c === 'tema') {
      if (TEMAS[a] && window.MUL_TEMAS) { window.MUL_TEMAS.trocar(a); return void linha('Aparência: ' + a + '.'); }
      return void linha('Aparências: ascii, empresa, loja, painel e agenda.', 'err');
    }
    if (c === 'linguagens') { ir('#linguagens'); return void linha(window.MUL_ORC.LINGUAGENS.map(function (l) { return l.nome; }).join('  ')); }
    if (c === 'servicos') { ir('#servicos'); return void linha('sites  sistemas  sob-medida  vendas  trafego  freelance'); }
    if (c === 'projetos') {
      ir('#projetos');
      Object.keys(PROJETOS).forEach(function (k) { linha(k + ': ' + PROJETOS[k].split(': ')[1]); });
      return void linha('Use: abrir <nome>');
    }
    if (c === 'abrir' || c === 'open' || c === 'cat') {
      if (PROJETOS[a]) { ir('#projetos/' + a); abrirProjeto(a); return void linha(PROJETOS[a]); }
      return void linha('Projeto não encontrado. Tente: ' + Object.keys(PROJETOS).join(', ') + '.', 'err');
    }
    if (c === 'demo' || c === 'demos') {
      if (DEMOS[a]) { ir('#demos/' + a); return void linha('Demonstração aberta: ' + a + '.'); }
      if (!a) { ir('#demos'); return void linha('pedidos  atendimento  funil  pagina  ascii'); }
      return void linha('Demonstração não encontrada. Tente: pedidos, atendimento, funil, pagina ou ascii.', 'err');
    }
    if (c === 'contato') { ir('#contato'); linha('e-mail: contato@mileumalinhas.com.br'); linkT('instagram', LINKS.instagram); linkT('linkedin', LINKS.linkedin); return void linkT('github', LINKS.github); }
    if (c === 'whatsapp' || c === 'zap') return void linha('Work in Progress!!');
    if (c === 'email') return void linha('contato@mileumalinhas.com.br');
    if (c === 'seguranca') return void linha('Sem cookies. Sem rastreadores. Sem scripts de terceiros.\nSem login e sem banco de dados.\nNenhum site é 100% seguro: este foi feito para ter o mínimo possível a ser roubado.');
    if (c === 'sobre' || c === 'whoami') return void linha('Mil e Uma Linhas!, de Rodrigo Terroso Junior.\nMeu código, seu site. Todo o Brasil, direto de Cuiabá.\nO Claude, da Anthropic, foi usado como ferramenta durante o desenvolvimento.');
    if (c === 'onda') { if (abaAtual !== 'inicio') ir('#inicio'); setTimeout(campo.onda, 120); return void linha('Clique no logo para fazer outra.'); }
    if (c === 'limpar' || c === 'clear' || c === 'cls') { saida.textContent = ''; return; }
    if (c === 'sudo') return void linha('Aqui ninguém precisa de sudo. Mas boa tentativa.');
    if (c === 'rm') return void linha('Negado. Antes de apagar qualquer coisa, eu faço backup.', 'err');
    if (c === 'hello' || c === 'oi' || c === 'ola') return void linha('Olá! Digite ajuda para ver o que dá para fazer.');
    if (c === '1001' || c === 'linhas') return void linha('Faltam poucas. Sempre faltam poucas.');
    if (c === '404') return void linha('404: conserto: escrever a linha que faltava.');
    if (c === 'exit' || c === 'sair' || c === 'fechar') return void fecharT();
    linha('Comando não encontrado: ' + p[0].slice(0, 30) + '. Digite ajuda.', 'err');
  }
  function abrirT() {
    term.hidden = false;
    botaoT.setAttribute('aria-expanded', 'true');
    if (!saudou) {
      saudou = true;
      linha('Mil e Uma Linhas! Digite um comando ou toque em um atalho.');
      chips(['ajuda', 'projetos', 'demo funil', 'contato']);
    }
    entrada.focus({ preventScroll: true });
  }
  function fecharT() { term.hidden = true; botaoT.setAttribute('aria-expanded', 'false'); botaoT.focus({ preventScroll: true }); }
  botaoT.addEventListener('click', function () { if (term.hidden) abrirT(); else fecharT(); });
  $('#term-fechar').addEventListener('click', fecharT);
  $('#term-form').addEventListener('submit', function (e) { e.preventDefault(); rodar(entrada.value); entrada.value = ''; });
  entrada.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { fecharT(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hPos > 0) { hPos--; entrada.value = historico[hPos]; } }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (hPos < historico.length) { hPos++; entrada.value = historico[hPos] || ''; } }
  });

  /* ---------- atalhos de teclado ---------- */
  document.addEventListener('keydown', function (e) {
    var a = document.activeElement, tag = a && a.tagName;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if ((e.key === '/' || e.key === ':') && temaAscii()) { e.preventDefault(); abrirT(); return; }
    if (e.key === 'Escape' && !term.hidden) { fecharT(); return; }
    var n = parseInt(e.key, 10);
    if (temaAscii() && n >= 1 && n <= 7) { location.hash = '#' + ABAS[n - 1]; }
  });

  /* ---------- troca de aparência ---------- */
  window.addEventListener('mul:tema', function () {
    if (!temaAscii() && !term.hidden) fecharT();
    aplicarRota(false);
  });

  /* ---------- partida ---------- */
  window.addEventListener('hashchange', function () { aplicarRota(true); });
  aplicarRota(false);
})();
