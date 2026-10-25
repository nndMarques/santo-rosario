import { ORACOES, MISTERIOS, POR_DIA, INTENCOES_INICIAIS, LINGUAS, PARTES } from './data/terco.js';
import { rosarioSVG, ordem, oracoesDa, ORD } from './rosario.js';

// ---------- Armazenamento local (nada sai do aparelho) ----------
const temaAtual = () => { try { return localStorage.getItem('terco.theme') || 'auto'; } catch (e) { return 'auto'; } };

const store = {
  get(k, d) {
    try { const v = localStorage.getItem('terco.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('terco.' + k, JSON.stringify(v)); } catch (e) {}
  },
  del(k) {
    try { localStorage.removeItem('terco.' + k); } catch (e) {}
  },
};

const $view = document.getElementById('view');
const $tabbar = document.querySelector('.tabbar');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vibrar = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

const ICON_ARROW = '<svg class="arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const ICON_FWD = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_TICK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// ---------- Utilidades de tela ----------
let delayIdx = 0;
const r = () => `class="rise" data-i="${delayIdx++}"`;
const rc = (extra) => `class="rise ${extra}" data-i="${delayIdx++}"`;

function render(html) {
  $view.innerHTML = typeof html === 'function' ? html() : html;
  $view.querySelectorAll('[data-i]').forEach((el) => el.style.setProperty('--i', el.dataset.i));
  window.scrollTo(0, 0);
}

// Trava a rolagem da página por trás de um painel aberto (só no celular).
let rolagemTravada = null;
function travarRolagem() {
  if (rolagemTravada !== null || window.matchMedia('(min-width: 900px)').matches) return;
  rolagemTravada = window.scrollY;
  Object.assign(document.body.style, { position: 'fixed', top: `-${rolagemTravada}px`, left: '0', right: '0' });
}
function liberarRolagem() {
  if (rolagemTravada === null) return;
  const y = rolagemTravada;
  rolagemTravada = null;
  Object.assign(document.body.style, { position: '', top: '', left: '', right: '' });
  window.scrollTo(0, y);
}

let toastTimer;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function diasDesde(iso) {
  if (!iso) return null;
  const a = new Date(iso); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

function hojeKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------- Estado ----------
// ---------- Terço ----------
// Línguas da oração: a principal e a secundária são escolhidas em Ajustes; no terço, alterna-se entre as duas.
function linguas() {
  const l1 = store.get('lingua1', 'pt');
  let l2 = store.get('lingua2', 'la');
  if (l2 === l1) l2 = l1 === 'la' ? 'pt' : 'la';
  return [l1, l2];
}
function lingua() {
  const [l1, l2] = linguas();
  const l = store.get('lingua', l1);
  return l === l1 || l === l2 ? l : l1;
}

function langToggle() {
  const l = lingua();
  return `<div class="lang-toggle" role="group" aria-label="Língua da oração">
    ${linguas().map((x) => `<button data-lang="${x}" aria-pressed="${l === x}">${LINGUAS[x].curto}</button>`).join('')}
  </div>`;
}
function ligarToggle(onChange) {
  $view.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    store.set('lingua', b.dataset.lang);
    $view.querySelectorAll('[data-lang]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    onChange();
  }));
}

// ---------- Constância no terço ----------
// Marcos de terços rezados. Cada um lembra algo da fé.
const MARCOS = [
  { n: 1, t: 'O primeiro terço' },
  { n: 7, t: 'Uma semana de terços' },
  { n: 20, t: 'Os vinte mistérios' },
  { n: 33, t: 'Os anos de Cristo' },
  { n: 54, t: 'Como a novena de 54 dias' },
  { n: 100, t: 'Cem terços' },
  { n: 150, t: 'O saltério de Maria' },
  { n: 365, t: 'Um ano de terço' },
];

const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Quantos terços foram rezados em cada dia: { 'aaaa-m-d': n }
function diario() {
  let d = store.get('tercoDiario', null);
  if (!d) {
    d = {};
    const hoje = rezadosHoje();
    if (hoje.length) d[hojeKey()] = hoje.length;
  }
  return d;
}

// O rosário completo (os quatro conjuntos de mistérios) vale quatro terços.
const ORDEM_ROSARIO = ['gozosos', 'luminosos', 'dolorosos', 'gloriosos'];
const valeTercos = (conjunto) => (conjunto === 'rosario' ? 4 : 1);

// Conta o terço (ou rosário) rezado e guarda quais mistérios foram rezados hoje.
function registrarTerco(conjunto) {
  const feitos = store.get('tercosRezados', 0) + valeTercos(conjunto);
  store.set('tercosRezados', feitos);
  const d = diario();
  d[hojeKey()] = (d[hojeKey()] || 0) + valeTercos(conjunto);
  store.set('tercoDiario', d);
  store.set('tercoHoje', { dia: hojeKey(), conjuntos: [...rezadosHoje(), conjunto] });
  store.set('ofensivaRecorde', ofensiva(d).recorde);
  return feitos;
}

// Desfaz uma marcação feita por engano hoje.
function desmarcarTerco(conjunto) {
  const h = rezadosHoje();
  const i = h.indexOf(conjunto);
  if (i < 0) return store.get('tercosRezados', 0);
  h.splice(i, 1);
  store.set('tercoHoje', { dia: hojeKey(), conjuntos: h });
  const feitos = Math.max(0, store.get('tercosRezados', 0) - valeTercos(conjunto));
  store.set('tercosRezados', feitos);
  const d = diario();
  d[hojeKey()] = (d[hojeKey()] || 0) - valeTercos(conjunto);
  if (d[hojeKey()] <= 0) delete d[hojeKey()];
  store.set('tercoDiario', d);
  return feitos;
}

function rezadosHoje() {
  const h = store.get('tercoHoje', null);
  return h && h.dia === hojeKey() ? h.conjuntos : [];
}

// ---------- Ofensiva: dias seguidos rezando ----------
const METAS_OFENSIVA = [3, 7, 14, 30, 60, 100, 200, 365];

const diaDaChave = (k) => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };

