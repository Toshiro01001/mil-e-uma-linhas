'use strict';
/* Página do cartão de aproximação. O cartão guarda só o endereço desta página.
   Ao abrir, a página oferece salvar o contato da loja; a pessoa confirma no próprio celular. Nada é gravado sem o toque dela.
   A página não guarda nem envia dado de quem visita: sem cadastro, sem cookie, sem contador. */
(function () {
  var L = window.LOJA, $ = function (id) { return document.getElementById(id); };
  function aviso(t, ms) { $('aviso').textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(function () { $('aviso').textContent = ''; }, ms || 7000); }

  var nome = L.nome;
  document.title = nome; $('logo').src = L.logo; $('logo').alt = nome; $('rodape-nome').textContent = nome;
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
  $('b-indicar').setAttribute('aria-label', 'Enviar o link da página da ' + nome + ' para alguém');

  /* frases da própria loja, cada uma com o seu emoji */
  var ul = $('sobre-lista');
  (L.sobre || []).forEach(function (par) {
    var li = document.createElement('li'), e = document.createElement('span'), t = document.createElement('span');
    e.className = 'emoji'; e.setAttribute('aria-hidden', 'true'); e.textContent = par[0]; t.textContent = par[1];
    li.appendChild(e); li.appendChild(t); ul.appendChild(li);
  });
  if (!(L.sobre || []).length) $('sobre').hidden = true;

  /* atalho do WhatsApp que aparece no pé da tela quando o botão grande sai de vista */
  var flutua = $('flutua');
  flutua.href = $('b-whats').href; flutua.target = '_blank'; flutua.setAttribute('aria-label', 'Abrir conversa com a ' + nome + ' no WhatsApp');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (v) { flutua.hidden = v[0].isIntersecting || document.body.classList.contains('com-folha'); }, { threshold: 0 }).observe($('b-whats'));
  }

  var grade = $('grade');
  (L.fotos || []).forEach(function (f) {
    var d = document.createElement('div');
    d.className = 'foto cor-' + f.cor; d.setAttribute('role', 'img'); d.setAttribute('aria-label', f.legenda);
    if (f.arquivo) { var im = document.createElement('img'); im.src = f.arquivo; im.alt = f.legenda; im.loading = 'lazy'; d.appendChild(im); d.removeAttribute('role'); d.removeAttribute('aria-label'); }
    grade.appendChild(d);
  });
  if (!(L.fotos || []).length) document.querySelector('.pecas').hidden = true;

  /* contato */
  var folha = $('folha'), veu = $('veu'), antes = null;
  $('f-salvar').href = L.contato; $('f-salvar').setAttribute('download', 'contato-da-loja.vcf');
  function abrir() { antes = document.activeElement; folha.hidden = false; veu.hidden = false; document.body.classList.add('com-folha'); $('flutua').hidden = true; $('f-salvar').focus(); }
  function fechar() { folha.hidden = true; veu.hidden = true; document.body.classList.remove('com-folha'); if (antes && antes.focus) antes.focus(); }
  $('b-contato').addEventListener('click', abrir);
  $('f-nao').addEventListener('click', fechar);
  veu.addEventListener('click', fechar);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !folha.hidden) fechar(); });
  /* Cada sistema termina de um jeito, e nenhum salva sem a pessoa confirmar. A página diz o próximo toque antes de o celular mudar de tela.
     iPhone: abre a ficha do contato; o botão de salvar fica no fim dela. Android: baixa a ficha e pede para abrir e importar. */
  var ua = navigator.userAgent || '', iphone = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
  var DICA = iphone ? 'Vai abrir a ficha da loja. Role até o fim dela e toque em "Criar Novo Contato".'
    : android ? 'Depois, toque em "Abrir" no alto da tela, escolha Contatos e toque em "Importar".'
      : 'O contato é baixado como arquivo. Abra o arquivo para salvar.';
  var DEPOIS = iphone ? 'Para salvar, role a ficha até o fim e toque em "Criar Novo Contato".'
    : android ? 'Contato baixado. Toque em "Abrir", escolha Contatos e toque em "Importar".'
      : 'Contato baixado. Abra o arquivo para salvar na agenda.';
  $('f-dica').textContent = DICA;
  $('f-salvar').addEventListener('click', function () { setTimeout(function () { fechar(); aviso(DEPOIS, 20000); }, 400); });

  /* indicar */
  $('b-indicar').addEventListener('click', function () {
    var url = location.href.split('#')[0].split('?')[0];
    if (navigator.share) { navigator.share({ title: nome, url: url }).catch(function () { /* a pessoa desistiu */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { aviso('Link copiado. É só colar na conversa.'); }, function () { aviso('Copie o endereço desta página e envie para quem quiser.'); }); return; }
    aviso('Copie o endereço desta página e envie para quem quiser.');
  });

  /* oferece o contato ao abrir, uma vez por visita */
  setTimeout(abrir, 600);
})();
