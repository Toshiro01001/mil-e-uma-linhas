/* Página de pagamento do cliente. O link traz só um código aleatório (?c=...).
   O valor, a referência e a situação vêm do meu servidor de cobranças; nada disso pode ser mudado pelo link.
   Com a resposta, gero aqui no navegador o QR Code e o Pix copia e cola.
   Com o Pix automático ligado, o código vem do Mercado Pago e a página confere sozinha quando o pagamento chega.
   Com o Mercado Pago ligado, o cliente também pode escolher crédito à vista, crédito parcelado (até 6x sem juros e até 12x com juros), débito ou boleto:
   a página pede ao meu servidor um link do Checkout do Mercado Pago para esta cobrança e manda o cliente para lá.
   Na volta, o endereço traz o número do pagamento; o servidor confere esse número com o Mercado Pago antes de aceitar. */
(function () {
  'use strict';
  var API = 'https://cobrancas.contato-aea.workers.dev';
  var P = window.MUL_PIX;
  var $ = function (id) { return document.getElementById(id); };
  var eQr = $('qr'), eCod = $('codigo'), eAviso = $('aviso-copia'), eCopiar = $('copiar');
  var busca = new URLSearchParams(location.search);
  var codigoUrl = busca.get('c') || '';
  // Volta do Mercado Pago: guardo o que interessa e limpo o endereço (o link volta a ser só ?c=...).
  var volta = /^(ok|pendente|falha)$/.test(busca.get('volta') || '') ? busca.get('volta') : null;
  var pagamentoVolta = busca.get('payment_id') || busca.get('collection_id') || '';
  if (!/^\d{6,20}$/.test(pagamentoVolta)) pagamentoVolta = '';
  if (volta && history.replaceState) history.replaceState(null, '', location.pathname + '?c=' + encodeURIComponent(codigoUrl));
  var TEXTO_FORMA = {
    credito: 'Pague com cartão de crédito em uma parcela, sem juros, na página do Mercado Pago.',
    parcelado: 'Pague em até 6x sem juros no cartão de crédito. De 7x a 12x, os juros do parcelamento são cobrados pelo Mercado Pago e aparecem antes de você confirmar.',
    debito: 'Pague com cartão de débito Visa ou Mastercard na página do Mercado Pago, à vista, sem juros.',
    boleto: 'Gere o boleto na página do Mercado Pago e pague no app do banco ou numa lotérica. A confirmação chega quando o banco compensar, em até 3 dias úteis.'
  };

  function estado(titulo, texto, tentar) {
    $('carregando').hidden = true; $('etapa').hidden = true;
    $('t-estado').textContent = titulo; $('p-estado').textContent = texto;
    $('tentar').hidden = !tentar; $('estado').hidden = false;
  }
  function desenharQr(texto, rotulo) {
    var q = qrcode(0, 'M'); q.addData(texto); q.make();
    var n = q.getModuleCount(), m = 4, ns = 'http://www.w3.org/2000/svg', t = n + 2 * m;
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + t + ' ' + t);
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', rotulo);
    svg.setAttribute('shape-rendering', 'crispEdges');
    var fundo = document.createElementNS(ns, 'rect');
    fundo.setAttribute('width', t); fundo.setAttribute('height', t); fundo.setAttribute('fill', '#ffffff');
    svg.appendChild(fundo);
    var d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    var caminho = document.createElementNS(ns, 'path'); caminho.setAttribute('d', d); caminho.setAttribute('fill', '#000000');
    svg.appendChild(caminho);
    eQr.textContent = ''; eQr.appendChild(svg);
  }
  function aviso(titulo, texto, ruim) {
    $('t-volta').textContent = titulo; $('p-volta').textContent = texto;
    $('volta').classList.toggle('ruim', Boolean(ruim)); $('volta').hidden = false;
  }
  function formaEscolhida() { var e = document.querySelector('input[name="forma"]:checked'); return e ? e.value : 'pix'; }
  function mostrarForma() {
    var f = formaEscolhida(), pix = f === 'pix', i, a;
    $('painel-pix').hidden = !pix; $('painel-checkout').hidden = pix;
    a = document.querySelectorAll('.so-pix'); for (i = 0; i < a.length; i++) a[i].hidden = !pix;
    a = document.querySelectorAll('.so-checkout'); for (i = 0; i < a.length; i++) a[i].hidden = pix;
    if (!pix) { $('texto-forma').textContent = TEXTO_FORMA[f] || ''; $('aviso-mp').textContent = ''; }
  }
  var indo = false;
  async function irParaMp() {
    if (indo) return;
    var f = formaEscolhida(), b = $('ir-mp');
    if (!TEXTO_FORMA[f]) return;
    indo = true; b.disabled = true; b.textContent = 'Abrindo o Mercado Pago...'; $('aviso-mp').textContent = '';
    var j = null, st = 0;
    try {
      var r = await fetch(API + '/api/c/' + encodeURIComponent(codigoUrl) + '/checkout', { method: 'POST', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ forma: f }) });
      st = r.status; j = await r.json();
    } catch (e) { j = null; }
    var u = null;
    try { u = j && typeof j.url === 'string' ? new URL(j.url) : null; } catch (e) { u = null; }
    // Só saio desta página para o Mercado Pago, em https.
    if (u && u.protocol === 'https:' && /(^|\.)mercadopago\.com(\.br)?$/.test(u.hostname)) { location.assign(u.href); return; }
    indo = false; b.disabled = false; b.textContent = 'Continuar no Mercado Pago';
    $('aviso-mp').textContent = st === 429 ? 'Muitas tentativas seguidas. Espere alguns minutos ou pague por Pix.'
      : st === 409 ? 'Esta cobrança não aceita mais pagamento. Recarregue a página.'
      : 'Não consegui abrir o Mercado Pago agora. Tente de novo em instantes ou pague por Pix.';
  }
  /* o cliente voltou do Mercado Pago: peço ao servidor para conferir o pagamento */
  async function conferirVolta() {
    if (!pagamentoVolta) return null;
    try {
      var r = await fetch(API + '/api/c/' + encodeURIComponent(codigoUrl) + '/retorno', { method: 'POST', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pagamento: pagamentoVolta }) });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  }
  function modoAutomatico(sim) {
    var i, a;
    a = document.querySelectorAll('.so-manual'); for (i = 0; i < a.length; i++) a[i].hidden = sim;
    a = document.querySelectorAll('.so-auto'); for (i = 0; i < a.length; i++) a[i].hidden = !sim;
    $('intro-manual').hidden = sim; $('intro-auto').hidden = !sim;
  }
  /* Pix automático: peço ao meu servidor um Pix do Mercado Pago para esta cobrança. Se falhar, uso o Pix de sempre. */
  async function pixAutomatico() {
    try {
      var r = await fetch(API + '/api/c/' + encodeURIComponent(codigoUrl) + '/pix', { method: 'POST', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!r.ok) return null;
      var j = await r.json();
      return j && typeof j.qr_code === 'string' && /^0002[\x20-\x7E]{30,700}$/.test(j.qr_code) ? j : null;
    } catch (e) { return null; }
  }
  var timer = null, inicio = 0;
  function vigiar() {
    clearTimeout(timer); inicio = inicio || Date.now();
    var espera = Date.now() - inicio < 10 * 60 * 1000 ? 5000 : 15000;
    if (Date.now() - inicio > 60 * 60 * 1000) return;
    timer = setTimeout(async function () {
      try {
        var r = await fetch(API + '/api/c/' + encodeURIComponent(codigoUrl), { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
        var x = r.ok ? await r.json() : null;
        if (x && x.situacao === 'paga') { clearTimeout(timer); return estado('Pagamento confirmado', 'Recebi o seu pagamento' + (x.referencia ? ' do orçamento ' + P.limparRef(x.referencia) : '') + '. Obrigado! Vou seguir com a próxima etapa e te aviso por e-mail ou WhatsApp.'); }
        if (x && x.situacao === 'vencida') { clearTimeout(timer); return estado('Este link venceu', 'Me escreva para eu enviar um link novo para esta etapa.'); }
      } catch (e) { /* tento de novo no próximo ciclo */ }
      vigiar();
    }, espera);
  }
  async function mostrarCobranca(x) {
    var ref = P.limparRef(x.referencia);
    var codigo = P.payload(x.valor_centavos / 100, ref);
    var mpLigado = x.pix_automatico === true;
    var auto = mpLigado ? await pixAutomatico() : null;
    if (auto) codigo = auto.qr_code;
    modoAutomatico(Boolean(auto));
    // As outras formas só aparecem com o Mercado Pago ligado no servidor.
    $('formas').hidden = !mpLigado;
    if (!mpLigado) document.querySelector('input[name="forma"][value="pix"]').checked = true;
    mostrarForma();
    $('mostra-valor').textContent = P.reais(x.valor_centavos / 100);
    $('mostra-ref').textContent = ref || 'sem referência';
    $('mostra-etapa').textContent = x.etapa || 'sem etapa';
    eCod.value = codigo;
    desenharQr(codigo, 'QR Code Pix de ' + P.reais(x.valor_centavos / 100) + (ref ? ', referência ' + ref : ''));
    $('carregando').hidden = true; $('estado').hidden = true; $('etapa').hidden = false;
    clearTimeout(timer); inicio = 0;
    if (auto || (mpLigado && volta && volta !== 'falha')) vigiar();
  }
  async function carregar() {
    if (!/^[A-Za-z0-9_-]{22}$/.test(codigoUrl)) return estado('Este link de pagamento não é válido', 'Abra o link que enviei depois que você aprovou o orçamento, ou me escreva pedindo o link da etapa.');
    $('estado').hidden = true; $('carregando').hidden = false;
    var r;
    try { r = await fetch(API + '/api/c/' + encodeURIComponent(codigoUrl), { credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' }); }
    catch (e) { return estado('Não consegui buscar a cobrança', 'Confira a sua internet e tente de novo.', true); }
    if (r.status === 404) return estado('Este link de pagamento não é válido', 'Ele pode ter sido cancelado ou digitado errado. Me escreva para eu enviar o link certo.');
    if (r.status === 429) return estado('Muitas consultas seguidas', 'Espere alguns minutos e abra o link de novo.', true);
    var x = null;
    try { x = r.ok ? await r.json() : null; } catch (e) { x = null; }
    if (!x) return estado('Não consegui buscar a cobrança', 'O servidor não respondeu como deveria. Tente de novo em instantes.', true);
    if (x.situacao === 'paga') return estado('Esta etapa já foi paga', 'Recebi o pagamento' + (x.referencia ? ' do orçamento ' + P.limparRef(x.referencia) : '') + '. Não pague de novo. Se tiver dúvida, me escreva.');
    if (x.situacao === 'vencida') return estado('Este link venceu', 'Me escreva para eu enviar um link novo para esta etapa.');
    if (x.situacao !== 'pendente' || !Number.isInteger(x.valor_centavos) || x.valor_centavos < 1 || x.valor_centavos > 99999999) return estado('Não consegui buscar a cobrança', 'Me escreva para conferirmos o pagamento.');
    if (volta) {
      var v = await conferirVolta(); var voltou = volta; volta = volta === 'falha' ? null : volta; pagamentoVolta = '';
      if (v && v.situacao === 'paga') return estado('Pagamento confirmado', 'Recebi o seu pagamento' + (x.referencia ? ' do orçamento ' + P.limparRef(x.referencia) : '') + '. Obrigado! Vou seguir com a próxima etapa e te aviso por e-mail ou WhatsApp.');
      if (voltou === 'falha') aviso('O pagamento não foi concluído', 'O Mercado Pago não aprovou ou você saiu antes de terminar. Escolha outra forma abaixo ou tente de novo.', true);
      else if (voltou === 'pendente') aviso('Pagamento aguardando', 'Se você gerou um boleto, pague até o vencimento. Quando o banco compensar, em até 3 dias úteis, esta etapa aparece como paga. Não precisa deixar esta página aberta.');
      else aviso('Pagamento em análise', 'O Mercado Pago ainda está confirmando o pagamento. Deixe esta página aberta: ela mostra a confirmação assim que chegar. Não pague de novo.');
    }
    await mostrarCobranca(x);
  }
  $('tentar').addEventListener('click', carregar);
  $('formas').addEventListener('change', mostrarForma);
  $('ir-mp').addEventListener('click', irParaMp);
  // Voltar pelo botão do navegador (página guardada em cache): o botão do Mercado Pago volta a funcionar.
  window.addEventListener('pageshow', function () { indo = false; $('ir-mp').disabled = false; $('ir-mp').textContent = 'Continuar no Mercado Pago'; });
  eCopiar.addEventListener('click', function () {
    var ok = function () { eAviso.textContent = 'Código copiado. Agora cole no Pix copia e cola do seu banco.'; };
    var falha = function () { eCod.focus(); eCod.select(); eAviso.textContent = 'Não consegui copiar sozinho. O código está selecionado: copie com o menu do seu aparelho.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(eCod.value).then(ok, falha); else falha();
  });
  carregar();
})();
