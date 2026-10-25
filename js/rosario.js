// O terço desenhado conta por conta, com a oração de cada conta escrita ao lado.
import { MISTERIOS } from './data/terco.js';

export const ORD = ['1º', '2º', '3º', '4º', '5º'];

// Geometria (unidades do viewBox)
const W = 380, H = 632;
const CX = 190, CY = 212, RX = 104, RY = 192, T0 = 0.17;
const MEDALHA = { x: CX, y: CY + RY + 4 };

// Ordem em que as contas são rezadas, da cruz até a medalha.
export function ordem() {
  const o = ['cruz', 'p0', 'a0-0', 'a0-1', 'a0-2', 'p1'];
  for (let k = 1; k <= 5; k++) {
    for (let i = 0; i < 10; i++) o.push(`a${k}-${i}`);
    if (k < 5) o.push(`p${k + 1}`);
  }
  o.push('medalha');
  return o;
}

// O que se reza em cada conta.
export function oracoesDa(id, conjunto) {
  const M = MISTERIOS[conjunto];
  if (id === 'cruz') return { onde: 'Na cruz', itens: [{ o: 'sinal' }, { o: 'credo' }] };
  if (id === 'p0') return { onde: 'Primeira conta grande', itens: [{ o: 'pai' }] };
  if (id === 'medalha') return { onde: 'Na medalha · conclusão', itens: [{ o: 'gloria' }, { o: 'fatima' }, { o: 'salve' }, { o: 'sinal' }] };
  if (id[0] === 'p') {
    const k = +id.slice(1) - 1;
    const antes = k === 0 ? [{ o: 'gloria' }] : [{ o: 'gloria' }, { o: 'fatima' }];
    return {
      onde: k === 0 ? 'Conta grande · antes da primeira dezena' : `Conta grande · depois da ${k}ª dezena`,
      itens: [...antes, { misterio: k, ...M.itens[k] }, { o: 'pai' }],
    };
  }
  const [g, i] = id.slice(1).split('-').map(Number);
  if (g === 0) return { onde: `Ave-Maria ${i + 1} de 3`, itens: [{ o: 'ave', intencao: i }] };
  return { onde: `${ORD[g - 1]} mistério · Ave-Maria ${i + 1} de 10`, itens: [{ o: 'ave' }], medita: M.itens[g - 1] };
}

// Pontos ao longo do laço, para espaçar as contas por comprimento de arco.
function laco() {
  const N = 1600, pts = [], cum = [0];
  for (let j = 0; j <= N; j++) {
    const t = T0 + ((2 * Math.PI - 2 * T0) * j) / N;
    pts.push([CX + RX * Math.sin(t), CY + RY * Math.cos(t)]);
    if (j) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  }
  return (f) => {
    const alvo = f * cum[N];
    let lo = 0, hi = N;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < alvo) lo = mid + 1; else hi = mid; }
    return pts[lo];
  };
}

const txt = (x, y, linhas, ancora, cls = '') => linhas.map((l, j) => {
  const c = typeof l === 'string' ? '' : l.c;
  const t = typeof l === 'string' ? l : l.t;
  return `<text x="${x.toFixed(1)}" y="${(y + j * 12.5).toFixed(1)}" text-anchor="${ancora}" class="${cls} ${c}">${t}</text>`;
}).join('');

