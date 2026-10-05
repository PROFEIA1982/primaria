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
const materia = args.find((a) => !a.startsWith('--'));
const iEn = args.indexOf('--en');
const destinoExistente = iEn >= 0 ? args[iEn + 1] : null;
const sinBanco = args.includes('--sin-banco');

if (!materia) {
  console.error('Falta la materia. Ejemplo: pnpm generar:simulacros-nuevos espanol');
  process.exit(2);
}

// 1 · Verificar primero.
const verificador = path.join(path.dirname(fileURLToPath(import.meta.url)), 'verificar.mjs');
const v = spawnSync(
  process.execPath,
  [verificador, materia, ...(sinBanco ? [] : ['--exigir-banco'])],
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
${sinBanco ? '-- OJO: generado con --sin-banco. NO se comparo contra el banco publicado:\n-- antes de aplicar, corra pnpm verificar:simulacros-nuevos con la llave de Supabase.\n' : ''}
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
  const ultima = fs.readdirSync(dirMig).map((f) => f.slice(0, 14)).filter((m) => /^\d{14}$/.test(m)).sort().pop();
  let fecha = new Date();
  if (ultima && deMarca(ultima) >= fecha) fecha = new Date(deMarca(ultima).getTime() + 1000);
  const marca = aMarca(fecha);
  const ruta = path.join(RAIZ, 'supabase', 'migrations', `${marca}_simulacros_nuevos_${materia.replace(/-/g, '_')}.sql`);
  fs.writeFileSync(ruta, sql);
  console.log(`\nMigracion creada: ${path.relative(RAIZ, ruta)}. Revisela y apliquela en Supabase.`);
}
