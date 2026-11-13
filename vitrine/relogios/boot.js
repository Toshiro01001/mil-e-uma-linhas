/* Antes de tudo: marca "menos movimento" e libera a página se o código principal não subir em 5 s. */
(function () {
  var h = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) h.classList.add('is-reduced');
  setTimeout(function () { if (!window.__booted) h.classList.add('no-loader'); }, 5000);
})();
