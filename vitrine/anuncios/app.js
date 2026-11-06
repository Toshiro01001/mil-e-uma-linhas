'use strict';
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var CAMPOS = [
    { id: 'verba', rot: 'Verba por mês (R$)', v: 3000, min: 1, max: 1000000, passo: 50 },
    { id: 'cpm', rot: 'Custo por mil impressões, CPM (R$)', v: 25, min: 0.1, max: 1000, passo: 0.5 },
    { id: 'ctr', rot: 'Taxa de clique, CTR (%)', v: 1.5, min: 0.01, max: 100, passo: 0.1 },
    { id: 'contato', rot: 'Dos cliques, quantos chamam (%)', v: 8, min: 0.01, max: 100, passo: 0.5 },
    { id: 'fecha', rot: 'Das conversas, quantas compram (%)', v: 15, min: 0.01, max: 100, passo: 0.5 },
    { id: 'ticket', rot: 'Preço médio da venda (R$)', v: 790, min: 1, max: 1000000, passo: 10 },
    { id: 'margem', rot: 'Margem antes do anúncio (%)', v: 40, min: 1, max: 100, passo: 1 }
  ];
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function rs(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v < 100 ? 2 : 0 }); }
  function nu(v, d) { return v.toLocaleString('pt-BR', { maximumFractionDigits: d === undefined ? 0 : d }); }

  CAMPOS.forEach(function (c) {
    var d = el('div', 'campo');
    var l = el('label', '', c.rot); l.htmlFor = c.id;
    var i = el('input'); i.id = c.id; i.type = 'number'; i.min = c.min; i.max = c.max; i.step = c.passo; i.value = c.v; i.inputMode = 'decimal';
    d.appendChild(l); d.appendChild(i); $('campos').appendChild(d);
  });

  function lerFunil() {
    var o = {}, ok = true;
    CAMPOS.forEach(function (c) {
      var i = $(c.id), v = Number(i.value);
      if (i.value === '' || !isFinite(v) || v < c.min || v > c.max) { ok = false; i.setAttribute('aria-invalid', 'true'); }
      else i.removeAttribute('aria-invalid');
      o[c.id] = v;
    });
    return ok ? o : null;
  }
  function calcular(e, f) {
    var imp = e.verba / e.cpm * 1000;
    var cl = imp * Math.min(e.ctr * f, 100) / 100;
    var co = cl * e.contato / 100;
    var ve = co * Math.min(e.fecha * f, 100) / 100;
    var rec = ve * e.ticket;
    return { imp: imp, cl: cl, co: co, ve: ve, rec: rec, cpc: e.verba / cl, cpa: e.verba / ve, roas: rec / e.verba, lucro: rec * e.margem / 100 - e.verba, cpaMax: e.ticket * e.margem / 100, roasMin: 100 / e.margem };
  }
  function pintarFunil() {
    var e = lerFunil(), er = $('erro-funil');
    if (!e) { er.textContent = 'Confira os campos: cada valor precisa estar dentro do limite, sem campo vazio.'; return; }
    er.textContent = '';
    var f = Number(document.querySelector('input[name=cen]:checked').value), r = calcular(e, f);
    var et = [['Verba', rs(e.verba), 'v'], ['Impressões', nu(r.imp), 'i'], ['Cliques', nu(r.cl), 'c'], ['Conversas', nu(r.co, 1), 'o'], ['Vendas', nu(r.ve, 1), 's'], ['Receita', rs(r.rec), 'r']];
    var ol = $('funil'), base = Math.log10(r.imp + 10);
    ol.textContent = '';
    [null, r.imp, r.cl, r.co, r.ve, null].forEach(function (q, i) {
      var li = el('li', 'et-' + et[i][2]);
      li.appendChild(el('span', 'et-nome', et[i][0]));
      var barra = el('span', 'barra');
      if (q === null) barra.style.width = i === 0 ? '100%' : Math.max(Math.min(r.rec / e.verba, 1), 0.03) * 100 + '%';
      else barra.style.width = Math.max(Math.log10(q + 1) / base, 0.03) * 100 + '%';
      li.appendChild(barra);
      li.appendChild(el('b', 'et-val', et[i][1]));
      ol.appendChild(li);
    });
    var ind = [['Custo por clique', rs(r.cpc)], ['Custo por venda', r.ve > 0 ? rs(r.cpa) : 'Sem vendas'], ['Máximo por venda', rs(r.cpaMax)], ['Retorno sobre gasto', nu(r.roas, 2) + 'x'], ['Retorno mínimo', nu(r.roasMin, 2) + 'x'], ['Sobra após o anúncio', rs(r.lucro)]];
    var dl = $('indicadores');
    dl.textContent = '';
    ind.forEach(function (x) { var d = el('div'); d.appendChild(el('dt', '', x[0])); d.appendChild(el('dd', '', x[1])); dl.appendChild(d); });
    var v = $('veredito');
    if (r.lucro >= 0) {
      v.className = 'veredito bom';
      v.textContent = 'Nesta hipótese a conta fecha: cada venda custa ' + rs(r.cpa) + ', abaixo do máximo de ' + rs(r.cpaMax) + '. Falta confirmar com dados reais.';
    } else {
      v.className = 'veredito ruim';
      v.textContent = 'Nesta hipótese a conta não fecha: cada venda custa ' + rs(r.cpa) + ', acima do máximo de ' + rs(r.cpaMax) + '. Antes de aumentar a verba, melhore a página, o atendimento ou a margem.';
    }
  }
  $('campos').addEventListener('input', pintarFunil);
  document.querySelector('.cenarios').addEventListener('change', pintarFunil);

  /* UTM */
  function slug(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function gerar() {
    var er = $('u-erro'), sa = $('u-saida'), bt = $('u-copiar');
    er.textContent = ''; $('u-ok').textContent = '';
    bt.disabled = true; sa.textContent = '';
    var u;
    try { u = new URL($('u-url').value.trim()); } catch (e) { er.textContent = 'Use um endereço completo, começando por https://.'; return; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') { er.textContent = 'Só endereços http e https são aceitos.'; return; }
    var cam = slug($('u-cam').value), con = slug($('u-con').value);
    if (!cam) { er.textContent = 'Dê um nome à campanha.'; return; }
    u.searchParams.set('utm_source', $('u-src').value);
    u.searchParams.set('utm_medium', $('u-med').value);
    u.searchParams.set('utm_campaign', cam);
    if (con) u.searchParams.set('utm_content', con); else u.searchParams.delete('utm_content');
    sa.textContent = u.href; bt.disabled = false;
  }
  ['u-url', 'u-src', 'u-med', 'u-cam', 'u-con'].forEach(function (k) { $(k).addEventListener('input', gerar); $(k).addEventListener('change', gerar); });
  $('u-copiar').addEventListener('click', function () {
    var t = $('u-saida').textContent, ok = $('u-ok');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { ok.textContent = 'Link copiado.'; }, function () { ok.textContent = 'O navegador não deixou copiar. Selecione o link e copie à mão.'; });
    } else ok.textContent = 'O navegador não deixou copiar. Selecione o link e copie à mão.';
  });

  /* A/B: teste Z de duas proporções, bicaudal */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function pintarAB() {
    var av = Number($('a-v').value), ac = Number($('a-c').value), bv = Number($('b-v').value), bc = Number($('b-c').value), s = $('ab-saida');
    var val = [av, ac, bv, bc].every(function (n) { return Number.isInteger(n) && n >= 0; });
    if (!val || ac > av || bc > bv) { s.className = 'ab-saida ruim'; s.textContent = 'Use números inteiros, e as vendas não podem passar das visitas.'; return; }
    if (av < 30 || bv < 30) { s.className = 'ab-saida'; s.textContent = 'Poucas visitas para comparar. Espere pelo menos 30 em cada anúncio, e de preferência bem mais.'; return; }
    var pa = ac / av, pb = bc / bv, pp = (ac + bc) / (av + bv);
    var ep = Math.sqrt(pp * (1 - pp) * (1 / av + 1 / bv));
    var z = ep > 0 ? (pb - pa) / ep : 0;
    var p = ep > 0 ? 1 - erf(Math.abs(z) / Math.SQRT2) : 1;
    var conf = (1 - p) * 100, tx = function (x) { return nu(x * 100, 2) + '%'; };
    var base = 'A converteu ' + tx(pa) + ' e B converteu ' + tx(pb) + '. Confiança: ' + nu(conf, 1) + '%. ';
    if (p < 0.05 && pa !== pb) { s.className = 'ab-saida bom'; s.textContent = base + 'Vencedor: anúncio ' + (pb > pa ? 'B' : 'A') + '.'; }
    else { s.className = 'ab-saida'; s.textContent = base + 'Ainda sem vencedor: continue o teste antes de decidir.'; }
  }
  ['a-v', 'a-c', 'b-v', 'b-c'].forEach(function (k) { $(k).addEventListener('input', pintarAB); });

  pintarFunil(); gerar(); pintarAB();
})();
