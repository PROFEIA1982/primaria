-- ============================================================
-- Simulacros nuevos: esquema y piloto de Matematicas.
--
-- QUE TRAE
--   · cuatro tablas propias: simulacros_nuevos, simulacro_nuevo_items,
--     simulacro_nuevo_opciones y simulacro_nuevo_stats
--   · tres funciones para la pagina /simulacros-nuevos: listar, traer un
--     examen y registrar el agregado anonimo al entregar
--   · la carga del examen de Matematicas (40 items), generada desde
--     docs/simulacros-nuevos/matematicas.json
--
-- POR QUE TABLAS APARTE Y NO LA TABLA items DE SIEMPRE
--   Lo que esta en items con estado publicado entra al sorteo de la
--   practica (sortear_items) y a los conteos de la portada. Los simulacros
--   nuevos tienen que ser preguntas que el estudiante NO ha visto en la
--   practica; meterlos en items los mezclaria. Ademas items, opciones y
--   simulacro_items no estan versionados en este repositorio, y escribir
--   una migracion contra columnas que no se pueden ver es adivinar.
--   Estas tablas no tocan nada de lo que ya existe.
--
-- AGREGAR OTRA MATERIA es solo cargar datos: se escribe
-- docs/simulacros-nuevos/<materia>.json y se corre
--     pnpm generar:simulacros-nuevos <materia>
-- que deja una migracion nueva solo con datos. Ver
-- docs/simulacros-nuevos/reglas-items.md.
--
-- SEGURIDAD (RLS en las cuatro tablas)
--   · simulacros_nuevos: lectura publica de los publicados.
--   · simulacro_nuevo_items: lectura publica de los items de un simulacro
--     publicado, por columna: la explicacion NO se puede leer de frente,
--     porque dice cual es la respuesta.
--   · simulacro_nuevo_opciones: cerrada. Tiene es_correcta.
--   · simulacro_nuevo_stats: cerrada, igual que item_stats: abierta le
--     diria al estudiante cuales items son los faciles.
--   Las tres funciones son security definer con search_path vacio y solo
--   entregan lo que la pagina necesita, igual que traer_simulacro.
--
-- Es idempotente: se puede correr dos veces sin romper nada.
-- ============================================================

-- ------------------------------------------------------------
-- 1 · Tablas
-- ------------------------------------------------------------

create table if not exists public.simulacros_nuevos (
  id                bigint generated always as identity primary key,
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  materia_slug      text not null
                    check (materia_slug in ('espanol', 'estudios-sociales', 'ciencias', 'matematicas')),
  numero            smallint not null default 1 check (numero > 0),
  titulo            text not null check (length(trim(titulo)) > 0),
  -- Tres minutos por item. Es dato y no constante del codigo: la pagina lo
  -- lee de aca y asi la tarjeta nunca dice una duracion distinta a la real.
  segundos_por_item integer not null default 180 check (segundos_por_item between 30 and 600),
  -- false: las opciones salen en el orden A, B, C, D con el que se
  -- balancearon las claves. true: el servidor las baraja en cada intento.
  barajar_opciones  boolean not null default false,
  estado            text not null default 'borrador' check (estado in ('borrador', 'publicado')),
  creado_en         timestamptz not null default now(),
  unique (materia_slug, numero)
);

create table if not exists public.simulacro_nuevo_items (
  id            uuid primary key default gen_random_uuid(),
  simulacro_id  bigint not null references public.simulacros_nuevos (id) on delete cascade,
  -- El id del JSON (mat-n01, ...). Es la llave para volver a cargar los
  -- datos sin duplicar: la carga actualiza por codigo.
  codigo        text not null,
  orden         smallint not null check (orden > 0),
  tema          text not null,
  subtema       text not null,
  nivel         text not null check (nivel in ('intermedio', 'alto')),
  enunciado     text not null,
  explicacion   text not null,
  tiene_latex   boolean not null default false,
  constraint simulacro_nuevo_items_codigo_unico unique (simulacro_id, codigo),
  -- Diferida: al reordenar un examen, dos items se cambian de puesto dentro
  -- de la misma carga y por un instante comparten numero.
  constraint simulacro_nuevo_items_orden_unico unique (simulacro_id, orden)
    deferrable initially deferred
);

create table if not exists public.simulacro_nuevo_opciones (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.simulacro_nuevo_items (id) on delete cascade,
  letra        char(1) not null check (letra in ('A', 'B', 'C', 'D')),
  texto        text not null check (length(trim(texto)) > 0),
  es_correcta  boolean not null default false,
  constraint simulacro_nuevo_opciones_letra_unica unique (item_id, letra)
);

-- Una sola correcta por item, garantizado por la base y no solo por el JSON.
create unique index if not exists simulacro_nuevo_opciones_una_correcta
  on public.simulacro_nuevo_opciones (item_id) where es_correcta;

create index if not exists simulacro_nuevo_items_simulacro
  on public.simulacro_nuevo_items (simulacro_id, orden);

