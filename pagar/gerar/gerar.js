/* Gerador do link de pagamento de uma etapa. Monta o endereço da página /pagar/ com valor e referência. */
(function () {
  'use strict';
  var P = window.MUL_PIX;
  var $ = function (id) { return document.getElementById(id); };
  var eValor = $('valor'), eRef = $('ref'), eEtapa = $('etapa'), eErro = $('valor-erro'), eLink = $('link'), eMsg = $('msg');
  var bLink = $('copiar-link'), bMsg = $('copiar-msg'), aAbrir = $('abrir'), eAviso = $('aviso');
  var BASE = 'https://mileumalinhas.com.br/pagar/';

  function valorUrl(v) { return v.toFixed(2).replace('.', ','); }
  function atualizar() {
    var lido = P.lerValor(eValor.value), ref = P.limparRef(eRef.value);
    var etapa = eEtapa.value.replace(/\s+/g, ' ').trim().slice(0, 40);
    eValor.setAttribute('aria-invalid', lido.erro ? 'true' : 'false');
    eErro.textContent = lido.erro || (lido.vazio ? 'Digite o valor da etapa.' : '');
    if (lido.erro || lido.vazio) { eLink.value = ''; eMsg.value = ''; bLink.disabled = bMsg.disabled = true; aAbrir.href = '../'; return; }
    var link = BASE + '?valor=' + encodeURIComponent(valorUrl(lido.valor)) + (ref ? '&ref=' + ref : '');
    eLink.value = link; aAbrir.href = link; bLink.disabled = bMsg.disabled = false;
    eMsg.value = 'Olá! Segue o link para pagar ' + (etapa ? 'a etapa "' + etapa + '"' : 'esta etapa') +
      (ref ? ' do orçamento ' + ref : '') + ', no valor de ' + P.reais(lido.valor) + ', por Pix (QR Code ou copia e cola):\n' + link +
      '\n\nAntes de confirmar, confira se o recebedor é Rodrigo de Sousa Terroso Junior, no Mercado Pago. Depois, me mande o comprovante por aqui ou em contato@mileumalinhas.com.br.\n\nRodrigo Terroso Junior | Mil e Uma Linhas!';
  }
  function copiar(texto, ok) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(function () { eAviso.textContent = ok; }, function () { eAviso.textContent = 'Não consegui copiar. Selecione o texto e copie.'; });
    else eAviso.textContent = 'Não consegui copiar. Selecione o texto e copie.';
  }
  [eValor, eRef, eEtapa].forEach(function (e) { e.addEventListener('input', atualizar); });
  eRef.addEventListener('blur', function () { eRef.value = P.limparRef(eRef.value); atualizar(); });
  bLink.addEventListener('click', function () { copiar(eLink.value, 'Link copiado.'); });
  bMsg.addEventListener('click', function () { copiar(eMsg.value, 'Mensagem copiada.'); });
  atualizar();
})();
