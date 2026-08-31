#!/usr/bin/env node
/**
 * Revisa el banco de items buscando los problemas de formato que se ven feos
 * en pantalla: formulas que no renderizan, tablas aplastadas y opciones mal
 * armadas.
 *
 * Nace de un arreglo real. En agosto de 2026, 41 items de matematicas venian
 * con los delimitadores de otro dialecto de LaTeX, `\( ... \)` en vez de
 * `$ ... $`. El renderizador solo entiende el segundo, asi que Markdown se
 * comia la barra invertida y el estudiante veia
 *
 *     ( (15 \times 150) + (10 \times75) )
 *
 * en texto plano. Nadie lo noto hasta que aparecio en pantalla. Este script
 * existe para que la proxima vez se note antes de publicar.
 *
 *     pnpm verificar:items
 *
 * Sale con codigo 1 si encuentra algo, asi que sirve tal cual en un gancho de
 * pre-despliegue o en integracion continua.
 *
 * COBERTURA. Los enunciados se revisan todos siempre. Las opciones salen por
 * sortear_items, que entrega 60 por llamada y al azar, porque la tabla
 * `opciones` esta cerrada a proposito: tiene la columna es_correcta, o sea la
 * respuesta, y abierta le diria al estudiante cuales son los faciles. El
 * script insiste hasta que deja de aparecer material nuevo y le dice con
 * franqueza que porcentaje alcanzo a ver. Si exporta
 * SUPABASE_SERVICE_ROLE_KEY lee las tablas directo y cubre el cien por ciento
 * de una pasada; esa llave nunca se imprime ni se guarda, solo viaja en la
 * cabecera de la peticion.
 */

import process from 'node:process';
import { revisarTexto, revisarEstructura } from './revisiones.mjs';

const URL      = process.env.VITE_SUPABASE_URL;
const ANON     = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;   // opcional

const MATERIAS = ['espanol', 'estudios-sociales', 'ciencias', 'matematicas'];
const VUELTAS_MAX = 12;      // sorteos por materia antes de darse por servido
const SIN_NOVEDAD_MAX = 3;   // vueltas seguidas sin items nuevos = ya no sale mas

if (!URL || !ANON) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  console.error('Copie .env.example a .env.local y llene los valores.');
  process.exit(2);
}

async function pedir(ruta, llave, opciones = {}) {
  const r = await fetch(`${URL}/rest/v1/${ruta}`, {
    ...opciones,
    headers: {
      apikey: llave,
      Authorization: `Bearer ${llave}`,
      'Content-Type': 'application/json',
      ...(opciones.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`${ruta} respondio ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

/** Con llave de servicio se leen las tablas directo y no falta nada. */
async function traerConServicio() {
  const filas = await pedir(
    'items?select=origen_moodle_id,enunciado,opciones(texto,es_correcta)&estado=eq.publicado',
    SERVICIO,
  );
  return filas.map((f) => ({
    nombre: f.origen_moodle_id ?? '(sin identificador)',
    enunciado: f.enunciado,
    opciones: f.opciones ?? [],
    opcionesCompletas: true,
  }));
}

/**
 * Sin llave de servicio: los enunciados salen completos de la tabla items y
 * las opciones hay que pescarlas con sorteos repetidos, que es la unica puerta
 * que las entrega.
 */
async function traerConAnon() {
  const filas = await pedir('items?select=origen_moodle_id,enunciado&estado=eq.publicado', ANON);

  // El sorteo no devuelve el identificador de origen, asi que el enunciado es
  // la llave para volver a juntar cada item con sus opciones.
  const porEnunciado = new Map();
  for (const f of filas) {
    porEnunciado.set(f.enunciado, {
      nombre: f.origen_moodle_id ?? '(sin identificador)',
      enunciado: f.enunciado,
      opciones: [],
      opcionesCompletas: false,
    });
  }

  for (const materia of MATERIAS) {
    let sinNovedad = 0;
    for (let v = 0; v < VUELTAS_MAX && sinNovedad < SIN_NOVEDAD_MAX; v++) {
      const lote = await pedir('rpc/sortear_items', ANON, {
        method: 'POST',
        body: JSON.stringify({ p_materia: materia, p_cantidad: 60 }),
      });
      let nuevos = 0;
      for (const q of lote) {
        const it = porEnunciado.get(q.enunciado);
        if (it && !it.opcionesCompletas) {
          it.opciones = q.opciones ?? [];
          it.opcionesCompletas = true;
          nuevos++;
        }
      }
      sinNovedad = nuevos === 0 ? sinNovedad + 1 : 0;
    }
  }
  return [...porEnunciado.values()];
}

// ------------------------------------------------------------------ programa

const items = SERVICIO ? await traerConServicio() : await traerConAnon();
const vistos = items.filter((i) => i.opcionesCompletas).length;
const cobertura = items.length ? Math.round((vistos / items.length) * 100) : 0;

console.log(`Revisando ${items.length} items publicados.`);
if (SERVICIO) {
  console.log('Llave de servicio presente: enunciados y opciones, cobertura total.\n');
} else if (cobertura === 100) {
  console.log('Cobertura total: se alcanzaron a ver todas las opciones por sorteo.\n');
} else {
  console.log(
    `Los ${items.length} enunciados van completos; de las opciones se alcanzo a ver el ${cobertura}%.\n` +
    '  Exporte SUPABASE_SERVICE_ROLE_KEY si quiere revisar el 100% de una pasada.\n',
  );
}

const hallazgos = [];
for (const item of items) {
  const piezas = [
    ['enunciado', item.enunciado],
    ...item.opciones.map((o, i) => [`opcion ${i + 1}`, o.texto]),
  ];
  for (const [donde, texto] of piezas) {
    for (const h of revisarTexto(texto)) {
      hallazgos.push({ item: item.nombre, donde, ...h });
    }
  }
  for (const queja of revisarEstructura(item)) {
    hallazgos.push({ item: item.nombre, donde: 'estructura', tipo: 'estructura del item', ayuda: '', queja });
  }
}

if (hallazgos.length === 0) {
  console.log('Todo limpio. Ni una formula rota, ni una tabla aplastada.');
  process.exit(0);
}

// Agrupado por tipo: es mas util leer "12 items con el delimitador viejo" que
// doce lineas sueltas diciendo lo mismo.
const porTipo = new Map();
for (const h of hallazgos) {
  if (!porTipo.has(h.tipo)) porTipo.set(h.tipo, []);
  porTipo.get(h.tipo).push(h);
}

const cuantosItems = new Set(hallazgos.map((h) => h.item)).size;
console.log(`Encontre ${hallazgos.length} cosas en ${cuantosItems} items.\n`);

for (const [tipo, lista] of porTipo) {
  console.log(`-- ${tipo} · ${lista.length}`);
  if (lista[0].ayuda) console.log(`   ${lista[0].ayuda}`);
  for (const h of lista.slice(0, 12)) console.log(`   ${h.item} · ${h.donde}: ${h.queja}`);
  if (lista.length > 12) console.log(`   ... y ${lista.length - 12} mas`);
  console.log();
}

process.exit(1);