-- El agregado anonimo: cuantas veces se contesto cada item y cuantas bien.
-- Sin nada que identifique a nadie, igual que las estadisticas de siempre.
create table if not exists public.simulacro_nuevo_stats (
  item_id         uuid primary key references public.simulacro_nuevo_items (id) on delete cascade,
  intentos        integer not null default 0 check (intentos >= 0),
  aciertos        integer not null default 0 check (aciertos >= 0),
  actualizado_en  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2 · RLS y permisos
-- ------------------------------------------------------------

alter table public.simulacros_nuevos        enable row level security;
alter table public.simulacro_nuevo_items    enable row level security;
alter table public.simulacro_nuevo_opciones enable row level security;
alter table public.simulacro_nuevo_stats    enable row level security;

-- Supabase le da todo a anon y authenticated en cada tabla nueva de public.
-- Se quita y se devuelve solo lo que hace falta.
revoke all on table
  public.simulacros_nuevos,
  public.simulacro_nuevo_items,
  public.simulacro_nuevo_opciones,
  public.simulacro_nuevo_stats
from anon, authenticated;

grant select on table public.simulacros_nuevos to anon, authenticated;
-- Por columna: todo menos la explicacion.
grant select (id, simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, tiene_latex)
  on table public.simulacro_nuevo_items to anon, authenticated;

drop policy if exists "simulacros nuevos publicados" on public.simulacros_nuevos;
create policy "simulacros nuevos publicados"
  on public.simulacros_nuevos for select
  to anon, authenticated
  using (estado = 'publicado');

drop policy if exists "items de simulacros nuevos publicados" on public.simulacro_nuevo_items;
create policy "items de simulacros nuevos publicados"
  on public.simulacro_nuevo_items for select
  to anon, authenticated
  using (exists (
    select 1 from public.simulacros_nuevos s
    where s.id = simulacro_id and s.estado = 'publicado'
  ));

-- simulacro_nuevo_opciones y simulacro_nuevo_stats quedan sin politicas:
-- RLS activo y ninguna excepcion, o sea cerradas para el navegador.

-- ------------------------------------------------------------
-- 3 · Funciones
-- ------------------------------------------------------------

-- La lista de examenes publicados, con lo que la tarjeta necesita para
-- decir que trae y cuanto dura. Los temas salen en el orden del examen.
create or replace function public.listar_simulacros_nuevos()
returns table (
  slug              text,
  numero            smallint,
  titulo            text,
  materia_slug      text,
  cantidad          integer,
  segundos_por_item integer,
  temas             text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.slug,
    s.numero,
    s.titulo,
    s.materia_slug,
    (select count(*)::integer from public.simulacro_nuevo_items i where i.simulacro_id = s.id),
    s.segundos_por_item,
    coalesce(
      (select array_agg(t.tema order by t.primero)
         from (select i.tema, min(i.orden) as primero
                 from public.simulacro_nuevo_items i
                where i.simulacro_id = s.id
                group by i.tema) t),
      '{}'::text[])
  from public.simulacros_nuevos s
  where s.estado = 'publicado'
  order by s.materia_slug, s.numero;
$$;

-- Un examen completo, con la misma forma que devuelve traer_simulacro, para
-- que el motor del simulacro lo use sin cambios. Devuelve null si el slug
-- no existe o no esta publicado.
--
-- Trae es_correcta y la explicacion porque el motor califica en el aparato
-- del estudiante y le muestra la revision al entregar: es el mismo trato
-- que ya tienen los cuadernillos de siempre.
--
-- volatile y no stable: cuando el examen baraja opciones usa random().
create or replace function public.traer_simulacro_nuevo(p_slug text)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', s.slug,
    'numero', s.numero,
    'titulo', s.titulo,
    'materia_slug', s.materia_slug,
    'materia_nombre', null,
    'segundos_por_item', s.segundos_por_item,
    'items', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'id', i.id,
                 'enunciado', i.enunciado,
                 'imagen_url', null,
                 'imagen_alt', null,
                 'tiene_latex', i.tiene_latex,
                 'retroalimentacion', i.explicacion,
                 'tema_id', null,
                 'tema', i.tema,
                 'opciones', coalesce((
                   select jsonb_agg(
                            jsonb_build_object('id', o.id, 'texto', o.texto, 'es_correcta', o.es_correcta)
                            order by case when s.barajar_opciones then random() end, o.letra)
                     from public.simulacro_nuevo_opciones o
                    where o.item_id = i.id), '[]'::jsonb)
               )
               order by i.orden)
        from public.simulacro_nuevo_items i
       where i.simulacro_id = s.id), '[]'::jsonb)
  )
  from public.simulacros_nuevos s
  where s.slug = p_slug
    and s.estado = 'publicado';
$$;

