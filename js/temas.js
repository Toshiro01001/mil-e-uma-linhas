/* As 5 aparências. Trocar só muda um atributo no <html>; o código de cada capa só roda quando ela é aberta. */
window.MUL_TEMAS = (function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var raiz = document.documentElement, feitas = {};
  var botoes = Array.prototype.slice.call(document.querySelectorAll('.temas button'));
  var EMAIL = 'contato@mileumalinhas.com.br';

  function marcar(t) {
    botoes.forEach(function (b) {
      var on = b.dataset.t === t;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }
  function trocar(t, inicial) {
    raiz.setAttribute('data-tema', t);
    marcar(t);
    if (!inicial) { try { localStorage.setItem('mul-tema', t); } catch (e) {} }
    if (CAPAS[t] && !feitas[t]) { feitas[t] = true; CAPAS[t](); }
    if (!inicial) window.dispatchEvent(new Event('mul:tema'));
  }
  /* No celular o seletor fica recolhido para a marca e as abas caberem na primeira tela. */
  var abrirTemas = $('#temas-abrir'), caixaTemas = $('#temas');
  function mostrarTemas(on) { caixaTemas.classList.toggle('aberto', on); abrirTemas.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  abrirTemas.addEventListener('click', function () { mostrarTemas(!caixaTemas.classList.contains('aberto')); });
  botoes.forEach(function (b, i) {
    b.addEventListener('click', function (e) { trocar(b.dataset.t); if (e.detail > 0) mostrarTemas(false); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault(); e.stopPropagation();
      var n = botoes[(i + d + botoes.length) % botoes.length];
      n.focus(); n.click();
    });
  });

  /* ---------- Empresa: guia que indica por onde começar ---------- */
  function empresa() {
    var G = [
      ['Escritório', 'Site Profissional', 'Até 5 páginas com áreas de atuação, equipe e formulário. Passa confiança para quem pesquisa antes de ligar.', 'site'],
      ['Clínica', 'Site Essencial com agendamento', 'Uma página clara e horários online, para reduzir ligações e mensagens repetidas.', 'site'],
      ['Comércio', 'E-commerce', 'Catálogo, carrinho e pagamento no próprio site, sem depender só de marketplace e das redes sociais.', 'ecommerce'],
      ['Restaurante', 'Site Essencial e atendimento automático', 'Cardápio sempre atualizado e pedidos organizados antes de chegar à cozinha.', 'vendas'],
      ['Indústria ou serviços', 'Sistema Pequeno', 'Tire o controle de pedidos, estoque ou ordens de serviço das planilhas soltas.', 'sistema'],
      ['Outro', 'uma conversa', 'Conte o que você vende e o que precisa resolver. Eu indico o caminho e o preço antes de qualquer gasto.', '#contato']
    ];
    var box = $('#em-negocios'), saida = $('#em-saida');
    function abrir(i) {
      Array.prototype.forEach.call(box.children, function (b, j) { b.setAttribute('aria-pressed', i === j ? 'true' : 'false'); });
      saida.textContent = '';
      saida.appendChild(el('h3', null, 'Comece por: ' + G[i][1]));
      saida.appendChild(el('p', null, G[i][2]));
      var ext = G[i][3].charAt(0) === '#'; var a = el('a', 'botao cheio', ext ? 'Falar comigo' : 'Ver os planos deste caminho'); a.href = ext ? G[i][3] : '#orcamento/' + G[i][3];
      saida.appendChild(a);
    }
    G.forEach(function (g, i) {
      var b = el('button', 'pilula', g[0]); b.type = 'button';
      b.addEventListener('click', function () { abrir(i); });
      box.appendChild(b);
    });
    abrir(0);
  }

  /* ---------- Loja: vitrine com sacola que vira orçamento ---------- */
  function loja() {
    var O = window.MUL_ORC, P = O.PEDIDOS, chaves = Object.keys(P), filtro = 'todos';
    var F = [['todos', 'Todos'], ['projeto', 'Pagamento único'], ['mensal', 'Por mês'], ['hora', 'Por hora']];
    var fb = $('#lj-filtros'), vit = $('#lj-vitrine'), sac = $('#lj-sacola');
    function classe(k) { return P[k].horas ? 'hora' : P[k].planos[0].mensal ? 'mensal' : 'projeto'; }
    function render() {
      Array.prototype.forEach.call(fb.children, function (b, i) { b.setAttribute('aria-pressed', F[i][0] === filtro ? 'true' : 'false'); });
      vit.textContent = '';
      chaves.filter(function (k) { return filtro === 'todos' || classe(k) === filtro; }).forEach(function (k) {
        var c = el('article', 'produto'), pl = P[k].planos[0], cl = classe(k);
        c.appendChild(el('h3', null, P[k].nome));
        c.appendChild(el('p', null, pl.desc));
        c.appendChild(el('p', 'produto-preco', cl === 'mensal' ? 'Serviço mensal, orçamento sem compromisso' : 'Orçamento sem compromisso'));
        if (pl.dias) c.appendChild(el('p', 'produto-prazo', 'Prazo: ' + O.diasTxt(pl.dias)));
        var b = el('button', 'botao cheio', 'Adicionar ao pedido'); b.type = 'button';
        b.addEventListener('click', function () { O.adicionar(k); });
        c.appendChild(b);
        var a = el('a', 'botao', 'Ver planos'); a.href = '#orcamento/' + k;
        c.appendChild(a);
        vit.appendChild(c);
      });
    }
    function sacola() {
      var r = O.resumoCarrinho(); sac.textContent = '';
      if (!r.n) { sac.appendChild(el('span', null, 'Seu pedido está vazio.')); return; }
      sac.appendChild(el('span', null, r.n + (r.n === 1 ? ' item' : ' itens') + ': ' + r.txt + '.'));
      var a = el('a', 'botao cheio', 'Revisar e enviar'); a.href = '#orcamento/finalizar'; sac.appendChild(a);
    }
    /* faixa de anúncios: os serviços e o que cada um faz, repetidos duas vezes para a rolagem contínua não ter emenda */
    var faixa = $('#lj-faixa');
    if (faixa) {
      var FAZ = { site: 'mostra o seu negócio', ecommerce: 'vende a qualquer hora', sistema: 'organiza a equipe', vendas: 'atende sozinho', trafego: 'traz mais gente' };
      var itens = chaves.map(function (k) { return P[k].nome + ': ' + (FAZ[k] || 'sob medida'); });
      [0, 1].forEach(function () {
        var t = el('span', 'lj-faixa-trilha');
        itens.forEach(function (x) { t.appendChild(el('b', null, x)); t.appendChild(el('i', null, '\u25CF')); });
        faixa.appendChild(t);
      });
    }
    F.forEach(function (f) {
      var b = el('button', 'pilula', f[1]); b.type = 'button';
      b.addEventListener('click', function () { filtro = f[0]; render(); });
      fb.appendChild(b);
    });
    O.rota('');
    O.aoMudar(sacola);
    render(); sacola();
  }

  /* ---------- Painel: tabela que filtra e ordena, mostrando o SQL ---------- */
  function painel() {
    window.MUL_DEMOS.dados();
    var D = window.MUL_DADOS, tab = $('#pn-tabela'), ord = 0, dir = 1, cab = ['Pedido', 'Cliente', 'Item', 'Qtd.', 'Valor', 'Situação'];
    var sa = function (t) { return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    function render() {
      var q = sa($('#pn-busca').value.trim()), st = $('#pn-status').value;
      var f = D.base.filter(function (l) { return (!st || l[5] === st) && (!q || sa(l[1]).indexOf(q) >= 0 || sa(l[2]).indexOf(q) >= 0); });
      f = f.slice().sort(function (a, b) { return (a[ord] > b[ord] ? 1 : a[ord] < b[ord] ? -1 : 0) * dir; });
      tab.textContent = '';
      var th = el('thead'), tr = el('tr');
      cab.forEach(function (c, i) {
        var h = el('th'), b = el('button', null, c + (ord === i ? (dir > 0 ? ' (crescente)' : ' (decrescente)') : ''));
        b.type = 'button'; h.setAttribute('aria-sort', ord === i ? (dir > 0 ? 'ascending' : 'descending') : 'none');
        b.addEventListener('click', function () { if (ord === i) dir = -dir; else { ord = i; dir = 1; } render(); });
        h.appendChild(b); tr.appendChild(h);
      });
      th.appendChild(tr); tab.appendChild(th);
      var tb = el('tbody');
      if (!f.length) { var v = el('tr'), td = el('td', 'vazio', 'Nenhum pedido com esse filtro. Limpe a busca para ver todos.'); td.colSpan = 6; v.appendChild(td); tb.appendChild(v); }
      f.forEach(function (l) {
        var r = el('tr');
        l.forEach(function (x, i) {
          if (i === 5) { var td = el('td', 'st st-' + sa(x).replace(/\s/g, '-')); td.appendChild(el('span', 'sit', x)); r.appendChild(td); return; }
          r.appendChild(el('td', i === 3 || i === 4 || i === 0 ? 'num' : null, i === 4 ? 'R$ ' + x : x));
        });
        tb.appendChild(r);
      });
      tab.appendChild(tb);
      var soma = f.reduce(function (s, l) { return s + l[4]; }, 0), ent = f.filter(function (l) { return l[5] === 'entregue'; }).length;
      var K = $('#pn-kpis'); K.textContent = '';
      [['Pedidos', f.length], ['Faturamento', 'R$ ' + soma], ['Entregues', ent], ['Ticket médio', 'R$ ' + (f.length ? Math.round(soma / f.length) : 0)]].forEach(function (k) {
        var d = el('div', 'kpi'); d.appendChild(el('span', null, k[0])); d.appendChild(el('b', null, k[1])); K.appendChild(d);
      });
      var w = [];
      if (st) w.push("situacao = '" + st + "'");
      if (q) w.push("(cliente LIKE '%" + q.replace(/'/g, "''") + "%' OR item LIKE '%" + q.replace(/'/g, "''") + "%')");
      $('#pn-sql').textContent = 'SELECT * FROM pedidos' + (w.length ? '\nWHERE ' + w.join('\n  AND ') : '') + '\nORDER BY ' + D.cols[ord] + (dir > 0 ? ' ASC' : ' DESC') + ';';
    }
    $('#pn-busca').addEventListener('input', render);
    $('#pn-status').addEventListener('change', render);
    render();
  }

  /* ---------- Agenda: sugerir horário de conversa ---------- */
  function agenda() {
    var diasBox = $('#ag-dias'), horasBox = $('#ag-horas'), HORAS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    var dias = [], d = new Date(); d.setHours(12, 0, 0, 0);
    while (dias.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) dias.push(new Date(d)); }
    var fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    var sel = { d: 0, h: 1 };
    function nomeDia(x) { return fmt.format(x).replace('.', ''); }
    function atualizar() {
      Array.prototype.forEach.call(diasBox.children, function (b, i) { b.setAttribute('aria-pressed', i === sel.d ? 'true' : 'false'); });
      Array.prototype.forEach.call(horasBox.children, function (b, i) { b.setAttribute('aria-pressed', i === sel.h ? 'true' : 'false'); });
      var txt = nomeDia(dias[sel.d]) + ', às ' + HORAS[sel.h], nome = $('#ag-nome').value.trim();
      $('#ag-resumo').textContent = 'Horário sugerido: ' + txt + '.';
      $('#ag-enviar').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Conversa sobre projeto') + '&body=' + encodeURIComponent('Olá! ' + (nome ? 'Sou ' + nome + '. ' : '') + 'Gostaria de conversar sobre um projeto em ' + txt + '.\n\nSobre o projeto:\n\n');
    }
    dias.forEach(function (x, i) { var b = el('button', 'pilula', nomeDia(x)); b.type = 'button'; b.addEventListener('click', function () { sel.d = i; atualizar(); }); diasBox.appendChild(b); });
    HORAS.forEach(function (h, i) { var b = el('button', 'pilula', h); b.type = 'button'; b.addEventListener('click', function () { sel.h = i; atualizar(); }); horasBox.appendChild(b); });
    $('#ag-nome').addEventListener('input', atualizar);
    atualizar();
  }

  /* trilho de rolagem (tema Loja): uma linha fina sob o cabeçalho cresce conforme a leitura avança */
  var trilho = $('#trilho'), principal = $('main');
  if (trilho && principal) {
    var pedido = false;
    function medir() {
      pedido = false;
      var max = principal.scrollHeight - principal.clientHeight;
      trilho.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, principal.scrollTop / max) : 0) + ')';
    }
    principal.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }, { passive: true });
    window.addEventListener('hashchange', function () { setTimeout(medir, 80); });
    window.addEventListener('mul:tema', function () { setTimeout(medir, 80); });
    medir();
  }

  var CAPAS = { empresa: empresa, loja: loja, painel: painel, agenda: agenda };
  trocar(raiz.getAttribute('data-tema') || 'ascii', true);
  return { trocar: trocar };
})();
