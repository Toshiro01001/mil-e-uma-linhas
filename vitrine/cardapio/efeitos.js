/* Efeitos visuais do cardápio: o nome na largura certa, as faixas que correm, o prato que gira com a rolagem,
   a comanda saindo da impressora e os cartões entrando. Nada aqui muda pedido, preço ou cozinha: se este arquivo
   falhar, o cardápio continua funcionando igual. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var placa = document.querySelector('.placa');
  var nome = document.getElementById('nome-casa');
  if (!placa || !nome) return;

  // o nome ocupa uma fração fixa da largura do cartaz, em qualquer tela
  function medir() {
    var linhas = nome.querySelectorAll('.nome-l'), maior = 0, antes = nome.style.fontSize;
    nome.style.fontSize = '100px';
    linhas.forEach(function (l) { maior = Math.max(maior, l.scrollWidth); });
    nome.style.fontSize = antes;
    if (!maior) return;
    var cs = getComputedStyle(placa);
    var util = placa.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var alvo = util * (window.innerWidth <= 700 ? 0.97 : 0.72);
    var px = Math.max(52, 100 * alvo / maior);
    placa.style.setProperty('--nome', px.toFixed(1) + 'px');
    placa.style.setProperty('--nome-alt', nome.offsetHeight + 'px');
  }
  medir();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(medir, 120); });

  // faixas: os nomes saem dos próprios pratos do cardápio, para nunca divergir
  var pratos = [].map.call(document.querySelectorAll('.prato .p-nome'), function (e) { return e.textContent; });
  var FECHO = ['Peça da mesa', 'A cozinha recebe na hora', 'Preços inventados', 'Nenhum pagamento acontece aqui'];
  document.querySelectorAll('.fx-trilho').forEach(function (t, i) {
    var lista = t.getAttribute('data-faixa') === 'fecho' ? FECHO : pratos.slice(i % 2 ? 5 : 0).concat(pratos.slice(0, i % 2 ? 5 : 0));
    if (!lista.length) return;
    var vezes = Math.ceil(24 / lista.length) * 2; // duas metades iguais: a animação anda meia faixa e recomeça
    for (var v = 0; v < vezes; v++) lista.forEach(function (n) { var s = document.createElement('span'); s.textContent = n; t.appendChild(s); });
  });

  // no celular, a barra "Ver pedido" sai da frente quando a comanda já está na tela (ela cobria o botão de enviar)
  var comanda = document.getElementById('pedido');
  if (comanda && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (ens) { document.body.classList.toggle('na-comanda', ens[0].isIntersecting); }, { rootMargin: '0px 0px -30% 0px' }).observe(comanda);
  }

  if (calmo) return;
  raiz.classList.add('anima');

  // rolagem: o prato gira e sobe, a etiqueta e o selo andam em outra velocidade; o nome do fecho sobe
  var fecho = document.querySelector('.fecho'), fechoNome = document.querySelector('.fecho-nome'), pedindo = false;
  function rolar() {
    pedindo = false;
    var a = placa.offsetHeight, y = window.scrollY - placa.offsetTop;
    if (y < a) placa.style.setProperty('--p', Math.max(0, Math.min(1, y / a)).toFixed(3));
    if (fecho && fechoNome) {
      var r = fecho.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) fechoNome.style.setProperty('--f', Math.max(0, Math.min(1, r.top / window.innerHeight)).toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!pedindo) { pedindo = true; requestAnimationFrame(rolar); } }, { passive: true });
  rolar();

  // entradas: cartões de cada painel e a comanda "saindo da impressora"
  // (a comanda começa recortada, então quem é observado é a grade em volta dela, não ela mesma)
  var pedido = document.querySelector('.pedido'), grade = document.querySelector('.salao-grade');
  function mostrar(e) { e.classList.add('visto'); if (e === grade && pedido) pedido.classList.add('visto'); }
  var alvos = [].slice.call(document.querySelectorAll('.menu section'));
  if (grade) alvos.push(grade);
  if (!('IntersectionObserver' in window)) { alvos.forEach(mostrar); return; }
  var io = new IntersectionObserver(function (ens) {
    ens.forEach(function (en) { if (en.isIntersecting) { mostrar(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  alvos.forEach(function (e) { io.observe(e); });
})();
