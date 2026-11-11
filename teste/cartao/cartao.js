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
  [['etiqueta1', L.ondeCurto], ['etiqueta2', L.etiqueta]].forEach(function (p) { if (p[1]) { $(p[0]).hidden = false; $(p[0]).lastChild.textContent = p[1]; } });
  $('pilula-logo').src = L.logo; $('pilula-nome').textContent = nome; $('pilula-onde').textContent = L.ondeCurto || '';
  /* fita do alto: as mesmas palavras duas vezes, para a volta não dar salto */
  if ((L.fita || []).length) { $('fita').hidden = false; [].forEach.call(document.querySelectorAll('.fita-tk'), function (tk) { L.fita.forEach(function (t) { var s = document.createElement('span'); s.textContent = t; tk.appendChild(s); var p = document.createElement('i'); p.textContent = '/'; tk.appendChild(p); }); }); }
  $('frase').textContent = L.frase; $('onde').textContent = L.onde;
  if (L.frase2) $('frase2').textContent = L.frase2; else $('frase2').hidden = true;
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
  (L.sobre || []).forEach(function (par) {
    var li = document.createElement('li'), e = document.createElement('span'), t = document.createElement('span');
    e.className = 'emoji'; e.setAttribute('aria-hidden', 'true'); e.textContent = par[0]; t.textContent = par[1];
    li.appendChild(e); li.appendChild(t); ul.appendChild(li);
  });
  if (!(L.sobre || []).length) $('sobre').hidden = true;

  /* pílula com o nome da loja, que aparece no alto quando o topo sai de vista */
  if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { $('pilula').hidden = v[0].isIntersecting; }, { threshold: 0 }).observe(document.querySelector('.topo'));

  /* atalho do WhatsApp que aparece no pé da tela quando o botão grande sai de vista */
  var flutua = $('flutua');
  flutua.href = $('b-whats').href; flutua.target = '_blank'; flutua.setAttribute('aria-label', 'Abrir conversa com a ' + nome + ' no WhatsApp');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) { flutua.hidden = v[0].isIntersecting || document.body.classList.contains('com-folha'); }, { threshold: 0 }).observe($('b-whats'));
  }

  /* vitrine: as fotos passam sozinhas para a direita. Para ao tocar, ao passar o mouse, ao receber o foco ou pelo botão Pausar.
     Quem pediu menos movimento no aparelho recebe a fila parada, para deslizar com o dedo. */
  var grade = $('grade'), fotos = L.fotos || [];
  function cartaoFoto(f, copia) {
    var d = document.createElement('div');
    d.className = 'foto cor-' + (f.cor || 'a');
    if (f.arquivo) { var q = document.createElement('span'); q.className = 'foto-quadro'; var im = document.createElement('img'); im.src = f.arquivo; im.alt = copia ? '' : f.legenda; im.width = 720; im.height = 720; im.loading = 'lazy'; im.decoding = 'async'; q.appendChild(im); d.appendChild(q); var leg = document.createElement('span'); leg.className = 'foto-nome'; leg.textContent = f.legenda; if (!copia) leg.setAttribute('aria-hidden', 'true'); d.appendChild(leg); }
    else { d.setAttribute('role', 'img'); d.setAttribute('aria-label', f.legenda); var selo = document.createElement('span'); selo.className = 'selo'; selo.setAttribute('aria-hidden', 'true'); selo.textContent = 'Foto em breve'; d.appendChild(selo); }
    if (copia) { d.setAttribute('aria-hidden', 'true'); d.removeAttribute('role'); d.removeAttribute('aria-label'); }
    grade.appendChild(d);
  }
  fotos.forEach(function (f) { cartaoFoto(f, false); });
  if (!fotos.length) document.querySelector('.pecas').hidden = true;
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fotos.length > 2 && !calmo && window.requestAnimationFrame) {
    fotos.forEach(function (f) { cartaoFoto(f, true); });
    grade.classList.add('passando');
    var parada = false, manual = false, ocupada = 0, antesT = 0, pos = -1, botao = $('pausa');
    botao.hidden = false;
    botao.addEventListener('click', function () { manual = !manual; botao.textContent = manual ? 'Continuar' : 'Pausar'; botao.setAttribute('aria-pressed', manual ? 'true' : 'false'); });
    function segura() { ocupada = Date.now() + 2500; pos = -1; }
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { grade.addEventListener(ev, segura, { passive: true }); });
    grade.addEventListener('mouseenter', function () { parada = true; }); grade.addEventListener('mouseleave', function () { parada = false; pos = -1; });
    grade.addEventListener('focusin', function () { parada = true; }); grade.addEventListener('focusout', function () { parada = false; pos = -1; });
    function passo(t) {
      var meio = grade.scrollWidth / 2, dt = Math.min(64, t - (antesT || t)); antesT = t;
      if (meio > grade.clientWidth && !parada && !manual && !document.hidden && Date.now() > ocupada) {
        if (pos < 0) pos = grade.scrollLeft;
        pos -= dt * 0.03; /* cerca de 30 px por segundo, para a direita */
        if (pos <= 0) pos += meio;
        grade.scrollLeft = pos;
      } else if (grade.scrollLeft <= 0 && meio > 0) { grade.scrollLeft = meio; }
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
    $('agora').hidden = false; $('agora').className = 'agora ' + (e.aberta ? 'aberta' : 'fechada'); $('agora-texto').textContent = e.texto + (e.resto ? ' · ' + e.resto : '');
    $('estado').className = 'estado ' + (e.aberta ? 'aberta' : 'fechada'); $('estado').textContent = frase;
    var hh = L.horario[agoraNaLoja().dia]; $('hoje-grande').hidden = false; $('hoje-grande').firstChild.textContent = hh ? hora(hh[0]) + ' às ' + hora(hh[1]) : 'Fechada';
    $('pilula-estado').className = 'pilula-estado ' + (e.aberta ? 'aberta' : 'fechada'); $('pilula-texto').textContent = e.aberta ? 'Aberta' : 'Fechada';
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
  var folha = $('folha'), folhaQr = $('folha-qr'), veu = $('veu'), antes = null, aberta = null;
  $('f-salvar').href = L.contato; $('f-salvar').setAttribute('download', 'contato-da-loja.vcf');
  function mostrar(qual, foco) { if (aberta) aberta.hidden = true; else antes = document.activeElement; aberta = qual; qual.hidden = false; veu.hidden = false; document.body.classList.add('com-folha'); $('flutua').hidden = true; foco.focus(); }
  function abrir() { mostrar(folha, $('f-salvar')); }
  function fechar() { if (!aberta) return; aberta.hidden = true; aberta = null; veu.hidden = true; document.body.classList.remove('com-folha'); if (antes && antes.focus) antes.focus(); }
  $('b-contato').addEventListener('click', abrir);
  $('f-nao').addEventListener('click', fechar);
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

  /* as seções surgem ao entrar na tela, uma vez. Sem isso para quem pediu menos movimento. */
  if (!calmo && 'IntersectionObserver' in window) {
    var surge = new IntersectionObserver(function (v) { v.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('veio'); surge.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(document.querySelectorAll('.corpo > section, .corpo > .banda, .corpo > .indicar'), function (el) { el.classList.add('vem'); surge.observe(el); });
  }

  /* oferece o contato ao abrir, uma vez por visita, só no celular: é nele que o cartão é encostado.
     No computador a página abre direto; o botão Salvar contato continua disponível. */
  if (iphone || android) setTimeout(abrir, 600);
})();
