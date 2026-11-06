/* Núcleo do Pix estático (BR Code do Banco Central), usado pela página de pagamento e pelo gerador de links.
   A chave, o nome e a cidade ficam fixos aqui: nada vindo do endereço da página muda para quem o dinheiro vai. */
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

  window.MUL_PIX = { payload: payload, crc16: crc16, lerValor: lerValor, limparRef: limparRef, reais: reais };
})();
