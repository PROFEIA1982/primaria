#!/usr/bin/env node
/**
 * Inventario del banco publicado: temas, cuantos items hay por tema, largo
 * tipico de los enunciados y uso de imagenes, tablas y LaTeX. Y, con eso, el
 * reparto de los 40 items de un simulacro nuevo en la misma proporcion.
 *
 *     pnpm inventario:simulacros-nuevos              imprime el inventario
 *     pnpm inventario:simulacros-nuevos --escribir   y lo escribe en
 *                                                    docs/simulacros-nuevos/inventario.md
 *
 * Solo lee, con la llave anon: materias, temas e items son de lectura
 * publica. Necesita VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
 * o en el ambiente.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { DIR_DOCS, MATERIAS, textoPlano } from './comun.mjs';

const TOTAL = 40;

const env = { ...process.env };
try {
  for (const linea of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2];
  }
} catch { /* sin .env.local */ }
const URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const LLAVE = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
if (!URL || !LLAVE) {
  console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (en .env.local o en el ambiente).');
  process.exit(2);
}

async function pedir(ruta) {
  const r = await fetch(`${URL}/rest/v1/${ruta}`, { headers: { apikey: LLAVE, Authorization: `Bearer ${LLAVE}` } });
  if (!r.ok) throw new Error(`${ruta} respondio ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

// Reparto de 40 por resto mayor: cada tema recibe la parte entera de su
// cuota y los que sobran van a los restos mas grandes. Asi la suma da 40
// exacto y nadie queda en cero si tiene al menos un item... salvo que su
// cuota sea menor que medio item, que es lo honesto.
function repartir(conteos, total) {
  const suma = conteos.reduce((a, c) => a + c.n, 0);
  if (suma === 0) return conteos.map((c) => ({ ...c, toca: 0 }));
  const filas = conteos.map((c) => {
    const cuota = (c.n / suma) * total;
    return { ...c, toca: Math.floor(cuota), resto: cuota - Math.floor(cuota) };
  });
  let faltan = total - filas.reduce((a, f) => a + f.toca, 0);
  for (const f of [...filas].sort((a, b) => b.resto - a.resto)) {
    if (faltan-- <= 0) break;
    f.toca += 1;
  }
  return filas;
}

const pct = (a, b) => (b === 0 ? '0 %' : `${Math.round((a / b) * 100)} %`);
const mediana = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const materias = await pedir('materias?select=id,slug,nombre&order=orden');
let md = `<!-- inventario generado: ${new Date().toISOString().slice(0, 10)} -->\n`;

for (const slug of MATERIAS) {
  const m = materias.find((x) => x.slug === slug);
  if (!m) { md += `\n### ${slug}\n\nNo existe en la tabla materias.\n`; continue; }
  const temas = await pedir(`temas?select=id,nombre,orden&materia_id=eq.${m.id}&order=orden`);
  const items = await pedir(`items?select=tema_id,enunciado,imagen_url&estado=eq.publicado&materia_id=eq.${m.id}`);

  const conteos = temas.map((t) => {
    const suyos = items.filter((i) => i.tema_id === t.id);
    return {
      tema: t.nombre,
      n: suyos.length,
      largo: mediana(suyos.map((i) => textoPlano(i.enunciado ?? '').length)),
      imagen: suyos.filter((i) => i.imagen_url || /!\[[^\]]*\]\(/.test(i.enunciado ?? '')).length,
      tabla: suyos.filter((i) => /^\s*\|.*\|\s*$/m.test(i.enunciado ?? '')).length,
      latex: suyos.filter((i) => /\$/.test(i.enunciado ?? '')).length,
    };
  });
  const sinTema = items.filter((i) => i.tema_id === null || !temas.some((t) => t.id === i.tema_id)).length;
  const reparto = repartir(conteos, TOTAL);

  md += `\n### ${m.nombre}\n\n`;
  md += `${items.length} ítems publicados${sinTema ? ` (${sinTema} sin tema)` : ''}.\n\n`;
  md += '| Tema | Ítems | % del banco | Largo típico del enunciado (caracteres) | Con imagen | Con tabla | Con LaTeX | Le tocan en el simulacro |\n';
  md += '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n';
  for (const f of reparto) {
    md += `| ${f.tema} | ${f.n} | ${pct(f.n, items.length)} | ${f.largo} | ${f.imagen} | ${f.tabla} | ${f.latex} | ${f.toca} |\n`;
  }
}

console.log(md);

if (process.argv.includes('--escribir')) {
  const ruta = path.join(DIR_DOCS, 'inventario.md');
  const actual = fs.readFileSync(ruta, 'utf8');
  const abre = '<!-- >>> inventario del banco -->';
  const cierra = '<!-- <<< inventario del banco -->';
  const a = actual.indexOf(abre);
  const c = actual.indexOf(cierra);
  if (a < 0 || c < a) {
    console.error(`inventario.md no tiene las marcas ${abre} y ${cierra}.`);
    process.exit(1);
  }
  fs.writeFileSync(ruta, `${actual.slice(0, a + abre.length)}\n${md}\n${actual.slice(c)}`);
  console.log(`Escrito en ${path.relative(process.cwd(), ruta)}.`);
}
