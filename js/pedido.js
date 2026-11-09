/* Finalização do pedido: confere o carrinho, pede nome, e-mail, WhatsApp e um questionário (uma pergunta por campo, cores,
   material pronto e sites de referência). As respostas viram um texto organizado (500 a 3.000 caracteres) e para o meu sistema de pedidos. O pedido não leva preço: o preço sai depois, no orçamento por escrito.
   A verificação contra robôs (Cloudflare Turnstile) só é carregada nesta tela. */
window.MUL_PEDIDO = (function () {
  'use strict';
  var API = 'https://cobrancas.contato-aea.workers.dev';
  var MIN = 1, MAX = 14000, RASCUNHO = 'mul-pedido-rascunho';
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
  var CAMPOS = ['fin-nome', 'fin-email', 'fin-whats', 'fq-negocio', 'fq-objetivo', 'fq-publico', 'fq-passos', 'fq-extra', 'fq-links', 'fa-logo', 'fa-textos', 'fa-fotos', 'fa-dominio', 'fc-livre', 'fr-1', 'fr-2', 'fr-3', 'fr-gostei', 'fc-primaria', 'fc-secundaria', 'fc-destaque', 'fc-fundo', 'fc-texto'];
  function salvarRascunho() {
    var r = { eu: $('fc-eu').checked };
    CAMPOS.forEach(function (id) { r[id] = $(id).value; });
    try { sessionStorage.setItem(RASCUNHO, JSON.stringify(r)); } catch (e) { /* sem armazenamento */ }
  }
  function lerRascunho() {
    try {
      var r = JSON.parse(sessionStorage.getItem(RASCUNHO) || 'null');
      if (!r) return;
      CAMPOS.forEach(function (id) { if (typeof r[id] === 'string') { try { $(id).value = r[id]; } catch (e) { /* valor inválido */ } } });
      if (typeof r.eu === 'boolean') $('fc-eu').checked = r.eu;
      aplicarCores();
    } catch (e) { /* sem rascunho */ }
  }
  function apagarRascunho() { try { sessionStorage.removeItem(RASCUNHO); } catch (e) { /* nada */ } }

  /* cores: sem escolha própria, o campo fica desligado e eu escolho */
  var COR_ROTULOS = [['fc-primaria', 'Cor principal'], ['fc-secundaria', 'Cor de apoio'], ['fc-destaque', 'Cor de destaque'], ['fc-fundo', 'Fundo'], ['fc-texto', 'Texto']];
  function luz(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = luz(a), y = luz(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function aplicarCores() {
    var eu = $('fc-eu').checked, av = $('fc-aviso');
    COR_ROTULOS.forEach(function (c) { $(c[0]).disabled = eu; });
    if (eu) { av.textContent = ''; return; }
    var r = contraste($('fc-texto').value, $('fc-fundo').value);
    av.textContent = 'Contraste entre texto e fundo: ' + r.toFixed(1).replace('.', ',') + ' para 1. ' + (r >= 4.5 ? 'Bom para ler (mínimo recomendado: 4,5).' : 'Baixo: o texto pode ficar difícil de ler. Eu aviso e sugiro um ajuste.');
  }
  function v(id) { return $(id).value.replace(/\s+/g, ' ').trim(); }
  function compor() {
    var l = [], add = function (t, x) { if (x) l.push(t + ': ' + x); };
    add('Negócio', v('fq-negocio')); add('O que quer', v('fq-objetivo')); add('Quem vai usar', v('fq-publico'));
    add('Como funciona hoje', v('fq-passos')); add('Observação adicional', v('fq-extra'));
    add('Logotipo', v('fa-logo')); add('Textos', v('fa-textos')); add('Fotos', v('fa-fotos')); add('Domínio', v('fa-dominio')); add('Links dos arquivos', v('fq-links'));
    if ($('fc-eu').checked) l.push('Cores: escolher por mim.');
    else l.push('Cores: ' + COR_ROTULOS.map(function (c) { return c[1] + ' ' + $(c[0]).value.toUpperCase(); }).join('; ') + '.');
    add('Cores da marca', v('fc-livre'));
    var refs = ['fr-1', 'fr-2', 'fr-3'].map(v).filter(Boolean);
    if (refs.length) add('Sites ou sistemas de inspiração', refs.join(' | '));
    add('O que gostou neles', v('fr-gostei'));
    return l.join('\n');
  }
  function contar() {
    var n = tamanho(compor()), p = $('fin-conta');
    p.classList.toggle('ok', n >= 1 && n <= MAX);
    p.textContent = n > MAX ? 'Passou ' + (n - MAX) + ' caracteres do limite total. Resuma alguma resposta.' : 'Quanto mais específico você for, melhor para o orçamento.';
  }

  function listar(ul, linhas) {
    ul.textContent = '';
    linhas.forEach(function (x) {
      var li = el('li');
      li.appendChild(el('span', null, x.descricao));
      li.appendChild(el('b', null, 'Prazo estimado: ' + (x.prazo || x.prazo_txt)));
      ul.appendChild(li);
    });
  }
  function textoEmailAlternativo() {
    var T = O.total(), l = ['Olá! Montei este pedido no site da Mil e Uma Linhas!:', ''];
    O.linhas().forEach(function (x) { l.push('- ' + x.descricao + '. Prazo estimado: ' + x.prazo); });
    l.push('', 'Prazo somado: ' + T.prazo + '. Quero receber o orçamento por escrito.', '', 'Nome: ' + $('fin-nome').value.trim(), 'WhatsApp: ' + $('fin-whats').value.trim(), '', 'O que eu quero:', compor());
    return l.join('\n');
  }
  function mostrarAlternativa(sim) {
    $('fin-alternativa').hidden = !sim;
    if (!sim) { $('fin-email-menu').hidden = true; $('fin-email-abrir').setAttribute('aria-expanded', 'false'); }
  }

  /* arquivos do projeto: escolhidos aqui e enviados logo depois que o pedido é registrado */
  var ARQ_MAX = 20, ARQ_LIM = 25 * 1024 * 1024, ARQ_TOTAL = 50 * 1024 * 1024;
  var ARQ_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z', 'ai', 'psd'];
  var arquivos = [];
  function extensao(n) { var i = String(n).lastIndexOf('.'); return i < 0 ? '' : String(n).slice(i + 1).toLowerCase(); }
  function tamTxt(b) { return b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function somaArquivos() { return arquivos.reduce(function (t, f) { return t + f.size; }, 0); }
  function renderArquivos() {
    var ul = $('fa-lista'); ul.textContent = '';
    arquivos.forEach(function (f, i) {
      var li = el('li'); li.appendChild(el('span', 'envio-nome', f.name)); li.appendChild(el('span', 'envio-tam', tamTxt(f.size)));
      var x = el('button', 'botao botao-mini', 'Remover'); x.type = 'button'; x.setAttribute('aria-label', 'Remover o arquivo ' + f.name);
      x.addEventListener('click', function () { arquivos.splice(i, 1); renderArquivos(); $('fa-erro').textContent = ''; });
      li.appendChild(x); ul.appendChild(li);
    });
    if (arquivos.length) { var t = el('li', 'envio-soma', arquivos.length + (arquivos.length === 1 ? ' arquivo' : ' arquivos') + ', ' + tamTxt(somaArquivos()) + ' no total.'); ul.appendChild(t); }
  }
  function adicionarArquivos(lista) {
    var erros = [];
    Array.prototype.forEach.call(lista, function (f) {
      if (arquivos.some(function (a) { return a.name === f.name && a.size === f.size; })) return;
      if (ARQ_EXT.indexOf(extensao(f.name)) < 0) { erros.push(f.name + ': tipo de arquivo não aceito.'); return; }
      if (!f.size) { erros.push(f.name + ': o arquivo está vazio.'); return; }
      if (f.size > ARQ_LIM) { erros.push(f.name + ': passa de 25 MB. Cole o link dele no campo abaixo.'); return; }
      if (arquivos.length >= ARQ_MAX) { erros.push('O limite é de ' + ARQ_MAX + ' arquivos. ' + f.name + ' ficou de fora.'); return; }
      if (somaArquivos() + f.size > ARQ_TOTAL) { erros.push(f.name + ': passaria do total de 50 MB.'); return; }
      arquivos.push(f);
    });
    $('fa-erro').textContent = erros.join(' ');
    renderArquivos();
  }
  function enviarUmArquivo(protocolo, token, f, aoProgresso) {
    return new Promise(function (resolve) {
      var x = new XMLHttpRequest();
      x.open('POST', API + '/api/pedidos/' + encodeURIComponent(protocolo) + '/arquivos');
      x.setRequestHeader('X-Envio-Token', token); x.setRequestHeader('X-Nome-Arquivo', encodeURIComponent(f.name));
      x.setRequestHeader('Content-Type', f.type || 'application/octet-stream');
      x.upload.onprogress = function (e) { if (e.lengthComputable) aoProgresso(Math.round(e.loaded * 100 / e.total)); };
      x.onload = function () {
        var j = {}; try { j = JSON.parse(x.responseText); } catch (e) { j = {}; }
        resolve(x.status === 201 ? { ok: true } : { ok: false, motivo: j.erro || 'o servidor recusou o arquivo.' });
      };
      x.onerror = function () { resolve({ ok: false, motivo: 'falha de conexão.' }); };
      x.ontimeout = function () { resolve({ ok: false, motivo: 'a conexão demorou demais.' }); };
      x.timeout = 10 * 60 * 1000;
      x.send(f);
    });
  }
  async function enviarArquivos(protocolo, token) {
    var av = $('fin-ok-arquivos'), lista = arquivos.slice(), falhas = [];
    av.hidden = false;
    if (!token) { av.textContent = 'Os arquivos não puderam ser enviados agora. Envie por e-mail para ' + O.EMAIL + ' citando o protocolo ' + protocolo + '.'; return; }
    for (var i = 0; i < lista.length; i++) {
      var f = lista[i], pref = 'Enviando arquivo ' + (i + 1) + ' de ' + lista.length + ' (' + f.name + '). Não feche esta página. ';
      av.textContent = pref + '0%';
      var r = await enviarUmArquivo(protocolo, token, f, function (pc) { av.textContent = pref + pc + '%'; });
      if (!r.ok) falhas.push(f.name + ' (' + r.motivo + ')');
    }
    if (!falhas.length) av.textContent = lista.length === 1 ? 'Arquivo enviado com sucesso.' : 'Os ' + lista.length + ' arquivos foram enviados com sucesso.';
    else av.textContent = 'Não consegui enviar: ' + falhas.join('; ') + ' Envie esses arquivos por e-mail para ' + O.EMAIL + ' citando o protocolo ' + protocolo + '.';
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
    erroCampo('fin-whats', zapValido($('fin-whats').value) ? '' : 'Informe o WhatsApp com DDD, como (11) 99999-9999.');
    erroCampo('fq-negocio', v('fq-negocio').length < 2 ? 'Conte o nome e o ramo do seu negócio.' : '');
    erroCampo('fq-objetivo', v('fq-objetivo').length < 10 ? 'Conte o que você quer que o site ou sistema faça.' : '');
    var n = tamanho(compor()), et = $('fin-texto-erro');
    et.textContent = n > MAX ? 'Passou ' + (n - MAX) + ' caracteres do limite. Resuma alguma resposta.' : '';
    erroCampo('fin-aceite', $('fin-aceite').checked ? '' : 'Marque que concorda para eu poder responder.');
    ['fin-nome', 'fin-email', 'fin-whats', 'fq-negocio', 'fq-objetivo', 'fin-texto', 'fin-aceite'].some(function (id) {
      if ($(id + '-erro').textContent) { ok = false; if (id === 'fin-texto') $('fq-extra').focus(); else $(id).focus(); return true; }
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
      nome: $('fin-nome').value, email: $('fin-email').value, whatsapp: $('fin-whats').value, texto: compor(),
      consentimento: $('fin-aceite').checked, site_web: $('fin-site').value,
      itens: O.paraEnvio(), turnstile: ficha
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
    if (j.codigo === 'texto') $('fin-texto-erro').textContent = msg;
    if (j.codigo === 'consentimento') erroCampo('fin-aceite', msg);
    estado(msg, true);
    if (r.status >= 500 || r.status === 429) mostrarAlternativa(true);
  }

  function concluir(j) {
    $('fin-protocolo').textContent = j.protocolo;
    listar($('fin-ok-itens'), j.itens);
    $('fin-ok-total').textContent = j.prazo_txt ? 'Prazo somado: ' + j.prazo_txt + '. O orçamento com o preço chega por escrito depois da nossa conversa.' : '';
    var av = $('fin-ok-aviso');
    av.hidden = true; av.textContent = '';
    O.esvaziar(); apagarRascunho();
    CAMPOS.forEach(function (id) { if ($(id).type !== 'color') $(id).value = ''; }); $('fc-eu').checked = true; aplicarCores();
    var enviar_arq = arquivos.slice(); arquivos = []; renderArquivos();
    $('fin-ok-arquivos').hidden = true;
    $('fin-aceite').checked = false; refazerRobo(); estado('');
    document.querySelector('#fin .fin-grade').hidden = true;
    document.querySelector('#fin > .intro').hidden = true;
    $('fin-ok').hidden = false; $('fin-ok').focus();
    if (enviar_arq.length) { arquivos = enviar_arq; enviarArquivos(j.protocolo, j.envio_token).then(function () { arquivos = []; }); }
  }

  function ligar() {
    if (ligado) return;
    ligado = true;
    lerRascunho(); contar();
    CAMPOS.forEach(function (id) { $(id).addEventListener('input', function () { contar(); salvarRascunho(); if (id === 'fc-texto' || id === 'fc-fundo') aplicarCores(); if (this.getAttribute('aria-invalid') === 'true') erroCampo(id, ''); $('fin-texto-erro').textContent = ''; }); $(id).addEventListener('change', function () { contar(); salvarRascunho(); }); });
    $('fc-eu').addEventListener('change', function () { aplicarCores(); contar(); salvarRascunho(); });
    $('fin-whats').addEventListener('blur', function () { if (zapValido(this.value)) { this.value = zapFormatado(this.value); salvarRascunho(); } });
    $('fin-aceite').addEventListener('change', function () { if (this.checked) erroCampo('fin-aceite', ''); });
    $('fin-enviar').addEventListener('click', enviar);
    O.menuEmail($('fin-email-abrir'), $('fin-email-menu'), function () { return { assunto: 'Pedido de orçamento', corpo: textoEmailAlternativo() }; });
    var drop = $('fa-drop');
    $('fa-arquivos').addEventListener('change', function () { adicionarArquivos(this.files); this.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('sobre'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('sobre'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) adicionarArquivos(e.dataTransfer.files); });
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
    $('fin-total').textContent = vazio ? '' : 'Prazo somado: ' + T.prazo + '.';
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