-- El agregado anonimo al entregar: suma un intento por item y un acierto si
-- acerto. Lo que no calza (ids raros, items de borradores, listas de mas de
-- cien) se ignora en silencio: esto no es dato critico y el estudiante no
-- tiene por que ver un error por eso. Cada item cuenta una vez por llamada.
create or replace function public.registrar_resultados_simulacro_nuevo(p_resultados jsonb)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_resultados is null
     or jsonb_typeof(p_resultados) <> 'array'
     or jsonb_array_length(p_resultados) > 100 then
    return;
  end if;

  insert into public.simulacro_nuevo_stats as st (item_id, intentos, aciertos, actualizado_en)
  select i.id, 1, case when r.acerto then 1 else 0 end, now()
  from (
    select distinct on (e ->> 'item_id')
           (e ->> 'item_id') as item_id,
           (e -> 'acerto') = 'true'::jsonb as acerto
      from jsonb_array_elements(p_resultados) as e
     where jsonb_typeof(e) = 'object'
       and (e ->> 'item_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ) as r
  join public.simulacro_nuevo_items i on i.id = r.item_id::uuid
  join public.simulacros_nuevos s on s.id = i.simulacro_id and s.estado = 'publicado'
  on conflict (item_id) do update
    set intentos       = st.intentos + excluded.intentos,
        aciertos       = st.aciertos + excluded.aciertos,
        actualizado_en = now();
end;
$$;

revoke all on function public.listar_simulacros_nuevos() from public;
revoke all on function public.traer_simulacro_nuevo(text) from public;
revoke all on function public.registrar_resultados_simulacro_nuevo(jsonb) from public;
grant execute on function public.listar_simulacros_nuevos() to anon, authenticated;
grant execute on function public.traer_simulacro_nuevo(text) to anon, authenticated;
grant execute on function public.registrar_resultados_simulacro_nuevo(jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 4 · Datos
-- Lo que sigue lo escribe scripts/simulacros-nuevos/generar-migracion.mjs.
-- No se edita a mano: se corrige el JSON y se vuelve a generar.
-- ------------------------------------------------------------

-- >>> datos generados
-- Simulacro nuevo 1 de matematicas: 40 items.
-- Generado desde docs/simulacros-nuevos/matematicas.json (version 2026-10-05).

insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  ('nuevo-matematicas-1', 'matematicas', 1, 'Simulacro nuevo 1', 180, false, 'publicado')
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
  and s.slug = 'nuevo-matematicas-1'
  and i.codigo <> all (array['mat-n09', 'mat-n10', 'mat-n08', 'mat-n11', 'mat-n03', 'mat-n02', 'mat-n01', 'mat-n05', 'mat-n04', 'mat-n06', 'mat-n07', 'mat-n12', 'mat-m01', 'mat-m07', 'mat-m03', 'mat-m04', 'mat-m06', 'mat-m05', 'mat-m02', 'mat-g06', 'mat-g01', 'mat-g07', 'mat-g05', 'mat-g02', 'mat-g03', 'mat-g08', 'mat-g04', 'mat-r06', 'mat-r01', 'mat-r04', 'mat-r05', 'mat-r02', 'mat-r03', 'mat-e04', 'mat-e07', 'mat-e06', 'mat-e02', 'mat-e01', 'mat-e03', 'mat-e05']);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
    ('mat-n09', 1, 'Números', 'Porcentajes', 'intermedio', 'Una camisa del uniforme cuesta ₡8500 y tiene un descuento del 20 %. ¿Cuánto se paga por la camisa con el descuento?', 'El 20 % de 8500 es 8500 × 20 ÷ 100 = 1700, y eso es lo que se rebaja. Entonces se paga 8500 − 1700 = 6800 colones.', false),
    ('mat-n10', 2, 'Números', 'Operaciones combinadas con potencias', 'intermedio', '¿Cuál es el resultado de la siguiente operación?

$$2^3 + 4 \times 3^2 - 10 \div 2$$', 'Primero van las potencias: 2³ = 8 y 3² = 9. Luego las multiplicaciones y divisiones: 4 × 9 = 36 y 10 ÷ 2 = 5. Por último, de izquierda a derecha: 8 + 36 − 5 = 39.', true),
    ('mat-n08', 3, 'Números', 'Operaciones con números decimales', 'intermedio', 'En la feria del agricultor, Andrés compró 2,5 kg de papas a ₡840 el kilogramo y 1,25 kg de zanahorias a ₡720 el kilogramo. ¿Cuánto pagó en total?', 'Las papas cuestan 2,5 × 840 = 2100 colones y las zanahorias 1,25 × 720 = 900 colones. Sumando, 2100 + 900 = 3000. El medio kilo y el cuarto de kilo también se pagan.', false),
    ('mat-n11', 4, 'Números', 'Múltiplos y divisibilidad', 'alto', 'Keylor tiene entre 30 y 50 bolinchas. Si las acomoda en grupos de 6 no le sobra ninguna, y si las acomoda en grupos de 8 tampoco le sobra ninguna. ¿Cuántas bolinchas tiene?', 'La cantidad tiene que ser múltiplo de 6 y de 8 a la vez, o sea, múltiplo de 24. Entre 30 y 50 el único es 48: 48 ÷ 6 = 8 y 48 ÷ 8 = 6, sin que sobre nada.', false),
    ('mat-n03', 5, 'Números', 'Máximo común divisor', 'alto', 'Para la huerta escolar, don Rafael tiene 48 matas de chile dulce y 72 matas de tomate. Quiere sembrarlas en filas que tengan todas la misma cantidad de matas, sin mezclar chile con tomate y con la mayor cantidad posible de matas en cada fila. ¿Cuántas filas tendrá en total?', 'El número más grande que divide exacto a 48 y a 72 es 24, su máximo común divisor: cada fila lleva 24 matas. Así quedan 48 ÷ 24 = 2 filas de chile y 72 ÷ 24 = 3 filas de tomate, o sea 5 filas en total.', false),
    ('mat-n02', 6, 'Números', 'Mínimo común múltiplo', 'alto', 'Desde la terminal de buses de Guápiles salen dos rutas a las 6:00 a. m. La ruta 1 sale cada 12 minutos y la ruta 2 sale cada 18 minutos. ¿A qué hora vuelven a salir juntas por primera vez?', 'Hay que buscar el primer número que esté en la tabla del 12 y también en la del 18: ese es el mínimo común múltiplo, 36. Por eso las dos rutas vuelven a salir juntas 36 minutos después, a las 6:36 a. m.', false),
    ('mat-n01', 7, 'Números', 'Operaciones combinadas con números naturales', 'intermedio', 'En la soda de la escuela, Mariela compró 3 empanadas de ₡650 cada una y 2 refrescos naturales de ₡450 cada uno. Pagó con un billete de ₡5000. ¿Cuánto dinero le devolvieron?', 'Primero se calcula lo que gastó: 3 × 650 = 1950 y 2 × 450 = 900, en total ₡2850. Después se resta del billete: 5000 − 2850 = 2150. Ese es el vuelto.', false),
    ('mat-n05', 8, 'Números', 'Suma y resta de fracciones', 'intermedio', 'Valeria pintó $\frac{2}{5}$ de un mural de la escuela el lunes y $\frac{1}{3}$ del mismo mural el martes. ¿Qué fracción del mural le falta por pintar?', 'Para sumar fracciones con distinto denominador se buscan equivalentes: 2/5 = 6/15 y 1/3 = 5/15, así que ya pintó 11/15. El mural completo es 15/15, entonces le falta 15/15 − 11/15 = 4/15.', true),
    ('mat-n04', 9, 'Números', 'Números primos y compuestos', 'intermedio', 'Josué asegura: «Todos los números impares mayores que 15 son primos». ¿Cuál de los siguientes números demuestra que Josué está equivocado?', 'Un número primo solo se divide exacto entre 1 y entre sí mismo. El 33 es impar y mayor que 15, pero también se divide entre 3 y entre 11, porque 3 × 11 = 33. Por eso no es primo, y con él se demuestra que Josué se equivoca.', false),
    ('mat-n06', 10, 'Números', 'Fracción de una cantidad', 'alto', 'En un grupo de sexto hay 30 estudiantes. Las $\frac{2}{3}$ partes del grupo participan en la feria científica y, de quienes participan, $\frac{3}{5}$ presentan un proyecto sobre el agua. ¿Cuántos estudiantes presentan un proyecto sobre el agua?', 'Primero se calcula cuántos participan: 2/3 de 30 es 20. Después se saca 3/5 de esos 20, que da 12. Ojo: el 3/5 se aplica a quienes participan, no a todo el grupo.', true),
    ('mat-n07', 11, 'Números', 'División de fracciones', 'intermedio', 'Una botella tiene $\frac{2}{3}$ de litro de fresco de cas. Si se sirve en vasos de $\frac{1}{6}$ de litro cada uno, ¿cuántos vasos se llenan?', 'Hay que ver cuántas veces cabe 1/6 dentro de 2/3. Como 2/3 es lo mismo que 4/6, caben 4 vasos: 2/3 ÷ 1/6 = 4.', true),
    ('mat-n12', 12, 'Números', 'Comparación de fracciones', 'alto', 'Tres amigas compraron una pizza cada una, todas del mismo tamaño. Sofía comió $\frac{3}{8}$ de su pizza, Jimena comió $\frac{2}{5}$ de la suya y Yerlin comió $\frac{1}{3}$ de la suya. ¿Cuál es el orden correcto, de la que comió más a la que comió menos?', 'Para comparar se pueden pasar a decimales: 3/8 = 0,375; 2/5 = 0,4 y 1/3 es casi 0,33. Por eso Jimena comió más, luego Sofía y de última Yerlin. Fijate que el numerador más grande no siempre gana.', true),
    ('mat-m01', 13, 'Medidas', 'Conversión de medidas de longitud', 'intermedio', 'Para decorar el desfile del 15 de setiembre, la escuela necesita 4 cintas de 2,75 m cada una. Si compra un rollo de 12 m, ¿cuántos centímetros de cinta le sobran?', 'Las 4 cintas miden 4 × 2,75 = 11 m, así que sobra 12 − 11 = 1 m. Como 1 m tiene 100 cm, sobran 100 centímetros.', false),
    ('mat-m07', 14, 'Medidas', 'Volumen de prismas rectangulares', 'alto', 'La caja de la figura tiene forma de prisma rectangular. Por dentro mide 20 cm de largo, 10 cm de ancho y 15 cm de alto.

![Caja con forma de prisma rectangular. Mide 20 cm de largo, 10 cm de ancho y 15 cm de alto. A un lado hay un cubito de 5 cm de arista.](/simulacros-nuevos/mat-m07-caja.svg)

¿Cuántos cubitos de 5 cm de arista caben dentro de la caja, sin que queden espacios?', 'A lo largo caben 20 ÷ 5 = 4 cubitos, a lo ancho 10 ÷ 5 = 2 y a lo alto 15 ÷ 5 = 3. En total son 4 × 2 × 3 = 24 cubitos. También sale dividiendo el volumen de la caja, 3000 cm³, entre el de un cubito, 125 cm³.', false),
    ('mat-m03', 15, 'Medidas', 'Medidas de capacidad', 'intermedio', 'Una pichinga tiene 3 L de agua. Con ella se llenan 8 vasos de 250 mL cada uno. ¿Cuántos mililitros de agua quedan en la pichinga?', '3 L son 3000 mL. Los 8 vasos usan 8 × 250 = 2000 mL. Quedan 3000 − 2000 = 1000 mL, que es lo mismo que 1 litro.', false),
    ('mat-m04', 16, 'Medidas', 'Medidas de tiempo', 'alto', 'Un partido de fútbol entre dos escuelas empezó a las 2:50 p. m. Tuvo dos tiempos de 35 minutos cada uno y un descanso de 15 minutos entre ellos. ¿A qué hora terminó el partido?', 'El partido duró 35 + 15 + 35 = 85 minutos, que es 1 hora y 25 minutos. A las 2:50 p. m. se le suma 1 hora y llegamos a las 3:50; con 25 minutos más son las 4:15 p. m.', false),
    ('mat-m06', 17, 'Medidas', 'Problemas con medidas de longitud', 'intermedio', 'Fabián camina 750 m de su casa a la escuela y la misma distancia de regreso, de lunes a viernes. ¿Cuántos kilómetros camina en total durante esos cinco días?', 'Cada día camina 750 + 750 = 1500 m. En cinco días son 1500 × 5 = 7500 m. Como 1 km tiene 1000 m, eso es 7,5 km.', false),
    ('mat-m05', 18, 'Medidas', 'Medidas de superficie', 'alto', 'El piso de un aula mide 8 m de largo y 6 m de ancho. ¿Cuál es el área del piso en centímetros cuadrados?', 'El área es 8 × 6 = 48 m². Cada metro cuadrado es un cuadro de 100 cm por 100 cm, o sea 10 000 cm². Entonces el piso mide 48 × 10 000 = 480 000 cm².', false),
    ('mat-m02', 19, 'Medidas', 'Conversión de medidas de masa', 'intermedio', 'Doña Lucía empaca 3,6 kg de frijoles en bolsas de 450 g cada una. ¿Cuántas bolsas llena?', 'Primero se pasa todo a la misma unidad: 3,6 kg son 3600 g. Luego se reparte: 3600 ÷ 450 = 8 bolsas.', false),
    ('mat-g06', 20, 'Geometría', 'Área de figuras compuestas', 'intermedio', 'La figura representa el terreno de una escuela, con sus medidas en metros.

![Terreno con forma de L. Abajo mide 10 m y a la izquierda mide 8 m. Arriba mide 6 m; de ahí baja 3 m, sigue 4 m hacia la derecha y baja 5 m por el lado derecho hasta la base.](/simulacros-nuevos/mat-g06-terreno.svg)

¿Cuál es el área del terreno?', 'Se puede partir en dos rectángulos: uno de 6 m por 8 m, que da 48 m², y otro de 4 m por 5 m, que da 20 m². Sumados son 48 + 20 = 68 m². También sale restando: 10 × 8 − 4 × 3 = 68.', false),
    ('mat-g01', 21, 'Geometría', 'Longitud de la circunferencia', 'alto', 'La huerta de la escuela tiene forma de círculo y mide 10 m de diámetro, como se ve en la figura.

![Círculo que representa la huerta. Una línea lo cruza por el centro, de un borde al otro, y está rotulada: diámetro 10 m.](/simulacros-nuevos/mat-g01-huerta.svg)

Se quiere poner malla alrededor de toda la huerta y cada metro de malla cuesta ₡1500. Si se usa $\pi \approx 3{,}14$, ¿cuánto cuesta la malla?', 'La malla va por el borde del círculo, que se calcula con π × diámetro: 3,14 × 10 = 31,4 m. Después se multiplica por el precio: 31,4 × 1500 = 47 100 colones.', true),
    ('mat-g07', 22, 'Geometría', 'Área del triángulo', 'intermedio', 'Para la fiesta de la escuela se van a coser 12 banderines con forma de triángulo. Cada banderín tiene 30 cm de base y 40 cm de altura. ¿Cuánta tela se necesita para los 12 banderines, sin contar desperdicios?', 'El área de un triángulo es base por altura entre 2: 30 × 40 ÷ 2 = 600 cm² por banderín. Para 12 banderines se necesitan 600 × 12 = 7200 cm².', false),
    ('mat-g05', 23, 'Geometría', 'Desarrollo plano de cuerpos sólidos', 'intermedio', 'La figura muestra el patrón que Jimena recortó en cartulina.

![Patrón de cartulina: tres rectángulos iguales en fila, uno al lado del otro, y un triángulo pegado arriba y otro abajo del rectángulo del centro. Las líneas donde se dobla están punteadas.](/simulacros-nuevos/mat-g05-patron.svg)

Si lo dobla por las líneas punteadas y lo arma, ¿qué cuerpo sólido se forma?', 'Los dos triángulos iguales son las bases, una de cada lado, y los tres rectángulos forman las caras de alrededor. Un cuerpo con dos bases iguales y caras rectangulares es un prisma, y aquí sus bases son triángulos.', false),
    ('mat-g02', 24, 'Geometría', 'Ángulos internos del triángulo', 'alto', 'Un triángulo isósceles tiene dos ángulos iguales y el ángulo distinto mide 40°. ¿Cuánto mide cada uno de los ángulos iguales?', 'Los tres ángulos de cualquier triángulo suman 180°. Si uno mide 40°, a los otros dos les quedan 180 − 40 = 140°, y como son iguales, cada uno mide 140 ÷ 2 = 70°.', false),
    ('mat-g03', 25, 'Geometría', 'Clasificación de cuadriláteros', 'intermedio', 'Un cuadrilátero tiene dos pares de lados paralelos, sus cuatro lados miden lo mismo y ninguno de sus ángulos es recto. ¿Qué cuadrilátero es?', 'Tener los cuatro lados iguales deja por fuera al romboide y al trapecio. Entre el cuadrado y el rombo, la pista es que no tiene ángulos rectos: el cuadrado sí los tiene, así que la figura es un rombo.', false),
    ('mat-g08', 26, 'Geometría', 'Perímetro de polígonos regulares', 'alto', 'Con un alambre, Esteban formó un pentágono regular de 18 cm de lado. Después lo desarmó y, con todo el alambre, formó un hexágono regular. ¿Cuánto mide cada lado del hexágono?', 'El alambre mide lo mismo que el perímetro del pentágono: 5 × 18 = 90 cm. Al repartir esos 90 cm en los 6 lados iguales del hexágono, cada lado mide 90 ÷ 6 = 15 cm.', false),
    ('mat-g04', 27, 'Geometría', 'Elementos de los cuerpos sólidos', 'alto', 'Una pirámide tiene como base un hexágono. ¿Cuántas aristas tiene en total?', 'La base hexagonal tiene 6 aristas, y de cada vértice de la base sale una arista que sube hasta la punta: 6 más. En total son 6 + 6 = 12 aristas.', false),
    ('mat-r06', 28, 'Relaciones y álgebra', 'Ecuaciones con balanzas', 'intermedio', 'La balanza de la figura está en equilibrio. En el platillo de la izquierda hay 3 cajas iguales y una pesa de 2 kg; en el de la derecha hay una pesa de 14 kg.

![Balanza de dos platillos, nivelada. En el platillo izquierdo hay tres cajas iguales y una pesa de 2 kg. En el platillo derecho hay una pesa de 14 kg.](/simulacros-nuevos/mat-r06-balanza.svg)

¿Cuánto pesa cada caja?', 'Si se quitan 2 kg de cada lado, la balanza sigue en equilibrio: las 3 cajas pesan 14 − 2 = 12 kg. Entonces cada caja pesa 12 ÷ 3 = 4 kg.', false),
    ('mat-r01', 29, 'Relaciones y álgebra', 'Patrones y sucesiones con figuras', 'alto', 'Con palillos se forman las figuras que se muestran: la figura 1 tiene un cuadrado, la figura 2 tiene dos cuadrados unidos y la figura 3 tiene tres.

![Tres figuras hechas con palillos. Figura 1: un cuadrado de 4 palillos. Figura 2: dos cuadrados unidos por un lado, 7 palillos. Figura 3: tres cuadrados en fila, 10 palillos.](/simulacros-nuevos/mat-r01-palillos.svg)

Si se sigue el mismo patrón, ¿cuántos palillos se necesitan para la figura 15?', 'La figura 1 usa 4 palillos y cada cuadrado nuevo agrega solo 3, porque comparte un lado con el anterior. Así, la figura 15 usa 4 + 3 × 14 = 46 palillos.', false),
    ('mat-r04', 30, 'Relaciones y álgebra', 'Expresiones con variables', 'alto', 'En una librería, un cuaderno cuesta $c$ colones y un lapicero cuesta ₡300 menos que un cuaderno. ¿Cuál expresión representa lo que se paga por 2 cuadernos y 3 lapiceros?', 'Cada lapicero cuesta c − 300. Los 2 cuadernos son 2c y los 3 lapiceros son 3 × (c − 300) = 3c − 900. Sumando todo: 2c + 3c − 900 = 5c − 900.', true),
    ('mat-r05', 31, 'Relaciones y álgebra', 'Sucesiones numéricas', 'alto', 'En la sucesión 3, 7, 15, 31, 63, …, ¿cuál es el número que sigue?', 'Las diferencias entre un número y el siguiente se van duplicando: 4, 8, 16, 32. La próxima diferencia es 64, así que sigue 63 + 64 = 127. Otra forma de verlo: cada número es el anterior por 2, más 1.', false),
    ('mat-r02', 32, 'Relaciones y álgebra', 'Ecuaciones', 'intermedio', 'Daniela pensó un número, lo multiplicó por 4 y al resultado le restó 7. Al final obtuvo 33. ¿Qué número pensó Daniela?', 'Se deshacen los pasos al revés: si al restarle 7 quedó 33, antes era 33 + 7 = 40. Y si 40 salió de multiplicar por 4, el número era 40 ÷ 4 = 10. Comprobación: 10 × 4 − 7 = 33.', false),
    ('mat-r03', 33, 'Relaciones y álgebra', 'Proporcionalidad directa', 'intermedio', 'En una tortillería, con 3 kg de masa se hacen 48 tortillas. Si la cantidad de tortillas es proporcional a la masa, ¿cuántas tortillas se hacen con 5 kg de masa?', 'Primero se averigua cuántas salen con 1 kg: 48 ÷ 3 = 16 tortillas. Con 5 kg salen 16 × 5 = 80 tortillas.', false),
    ('mat-e04', 34, 'Estadística y probabilidad', 'Probabilidad de un evento', 'intermedio', 'En una bolsa hay 5 bolitas rojas, 3 azules y 4 verdes, todas del mismo tamaño. Si se saca una bolita sin ver, ¿cuál es la probabilidad de que sea azul?', 'En total hay 5 + 3 + 4 = 12 bolitas y 3 son azules. La probabilidad es 3/12, que simplificada es 1/4.', true),
    ('mat-e07', 35, 'Estadística y probabilidad', 'Promedio y moda', 'intermedio', 'Durante cinco días, una pulpería vendió esta cantidad de helados: lunes 12, martes 15, miércoles 9, jueves 15 y viernes 14. ¿Cuál de las siguientes afirmaciones es verdadera?', 'La moda es el dato que más se repite: el 15 aparece dos veces. El promedio se saca sumando todo y dividiendo entre la cantidad de días: 65 ÷ 5 = 13.', false),
    ('mat-e06', 36, 'Estadística y probabilidad', 'Pictogramas', 'alto', 'El pictograma muestra los kilogramos de fruta que vendió un puesto de la feria en una mañana. Cada círculo completo representa 6 kg.

![Pictograma de fruta vendida, donde cada círculo completo vale 6 kg. Mango: 4 círculos. Papaya: 2 círculos y medio círculo. Piña: 3 círculos.](/simulacros-nuevos/mat-e06-frutas.svg)

¿Cuántos kilogramos más de mango que de papaya se vendieron?', 'Mango tiene 4 círculos, o sea 4 × 6 = 24 kg. Papaya tiene 2 círculos y medio: 2,5 × 6 = 15 kg. La diferencia es 24 − 15 = 9 kg.', false),
    ('mat-e02', 37, 'Estadística y probabilidad', 'Gráficos de barras', 'alto', 'El gráfico muestra la cantidad de libros que leyó cada grupo de sexto durante un mes.

![Gráfico de barras de los libros leídos en un mes por cada grupo de sexto: 6-1 leyó 24, 6-2 leyó 30, 6-3 leyó 18 y 6-4 leyó 28.](/simulacros-nuevos/mat-e02-libros.svg)

¿Qué porcentaje del total de libros leyó el grupo 6-4?', 'Entre los cuatro grupos leyeron 24 + 30 + 18 + 28 = 100 libros. Como el total es 100, los 28 libros del grupo 6-4 son el 28 % del total.', false),
    ('mat-e01', 38, 'Estadística y probabilidad', 'Promedio', 'alto', 'Las notas de Esteban en cinco pruebas cortas fueron 88, 90, 76, 94 y 82. ¿Qué nota necesita en la sexta prueba para que el promedio de las seis sea 87?', 'Para tener promedio 87 en seis pruebas, las seis notas deben sumar 87 × 6 = 522. Las cinco que ya tiene suman 430, así que en la sexta necesita 522 − 430 = 92.', false),
    ('mat-e03', 39, 'Estadística y probabilidad', 'Moda', 'intermedio', 'La tabla muestra cuántos hermanos tienen los estudiantes de un grupo de sexto.

| Cantidad de hermanos | Cantidad de estudiantes |
| --- | --- |
| 0 | 3 |
| 1 | 8 |
| 2 | 6 |
| 3 | 2 |
| 4 | 1 |

¿Cuál es la moda de la cantidad de hermanos?', 'La moda es el dato que más se repite. Tener 1 hermano es lo que más aparece, en 8 estudiantes. El 8 no es la moda: es cuántas veces se repite el dato.', false),
    ('mat-e05', 40, 'Estadística y probabilidad', 'Comparación de probabilidades', 'alto', 'Para una rifa del comité de padres hay dos cajas. En la caja A hay 20 boletos y 4 tienen premio. En la caja B hay 12 boletos y 3 tienen premio. Si solo se puede sacar un boleto de una caja, ¿en cuál es más probable ganar y por qué?', 'Lo que importa es qué parte de cada caja tiene premio. En la A gana 4 de 20, o sea 1 de cada 5 boletos; en la B gana 3 de 12, o sea 1 de cada 4. Como 1/4 es mayor que 1/5, es más probable ganar sacando de la caja B.', false)
) as v (codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
where s.slug = 'nuevo-matematicas-1'
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
  and s.slug = 'nuevo-matematicas-1';

insert into public.simulacro_nuevo_opciones (item_id, letra, texto, es_correcta)
select i.id, v.letra, v.texto, v.es_correcta
from (values
    ('mat-n09', 'A', '₡1700', false),
    ('mat-n09', 'B', '₡6800', true),
    ('mat-n09', 'C', '₡8330', false),
    ('mat-n09', 'D', '₡8480', false),
    ('mat-n10', 'A', '25', false),
    ('mat-n10', 'B', '27', false),
    ('mat-n10', 'C', '39', true),
    ('mat-n10', 'D', '49', false),
    ('mat-n08', 'A', '₡2100', false),
    ('mat-n08', 'B', '₡2400', false),
    ('mat-n08', 'C', '₡2820', false),
    ('mat-n08', 'D', '₡3000', true),
    ('mat-n11', 'A', '32', false),
    ('mat-n11', 'B', '36', false),
    ('mat-n11', 'C', '40', false),
    ('mat-n11', 'D', '48', true),
    ('mat-n03', 'A', '5 filas', true),
    ('mat-n03', 'B', '10 filas', false),
    ('mat-n03', 'C', '24 filas', false),
    ('mat-n03', 'D', '144 filas', false),
    ('mat-n02', 'A', '6:06 a. m.', false),
    ('mat-n02', 'B', '6:24 a. m.', false),
    ('mat-n02', 'C', '6:30 a. m.', false),
    ('mat-n02', 'D', '6:36 a. m.', true),
    ('mat-n01', 'A', '₡1700', false),
    ('mat-n01', 'B', '₡2150', true),
    ('mat-n01', 'C', '₡2350', false),
    ('mat-n01', 'D', '₡2850', false),
    ('mat-n05', 'A', '$\frac{4}{15}$', true),
    ('mat-n05', 'B', '$\frac{3}{8}$', false),
    ('mat-n05', 'C', '$\frac{5}{8}$', false),
    ('mat-n05', 'D', '$\frac{11}{15}$', false),
    ('mat-n04', 'A', '19', false),
    ('mat-n04', 'B', '23', false),
    ('mat-n04', 'C', '29', false),
    ('mat-n04', 'D', '33', true),
    ('mat-n06', 'A', '8 estudiantes', false),
    ('mat-n06', 'B', '12 estudiantes', true),
    ('mat-n06', 'C', '18 estudiantes', false),
    ('mat-n06', 'D', '20 estudiantes', false),
    ('mat-n07', 'A', '2 vasos', false),
    ('mat-n07', 'B', '3 vasos', false),
    ('mat-n07', 'C', '4 vasos', true),
    ('mat-n07', 'D', '6 vasos', false),
    ('mat-n12', 'A', 'Sofía, Jimena y Yerlin', false),
    ('mat-n12', 'B', 'Yerlin, Jimena y Sofía', false),
    ('mat-n12', 'C', 'Yerlin, Sofía y Jimena', false),
    ('mat-n12', 'D', 'Jimena, Sofía y Yerlin', true),
    ('mat-m01', 'A', '1 cm', false),
    ('mat-m01', 'B', '10 cm', false),
    ('mat-m01', 'C', '100 cm', true),
    ('mat-m01', 'D', '1000 cm', false),
    ('mat-m07', 'A', '24 cubitos', true),
    ('mat-m07', 'B', '120 cubitos', false),
    ('mat-m07', 'C', '600 cubitos', false),
    ('mat-m07', 'D', '3000 cubitos', false),
    ('mat-m03', 'A', '1000 mL', true),
    ('mat-m03', 'B', '2000 mL', false),
    ('mat-m03', 'C', '2750 mL', false),
    ('mat-m03', 'D', '2800 mL', false),
    ('mat-m04', 'A', '3:40 p. m.', false),
    ('mat-m04', 'B', '4:00 p. m.', false),
    ('mat-m04', 'C', '4:15 p. m.', true),
    ('mat-m04', 'D', '4:30 p. m.', false),
    ('mat-m06', 'A', '0,75 km', false),
    ('mat-m06', 'B', '1,5 km', false),
    ('mat-m06', 'C', '3,75 km', false),
    ('mat-m06', 'D', '7,5 km', true),
    ('mat-m05', 'A', '4800 cm²', false),
    ('mat-m05', 'B', '48 000 cm²', false),
    ('mat-m05', 'C', '480 000 cm²', true),
    ('mat-m05', 'D', '4 800 000 cm²', false),
    ('mat-m02', 'A', '8 bolsas', true),
    ('mat-m02', 'B', '80 bolsas', false),
    ('mat-m02', 'C', '125 bolsas', false),
    ('mat-m02', 'D', '800 bolsas', false),
    ('mat-g06', 'A', '36 m²', false),
    ('mat-g06', 'B', '68 m²', true),
    ('mat-g06', 'C', '80 m²', false),
    ('mat-g06', 'D', '92 m²', false),
    ('mat-g01', 'A', '₡23 550', false),
    ('mat-g01', 'B', '₡47 100', true),
    ('mat-g01', 'C', '₡94 200', false),
    ('mat-g01', 'D', '₡117 750', false),
    ('mat-g07', 'A', '600 cm²', false),
    ('mat-g07', 'B', '840 cm²', false),
    ('mat-g07', 'C', '7200 cm²', true),
    ('mat-g07', 'D', '14 400 cm²', false),
    ('mat-g05', 'A', 'Pirámide de base triangular', false),
    ('mat-g05', 'B', 'Pirámide de base cuadrada', false),
    ('mat-g05', 'C', 'Prisma de base rectangular', false),
    ('mat-g05', 'D', 'Prisma de base triangular', true),
    ('mat-g02', 'A', '40°', false),
    ('mat-g02', 'B', '50°', false),
    ('mat-g02', 'C', '70°', true),
    ('mat-g02', 'D', '140°', false),
    ('mat-g03', 'A', 'Rombo', true),
    ('mat-g03', 'B', 'Cuadrado', false),
    ('mat-g03', 'C', 'Romboide', false),
    ('mat-g03', 'D', 'Trapecio', false),
    ('mat-g08', 'A', '12 cm', false),
    ('mat-g08', 'B', '15 cm', true),
    ('mat-g08', 'C', '17 cm', false),
    ('mat-g08', 'D', '18 cm', false),
    ('mat-g04', 'A', '6', false),
    ('mat-g04', 'B', '7', false),
    ('mat-g04', 'C', '12', true),
    ('mat-g04', 'D', '18', false),
    ('mat-r06', 'A', '4 kg', true),
    ('mat-r06', 'B', '6 kg', false),
    ('mat-r06', 'C', '12 kg', false),
    ('mat-r06', 'D', '16 kg', false),
    ('mat-r01', 'A', '45', false),
    ('mat-r01', 'B', '46', true),
    ('mat-r01', 'C', '49', false),
    ('mat-r01', 'D', '60', false),
    ('mat-r04', 'A', '$5c - 900$', true),
    ('mat-r04', 'B', '$5c - 600$', false),
    ('mat-r04', 'C', '$5c - 300$', false),
    ('mat-r04', 'D', '$5c + 900$', false),
    ('mat-r05', 'A', '67', false),
    ('mat-r05', 'B', '95', false),
    ('mat-r05', 'C', '126', false),
    ('mat-r05', 'D', '127', true),
    ('mat-r02', 'A', '6,5', false),
    ('mat-r02', 'B', '10', true),
    ('mat-r02', 'C', '40', false),
    ('mat-r02', 'D', '125', false),
    ('mat-r03', 'A', '50', false),
    ('mat-r03', 'B', '64', false),
    ('mat-r03', 'C', '80', true),
    ('mat-r03', 'D', '240', false),
    ('mat-e04', 'A', '$\frac{1}{12}$', false),
    ('mat-e04', 'B', '$\frac{1}{4}$', true),
    ('mat-e04', 'C', '$\frac{1}{3}$', false),
    ('mat-e04', 'D', '$\frac{3}{4}$', false),
    ('mat-e07', 'A', 'La moda es 15 y el promedio es 13.', true),
    ('mat-e07', 'B', 'La moda es 15 y el promedio es 15.', false),
    ('mat-e07', 'C', 'La moda es 2 y el promedio es 13.', false),
    ('mat-e07', 'D', 'La moda es 13 y el promedio es 15.', false),
    ('mat-e06', 'A', '1,5 kg', false),
    ('mat-e06', 'B', '6 kg', false),
    ('mat-e06', 'C', '9 kg', true),
    ('mat-e06', 'D', '15 kg', false),
    ('mat-e02', 'A', '25 %', false),
    ('mat-e02', 'B', '28 %', true),
    ('mat-e02', 'C', '30 %', false),
    ('mat-e02', 'D', '72 %', false),
    ('mat-e01', 'A', '86', false),
    ('mat-e01', 'B', '87', false),
    ('mat-e01', 'C', '88', false),
    ('mat-e01', 'D', '92', true),
    ('mat-e03', 'A', '1 hermano', true),
    ('mat-e03', 'B', '2 hermanos', false),
    ('mat-e03', 'C', '4 hermanos', false),
    ('mat-e03', 'D', '8 hermanos', false),
    ('mat-e05', 'A', 'En la A, porque tiene más boletos con premio.', false),
    ('mat-e05', 'B', 'En la A, porque gana 1 de cada 5 boletos.', false),
    ('mat-e05', 'C', 'En las dos por igual, porque hay boletos con premio.', false),
    ('mat-e05', 'D', 'En la B, porque gana 1 de cada 4 boletos.', true)
) as v (codigo, letra, texto, es_correcta)
join public.simulacro_nuevo_items i on i.codigo = v.codigo
join public.simulacros_nuevos s on s.id = i.simulacro_id and s.slug = 'nuevo-matematicas-1'
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
  where s.slug = 'nuevo-matematicas-1';

  select count(*) into v_malos
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = 'nuevo-matematicas-1'
    and (
      (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id) <> 4
      or (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id and o.es_correcta) <> 1
    );

  if v_items <> 40 then
    raise exception 'nuevo-matematicas-1: quedaron % items y se esperaban 40', v_items;
  end if;
  if v_malos > 0 then
    raise exception 'nuevo-matematicas-1: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;
end
$revision$;
-- <<< datos generados
