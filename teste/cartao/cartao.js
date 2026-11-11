'use strict';
/* Página do cartão de aproximação. O cartão guarda só o endereço desta página.
   Ao abrir, a página oferece salvar o contato da loja; a pessoa confirma no próprio celular. Nada é gravado sem o toque dela.
   A página não guarda nem envia dado de quem visita: sem cadastro, sem cookie, sem contador. */
(function () {
  var L = window.LOJA, $ = function (id) { return document.getElementById(id); };
  function aviso(t, ms) { $('aviso').textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(function () { $('aviso').textContent = ''; }, ms || 7000); }

  var nome = L.nome;
  document.title = nome; $('logo').src = L.logo; $('logo').alt = nome; $('rodape-nome').textContent = nome;
  $('rodape-fundo').textContent = nome; $('mapa-nome').textContent = L.ondeCurto || nome;
  $('barra-logo').src = L.logo; $('barra-nome').textContent = nome;
  $('tag-a').textContent = L.etiqueta || ''; $('tag-b').textContent = L.ondeCurto || '';
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* título em palavras: cada uma sobe de trás de uma máscara, uma depois da outra. O leitor de tela recebe a frase inteira. */
  function palavras(el, texto) {
    el.textContent = ''; el.setAttribute('aria-label', texto);
    texto.split(' ').forEach(function (p, i) {
      var fora = document.createElement('span'), dentro = document.createElement('span');
      fora.className = 'pal'; fora.setAttribute('aria-hidden', 'true'); dentro.textContent = p; dentro.style.setProperty('--i', i);
      fora.appendChild(dentro); el.appendChild(fora); el.appendChild(document.createTextNode(' '));
    });
  }
  palavras($('frase'), L.frase);
  /* rótulo do endereço: aparece letra por letra, como digitado. O espaço dele já fica reservado, para nada pular na tela. */
  (function (el, texto) {
    var fantasma = document.createElement('i'), visto = document.createElement('b'), i = 0;
    el.setAttribute('aria-label', texto); fantasma.textContent = texto; fantasma.setAttribute('aria-hidden', 'true'); visto.setAttribute('aria-hidden', 'true'); el.appendChild(fantasma); el.appendChild(visto);
    if (calmo) { visto.textContent = texto; return; }
    setTimeout(function passo() { visto.textContent = texto.slice(0, ++i); if (i < texto.length) setTimeout(passo, 26); else el.classList.add('pronto'); }, 1500);
  })($('onde'), L.onde);
  /* no computador, a etiqueta inclina e uma luz verde acompanha o ponteiro no topo */
  if (!calmo && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var topo = $('heroi');
    topo.addEventListener('pointermove', function (ev) {
      var r = topo.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      topo.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); topo.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      topo.style.setProperty('--ry', ((px - .5) * 28).toFixed(1) + 'deg'); topo.style.setProperty('--rx', ((.5 - py) * 18).toFixed(1) + 'deg'); topo.classList.add('com-luz');
    });
    topo.addEventListener('pointerleave', function () { topo.classList.remove('com-luz'); topo.style.setProperty('--ry', '0deg'); topo.style.setProperty('--rx', '0deg'); });
  }
  requestAnimationFrame(function () { $('frase').classList.add('anda'); });
  if (L.frase2) $('frase2').textContent = L.frase2; else $('frase2').hidden = true;
  /* etiqueta pendurada: um toque dá um empurrão nela */
  $('tag').addEventListener('click', function () { var t = $('tag'); t.classList.remove('empurra'); void t.offsetWidth; t.classList.add('empurra'); });
  function ligar(id, url, rotulo) { var a = $(id); if (!url) { a.hidden = true; return; } a.href = url; a.target = '_blank'; a.setAttribute('aria-label', rotulo); }
  ligar('b-whats', 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent(L.mensagemWhats), 'Abrir conversa com a ' + nome + ' no WhatsApp');
  ligar('b-insta', L.instagram, 'Abrir o Instagram da ' + nome);
  ligar('b-tiktok', L.tiktok, 'Abrir o TikTok da ' + nome);
  /* localização: o botão abre o aplicativo de mapas já com a rota; o mapa na página só é pedido ao Google quando a pessoa rola até ele */
  var ponto = L.lat + ',' + L.lng, rota = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(ponto);
  ligar('b-mapa', rota, 'Abrir o mapa com a rota até a ' + nome);
  ligar('b-rota', rota, 'Abrir o mapa com a rota até a ' + nome);
  $('endereco').textContent = L.endereco;
  function porMapa() {
    var q = document.createElement('iframe');
    q.src = 'https://www.google.com/maps?q=' + encodeURIComponent(ponto) + '&z=16&hl=pt-BR&output=embed';
    q.title = 'Mapa com a localização da ' + nome; q.loading = 'lazy'; q.referrerPolicy = 'no-referrer'; q.setAttribute('allowfullscreen', '');
    $('mapa').appendChild(q);
  }
  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (v) { if (v[0].isIntersecting) { olho.disconnect(); porMapa(); } }, { rootMargin: '300px' });
    olho.observe($('mapa'));
  } else porMapa();
  $('b-contato').setAttribute('aria-label', 'Salvar o contato da ' + nome + ' na agenda');
  $('b-indicar').setAttribute('aria-label', 'Indicar a ' + nome + ': mostra o código da página e envia o link');

  /* frases da própria loja, cada uma com o seu emoji */
  var ul = $('sobre-lista');
  (L.sobre || []).forEach(function (par) { /* o emoji da frase fica só nos dados; a página nova usa um ponto verde */
    var li = document.createElement('li'), e = document.createElement('span'), t = document.createElement('span');
    e.className = 'num'; e.setAttribute('aria-hidden', 'true'); t.textContent = par[1]; li.style.setProperty('--i', ul.children.length);
    li.appendChild(e); li.appendChild(t); ul.appendChild(li);
  });
  if (!(L.sobre || []).length) $('sobre').hidden = true;

  /* atalho do WhatsApp que aparece no pé da tela quando o botão grande sai de vista */
  var flutua = $('flutua'), botaoVisto = true;
  function flutuar() { flutua.hidden = document.body.classList.contains('com-folha') || !$('sacola').hidden || (document.body.getAttribute('data-vista') === 'inicio' && botaoVisto); }
  flutua.href = $('b-whats').href; flutua.target = '_blank'; flutua.setAttribute('aria-label', 'Abrir conversa com a ' + nome + ' no WhatsApp');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) { botaoVisto = v[0].isIntersecting; flutuar(); }, { threshold: 0 }).observe($('b-whats'));
  }

  /* vitrine: as fotos passam sozinhas da esquerda para a direita (entram pela esquerda e saem pela direita).
     Anda por transformação, que é lisa e não pesa. Dá para arrastar com o dedo ou o mouse e andar com as setas do teclado; para pelo botão Pausar
     e enquanto a fila tem o foco do teclado. Passar o mouse ou tocar numa foto só aproxima a foto. Quem pediu menos movimento recebe a fila parada, para deslizar. */
  var grade = $('grade'), fotos = L.fotos || [], trilho = document.createElement('div');
  trilho.className = 'trilho'; grade.appendChild(trilho);
  function cartaoFoto(f, copia) {
    var d = document.createElement('div');
    d.className = 'foto cor-' + (f.cor || 'a');
    if (f.arquivo) { var q = document.createElement('span'); q.className = 'foto-quadro'; var im = document.createElement('img'); im.src = f.arquivo; im.alt = copia ? '' : f.legenda; im.width = 720; im.height = 720; im.loading = 'lazy'; im.decoding = 'async'; im.draggable = false; q.appendChild(im); d.appendChild(q); var leg = document.createElement('span'); leg.className = 'foto-nome'; leg.textContent = f.legenda; if (!copia) leg.setAttribute('aria-hidden', 'true'); d.appendChild(leg); }
    else { d.setAttribute('role', 'img'); d.setAttribute('aria-label', f.legenda); var selo = document.createElement('span'); selo.className = 'selo'; selo.setAttribute('aria-hidden', 'true'); selo.textContent = 'Foto em breve'; d.appendChild(selo); }
    if (copia) { d.setAttribute('aria-hidden', 'true'); d.removeAttribute('role'); d.removeAttribute('aria-label'); }
    trilho.appendChild(d);
  }
  fotos.forEach(function (f) { cartaoFoto(f, false); });
  if (!fotos.length) document.querySelector('.pecas').hidden = true;
  if (fotos.length > 2 && !calmo && window.requestAnimationFrame) {
    fotos.forEach(function (f) { cartaoFoto(f, true); });
    grade.classList.add('passando');
    var x = 0, manual = false, focada = false, arrasta = false, ultX = 0, espera = 0, antesT = 0, tocada = null, botao = $('pausa');
    botao.hidden = false;
    botao.addEventListener('click', function () { manual = !manual; botao.textContent = manual ? 'Continuar' : 'Pausar'; botao.setAttribute('aria-pressed', manual ? 'true' : 'false'); });
    function volta() { var g = parseFloat(getComputedStyle(trilho).columnGap) || 0; return (trilho.scrollWidth + g) / 2; }
    function poe() { var v = volta(); if (v > 0) { x = ((x % v) + v) % v; trilho.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)'; } }
    grade.addEventListener('pointerdown', function (ev) { if (ev.pointerType === 'mouse' && ev.button !== 0) return; arrasta = true; ultX = ev.clientX; tocada = ev.target.closest ? ev.target.closest('.foto') : null; if (tocada) tocada.classList.add('tocada'); });
    function solta() { if (!arrasta) return; arrasta = false; espera = Date.now() + 1200; if (tocada) { tocada.classList.remove('tocada'); tocada = null; } }
    addEventListener('pointermove', function (ev) { if (!arrasta) return; x -= ev.clientX - ultX; ultX = ev.clientX; poe(); });
    addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
    grade.addEventListener('focus', function () { focada = true; }); grade.addEventListener('blur', function () { focada = false; });
    grade.addEventListener('keydown', function (ev) { if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return; ev.preventDefault(); x += (ev.key === 'ArrowRight' ? 1 : -1) * volta() / fotos.length; poe(); });
    function passo(t) {
      var dt = Math.min(64, t - (antesT || t)); antesT = t;
      if (!manual && !focada && !arrasta && !document.hidden && Date.now() > espera) { x -= dt * 0.035; poe(); } /* cerca de 35 px por segundo, da esquerda para a direita */
      requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* horário: aberta ou fechada agora, pelo relógio da cidade da loja e não pelo do celular de quem visita */
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function hora(t) { var p = t.split(':'); return (+p[0]) + 'h' + (p[1] === '00' ? '' : p[1]); }
  function minutos(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function agoraNaLoja() {
    try {
      var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: L.fuso, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: +o.hour * 60 + +o.minute };
    } catch (e) { var d = new Date(); return { dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function estado() {
    var H = L.horario, a = agoraNaLoja(), h = H[a.dia];
    if (h && a.min >= minutos(h[0]) && a.min < minutos(h[1])) return { aberta: true, texto: 'Aberta agora', resto: 'fecha às ' + hora(h[1]) };
    if (h && a.min < minutos(h[0])) return { aberta: false, texto: 'Fechada agora', resto: 'abre às ' + hora(h[0]) };
    for (var i = 1; i <= 7; i++) { var d = (a.dia + i) % 7; if (H[d]) return { aberta: false, texto: 'Fechada agora', resto: 'abre ' + (i === 1 ? 'amanhã' : d === 0 || d === 6 ? 'no ' + DIAS[d] : 'na ' + DIAS[d]) + ' às ' + hora(H[d][0]) }; }
    return { aberta: false, texto: 'Fechada', resto: '' };
  }
  function pintarEstado() {
    var e = estado(), frase = e.texto + (e.resto ? ', ' + e.resto : '') + '.';
    $('agora').hidden = false; $('agora').className = 'agora ' + (e.aberta ? 'aberta' : 'fechada'); $('agora-texto').textContent = frase;
    $('estado').className = 'estado ' + (e.aberta ? 'aberta' : 'fechada'); $('estado').textContent = frase;
    /* linha do dia: mostra em que ponto do expediente a loja está e quanto falta para abrir ou fechar */
    var ag = agoraNaLoja(), hd = L.horario[ag.dia];
    function dur(m) { var hr = Math.floor(m / 60), mi = m % 60; return hr ? hr + 'h' + (mi ? ' ' + mi + 'min' : '') : mi + 'min'; }
    if (hd) {
      var ab = minutos(hd[0]), fe = minutos(hd[1]), parte = Math.max(0, Math.min(1, (ag.min - ab) / (fe - ab)));
      $('dia').hidden = false; $('dia-fio').style.width = (parte * 100).toFixed(1) + '%'; $('dia-marca').style.left = (parte * 100).toFixed(1) + '%';
      $('dia').className = 'dia ' + (e.aberta ? 'aberta' : 'fechada'); $('dia-a').textContent = hora(hd[0]); $('dia-b').textContent = hora(hd[1]);
      $('dia-resto').textContent = ag.min < ab ? 'Abre em ' + dur(ab - ag.min) : ag.min < fe ? 'Fecha em ' + dur(fe - ag.min) : 'Encerrado por hoje';
    } else $('dia').hidden = true;
    var hh = L.horario[agoraNaLoja().dia]; $('hoje-grande').hidden = false; $('hoje-grande').firstChild.textContent = hh ? hora(hh[0]) + ' às ' + hora(hh[1]) : 'Fechada';
    $('barra-estado').hidden = false; $('barra-estado').className = 'barra-estado ' + (e.aberta ? 'aberta' : 'fechada'); $('barra-texto').textContent = e.aberta ? 'Aberta' : 'Fechada';
  }
  if (L.horario && L.horario.length === 7) {
    $('horario').hidden = false; $('nota-horario').hidden = !L.horarioExemplo;
    /* junta os dias seguidos que têm o mesmo horário, começando pela segunda: "Segunda a sábado" */
    var ordem = [1, 2, 3, 4, 5, 6, 0], grupos = [], hoje = agoraNaLoja().dia;
    ordem.forEach(function (d) {
      var chave = L.horario[d] ? L.horario[d].join('-') : 'x', g = grupos[grupos.length - 1];
      if (g && g.chave === chave) g.dias.push(d); else grupos.push({ chave: chave, dias: [d] });
    });
    grupos.forEach(function (g) {
      var li = document.createElement('li'), n = document.createElement('span'), v = document.createElement('span'), p = g.dias[0], u = g.dias[g.dias.length - 1], h = L.horario[p];
      var rot = g.dias.length === 1 ? DIAS[p] : g.dias.length === 2 ? DIAS[p] + ' e ' + DIAS[u] : DIAS[p] + ' a ' + DIAS[u];
      n.textContent = rot.charAt(0).toUpperCase() + rot.slice(1); v.textContent = h ? hora(h[0]) + ' às ' + hora(h[1]) : 'Fechada';
      if (g.dias.indexOf(hoje) >= 0) { li.className = 'hoje'; var m = document.createElement('small'); m.textContent = 'hoje'; n.appendChild(m); }
      li.appendChild(n); li.appendChild(v); $('semana').appendChild(li);
    });
    pintarEstado(); setInterval(pintarEstado, 60000);
  }

  /* fale com a loja: cada linha abre o aplicativo certo com um toque */
  var ICONE = {
    whats: '<path d="M4 20l1.400-4.200A8 8 0 1 1 8.600 19L4 20z"/>',
    email: '<rect x="3.500" y="5.500" width="17" height="13" rx="3"/><path d="M4.500 7.500l7.500 5.500 7.500-5.500"/>',
    entrega: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7.500 19a1.800 1.800 0 1 0 0-3.600 1.800 1.800 0 0 0 0 3.600zM17.500 19a1.800 1.800 0 1 0 0-3.600 1.800 1.800 0 0 0 0 3.600z"/>',
    central: '<path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8.500 12h7"/>'
  };
  function linha(tipo, titulo, valor, url, rotulo) {
    var a = document.createElement('a'), s = document.createElement('span'), b = document.createElement('b'), sm = document.createElement('small');
    a.className = 'linha'; a.id = 'l-' + tipo; a.href = url; a.rel = 'noopener'; if (tipo !== 'email') a.target = '_blank'; a.setAttribute('aria-label', rotulo);
    a.innerHTML = '<i class="bola"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONE[tipo] + '</svg></i>';
    b.textContent = titulo; sm.textContent = valor; s.appendChild(b); s.appendChild(sm); a.appendChild(s);
    a.insertAdjacentHTML('beforeend', '<svg class="seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>');
    $('fale-lista').appendChild(a);
  }
  if (L.whatsapp) linha('whats', 'WhatsApp', L.whatsappTexto || 'Abre a conversa no aplicativo.', $('b-whats').href, 'Abrir conversa com a ' + nome + ' no WhatsApp');
  if (L.whatsapp && L.entrega) linha('entrega', 'Pedir entrega', 'Combine pelo WhatsApp.', 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent(L.mensagemEntrega), 'Pedir uma entrega para a ' + nome + ' pelo WhatsApp');
  if (L.email) linha('email', 'E-mail', L.email, 'mailto:' + L.email, 'Escrever um e-mail para a ' + nome);
  if (L.central) linha('central', 'Central de atendimento', 'Todos os links da loja em um lugar.', L.central, 'Abrir a central de atendimento da ' + nome);
  if (!$('fale-lista').children.length) $('fale').hidden = true;
  /* recado: a pessoa escreve aqui e a mensagem segue pelo WhatsApp dela. A página não guarda nem envia nada por conta própria. */
  if (L.whatsapp) {
    $('recado').hidden = false;
    $('recado').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = $('recado-texto').value.replace(/\s+/g, ' ').trim();
      window.open('https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent(t || L.mensagemWhats), '_blank', 'noopener');
    });
  }

  /* folhas que sobem do pé da tela: a do contato e a de indicar a loja */
  var folha = $('folha'), folhaQr = $('folha-qr'), folhaPeca = $('folha-peca'), veu = $('veu'), antes = null, aberta = null;
  $('f-salvar').href = L.contato; $('f-salvar').setAttribute('download', 'contato-da-loja.vcf');
  function mostrar(qual, foco) { if (aberta) aberta.hidden = true; else antes = document.activeElement; aberta = qual; qual.hidden = false; veu.hidden = false; document.body.classList.add('com-folha'); flutuar(); foco.focus(); }
  function abrir() { mostrar(folha, $('f-salvar')); }
  function fechar() { if (!aberta) return; if (aberta === folhaPeca && location.hash.indexOf('#peca-') === 0 && history.replaceState) history.replaceState(null, '', '#catalogo'); aberta.hidden = true; aberta = null; veu.hidden = true; document.body.classList.remove('com-folha'); flutuar(); if (antes && antes.focus) antes.focus(); }
  /* no celular, as folhas descem com o dedo: arrastar para baixo acompanha o movimento e, passando de um terço da folha ou com um puxão rápido, fecha.
     Enquanto uma folha está aberta, o gesto não chega ao navegador, então puxar para baixo não recarrega mais a página. */
  (function () {
    var y0 = null, x0 = 0, t0 = 0, dy = 0, arrastando = false, qual = null;
    function solta(fecha) {
      var f = qual; if (!f) return; qual = null; arrastando = false; y0 = null;
      f.style.transition = 'transform .28s cubic-bezier(.2, .8, .3, 1)'; veu.style.transition = 'opacity .28s';
      if (fecha) { f.style.transform = 'translateY(105%)'; veu.style.opacity = '0'; setTimeout(function () { fechar(); f.style.transition = f.style.transform = ''; veu.style.transition = veu.style.opacity = ''; }, 260); }
      else { f.style.transform = ''; veu.style.opacity = ''; setTimeout(function () { f.style.transition = ''; veu.style.transition = ''; }, 300); }
    }
    [folha, folhaQr, folhaPeca].forEach(function (f) {
      f.addEventListener('touchstart', function (ev) {
        if (ev.touches.length !== 1 || innerWidth >= 900 || $('p-quadro').classList.contains('perto')) { y0 = null; return; }
        y0 = ev.touches[0].clientY; x0 = ev.touches[0].clientX; t0 = Date.now(); dy = 0; arrastando = false; qual = f;
      }, { passive: true });
      f.addEventListener('touchmove', function (ev) {
        if (y0 === null || qual !== f) return;
        dy = ev.touches[0].clientY - y0; var dx = ev.touches[0].clientX - x0;
        if (!arrastando) {
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) { y0 = null; return; }   /* gesto de lado: troca de peça */
          if (dy < 0 && f.scrollHeight > f.clientHeight + 2) { y0 = null; return; }      /* para cima: rola a folha, se ela for mais alta que a tela */
          if (dy > 6 && f.scrollTop <= 0) { arrastando = true; f.style.transition = 'none'; veu.style.transition = 'none'; }
        }
        if (!arrastando) { if (dy > 0 && f.scrollTop <= 0 && ev.cancelable) ev.preventDefault(); return; }
        if (ev.cancelable) ev.preventDefault();
        var d = Math.max(0, dy); f.style.transform = 'translateY(' + d.toFixed(0) + 'px)'; veu.style.opacity = Math.max(.25, 1 - d / (f.offsetHeight * 1.1)).toFixed(2);
      }, { passive: false });
      function fim() { if (qual !== f) return; if (!arrastando) { qual = null; y0 = null; return; } var rapido = dy > 40 && dy / Math.max(1, Date.now() - t0) > .55; solta(dy > f.offsetHeight / 3 || rapido); }
      f.addEventListener('touchend', fim); f.addEventListener('touchcancel', function () { if (qual === f) solta(false); });
    });
    /* o fundo escurecido também segura o gesto, para a página de trás não rolar nem recarregar */
    veu.addEventListener('touchmove', function (ev) { if (ev.cancelable) ev.preventDefault(); }, { passive: false });
  })();
  $('b-contato').addEventListener('click', abrir);
  $('f-nao').addEventListener('click', fechar); $('p-fechar').addEventListener('click', fechar);
  veu.addEventListener('click', fechar);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && aberta) fechar(); });
  /* Cada sistema termina de um jeito, e nenhum salva sem a pessoa confirmar. A página diz o próximo toque antes de o celular mudar de tela.
     iPhone: abre a ficha do contato; o botão de salvar fica no fim dela. Android: baixa a ficha e pede para abrir e importar. */
  var ua = navigator.userAgent || '', iphone = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
  var DICA = iphone ? 'O iPhone vai abrir uma tela dele com o nome da loja. Nela, toque em "Criar Novo Contato".'
    : android ? 'Depois, toque em "Abrir" no alto da tela, escolha Contatos e toque em "Importar".'
      : 'O contato é baixado como arquivo. Abra o arquivo para salvar.';
  var DEPOIS = iphone ? 'Para salvar, toque em "Criar Novo Contato" na tela do iPhone com o nome da loja. O ✓ do alto só fecha.'
    : android ? 'Contato baixado. Toque em "Abrir", escolha Contatos e toque em "Importar".'
      : 'Contato baixado. Abra o arquivo para salvar na agenda.';
  $('f-dica').textContent = DICA;
  $('f-salvar').addEventListener('click', function () { setTimeout(function () { fechar(); aviso(DEPOIS, 20000); }, 400); });

  /* indicar */
  $('b-indicar').addEventListener('click', function () { if (L.qr && !$('qr').src) $('qr').src = L.qr; mostrar(folhaQr, $('q-enviar')); });
  $('q-fechar').addEventListener('click', fechar);
  $('q-enviar').addEventListener('click', function () {
    fechar();
    var url = location.href.split('#')[0].split('?')[0];
    if (navigator.share) { navigator.share({ title: nome, url: url }).catch(function () { /* a pessoa desistiu */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { aviso('Link copiado. É só colar na conversa.'); }, function () { aviso('Copie o endereço desta página e envie para quem quiser.'); }); return; }
    aviso('Copie o endereço desta página e envie para quem quiser.');
  });

  /* fundo: faixas de luz que escorrem devagar, nas cores da loja. É desenhado pela placa de vídeo, em tamanho reduzido e a 30 quadros por segundo,
     para não pesar no celular. Para quando a aba fica escondida; com "reduzir movimento", desenha um quadro só. Sem suporte, ficam as manchas do CSS. */
  (function () {
    var tela = $('aurora'), gl = null;
    try { gl = tela.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) { tela.hidden = true; return; }
    var FRAG = 'precision mediump float;uniform vec2 r;uniform float t;' +
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}' +
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.02+7.3;a*=.5;}return v;}' +
      'void main(){vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);float a=-.5;vec2 q=vec2(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a));q.x*=1.5;q.y*=.45;' +
      'float w=fbm(q*1.1+vec2(t*.05,t*.02));float s=fbm(vec2(q.x*1.1+w*1.7+t*.04,q.y*.7-t*.06));float s2=fbm(vec2(q.x*1.6-w+t*.03+4.,q.y*.5+t*.05+9.));' +
      'vec3 c=mix(vec3(.03,.05,.03),vec3(.22,.36,.08),smoothstep(.28,.72,s));c=mix(c,vec3(.55,.72,.2),smoothstep(.56,.9,s)*.75);c=mix(c,vec3(.93,.96,.84),smoothstep(.7,.95,s2)*.2);' +
      'c*=mix(.4,1.,smoothstep(1.35,.15,length(p)));gl_FragColor=vec4(c,1.);}';
    function sombra(tipo, txt) { var o = gl.createShader(tipo); gl.shaderSource(o, txt); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
    var v = sombra(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'), f = sombra(gl.FRAGMENT_SHADER, FRAG), prog = gl.createProgram();
    if (!v || !f) { tela.hidden = true; return; }
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { tela.hidden = true; return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var pa = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(pa); gl.vertexAttribPointer(pa, 2, gl.FLOAT, false, 0, 0);
    var ur = gl.getUniformLocation(prog, 'r'), ut = gl.getUniformLocation(prog, 't'), ultimo = 0, t0 = Math.random() * 40;
    function medida() { var w = Math.max(160, Math.round(tela.clientWidth * .35)), hh = Math.max(160, Math.round(tela.clientHeight * .35)); if (tela.width !== w || tela.height !== hh) { tela.width = w; tela.height = hh; gl.viewport(0, 0, w, hh); } }
    function desenha(seg) { medida(); gl.uniform2f(ur, tela.width, tela.height); gl.uniform1f(ut, t0 + seg); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    $('fundo').classList.add('com-aurora'); desenha(0);
    tela.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); $('fundo').classList.remove('com-aurora'); });
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { addEventListener('resize', function () { desenha(0); }); return; }
    var aVista = true; if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { aVista = v[0].isIntersecting; }).observe($('heroi'));
    function laco(agora) { if (!document.hidden && aVista && agora - ultimo > 33 && $('fundo').classList.contains('com-aurora')) { ultimo = agora; desenha(agora / 1000); } requestAnimationFrame(laco); }
    requestAnimationFrame(laco);
  })();

  /* as seções surgem ao entrar na tela, uma vez, e o título delas sobe palavra por palavra. Sem isso para quem pediu menos movimento. */
  if (!calmo && 'IntersectionObserver' in window) {
    var surge = new IntersectionObserver(function (v) { v.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('veio'); surge.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(document.querySelectorAll('#inicio .atalhos, #inicio .bloco'), function (el) {
      [].forEach.call(el.querySelectorAll('h2:not(.so-leitor)'), function (h) { palavras(h, h.textContent); });
      el.classList.add('vem'); surge.observe(el);
    });
  }

  /* catálogo: todas as peças em grade, com busca, filtro por tipo e a lista de quem visita.
     Tocar numa peça abre a foto grande; dali dá para passar para a próxima, guardar na lista, mostrar a alguém ou perguntar no WhatsApp.
     A lista vive só na memória desta tela: nada é gravado no aparelho nem enviado; some ao fechar a página. */
  var CAT = L.catalogo || [], TIPOS = L.tipos || [], nomeTipo = {}, filtro = '', termo = '', gradeCat = $('cat-grade'), chips = $('chips'), lista = [], atual = -1, gostei = [], pintado = false, chipLista = null;
  var CORACAO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.400-7-9.600A4 4 0 0 1 12 8a4 4 0 0 1 7 2.400C19 15.600 12 20 12 20z"/></svg>';
  TIPOS.forEach(function (t) { nomeTipo[t[0]] = t[1]; });
  CAT.forEach(function (p) { p.id = (p.arquivo.match(/(\d+)\.\w+$/) || [0, ''])[1]; });
  /* mural do topo: colunas com fotos de peças da loja que sobem e descem devagar atrás do título, escurecidas para o texto continuar legível.
     Usa as mesmas fotos do catálogo (nada novo para baixar depois), anda só por transformação e para quando o topo sai da tela. Com "reduzir movimento", fica parado. */
  (function () {
    var modo = (/[?&]fundo=([a-z+]+)/.exec(location.search.replace(/%2B/gi, '+')) || [0, L.fundoTopo || 'mural'])[1];
    /* vídeo de tecido: mudo, em repetição, sem controles. Só entra para quem não pediu menos movimento nem economia de dados; para os outros fica a imagem parada. */
    if (modo.indexOf('seda') === 0) {
      var poupa = navigator.connection && navigator.connection.saveData, seda;
      if (calmo || poupa) { seda = document.createElement('img'); seda.src = 'video/seda-capa.webp'; seda.alt = ''; }
      else {
        seda = document.createElement('video'); seda.muted = true; seda.loop = true; seda.autoplay = true; seda.playsInline = true; seda.setAttribute('muted', ''); seda.setAttribute('playsinline', ''); seda.preload = 'metadata'; seda.poster = 'video/seda-capa.webp'; seda.disablePictureInPicture = true;
        [['video/seda.webm', 'video/webm'], ['video/seda.mp4', 'video/mp4']].forEach(function (par) { var o = document.createElement('source'); o.src = par[0]; o.type = par[1]; seda.appendChild(o); });
        if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { if (v[0].isIntersecting) { var t = seda.play(); if (t && t.catch) t.catch(function () { /* o aparelho não deixou tocar sozinho: fica a capa */ }); } else seda.pause(); }).observe($('heroi'));
      }
      seda.className = 'seda'; $('fundo').insertBefore(seda, $('fundo').firstChild); $('fundo').classList.add('com-seda');
      if (modo === 'seda') { $('fundo').classList.add('com-mural'); return; }
      $('fundo').classList.add('mural-leve');
    }
    if (CAT.length < 10) return;
    var mural = document.createElement('div'), COLUNAS = 5, POR = 4, passo = Math.max(1, Math.floor(CAT.length / (COLUNAS * POR))), k = 0, carregou = false;
    mural.className = 'mural';
    for (var c = 0; c < COLUNAS; c++) {
      var col = document.createElement('div'); col.className = 'mural-col';
      for (var volta = 0; volta < 2; volta++) for (var i = 0; i < POR; i++) {
        var im = document.createElement('img'), p = CAT[((c * POR + i) * passo + c) % CAT.length];
        im.src = p.arquivo; im.alt = ''; im.width = 600; im.height = 750; im.decoding = 'async'; im.setAttribute('fetchpriority', 'low'); im.draggable = false;
        if (!carregou) im.addEventListener('load', function () { if (!carregou) { carregou = true; mural.classList.add('pronto'); $('fundo').classList.add('com-mural'); } });
        col.appendChild(im);
      }
      mural.appendChild(col);
    }
    $('fundo').insertBefore(mural, $('fundo').querySelector('canvas'));
    if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { mural.classList.toggle('parado', !v[0].isIntersecting); }).observe($('heroi'));
  })();
  function limpo(t) { return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function filtrar() {
    var q = limpo(termo.trim());
    return CAT.filter(function (p) { return (filtro === '*' ? gostei.indexOf(p) >= 0 : !filtro || p.tipo === filtro) && (!q || limpo(p.legenda + ' ' + (nomeTipo[p.tipo] || '')).indexOf(q) >= 0); });
  }
  function marcarGosto() {
    var p = lista[atual], dentro = !!p && gostei.indexOf(p) >= 0;
    $('p-gosto').setAttribute('aria-pressed', dentro ? 'true' : 'false'); $('p-gosto').lastChild.textContent = dentro ? 'Na sua lista' : 'Guardar na lista';
  }
  function pintarPeca(i) {
    atual = (i + lista.length) % lista.length; var p = lista[atual], f = $('p-foto');
    perto(false); f.src = p.arquivo; f.alt = p.legenda;
    /* a foto grande, mais nítida para a lupa, só é pedida quando a peça é aberta; enquanto ela não chega, fica a do catálogo */
    if (p.grande && !folhaPeca.classList.contains('rolando')) { var maior = new Image(); maior.onload = function () { if (lista[atual] === p && aberta === folhaPeca) f.src = p.grande; }; maior.src = p.grande; } f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';
    if (folhaPeca.classList.contains('rolando')) $('p-nome').textContent = p.legenda; else embaralha($('p-nome'), p.legenda);
    $('p-cat').textContent = (nomeTipo[p.tipo] || '') + (lista.length > 1 ? ' / ' + (atual + 1) + ' de ' + lista.length : '');
    $('p-whats').href = 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent((L.mensagemPeca || '') + p.legenda + '.');
    $('p-whats').setAttribute('aria-label', 'Perguntar sobre ' + p.legenda + ' no WhatsApp da ' + nome);
    $('p-ant').hidden = $('p-prox').hidden = lista.length < 2; marcarGosto();
    if (history.replaceState) history.replaceState(null, '', '#peca-' + p.id);
  }
  /* letras que se embaralham e assentam, da esquerda para a direita. O nome certo fica no rótulo de leitura; isto é só para os olhos. */
  var SORTE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function embaralha(el, texto) {
    if (calmo || !window.requestAnimationFrame) { el.textContent = texto; return; }
    var t0 = 0, dura = Math.min(700, 260 + texto.length * 14); el.embaralho = (el.embaralho || 0) + 1; var vez = el.embaralho;
    requestAnimationFrame(function passo(t) {
      if (el.embaralho !== vez) return; if (!t0) t0 = t;
      var parte = Math.min(1, (t - t0) / dura), certo = Math.floor(parte * texto.length), fora = '';
      for (var i = certo; i < texto.length; i++) fora += texto.charAt(i) === ' ' ? ' ' : SORTE.charAt(Math.floor(Math.random() * SORTE.length));
      el.textContent = texto.slice(0, certo) + fora;
      if (parte < 1) requestAnimationFrame(passo); else el.textContent = texto;
    });
  }
  /* foto grande: um toque aproxima, e o ponto aproximado segue o dedo ou o ponteiro; outro toque afasta */
  function perto(liga) { var q = $('p-quadro'); q.classList.toggle('perto', !!liga); $('p-lupa').textContent = liga ? 'Toque para afastar' : 'Toque para aproximar'; if (!liga) { q.style.removeProperty('--zx'); q.style.removeProperty('--zy'); } }
  function mirar(ev) { var q = $('p-quadro'), r = q.getBoundingClientRect(); q.style.setProperty('--zx', Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100)).toFixed(1) + '%'); q.style.setProperty('--zy', Math.max(0, Math.min(100, (ev.clientY - r.top) / r.height * 100)).toFixed(1) + '%'); }
  /* no celular, as peças da fileira que está no meio da tela entram "em foco": ganham a mira nos cantos, o aviso Ver de perto e o nome embaralha */
  /* trama do catálogo: uma malha de pontos que acende em volta do ponteiro (ou da fileira em foco, no celular), com um rastro mais lento atrás.
     Um laço só escreve as quatro coordenadas; ele para sozinho quando a luz chega ao lugar. */
  var tramaEl = $('trama'), alvoX = -999, alvoY = -999, luzX = -999, luzY = -999, rastroX = -999, rastroY = -999, tramaViva = false, tramaT = 0;
  function tramaPasso(t) {
    var d = Math.min(50, t - (tramaT || t)) || 16; tramaT = t;
    var k = 1 - Math.pow(1 - .12, d / 16.7), kr = 1 - Math.pow(1 - .045, d / 16.7);
    luzX += (alvoX - luzX) * k; luzY += (alvoY - luzY) * k; rastroX += (alvoX - rastroX) * kr; rastroY += (alvoY - rastroY) * kr;
    tramaEl.style.setProperty('--lx', luzX.toFixed(1) + 'px'); tramaEl.style.setProperty('--ly', luzY.toFixed(1) + 'px'); tramaEl.style.setProperty('--rx', rastroX.toFixed(1) + 'px'); tramaEl.style.setProperty('--ry', rastroY.toFixed(1) + 'px');
    if (document.hidden || document.body.getAttribute('data-vista') !== 'catalogo' || (Math.abs(alvoX - rastroX) < .4 && Math.abs(alvoY - rastroY) < .4)) { tramaViva = false; return; }
    requestAnimationFrame(tramaPasso);
  }
  function apontar(px, py) {
    alvoX = px; alvoY = py;
    if (luzX < -900 || calmo) { luzX = rastroX = px; luzY = rastroY = py; }
    if (calmo) { tramaEl.style.setProperty('--lx', px + 'px'); tramaEl.style.setProperty('--ly', py + 'px'); tramaEl.style.setProperty('--rx', px + 'px'); tramaEl.style.setProperty('--ry', py + 'px'); return; }
    if (!tramaViva && window.requestAnimationFrame) { tramaViva = true; tramaT = 0; requestAnimationFrame(tramaPasso); }
  }
  addEventListener('pointermove', function (ev) { if (document.body.getAttribute('data-vista') === 'catalogo' && !aberta) apontar(ev.clientX, ev.clientY); }, { passive: true });
  var semPonteiro = !(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches), focoMarcado = false;
  function focar() {
    focoMarcado = false;
    if (!semPonteiro || calmo || document.body.getAttribute('data-vista') !== 'catalogo') return;
    var meio = innerHeight * .46, melhor = null, dist = 1e9, itens = gradeCat.children;
    for (var i = 0; i < itens.length; i++) { var r = itens[i].getBoundingClientRect(), d = Math.abs(r.top + r.height * .42 - meio); if (d < dist - 4) { dist = d; melhor = r.top; } }
    if (melhor !== null && dist < innerHeight * .5 && itens.length) apontar(innerWidth / 2, melhor + itens[0].getBoundingClientRect().width * .6);
    for (var k = 0; k < itens.length; k++) {
      var li = itens[k], dentro = melhor !== null && Math.abs(li.getBoundingClientRect().top - melhor) < 6 && dist < innerHeight * .5;
      if (dentro && !li.classList.contains('foco')) { li.classList.add('foco'); var n = li.querySelector('.peca-pe b'); if (n) embaralha(n, n.getAttribute('data-nome') || (n.setAttribute('data-nome', n.textContent), n.textContent)); }
      else if (!dentro) li.classList.remove('foco');
    }
  }
  addEventListener('scroll', function () { if (!focoMarcado) { focoMarcado = true; requestAnimationFrame(focar); } }, { passive: true });
  /* no computador, o cartão da peça inclina acompanhando o ponteiro e o nome embaralha ao passar o mouse */
  if (!semPonteiro && !calmo) {
    gradeCat.addEventListener('pointermove', function (ev) {
      var li = ev.target.closest ? ev.target.closest('.peca-li') : null; if (!li) return;
      var r = li.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width - .5, py = (ev.clientY - r.top) / r.height - .5;
      li.style.setProperty('--ty', (px * 12).toFixed(1) + 'deg'); li.style.setProperty('--tx', (-py * 9).toFixed(1) + 'deg'); li.style.setProperty('--px', (px * -10).toFixed(1) + 'px'); li.style.setProperty('--py', (py * -10).toFixed(1) + 'px');
    });
    gradeCat.addEventListener('pointerover', function (ev) {
      var li = ev.target.closest ? ev.target.closest('.peca-li') : null; if (!li || li.classList.contains('foco')) return;
      [].forEach.call(gradeCat.querySelectorAll('.foco'), function (o) { o.classList.remove('foco'); o.style.removeProperty('--ty'); o.style.removeProperty('--tx'); o.style.removeProperty('--px'); o.style.removeProperty('--py'); });
      li.classList.add('foco'); var n = li.querySelector('.peca-pe b'); if (n) embaralha(n, n.getAttribute('data-nome') || (n.setAttribute('data-nome', n.textContent), n.textContent));
    });
    gradeCat.addEventListener('pointerleave', function () { [].forEach.call(gradeCat.querySelectorAll('.foco'), function (o) { o.classList.remove('foco'); o.style.removeProperty('--ty'); o.style.removeProperty('--tx'); o.style.removeProperty('--px'); o.style.removeProperty('--py'); }); });
  }
  function verPeca(p) { if (lista.indexOf(p) < 0) lista = CAT.slice(); pintarPeca(lista.indexOf(p)); if (aberta !== folhaPeca) mostrar(folhaPeca, $('p-whats')); }
  function sacola() {
    var n = gostei.length;
    $('sacola').hidden = !n || document.body.getAttribute('data-vista') !== 'catalogo';
    $('sacola-n').textContent = n + (n === 1 ? ' peça na sua lista' : ' peças na sua lista');
    $('sacola-zap').href = 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent((L.mensagemLista || '') + '\n' + gostei.map(function (p) { return '- ' + p.legenda; }).join('\n'));
    $('sacola-zap').setAttribute('aria-label', 'Enviar a sua lista de ' + n + (n === 1 ? ' peça' : ' peças') + ' para o WhatsApp da ' + nome);
    [].forEach.call(gradeCat.querySelectorAll('.gosto'), function (b) { b.setAttribute('aria-pressed', gostei.indexOf(b.peca) >= 0 ? 'true' : 'false'); });
    if (chipLista) { chipLista.hidden = !n; chipLista.lastChild.textContent = n; }
    if (filtro === '*') { if (!n) { filtro = ''; [].forEach.call(chips.children, function (c, k) { c.setAttribute('aria-pressed', k === 0 ? 'true' : 'false'); }); } if (pintado) pintarCatalogo(); }
    flutuar(); marcarGosto();
  }
  function alternar(p) { var k = gostei.indexOf(p); if (k < 0) gostei.push(p); else gostei.splice(k, 1); sacola(); }
  function pintarCatalogo() {
    lista = filtrar(); gradeCat.textContent = '';
    lista.forEach(function (p, i) {
      var li = document.createElement('li'), b = document.createElement('button'), g = document.createElement('button'), q = document.createElement('span'), im = document.createElement('img'), pe = document.createElement('span'), n = document.createElement('b'), t = document.createElement('small');
      li.className = 'peca-li'; li.style.setProperty('--i', i);
      b.type = 'button'; b.className = 'peca'; b.setAttribute('aria-label', p.legenda + '. Ver de perto.');
      q.className = 'peca-quadro'; im.src = p.arquivo; im.alt = ''; im.width = 600; im.height = 750; im.loading = i < 4 ? 'eager' : 'lazy'; im.decoding = 'async'; q.appendChild(im);
      var ver = document.createElement('span'); ver.className = 'peca-ver'; ver.setAttribute('aria-hidden', 'true'); ver.textContent = 'Ver de perto'; q.appendChild(ver);
      pe.className = 'peca-pe'; n.textContent = p.legenda; t.textContent = nomeTipo[p.tipo] || ''; pe.appendChild(n); pe.appendChild(t);
      b.appendChild(q); b.appendChild(pe); b.addEventListener('click', function () { verPeca(p); });
      g.type = 'button'; g.className = 'gosto'; g.peca = p; g.innerHTML = CORACAO; g.setAttribute('aria-label', 'Guardar ' + p.legenda + ' na minha lista'); g.setAttribute('aria-pressed', gostei.indexOf(p) >= 0 ? 'true' : 'false');
      g.addEventListener('click', function () { alternar(p); });
      li.appendChild(b); li.appendChild(g); gradeCat.appendChild(li);
    });
    $('cat-vazio').hidden = lista.length > 0; focar();
    $('cat-conta').textContent = lista.length + (lista.length === 1 ? ' peça' : ' peças') + (filtro === '*' ? ' na sua lista' : filtro ? ' em ' + nomeTipo[filtro] : '') + (termo.trim() ? ' com "' + termo.trim() + '"' : '');
  }
  function repintar() { if (calmo) { pintarCatalogo(); return; } gradeCat.classList.add('troca'); setTimeout(function () { pintarCatalogo(); gradeCat.classList.remove('troca'); }, 180); }
  function chip(id, rotulo, n) {
    var b = document.createElement('button'), q = document.createElement('sup');
    b.type = 'button'; b.className = 'chip'; b.textContent = rotulo; q.textContent = n; q.setAttribute('aria-hidden', 'true'); b.appendChild(q);
    b.setAttribute('aria-pressed', id === filtro ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (filtro === id) return; filtro = id;
      [].forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      repintar();
    });
    chips.appendChild(b); return b;
  }
  if (CAT.length) {
    chip('', 'Tudo', CAT.length);
    TIPOS.forEach(function (t) { var n = CAT.filter(function (p) { return p.tipo === t[0]; }).length; if (n) chip(t[0], t[1], n); });
    chipLista = chip('*', 'Minha lista', 0); chipLista.hidden = true; chipLista.classList.add('chip-lista');
    var esperaBusca = 0;
    $('busca').addEventListener('input', function () { termo = $('busca').value; clearTimeout(esperaBusca); esperaBusca = setTimeout(repintar, 140); });
    $('p-ant').addEventListener('click', function () { pintarPeca(atual - 1); });
    $('p-prox').addEventListener('click', function () { pintarPeca(atual + 1); });
    $('p-gosto').addEventListener('click', function () { if (lista[atual]) alternar(lista[atual]); });
    document.addEventListener('keydown', function (ev) { if (aberta !== folhaPeca || lista.length < 2) return; if (ev.key === 'ArrowRight') pintarPeca(atual + 1); if (ev.key === 'ArrowLeft') pintarPeca(atual - 1); });
    /* deslizar o dedo sobre a foto também troca de peça */
    var dedoX = null;
    var dedoY = 0;
    $('p-quadro').addEventListener('pointerdown', function (ev) { dedoX = ev.clientX; dedoY = ev.clientY; });
    $('p-quadro').addEventListener('pointermove', function (ev) { if ($('p-quadro').classList.contains('perto')) mirar(ev); });
    $('p-quadro').addEventListener('pointerup', function (ev) {
      if (dedoX === null) return; var dx = ev.clientX - dedoX, eraPerto = $('p-quadro').classList.contains('perto'); dedoX = null;
      if (ev.target.closest && ev.target.closest('.p-seta')) return;
      if (Math.abs(dx) < 8) { if (Math.abs(ev.clientY - dedoY) < 8 && !folhaPeca.classList.contains('rolando')) { mirar(ev); perto(!eraPerto); } return; }
      if (!eraPerto && lista.length > 1 && Math.abs(dx) > 40) pintarPeca(atual + (dx < 0 ? 1 : -1));
    });
    $('p-enviar').addEventListener('click', function () {
      var p = lista[atual]; if (!p) return;
      var url = location.href.split('#')[0].split('?')[0] + '#peca-' + p.id;
      if (navigator.share) { navigator.share({ title: p.legenda + ' na ' + nome, url: url }).catch(function () { /* a pessoa desistiu */ }); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { aviso('Link desta peça copiado. É só colar na conversa.'); }, function () { aviso('Copie o endereço desta página para mostrar a peça.'); }); return; }
      aviso('Copie o endereço desta página para mostrar a peça.');
    });
    /* Me surpreenda: sorteia uma peça entre as que estão na tela; as fotos passam rápido antes de parar na sorteada */
    $('surpresa').addEventListener('click', function () {
      if (!pintado) { pintado = true; pintarCatalogo(); }
      if (!lista.length) lista = CAT.slice();
      var alvo = lista[Math.floor(Math.random() * lista.length)], k = 0;
      if (calmo || lista.length < 3) { verPeca(alvo); return; }
      verPeca(lista[Math.floor(Math.random() * lista.length)]); folhaPeca.classList.add('rolando');
      var t = setInterval(function () {
        k++;
        if (k >= 8 || aberta !== folhaPeca) { clearInterval(t); folhaPeca.classList.remove('rolando'); if (aberta === folhaPeca) pintarPeca(lista.indexOf(alvo)); return; }
        pintarPeca(Math.floor(Math.random() * lista.length));
      }, 110);
    });
  } else { $('aba-catalogo').hidden = true; $('b-catalogo').hidden = true; }

  /* duas vistas na mesma página: Início e Catálogo. O endereço ganha #catalogo, então o botão de voltar do celular funciona e dá para mandar o link direto do catálogo.
     Cada peça também tem o seu endereço (#peca-49): quem recebe o link cai direto na foto dela. */
  function trocar(qual) {
    document.body.setAttribute('data-vista', qual);
    $('inicio').hidden = qual !== 'inicio'; $('catalogo').hidden = qual !== 'catalogo';
    if (qual === 'catalogo') $('aba-inicio').removeAttribute('aria-current'); else $('aba-inicio').setAttribute('aria-current', 'page');
    if (qual === 'catalogo') $('aba-catalogo').setAttribute('aria-current', 'page'); else $('aba-catalogo').removeAttribute('aria-current');
    if (qual === 'catalogo' && !pintado) { pintado = true; pintarCatalogo(); }
    scrollTo(0, 0); sacola();
    if (qual === 'catalogo') { embaralha($('t-cat'), 'Catálogo'); if (luzX < -900) apontar(innerWidth * .7, innerHeight * .3); setTimeout(focar, 700); }
  }
  function pecaDoEndereco(h) { var id = h.indexOf('#peca-') === 0 ? h.slice(6) : '', p = null; CAT.forEach(function (c) { if (id && c.id === id) p = c; }); return p; }
  function vista(primeira) {
    var h = location.hash, peca = pecaDoEndereco(h), qual = CAT.length && (h === '#catalogo' || h.indexOf('#peca-') === 0) ? 'catalogo' : 'inicio';
    if (qual === document.body.getAttribute('data-vista') && !primeira) {
      if (peca) { verPeca(peca); return; }
      if (h === '#inicio' || h === '#catalogo') { if (aberta) fechar(); scrollTo({ top: 0, behavior: calmo ? 'auto' : 'smooth' }); }
      return;
    }
    if (aberta) { aberta.hidden = true; aberta = null; veu.hidden = true; document.body.classList.remove('com-folha'); }
    if (primeira || calmo) { trocar(qual); if (peca) verPeca(peca); return; }
    if (document.startViewTransition) { document.startViewTransition(function () { trocar(qual); if (peca) verPeca(peca); }); return; }
    trocar(qual); var el = $(qual); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra'); if (peca) verPeca(peca);
  }
  addEventListener('hashchange', function () { vista(false); });
  [].forEach.call(document.querySelectorAll('a[href="#inicio"], a[href="#catalogo"]'), function (a) { a.addEventListener('click', function () { if (location.hash === a.getAttribute('href')) vista(false); }); });
  vista(true);

  /* oferece o contato ao abrir, uma vez por visita, só no celular: é nele que o cartão é encostado.
     No computador a página abre direto; o botão Salvar contato continua disponível. */
  /* espera a abertura terminar; se a pessoa já foi para o catálogo ou abriu outra folha, não interrompe */
  if (iphone || android) setTimeout(function () { if (document.body.getAttribute('data-vista') === 'inicio' && !aberta) abrir(); }, calmo ? 900 : 2100);
})();
