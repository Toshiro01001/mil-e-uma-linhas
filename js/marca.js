/* Mil e Uma Linhas!  Aparência "Marca": o fio verde.
   Um fio desce pela margem e acende conforme a leitura avança; cada bloco fica pendurado nele.
   Só mede e escreve uma variável de CSS. Com "menos movimento" ligado, o fio aparece inteiro e parado. */
(function () {
  'use strict';
  var raiz = document.documentElement, main = document.getElementById('conteudo');
  if (!main) return;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fios = Array.prototype.slice.call(document.querySelectorAll('.mm-fio'));
  function trilhos() {
    var linha = main.getBoundingClientRect().top + main.clientHeight * 0.6;
    fios.forEach(function (f) {
      if (!f.offsetParent) return;
      var r = f.getBoundingClientRect();
      if (!r.height) return;
      var fim = main.scrollTop + main.clientHeight >= main.scrollHeight - 4;
      var p = (calmo.matches || fim) ? 1 : Math.max(0, Math.min(1, (linha - r.top) / r.height));
      f.style.setProperty('--p', p.toFixed(4));
      var ponta = r.top + r.height * p;
      Array.prototype.forEach.call(f.parentNode.querySelectorAll('.ap-bloco, .mm-bloco'), function (b) {
        b.classList.toggle('no-fio', b.getBoundingClientRect().top + 18 <= ponta);
      });
    });
  }

  var espera = 0;
  function medir() {
    cancelAnimationFrame(espera);
    espera = requestAnimationFrame(function () { trilhos(); });
  }
  main.addEventListener('scroll', medir, { passive: true });
  window.addEventListener('resize', medir);
  window.addEventListener('hashchange', function () { setTimeout(medir, 60); });
  window.addEventListener('mul:tema', medir);
  window.addEventListener('load', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  medir();
})();
