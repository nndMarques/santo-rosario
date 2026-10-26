// Contagem anônima de visitas (GoatCounter).
// Sem cookies, sem guardar o IP, sem identificar ninguém: só "esta tela foi aberta".
// Fica desligada enquanto "goatcounter" estiver vazio em config.js.
// Não conta em localhost, nem quando o navegador pede "Do Not Track", nem se a pessoa desligar em Ajustes.
import { CONFIG } from './config.js';

const CHAVE = 'semContagem';
let app = 'app';
let ultimoCaminho = '';
let primeira = true;

export const contagemConfigurada = () => !!CONFIG.goatcounter;
export const contagemLigada = () => { try { return localStorage.getItem(`${app}.${CHAVE}`) !== '1'; } catch (e) { return true; } };
export function definirContagem(ligada) {
  try { if (ligada) localStorage.removeItem(`${app}.${CHAVE}`); else localStorage.setItem(`${app}.${CHAVE}`, '1'); } catch (e) {}
}
export function iniciarContagem(nome) { app = nome; }

function permitida() {
  if (!contagemConfigurada() || !contagemLigada()) return false;
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return false;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return false;
  return true;
}

// De onde a pessoa veio: ?ref=instagram no link da bio, ou o site de origem
function referencia() {
  const q = new URLSearchParams(location.search);
  const marca = q.get('ref') || q.get('utm_source');
  if (marca) return marca;
  try { const r = document.referrer; if (r && new URL(r).host !== location.host) return r; } catch (e) {}
  return '';
}

function enviar(caminho, titulo, evento) {
  if (!permitida()) return;
  const p = new URLSearchParams({
    p: caminho,
    t: titulo || '',
    s: `${screen.width},${screen.height},${window.devicePixelRatio || 1}`,
    rnd: Math.random().toString(36).slice(2),
  });
  if (evento) p.set('e', 'true');
  if (primeira && !evento) { const r = referencia(); if (r) p.set('r', r); primeira = false; }
  new Image().src = `https://${CONFIG.goatcounter}.goatcounter.com/count?${p}`;
}

export function contarTela(rota, titulo) {
  const caminho = `/${app}/${rota || 'inicio'}`;
  if (caminho === ultimoCaminho) return;
  ultimoCaminho = caminho;
  enviar(caminho, titulo, false);
}

export function contarEvento(nome) { enviar(`/${app}/evento/${nome}`, nome, true); }
