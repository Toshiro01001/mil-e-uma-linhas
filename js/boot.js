// Roda antes de desenhar a página: evita piscar todas as abas e impede o site de ser embutido em outro.
(function () {
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.classList.add('embutido'); }
  }
  document.documentElement.classList.add('js');
})();
