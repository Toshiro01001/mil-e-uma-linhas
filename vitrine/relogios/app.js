'use strict';
(function () {
  var CHAVE = 'demo-ponteiro-alto';
  var MODELOS = [
    { id: 'aurora', nome: 'Aurora 36', preco: 349, usos: ['dia', 'presente'], estilo: 'classico', fundo: '#f3f4f6', ponteiro: '#1b2a41', pulseira: '#7a4a2b' },
    { id: 'ipe', nome: 'Ipê Dourado', preco: 689, usos: ['presente', 'dia'], estilo: 'classico', fundo: '#e9c85c', ponteiro: '#20201c', pulseira: '#b89b4a' },
    { id: 'pantanal', nome: 'Pantanal 200', preco: 1290, usos: ['esporte'], estilo: 'robusto', fundo: '#14403a', ponteiro: '#f2f5f4', pulseira: '#2a2d2e' },
    { id: 'chapada', nome: 'Chapada GMT', preco: 1850, usos: ['esporte', 'dia'], estilo: 'robusto', fundo: '#7c2a1e', ponteiro: '#fff', pulseira: '#3c3a36' },
    { id: 'meridiano', nome: 'Meridiano', preco: 890, usos: ['trabalho', 'presente'], estilo: 'classico', fundo: '#142c4d', ponteiro: '#f2e6c2', pulseira: '#20160f' },
    { id: 'minuta', nome: 'Minuta Slim', preco: 540, usos: ['trabalho', 'dia'], estilo: 'moderno', fundo: '#dfe4ea', ponteiro: '#121212', pulseira: '#6d7680' },
    { id: 'vetor', nome: 'Vetor Digital', preco: 299, usos: ['esporte', 'dia'], estilo: 'moderno', fundo: '#101820', ponteiro: '#3ee0b5', pulseira: '#101820' },
    { id: 'orla', nome: 'Orla Solar', preco: 760, usos: ['dia', 'esporte'], estilo: 'moderno', fundo: '#2a78d6', ponteiro: '#fff', pulseira: '#e6e6e0' },
    { id: 'tribuna', nome: 'Tribuna Automático', preco: 2890, usos: ['trabalho', 'presente'], estilo: 'classico', fundo: '#f7f1dd', ponteiro: '#5b1420', pulseira: '#5b1420' },
    { id: 'cerrado', nome: 'Cerrado Field', preco: 620, usos: ['dia', 'esporte'], estilo: 'robusto', fundo: '#54603a', ponteiro: '#f4f0d9', pulseira: '#8c6a3f' },
    { id: 'lumen', nome: 'Lúmen Cerâmica', preco: 1690, usos: ['trabalho', 'presente'], estilo: 'moderno', fundo: '#f8f8f6', ponteiro: '#111', pulseira: '#fff' },
    { id: 'vaqueiro', nome: 'Vaqueiro 42', preco: 395, usos: ['trabalho', 'dia'], estilo: 'robusto', fundo: '#2d2622', ponteiro: '#e6b34d', pulseira: '#4e3421' }
  ];
  var EVENTOS = [
    { id: 'anuncio', quando: 'Dia 0', tit: 'Clique no anúncio', tipo: 'cliente', regra: null, msg: function (c) { return c.nome + ' clicou no anúncio e abriu o atendimento.'; }, de: 'sis' },
    { id: 'recomenda', quando: 'Dia 0', tit: 'Recomendação', tipo: 'servico', regra: 'recomenda', msg: function (c) { return 'Olá, ' + c.nome + '. Sou o atendimento automático da Ponteiro Alto. Pelo que você contou, o ' + c.modelo.nome + ' combina com o que procura.'; } },
    { id: 'carrinho', quando: '1 hora depois', tit: 'Carrinho parado', tipo: 'relacionamento', regra: 'carrinho', msg: function (c) { return c.nome + ', o ' + c.modelo.nome + ' ficou no seu carrinho. Se quiser ajuda com a escolha, é só responder.'; } },
    { id: 'compra', quando: 'Dia 1', tit: 'Compra confirmada', tipo: 'servico', regra: 'compra', msg: function (c) { return 'Compra confirmada: ' + c.modelo.nome + ', ' + moeda(c.modelo.preco) + '. Avisamos assim que sair para entrega.'; } },
    { id: 'entrega', quando: 'Dia 3', tit: 'Saiu para entrega', tipo: 'servico', regra: 'entrega', msg: function (c) { return 'Seu ' + c.modelo.nome + ' saiu para entrega hoje. O código de rastreio está no seu pedido.'; } },
    { id: 'ajuste', quando: 'Dia 7', tit: 'Ajuste de pulseira', tipo: 'relacionamento', regra: 'ajuste', msg: function (c) { return 'A pulseira do ' + c.modelo.nome + ' ficou boa? O primeiro ajuste é por nossa conta. Quer marcar?'; } },
    { id: 'garantia', quando: 'Dia 30', tit: 'Garantia registrada', tipo: 'servico', regra: 'garantia', msg: function (c) { return 'A garantia do seu ' + c.modelo.nome + ' está registrada no seu cadastro. Guarde esta mensagem.'; } },
    { id: 'avaliacao', quando: 'Dia 45', tit: 'Opinião do cliente', tipo: 'relacionamento', regra: 'avaliacao', msg: function (c) { return c.nome + ', o que está achando do relógio? Sua opinião ajuda quem está escolhendo.'; } },
    { id: 'aniversario', quando: 'No aniversário', tit: 'Aniversário', tipo: 'relacionamento', regra: 'aniversario', msg: function (c) { return 'Feliz aniversário, ' + c.nome + '! Limpeza do relógio por nossa conta neste mês.'; } },
    { id: 'bateria', quando: '12 meses', tit: 'Troca de bateria', tipo: 'relacionamento', regra: 'bateria', msg: function (c) { return 'Já faz um ano do seu ' + c.modelo.nome + '. Vale conferir a bateria antes que ele pare. Quer agendar?'; } },
    { id: 'revisao', quando: '24 meses', tit: 'Revisão de vedação', tipo: 'relacionamento', regra: 'revisao', msg: function (c) { return 'Dois anos de uso: é hora de testar a vedação do ' + c.modelo.nome + ' antes de voltar à água.'; } },
    { id: 'novidade', quando: '30 meses', tit: 'Modelo novo', tipo: 'relacionamento', regra: 'novidade', msg: function (c) { return c.nome + ', chegou uma coleção no estilo do seu ' + c.modelo.nome + '. Posso mandar as fotos?'; } }
  ];
  var REGRAS = EVENTOS.filter(function (e) { return e.regra; });
  var PADRAO = { passo: -1, cliente: 'Marina', uso: 'dia', verba: '900', estilo: 'classico', consentimento: true, desligadas: [], vendas: 40, minutos: 3 };
  var est = carregar();

  function $(id) { return document.getElementById(id); }
  function moeda(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  function carregar() {
    var o = JSON.parse(JSON.stringify(PADRAO));
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (s && typeof s === 'object') {
        if (typeof s.cliente === 'string') o.cliente = s.cliente.slice(0, 30);
        ['uso', 'verba', 'estilo'].forEach(function (k) { if (typeof s[k] === 'string') o[k] = s[k]; });
        if (typeof s.consentimento === 'boolean') o.consentimento = s.consentimento;
        if (Array.isArray(s.desligadas)) o.desligadas = s.desligadas.filter(function (x) { return typeof x === 'string'; });
        if (Number.isInteger(s.passo) && s.passo >= -1 && s.passo < EVENTOS.length) o.passo = s.passo;
        if (typeof s.vendas === 'number' && s.vendas >= 0) o.vendas = s.vendas;
        if (typeof s.minutos === 'number' && s.minutos >= 0) o.minutos = s.minutos;
      }
    } catch (e) { /* segue com o padrão */ }
    return o;
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(est)); } catch (e) { /* só não lembra depois */ } }

  function candidatos() {
    var verba = Number(est.verba);
    return MODELOS.filter(function (m) { return m.preco <= verba; }).map(function (m) {
      return { m: m, nota: (m.usos.indexOf(est.uso) >= 0 ? 2 : 0) + (m.estilo === est.estilo ? 1 : 0) };
    }).filter(function (x) { return x.nota > 0; }).sort(function (a, b) { return b.nota - a.nota || a.m.preco - b.m.preco; }).slice(0, 3).map(function (x) { return x.m; });
  }
  function clienteAtual() {
    var c = candidatos();
    var padrao = MODELOS.filter(function (m) { return m.preco <= Number(est.verba); }).sort(function (a, b) { return a.preco - b.preco; })[0] || MODELOS[0];
    return { nome: (est.cliente || '').trim() || 'Cliente', modelo: c[0] || padrao };
  }
  function permitido(ev) {
    if (!ev.regra) return { ok: true };
    if (est.desligadas.indexOf(ev.regra) >= 0) return { ok: false, motivo: 'Regra desligada: nada foi enviado.' };
    if (ev.tipo === 'relacionamento' && !est.consentimento) return { ok: false, motivo: 'Sem autorização do cliente: mensagem bloqueada.' };
    return { ok: true };
  }

  /* mostrador */
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, at, pai, txt) {
    var e = document.createElementNS(NS, tag);
    Object.keys(at).forEach(function (k) { e.setAttribute(k, at[k]); });
    if (txt !== undefined) e.textContent = txt;
    if (pai) pai.appendChild(e);
    return e;
  }
  var ponteiro, seg, marcas = [], volta = 0;
  function montarDial() {
    var d = $('dial');
    s('circle', { cx: 200, cy: 200, r: 196, class: 'd-caixa' }, d);
    s('circle', { cx: 200, cy: 200, r: 182, class: 'd-fundo' }, d);
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, g = i % 5 === 0;
      s('line', { x1: 200 + Math.sin(a) * (g ? 158 : 168), y1: 200 - Math.cos(a) * (g ? 158 : 168), x2: 200 + Math.sin(a) * 176, y2: 200 - Math.cos(a) * 176, class: g ? 'd-h' : 'd-m' }, d);
    }
    EVENTOS.forEach(function (ev, i) {
      var a = i * 30 * Math.PI / 180;
      marcas.push(s('text', { x: 200 + Math.sin(a) * 136, y: 200 - Math.cos(a) * 136 + 7, 'text-anchor': 'middle', class: 'd-num' }, d, String(i === 0 ? 12 : i)));
    });
    s('text', { x: 200, y: 122, 'text-anchor': 'middle', class: 'd-marca' }, d, 'Ponteiro Alto');
    s('text', { x: 200, y: 142, 'text-anchor': 'middle', class: 'd-sub' }, d, 'Cuiabá');
    ponteiro = s('g', { class: 'd-ponteiro' }, d);
    s('rect', { x: 195, y: 72, width: 10, height: 148, rx: 4, class: 'd-ph' }, ponteiro);
    seg = s('g', { class: 'd-ponteiro seg' }, d);
    s('line', { x1: 200, y1: 232, x2: 200, y2: 44, class: 'd-ps' }, seg);
    s('circle', { cx: 200, cy: 200, r: 9, class: 'd-eixo' }, d);
    girar();
  }
  function girar() {
    var p = Math.max(est.passo, 0);
    ponteiro.style.transform = 'rotate(' + (volta * 360 + p * 30) + 'deg)';
    seg.style.transform = 'rotate(' + (volta * 360 + (p * 30) + 180) + 'deg)';
    marcas.forEach(function (m, i) { m.classList.toggle('atual', i === est.passo); m.classList.toggle('feito', i < est.passo); });
  }

  /* conversa */
  function pintarConversa() {
    var c = clienteAtual(), lista = $('mensagens');
    lista.textContent = '';
    $('nome-conversa').textContent = c.nome;
    for (var i = 0; i <= est.passo; i++) {
      var ev = EVENTOS[i], p = permitido(ev), li = document.createElement('li');
      var q = document.createElement('span'); q.className = 'quando'; q.textContent = ev.quando + ', ' + ev.tit.toLowerCase();
      var t = document.createElement('span');
      li.appendChild(q); li.appendChild(t);
      if (p.ok) { t.textContent = ev.msg(c); li.className = ev.de === 'sis' ? 'm-sis' : 'm-env'; }
      else { t.textContent = p.motivo; li.className = 'm-blq'; }
      lista.appendChild(li);
    }
    $('sem-msg').hidden = est.passo >= 0;
    lista.scrollTop = lista.scrollHeight;
    var fim = est.passo === EVENTOS.length - 1;
    $('avancar').textContent = fim ? 'Ciclo completo: recomeçar' : 'Avançar o ponteiro';
    $('passo-atual').textContent = est.passo < 0 ? 'Ponteiro parado no início.' : 'Hora ' + (est.passo === 0 ? 12 : est.passo) + ': ' + EVENTOS[est.passo].tit + '.';
  }

  /* recomendação */
  function mini(m) {
    var v = s('svg', { viewBox: '0 0 120 170', class: 'mini', 'aria-hidden': 'true' });
    s('rect', { x: 42, y: 0, width: 36, height: 170, rx: 6, fill: m.pulseira, stroke: 'rgba(0,0,0,.25)' }, v);
    s('circle', { cx: 60, cy: 85, r: 46, fill: '#b9a26a' }, v);
    s('circle', { cx: 60, cy: 85, r: 40, fill: m.fundo }, v);
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      s('line', { x1: 60 + Math.sin(a) * 32, y1: 85 - Math.cos(a) * 32, x2: 60 + Math.sin(a) * 37, y2: 85 - Math.cos(a) * 37, stroke: m.ponteiro, 'stroke-width': i % 3 ? 1 : 2.5 }, v);
    }
    s('line', { x1: 60, y1: 85, x2: 78, y2: 72, stroke: m.ponteiro, 'stroke-width': 3, 'stroke-linecap': 'round' }, v);
    s('line', { x1: 60, y1: 85, x2: 60, y2: 56, stroke: m.ponteiro, 'stroke-width': 2, 'stroke-linecap': 'round' }, v);
    return v;
  }
  var ROT = { classico: 'Clássico', moderno: 'Moderno', robusto: 'Robusto' };
  function pintarRec() {
    var cs = candidatos(), ul = $('recomendados');
    ul.textContent = '';
    cs.forEach(function (m, i) {
      var li = document.createElement('li');
      li.appendChild(mini(m));
      var h = document.createElement('h3'); h.textContent = m.nome; li.appendChild(h);
      var p = document.createElement('p'); p.textContent = ROT[m.estilo] + ', ' + moeda(m.preco); li.appendChild(p);
      if (i === 0) { var b = document.createElement('p'); b.className = 'selo'; b.textContent = 'Entra nas mensagens'; li.appendChild(b); }
      ul.appendChild(li);
    });
    $('resumo-rec').textContent = cs.length
      ? cs.length + (cs.length === 1 ? ' modelo combina' : ' modelos combinam') + ' com essas respostas.'
      : 'Nenhum modelo cabe nesse orçamento com essas respostas. Aumente a verba ou mude o uso.';
  }

  /* regras */
  function pintarRegras() {
    var ul = $('lista-regras');
    ul.textContent = '';
    REGRAS.forEach(function (ev) {
      var li = document.createElement('li');
      var l = document.createElement('label');
      var i = document.createElement('input');
      i.type = 'checkbox'; i.checked = est.desligadas.indexOf(ev.regra) < 0; i.dataset.regra = ev.regra;
      var nome = document.createElement('span'); nome.className = 'r-nome'; nome.textContent = ev.tit;
      var q = document.createElement('span'); q.className = 'r-quando'; q.textContent = ev.quando;
      var tp = document.createElement('span'); tp.className = 'r-tipo ' + ev.tipo; tp.textContent = ev.tipo === 'servico' ? 'Serviço' : 'Relacionamento';
      l.appendChild(i); l.appendChild(nome); l.appendChild(q); l.appendChild(tp);
      li.appendChild(l); ul.appendChild(li);
    });
    $('consentimento').checked = est.consentimento;
  }
  function pintarConta() {
    var n = REGRAS.filter(function (e) { return permitido(e).ok; }).length;
    var vs = Number($('vendas').value), mn = Number($('minutos').value);
    var ok = $('vendas').validity.valid && $('minutos').validity.valid && $('vendas').value !== '' && $('minutos').value !== '';
    $('conta-erro').hidden = ok;
    if (!ok) { $('conta-erro').textContent = 'Use até 5.000 vendas e até 60 minutos, em números inteiros.'; return; }
    var horas = n * vs * mn / 60;
    $('r-msgs').textContent = String(n);
    $('r-mes').textContent = (n * vs).toLocaleString('pt-BR');
    $('r-horas').textContent = horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + (horas === 1 ? ' hora' : ' horas');
    est.vendas = vs; est.minutos = mn;
  }
  function tudo() { pintarConversa(); pintarRec(); pintarConta(); girar(); salvar(); }
  function formulario() {
    $('cliente').value = est.cliente; $('uso').value = est.uso; $('verba').value = est.verba; $('estilo').value = est.estilo;
    $('vendas').value = est.vendas; $('minutos').value = est.minutos;
  }

  $('avancar').addEventListener('click', function () {
    if (est.passo >= EVENTOS.length - 1) { est.passo = 0; volta++; } else { est.passo++; }
    tudo();
  });
  $('zerar').addEventListener('click', function () { est.passo = -1; tudo(); });
  ['uso', 'verba', 'estilo'].forEach(function (k) { $(k).addEventListener('change', function () { est[k] = this.value; tudo(); }); });
  $('cliente').addEventListener('input', function () { est.cliente = this.value; tudo(); });
  ['vendas', 'minutos'].forEach(function (k) { $(k).addEventListener('input', function () { pintarConta(); salvar(); }); });
  $('consentimento').addEventListener('change', function () { est.consentimento = this.checked; tudo(); });
  $('lista-regras').addEventListener('change', function (e) {
    var r = e.target.dataset.regra; if (!r) return;
    est.desligadas = est.desligadas.filter(function (x) { return x !== r; });
    if (!e.target.checked) est.desligadas.push(r);
    tudo();
  });
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    est = JSON.parse(JSON.stringify(PADRAO));
    formulario(); pintarRegras(); tudo();
  });

  montarDial(); formulario(); pintarRegras(); tudo();
})();
