/* Finalização do pedido: confere o carrinho, pede nome, e-mail, WhatsApp e a descrição (500 a 3.000 caracteres)
   e envia para o meu sistema de pedidos. O preço não vai pronto: o servidor refaz a conta com a mesma tabela.
   A verificação contra robôs (Cloudflare Turnstile) só é carregada nesta tela. */
window.MUL_PEDIDO = (function () {
  'use strict';
  var API = 'https://cobrancas.contato-aea.workers.dev';
  var MIN = 500, MAX = 3000, RASCUNHO = 'mul-pedido-rascunho';
  var O = window.MUL_ORC;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var config = null, widget = null, ficha = null, scriptPedido = false, ligado = false, enviando = false;

  function tamanho(t) { return Array.from(t.trim()).length; }
  function digitos(t) { var d = String(t || '').replace(/\D/g, ''); return d.length >= 12 && d.slice(0, 2) === '55' ? d.slice(2) : d; }
  function zapValido(t) { return /^[1-9][1-9](9\d{8}|[2-8]\d{7})$/.test(digitos(t)); }
  function zapFormatado(t) {
    var d = digitos(t);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return t;
  }
  function emailValido(t) { return /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(t.trim()) && t.trim().length <= 120; }
  function estado(t, erro) { var p = $('fin-estado'); p.textContent = t; p.classList.toggle('erro', !!erro); }
  function erroCampo(id, t) {
    $(id + '-erro').textContent = t || '';
    var c = $(id === 'fin-aceite' ? 'fin-aceite' : id);
    if (t) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
  }

  /* rascunho: só nesta aba do navegador (sessionStorage), para não perder o texto ao voltar e mudar o pedido */
  function salvarRascunho() {
    try { sessionStorage.setItem(RASCUNHO, JSON.stringify({ nome: $('fin-nome').value, email: $('fin-email').value, whats: $('fin-whats').value, texto: $('fin-texto').value })); } catch (e) { /* sem armazenamento */ }
  }
  function lerRascunho() {
    try {
      var r = JSON.parse(sessionStorage.getItem(RASCUNHO) || 'null');
      if (r) { $('fin-nome').value = r.nome || ''; $('fin-email').value = r.email || ''; $('fin-whats').value = r.whats || ''; $('fin-texto').value = (r.texto || '').slice(0, MAX); }
    } catch (e) { /* sem rascunho */ }
  }
  function apagarRascunho() { try { sessionStorage.removeItem(RASCUNHO); } catch (e) { /* nada */ } }

  function contar() {
    var n = tamanho($('fin-texto').value), p = $('fin-conta');
    p.classList.toggle('ok', n >= MIN);
    p.textContent = n < MIN ? n + ' de ' + MIN + ' caracteres no mínimo. Faltam ' + (MIN - n) + '.' : n + ' de ' + MAX + ' caracteres. Pronto para enviar.';
  }

  function listar(ul, linhas) {
    ul.textContent = '';
    linhas.forEach(function (x) {
      var li = el('li');
      li.appendChild(el('span', null, x.descricao));
      li.appendChild(el('b', null, (x.valor || x.valor_txt) + '. Prazo: ' + (x.prazo || x.prazo_txt)));
      ul.appendChild(li);
    });
  }
  function emailAlternativo() {
    var T = O.total(), l = ['Olá! Montei este pedido no site da Mil e Uma Linhas!:', ''];
    O.linhas().forEach(function (x) { l.push('- ' + x.descricao + ': ' + x.valor + '. Prazo: ' + x.prazo); });
    l.push('', 'Estimativa total: ' + T.valor + '. Prazo somado: ' + T.prazo, '', 'Nome: ' + $('fin-nome').value.trim(), 'WhatsApp: ' + $('fin-whats').value.trim(), '', 'O que eu quero:', $('fin-texto').value.trim());
    return 'mailto:' + O.EMAIL + '?subject=' + encodeURIComponent('Pedido de orçamento') + '&body=' + encodeURIComponent(l.join('\n'));
  }
  function mostrarAlternativa(sim) {
    $('fin-alternativa').hidden = !sim;
    if (sim) $('fin-email').href = emailAlternativo();
  }

  /* Turnstile */
  function desenharRobo() {
    if (widget !== null || !window.turnstile || !config || !config.sitekey) return;
    widget = window.turnstile.render('#fin-robo', {
      sitekey: config.sitekey, action: 'pedido', language: 'pt-br', theme: 'auto', size: 'flexible',
      callback: function (t) { ficha = t; },
      'expired-callback': function () { ficha = null; },
      'error-callback': function () { ficha = null; estado('A verificação contra robôs não carregou. Recarregue a página ou envie por e-mail.', true); mostrarAlternativa(true); }
    });
  }
  function carregarRobo() {
    if (window.turnstile) return desenharRobo();
    window.mulTurnstilePronto = desenharRobo;
    if (scriptPedido) return;
    scriptPedido = true;
    var sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=mulTurnstilePronto';
    sc.async = true;
    sc.onerror = function () { estado('Não consegui carregar a verificação contra robôs. Confira a internet ou envie por e-mail.', true); mostrarAlternativa(true); };
    document.head.appendChild(sc);
  }
  function refazerRobo() { ficha = null; if (widget !== null && window.turnstile) window.turnstile.reset(widget); }

  async function buscarConfig() {
    if (config) return config;
    try {
      var r = await fetch(API + '/api/pedidos/config', { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
      config = r.ok ? await r.json() : { ativo: false };
    } catch (e) { config = null; return { ativo: false, offline: true }; }
    if (config.texto_min) MIN = config.texto_min;
    if (config.texto_max) MAX = config.texto_max;
    return config;
  }

  function conferir() {
    var ok = true, nome = $('fin-nome').value.replace(/\s+/g, ' ').trim();
    erroCampo('fin-nome', nome.length < 2 ? 'Informe seu nome.' : /[<>]/.test(nome) ? 'O nome não pode ter os sinais < e >.' : '');
    erroCampo('fin-email', emailValido($('fin-email').value) ? '' : 'Informe um e-mail válido, como nome@empresa.com.br.');
    erroCampo('fin-whats', zapValido($('fin-whats').value) ? '' : 'Informe o WhatsApp com DDD, como (65) 99999-9999.');
    var n = tamanho($('fin-texto').value);
    erroCampo('fin-texto', n < MIN ? 'Faltam ' + (MIN - n) + ' caracteres para o mínimo de ' + MIN + '.' : n > MAX ? 'Passou ' + (n - MAX) + ' caracteres do limite.' : '');
    erroCampo('fin-aceite', $('fin-aceite').checked ? '' : 'Marque que concorda para eu poder responder.');
    ['fin-nome', 'fin-email', 'fin-whats', 'fin-texto', 'fin-aceite'].some(function (id) {
      if ($(id + '-erro').textContent) { ok = false; $(id).focus(); return true; }
      return false;
    });
    return ok;
  }

  async function enviar() {
    if (enviando) return;
    estado('');
    if (!O.linhas().length) { estado('O pedido está vazio. Volte e adicione pelo menos um item.', true); return; }
    if (!conferir()) { estado('Confira os campos marcados.', true); return; }
    if (!config || !config.ativo) { estado('O envio pelo site está desligado agora. Use o botão de e-mail abaixo: o texto vai junto.', true); mostrarAlternativa(true); return; }
    if (!ficha) { estado('Espere a verificação contra robôs terminar e clique de novo.', true); return; }
    enviando = true;
    var b = $('fin-enviar'); b.disabled = true; b.setAttribute('aria-busy', 'true'); estado('Enviando...');
    var corpo = {
      nome: $('fin-nome').value, email: $('fin-email').value, whatsapp: $('fin-whats').value, texto: $('fin-texto').value,
      consentimento: $('fin-aceite').checked, site_web: $('fin-site').value,
      itens: O.paraEnvio(), total_visto: O.total().valor, turnstile: ficha
    };
    var r, j = {};
    try {
      r = await fetch(API + '/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), credentials: 'omit', referrerPolicy: 'no-referrer' });
      try { j = await r.json(); } catch (e) { j = {}; }
    } catch (e) { r = null; }
    enviando = false; b.disabled = false; b.removeAttribute('aria-busy');
    if (!r) { estado('Não consegui falar com o servidor. Confira a internet e tente de novo, ou envie por e-mail.', true); mostrarAlternativa(true); return; }
    if (r.status === 201) return concluir(j);
    var msg = j.erro || 'Não consegui registrar o pedido. Tente de novo em instantes.';
    if (j.codigo === 'verificacao' || j.codigo === 'verificacao_fora') refazerRobo();
    if (j.codigo === 'nome') erroCampo('fin-nome', msg);
    if (j.codigo === 'email') erroCampo('fin-email', msg);
    if (j.codigo === 'whatsapp') erroCampo('fin-whats', msg);
    if (j.codigo === 'texto') erroCampo('fin-texto', msg);
    if (j.codigo === 'consentimento') erroCampo('fin-aceite', msg);
    estado(msg, true);
    if (r.status >= 500 || r.status === 429) mostrarAlternativa(true);
  }

  function concluir(j) {
    $('fin-protocolo').textContent = j.protocolo;
    listar($('fin-ok-itens'), j.itens);
    $('fin-ok-total').textContent = 'Total estimado: ' + j.total_txt + '. Prazo somado: ' + j.prazo_txt + '.';
    var av = $('fin-ok-aviso');
    av.hidden = !j.divergente;
    av.textContent = j.divergente ? 'A tabela de preços mudou enquanto o pedido estava aberto. Os valores acima são os da tabela atual.' : '';
    O.esvaziar(); apagarRascunho();
    ['fin-nome', 'fin-email', 'fin-whats', 'fin-texto'].forEach(function (id) { $(id).value = ''; });
    $('fin-aceite').checked = false; refazerRobo(); estado('');
    document.querySelector('#fin .fin-grade').hidden = true;
    document.querySelector('#fin > .intro').hidden = true;
    $('fin-ok').hidden = false; $('fin-ok').focus();
  }

  function ligar() {
    if (ligado) return;
    ligado = true;
    lerRascunho(); contar();
    $('fin-texto').addEventListener('input', function () { contar(); salvarRascunho(); if ($('fin-texto-erro').textContent && tamanho(this.value) >= MIN) erroCampo('fin-texto', ''); });
    ['fin-nome', 'fin-email', 'fin-whats'].forEach(function (id) { $(id).addEventListener('input', salvarRascunho); });
    $('fin-whats').addEventListener('blur', function () { if (zapValido(this.value)) { this.value = zapFormatado(this.value); salvarRascunho(); } });
    $('fin-aceite').addEventListener('change', function () { if (this.checked) erroCampo('fin-aceite', ''); });
    $('fin-enviar').addEventListener('click', enviar);
    $('fin-email').addEventListener('click', function () { this.href = emailAlternativo(); });
    $('fin-copiar-prot').addEventListener('click', function () {
      var t = $('fin-protocolo').textContent, b = this;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1500); }, function () {});
    });
  }

  async function abrir() {
    ligar();
    var vazio = !O.linhas().length, ok = $('fin-ok');
    if (vazio && !ok.hidden) return; // acabou de enviar: mantém a confirmação na tela
    ok.hidden = true;
    document.querySelector('#fin .fin-grade').hidden = false;
    document.querySelector('#fin > .intro').hidden = false;
    listar($('fin-itens'), O.linhas());
    var T = O.total();
    $('fin-total').textContent = vazio ? '' : 'Total estimado: ' + T.valor + '. Prazo somado: ' + T.prazo + '.';
    $('fin-campos').hidden = vazio;
    if (vazio) { $('fin-itens').appendChild(el('li', 'vazio', 'O pedido está vazio. Volte, monte um item e clique em Adicionar ao pedido.')); }
    var h = $('t-orcamento'); if (h && h.scrollIntoView) h.scrollIntoView({ block: 'start' });
    if (vazio) return;
    mostrarAlternativa(false);
    var c = await buscarConfig();
    if (c.ativo) { estado(''); carregarRobo(); }
    else { estado(c.offline ? 'Não consegui falar com o servidor agora. Você pode tentar de novo mais tarde ou enviar por e-mail.' : 'O envio pelo site ainda está sendo ligado. Por enquanto, preencha e use o botão de e-mail: o texto vai junto.', true); mostrarAlternativa(true); }
  }

  return { abrir: abrir };
})();
