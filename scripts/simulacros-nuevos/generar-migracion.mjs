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
 * Antes de escribir nada corre el verificador: si el examen tiene errores,
 * no se genera. Un SQL bonito con una clave mala adentro es peor que nada.
 *
 * La carga es idempotente. Actualiza por slug y por codigo de item, borra
 * los items que ya no esten en el JSON y deja una revision al final que
 * revienta la migracion entera si algun item quedo sin sus cuatro opciones
 * o sin exactamente una correcta.
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

if (!materia) {
  console.error('Falta la materia. Ejemplo: pnpm generar:simulacros-nuevos espanol');
  process.exit(2);
}

// 1 · Verificar primero.
const verificador = path.join(path.dirname(fileURLToPath(import.meta.url)), 'verificar.mjs');
const v = spawnSync(process.execPath, [verificador, materia], { stdio: 'inherit' });
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

const filasItems = examen.items.map((it) =>
  `    (${[q(it.id), it.orden, q(it.tema), q(it.subtema), q(it.nivel), q(enunciadoFinal(it)),
    q(it.explicacion), tieneLatex(it) ? 'true' : 'false'].join(', ')})`,
);

const filasOpciones = examen.items.flatMap((it) =>
  LETRAS.map((l) => `    (${q(it.id)}, ${q(l)}, ${q(it.opciones[l])}, ${l === it.clave ? 'true' : 'false'})`),
);

const codigos = examen.items.map((it) => q(it.id)).join(', ');

const sql = `-- ${s.titulo} de ${materia}: ${examen.items.length} items.
-- Generado desde docs/simulacros-nuevos/${materia}.json (version ${s.version ?? 'sin fecha'}).

insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  (${slug}, ${q(s.materia)}, ${s.numero}, ${q(s.titulo)}, ${s.segundos_por_item}, ${s.barajar_opciones ? 'true' : 'false'}, 'publicado')
on conflict (slug) do update set
  materia_slug      = excluded.materia_slug,
  numero            = excluded.numero,
  titulo            = excluded.titulo,
  segundos_por_item = excluded.segundos_por_item,
  barajar_opciones  = excluded.barajar_opciones,
  estado            = excluded.estado;

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
  const ahora = new Date();
  const dos = (n) => String(n).padStart(2, '0');
  const marca = `${ahora.getUTCFullYear()}${dos(ahora.getUTCMonth() + 1)}${dos(ahora.getUTCDate())}` +
    `${dos(ahora.getUTCHours())}${dos(ahora.getUTCMinutes())}${dos(ahora.getUTCSeconds())}`;
  const ruta = path.join(RAIZ, 'supabase', 'migrations', `${marca}_simulacros_nuevos_${materia.replace(/-/g, '_')}.sql`);
  fs.writeFileSync(ruta, sql);
  console.log(`\nMigracion creada: ${path.relative(RAIZ, ruta)}. Revisela y apliquela en Supabase.`);
}
