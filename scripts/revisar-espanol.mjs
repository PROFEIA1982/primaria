#!/usr/bin/env node
/**
 * Revision automatica del simulacro nuevo de Espanol (comprension lectora).
 *
 *     node scripts/revisar-espanol.mjs
 *     pnpm revisar:espanol
 *
 * Lee docs/simulacros-nuevos/espanol.json e imprime un informe con lo que el
 * encargo pide revisar con codigo:
 *
 *   · 60 items y el conteo exacto por afirmacion (9, 8, 8, 7, 7, 7, 7, 7)
 *   · el orden en ciclos 1-8 del cuadernillo del MEP
 *   · 24 items intermedios y 36 altos, sin empezar ni terminar con altos
 *   · cada letra es clave 15 veces, sin tres iguales seguidas ni escaleras
 *   · cada texto entre 50 y 150 palabras, y que la cuenta del JSON calce
 *   · oraciones de 25 palabras o menos (los poemas se miden por versos)
 *   · opciones ordenadas de la mas corta a la mas larga, y la mas larga sin
 *     pasar en mas de un tercio a la mas corta
 *   · textos repetidos o casi repetidos
 *   · ningun "Tomado de" ni "Adaptado de"
 *   · enunciados sin "no", "excepto" ni "falso"
 *
 * Sale con codigo 1 si encuentra una falla. Es complemento de
 * pnpm verificar:simulacros-nuevos espanol, que revisa el formato comun a
 * todas las materias y compara contra el banco.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUTA = path.join(RAIZ, 'docs', 'simulacros-nuevos', 'espanol.json');
const { items = [] } = JSON.parse(fs.readFileSync(RUTA, 'utf8'));

// La tabla de especificaciones del encargo: afirmacion -> cantidad de items.
const TABLA = { 1: 9, 2: 8, 3: 8, 4: 7, 5: 7, 6: 7, 7: 7, 8: 7 };
const NOMBRES = {
  1: 'Ideas fundamentales', 2: 'Ideas complementarias', 3: 'Causas', 4: 'Efectos',
  5: 'Temas', 6: 'Pensamientos', 7: 'Conflictos', 8: 'Comportamientos',
};
const LETRAS = ['A', 'B', 'C', 'D'];

const fallas = [];
const falla = (donde, que) => fallas.push(`${donde}: ${que}`);

// Palabras de un texto: lo que tiene al menos una letra o un numero.
const palabras = (t) => t.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w));
const normal = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9ñ]+/).filter(Boolean);
function pares(t) {
  const p = normal(t);
  const s = new Set();
  for (let i = 0; i + 1 < p.length; i++) s.add(`${p[i]} ${p[i + 1]}`);
  return s;
}
function parecido(a, b) {
  let comun = 0;
  for (const x of a) if (b.has(x)) comun++;
  return a.size && b.size ? comun / (a.size + b.size - comun) : 0;
}

// ------------------------------------------------------------ conjunto

if (items.length !== 60) falla('examen', `trae ${items.length} items y deben ser 60`);

const porAfirmacion = {};
for (const it of items) {
  const af = Number(it.afirmacion?.codigo ?? it.afirmacion);
  porAfirmacion[af] = (porAfirmacion[af] ?? 0) + 1;
}
for (const [af, n] of Object.entries(TABLA)) {
  if ((porAfirmacion[af] ?? 0) !== n) falla('tabla', `afirmacion ${af}: ${porAfirmacion[af] ?? 0} items y deben ser ${n}`);
}

// Ciclos 1, 2, ..., 8, 1, 2, ... saltandose las afirmaciones ya completas.
const esperado = [];
const resto = { ...TABLA };
while (esperado.length < 60) {
  let puso = false;
  for (let af = 1; af <= 8; af++) if (resto[af] > 0) { esperado.push(af); resto[af]--; puso = true; }
  if (!puso) break;
}
const orden = items.map((it) => Number(it.afirmacion?.codigo ?? it.afirmacion));
if (orden.join(',') !== esperado.join(',')) falla('orden', 'los items no siguen los ciclos 1 a 8 del cuadernillo');

const niveles = { intermedio: 0, alto: 0 };
for (const it of items) niveles[it.nivel] = (niveles[it.nivel] ?? 0) + 1;
if (niveles.intermedio !== 24 || niveles.alto !== 36) falla('niveles', `${niveles.intermedio} intermedios y ${niveles.alto} altos (deben ser 24 y 36)`);
for (const i of [0, 1, 2, items.length - 3, items.length - 2, items.length - 1]) {
  if (items[i]?.nivel === 'alto') falla(`item ${i + 1}`, 'el examen no debe empezar ni terminar con un item alto');
}

const claves = items.map((it) => it.clave).join('');
const porLetra = Object.fromEntries(LETRAS.map((l) => [l, [...claves].filter((c) => c === l).length]));
for (const l of LETRAS) if (porLetra[l] !== 15) falla('claves', `la ${l} es clave ${porLetra[l]} veces y deben ser 15`);
if (/(.)\1\1/.test(claves)) falla('claves', 'hay tres claves iguales seguidas');
for (let i = 0; i + 4 <= claves.length; i++) {
  const w = claves.slice(i, i + 4);
  if (w === 'ABCD' || w === 'DCBA') falla('claves', `escalera ${w} en los items ${i + 1} a ${i + 4}`);
}

// ------------------------------------------------------------ item por item

const huellas = [];
const largosTexto = [];
for (const it of items) {
  const donde = `item ${it.numero ?? it.orden} (${it.id})`;
  const texto = it.texto ?? '';
  const n = palabras(texto).length;
  largosTexto.push(n);
  if (n < 50 || n > 150) falla(donde, `el texto tiene ${n} palabras (de 50 a 150)`);
  if (it.palabras_texto !== n) falla(donde, `palabras_texto dice ${it.palabras_texto} y el texto tiene ${n}`);

  if (it.genero === 'poema') {
    const versos = texto.split('\n').filter((v) => v.trim());
    if (versos.length < 8 || versos.length > 14) falla(donde, `poema de ${versos.length} versos (de 8 a 14)`);
  } else {
    for (const oracion of texto.split(/(?<=[.!?…»])\s+/)) {
      const m = palabras(oracion).length;
      if (m > 25) falla(donde, `oracion de ${m} palabras: "${oracion.slice(0, 60)}…"`);
    }
  }

  const ops = LETRAS.map((l) => it.opciones?.[l] ?? '');
  const largos = ops.map((o) => o.length);
  if (largos.some((l, i) => i > 0 && l < largos[i - 1])) falla(donde, `opciones fuera de orden por largo (${largos.join(' / ')})`);
  if (Math.max(...largos) > Math.min(...largos) * 4 / 3) falla(donde, `la mas larga supera en mas de un tercio a la mas corta (${largos.join(' / ')})`);

  const todo = [it.contexto, texto, it.enunciado, it.explicacion, ...ops].join('\n');
  if (/(tomado|adaptado)\s+de/i.test(todo)) falla(donde, 'trae "Tomado de" o "Adaptado de"');
  if (/\b(no|excepto|falso)\b/i.test(it.enunciado ?? '')) falla(donde, 'el enunciado usa "no", "excepto" o "falso"');

  const huella = pares(texto);
  for (const [otro, h] of huellas) {
    const p = parecido(huella, h);
    if (p >= 0.25) falla(donde, `texto parecido al del ${otro} (${p.toFixed(2)})`);
  }
  huellas.push([donde, huella]);
}

// ------------------------------------------------------------ informe

const porGenero = {};
for (const it of items) porGenero[it.genero] = (porGenero[it.genero] ?? 0) + 1;
const promedio = Math.round(largosTexto.reduce((a, b) => a + b, 0) / (largosTexto.length || 1));

console.log('Simulacro nuevo de Español · revisión automática\n');
console.log(`Ítems: ${items.length}`);
console.log('Por afirmación:');
for (const af of Object.keys(TABLA)) console.log(`  ${af}. ${NOMBRES[af].padEnd(18)} ${porAfirmacion[af] ?? 0} (pedidos: ${TABLA[af]})`);
console.log(`Por género: ${Object.entries(porGenero).map(([g, n]) => `${g} ${n}`).join(' · ')}`);
console.log(`Niveles: intermedio ${niveles.intermedio} · alto ${niveles.alto}`);
console.log(`Claves: ${claves} (${LETRAS.map((l) => `${l} ${porLetra[l]}`).join(', ')})`);
console.log(`Palabras por texto: de ${Math.min(...largosTexto)} a ${Math.max(...largosTexto)}, promedio ${promedio}\n`);

if (fallas.length) {
  console.log(`Fallas (${fallas.length}):`);
  for (const f of fallas) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('Sin fallas.');
