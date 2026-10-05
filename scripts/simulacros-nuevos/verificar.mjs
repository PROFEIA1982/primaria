#!/usr/bin/env node
/**
 * Revisa un examen de los simulacros nuevos ANTES de generar su migracion.
 *
 *     pnpm verificar:simulacros-nuevos matematicas
 *
 * Lee docs/simulacros-nuevos/<materia>.json y aplica las reglas de
 * docs/simulacros-nuevos/reglas-items.md que se pueden revisar con codigo:
 *
 *   · cuarenta items, cada uno con todos sus campos
 *   · cada letra es clave exactamente diez veces, sin rachas ni escaleras
 *   · cuatro opciones distintas, sin "todas" ni "ninguna de las anteriores"
 *   · la correcta no es la mas larga ni repite palabras del enunciado
 *   · explicacion de dos o tres oraciones, en texto plano
 *   · ningun enunciado repetido ni casi repetido dentro del examen
 *   · cada figura existe en public/simulacros-nuevos y trae texto alternativo
 *   · formulas y tablas que KaTeX y Markdown dibujan sin dejar nada crudo
 *     (las mismas revisiones de scripts/revisiones.mjs que usa el banco)
 *
 * Y si encuentra VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (en .env.local o
 * en el ambiente), compara cada enunciado nuevo contra los enunciados
 * publicados de la misma materia en el banco y avisa de los que se parecen
 * demasiado. Solo lee: la tabla items es de lectura publica.
 *
 * Sale con codigo 1 si encuentra un error. Los avisos no detienen nada, pero
 * hay que leerlos: casi siempre son un item que conviene mirar con calma.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { revisarEstructura, revisarTexto } from '../revisiones.mjs';
import {
  DIR_FIGURAS, LETRAS, MARCA_FIGURA, NIVELES, enunciadoFinal, leerExamen, textoPlano,
} from './comun.mjs';

const materia = process.argv[2];
if (!materia) {
  console.error('Falta la materia. Ejemplo: pnpm verificar:simulacros-nuevos matematicas');
  process.exit(2);
}

const examen = leerExamen(materia);
const items = examen.items ?? [];
const errores = [];
const avisos = [];
const error = (donde, queja) => errores.push(`${donde}: ${queja}`);
const aviso = (donde, queja) => avisos.push(`${donde}: ${queja}`);

// Palabras que no cuentan como "repetir el enunciado": articulos, unidades y
// conectores que cualquier opcion bien hecha trae.
const VACIAS = new Set(('el la los las un una unos unas de del al y o a en con por para que se su sus ' +
  'es son mas menos cada entre como pero porque cual cuál cuanto cuánto cuantos cuántos ' +
  'tiene tienen hay total kg cm km mm mL m2 cm2 lado lados').split(' '));

function palabras(t) {
  return textoPlano(t)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9ñ]+/)
    .filter((p) => p.length >= 4 && !VACIAS.has(p) && !/^\d+$/.test(p));
}

// Parecido entre dos textos: Jaccard sobre pares de palabras seguidas. Mide
// si se dice lo mismo con las mismas palabras, que es lo que delata un item
// copiado o parafraseado de cerca.
function pares(t) {
  const p = textoPlano(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9ñ]+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + 1 < p.length; i++) s.add(`${p[i]} ${p[i + 1]}`);
  return s;
}
function parecido(a, b) {
  const A = pares(a);
  const B = pares(b);
  if (A.size === 0 || B.size === 0) return 0;
  let comun = 0;
  for (const x of A) if (B.has(x)) comun++;
  return comun / (A.size + B.size - comun);
}

// ---------------------------------------------------------------- examen

const s = examen.simulacro ?? {};
if (!s.slug || !/^[a-z0-9-]+$/.test(s.slug)) error('simulacro', 'slug vacio o con caracteres raros');
if (s.materia !== materia) error('simulacro', `dice materia "${s.materia}" pero el archivo es de ${materia}`);
if (!s.titulo) error('simulacro', 'falta el titulo');
if (!Number.isInteger(s.segundos_por_item) || s.segundos_por_item < 30) error('simulacro', 'segundos_por_item invalido');
if (items.length !== 40) error('examen', `trae ${items.length} items y deben ser 40`);

// ---------------------------------------------------------------- item por item

const ids = new Set();
items.forEach((it, i) => {
  const donde = it.id ?? `item ${i + 1}`;
  for (const campo of ['id', 'orden', 'materia', 'tema', 'subtema', 'nivel', 'enunciado', 'opciones', 'clave', 'explicacion']) {
    if (it[campo] === undefined || it[campo] === null || it[campo] === '') error(donde, `falta "${campo}"`);
  }
  if (ids.has(it.id)) error(donde, 'id repetido');
  ids.add(it.id);
  if (it.orden !== i + 1) error(donde, `orden ${it.orden} y deberia ser ${i + 1}`);
  if (it.materia !== materia) error(donde, `materia "${it.materia}"`);
  if (!NIVELES.includes(it.nivel)) error(donde, `nivel "${it.nivel}" (solo ${NIVELES.join(' o ')})`);
  if (!LETRAS.includes(it.clave)) error(donde, `clave "${it.clave}"`);

  const op = it.opciones ?? {};
  const letras = Object.keys(op);
  if (letras.join('') !== 'ABCD') error(donde, `opciones ${letras.join('')} (deben ser A, B, C y D en ese orden)`);
  const textos = LETRAS.map((l) => op[l] ?? '');
  if (new Set(textos.map((t) => textoPlano(t).toLowerCase())).size !== 4) error(donde, 'hay opciones repetidas');
  for (const t of textos) {
    if (/(todas|ninguna) de las anteriores/i.test(t)) error(donde, `opcion prohibida: "${t}"`);
  }

  // Pista por largo: la correcta no puede ser la mas larga de las cuatro.
  // Con empate no hay pista, asi que solo cuenta si es la unica mas larga.
  const largos = textos.map((t) => textoPlano(t).length);
  const iClave = LETRAS.indexOf(it.clave);
  const maximo = Math.max(...largos);
  if (largos[iClave] === maximo && largos.filter((l) => l === maximo).length === 1 && maximo > 6) {
    error(donde, `la correcta es la opcion mas larga (${largos.join(' / ')} caracteres)`);
  }
  // Opciones de texto muy disparejas tambien dan pistas.
  if (maximo > 12 && Math.min(...largos) < maximo * 0.5) {
    aviso(donde, `opciones de largo muy distinto (${largos.join(' / ')} caracteres)`);
  }

  // La correcta no debe repetir palabras del enunciado (eco lexico).
  const delEnunciado = new Set(palabras(it.enunciado ?? ''));
  const eco = palabras(textos[iClave] ?? '').filter((p) => delEnunciado.has(p));
  if (eco.length) {
    // Si los distractores repiten la misma palabra, no es pista: es el tema.
    const enTodas = eco.filter((p) => textos.every((t) => palabras(t).includes(p)));
    const delata = eco.filter((p) => !enTodas.includes(p));
    if (delata.length) error(donde, `la correcta repite del enunciado: ${delata.join(', ')}`);
  }

  // Explicacion: para un chiquito, dos o tres oraciones y sin LaTeX, porque
  // la revision de resultados la pinta como texto plano.
  const exp = it.explicacion ?? '';
  const oraciones = exp.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¡¿0-9])/).filter((o) => o.trim());
  if (oraciones.length < 2 || oraciones.length > 4) aviso(donde, `explicacion de ${oraciones.length} oraciones (lo ideal son dos o tres)`);
  if (/\$|\\frac|\\times/.test(exp)) error(donde, 'la explicacion trae LaTeX y se va a ver crudo: escriba 2/5, ×, ÷');

  // Figura: existe, tiene texto alternativo y la marca esta en el enunciado.
  const conMarca = (it.enunciado ?? '').includes(MARCA_FIGURA);
  if (it.imagen) {
    if (!conMarca) error(donde, `trae imagen pero el enunciado no tiene ${MARCA_FIGURA}`);
    if (!it.imagen.alt || it.imagen.alt.trim().length < 20) error(donde, 'la imagen no trae texto alternativo descriptivo');
    if (/^https?:/i.test(it.imagen.archivo ?? '')) error(donde, 'la imagen no puede venir de una URL externa');
    const archivo = path.join(DIR_FIGURAS, it.imagen.archivo ?? '');
    if (!fs.existsSync(archivo)) error(donde, `no existe public/simulacros-nuevos/${it.imagen.archivo}`);
    else if (!/<title[^>]*>[^<]{20,}<\/title>/.test(fs.readFileSync(archivo, 'utf8'))) {
      aviso(donde, `${it.imagen.archivo} no trae <title> descriptivo`);
    }
  } else if (conMarca) {
    error(donde, `el enunciado tiene ${MARCA_FIGURA} pero el item no trae imagen`);
  }
  if (/!\[[^\]]*\]\(https?:/i.test(it.enunciado ?? '')) error(donde, 'imagen de URL externa en el enunciado');

  // Formato: las mismas revisiones que se le pasan al banco publicado.
  const final = enunciadoFinal(it);
  for (const [parte, texto] of [['enunciado', final], ...LETRAS.map((l) => [`opcion ${l}`, op[l] ?? ''])]) {
    for (const h of revisarTexto(texto)) error(donde, `${parte}: ${h.tipo}: ${h.queja}`);
  }
  const estructura = {
    enunciado: final,
    opciones: LETRAS.map((l) => ({ texto: op[l] ?? '', es_correcta: l === it.clave })),
    opcionesCompletas: true,
  };
  for (const q of revisarEstructura(estructura)) error(donde, q);
});

// ---------------------------------------------------------------- claves

const claves = items.map((it) => it.clave).join('');
for (const l of LETRAS) {
  const n = [...claves].filter((c) => c === l).length;
  if (items.length === 40 && n !== 10) error('claves', `la ${l} es clave ${n} veces y deben ser 10`);
}
if (/(.)\1\1/.test(claves)) error('claves', `hay tres claves iguales seguidas: ${claves}`);
for (let i = 0; i + 4 <= claves.length; i++) {
  const w = claves.slice(i, i + 4);
  if (w === 'ABCD' || w === 'DCBA') error('claves', `escalera ${w} en las preguntas ${i + 1} a ${i + 4}`);
  if (w[0] === w[2] && w[1] === w[3]) aviso('claves', `vaiven ${w} en las preguntas ${i + 1} a ${i + 4}`);
}

// ---------------------------------------------------------------- parecidos internos

for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const p = parecido(items[i].enunciado, items[j].enunciado);
    if (p >= 0.5) error(`${items[i].id} y ${items[j].id}`, `enunciados casi iguales (${p.toFixed(2)})`);
    else if (p >= 0.3) aviso(`${items[i].id} y ${items[j].id}`, `enunciados parecidos (${p.toFixed(2)})`);
  }
}

// ---------------------------------------------------------------- contra el banco

async function compararConBanco() {
  // Lee .env.local a mano para no depender de --env-file.
  const env = { ...process.env };
  try {
    for (const linea of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  } catch { /* sin .env.local */ }
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const llave = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  if (!url || !llave) {
    aviso('banco', 'sin VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no se comparo contra el banco publicado: corralo con esas variables antes de publicar');
    return null;
  }
  const pedir = async (ruta) => {
    const r = await fetch(`${url}/rest/v1/${ruta}`, { headers: { apikey: llave, Authorization: `Bearer ${llave}` } });
    if (!r.ok) throw new Error(`${ruta} respondio ${r.status}`);
    return r.json();
  };
  const [m] = await pedir(`materias?select=id&slug=eq.${materia}`);
  if (!m) throw new Error(`no hay materia ${materia} en la base`);
  const banco = await pedir(`items?select=enunciado&estado=eq.publicado&materia_id=eq.${m.id}`);
  let parecidos = 0;
  for (const it of items) {
    let peor = { p: 0, texto: '' };
    for (const b of banco) {
      const p = parecido(it.enunciado, b.enunciado ?? '');
      if (p > peor.p) peor = { p, texto: b.enunciado };
    }
    if (peor.p >= 0.35) {
      parecidos++;
      const muestra = textoPlano(peor.texto).slice(0, 90);
      if (peor.p >= 0.5) error(it.id, `casi igual a uno del banco (${peor.p.toFixed(2)}): "${muestra}…"`);
      else aviso(it.id, `se parece a uno del banco (${peor.p.toFixed(2)}): "${muestra}…"`);
    }
  }
  console.log(`Comparado contra ${banco.length} enunciados publicados de ${materia}: ${parecidos} con parecido para revisar.\n`);
  return banco.length;
}

try {
  await compararConBanco();
} catch (e) {
  aviso('banco', `no se pudo comparar: ${e.message}`);
}

// ---------------------------------------------------------------- informe

const porTema = new Map();
for (const it of items) porTema.set(it.tema, (porTema.get(it.tema) ?? 0) + 1);
const niveles = NIVELES.map((n) => `${n} ${items.filter((it) => it.nivel === n).length}`).join(' · ');
const figuras = items.filter((it) => it.imagen).length;

console.log(`${examen.simulacro?.titulo} de ${materia}: ${items.length} items`);
console.log(`Claves: ${claves}`);
console.log(`Temas: ${[...porTema].map(([t, n]) => `${t} ${n}`).join(' · ')}`);
console.log(`Niveles: ${niveles} · Figuras: ${figuras}\n`);

if (avisos.length) {
  console.log(`Avisos (${avisos.length}), para mirar con calma:`);
  for (const a of avisos) console.log(`  · ${a}`);
  console.log();
}
if (errores.length) {
  console.log(`Errores (${errores.length}):`);
  for (const e of errores) console.log(`  ✗ ${e}`);
  process.exit(1);
}
console.log('Sin errores.');
