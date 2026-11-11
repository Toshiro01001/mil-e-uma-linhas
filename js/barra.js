/* Mil e Uma Linhas!  Barra de abas em telas médias.
   Mede se as sete abas cabem na barra. Se não couberem, liga os degraus .ap1 a .ap5 (css/site.css), um por vez,
   até caber. Refaz a conta quando a janela muda de tamanho, a aparência troca, as fontes chegam
   ou o botão "Meu pedido" aparece. No celular (até 900 px) a barra tem o próprio desenho e nada é ligado. */
(function () {
  'use strict';
  var barra = document.querySelector('.abas'), nav = barra && barra.querySelector('nav');
  if (!nav) return;
  var DEGRAUS = ['ap1', 'ap2', 'ap3', 'ap4', 'ap5'], larga = window.matchMedia('(min-width: 901px)');
  function ajustar() {
    DEGRAUS.forEach(function (d) { barra.classList.remove(d); });
    if (!larga.matches || !nav.clientWidth) return;
    for (var i = 0; i < DEGRAUS.length && nav.scrollWidth > nav.clientWidth + 1; i++) barra.classList.add(DEGRAUS[i]);
  }
  var espera = 0;
  window.addEventListener('resize', function () { cancelAnimationFrame(espera); espera = requestAnimationFrame(ajustar); });
  window.addEventListener('mul:tema', ajustar);
  window.addEventListener('hashchange', function () { requestAnimationFrame(ajustar); });   /* a aba ativa pode ser mais larga que as outras */
  window.addEventListener('load', ajustar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
  var pedido = document.getElementById('carrinho-topo');
  if (pedido && 'MutationObserver' in window) new MutationObserver(ajustar).observe(pedido, { attributes: true, childList: true, subtree: true, characterData: true });
  ajustar();
})();