// seq: dias seguidos até hoje (se ainda não rezou hoje, vale a sequência até ontem);
// risco: há sequência, mas hoje ainda não foi rezado; recorde: a maior sequência já feita.
function ofensiva(d) {
  const hoje = new Date();
  const feitoHoje = !!d[chaveDia(hoje)];
  const dia = new Date(hoje);
  if (!feitoHoje) dia.setDate(dia.getDate() - 1);
  let seq = 0;
  while (d[chaveDia(dia)]) { seq++; dia.setDate(dia.getDate() - 1); }
  const dias = Object.keys(d).filter((k) => d[k] > 0).map(diaDaChave).sort((x, y) => x - y);
  let recorde = 0, corrida = 0;
  dias.forEach((n, i) => { corrida = i && n === dias[i - 1] + 1 ? corrida + 1 : 1; recorde = Math.max(recorde, corrida); });
  recorde = Math.max(recorde, store.get('ofensivaRecorde', 0), seq);
  return { seq, feitoHoje, risco: seq > 0 && !feitoHoje, recorde };
}

// O terço da ofensiva: uma dezena de contas pequenas e uma grande. Cada dia seguido acende uma conta;
// ao completar dez, acende a conta grande e a cruz brilha.
function ofensivaSVG(of, animar = true) {
  const { seq, feitoHoje, risco } = of;
  const completa = seq > 0 && seq % 10 === 0;
  const acesas = completa ? 10 : seq % 10;
  const X = (i) => 58 + i * 23;
  let contas = '';
  for (let i = 0; i < 10; i++) {
    const acesa = i < acesas;
    const hoje = acesa && feitoHoje && i === acesas - 1;
    const emRisco = risco && !completa && i === acesas;
    contas += `<circle class="b${acesa ? ' lit' : ''}${hoje ? ' pop' : ''}${emRisco ? ' risco' : ''}" style="--k:${i}" cx="${X(i)}" cy="32" r="6"/>`;
  }
  const grande = `<circle class="b grande${completa ? ' lit' : ''}${completa && feitoHoje ? ' pop' : ''}" style="--k:10" cx="296" cy="32" r="10.5"/>`;
  return `<svg class="of-svg${animar ? ' anima' : ''}" viewBox="0 0 320 64" role="img" aria-label="Terço da ofensiva: ${acesas} de 10 contas acesas${completa ? ', dezena completa' : ''}">
    <path class="fio" d="M26 32H306"/>
    <g class="cruz${completa ? ' brilha' : ''}"><path d="M14 12v40M5 24h18"/></g>
    ${contas}${grande}
  </svg>`;
}

function ofensivaHTML(of) {
  const meta = METAS_OFENSIVA.find((m) => m > of.seq);
  const dezena = Math.floor(Math.max(of.seq - 1, 0) / 10) + 1;
  let estado;
  if (of.seq === 0) estado = of.recorde > 0 ? `Comece uma nova ofensiva hoje. Seu recorde é de ${of.recorde} ${of.recorde === 1 ? 'dia' : 'dias'}.` : 'Reze o terço hoje para acender a primeira conta.';
  else if (of.risco) estado = 'Reze hoje para manter a sua ofensiva.';
  else estado = 'Ofensiva mantida hoje. Que Nossa Senhora te acompanhe.';
  return `
    <div class="ofensiva${of.risco ? ' em-risco' : ''}">
      <div class="of-top">
        <span class="of-n" data-seq>${of.seq}</span>
        <span class="of-l">${of.seq === 1 ? 'dia seguido' : 'dias seguidos'}<small>ofensiva do terço</small></span>
        ${of.recorde > 0 ? `<span class="of-rec">recorde<b>${of.recorde}</b></span>` : ''}
      </div>
      ${ofensivaSVG(of)}
      <p class="of-estado">${estado}</p>
      ${meta ? `<p class="muted small">${of.seq > 0 ? `${dezena}ª dezena · ` : ''}próxima meta: ${meta} dias${of.seq > 0 ? ` (faltam ${meta - of.seq})` : ''}</p>` : ''}
    </div>`;
}

function constanciaHTML() {
  const total = store.get('tercosRezados', 0);
  const d = diario();
  const of = ofensiva(d);
  const prox = MARCOS.find((m) => m.n > total);
  const ant = [...MARCOS].reverse().find((m) => m.n <= total);
  const semana = [];
  for (let k = 6; k >= 0; k--) {
    const dia = new Date();
    dia.setDate(dia.getDate() - k);
    semana.push({ w: dia.getDay(), feito: !!d[chaveDia(dia)], hoje: k === 0 });
  }
  const base = ant ? ant.n : 0;
  const pct = prox ? Math.round(((total - base) / (prox.n - base)) * 100) : 100;
  return `
    ${ofensivaHTML(of)}
    <ol class="semana" aria-label="Últimos sete dias">
      ${semana.map((s) => `<li class="${s.feito ? 'feito' : ''}${s.hoje ? ' hoje' : ''}"><i></i><span>${'DSTQQSS'[s.w]}</span></li>`).join('')}
    </ol>
    ${prox ? `
      <div class="proximo">
        <p class="eyebrow">Próximo marco · ${prox.n} ${prox.n === 1 ? 'terço' : 'terços'}</p>
        <p class="pm-t">${prox.t}</p>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <p class="muted small" style="margin-top:8px">${prox.n - total === 1 ? 'Falta 1 terço.' : `Faltam ${prox.n - total} terços.`}</p>
      </div>` : `<p class="pm-t" style="margin-top:20px">Todos os marcos alcançados. Que Nossa Senhora te guarde.</p>`}
    <div class="c-top c-total-linha">
      <div class="c-total"><span class="big" data-total>${total}</span><span class="lbl">${total === 1 ? 'terço rezado' : 'terços rezados'}</span></div>
    </div>
    <ul class="marcos" aria-label="Marcos">
      ${MARCOS.map((m) => `<li class="${total >= m.n ? 'ganho' : ''}" data-marco="${m.n}" title="${m.t}"><span>${m.n}</span></li>`).join('')}
    </ul>`;
}