export function rosarioSVG() {
  const em = laco();
  const itens = [];
  for (let k = 1; k <= 5; k++) {
    for (let i = 0; i < 10; i++) itens.push({ id: `a${k}-${i}`, w: 1 });
    if (k < 5) itens.push({ id: `p${k + 1}`, w: 1.9 });
  }
  const pad = 0.7;
  const total = itens.reduce((a, b) => a + b.w, 0) + 2 * pad;
  let acc = pad;
  const pos = {};
  itens.forEach((it) => { pos[it.id] = em((acc + it.w / 2) / total); acc += it.w; });

  let k = 0;
  const conta = (id, x, y, grande, rotulo = '') => `
    <g class="conta${grande ? ' grande' : ''}" data-conta="${id}" style="--k:${k++}" role="button" tabindex="0" aria-label="${id}">
      <circle class="hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${grande ? 14 : 8.5}"/>
      <circle class="b" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${grande ? 8.5 : 4.9}"/>
      ${rotulo}
    </g>`;

  let contas = '';
  // pingente: cruz, Pai-nosso, 3 Ave-Marias, conta grande do 1º mistério
  // (legendas alternando entre os lados, para o desenho ficar equilibrado)
  const px = CX, ry = { p1: MEDALHA.y + 36, a: [MEDALHA.y + 62, MEDALHA.y + 79, MEDALHA.y + 96], p0: MEDALHA.y + 124, cruz: MEDALHA.y + 150 };
  contas += `<g class="conta cruz" data-conta="cruz" style="--k:${k++}" role="button" tabindex="0" aria-label="cruz">
    <rect class="hit" x="${px - 20}" y="${ry.cruz - 4}" width="40" height="72"/>
    <path class="crz" d="M${px} ${ry.cruz}v62M${px - 15} ${ry.cruz + 17}h30"/>
    ${txt(px - 24, ry.cruz + 22, [{ t: 'Na cruz', c: 'ac' }, 'Sinal da cruz', 'Creio'], 'end', 'lb')}
  </g>`;
  contas += conta('p0', px, ry.p0, true, txt(px + 22, ry.p0 + 4, ['Pai-nosso'], 'start', 'lb'));
  ry.a.slice().reverse().forEach((y, j) => {
    const i = 2 - j;
    contas += conta(`a0-${i}`, px, y, false, i === 1 ? txt(px - 22, y - 2, ['3 Ave-Marias', { t: 'fé, esperança e caridade', c: 'mu' }], 'end', 'lb') : '');
  });
  contas += conta('p1', px, ry.p1, true, txt(px + 22, ry.p1 - 2, [{ t: '1º mistério', c: 'ac' }, 'Glória · Pai-nosso'], 'start', 'lb'));

  // laço: cinco dezenas
  itens.forEach((it) => {
    const [x, y] = pos[it.id];
    const dir = x >= CX ? 1 : -1;
    let rot = '';
    if (it.id[0] === 'p') {
      const n = +it.id.slice(1);
      rot = txt(x + dir * 16, y - 16, [{ t: `${ORD[n - 1]} mistério`, c: 'ac' }, 'Glória e', 'Ó meu Jesus', 'Pai-nosso'], dir > 0 ? 'start' : 'end', 'lb');
    } else if (it.id.endsWith('-4')) {
      const [x2, y2] = pos[it.id.replace(/-4$/, '-5')];
      const mx = (x + x2) / 2, my = (y + y2) / 2;
      const topo = my < CY - RY * 0.8;
      rot = topo
        ? txt(mx, my + 36, ['Ave-Maria', '× 10'], 'middle', 'lb dz')
        : txt(mx - dir * 14, my - 2, ['Ave-Maria', '× 10'], dir > 0 ? 'end' : 'start', 'lb dz');
    }
    contas += conta(it.id, x, y, it.w > 1, rot);
  });

  // medalha
  contas += `<g class="conta medalha" data-conta="medalha" style="--k:${k++}" role="button" tabindex="0" aria-label="medalha">
    <circle class="hit" cx="${MEDALHA.x}" cy="${MEDALHA.y}" r="18"/>
    <circle class="b" cx="${MEDALHA.x}" cy="${MEDALHA.y}" r="13"/>
    <text x="${MEDALHA.x}" y="${MEDALHA.y + 5.5}" text-anchor="middle" class="mono">M</text>
    ${txt(MEDALHA.x - 22, MEDALHA.y + 14, [{ t: 'No fim', c: 'ac' }, 'Glória e Ó meu Jesus', 'Salve-Rainha'], 'end', 'lb')}
  </g>`;

  return `<svg class="rosario" viewBox="0 0 ${W} ${H}" role="group" aria-label="Terço: toque numa conta para ver a oração">
    <ellipse class="fio" cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" pathLength="1"/>
    <path class="fio" d="M${CX} ${MEDALHA.y}V${ry.cruz}" pathLength="1"/>
    ${contas}
  </svg>`;
}
