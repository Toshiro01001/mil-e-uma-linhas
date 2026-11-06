'use strict';
(function () {
  var CHAVE = 'demo-atelie-seriema';
  var DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  var LIMITE = 2200, JANELA = 24;
  var ESTADOS = { aguardando: 'Aguardando aprovação', aprovado: 'Aprovado', publicado: 'Publicado', atrasado: 'Atrasado: sem aprovação' };
  function padrao() {
    return {
      hoje: 0, seq: 6,
      posts: [
        { id: 1, dia: 0, hora: '09:00', tipo: 'Foto', legenda: 'Fornada nova de canecas saindo do forno. Qual cor fica na sua mesa?', estado: 'aprovado' },
        { id: 2, dia: 1, hora: '18:30', tipo: 'Reels', legenda: 'Do barro à peça pronta em 30 segundos.', estado: 'aprovado' },
        { id: 3, dia: 2, hora: '12:00', tipo: 'Carrossel', legenda: 'Três jeitos de usar um vaso pequeno na sala.', estado: 'aguardando' },
        { id: 4, dia: 4, hora: '19:00', tipo: 'Foto', legenda: 'Oficina de sábado: últimas vagas para aprender torno.', estado: 'aguardando' },
        { id: 5, dia: 5, hora: '10:00', tipo: 'Story', legenda: 'Bastidores da oficina, ao vivo do ateliê.', estado: 'aprovado' }
      ],
      regras: [
        { id: 'preco', pal: ['quanto', 'preço', 'preco', 'valor', 'custa'], txt: 'O catálogo com os preços está no link da bio. Se quiser, diga qual peça te interessou.' },
        { id: 'entrega', pal: ['entrega', 'frete', 'entregam', 'envio'], txt: 'Entregamos em Cuiabá e Várzea Grande. Para outras cidades, a equipe calcula o frete.' },
        { id: 'oficina', pal: ['oficina', 'curso', 'aula', 'vaga'], txt: 'As oficinas são aos sábados, às 9h. As inscrições ficam no link da bio.' }
      ],
      conv: []
    };
  }
  var HUMANO = ['defeito', 'quebrou', 'quebrada', 'reclamação', 'reclamacao', 'reembolso', 'cancelar', 'errado', 'atendente', 'pessoa'];
  var est = carregar();
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (s && Array.isArray(s.posts) && Array.isArray(s.regras) && Array.isArray(s.conv) && Number.isInteger(s.hoje) && s.hoje >= 0 && s.hoje < 7
        && s.posts.every(function (p) { return ESTADOS[p.estado] && Number.isInteger(p.dia) && p.dia >= 0 && p.dia < 7 && typeof p.legenda === 'string'; })
        && s.regras.every(function (r) { return Array.isArray(r.pal) && typeof r.txt === 'string'; })) return s;
    } catch (e) { /* usa o padrão */ }
    return padrao();
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(est)); } catch (e) { /* só não lembra depois */ } }

  function publicarDoDia() {
    est.posts.forEach(function (p) {
      if (p.dia > est.hoje || p.estado === 'publicado' || p.estado === 'atrasado') return;
      if (p.estado === 'aprovado') p.estado = 'publicado';
      else if (p.estado === 'aguardando' && p.dia < est.hoje) p.estado = 'atrasado';
    });
  }

  /* calendário */
  function pintarDias() {
    var ol = $('dias');
    ol.textContent = '';
    DIAS.forEach(function (nome, i) {
      var li = el('li', 'dia' + (i === est.hoje ? ' hoje' : '') + (i < est.hoje ? ' passou' : ''));
      var cab = el('h3', '', nome);
      if (i === est.hoje) cab.appendChild(el('span', 'tag-hoje', ' hoje'));
      li.appendChild(cab);
      var ps = est.posts.filter(function (p) { return p.dia === i; }).sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
      if (!ps.length) li.appendChild(el('p', 'livre', 'Sem post'));
      ps.forEach(function (p) {
        var c = el('article', 'post ' + p.estado);
        c.appendChild(el('p', 'p-meta', p.hora + ', ' + p.tipo));
        c.appendChild(el('p', 'p-leg', p.legenda.length > 90 ? p.legenda.slice(0, 90) + '...' : p.legenda));
        c.appendChild(el('p', 'p-est', ESTADOS[p.estado]));
        if (p.estado === 'aguardando') {
          var b = el('button', 'aprovar', 'Aprovar'); b.type = 'button'; b.dataset.id = p.id;
          b.setAttribute('aria-label', 'Aprovar post de ' + nome + ' às ' + p.hora);
          c.appendChild(b);
        }
        if (p.estado !== 'publicado') {
          var x = el('button', 'tirar', 'Tirar'); x.type = 'button'; x.dataset.tirar = p.id;
          x.setAttribute('aria-label', 'Tirar post de ' + nome + ' às ' + p.hora);
          c.appendChild(x);
        }
        li.appendChild(c);
      });
      ol.appendChild(li);
    });
    var fim = est.hoje === 6;
    $('hoje').textContent = 'Simulando: ' + DIAS[est.hoje].toLowerCase() + '.';
    $('amanha').textContent = fim ? 'Recomeçar a semana' : 'Avançar para o próximo dia';
    var dia = $('dia'), v = dia.value;
    dia.textContent = '';
    DIAS.forEach(function (n, i) {
      if (i < est.hoje) return;
      var o = el('option', '', n); o.value = i; dia.appendChild(o);
    });
    if (v !== '' && Number(v) >= est.hoje) dia.value = v;
  }
  function pintarConta() {
    var n = $('legenda').value.length, c = $('conta-leg');
    c.textContent = n.toLocaleString('pt-BR') + ' de ' + LIMITE.toLocaleString('pt-BR') + ' caracteres';
    c.classList.toggle('passou', n > LIMITE);
  }

  /* mensagens */
  function responder(texto, idade) {
    var n = norm(texto);
    if (idade >= JANELA) return { tipo: 'fora', txt: 'Fora da janela de 24 horas: sem resposta automática. Foi para a fila da equipe.' };
    if (HUMANO.some(function (h) { return n.indexOf(norm(h)) >= 0; })) return { tipo: 'humano', txt: 'Sou o atendimento automático do Ateliê Seriema. Já chamei uma pessoa da equipe para cuidar disso com você.' };
    var r = est.regras.filter(function (x) { return x.pal.some(function (p) { return n.indexOf(norm(p)) >= 0; }); })[0];
    if (r) return { tipo: 'auto', txt: 'Sou o atendimento automático do Ateliê Seriema. ' + r.txt };
    return { tipo: 'humano', txt: 'Sou o atendimento automático do Ateliê Seriema. Não sei responder isso sozinho, então passei para a equipe.' };
  }
  function pintarConv() {
    var ol = $('conversas');
    ol.textContent = '';
    est.conv.forEach(function (c) {
      var li = el('li');
      li.appendChild(el('p', 'c-cliente', c.msg));
      if (c.idade) li.appendChild(el('p', 'c-idade', 'Recebida há ' + c.idade + ' horas'));
      li.appendChild(el('p', 'c-' + c.tipo, c.txt));
      ol.appendChild(li);
    });
    $('sem-conv').hidden = est.conv.length > 0;
    ol.scrollTop = ol.scrollHeight;
  }
  function pintarRegras() {
    var ul = $('regras');
    ul.textContent = '';
    est.regras.forEach(function (r) {
      var li = el('li');
      li.appendChild(el('b', '', r.pal.slice(0, 4).join(', ')));
      li.appendChild(el('span', '', r.txt));
      ul.appendChild(li);
    });
  }
  function pintarRel() {
    var cont = function (e) { return est.posts.filter(function (p) { return p.estado === e; }).length; };
    var tp = function (t) { return est.conv.filter(function (c) { return c.tipo === t; }).length; };
    var it = [['Posts publicados', cont('publicado')], ['Na fila, aprovados', cont('aprovado')], ['Aguardando aprovação', cont('aguardando')], ['Atrasados', cont('atrasado')], ['Respostas automáticas', tp('auto')], ['Passadas para a equipe', tp('humano') + tp('fora')]];
    var dl = $('relatorio');
    dl.textContent = '';
    it.forEach(function (x) { var d = el('div'); d.appendChild(el('dd', '', String(x[1]))); d.appendChild(el('dt', '', x[0])); dl.appendChild(d); });
  }
  function tudo() { publicarDoDia(); pintarDias(); pintarConv(); pintarRegras(); pintarRel(); pintarConta(); salvar(); }

  $('amanha').addEventListener('click', function () {
    if (est.hoje >= 6) {
      est.hoje = 0;
      est.posts = est.posts.filter(function (p) { return p.estado === 'aprovado' || p.estado === 'aguardando'; });
      if (!est.posts.length) est.posts = padrao().posts;
    } else est.hoje++;
    tudo();
  });
  $('dias').addEventListener('click', function (e) {
    var a = e.target.dataset.id, t = e.target.dataset.tirar;
    if (a) est.posts.forEach(function (p) { if (String(p.id) === a) p.estado = 'aprovado'; });
    if (t) est.posts = est.posts.filter(function (p) { return String(p.id) !== t; });
    if (a || t) { tudo(); }
  });
  $('legenda').addEventListener('input', pintarConta);
  $('agendar').addEventListener('click', function () {
    var l = $('legenda').value.trim(), er = $('erro-post');
    er.textContent = '';
    if (!l) { er.textContent = 'Escreva a legenda antes de enviar.'; $('legenda').focus(); return; }
    if (l.length > LIMITE) { er.textContent = 'A legenda passou de 2.200 caracteres. Encurte antes de enviar.'; $('legenda').focus(); return; }
    if (!/^\d\d:\d\d$/.test($('hora').value)) { er.textContent = 'Escolha a hora da publicação.'; $('hora').focus(); return; }
    est.posts.push({ id: ++est.seq, dia: Number($('dia').value), hora: $('hora').value, tipo: $('tipo').value, legenda: l, estado: 'aguardando' });
    $('legenda').value = '';
    tudo();
  });
  $('receber').addEventListener('click', function () {
    var m = $('msg').value.trim();
    if (!m) { $('msg').focus(); return; }
    var idade = Number($('idade').value), r = responder(m, idade);
    est.conv.push({ msg: m, idade: idade, tipo: r.tipo, txt: r.txt });
    if (est.conv.length > 30) est.conv.shift();
    $('msg').value = '';
    tudo();
  });
  document.querySelector('.atalhos').addEventListener('click', function (e) { if (e.target.dataset.t) { $('msg').value = e.target.dataset.t; $('receber').click(); } });
  $('r-add').addEventListener('click', function () {
    var pal = $('r-pal').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean), txt = $('r-txt').value.trim(), er = $('r-erro');
    er.textContent = '';
    if (!pal.length || !txt) { er.textContent = 'Preencha as palavras e a resposta.'; return; }
    est.regras.push({ id: 'r' + (++est.seq), pal: pal.slice(0, 8), txt: txt });
    $('r-pal').value = ''; $('r-txt').value = '';
    tudo();
  });
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    est = padrao(); $('legenda').value = ''; $('msg').value = ''; tudo();
  });
  tudo();
})();