function telaTerco() {
  delayIdx = 0;
  const hoje = POR_DIA[new Date().getDay()];
  const prog = store.get('tercoProgresso', null);
  const continuar = prog && prog.dia === hojeKey() && prog.i > 0;
  const ordem = [...ORDEM_ROSARIO, 'rosario'];
  const ROSARIO = { pt: 'Rosário completo', la: 'Rosarium integrum', dias: 'os 20 mistérios, conta como 4 terços' };

  render(`
    <p ${r()}><span class="eyebrow">Santo Terço</span></p>
    <h1 ${r()}>Rezar o <em>terço</em></h1>
    <p ${rc('lead')}>Mistério por mistério, no seu ritmo.</p>
    ${avisosHTML() ? `<div ${rc('avisos')} style="margin-top:20px">${avisosHTML()}</div>` : ''}
    ${store.get('tercosRezados', 0) === 0 ? `<div ${rc('avisos')} style="margin-top:20px"><a class="aviso" href="#/terco/aprender"><span><b>Primeira vez?</b>Aprenda como se reza o terço, conta por conta, com todas as orações.</span>${ICON_ARROW}</a></div>` : ''}
    ${continuar ? `<div ${r()} style="margin-top:22px"><a class="btn solid block" href="#/terco/rezar/${prog.conjunto}">Continuar de onde parei</a></div>` : ''}
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Sua constância</span></p>
    <section ${rc('constancia')} aria-live="polite">${constanciaHTML()}</section>
    <hr ${rc('rule')}>
    <ul ${rc('rows')}>
      ${ordem.map((c) => {
        const M = MISTERIOS[c] || ROSARIO;
        return `<li class="misterio-op${c === 'rosario' ? ' rosario-op' : ''}" data-c="${c}">
          <button class="row" data-abrir aria-expanded="false">
            <span class="body"><span class="title">${M.pt}${c === hoje ? ' <em style="color:var(--accent);font-size:16px">· hoje</em>' : ''}</span><span class="sub">${M.la} · ${M.dias}</span></span>
            <span class="feito" aria-label="Rezado hoje">${ICON_TICK}</span>
            ${ICON_ARROW}
          </button>
          <div class="opcoes"><div class="opcoes-in">
            <a class="btn solid block" href="#/terco/rezar/${c}">${c === 'rosario' ? 'Rezar o rosário guiado' : 'Rezar o terço guiado'}</a>
            <button class="btn block" data-marcar>Já rezei · marcar como rezado</button>
            <button class="btn ghost block" data-desmarcar>Desmarcar</button>
          </div></div>
        </li>`;
      }).join('')}
    </ul>
    <ul ${rc('rows')} style="margin-top:28px">
      <li><a class="row" href="#/terco/aprender"><span class="body"><span class="title">Aprender a rezar o terço</span><span class="sub">Como funciona e todas as orações, lado a lado</span></span>${ICON_ARROW}</a></li>
    </ul>
  `);
  const $const = $view.querySelector('.constancia');

  const marcarFeitos = () => {
    const feitos = rezadosHoje();
    $view.querySelectorAll('.misterio-op').forEach((li) => li.classList.toggle('rezado', feitos.includes(li.dataset.c)));
  };
  marcarFeitos();

  // Redesenha a constância, contando o número até o novo total.
  function atualizarConstancia(de, novoMarco, deSeq) {
    $const.innerHTML = constanciaHTML();
    const contar = ($n, ini) => {
      if (!$n) return;
      const ate = +$n.textContent;
      const t0 = performance.now();
      const passo = (t) => {
        const p = Math.min(1, (t - t0) / 600);
        $n.textContent = Math.round(ini + (ate - ini) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    contar($const.querySelector('[data-total]'), de);
    contar($const.querySelector('[data-seq]'), deSeq === undefined ? +$const.querySelector('[data-seq]').textContent : deSeq);
    $const.classList.remove('pulso'); void $const.offsetWidth; $const.classList.add('pulso');
    if (novoMarco) {
      const m = $const.querySelector(`[data-marco="${novoMarco.n}"]`);
      if (m) m.classList.add('novo');
    }
  }

  const fecharOpcoes = (li) => { li.classList.remove('aberto'); li.querySelector('[data-abrir]').setAttribute('aria-expanded', 'false'); };

  $view.querySelectorAll('.misterio-op').forEach((li) => {
    const botao = li.querySelector('[data-abrir]');
    botao.addEventListener('click', () => {
      const abrir = !li.classList.contains('aberto');
      $view.querySelectorAll('.misterio-op.aberto').forEach(fecharOpcoes);
      li.classList.toggle('aberto', abrir);
      botao.setAttribute('aria-expanded', abrir);
      vibrar(6);
    });
    li.querySelector('[data-marcar]').addEventListener('click', () => {
      const antes = store.get('tercosRezados', 0);
      const seqAntes = ofensiva(diario()).seq;
      const feitos = registrarTerco(li.dataset.c);
      const seqDepois = ofensiva(diario()).seq;
      const marco = [...MARCOS].reverse().find((m) => m.n > antes && m.n <= feitos);
      const meta = seqDepois > seqAntes && METAS_OFENSIVA.includes(seqDepois);
      vibrar([20, 60, 20]);
      marcarFeitos();
      atualizarConstancia(antes, marco, seqAntes);
      toast(meta ? `Ofensiva de ${seqDepois} dias` : marco ? `Novo marco: ${marco.t}` : seqDepois > seqAntes ? `Ofensiva: ${seqDepois} ${seqDepois === 1 ? 'dia' : 'dias'}` : li.dataset.c === 'rosario' ? `Rosário rezado · ${feitos} terços` : `${feitos} terços rezados`);
      setTimeout(() => fecharOpcoes(li), 700);
    });
    li.querySelector('[data-desmarcar]').addEventListener('click', () => {
      const antes = store.get('tercosRezados', 0);
      const seqAntes = ofensiva(diario()).seq;
      desmarcarTerco(li.dataset.c);
      vibrar(10);
      marcarFeitos();
      atualizarConstancia(antes, undefined, seqAntes);
      toast('Marcação desfeita');
      setTimeout(() => fecharOpcoes(li), 500);
    });
  });
}

function textoOracao(k, l) {
  const o = ORACOES[k][l];
  let x = esc(o.x);
  if (o.r) x += `<br><span class="resp">℣.</span> ${o.r[0]}<br><span class="resp">℟.</span> ${o.r[1]}`;
  return x;
}

function telaAprender() {
  delayIdx = 0;
  let conjunto = POR_DIA[new Date().getDay()];
  const sequencia = ordem();
  let atual = null;

  render(`
    <a class="back rise" style="--i:0" href="#/terco">${ICON_BACK} Terço</a>
    ${(delayIdx = 1, '')}
    <p ${r()}><span class="eyebrow">As orações · conta por conta</span></p>
    <p ${rc('lead')}>Toque numa conta para ver a oração. Comece pela cruz, embaixo, e suba.</p>
    <div ${r()} style="margin-top:18px">
      <div class="choices" role="group" aria-label="Mistérios">
        ${['gozosos', 'luminosos', 'dolorosos', 'gloriosos'].map((c) => `<button class="choice" data-conj="${c}" aria-pressed="${c === conjunto}">${MISTERIOS[c].pt.replace('Mistérios ', '')}</button>`).join('')}
      </div>
    </div>
    <div class="rosario-wrap">
      <div ${r()}>${rosarioSVG()}</div>
      <div class="cp-fundo" aria-hidden="true"></div>
      <aside class="conta-painel" aria-live="polite">
        <div class="cp-top"><span class="eyebrow cp-onde">Toque numa conta</span><button class="cp-x" aria-label="Fechar">×</button></div>
        <div class="cp-corpo"><p class="muted">Cada conta do desenho mostra o que se reza nela, nas suas duas línguas de oração.</p></div>
        <div class="cp-nav"><button class="btn ghost" data-passo="-1">Anterior</button><button class="btn solid" data-passo="1">Próxima</button></div>
      </aside>
    </div>
    <hr ${rc('rule')}>
    <p ${r()}><span class="eyebrow">Para quem está começando</span></p>
    <h2 ${r()}>Como se reza o <em>terço</em></h2>
    <p ${rc('muted small')} style="margin-top:14px">Os mistérios mudam conforme o dia: gozosos na segunda e no sábado, dolorosos na terça e na sexta, gloriosos na quarta e no domingo, luminosos na quinta.</p>
    <ol ${rc('steps')} style="margin-top:18px">
      <li><span class="n">1</span><span class="t">Na cruz</span><span class="d">Faça o sinal da cruz e reze o Creio.</span></li>
      <li><span class="n">2</span><span class="t">Nas primeiras contas</span><span class="d">Um Pai-nosso, três Ave-Marias (pela fé, pela esperança e pela caridade) e um Glória.</span></li>
      <li><span class="n">3</span><span class="t">Cinco dezenas</span><span class="d">Em cada uma: anuncie o mistério e medite nele, reze um Pai-nosso, dez Ave-Marias, um Glória e o “Ó meu Jesus”.</span></li>
      <li><span class="n">4</span><span class="t">No fim</span><span class="d">Reze a Salve-Rainha e faça o sinal da cruz.</span></li>
    </ol>

    <div ${r()} style="margin-top:28px"><a class="btn solid block" href="#/terco/rezar/${POR_DIA[new Date().getDay()]}">Rezar o terço de hoje</a></div>
  `);

  const $painel = $view.querySelector('.conta-painel');
  const $svg = $view.querySelector('.rosario');
  const $fundo = $view.querySelector('.cp-fundo');

  function mostrar(id) {
    atual = id;
    const info = oracoesDa(id, conjunto);
    const M = MISTERIOS[conjunto];
    const [l1, l2] = linguas();
    $svg.querySelectorAll('.conta').forEach((g) => g.classList.toggle('sel', g.dataset.conta === id));
    $painel.querySelector('.cp-onde').textContent = info.onde;
    $painel.querySelector('.cp-corpo').innerHTML = info.itens.map((it) => {
      if (it.misterio !== undefined) return `
        <div class="cp-mist">
          <p class="eyebrow">${ORD[it.misterio]} mistério ${M.pt.replace('Mistérios ', '').toLowerCase().replace(/s$/, '')}</p>
          <h3>${it[l1]}</h3>
          <p class="la">${it[l2]} · ${it.ref}</p>
        </div>`;
      const o = ORACOES[it.o];
      return `<div class="cp-or">
        <h3>${o[l1].t} <span class="muted">· ${o[l2].t}</span></h3>
        ${it.intencao !== undefined ? `<p class="cp-int">${INTENCOES_INICIAIS[l1][it.intencao]}</p>` : ''}
        <p class="pt">${textoOracao(it.o, l1)}</p>
        <p class="la">${textoOracao(it.o, l2)}</p>
      </div>`;
    }).join('') + (info.medita ? `<p class="cp-int">Meditando: ${info.medita[l1]}</p>` : '');
    $painel.querySelector('.cp-corpo').scrollTop = 0;
    const i = sequencia.indexOf(id);
    $painel.querySelector('[data-passo="-1"]').disabled = i === 0;
    $painel.querySelector('[data-passo="1"]').disabled = i === sequencia.length - 1;
    $painel.classList.add('open', 'tem');
    $fundo.classList.add('open');
    travarRolagem();
    $painel.classList.remove('swap'); void $painel.offsetWidth; $painel.classList.add('swap');
    vibrar(6);
  }

  $svg.addEventListener('click', (e) => { const g = e.target.closest('[data-conta]'); if (g) mostrar(g.dataset.conta); });
  $svg.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('[data-conta]');
    if (g) { e.preventDefault(); mostrar(g.dataset.conta); }
  });
  function fechar() {
    $painel.classList.remove('open');
    $fundo.classList.remove('open');
    liberarRolagem();
    $svg.querySelectorAll('.conta.sel').forEach((g) => g.classList.remove('sel'));
  }
  $painel.querySelector('.cp-x').addEventListener('click', fechar);
  $fundo.addEventListener('click', fechar);
  $painel.querySelectorAll('[data-passo]').forEach((b) => b.addEventListener('click', () => {
    const i = Math.max(0, sequencia.indexOf(atual));
    mostrar(sequencia[Math.min(sequencia.length - 1, Math.max(0, i + +b.dataset.passo))]);
  }));
  $view.querySelectorAll('[data-conj]').forEach((b) => b.addEventListener('click', () => {
    conjunto = b.dataset.conj;
    $view.querySelectorAll('[data-conj]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (atual) mostrar(atual);
  }));
}

// Rezar: uma etapa por vez (início, os mistérios, conclusão), sem precisar tocar a cada Ave-Maria.
// O rosário completo reza os quatro conjuntos em seguida: vinte mistérios.
function etapasDoTerco(conjunto) {
  const conjs = conjunto === 'rosario' ? ORDEM_ROSARIO : [conjunto];
  const e = [{ grupo: 'inicio', conj: conjs[0], itens: [{ o: 'sinal' }, { o: 'credo' }, { o: 'pai' }, { o: 'ave', vezes: 3 }, { o: 'gloria' }] }];
  conjs.forEach((c) => {
    for (let k = 0; k < 5; k++) e.push({ grupo: k, conj: c, itens: [{ misterio: k }, { o: 'pai' }, { o: 'ave', vezes: 10 }, { o: 'gloria' }, { o: 'fatima' }] });
  });
  e.push({ grupo: 'fim', conj: conjs[conjs.length - 1], itens: [{ o: 'salve' }, { o: 'sinal' }] });
  return e;
}

function telaRezar(conjunto) {
  delayIdx = 0;
  if (!MISTERIOS[conjunto] && conjunto !== 'rosario') conjunto = POR_DIA[new Date().getDay()];
  const rosario = conjunto === 'rosario';
  const etapas = etapasDoTerco(conjunto);
  const prog = store.get('tercoProgresso', null);
  let i = prog && prog.dia === hojeKey() && prog.conjunto === conjunto ? Math.min(prog.i, etapas.length - 1) : 0;
  const contagem = {};

  render(`
    <div class="rezar">
      <div class="pray-top rise" style="--i:0">
        <a class="back" href="#/terco" style="margin:0">${ICON_BACK} Sair</a>
        ${langToggle()}
      </div>
      <div class="etapas rise${rosario ? ' muitas' : ''}" style="--i:1;grid-template-columns:repeat(${etapas.length}, 1fr)" role="tablist">
        ${etapas.map((e, k) => `<button class="seg" data-etapa="${k}" aria-label="${nomeEtapa(e, 'pt')}"><i></i></button>`).join('')}
      </div>
      <div class="etapa" aria-live="polite"></div>
    </div>
    <div class="pray-nav fixa"><div class="inner">
      <button class="btn ghost" id="voltar">Voltar</button>
      <button class="btn solid" id="avancar">Avançar</button>
    </div></div>
  `);

  const $etapa = $view.querySelector('.etapa');

  function nomeEtapa(e, l) {
    if (e.grupo === 'inicio') return PARTES.inicio[l];
    if (e.grupo === 'fim') return PARTES.fim[l];
    if (l === 'pt' && rosario) return `${ORD[e.grupo]} ${MISTERIOS[e.conj].pt.replace('Mistérios ', '').toLowerCase().replace(/s$/, '')}`;
    return PARTES.misterio[l](e.grupo);
  }

  function desenhar(animar) {
    const l = lingua();
    const [l1] = linguas();
    const e = etapas[i];
    const M = MISTERIOS[e.conj];
    const sub = rosario && typeof e.grupo !== 'number' ? PARTES.rosario[l] : M[l];
    $etapa.innerHTML = `
      <p class="where">${nomeEtapa(e, l)} <span class="muted">· ${sub}</span></p>
      ${e.itens.map((it, j) => {
        if (it.misterio !== undefined) {
          const m = M.itens[it.misterio];
          return `<div class="et-mist">
            <h2>${m[l]}</h2>
            <p class="muted">${l !== l1 ? m[l1] + ' · ' : ''}${m.ref}</p>
          </div>`;
        }
        const o = ORACOES[it.o][l];
        const n = contagem[`${i}:${j}`] || 0;
        return `<div class="et-or">
          <h3>${o.t}${it.vezes ? ` <span class="vezes">× ${it.vezes}</span>` : ''}</h3>
          ${it.vezes === 3 ? `<p class="cp-int">${INTENCOES_INICIAIS[l].join(' · ')}</p>` : ''}
          <p class="ptext">${textoOracao(it.o, l)}</p>
          ${l !== l1 ? `<p class="alt">${esc(ORACOES[it.o][l1].x)}</p>` : ''}
          ${it.vezes ? `<div class="contador" data-cont="${i}:${j}">
            <div class="beads">${Array.from({ length: it.vezes }, (_, b) => `<button class="bead${b < n ? ' done' : ''}" data-b="${b}" aria-label="Ave-Maria ${b + 1}"></button>`).join('')}</div>
            <span class="cnt">${n ? `${n} de ${it.vezes}` : 'Toque nas contas para contar, se quiser'}</span>
          </div>` : ''}
        </div>`;
      }).join('')}
    `;
    if (animar) { $etapa.classList.remove('swap'); void $etapa.offsetWidth; $etapa.classList.add('swap'); }
    $view.querySelectorAll('.seg').forEach((s, k) => { s.classList.toggle('done', k < i); s.classList.toggle('now', k === i); });
    $view.querySelector('#voltar').disabled = i === 0;
    $view.querySelector('#avancar').textContent = i === etapas.length - 1 ? (rosario ? 'Terminei o rosário' : 'Terminei o terço') : `${nomeEtapa(etapas[i + 1], 'pt')} →`;
    store.set('tercoProgresso', { dia: hojeKey(), conjunto, i });
  }

  function ir(k) {
    if (k < 0 || k >= etapas.length) return;
    i = k;
    vibrar(etapas[i].grupo === 'fim' || typeof etapas[i].grupo === 'number' ? 20 : 8);
    desenhar(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function avancar() { if (i >= etapas.length - 1) concluir(); else ir(i + 1); }

  function concluir() {
    store.del('tercoProgresso');
    const seqAntes = ofensiva(diario()).seq;
    const feitos = registrarTerco(conjunto);
    const of = ofensiva(diario());
    const subiu = of.seq > seqAntes;
    const meta = subiu && METAS_OFENSIVA.includes(of.seq);
    vibrar(meta ? [30, 60, 30, 60, 60] : [20, 60, 20]);
    document.removeEventListener('keydown', teclas);
    $view.innerHTML = `
      <div class="absolvo">
        <svg class="cross" viewBox="0 0 54 80"><path d="M27 2v76M6 24h42"/></svg>
        <h2 class="rise" style="--i:3;margin-top:22px">${rosario ? 'Rosário' : 'Terço'} <em>rezado</em>.</h2>
        <p class="lead rise" style="--i:4">${feitos === 1 ? 'O primeiro terço rezado. Parabéns!' : `${feitos} terços rezados.`}</p>
        <div class="of-final rise" style="--i:6">
          ${ofensivaSVG(of)}
          <p class="of-final-t">${subiu ? (of.seq === 1 ? 'Primeira conta acesa. Sua ofensiva começou.' : `Ofensiva de ${of.seq} dias${meta ? ' · nova meta!' : ''}`) : `Ofensiva de ${of.seq} ${of.seq === 1 ? 'dia' : 'dias'} mantida.`}</p>
        </div>
        <div class="rise" style="--i:7;margin-top:26px"><a class="btn solid block" href="#/">Voltar ao início</a></div>
      </div>`;
    window.scrollTo(0, 0);
  }

  function teclas(e) {
    if (!location.hash.startsWith('#/terco/rezar')) return document.removeEventListener('keydown', teclas);
    if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1); }
  }

  $etapa.addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]');
    if (!b) return;
    const box = b.closest('[data-cont]');
    const total = box.querySelectorAll('[data-b]').length;
    const atual = contagem[box.dataset.cont] || 0;
    const n = +b.dataset.b + 1 === atual ? atual - 1 : +b.dataset.b + 1;
    contagem[box.dataset.cont] = n;
    box.querySelectorAll('[data-b]').forEach((x, k) => x.classList.toggle('done', k < n));
    box.querySelector('.cnt').textContent = n ? `${n} de ${total}` : 'Toque nas contas para contar, se quiser';
    vibrar(n === total ? [10, 40, 10] : 6);
  });
  $view.querySelectorAll('[data-etapa]').forEach((s) => s.addEventListener('click', () => ir(+s.dataset.etapa)));
  $view.querySelector('#avancar').addEventListener('click', avancar);
  $view.querySelector('#voltar').addEventListener('click', () => ir(i - 1));
  document.addEventListener('keydown', teclas);

  ligarToggle(() => desenhar(true));
  desenhar(false);
}

