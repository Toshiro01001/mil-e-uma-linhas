/* Clínica Ipê de Agosto. Agendamento de demonstração: tudo fica no localStorage deste navegador. */
(function () {
  'use strict';
  var CHAVE = 'vitrine-agenda:estado';
  var PASSO = 30; /* minutos entre um início de consulta e outro */

  /* Para adaptar a outra clínica, basta trocar estas duas listas. Turnos em minutos desde 0h. */
  var ESP = [
    { id: 'geral', nome: 'Clínica geral', dur: 30, desc: 'Consulta de rotina, 30 minutos' },
    { id: 'cardio', nome: 'Cardiologia', dur: 30, desc: 'Coração e pressão, 30 minutos' },
    { id: 'derma', nome: 'Dermatologia', dur: 30, desc: 'Pele, cabelo e unhas, 30 minutos' },
    { id: 'pedi', nome: 'Pediatria', dur: 30, desc: 'Crianças e adolescentes, 30 minutos' },
    { id: 'fisio', nome: 'Fisioterapia', dur: 60, desc: 'Sessão completa, 60 minutos' }
  ];
  var PROF = [
    { id: 'helena', nome: 'Dra. Helena Prado', esp: 'geral', dias: [1, 2, 3, 4, 5], turnos: [[480, 720], [840, 1050]] },
    { id: 'caio', nome: 'Dr. Caio Menezes', esp: 'geral', dias: [2, 4, 6], turnos: [[480, 720]] },
    { id: 'otavio', nome: 'Dr. Otávio Lacerda', esp: 'cardio', dias: [1, 3, 5], turnos: [[480, 720]] },
    { id: 'julia', nome: 'Dra. Júlia Tavares', esp: 'derma', dias: [2, 4], turnos: [[810, 1080]] },
    { id: 'renata', nome: 'Dra. Renata Cordeiro', esp: 'pedi', dias: [1, 2, 3, 4, 5], turnos: [[840, 1080]] },
    { id: 'bruno', nome: 'Bruno Amaral', esp: 'fisio', dias: [1, 2, 3, 4, 5, 6], turnos: [[480, 720], [840, 1080]] }
  ];
  var NOMES = ['Ana F.', 'Bento R.', 'Clara M.', 'Davi S.', 'Elisa T.', 'Fábio L.', 'Gisele P.', 'Hugo A.', 'Iara C.', 'João V.', 'Lívia D.', 'Mateus B.', 'Nair G.', 'Otília Q.'];

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
    for (i = 2; i < arguments.length; i++) {
      if (arguments[i] !== null && arguments[i] !== undefined) e.append(arguments[i]);
    }
    return e;
  }
  function limpar(e) { e.textContent = ''; return e; }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function deIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function somaDias(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function hoje() { return iso(new Date()); }
  function hhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function dataLonga(s) { return deIso(s).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function prof(id) { return PROF.find(function (p) { return p.id === id; }); }
  function esp(id) { return ESP.find(function (x) { return x.id === id; }); }
  function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function normal(s) { return s.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' '); }

  /* Guarda e leitura, sempre protegidas: em janela privada o localStorage pode falhar. */
  function lerSalvo() {
    try {
      var d = JSON.parse(localStorage.getItem(CHAVE));
      return d && d.v === 1 && Array.isArray(d.consultas) && Array.isArray(d.bloqueios) ? d : null;
    } catch (e) { return null; }
  }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* segue só na memória */ } }

  function exemplo() {
    var d = { v: 1, consultas: [], bloqueios: [] }, sem = 20261, base = hoje(), i, a;
    function acaso() { sem = (sem * 16807) % 2147483647; return sem / 2147483647; }
    for (i = 0; i < 14; i++) {
      a = somaDias(base, i);
      PROF.forEach(function (p) {
        var dur = esp(p.esp).dur;
        horariosDe(p, a).forEach(function (ini) {
          if (acaso() < 0.3 && !conflitoEm(d, p.id, a, ini, dur)) {
            d.consultas.push({ id: novoId(), prof: p.id, data: a, ini: ini, dur: dur, paciente: NOMES[Math.floor(acaso() * NOMES.length)], status: 'marcada', codigo: '', minha: false });
          }
        });
      });
    }
    for (i = 1; i < 8; i++) {
      a = somaDias(base, i);
      if (prof('helena').dias.indexOf(deIso(a).getDay()) >= 0) {
        d.consultas = d.consultas.filter(function (c) { return !(c.prof === 'helena' && c.data === a && c.ini >= 840 && c.ini < 930); });
        d.bloqueios.push({ id: novoId(), prof: 'helena', data: a, ini: 840, fim: 930, motivo: 'Reunião da equipe' });
        break;
      }
    }
    return d;
  }

  function horariosDe(p, data) {
    var out = [], dur = esp(p.esp).dur;
    if (p.dias.indexOf(deIso(data).getDay()) < 0) return out;
    p.turnos.forEach(function (t) {
      for (var m = t[0]; m + dur <= t[1]; m += PASSO) out.push(m);
    });
    return out;
  }
  /* A regra central: dois intervalos do mesmo profissional no mesmo dia não podem se sobrepor. */
  function conflitoEm(d, pid, data, ini, dur) {
    var fim = ini + dur;
    var c = d.consultas.find(function (x) { return x.prof === pid && x.data === data && x.status !== 'cancelada' && ini < x.ini + x.dur && x.ini < fim; });
    if (c) return { tipo: 'consulta', item: c };
    var b = d.bloqueios.find(function (x) { return x.prof === pid && x.data === data && ini < x.fim && x.ini < fim; });
    return b ? { tipo: 'bloqueio', item: b } : null;
  }
  function jaPassou(data, ini) {
    var n = new Date(), hj = iso(n);
    return data < hj || (data === hj && ini <= n.getHours() * 60 + n.getMinutes());
  }
  function vagaLivre(pid, data, ini) {
    var dur = esp(prof(pid).esp).dur;
    return !jaPassou(data, ini) && !conflitoEm(E, pid, data, ini, dur);
  }

  var E = lerSalvo();
  if (!E) { E = exemplo(); gravar(); }
  var sel = { esp: null, prof: null, dia: null, ini: null };
  var ultimo = null, pendente = null, recDia = hoje();

  /* Mantém o foco no mesmo botão quando a lista é redesenhada */
  function comFoco(fn) {
    var a = document.activeElement, k = a && a.getAttribute ? a.getAttribute('data-k') : null;
    fn();
    if (k) { var n = document.querySelector('[data-k="' + CSS.escape(k) + '"]'); if (n && !n.disabled) n.focus(); }
  }
  function opcao(k, marcado, aoClicar, titulo, sub, desligado) {
    return h('button', { type: 'button', class: 'op', 'data-k': k, 'aria-pressed': String(!!marcado), disabled: !!desligado, onclick: aoClicar },
      h('strong', { text: titulo }), sub ? h('small', { text: sub }) : null);
  }

  function desenharPassos() {
    var l = limpar($('lista-esp'));
    ESP.forEach(function (x) {
      l.append(opcao('esp-' + x.id, sel.esp === x.id, function () {
        sel = { esp: x.id, prof: null, dia: null, ini: null };
        var so = PROF.filter(function (p) { return p.esp === x.id; });
        if (so.length === 1) sel.prof = so[0].id;
        mudouSel();
      }, x.nome, x.desc));
    });
    l = limpar($('lista-prof'));
    if (!sel.esp) l.append(h('p', { class: 'vazio', text: 'Escolha a especialidade para ver quem atende.' }));
    else PROF.filter(function (p) { return p.esp === sel.esp; }).forEach(function (p) {
      l.append(opcao('prof-' + p.id, sel.prof === p.id, function () {
        sel.prof = p.id; sel.dia = null; sel.ini = null; mudouSel();
      }, p.nome, resumoDias(p)));
    });
    l = limpar($('lista-dia'));
    if (!sel.prof) l.append(h('p', { class: 'vazio', text: 'Escolha o profissional para ver os dias.' }));
    else {
      for (var i = 0; i < 14; i++) {
        (function (a) {
          var d = deIso(a), livres = horariosDe(prof(sel.prof), a).filter(function (m) { return vagaLivre(sel.prof, a, m); }).length;
          l.append(opcao('dia-' + a, sel.dia === a, function () { sel.dia = a; sel.ini = null; mudouSel(); },
            String(d.getDate()) + '/' + String(d.getMonth() + 1).padStart(2, '0'),
            d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + (livres ? '' : ', sem vaga'), !livres));
        })(somaDias(hoje(), i));
      }
    }
    l = limpar($('lista-hora'));
    if (!sel.dia) { l.append(h('p', { class: 'vazio', text: 'Escolha o dia para ver os horários.' })); return; }
    var hs = horariosDe(prof(sel.prof), sel.dia);
    [['Manhã', 0, 720], ['Tarde', 720, 1440]].forEach(function (t) {
      var parte = hs.filter(function (m) { return m >= t[1] && m < t[2]; });
      if (!parte.length) return;
      l.append(h('p', { class: 'turno', text: t[0] }));
      var g = h('div', { class: 'op-hora' });
      parte.forEach(function (m) {
        var ok = vagaLivre(sel.prof, sel.dia, m), b = opcao('hora-' + m, sel.ini === m, function () { sel.ini = m; mudouSel(); }, hhmm(m), null, !ok);
        b.setAttribute('aria-label', hhmm(m) + (ok ? ', livre' : ', ocupado'));
        g.append(b);
      });
      l.append(g);
    });
  }
  function resumoDias(p) {
    var n = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    return p.dias.map(function (d) { return n[d]; }).join(', ');
  }
  function desenharResumo() {
    var dl = limpar($('resumo'));
    [['Especialidade', sel.esp && esp(sel.esp).nome], ['Profissional', sel.prof && prof(sel.prof).nome], ['Dia', sel.dia && dataLonga(sel.dia)], ['Horário', sel.ini !== null ? hhmm(sel.ini) : null]].forEach(function (x) {
      dl.append(h('dt', { text: x[0] }), h('dd', { text: x[1] || 'a escolher' }));
    });
  }
  function mudouSel() {
    $('erro').textContent = '';
    comFoco(function () { desenharPassos(); desenharResumo(); });
  }

  function confirmar(ev) {
    ev.preventDefault();
    var salvo = lerSalvo();
    if (salvo) E = salvo; /* lê de novo: outra aba pode ter marcado neste meio tempo */
    var erro = $('erro'), nome = $('paciente').value.trim();
    if (sel.ini === null) { erro.textContent = 'Falta escolher o horário. Siga os passos de 1 a 4.'; return; }
    if (!nome) { erro.textContent = 'Escreva o nome do paciente para confirmar.'; $('paciente').focus(); return; }
    if (jaPassou(sel.dia, sel.ini)) { erro.textContent = 'Esse horário já passou. Escolha outro.'; sel.ini = null; comFoco(desenharPassos); desenharResumo(); return; }
    var dur = esp(prof(sel.prof).esp).dur;
    if (conflitoEm(E, sel.prof, sel.dia, sel.ini, dur)) {
      sel.ini = null; comFoco(desenharPassos); desenharResumo(); desenharTudoMenosPassos();
      erro.textContent = 'Esse horário acabou de ser ocupado. Escolha outro horário.';
      return;
    }
    var outra = E.consultas.find(function (c) { return c.status !== 'cancelada' && c.data === sel.dia && normal(c.paciente) === normal(nome) && sel.ini < c.ini + c.dur && c.ini < sel.ini + dur; });
    if (outra) { erro.textContent = nome + ' já tem consulta às ' + hhmm(outra.ini) + ' nesse dia, com ' + prof(outra.prof).nome + '. Escolha outro horário.'; return; }
    var c = { id: novoId(), prof: sel.prof, data: sel.dia, ini: sel.ini, dur: dur, paciente: nome, status: 'marcada', codigo: 'IPE-' + Math.random().toString(36).slice(2, 6).toUpperCase(), minha: true };
    E.consultas.push(c);
    gravar();
    ultimo = c;
    sel = { esp: null, prof: null, dia: null, ini: null };
    $('paciente').value = '';
    $('form-confirmar').hidden = true;
    desenharTudo();
    mostrarComprovante();
  }
  function mostrarComprovante() {
    var b = limpar($('comprovante')), c = ultimo;
    b.hidden = false;
    b.append(h('h4', { text: 'Consulta confirmada' }),
      h('p', { class: 'codigo', text: c.codigo }),
      h('p', { text: c.paciente + ', ' + dataLonga(c.data) + ' às ' + hhmm(c.ini) + ', com ' + prof(c.prof).nome + '.' }),
      h('p', { text: 'Nada foi enviado: a confirmação fica só aqui. Para cancelar, use Minhas consultas.' }),
      h('button', { type: 'button', class: 'primario', id: 'marcar-outra', text: 'Marcar outra consulta', onclick: function () {
        b.hidden = true; $('form-confirmar').hidden = false; desenharResumo(); var p = document.querySelector('#lista-esp .op'); if (p) p.focus();
      } }));
    b.focus();
  }

  function cancelar(id, quem) {
    var salvo = lerSalvo();
    if (salvo) E = salvo;
    var c = E.consultas.find(function (x) { return x.id === id; });
    if (c) { c.status = 'cancelada'; gravar(); avisar('Consulta de ' + c.paciente + ' às ' + hhmm(c.ini) + ' cancelada. O horário voltou a ficar livre.'); }
    pendente = null;
    desenharTudo();
    var alvo = quem === 'rec' ? $('rec-resumo') : $('t-consultas');
    alvo.setAttribute('tabindex', '-1'); alvo.focus();
  }
  function avisar(t) { $('aviso').textContent = t; }

  function desenharMinhas() {
    var l = limpar($('lista-minhas'));
    var minhas = E.consultas.filter(function (c) { return c.minha; }).sort(function (a, b) { return (a.data + a.ini).localeCompare(b.data + b.ini); });
    if (!minhas.length) { l.append(h('p', { class: 'vazio', text: 'Você ainda não marcou nada neste navegador. As consultas marcadas aparecem aqui.' })); return; }
    minhas.forEach(function (c) {
      var acoes = h('div', { class: 'acoes' });
      if (c.status !== 'cancelada' && !jaPassou(c.data, c.ini)) {
        if (pendente === c.id) {
          acoes.append(h('button', { type: 'button', class: 'link-botao perigo', 'data-k': 'simcan-' + c.id, text: 'Sim, cancelar', onclick: function () { cancelar(c.id, 'pac'); } }),
            h('button', { type: 'button', class: 'link-botao', text: 'Manter consulta', onclick: function () { pendente = null; desenharMinhas(); } }));
        } else {
          acoes.append(h('button', { type: 'button', class: 'link-botao', 'data-k': 'can-' + c.id, text: 'Cancelar consulta', onclick: function () {
            pendente = c.id; desenharMinhas(); var n = document.querySelector('[data-k="simcan-' + c.id + '"]'); if (n) n.focus();
          } }));
        }
      }
      l.append(h('div', { class: 'minha', 'data-codigo': c.codigo },
        h('div', {},
          h('p', {}, h('strong', { text: dataLonga(c.data) + ' às ' + hhmm(c.ini) })),
          h('p', { text: c.paciente + ' com ' + prof(c.prof).nome + ', ' + esp(prof(c.prof).esp).nome }),
          h('p', {}, h('span', { class: 'selo ' + c.status, text: c.status === 'cancelada' ? 'Cancelada' : c.status === 'chegou' ? 'Paciente chegou' : 'Confirmada' }), ' Código ' + c.codigo)),
        acoes));
    });
  }

  /* Recepção */
  function desenharRecepcao() {
    $('rec-data').value = recDia;
    var r = limpar($('rec-raias')), total = 0, cheg = 0, canc = 0, bl = 0, doDia = PROF.filter(function (p) { return p.dias.indexOf(deIso(recDia).getDay()) >= 0; });
    if (!doDia.length) r.append(h('p', { class: 'vazio', text: 'Clínica fechada neste dia. Use as setas para ver outro dia.' }));
    doDia.forEach(function (p) {
      var raia = h('section', { class: 'raia', 'data-prof': p.id, 'aria-label': 'Agenda de ' + p.nome }, h('h3', { text: p.nome }), h('p', { class: 'esp', text: esp(p.esp).nome }));
      var cs = E.consultas.filter(function (c) { return c.prof === p.id && c.data === recDia; });
      var bs = E.bloqueios.filter(function (b) { return b.prof === p.id && b.data === recDia; });
      p.turnos.forEach(function (t) {
        var m = t[0];
        function livreAte(fim) { if (fim > m) raia.append(linhaLivre(p, m, fim)); }
        while (m < t[1]) {
          var c = cs.find(function (x) { return x.status !== 'cancelada' && x.ini <= m && m < x.ini + x.dur; });
          var b = bs.find(function (x) { return x.ini <= m && m < x.fim; });
          if (c) { raia.append(linhaConsulta(c)); total++; if (c.status === 'chegou') cheg++; m = c.ini + c.dur; continue; }
          if (b) { raia.append(linhaBloqueio(b)); bl++; m = b.fim; continue; }
          var prox = t[1];
          cs.concat(bs).forEach(function (x) { if ((x.status !== 'cancelada') && x.ini > m && x.ini < prox) prox = x.ini; });
          livreAte(prox); m = prox;
        }
      });
      cs.filter(function (c) { return c.status === 'cancelada'; }).forEach(function (c) {
        canc++;
        raia.append(h('div', { class: 'linha' }, h('p', {}, h('span', { class: 'hora', text: hhmm(c.ini) + ' ' }), c.paciente + ' '), h('span', { class: 'selo cancelada', text: 'Cancelada' })));
      });
      r.append(raia);
    });
    $('rec-resumo').textContent = dataLonga(recDia) + ': ' + total + (total === 1 ? ' consulta' : ' consultas') + ', ' + cheg + ' já na clínica, ' + canc + (canc === 1 ? ' cancelada' : ' canceladas') + ', ' + bl + (bl === 1 ? ' bloqueio' : ' bloqueios');
    var sp = $('b-prof'), atual = sp.value;
    limpar(sp);
    (doDia.length ? doDia : PROF).forEach(function (p) { sp.append(h('option', { value: p.id, text: p.nome })); });
    if (Array.prototype.some.call(sp.options, function (o) { return o.value === atual; })) sp.value = atual;
    horasBloqueio();
  }
  function horasBloqueio() {
    var p = prof($('b-prof').value), bi = $('b-ini'), bf = $('b-fim'), vi = bi.value, vf = bf.value, ini = [], fim = [];
    if (!p) return;
    p.turnos.forEach(function (t) { for (var m = t[0]; m < t[1]; m += PASSO) { ini.push(m); fim.push(m + PASSO); } });
    limpar(bi); limpar(bf);
    ini.forEach(function (m) { bi.append(h('option', { value: m, text: hhmm(m) })); });
    fim.forEach(function (m) { bf.append(h('option', { value: m, text: hhmm(m) })); });
    if (ini.indexOf(+vi) >= 0) bi.value = vi;
    if (fim.indexOf(+vf) >= 0) bf.value = vf;
  }
  function linhaLivre(p, de, ate) {
    return h('div', { class: 'linha livre' }, h('span', { text: hhmm(de) + ' a ' + hhmm(ate) + ', livre' }),
      h('button', { type: 'button', class: 'link-botao', text: 'Bloquear', 'aria-label': 'Bloquear ' + hhmm(de) + ' a ' + hhmm(ate) + ' de ' + p.nome, onclick: function () {
        $('b-prof').value = p.id; horasBloqueio(); $('b-ini').value = de; $('b-fim').value = ate; $('b-erro').textContent = ''; $('b-motivo').focus();
      } }));
  }
  function linhaConsulta(c) {
    var acoes = h('div', { class: 'acoes' });
    if (pendente === c.id) {
      acoes.append(h('button', { type: 'button', class: 'link-botao perigo', 'data-k': 'simcan-' + c.id, text: 'Sim, cancelar', onclick: function () { cancelar(c.id, 'rec'); } }),
        h('button', { type: 'button', class: 'link-botao', text: 'Manter', onclick: function () { pendente = null; desenharRecepcao(); } }));
    } else {
      acoes.append(h('button', { type: 'button', class: 'link-botao', 'data-k': 'che-' + c.id, text: c.status === 'chegou' ? 'Desfazer chegada' : 'Marcar chegada', onclick: function () {
        var salvo = lerSalvo();
        if (salvo) E = salvo; /* relê para não mexer em uma cópia antiga da consulta */
        var atual = E.consultas.find(function (x) { return x.id === c.id; });
        if (atual) { atual.status = atual.status === 'chegou' ? 'marcada' : 'chegou'; gravar(); }
        comFoco(desenharTudo);
      } }), h('button', { type: 'button', class: 'link-botao', 'data-k': 'rcan-' + c.id, text: 'Cancelar', onclick: function () {
        pendente = c.id; desenharRecepcao(); var n = document.querySelector('[data-k="simcan-' + c.id + '"]'); if (n) n.focus();
      } }));
    }
    return h('div', { class: 'linha', 'data-consulta': c.id },
      h('p', {}, h('span', { class: 'hora', text: hhmm(c.ini) + ' ' }), c.paciente, c.status === 'chegou' ? h('span', { class: 'selo chegou', text: ' Chegou' }) : null), acoes);
  }
  function linhaBloqueio(b) {
    return h('div', { class: 'linha bloq' },
      h('p', {}, h('span', { class: 'hora', text: hhmm(b.ini) + ' a ' + hhmm(b.fim) + ' ' }), 'Bloqueado: ' + b.motivo),
      h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'link-botao', text: 'Liberar', onclick: function () {
        var salvo = lerSalvo();
        if (salvo) E = salvo;
        E.bloqueios = E.bloqueios.filter(function (x) { return x.id !== b.id; }); gravar(); avisar('Bloqueio liberado.'); desenharTudo();
      } })));
  }
  function bloquear(ev) {
    ev.preventDefault();
    var salvo = lerSalvo();
    if (salvo) E = salvo;
    var pid = $('b-prof').value, ini = +$('b-ini').value, fim = +$('b-fim').value, erro = $('b-erro'), mot = $('b-motivo').value.trim();
    if (!prof(pid) || prof(pid).dias.indexOf(deIso(recDia).getDay()) < 0) { erro.textContent = 'Esse profissional não atende neste dia.'; return; }
    if (fim <= ini) { erro.textContent = 'O fim precisa ser depois do início.'; return; }
    if (!mot) { erro.textContent = 'Escreva o motivo do bloqueio.'; $('b-motivo').focus(); return; }
    var c = E.consultas.filter(function (x) { return x.prof === pid && x.data === recDia && x.status !== 'cancelada' && ini < x.ini + x.dur && x.ini < fim; });
    if (c.length) { erro.textContent = 'Há ' + c.length + (c.length === 1 ? ' consulta' : ' consultas') + ' nesse período (' + c.map(function (x) { return hhmm(x.ini); }).join(', ') + '). Cancele antes de bloquear.'; return; }
    if (E.bloqueios.some(function (x) { return x.prof === pid && x.data === recDia && ini < x.fim && x.ini < fim; })) { erro.textContent = 'Já existe um bloqueio nesse período.'; return; }
    E.bloqueios.push({ id: novoId(), prof: pid, data: recDia, ini: ini, fim: fim, motivo: mot });
    gravar();
    erro.textContent = ''; $('b-motivo').value = '';
    avisar('Horários bloqueados.');
    desenharTudo();
  }
  function desenharTudoMenosPassos() { desenharMinhas(); desenharRecepcao(); }
  function desenharTudo() { comFoco(function () { desenharPassos(); desenharResumo(); desenharMinhas(); desenharRecepcao(); }); }

  var eraRec = false;
  function vista() {
    var rec = location.hash === '#recepcao';
    $('vista-paciente').hidden = rec;
    $('recepcao').hidden = !rec;
    document.querySelectorAll('.topo nav a').forEach(function (a) {
      if (a.getAttribute('href') === '#recepcao' && rec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (rec) window.scrollTo(0, 0);
    /* o navegador não rola até uma seção que estava escondida quando o endereço mudou */
    else if (eraRec && location.hash.length > 1) {
      var alvo = document.getElementById(location.hash.slice(1));
      if (alvo) alvo.scrollIntoView();
    }
    eraRec = rec;
  }

  /* Outra aba mudou a agenda: redesenha e avisa se a escolha atual deixou de existir. */
  window.addEventListener('storage', function (e) {
    if (e.key !== CHAVE && e.key !== null) return;
    E = lerSalvo() || exemplo();
    if (sel.ini !== null && (!vagaLivre(sel.prof, sel.dia, sel.ini))) {
      sel.ini = null;
      $('erro').textContent = 'Esse horário acabou de ser ocupado. Escolha outro horário.';
    }
    desenharTudo();
  });
  window.addEventListener('hashchange', vista);
  $('form-confirmar').addEventListener('submit', confirmar);
  $('form-bloqueio').addEventListener('submit', bloquear);
  $('b-prof').addEventListener('change', horasBloqueio);
  $('rec-data').addEventListener('change', function () { if (this.value) { recDia = this.value; desenharRecepcao(); } });
  $('dia-ant').addEventListener('click', function () { recDia = somaDias(recDia, -1); desenharRecepcao(); });
  $('dia-prox').addEventListener('click', function () { recDia = somaDias(recDia, 1); desenharRecepcao(); });
  $('dia-hoje').addEventListener('click', function () { recDia = hoje(); desenharRecepcao(); });
  $('restaurar').addEventListener('click', function () {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento */ }
    E = exemplo(); gravar();
    sel = { esp: null, prof: null, dia: null, ini: null }; pendente = null; recDia = hoje();
    $('comprovante').hidden = true; $('form-confirmar').hidden = false; $('erro').textContent = ''; $('b-erro').textContent = '';
    desenharTudo();
    avisar('Dados de exemplo restaurados.');
  });
  desenharTudo();
  vista();
})();
