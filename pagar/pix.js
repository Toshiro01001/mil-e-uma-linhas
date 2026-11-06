/* Pix estático (BR Code do Banco Central) gerado no navegador.
   A chave, o nome e a cidade são fixos neste arquivo: nada vindo do endereço da página muda para quem o dinheiro vai.
   Do endereço só são lidos o valor (?valor=1200,00) e a referência (?ref=MUL0001). Nada é enviado a servidor. */
(function () {
  'use strict';
  var CHAVE = 'contato@mileumalinhas.com.br';
  var NOME = 'RODRIGO TERROSO JUNIOR'; // até 25 caracteres, sem acento
  var CIDADE = 'CUIABA';               // até 15 caracteres, sem acento
  var MAXIMO = 999999.99;

  function campo(id, valor) {
    var n = String(valor.length);
    return id + (n.length < 2 ? '0' + n : n) + valor;
  }
  function crc16(texto) { // CRC-16/CCITT-FALSE, como pede o manual do BR Code
    var crc = 0xFFFF;
    for (var i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (var b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return ('000' + crc.toString(16).toUpperCase()).slice(-4);
  }
  function lerValor(t) {
    t = String(t || '').trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
    if (!t) return { vazio: true };
    if (/,/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(t)) return { erro: 'Use só números, como 1.200,00.' };
    var v = Number(t);
    if (!(v >= 0.01)) return { erro: 'O valor precisa ser de pelo menos R$ 0,01.' };
    if (v > MAXIMO) return { erro: 'Valor alto demais para esta página. Me escreva para combinarmos.' };
    return { valor: v };
  }
  function limparRef(t) { return String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 25); }
  function payload(valor, ref) {
    var conta = campo('00', 'br.gov.bcb.pix') + campo('01', CHAVE);
    var p = campo('00', '01') + campo('26', conta) + campo('52', '0000') + campo('53', '986');
    if (valor != null) p += campo('54', valor.toFixed(2));
    p += campo('58', 'BR') + campo('59', NOME) + campo('60', CIDADE) + campo('62', campo('05', ref || '***')) + '6304';
    return p + crc16(p);
  }
  function reais(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

  var $ = function (id) { return document.getElementById(id); };
  var eValor = $('valor'), eRef = $('ref'), eErro = $('valor-erro'), eQr = $('qr'), eCod = $('codigo'), eRes = $('resumo'), eAviso = $('aviso-copia'), eCopiar = $('copiar');

  function desenharQr(texto, rotulo) {
    var q = qrcode(0, 'M'); q.addData(texto); q.make();
    var n = q.getModuleCount(), m = 4, ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + (n + 2 * m) + ' ' + (n + 2 * m));
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', rotulo);
    svg.setAttribute('shape-rendering', 'crispEdges');
    var fundo = document.createElementNS(ns, 'rect');
    fundo.setAttribute('width', n + 2 * m); fundo.setAttribute('height', n + 2 * m); fundo.setAttribute('fill', '#ffffff');
    svg.appendChild(fundo);
    var d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    var caminho = document.createElementNS(ns, 'path'); caminho.setAttribute('d', d); caminho.setAttribute('fill', '#000000');
    svg.appendChild(caminho);
    eQr.textContent = ''; eQr.appendChild(svg);
  }
  function atualizar() {
    var lido = lerValor(eValor.value), ref = limparRef(eRef.value);
    if (eRef.value !== ref && document.activeElement !== eRef) eRef.value = ref;
    eValor.setAttribute('aria-invalid', lido.erro ? 'true' : 'false');
    eErro.textContent = lido.erro || '';
    if (lido.erro) { eCod.value = ''; eQr.textContent = ''; eRes.textContent = 'Corrija o valor para gerar o código.'; eCopiar.disabled = true; return; }
    var v = lido.vazio ? null : lido.valor, codigo = payload(v, ref);
    eCod.value = codigo; eCopiar.disabled = false;
    var txt = (v == null ? 'Valor a digitar no app do banco' : reais(v)) + (ref ? ' · referência ' + ref : '');
    eRes.textContent = txt;
    desenharQr(codigo, 'QR Code Pix: ' + txt);
  }
  eValor.addEventListener('input', atualizar);
  eRef.addEventListener('input', atualizar);
  eRef.addEventListener('blur', function () { eRef.value = limparRef(eRef.value); atualizar(); });
  eCopiar.addEventListener('click', function () {
    var ok = function () { eAviso.textContent = 'Código copiado. Agora cole no Pix copia e cola do seu banco.'; };
    var falha = function () { eCod.focus(); eCod.select(); eAviso.textContent = 'Não consegui copiar sozinho. O código está selecionado: copie com o menu do seu aparelho.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(eCod.value).then(ok, falha); else falha();
  });

  var q = new URLSearchParams(location.search);
  if (q.has('valor')) eValor.value = q.get('valor').slice(0, 20);
  if (q.has('ref')) eRef.value = limparRef(q.get('ref'));
  atualizar();
  window.MUL_PIX = { payload: payload, crc16: crc16, lerValor: lerValor, limparRef: limparRef };
})();
