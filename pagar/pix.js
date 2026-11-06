/* Página de pagamento do cliente. O link traz só um código aleatório (?c=...).
   O valor, a referência e a situação vêm do meu servidor de cobranças; nada disso pode ser mudado pelo link.
   Com a resposta, gero aqui no navegador o QR Code e o Pix copia e cola. */
(function () {
  'use strict';
  var API = 'https://cobrancas.contato-aea.workers.dev';
  var P = window.MUL_PIX;
  var $ = function (id) { return document.getElementById(id); };
  var eQr = $('qr'), eCod = $('codigo'), eAviso = $('aviso-copia'), eCopiar = $('copiar');
  var codigoUrl = new URLSearchParams(location.search).get('c') || '';

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
  function mostrarCobranca(x) {
    var ref = P.limparRef(x.referencia);
    var codigo = P.payload(x.valor_centavos / 100, ref);
    $('mostra-valor').textContent = P.reais(x.valor_centavos / 100);
    $('mostra-ref').textContent = ref || 'sem referência';
    $('mostra-etapa').textContent = x.etapa || 'sem etapa';
    eCod.value = codigo;
    desenharQr(codigo, 'QR Code Pix de ' + P.reais(x.valor_centavos / 100) + (ref ? ', referência ' + ref : ''));
    $('carregando').hidden = true; $('estado').hidden = true; $('etapa').hidden = false;
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
    mostrarCobranca(x);
  }
  $('tentar').addEventListener('click', carregar);
  eCopiar.addEventListener('click', function () {
    var ok = function () { eAviso.textContent = 'Código copiado. Agora cole no Pix copia e cola do seu banco.'; };
    var falha = function () { eCod.focus(); eCod.select(); eAviso.textContent = 'Não consegui copiar sozinho. O código está selecionado: copie com o menu do seu aparelho.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(eCod.value).then(ok, falha); else falha();
  });
  carregar();
})();