// ---------- Lembretes ----------
const p2 = (n) => String(n).padStart(2, '0');
const icsData = (d) => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
const icsTexto = (t) => String(t).replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => '\\' + c).replace(/\n/g, '\\n');

function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Evento de calendário com alarme: toca no celular mesmo com o app fechado.
function baixarEvento({ nome, titulo, descricao, inicio, repete }) {
  const fim = new Date(inicio.getTime() + 15 * 60000);
  const agora = new Date();
  const utc = `${agora.getUTCFullYear()}${p2(agora.getUTCMonth() + 1)}${p2(agora.getUTCDate())}T${p2(agora.getUTCHours())}${p2(agora.getUTCMinutes())}00Z`;
  const linhas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Terco//PT', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${nome}-${inicio.getTime()}@terco`, `DTSTAMP:${utc}`,
    `DTSTART:${icsData(inicio)}`, `DTEND:${icsData(fim)}`,
    ...(repete ? ['RRULE:FREQ=DAILY'] : []),
    `SUMMARY:${icsTexto(titulo)}`, `DESCRIPTION:${icsTexto(descricao)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsTexto(titulo)}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  baixarArquivo(new Blob([linhas.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), `${nome}.ics`);
}

const minutosDe = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

// Aviso no topo do terço: depois da hora marcada, se ainda não rezou hoje.
function avisosHTML() {
  const h = store.get('lembreHora', null);
  const agora = new Date();
  if (h && agora.getHours() * 60 + agora.getMinutes() >= minutosDe(h) && !rezadosHoje().length) {
    return `<a class="aviso" href="#/terco/rezar/${POR_DIA[agora.getDay()]}"><span><b>Hora do terço</b>Você marcou o lembrete para ${h} e ainda não rezou hoje.</span>${ICON_ARROW}</a>`;
  }
  return '';
}

// Notificação do navegador, enquanto o app estiver aberto ou em segundo plano.
let avisoTimer;
function agendarAvisos() {
  clearTimeout(avisoTimer);
  const h = store.get('lembreHora', null);
  if (!h || typeof Notification === 'undefined' || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
  const alvo = new Date();
  alvo.setHours(...h.split(':').map(Number), 0, 0);
  const espera = alvo - Date.now();
  if (espera <= 0 || espera > 20 * 3600000) return;
  avisoTimer = setTimeout(() => {
    if (rezadosHoje().length) return;
    navigator.serviceWorker.ready.then((reg) => reg.showNotification('Hora do terço', {
      body: 'Um momento de oração.', icon: 'icons/icon-192.png', tag: 'terco-lembrete',
    })).catch(() => {});
  }, espera);
}

// ---------- Mais ----------
function aplicarTema(t) {
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0d0c0a';
  document.getElementById('meta-theme').setAttribute('content', bg);
}

function telaMais() {
  delayIdx = 0;
  const tema = temaAtual();
  const tercos = store.get('tercosRezados', 0);
  render(`
    <p ${r()}><span class="eyebrow">Ajustes</span></p>
    <h1 ${r()}>Santo <em>Rosário</em></h1>
    <p ${rc('lead')}>Aprenda a rezar o terço e reze todos os dias.</p>
    <hr ${rc('rule')}>
    <div ${rc('setting')}>
      <span class="lbl">Aparência</span>
      <div class="choices">
        <button class="choice" data-tema="auto" aria-pressed="${tema === 'auto'}">Automático</button>
        <button class="choice" data-tema="dark" aria-pressed="${tema === 'dark'}">Escuro</button>
        <button class="choice" data-tema="light" aria-pressed="${tema === 'light'}">Claro</button>
      </div>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Línguas da oração</span>
      <p class="muted small">A principal aparece primeiro. Dentro do terço, você alterna entre as duas.</p>
      <p class="eyebrow" style="margin-top:14px">Principal</p>
      <div class="choices">${Object.entries(LINGUAS).map(([k, v]) => `<button class="choice" data-l1="${k}">${v.nome}</button>`).join('')}</div>
      <p class="eyebrow" style="margin-top:16px">Secundária</p>
      <div class="choices">${Object.entries(LINGUAS).map(([k, v]) => `<button class="choice" data-l2="${k}">${v.nome}</button>`).join('')}</div>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Lembrete do terço</span>
      <p class="muted small" id="lembre-estado"></p>
      <div class="lembre-linha">
        <input type="time" id="lembre-hora" class="campo" aria-label="Hora do lembrete">
        <button class="btn solid" id="lembre-salvar">Salvar</button>
        <button class="btn ghost" id="lembre-off" hidden>Desativar</button>
      </div>
      <button class="btn block" id="lembre-cal" hidden style="margin-top:10px">Adicionar ao calendário do celular</button>
      <button class="btn ghost block" id="lembre-notif" hidden style="margin-top:10px">Ativar avisos do navegador</button>
      <p class="muted small" style="margin-top:10px">O aviso do calendário toca mesmo com o app fechado. Já o do navegador só funciona com o app aberto ou em segundo plano. Na aba Hoje, o app também avisa depois da hora marcada.</p>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Seus números</span>
      <p class="muted">${tercos} ${tercos === 1 ? 'terço rezado' : 'terços rezados'} neste aparelho.</p>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Privacidade</span>
      <p class="muted">Este app não tem conta, servidor nem rastreamento. Tudo o que você marca fica guardado só neste aparelho e pode ser apagado a qualquer momento.</p>
      <button class="btn ghost" id="apagar" style="margin-top:6px">Apagar todos os meus dados</button>
    </div>
    <div ${rc('setting')}>
      <span class="lbl">Instalar no celular</span>
      <p class="muted">No iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android: menu do navegador e “Instalar app”.</p>
    </div>
    <p ${rc('muted small')} style="margin-top:24px">As orações são as tradicionais da Igreja, em português, latim, inglês e italiano. Este app ajuda a aprender e a rezar, mas não substitui a vida de oração em comunidade.</p>
  `);

  $view.querySelectorAll('[data-tema]').forEach((b) => b.addEventListener('click', () => {
    try { localStorage.setItem('terco.theme', b.dataset.tema); } catch (e) {}
    aplicarTema(b.dataset.tema);
    $view.querySelectorAll('[data-tema]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  }));
  const marcarLinguas = () => {
    const [l1, l2] = linguas();
    $view.querySelectorAll('[data-l1]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.l1 === l1));
    $view.querySelectorAll('[data-l2]').forEach((b) => { b.setAttribute('aria-pressed', b.dataset.l2 === l2); b.disabled = b.dataset.l2 === l1; });
  };
  marcarLinguas();
  $view.querySelectorAll('[data-l1]').forEach((b) => b.addEventListener('click', () => {
    const [l1, l2] = linguas();
    const novo = b.dataset.l1;
    if (novo === l2) store.set('lingua2', l1); // trocar de lugar
    store.set('lingua1', novo);
    store.set('lingua', novo);
    marcarLinguas();
    toast(`Oração em ${LINGUAS[novo].nome.toLowerCase()} e ${LINGUAS[linguas()[1]].nome.toLowerCase()}`);
  }));
  $view.querySelectorAll('[data-l2]').forEach((b) => b.addEventListener('click', () => {
    store.set('lingua2', b.dataset.l2);
    marcarLinguas();
    const [l1, l2] = linguas();
    toast(`Oração em ${LINGUAS[l1].nome.toLowerCase()} e ${LINGUAS[l2].nome.toLowerCase()}`);
  }));

  // lembrete do terço
  const $hora = $view.querySelector('#lembre-hora');
  const $notif = $view.querySelector('#lembre-notif');
  const mostrarLembrete = () => {
    const h = store.get('lembreHora', null);
    $hora.value = h || '19:00';
    $view.querySelector('#lembre-estado').textContent = h ? `Lembrete diário às ${h}.` : 'Nenhum lembrete configurado.';
    $view.querySelector('#lembre-off').hidden = !h;
    $view.querySelector('#lembre-cal').hidden = !h;
    $notif.hidden = !(h && typeof Notification !== 'undefined' && Notification.permission === 'default');
  };
  mostrarLembrete();
  $view.querySelector('#lembre-salvar').addEventListener('click', () => {
    if (!$hora.value) return toast('Escolha uma hora');
    store.set('lembreHora', $hora.value);
    mostrarLembrete(); agendarAvisos();
    toast(`Lembrete salvo para ${$hora.value}`);
  });
  $view.querySelector('#lembre-off').addEventListener('click', () => {
    store.del('lembreHora'); clearTimeout(avisoTimer);
    mostrarLembrete(); toast('Lembrete desativado');
  });
  $view.querySelector('#lembre-cal').addEventListener('click', () => {
    const h = store.get('lembreHora', null);
    if (!h) return;
    const [hh, mm] = h.split(':').map(Number);
    const ini = new Date(); ini.setHours(hh, mm, 0, 0);
    baixarEvento({ nome: 'terco-lembrete', titulo: 'Hora do terço', descricao: 'Um momento de oração. Abra o app para rezar o terço de hoje.', inicio: ini, repete: true });
    toast('Abra o arquivo para adicionar ao calendário');
  });
  $notif.addEventListener('click', async () => {
    const r = await Notification.requestPermission();
    mostrarLembrete(); agendarAvisos();
    toast(r === 'granted' ? 'Avisos do navegador ativados' : 'Sem permissão para avisar');
  });

  $view.querySelector('#apagar').addEventListener('click', () => {
    if (!confirm('Apagar o total de terços, a ofensiva, os lembretes e as línguas escolhidas deste aparelho?')) return;
    ['tercoProgresso', 'tercosRezados', 'tercoHoje', 'tercoDiario', 'ofensivaRecorde', 'lembreHora', 'lingua1', 'lingua2', 'lingua'].forEach(store.del);
    toast('Dados apagados');
    telaMais();
  });
}

// ---------- Rotas ----------
function moverIndicador() {
  const a = $tabbar.querySelector('a.active');
  if (!a) return;
  if (window.matchMedia('(min-width: 900px)').matches) {
    $tabbar.style.setProperty('--ind-y', a.offsetTop + 'px');
    $tabbar.style.setProperty('--ind-h', a.offsetHeight + 'px');
  } else {
    $tabbar.style.setProperty('--ind-x', a.offsetLeft + a.offsetWidth * 0.3 + 'px');
    $tabbar.style.setProperty('--ind-w', a.offsetWidth * 0.4 + 'px');
  }
}

function rota() {
  liberarRolagem();
  const [a, b, c] = (location.hash.replace(/^#\/?/, '') || '').split('/');
  let tab = 'terco';

  if (a === 'terco' && b === 'rezar') telaRezar(c);
  else if (a === 'terco' && b === 'aprender') { tab = 'aprender'; telaAprender(); }
  else if (a === 'mais') { tab = 'mais'; telaMais(); }
  else telaTerco();

  $tabbar.querySelectorAll('a').forEach((x) => x.classList.toggle('active', x.dataset.tab === tab));
  moverIndicador();
}

window.addEventListener('hashchange', rota);
window.addEventListener('resize', moverIndicador);
document.fonts && document.fonts.ready.then(moverIndicador);
aplicarTema(temaAtual());
rota();
agendarAvisos();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
