/* Página de pagamento do cliente. O valor e a referência vêm só do link que eu envio
   (?valor=1200,00&ref=MUL0001) e aparecem travados: o cliente não digita nada.
   Sem valor válido no link, a página não gera código e pede o link certo. Nada é enviado a servidor. */
(function () {
  'use strict';
  var P = window.MUL_PIX;
  var $ = function (id) { return document.getElementById(id); };
  var eQr = $('qr'), eCod = $('codigo'), eAviso = $('aviso-copia'), eCopiar = $('copiar');

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
    eQr.appendChild(svg);
  }

  var q = new URLSearchParams(location.search);
  var lido = P.lerValor((q.get('valor') || '').slice(0, 20));
  var ref = P.limparRef(q.get('ref'));

  if (lido.vazio || lido.erro) {
    $('etapa').hidden = true;
    $('sem-valor').hidden = false;
    return;
  }
  var codigo = P.payload(lido.valor, ref);
  $('mostra-valor').textContent = P.reais(lido.valor);
  $('mostra-ref').textContent = ref || 'sem referência';
  eCod.value = codigo;
  desenharQr(codigo, 'QR Code Pix de ' + P.reais(lido.valor) + (ref ? ', referência ' + ref : ''));

  eCopiar.addEventListener('click', function () {
    var ok = function () { eAviso.textContent = 'Código copiado. Agora cole no Pix copia e cola do seu banco.'; };
    var falha = function () { eCod.focus(); eCod.select(); eAviso.textContent = 'Não consegui copiar sozinho. O código está selecionado: copie com o menu do seu aparelho.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(codigo).then(ok, falha); else falha();
  });
})();
