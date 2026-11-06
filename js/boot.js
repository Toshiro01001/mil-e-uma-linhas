// Roda antes de desenhar a página: evita piscar as abas, aplica a aparência escolhida e impede o site de ser embutido em outro.
(function () {
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.classList.add('embutido'); }
  }
  var r = document.documentElement, t = 'ascii';
  try { var s = localStorage.getItem('mul-tema'); if (/^(ascii|empresa|loja|painel|agenda)$/.test(s)) t = s; } catch (e) {}
  r.setAttribute('data-tema', t);
  r.classList.add('js');
})();
