/* Sol a Pino. Atendimento por regras (sem IA) e quadro de funil. Tudo fica no localStorage. */
(function () {
  'use strict';
  var CHAVE = 'vitrine-funil:estado';
  var ETAPAS = [
    { id: 'novo', nome: 'Novo' }, { id: 'qualificado', nome: 'Qualificado' }, { id: 'proposta', nome: 'Proposta' },
    { id: 'negociacao', nome: 'Negociação' }, { id: 'ganho', nome: 'Ganho' }, { id: 'perdido', nome: 'Perdido' }
  ];
  var ORDEM = ['novo', 'qualificado', 'proposta', 'negociacao', 'ganho'];

  /* O roteiro. Cada nó tem a fala, a forma de responder e para onde cada resposta leva. */
  var ROTEIRO = {
    nome: { fala: function () { return 'Olá! Sou o atendimento automático da Sol a Pino. Sigo regras escritas pela equipe, não sou uma IA. Como posso chamar você?'; }, texto: { campo: 'nome', rotulo: 'Seu nome (pode inventar)', vazio: 'Preciso de um nome para continuar. Pode ser um apelido.', prox: 'imovel' } },
    imovel: { fala: function (r) { return 'Prazer, ' + r.nome + '. A instalação seria em qual lugar?'; }, ops: [
      { t: 'Casa', pts: 10, campo: 'imovel', v: 'Casa', prox: 'conta' },
      { t: 'Comércio', pts: 20, campo: 'imovel', v: 'Comércio', prox: 'conta' },
      { t: 'Fazenda ou sítio', pts: 15, campo: 'imovel', v: 'Fazenda ou sítio', prox: 'conta' }
    ] },
    conta: { fala: function () { return 'Quanto vem, em média, na conta de luz por mês?'; }, ops: [
      { t: 'Até R$ 300', pts: 0, campo: 'conta', v: 250, prox: 'baixa' },
      { t: 'R$ 300 a R$ 800', pts: 20, campo: 'conta', v: 550, prox: 'cidade' },
      { t: 'R$ 800 a R$ 2.000', pts: 35, campo: 'conta', v: 1400, prox: 'cidade' },
      { t: 'Mais de R$ 2.000', pts: 45, campo: 'conta', v: 3000, prox: 'cidade' }
    ] },
    baixa: { fala: function () { return 'Nessa faixa o retorno costuma demorar mais. Quer seguir com a simulação mesmo assim?'; }, ops: [
      { t: 'Quero seguir', pts: 5, prox: 'cidade' },
      { t: 'Prefiro parar aqui', pts: -10, fim: 'desistiu', prox: 'fim' }
    ] },
    cidade: { fala: function () { return 'Em qual região fica o imóvel?'; }, ops: [
      { t: 'Cuiabá', pts: 15, campo: 'cidade', v: 'Cuiabá', prox: 'dono' },
      { t: 'Várzea Grande', pts: 15, campo: 'cidade', v: 'Várzea Grande', prox: 'dono' },
      { t: 'Outra cidade de MT', pts: 5, campo: 'cidade', v: 'Interior de MT', prox: 'dono' },
      { t: 'Fora de MT', pts: -30, campo: 'cidade', v: 'Fora de MT', fim: 'fora', prox: 'fim' }
    ] },
    dono: { fala: function () { return 'O imóvel é seu ou é alugado?'; }, ops: [
      { t: 'É meu', pts: 10, prox: 'prazo' },
      { t: 'É alugado', pts: -10, prox: 'prazo' }
    ] },
    prazo: { fala: function () { return 'Para quando você quer resolver isso?'; }, ops: [
      { t: 'Este mês', pts: 20, campo: 'prazo', v: 'Este mês', prox: 'duvida' },
      { t: 'Em até 3 meses', pts: 10, campo: 'prazo', v: 'Até 3 meses', prox: 'duvida' },
      { t: 'Só pesquisando', pts: 0, campo: 'prazo', v: 'Pesquisando', prox: 'duvida' }
    ] },
    duvida: { fala: function () { return 'Última etapa. Escreva uma dúvida, ou envie vazio para encerrar. Reconheço palavras como preço, financiamento e garantia.'; }, texto: { campo: 'duvida', rotulo: 'Sua dúvida (opcional)', prox: 'fim' } }
  };
  var PASSOS_TOTAL = 7;
  var PALAVRAS = [
    { chaves: ['preco', 'valor', 'custa', 'quanto'], r: 'Sobre preço: o valor depende do consumo. A estimativa está na sua ficha e a equipe confirma na visita.' },
    { chaves: ['financ', 'parcel', 'prestacao'], r: 'Sobre financiamento: a equipe explica as opções na proposta. Nesta demonstração nenhuma condição é real.' },
    { chaves: ['garantia', 'quebra', 'manutenc'], r: 'Sobre garantia: a equipe envia as condições por escrito junto da proposta.' }
  ];

  var EX = [
    ['Marina Teles', 'qualificado', 42000, 'Quente', 'Agendar visita técnica até amanhã'],
    ['Oficina do Tião', 'proposta', 68000, 'Quente', 'Enviar proposta revisada'],
    ['Lucas Figueira', 'novo', 14000, 'Morno', 'Enviar simulação e retomar em 3 dias'],
    ['Padaria Duas Rosas', 'negociacao', 53000, 'Quente', 'Ligar para fechar condição'],
    ['Sítio Boa Sombra', 'ganho', 96000, 'Quente', 'Agendar instalação'],
    ['Rita Vaz', 'novo', 11000, 'Frio', 'Lembrar em 30 dias'],
    ['Mercadinho Sete', 'perdido', 39000, 'Morno', 'Escolheu outra empresa'],
    ['Paulo Nogueira', 'qualificado', 26000, 'Morno', 'Enviar simulação e retomar em 3 dias'],
    ['Ana Ferraz', 'ganho', 31000, 'Quente', 'Agendar instalação']
  ];
  function exemplo() {
    return { v: 1, contatos: EX.map(function (x, i) {
      var ix = ORDEM.indexOf(x[1]);
      return { id: 'ex' + i, nome: x[0], etapa: x[1], valor: x[2], temp: x[3], passo: x[4], alcance: ix >= 0 ? ix : 1, origem: 'exemplo' };
    }) };
  }
  function lerSalvo() {
    try { var d = JSON.parse(localStorage.getItem(CHAVE)); return d && d.v === 1 && Array.isArray(d.contatos) && d.contatos.every(function (c) { return c && typeof c === 'object'; }) ? d : null; } catch (e) { return null; }
  }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* segue só na memória */ } }
  var E = lerSalvo();
  if (!E) { E = exemplo(); gravar(); }

  function $(id) { return document.getElementById(id); }
  function h(t, p) {
    var e = document.createElement(t), k, v, i;
    for (k in p || {}) {
      v = p[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) { if (arguments[i] !== null && arguments[i] !== undefined) e.append(arguments[i]); }
    return e;
  }
  function reais(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function semAcento(s) { return s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function nomeEtapa(id) { return ETAPAS.find(function (e) { return e.id === id; }).nome; }
  function contato(id) { return E.contatos.find(function (c) { return c.id === id; }); }
  function avisar(t) { $('aviso').textContent = t; }

  /* Conversa */
  var conv;
  function iniciar() {
    conv = { r: {}, pts: 0, feitos: 0, fim: null };
    $('mensagens').textContent = '';
    $('log').textContent = '';
    atualizarPainel();
    irPara('nome');
  }
  function falar(texto, quem) {
    var m = $('mensagens');
    m.append(h('p', { class: 'msg ' + quem, text: texto }));
    m.scrollTop = m.scrollHeight;
  }
  function atualizarPainel() {
    $('pontos').textContent = String(conv.pts);
    $('temperatura').textContent = conv.pts ? 'Até agora: ' + temperatura(conv.pts) : 'Conversa ainda sem respostas.';
    var f = Math.min(1, conv.feitos / PASSOS_TOTAL), ang = Math.PI * (1 - f);
    var x = 160 + 150 * Math.cos(ang), y = 90 - 150 * Math.sin(ang) * 0.5333;
    /* arco elíptico achatado para caber no cabeçalho */
    var s = $('sol'); s.setAttribute('cx', x.toFixed(1)); s.setAttribute('cy', y.toFixed(1));
    $('arco-feito').setAttribute('d', f > 0 ? 'M10 90 A150 80 0 0 1 ' + x.toFixed(1) + ' ' + y.toFixed(1) : '');
    $('progresso-txt').textContent = conv.fim ? 'Conversa encerrada' : 'Etapa ' + Math.min(PASSOS_TOTAL, conv.feitos + 1) + ' de ' + PASSOS_TOTAL;
  }
  function temperatura(p) { return p >= 70 ? 'Quente' : p >= 35 ? 'Morno' : 'Frio'; }
  function registrar(t, pts) {
    conv.pts += pts; conv.feitos += 1;
    $('log').append(h('li', {}, h('span', { text: t }), h('b', { text: pts === 0 ? "0" : (pts > 0 ? "+" : "") + pts })));
    atualizarPainel();
  }
  function irPara(no) {
    if (no === 'fim') { encerrar(); return; }
    var n = ROTEIRO[no], ent = $('entrada');
    falar(n.fala(conv.r), 'bot');
    ent.textContent = '';
    if (n.ops) {
      n.ops.forEach(function (o, i) {
        ent.append(h('button', { type: 'button', class: 'resp', text: o.t, onclick: function () {
          falar(o.t, 'eu');
          if (o.campo) conv.r[o.campo] = o.v;
          if (o.fim) conv.fim = o.fim;
          registrar(o.t, o.pts);
          irPara(o.prox);
        } }));
        if (i === 0) focoDepois(ent);
      });
    } else {
      var inp = h('input', { id: 'txt', autocomplete: 'off', maxlength: 60 }), erro = h('p', { class: 'erro', role: 'alert' });
      ent.append(h('form', { class: 'form-texto', novalidate: true, onsubmit: function (e) {
        e.preventDefault();
        var v = inp.value.trim();
        if (!v && n.texto.vazio) { erro.textContent = n.texto.vazio; inp.focus(); return; }
        if (v) falar(v, 'eu');
        conv.r[n.texto.campo] = v;
        if (n.texto.campo === 'nome') registrar('Deixou o nome', 0);
        if (n.texto.campo === 'duvida' && v) {
          var t = semAcento(v), achou = PALAVRAS.find(function (w) { return w.chaves.some(function (c) { return t.indexOf(c) >= 0; }); });
          falar(achou ? achou.r : 'Não tenho resposta pronta para isso. Sua dúvida vai junto na ficha para a equipe responder.', 'bot');
          registrar(achou ? 'Dúvida reconhecida' : 'Dúvida para a equipe', 5);
        }
        irPara(n.texto.prox);
      } }, h('label', { for: 'txt', text: n.texto.rotulo }), inp, h('button', { type: 'submit', class: 'botao-cheio', text: 'Enviar' }), erro));
      focoDepois(ent);
    }
  }
  var podeFocar = false;
  function focoDepois(ent) {
    if (!podeFocar) return;
    var alvo = ent.querySelector('input,button');
    if (alvo) alvo.focus({ preventScroll: true });
  }
  $('entrada').addEventListener('pointerdown', function () { podeFocar = true; });
  $('entrada').addEventListener('keydown', function () { podeFocar = true; });

  function encerrar() {
    var r = conv.r, temp = temperatura(conv.pts), etapa, passo, valor;
    /* Valor estimado: conta média vezes 45 meses, arredondado. Fórmula de exemplo. */
    valor = Math.round((r.conta || 250) * 45 / 500) * 500;
    if (conv.fim === 'fora') { etapa = 'perdido'; temp = 'Frio'; passo = 'Fora da área de atendimento'; valor = 0; }
    else if (conv.fim === 'desistiu') { etapa = 'novo'; temp = 'Frio'; passo = 'Lembrar em 30 dias'; }
    else if (temp === 'Quente') { etapa = 'qualificado'; passo = 'Agendar visita técnica até amanhã'; }
    else if (temp === 'Morno') { etapa = 'novo'; passo = 'Enviar simulação e retomar em 3 dias'; }
    else { etapa = 'novo'; passo = 'Lembrar em 30 dias'; }
    conv.feitos = PASSOS_TOTAL;
    var salvo = lerSalvo();
    if (salvo) E = salvo;
    var idx = ORDEM.indexOf(etapa);
    var c = { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), nome: r.nome, etapa: etapa, valor: valor, temp: temp, passo: passo, alcance: idx >= 0 ? idx : 0, origem: 'conversa', duvida: r.duvida || '', detalhes: [r.imovel, r.cidade, r.prazo].filter(Boolean).join(', ') };
    E.contatos.push(c);
    gravar();
    conv.fim = conv.fim || 'ok';
    atualizarPainel();
    falar(conv.fim === 'fora' ? 'Por enquanto só atendemos em Mato Grosso. ' + r.nome + ', registrei o contato para a equipe saber da procura.' : 'Pronto, ' + r.nome + '. Resultado das regras: ' + conv.pts + ' pontos, contato ' + temp.toLowerCase() + '. Você entrou na coluna ' + nomeEtapa(etapa) + ' do quadro, com próximo passo: ' + passo + '.', 'bot');
    $('temperatura').textContent = 'Resultado: ' + temp + ', coluna ' + nomeEtapa(etapa);
    var ent = $('entrada');
    ent.textContent = '';
    ent.append(h('button', { type: 'button', class: 'resp', text: 'Começar outra conversa', onclick: iniciar }),
      h('a', { class: 'resp ver', href: '#card-' + c.id, text: 'Ver contato no quadro' }));
    desenhar();
    focoDepois(ent);
  }

  /* Quadro */
  function alcaIcone() {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 12 18'); s.setAttribute('width', '12'); s.setAttribute('height', '18'); s.setAttribute('aria-hidden', 'true');
    [[3, 3], [9, 3], [3, 9], [9, 9], [3, 15], [9, 15]].forEach(function (p) {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', '1.8'); c.setAttribute('fill', 'currentColor'); s.append(c);
    });
    return s;
  }
  function cartao(c) {
    var alca = h('button', { type: 'button', class: 'alca', 'data-alca': c.id, 'aria-label': 'Mover ' + c.nome + '. Use as setas para trocar de coluna.', 'aria-describedby': 't-quadro' }, alcaIcone());
    return h('article', { class: 'cartao', id: 'card-' + c.id, 'data-id': c.id },
      h('button', { type: 'button', class: 'c-nome', 'data-abrir': c.id, text: c.nome }), alca,
      h('p', { class: 'c-valor', text: reais(c.valor) }),
      h('p', { class: 'c-temp ' + c.temp.toLowerCase(), text: c.temp }),
      h('p', { class: 'c-passo', text: 'Próximo: ' + c.passo }));
  }
  function desenharQuadro() {
    var q = $('quadro-colunas'), ativo = document.activeElement, fA = ativo && ativo.getAttribute && (ativo.getAttribute('data-alca') || ''), fN = ativo && ativo.getAttribute && (ativo.getAttribute('data-abrir') || '');
    q.textContent = '';
    ETAPAS.forEach(function (e) {
      var doE = E.contatos.filter(function (c) { return c.etapa === e.id; });
      var soma = doE.reduce(function (s, c) { return s + c.valor; }, 0);
      var col = h('section', { class: 'coluna', 'data-etapa': e.id, 'aria-label': 'Coluna ' + e.nome },
        h('h3', {}, h('span', { text: e.nome }), h('span', { class: 'cont', text: String(doE.length) })),
        h('p', { class: 'soma', text: reais(soma) }));
      doE.forEach(function (c) { col.append(cartao(c)); });
      q.append(col);
    });
    if (fA) { var a = document.querySelector('[data-alca="' + CSS.escape(fA) + '"]'); if (a) a.focus(); }
    if (fN) { var b = document.querySelector('[data-abrir="' + CSS.escape(fN) + '"]'); if (b) b.focus(); }
  }
  function mover(id, etapa) {
    var c = contato(id);
    if (!c || c.etapa === etapa) return false;
    c.etapa = etapa;
    var ix = ORDEM.indexOf(etapa);
    if (ix > c.alcance) c.alcance = ix;
    gravar();
    avisar(c.nome + ' movido para ' + nomeEtapa(etapa) + '.');
    desenhar();
    return true;
  }

  /* Arrastar com ponteiro: mouse e toque usam o mesmo código. */
  var arr = null;
  function comecar(ev, id, origem) {
    arr = { id: id, origem: origem, x0: ev.clientX, y0: ev.clientY, pid: ev.pointerId, ativo: false, x: ev.clientX, y: ev.clientY, alvo: null, fantasma: null, raf: 0, dx: 0, dy: 0 };
    document.addEventListener('pointermove', aoMover, { passive: false });
    document.addEventListener('pointerup', aoSoltar);
    document.addEventListener('pointercancel', aoCancelar);
    document.addEventListener('keydown', aoEsc);
  }
  function posFantasma() { if (arr && arr.fantasma) arr.fantasma.style.transform = 'translate(' + (arr.x - arr.dx) + 'px,' + (arr.y - arr.dy) + 'px)'; }
  function aoMover(ev) {
    if (!arr || ev.pointerId !== arr.pid) return;
    arr.x = ev.clientX; arr.y = ev.clientY;
    if (!arr.ativo) {
      if (Math.abs(arr.x - arr.x0) + Math.abs(arr.y - arr.y0) < 6) return;
      arr.ativo = true;
      var c = document.getElementById('card-' + arr.id), r = c.getBoundingClientRect();
      arr.dx = arr.x0 - r.left; arr.dy = arr.y0 - r.top;
      var f = c.cloneNode(true);
      f.removeAttribute('id'); f.classList.add('fantasma'); f.setAttribute('aria-hidden', 'true');
      f.querySelectorAll('button').forEach(function (b) { b.tabIndex = -1; });
      f.style.width = r.width + 'px';
      document.body.append(f);
      arr.fantasma = f; arr.cartao = c;
      c.classList.add('arrastado');
      document.body.classList.add('arrastando');
      arr.raf = requestAnimationFrame(rolar);
    }
    ev.preventDefault();
    posFantasma();
    var el = document.elementFromPoint(arr.x, arr.y), col = el && el.closest ? el.closest('.coluna') : null;
    if (col !== arr.alvo) {
      if (arr.alvo) arr.alvo.classList.remove('alvo');
      if (col) col.classList.add('alvo');
      arr.alvo = col;
    }
  }
  /* Rola a página quando o dedo chega perto da borda, para alcançar colunas fora da tela. */
  function rolar() {
    if (!arr || !arr.ativo) return;
    var m = 70, a = window.innerHeight;
    if (arr.y < m) window.scrollBy({ top: -10, behavior: 'instant' }); else if (arr.y > a - m) window.scrollBy({ top: 10, behavior: 'instant' });
    var el = document.elementFromPoint(arr.x, arr.y), col = el && el.closest ? el.closest('.coluna') : null;
    if (col !== arr.alvo) { if (arr.alvo) arr.alvo.classList.remove('alvo'); if (col) col.classList.add('alvo'); arr.alvo = col; }
    arr.raf = requestAnimationFrame(rolar);
  }
  function terminar() {
    document.removeEventListener('pointermove', aoMover);
    document.removeEventListener('pointerup', aoSoltar);
    document.removeEventListener('pointercancel', aoCancelar);
    document.removeEventListener('keydown', aoEsc);
    if (!arr) return;
    cancelAnimationFrame(arr.raf);
    if (arr.fantasma) arr.fantasma.remove();
    if (arr.cartao) arr.cartao.classList.remove('arrastado');
    if (arr.alvo) arr.alvo.classList.remove('alvo');
    document.body.classList.remove('arrastando');
  }
  function aoSoltar() {
    var a = arr; terminar(); arr = null;
    if (!a) return;
    if (a.ativo) {
      suprimirClique = true;
      if (a.alvo) mover(a.id, a.alvo.getAttribute('data-etapa'));
    }
  }
  function aoCancelar() { terminar(); arr = null; }
  function aoEsc(e) { if (e.key === 'Escape') { terminar(); arr = null; } }
  var suprimirClique = false;
  var quadro = $('quadro-colunas');
  quadro.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0) return;
    var al = ev.target.closest('[data-alca]');
    if (al) { comecar(ev, al.getAttribute('data-alca')); return; }
    /* Com mouse, o cartão inteiro arrasta. Com toque, só a alça, para não atrapalhar a rolagem. */
    if (ev.pointerType === 'mouse') {
      var car = ev.target.closest('.cartao');
      if (car) comecar(ev, car.getAttribute('data-id'));
    }
  });
  quadro.addEventListener('click', function (ev) {
    if (suprimirClique) { suprimirClique = false; ev.preventDefault(); return; }
    var n = ev.target.closest('[data-abrir]');
    if (n) { abrirDetalhe(n.getAttribute('data-abrir')); return; }
    var a = ev.target.closest('[data-alca]');
    if (a && ev.detail === 0) abrirDetalhe(a.getAttribute('data-alca')); /* Enter e espaço na alça */
  });
  quadro.addEventListener('keydown', function (ev) {
    var a = ev.target.closest('[data-alca]');
    if (!a) return;
    var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    ev.preventDefault();
    var c = contato(a.getAttribute('data-alca')), i = ETAPAS.findIndex(function (e) { return e.id === c.etapa; }), j = i + d;
    if (j < 0 || j >= ETAPAS.length) { avisar(c.nome + ' já está na ' + (d < 0 ? 'primeira' : 'última') + ' coluna.'); return; }
    mover(c.id, ETAPAS[j].id);
  });

  /* Detalhe do contato: valor, próximo passo e coluna, útil também em leitor de tela. */
  var aberto = null;
  function abrirDetalhe(id) {
    var c = contato(id); if (!c) return;
    aberto = id;
    $('d-nome').textContent = c.nome;
    $('d-resumo').textContent = 'Contato ' + c.temp.toLowerCase() + (c.detalhes ? ', ' + c.detalhes : '') + (c.duvida ? '. Dúvida: ' + c.duvida : '') + '.';
    var s = $('d-etapa');
    s.textContent = '';
    ETAPAS.forEach(function (e) { s.append(h('option', { value: e.id, text: e.nome })); });
    s.value = c.etapa;
    $('d-valor').value = c.valor;
    $('d-passo').value = c.passo;
    $('d-erro').textContent = '';
    $('detalhe').showModal();
  }
  $('d-fechar').addEventListener('click', function () { $('detalhe').close(); });
  $('detalhe').addEventListener('click', function (e) { if (e.target === this) this.close(); });
  $('form-detalhe').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = Number($('d-valor').value), p = $('d-passo').value.trim();
    if (!$('d-valor').value || !isFinite(v) || v < 0) { $('d-erro').textContent = 'Escreva um valor em reais, zero ou maior.'; $('d-valor').focus(); return; }
    if (!p) { $('d-erro').textContent = 'Escreva o próximo passo. Um contato sem próximo passo fica esquecido.'; $('d-passo').focus(); return; }
    var c = contato(aberto);
    c.valor = v; c.passo = p;
    gravar();
    var etapaNova = $('d-etapa').value;
    $('detalhe').close();
    if (!mover(c.id, etapaNova)) { avisar('Contato de ' + c.nome + ' salvo.'); desenhar(); }
    var al = document.querySelector('[data-alca="' + CSS.escape(c.id) + '"]');
    if (al) al.focus();
  });

  /* Relatório */
  function desenharRelatorio() {
    var cs = E.contatos, total = cs.length;
    var ganhos = cs.filter(function (c) { return c.etapa === 'ganho'; });
    var aberto2 = cs.filter(function (c) { return c.etapa !== 'ganho' && c.etapa !== 'perdido'; });
    function soma(l) { return l.reduce(function (s, c) { return s + c.valor; }, 0); }
    var n = $('numeros');
    n.textContent = '';
    [['Contatos no quadro', String(total)], ['Conversão em venda', total ? Math.round(ganhos.length / total * 100) + '%' : '0%'], ['Valor ganho', reais(soma(ganhos))], ['Valor em aberto', reais(soma(aberto2))]].forEach(function (x) {
      n.append(h('div', {}, h('dt', { text: x[0] }), h('dd', { text: x[1] })));
    });
    var b = $('funil-barras'), max = Math.max(1, total), ant = null;
    b.textContent = '';
    b.append(h('h3', { text: 'Quantos contatos chegaram até cada etapa' }));
    ORDEM.forEach(function (id) {
      var ix = ORDEM.indexOf(id), q = cs.filter(function (c) { return c.alcance >= ix; }).length;
      var taxa = ant === null ? '' : ant ? ', ' + Math.round(q / ant * 100) + '% da etapa anterior' : '';
      var i = h('i');
      i.style.width = Math.max(1, q / max * 62) + '%';
      b.append(h('div', { class: 'barra-l', 'data-etapa': id }, h('span', { text: nomeEtapa(id) }),
        h('div', { class: 'barra-tr' }, i, h('span', { class: 'q', text: String(q) })),
        taxa ? h('small', { class: 'taxa', text: taxa.slice(2) }) : null));
      ant = q;
    });
    var perd = cs.filter(function (c) { return c.etapa === 'perdido'; }).length;
    b.append(h('p', { class: 'nota', text: perd + (perd === 1 ? ' contato perdido' : ' contatos perdidos') + ' no período. O relatório conta a etapa mais alta que cada contato alcançou, mesmo se depois voltou.' }));
  }
  function desenhar() { desenharQuadro(); desenharRelatorio(); }

  window.addEventListener('storage', function (e) {
    if (e.key === CHAVE || e.key === null) { E = lerSalvo() || exemplo(); desenhar(); }
  });
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    E = exemplo(); gravar();
    iniciar(); desenhar();
    avisar('Dados de exemplo restaurados.');
  });
  iniciar();
  desenhar();
})();
