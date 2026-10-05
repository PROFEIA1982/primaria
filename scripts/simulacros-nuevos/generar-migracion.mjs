#!/usr/bin/env node
/**
 * Convierte un examen de docs/simulacros-nuevos/<materia>.json en SQL de
 * carga para las tablas de los simulacros nuevos.
 *
 *     pnpm generar:simulacros-nuevos espanol
 *         Crea supabase/migrations/<fecha>_simulacros_nuevos_espanol.sql,
 *         una migracion nueva SOLO con datos. Es lo normal para cada
 *         materia que se agregue: el esquema ya existe.
 *
 *     pnpm generar:simulacros-nuevos ciencias --nombre simulacro_ciencias \
 *       --copia docs/simulacros-nuevos/cargar-ciencias.sql --banco-archivo respaldo/items.json
 *         Lo mismo, con el nombre de archivo que se escoja, una copia para
 *         pegar a mano en el editor SQL de Supabase (con su explicacion al
 *         inicio y consultas de verificacion al final) y la comparacion
 *         contra el banco hecha con un respaldo en vez de Supabase.
 *
 *     pnpm generar:simulacros-nuevos matematicas --en supabase/migrations/20261005210000_simulacros_nuevos.sql
 *         Reescribe el bloque de datos de una migracion que ya existe,
 *         entre las marcas ">>> datos generados" y "<<< datos generados".
 *         Asi se armo el piloto, que trae esquema y datos en un solo archivo.
 *
 * Antes de escribir nada corre el verificador, y le exige la comparacion
 * contra el banco publicado: si el examen tiene errores, o si no se pudo
 * comprobar que sus preguntas no estan ya en la practica, no se genera. Un
 * SQL bonito con una clave mala o una pregunta repetida adentro es peor que
 * nada. Para generar sin esa comparacion hay que pedirlo con --sin-banco, y
 * queda escrito en el encabezado del SQL.
 *
 * La carga es idempotente. Actualiza por slug y por codigo de item, borra
 * los items que ya no esten en el JSON y deja una revision al final que
 * revienta la migracion entera si algun item quedo sin sus cuatro opciones
 * o sin exactamente una correcta. El examen entra como borrador y la propia
 * revision lo publica al final: aunque alguien corra el archivo fuera de una
 * transaccion, un examen roto nunca queda a la vista.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { LETRAS, RAIZ, enunciadoFinal, leerExamen, tieneLatex } from './comun.mjs';

const args = process.argv.slice(2);
const conValor = new Set(['--en', '--nombre', '--copia', '--banco-archivo'].map((b) => args.indexOf(b) + 1).filter((i) => i > 0));
const materia = args.find((a, i) => !a.startsWith('--') && !conValor.has(i));
const iEn = args.indexOf('--en');
const destinoExistente = iEn >= 0 ? args[iEn + 1] : null;
const sinBanco = args.includes('--sin-banco');
const valor = (bandera) => { const i = args.indexOf(bandera); return i >= 0 ? args[i + 1] : null; };
const nombre = valor('--nombre');
const copia = valor('--copia');
const bancoArchivo = valor('--banco-archivo');
if (nombre && !/^[a-z0-9_]+$/.test(nombre)) {
  console.error('--nombre solo puede llevar minusculas, numeros y guion bajo.');
  process.exit(2);
}

if (!materia) {
  console.error('Falta la materia. Ejemplo: pnpm generar:simulacros-nuevos espanol');
  process.exit(2);
}

// 1 · Verificar primero.
const verificador = path.join(path.dirname(fileURLToPath(import.meta.url)), 'verificar.mjs');
const v = spawnSync(
  process.execPath,
  [verificador, materia, ...(sinBanco ? [] : ['--exigir-banco']), ...(bancoArchivo ? ['--banco-archivo', bancoArchivo] : [])],
  { stdio: 'inherit' },
);
if (v.status !== 0) {
  console.error('\nEl examen tiene errores: no se genera la migracion.');
  process.exit(1);
}

// 2 · Armar el SQL.
const examen = leerExamen(materia);
const s = examen.simulacro;

// Cadena de SQL con comillas simples dobladas. No se usa dollar-quoting
// porque los enunciados traen LaTeX con signos de dolar: "$c$" cerraria
// una cadena $c$ ... $c$ a la mitad.
const q = (t) => `'${String(t).replace(/'/g, "''")}'`;
const slug = q(s.slug);
// Lo que va dentro de un comentario de SQL, en una sola linea: un salto de
// linea convertiria el resto del texto en codigo que se ejecuta.
const comentario = (t) => String(t ?? '').replace(/[\r\n]+/g, ' ');

const filasItems = examen.items.map((it) =>
  `    (${[q(it.id), it.orden, q(it.tema), q(it.subtema), q(it.nivel), q(enunciadoFinal(it)),
    q(it.explicacion), tieneLatex(it) ? 'true' : 'false'].join(', ')})`,
);

const filasOpciones = examen.items.flatMap((it) =>
  LETRAS.map((l) => `    (${q(it.id)}, ${q(l)}, ${q(it.opciones[l])}, ${l === it.clave ? 'true' : 'false'})`),
);

const codigos = examen.items.map((it) => q(it.id)).join(', ');

const sql = `-- ${comentario(s.titulo)} de ${materia}: ${examen.items.length} items.
-- Generado desde docs/simulacros-nuevos/${materia}.json (version ${comentario(s.version ?? 'sin fecha')}).
${sinBanco ? '-- OJO: generado con --sin-banco. NO se comparo contra el banco publicado:\n-- antes de aplicar, corra pnpm verificar:simulacros-nuevos con la llave de Supabase.\n' : ''}${bancoArchivo ? `-- Comparado contra el banco de ${comentario(path.basename(bancoArchivo))} antes de generar.\n` : ''}
-- Entra como borrador. Lo publica la revision del final, solo si todo calza.
insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  (${slug}, ${q(s.materia)}, ${Number(s.numero)}, ${q(s.titulo)}, ${Number(s.segundos_por_item)}, ${s.barajar_opciones === true ? 'true' : 'false'}, 'borrador')
on conflict (slug) do update set
  materia_slug      = excluded.materia_slug,
  numero            = excluded.numero,
  titulo            = excluded.titulo,
  segundos_por_item = excluded.segundos_por_item,
  barajar_opciones  = excluded.barajar_opciones,
  estado            = 'borrador';

-- Lo que ya no esta en el JSON se va, con sus opciones y estadisticas.
delete from public.simulacro_nuevo_items i
using public.simulacros_nuevos s
where i.simulacro_id = s.id
  and s.slug = ${slug}
  and i.codigo <> all (array[${codigos}]);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
${filasItems.join(',\n')}
) as v (codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
where s.slug = ${slug}
on conflict (simulacro_id, codigo) do update set
  orden       = excluded.orden,
  tema        = excluded.tema,
  subtema     = excluded.subtema,
  nivel       = excluded.nivel,
  enunciado   = excluded.enunciado,
  explicacion = excluded.explicacion,
  tiene_latex = excluded.tiene_latex;

-- Si la clave de un item cambio de letra, la vieja tiene que dejar de ser
-- correcta antes de marcar la nueva: el indice de una sola correcta no
-- espera al final de la carga.
update public.simulacro_nuevo_opciones o
set es_correcta = false
from public.simulacro_nuevo_items i
join public.simulacros_nuevos s on s.id = i.simulacro_id
where o.item_id = i.id
  and s.slug = ${slug};

insert into public.simulacro_nuevo_opciones (item_id, letra, texto, es_correcta)
select i.id, v.letra, v.texto, v.es_correcta
from (values
${filasOpciones.join(',\n')}
) as v (codigo, letra, texto, es_correcta)
join public.simulacro_nuevo_items i on i.codigo = v.codigo
join public.simulacros_nuevos s on s.id = i.simulacro_id and s.slug = ${slug}
on conflict (item_id, letra) do update set
  texto       = excluded.texto,
  es_correcta = excluded.es_correcta;

-- Revision final: si algo no calza, la migracion entera se cae y no queda
-- un examen a medias publicado.
do $revision$
declare
  v_items     integer;
  v_malos     integer;
begin
  select count(*) into v_items
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = ${slug};

  select count(*) into v_malos
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = ${slug}
    and (
      (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id) <> 4
      or (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id and o.es_correcta) <> 1
    );

  if v_items <> ${examen.items.length} then
    raise exception '${s.slug}: quedaron % items y se esperaban ${examen.items.length}', v_items;
  end if;
  if v_malos > 0 then
    raise exception '${s.slug}: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;

  -- Todo calza: ahora si se publica.
  update public.simulacros_nuevos set estado = 'publicado' where slug = ${slug};
end
$revision$;
`;

// 3 · Escribir.
if (destinoExistente) {
  const ruta = path.resolve(RAIZ, destinoExistente);
  const actual = fs.readFileSync(ruta, 'utf8');
  const abre = '-- >>> datos generados';
  const cierra = '-- <<< datos generados';
  const a = actual.indexOf(abre);
  const c = actual.indexOf(cierra);
  if (a < 0 || c < a) {
    console.error(`${destinoExistente} no tiene las marcas "${abre}" y "${cierra}".`);
    process.exit(1);
  }
  const nuevo = `${actual.slice(0, a + abre.length)}\n${sql}${actual.slice(c)}`;
  fs.writeFileSync(ruta, nuevo);
  console.log(`\nBloque de datos reescrito en ${path.relative(RAIZ, ruta)}.`);
} else {
  // La marca de tiempo tiene que quedar DESPUES de la ultima migracion del
  // repo, aunque esa tenga fecha adelantada: si no, la carga se ordenaria
  // antes del esquema y fallaria en una base nueva por falta de tablas.
  const dos = (n) => String(n).padStart(2, '0');
  const aMarca = (f) => `${f.getUTCFullYear()}${dos(f.getUTCMonth() + 1)}${dos(f.getUTCDate())}` +
    `${dos(f.getUTCHours())}${dos(f.getUTCMinutes())}${dos(f.getUTCSeconds())}`;
  const deMarca = (m) => new Date(Date.UTC(+m.slice(0, 4), +m.slice(4, 6) - 1, +m.slice(6, 8), +m.slice(8, 10), +m.slice(10, 12), +m.slice(12, 14)));
  const dirMig = path.join(RAIZ, 'supabase', 'migrations');
  const sufijo = nombre ?? `simulacros_nuevos_${materia.replace(/-/g, '_')}`;
  // Si ya existe una migracion con este nombre, se reescribe ESA y conserva
  // su fecha: volver a generar no tiene que dejar dos cargas del mismo examen.
  const previa = fs.readdirSync(dirMig).find((f) => f.endsWith(`_${sufijo}.sql`) && /^\d{14}_/.test(f));
  let marca;
  if (previa) {
    marca = previa.slice(0, 14);
  } else {
    const ultima = fs.readdirSync(dirMig).map((f) => f.slice(0, 14)).filter((m) => /^\d{14}$/.test(m)).sort().pop();
    let fecha = new Date();
    if (ultima && deMarca(ultima) >= fecha) fecha = new Date(deMarca(ultima).getTime() + 1000);
    marca = aMarca(fecha);
  }
  const ruta = path.join(dirMig, `${marca}_${sufijo}.sql`);

  // Todo o nada: la carga va en una transaccion, y antes de tocar nada se
  // revisa que el esquema de los simulacros nuevos ya este en la base.
  const cuerpo = `begin;

-- El esquema lo crea la migracion del piloto (20261005210000_simulacros_nuevos.sql).
-- Sin esas tablas no hay donde cargar: mejor un mensaje claro que un error raro.
do $esquema$
begin
  if to_regclass('public.simulacros_nuevos') is null
     or to_regclass('public.simulacro_nuevo_items') is null
     or to_regclass('public.simulacro_nuevo_opciones') is null then
    raise exception 'Falta el esquema de los simulacros nuevos: aplique primero la migracion 20261005210000_simulacros_nuevos.sql';
  end if;
end
$esquema$;

${sql}
commit;
`;
  fs.writeFileSync(ruta, cuerpo);
  console.log(`\nMigracion ${previa ? 'reescrita' : 'creada'}: ${path.relative(RAIZ, ruta)}. Revisela y apliquela en Supabase.`);

  if (copia) {
    const nombreMateria = s.titulo ? `${s.titulo} de ${materia}` : materia;
    const encabezado = `-- ============================================================
-- Carga del ${nombreMateria} (${examen.items.length} items) para /simulacros-nuevos.
--
-- QUE HACE
--   Crea o actualiza el examen "${comentario(s.slug)}" con sus ${examen.items.length} preguntas y
--   sus cuatro opciones cada una. Es idempotente: si se corre dos veces, no
--   duplica nada; actualiza por el slug del examen y por el codigo de cada
--   item, y borra los items que ya no esten en el archivo.
--   Todo va dentro de una transaccion: si algo falla, no queda nada a medias.
--   El examen entra como borrador y solo se publica al final, si cada item
--   tiene cuatro opciones y exactamente una correcta.
--
-- ANTES DE CORRERLO
--   Tiene que estar aplicado el esquema de los simulacros nuevos
--   (supabase/migrations/20261005210000_simulacros_nuevos.sql). Si falta,
--   este archivo se detiene con un mensaje y no cambia nada.
--
-- COMO SE USA
--   Se pega completo en el editor SQL de Supabase y se ejecuta. Las dos
--   consultas del final muestran cuantos items quedaron y cuantas veces es
--   clave cada letra.
--
-- Es una copia de supabase/migrations/${path.basename(ruta)}.
-- Se genera con: pnpm generar:simulacros-nuevos ${materia} --copia ...
-- No se edita a mano: se corrige el JSON y se vuelve a generar.
-- ============================================================

`;
    const verificacion = `
-- ------------------------------------------------------------
-- Verificacion: cuantos items quedaron y si el examen se publico.
select s.slug, s.estado, count(i.id) as items
from public.simulacros_nuevos s
left join public.simulacro_nuevo_items i on i.simulacro_id = s.id
where s.slug = ${slug}
group by s.slug, s.estado;

-- Verificacion: cuantas veces es clave cada letra (deben salir ${examen.items.length / 4} de cada una).
select o.letra, count(*) as veces_clave
from public.simulacro_nuevo_opciones o
join public.simulacro_nuevo_items i on i.id = o.item_id
join public.simulacros_nuevos s on s.id = i.simulacro_id
where s.slug = ${slug} and o.es_correcta
group by o.letra
order by o.letra;
`;
    const rutaCopia = path.resolve(RAIZ, copia);
    fs.writeFileSync(rutaCopia, encabezado + cuerpo + verificacion);
    console.log(`Copia para el editor SQL: ${path.relative(RAIZ, rutaCopia)}.`);
  }
}
