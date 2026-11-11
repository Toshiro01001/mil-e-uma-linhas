'use strict';
/* Página do cartão de aproximação. O cartão guarda só o endereço desta página.
   Ao abrir, a página oferece salvar o contato da loja; a pessoa confirma no próprio celular. Nada é gravado sem o toque dela.
   A página não guarda nem envia dado de quem visita: sem cadastro, sem cookie, sem contador. */
(function () {
  var L = window.LOJA, $ = function (id) { return document.getElementById(id); };
  function aviso(t) { $('aviso').textContent = t; clearTimeout(aviso.t); aviso.t = setTimeout(function () { $('aviso').textContent = ''; }, 7000); }

  var nome = L.nome;
  document.title = nome; $('logo').src = L.logo; $('logo').alt = nome; $('rodape-nome').textContent = nome;
  $('frase').textContent = L.frase; $('onde').textContent = L.onde;
  if (L.frase2) $('frase2').textContent = L.frase2; else $('frase2').hidden = true;
  function ligar(id, url, rotulo) { var a = $(id); if (!url) { a.hidden = true; return; } a.href = url; a.target = '_blank'; a.setAttribute('aria-label', rotulo); }
  ligar('b-whats', 'https://wa.me/' + L.whatsapp + '?text=' + encodeURIComponent(L.mensagemWhats), 'Abrir conversa com a ' + nome + ' no WhatsApp');
  ligar('b-insta', L.instagram, 'Abrir o Instagram da ' + nome);
  ligar('b-tiktok', L.tiktok, 'Abrir o TikTok da ' + nome);
  ligar('b-mapa', L.mapa, 'Abrir o mapa com a rota até a ' + nome);
  $('b-contato').setAttribute('aria-label', 'Salvar o contato da ' + nome + ' na agenda');
  $('b-indicar').setAttribute('aria-label', 'Enviar o link da página da ' + nome + ' para alguém');

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
  function abrir() { antes = document.activeElement; folha.hidden = false; veu.hidden = false; document.body.classList.add('com-folha'); $('f-salvar').focus(); }
  function fechar() { folha.hidden = true; veu.hidden = true; document.body.classList.remove('com-folha'); if (antes && antes.focus) antes.focus(); }
  $('b-contato').addEventListener('click', abrir);
  $('f-nao').addEventListener('click', fechar);
  veu.addEventListener('click', fechar);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !folha.hidden) fechar(); });
  $('f-salvar').addEventListener('click', function () { setTimeout(function () { fechar(); aviso('Contato pronto. Toque em "Abrir" para salvar na agenda.'); }, 400); });

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
