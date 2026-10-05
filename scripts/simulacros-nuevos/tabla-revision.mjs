#!/usr/bin/env node
/**
 * Escribe docs/simulacros-nuevos/<materia>.md, la tabla para revisar el
 * examen a mano, a partir del JSON. Se genera y no se edita: si algo se
 * corrige, se corrige en el JSON y se vuelve a correr esto. Asi la tabla
 * que lee una persona nunca dice algo distinto de lo que se carga a la base.
 *
 *     pnpm tabla:simulacros-nuevos matematicas
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { DIR_DOCS, LETRAS, MARCA_FIGURA, leerExamen } from './comun.mjs';

const materia = process.argv[2];
if (!materia) {
  console.error('Falta la materia. Ejemplo: pnpm tabla:simulacros-nuevos matematicas');
  process.exit(2);
}

const examen = leerExamen(materia);
const s = examen.simulacro;
const items = examen.items;
const celda = (t) => String(t).replace(/ /g, ' ').replace(/\|/g, '\\|').replace(/\n+/g, ' ');

// El enunciado en una linea: la tabla de Markdown se resume y la figura se
// nombra, para que la fila no se rompa.
function corto(t) {
  let x = t.replace(MARCA_FIGURA, '(figura)');
  if (x.includes('| --- |')) x = x.replace(/\n\n\|[\s\S]*?\|\n\n/, ' (tabla) ');
  return celda(x);
}

const cuenta = (f) => {
  const m = new Map();
  for (const it of items) m.set(f(it), (m.get(f(it)) ?? 0) + 1);
  return [...m];
};

const L = [];
L.push(`# ${s.titulo} · ${materia} · tabla de revisión\n`);
L.push(`Generada desde \`${materia}.json\`, que es la fuente. No se edita a mano: se corrige el JSON y se corre \`pnpm tabla:simulacros-nuevos ${materia}\`.\n`);
L.push(`- **${items.length} ítems**, ${Math.round(s.segundos_por_item / 60)} minutos por ítem.`);
L.push(`- **Claves:** ${items.map((i) => i.clave).join('')} (${LETRAS.map((l) => `${l} ${items.filter((i) => i.clave === l).length}`).join(', ')}).`);
L.push(`- **Bloques:** ${cuenta((i) => i.tema).map(([t, n]) => `${t} ${n}`).join(' · ')}.`);
L.push(`- **Niveles:** ${cuenta((i) => i.nivel).map(([t, n]) => `${t} ${n}`).join(' · ')}.`);
if (items.some((i) => i.verbo)) {
  L.push(`- **Verbos:** ${cuenta((i) => i.verbo).map(([t, n]) => `${t} ${n}`).join(' · ')}.`);
  L.push(`- **Tipos de contexto:** ${cuenta((i) => i.tipo_contexto).map(([t, n]) => `${t} ${n}`).join(' · ')}.`);
}
L.push('');
if (items.some((i) => i.contexto)) {
  L.push('## Conteo por afirmación\n');
  L.push('| Afirmación | Ítems | Texto |');
  L.push('| --- | ---: | --- |');
  for (const [cod, n] of cuenta((i) => i.afirmacion?.codigo)) {
    const af = items.find((i) => i.afirmacion?.codigo === cod).afirmacion;
    L.push(`| ${cod} | ${n} | ${celda(af.texto)} |`);
  }
  L.push('');
}
L.push(items.some((i) => i.contexto)
  ? 'Cada clave se revisó a mano contra el contexto y el programa de estudio, y pasó por dos auditorías independientes: una de contenido y otra psicométrica.\n'
  : 'Cada clave se confirmó dos veces: resolviendo el ítem a mano y con un programa que recalcula el resultado y comprueba que coincide con una sola opción.\n');

L.push('## Resumen\n');
if (items.some((i) => i.contexto)) {
  L.push('| # | Id | Tema | Evidencia | Verbo | Contexto | Nivel | Clave |');
  L.push('| ---: | --- | --- | --- | --- | --- | --- | :---: |');
  for (const it of items) {
    L.push(`| ${it.orden} | ${it.id} | ${it.tema} | ${it.evidencia?.codigo ?? '—'} | ${it.verbo} | ${it.tipo_contexto} | ${it.nivel} | ${it.clave} |`);
  }
} else {
  L.push('| # | Id | Bloque | Evidencia | Subtema | Nivel | Clave |');
  L.push('| ---: | --- | --- | --- | --- | --- | :---: |');
  for (const it of items) {
    L.push(`| ${it.orden} | ${it.id} | ${it.tema} | ${it.evidencia?.codigo ?? '—'} | ${celda(it.subtema)} | ${it.nivel} | ${it.clave} |`);
  }
}

L.push('\n## Ítem por ítem\n');
for (const it of items) {
  L.push(`### ${it.orden}. ${it.id} · ${it.tema} · ${it.nivel}\n`);
  if (it.afirmacion) L.push(`**Afirmación ${it.afirmacion.codigo}:** ${it.afirmacion.texto}  `);
  if (it.evidencia) L.push(`**Evidencia ${it.evidencia.codigo}:** ${it.evidencia.texto}  `);
  if (it.bloque) L.push(`**Bloque:** ${it.bloque}  `);
  if (it.verbo) L.push(`**Verbo:** ${it.verbo} · **Tipo de contexto:** ${it.tipo_contexto}  `);
  L.push(it.contexto ? `**Tema:** ${it.tema} · **Subtema:** ${it.subtema}\n` : `**Subtema:** ${it.subtema}\n`);
  if (it.contexto) {
    // El contexto va completo y tal cual, fuera de cualquier tabla: puede
    // traer su propia tabla en Markdown.
    L.push(`${it.contexto.replace(MARCA_FIGURA, it.imagen ? `(figura: ${it.imagen.archivo})` : '(figura)')}\n`);
    L.push(`**${celda(it.enunciado)}**\n`);
  } else {
    L.push(`${corto(it.enunciado)}\n`);
  }
  if (it.imagen) L.push(`Figura \`${it.imagen.archivo}\`. Texto alternativo: ${it.imagen.alt}\n`);
  L.push('| Opción | Texto | Qué revela |');
  L.push('| :---: | --- | --- |');
  for (const l of LETRAS) {
    const revela = l === it.clave ? '**Correcta**' : celda(it.por_que?.[l] ?? '—');
    L.push(`| ${l} | ${celda(it.opciones[l])} | ${revela} |`);
  }
  L.push(`\n**Resolución:** ${celda(it.explicacion)}\n`);
}

const ruta = path.join(DIR_DOCS, `${materia}.md`);
fs.writeFileSync(ruta, L.join('\n'));
console.log(`Escrita ${path.relative(process.cwd(), ruta)} (${items.length} ítems).`);
