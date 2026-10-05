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
--     publicado, por columna, sin la explicacion. OJO: esto no esconde la
--     respuesta. traer_simulacro_nuevo la entrega (es_correcta y la
--     explicacion) porque el motor califica en el aparato del estudiante,
--     igual que traer_simulacro con los cuadernillos de siempre. Si algun
--     dia la clave tiene que ser secreta, hay que calificar en el servidor.
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
-- La secuencia del id tambien recibe permisos por defecto. PostgREST no la
-- expone, pero no hay razon para que el navegador la toque.
revoke all on sequence public.simulacros_nuevos_id_seq from anon, authenticated;
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
-- Simulacro nuevo 1 de matematicas: 60 items.
-- Generado desde docs/simulacros-nuevos/matematicas.json (version 2026-10-05).
-- OJO: generado con --sin-banco. NO se comparo contra el banco publicado:
-- antes de aplicar, corra pnpm verificar:simulacros-nuevos con la llave de Supabase.

-- Entra como borrador. Lo publica la revision del final, solo si todo calza.
insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  ('nuevo-matematicas-1', 'matematicas', 1, 'Simulacro nuevo 1', 180, false, 'borrador')
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
  and s.slug = 'nuevo-matematicas-1'
  and i.codigo <> all (array['mat-n07', 'mat-n05', 'mat-n08', 'mat-n21', 'mat-n19', 'mat-n13', 'mat-n02', 'mat-n03', 'mat-n14', 'mat-n06', 'mat-n12', 'mat-n18', 'mat-n22', 'mat-n16', 'mat-n04', 'mat-n20', 'mat-n01', 'mat-g04', 'mat-g14', 'mat-g05', 'mat-g17', 'mat-g03', 'mat-g06', 'mat-g18', 'mat-g12', 'mat-g15', 'mat-g11', 'mat-g08', 'mat-g07', 'mat-g16', 'mat-g13', 'mat-m03', 'mat-m02', 'mat-m04', 'mat-m08', 'mat-m06', 'mat-m05', 'mat-m09', 'mat-m11', 'mat-m10', 'mat-m12', 'mat-r12', 'mat-r03', 'mat-r02', 'mat-r08', 'mat-r04', 'mat-r05', 'mat-r07', 'mat-r01', 'mat-r10', 'mat-r09', 'mat-r06', 'mat-r11', 'mat-e07', 'mat-e11', 'mat-e06', 'mat-e04', 'mat-e09', 'mat-e02', 'mat-e10']);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
    ('mat-n07', 1, 'Números', 'Números decimales y fracciones', 'intermedio', 'Para un experimento de Ciencias, el grupo de Keylor necesita 0,75 L de agua. La maestra solo tiene recipientes marcados con fracciones de litro. ¿Cuál fracción de litro corresponde a 0,75 L?', '0,75 se lee «setenta y cinco centésimos», o sea 75/100. Si se simplifica dividiendo entre 25, queda 3/4. Por eso 0,75 L son tres cuartos de litro.', true),
    ('mat-n05', 2, 'Números', 'Suma y resta de fracciones', 'alto', 'Valeria pintó $\frac{2}{5}$ de un mural de la escuela el lunes y $\frac{1}{3}$ del mismo mural el martes. ¿Qué fracción del mural le falta por pintar?', 'Para sumar fracciones con distinto denominador se buscan equivalentes: 2/5 = 6/15 y 1/3 = 5/15, así que ya pintó 11/15. El mural completo es 15/15, entonces le falta 15/15 − 11/15 = 4/15.', true),
    ('mat-n08', 3, 'Números', 'Operaciones con números decimales', 'intermedio', 'En la feria del agricultor, Andrés compró 2,5 kg de papas a ₡840 el kilogramo y 1,25 kg de zanahorias a ₡720 el kilogramo. ¿Cuánto pagó en total?', 'Las papas cuestan 2,5 × 840 = 2100 colones y las zanahorias 1,25 × 720 = 900 colones. Sumando, 2100 + 900 = 3000. Por eso Andrés pagó ₡3000 en total.', false),
    ('mat-n21', 4, 'Números', 'Multiplicación por 10, 100 y 1000', 'intermedio', 'Un centro de acopio de la comunidad recibió 100 paquetes de arroz para familias afectadas por una inundación, y cada paquete pesa 2,35 kg. ¿Cuántos kilogramos de arroz recibió en total?', 'Multiplicar por 100 es correr la coma dos lugares a la derecha: 2,35 × 100 = 235. El centro de acopio recibió 235 kg de arroz.', false),
    ('mat-n19', 5, 'Números', 'Valor posicional en números naturales', 'intermedio', 'Una empresa de buses informó que durante un año transportó 2 607 045 pasajeros. De acuerdo con la información anterior, ¿cuál es el valor de la cifra 6 en ese número?', 'Si se separa el número en grupos de tres cifras desde la derecha, queda 2 | 607 | 045. El 6 está en las centenas de millar, así que vale 600 000.', false),
    ('mat-n13', 6, 'Números', 'Fracción de una cantidad', 'intermedio', 'Josué tenía ₡12 000. Gastó $\frac{1}{4}$ de ese dinero en un cuaderno y $\frac{1}{3}$ de ese mismo dinero en un libro. ¿Cuánto dinero le quedó?', 'Un cuarto de 12 000 es 3000 y un tercio de 12 000 es 4000, así que gastó 3000 + 4000 = 7000 colones. Le quedaron 12 000 − 7000 = 5000 colones.', true),
    ('mat-n02', 7, 'Números', 'Múltiplos de un número', 'alto', 'Desde la terminal de buses de Guápiles salen dos rutas a las 6:00 a. m. La ruta 1 sale cada 12 minutos y la ruta 2 sale cada 18 minutos. ¿A qué hora vuelven a salir juntas por primera vez?', 'La ruta 1 sale a los 12, 24, 36… minutos y la ruta 2 a los 18, 36… minutos. El primer número que está en las dos listas es 36, así que vuelven a salir juntas 36 minutos después, a las 6:36 a. m.', false),
    ('mat-n03', 8, 'Números', 'Divisores de un número', 'alto', 'Para la huerta escolar, don Rafael tiene 48 matas de chile dulce y 72 matas de tomate. Las va a sembrar en filas, sin mezclar chile con tomate. Todas las filas deben tener la misma cantidad de matas, y esa cantidad debe ser la mayor posible. De acuerdo con la información anterior, ¿cuántas filas tendrá en total?', 'Cada fila debe llevar una cantidad que divida exacto a 48 y también a 72, y la mayor que sirve es 24. Así quedan 48 ÷ 24 = 2 filas de chile y 72 ÷ 24 = 3 filas de tomate, o sea 5 filas en total.', false),
    ('mat-n14', 9, 'Números', 'Operaciones combinadas con números naturales', 'intermedio', 'Ocho compañeros compraron un queque de ₡9600 y 8 refrescos de ₡650 cada uno. Si dividen el gasto total en partes iguales, ¿cuánto paga cada uno?', 'Los refrescos cuestan 8 × 650 = ₡5200, y con el queque el gasto total es 9600 + 5200 = ₡14 800. Al repartirlo entre 8, cada uno paga 14 800 ÷ 8 = ₡1850.', false),
    ('mat-n06', 10, 'Números', 'Fracción de una cantidad', 'alto', 'En un grupo de sexto hay 30 estudiantes. Las $\frac{2}{3}$ partes del grupo participan en la feria científica y, de quienes participan, $\frac{3}{5}$ presentan un proyecto sobre el agua. ¿Cuántos estudiantes presentan un proyecto sobre el agua?', 'Primero se calcula cuántos participan: 2/3 de 30 es 20. Después se saca 3/5 de esos 20, que da 12. Ojo: el 3/5 se aplica a quienes participan, no a todo el grupo.', true),
    ('mat-n12', 11, 'Números', 'Comparación de fracciones', 'alto', 'Tres amigas compraron una pizza cada una, todas del mismo tamaño. Sofía comió $\frac{3}{8}$ de su pizza, Jimena comió $\frac{2}{5}$ de la suya y Yerlin comió $\frac{1}{3}$ de la suya. ¿Cuál es el orden correcto, de la que comió más a la que comió menos?', 'Para comparar se pueden pasar a decimales: 3/8 = 0,375; 2/5 = 0,4 y 1/3 = 0,333…, que es el menor. Por eso Jimena comió más, luego Sofía y de última Yerlin. Hay que fijarse en que el numerador más grande no siempre gana.', true),
    ('mat-n18', 12, 'Números', 'Comparación de números decimales', 'intermedio', 'En el festival deportivo de la escuela, cuatro estudiantes participaron en salto largo. En la siguiente tabla se muestra la distancia que saltó cada uno:

| Estudiante | Distancia (en metros) |
| --- | --- |
| Ariana | 2,08 |
| Brenda | 2,8 |
| Camila | 2,75 |
| Diego | 2,705 |

De acuerdo con la información anterior, ¿quién saltó más lejos?', 'Para comparar decimales conviene igualar las cifras: 2,080; 2,800; 2,750 y 2,705. El mayor es 2,800, o sea, el salto de Brenda. Tener más cifras después de la coma no hace más grande al número.', false),
    ('mat-n22', 13, 'Números', 'División con residuo', 'alto', 'Para una gira, viajarán 220 estudiantes y 20 docentes en buses de 45 asientos cada uno. Si nadie puede viajar de pie, ¿cuántos buses se necesitan como mínimo?', 'En total viajan 220 + 20 = 240 personas. Al dividir, 240 ÷ 45 da 5 y sobran 15 personas, que también tienen que viajar, así que hace falta un bus más: 6 buses.', false),
    ('mat-n16', 14, 'Números', 'Reglas de divisibilidad', 'alto', 'El número del casillero de Maripaz tiene tres cifras, pero la del medio se borró: 5 ? 1. Ella recuerda que ese número es divisible por 3 y que la cifra borrada es mayor que 5 y menor que 8. ¿Cuál es el número del casillero?', 'Un número es divisible por 3 cuando la suma de sus cifras es divisible por 3. De las cifras mayores que 5 y menores que 8 (el 6 y el 7), solo el 6 sirve: 5 + 6 + 1 = 12. El casillero es el 561.', false),
    ('mat-n04', 15, 'Números', 'Números primos y compuestos', 'intermedio', 'Jeremy asegura: «Todos los números impares mayores que 15 son primos». ¿Cuál de los siguientes números demuestra que Jeremy está equivocado?', 'El 33 es impar y mayor que 15, pero se divide entre 3 y entre 11, porque 3 × 11 = 33; por eso es compuesto y demuestra que Jeremy se equivoca. El 9 y el 18 también son compuestos, pero el 9 no es mayor que 15 y el 18 es par.', false),
    ('mat-n20', 16, 'Números', 'Multiplicación por un número menor que uno', 'intermedio', 'Doña Ana tiene 48 kg de café y va a vender 0,75 de esa cantidad. Sin hacer la multiplicación 48 × 0,75, ¿qué se puede asegurar del resultado?', 'Multiplicar por un número menor que 1 es como tomar solo una parte, así que el resultado queda menor que 48. Pero 0,75 es más que la mitad, así que el resultado no baja de 24: de hecho, da 36.', false),
    ('mat-n01', 17, 'Números', 'Operaciones combinadas con números naturales', 'intermedio', 'En la soda de la escuela, Mariela compró 3 empanadas de ₡650 cada una y 2 refrescos naturales de ₡450 cada uno. Pagó con un billete de ₡5000. ¿Cuánto dinero le devolvieron?', 'Primero se calcula lo que gastó: 3 × 650 = 1950 y 2 × 450 = 900, en total ₡2850. Después se resta del billete: 5000 − 2850 = 2150. Ese es el vuelto.', false),
    ('mat-g04', 18, 'Geometría', 'Elementos de los prismas', 'intermedio', 'Una caja de zapatos tiene forma de prisma rectangular. Sebastián quiere pegar cinta sobre todas las aristas de la caja. ¿En cuántas aristas debe pegar cinta?', 'Un prisma rectangular tiene 4 aristas en la base de abajo, 4 en la de arriba y 4 que unen las dos bases. En total son 4 + 4 + 4 = 12 aristas.', false),
    ('mat-g14', 19, 'Geometría', 'Propiedades de los cuadriláteros', 'alto', 'Fabián dibujó un cuadrilátero cuyas dos diagonales miden lo mismo y se cortan justo en la mitad de cada una, pero no son perpendiculares. ¿Qué cuadrilátero dibujó?', 'Si las diagonales se cortan en la mitad de cada una, la figura es un paralelogramo, y si además miden lo mismo, es un rectángulo o un cuadrado. En el cuadrado las diagonales también son perpendiculares; como aquí no lo son, es un rectángulo.', false),
    ('mat-g05', 20, 'Geometría', 'Elementos del cilindro', 'intermedio', 'Una lata de leche en polvo tiene forma de cilindro. La distancia entre los centros de sus dos bases es 12 cm, y el diámetro de cada base mide 8 cm. ¿Cuáles son el radio de la base y la altura de esa lata?', 'El radio es la mitad del diámetro: 8 ÷ 2 = 4 cm. La altura del cilindro es la distancia entre sus dos bases, o sea 12 cm.', false),
    ('mat-g17', 21, 'Geometría', 'Ubicación en el sistema de coordenadas', 'intermedio', 'En un plano de la comunidad, la escuela está en el punto (2, 3). Para ir a la biblioteca, Dayana camina 4 unidades hacia la derecha y 1 unidad hacia arriba. ¿En qué punto está la biblioteca?', 'La primera coordenada dice cuánto se avanza hacia la derecha y la segunda cuánto hacia arriba. Al moverse 4 a la derecha queda 2 + 4 = 6, y al subir 1 queda 3 + 1 = 4: la biblioteca está en (6, 4).', false),
    ('mat-g03', 22, 'Geometría', 'Clasificación de cuadriláteros', 'intermedio', 'Un cuadrilátero tiene dos pares de lados paralelos, sus cuatro lados miden lo mismo y ninguno de sus ángulos es recto. ¿Qué cuadrilátero es?', 'Tener los cuatro lados iguales deja por fuera al romboide y al rectángulo. Entre el cuadrado y el rombo, la pista es que no tiene ángulos rectos: el cuadrado sí los tiene, así que la figura es un rombo.', false),
    ('mat-g06', 23, 'Geometría', 'Área de figuras compuestas', 'alto', 'El piso del comedor de una escuela tiene forma de rectángulo de 10 m de largo y 8 m de ancho, pero en una esquina hay una bodega rectangular de 4 m por 3 m que no forma parte del comedor. ¿Cuál es el área del piso del comedor, sin contar la bodega?', 'El rectángulo completo mide 10 × 8 = 80 m² y la bodega mide 4 × 3 = 12 m². Como la bodega no es parte del comedor, se resta: 80 − 12 = 68 m².', false),
    ('mat-g18', 24, 'Geometría', 'Área del paralelogramo', 'intermedio', 'Un parqueo tiene forma de paralelogramo. Uno de sus lados mide 20 m, y la distancia perpendicular entre ese lado y el lado opuesto, que es la altura, mide 12 m. ¿Cuál es el área del parqueo?', 'El área de un paralelogramo es base por altura: 20 × 12 = 240 m². No se divide entre 2; eso se hace solo en el triángulo.', false),
    ('mat-g12', 25, 'Geometría', 'Perímetro y área del rectángulo', 'alto', 'Un terreno rectangular tiene un perímetro de 54 m, y su largo mide 15 m. Se quiere sembrar zacate en todo el terreno, y el metro cuadrado de zacate cuesta ₡2500. De acuerdo con la información anterior, ¿cuánto cuesta el zacate?', 'Los dos largos suman 15 + 15 = 30 m, así que los dos anchos suman 54 − 30 = 24 m y cada uno mide 12 m. El área es 15 × 12 = 180 m², y el zacate cuesta 180 × 2500 = ₡450 000.', false),
    ('mat-g15', 26, 'Geometría', 'Clasificación de triángulos según sus ángulos', 'intermedio', 'Un pedazo de cartulina tiene forma de triángulo, y sus ángulos miden 35°, 40° y 105°. ¿Cómo se clasifica ese triángulo según sus ángulos?', 'Un triángulo con un ángulo mayor que 90° es obtusángulo. Aquí el ángulo de 105° es obtuso, así que el triángulo es obtusángulo, aunque los otros dos ángulos sean agudos.', false),
    ('mat-g11', 27, 'Geometría', 'Clasificación de triángulos', 'intermedio', 'Un triángulo tiene un ángulo de 90° y dos de sus lados miden lo mismo. ¿Cómo se clasifica este triángulo?', 'Por tener un ángulo de 90°, el triángulo es rectángulo. Por tener dos lados iguales, es isósceles. Juntando las dos cosas, es un triángulo rectángulo isósceles.', false),
    ('mat-g08', 28, 'Geometría', 'Perímetro de triángulos y cuadriláteros', 'alto', 'Con un alambre, Allan formó un triángulo equilátero de 20 cm de lado. Después lo desarmó y, con todo el alambre, formó un cuadrado. ¿Cuánto mide cada lado del cuadrado?', 'El alambre mide lo mismo que el perímetro del triángulo: 3 × 20 = 60 cm. Al repartir esos 60 cm en los 4 lados iguales del cuadrado, cada lado mide 60 ÷ 4 = 15 cm.', false),
    ('mat-g07', 29, 'Geometría', 'Área del triángulo', 'intermedio', 'Para la fiesta de la escuela se van a coser 12 banderines con forma de triángulo. Cada banderín tiene 30 cm de base y 40 cm de altura. ¿Cuánta tela se necesita para los 12 banderines, sin contar desperdicios?', 'El área de un triángulo es base por altura entre 2: 30 × 40 ÷ 2 = 600 cm² por banderín. Para 12 banderines se necesitan 600 × 12 = 7200 cm².', false),
    ('mat-g16', 30, 'Geometría', 'Ejes de simetría', 'intermedio', 'La puerta de un aula tiene forma de rectángulo: mide 2 m de alto y 1 m de ancho. Sin tomar en cuenta la cerradura ni las bisagras, ¿cuántos ejes de simetría tiene esa forma?', 'Un rectángulo que no es cuadrado tiene 2 ejes de simetría: uno vertical y otro horizontal, que pasan por la mitad de sus lados. Las diagonales no son ejes, porque al doblar por ahí las dos mitades no calzan.', false),
    ('mat-g13', 31, 'Geometría', 'Clasificación de cuadriláteros', 'intermedio', 'La superficie de una mesa de trabajo tiene cuatro lados, y solo dos de esos lados son paralelos entre sí. ¿Cómo se llama esa figura?', 'Un cuadrilátero con un solo par de lados paralelos es un trapecio. Si tuviera dos pares sería un paralelogramo, y si no tuviera ninguno sería un trapezoide.', false),
    ('mat-m03', 32, 'Medidas', 'Medidas de capacidad', 'intermedio', 'Una pichinga tiene 3 L de agua. Con ella se llenan 8 vasos de 250 mL cada uno. ¿Cuántos mililitros de agua quedan en la pichinga?', '3 L son 3000 mL. Los 8 vasos usan 8 × 250 = 2000 mL. Quedan 3000 − 2000 = 1000 mL, que es lo mismo que 1 litro.', false),
    ('mat-m02', 33, 'Medidas', 'Conversión de medidas de masa', 'intermedio', 'Doña Lucía empaca 3,6 kg de frijoles en bolsas de 450 g cada una. ¿Cuántas bolsas llena?', 'Primero se pasa todo a la misma unidad: 3,6 kg son 3600 g. Luego se reparte: 3600 ÷ 450 = 8 bolsas.', false),
    ('mat-m04', 34, 'Medidas', 'Medidas de tiempo', 'alto', 'Un partido de fútbol entre dos escuelas empezó a las 2:50 p. m. Tuvo dos tiempos de 35 minutos cada uno y un descanso de 15 minutos entre ellos. De acuerdo con la información anterior, ¿a qué hora terminó el partido?', 'El partido duró 35 + 15 + 35 = 85 minutos, que es 1 hora y 25 minutos. Si a las 2:50 p. m. se le suma 1 hora, son las 3:50 p. m., y con 25 minutos más son las 4:15 p. m.', false),
    ('mat-m08', 35, 'Medidas', 'Medidas de tiempo', 'alto', 'Un tanque de 1200 L se llena con una manguera que echa 15 L de agua por minuto. Si empezó a llenarse a las 9:50 a. m., ¿a qué hora termina de llenarse?', 'El tanque tarda 1200 ÷ 15 = 80 minutos, que es 1 hora y 20 minutos. A las 9:50 a. m. se le suma 1 hora y son las 10:50 a. m.; con 20 minutos más son las 11:10 a. m.', false),
    ('mat-m06', 36, 'Medidas', 'Problemas con medidas de longitud', 'intermedio', 'Yeiner camina 750 m de su casa a la escuela y la misma distancia de regreso, de lunes a viernes. ¿Cuántos kilómetros camina en total durante esos cinco días?', 'Cada día camina 750 + 750 = 1500 m. En cinco días son 1500 × 5 = 7500 m. Como 1 km tiene 1000 m, eso es 7,5 km.', false),
    ('mat-m05', 37, 'Medidas', 'Medidas de superficie', 'alto', 'El piso de un aula mide 8 m de largo y 6 m de ancho. ¿Cuál es el área del piso en centímetros cuadrados?', 'El área es 8 × 6 = 48 m². Cada metro cuadrado es un cuadro de 100 cm por 100 cm, o sea 10 000 cm². Entonces el piso mide 48 × 10 000 = 480 000 cm².', false),
    ('mat-m09', 38, 'Medidas', 'Conversión de medidas de masa', 'alto', 'Una receta de arroz con pollo para 4 personas lleva 750 g de pollo. ¿Cuántos kilogramos de pollo se necesitan para 10 personas?', 'Para una persona se necesitan 750 ÷ 4 = 187,5 g, y para 10 personas 187,5 × 10 = 1875 g. Como 1 kg tiene 1000 g, eso es 1,875 kg.', false),
    ('mat-m11', 39, 'Medidas', 'Conversión de temperatura', 'intermedio', 'En un viaje, Fiorella vio en un termómetro que la temperatura era de 77 °F. Para pasar de grados Fahrenheit a grados Celsius se usa la regla °C = (°F − 32) × 5 ÷ 9. ¿Cuál era la temperatura en grados Celsius?', 'Primero se resta: 77 − 32 = 45. Después se multiplica por 5 y se divide entre 9: 45 × 5 = 225 y 225 ÷ 9 = 25 °C.', false),
    ('mat-m10', 40, 'Medidas', 'Conversión de medidas de longitud', 'intermedio', 'Un pasillo mide 6 m de largo. Se van a poner baldosas cuadradas de 25 cm de lado, una seguida de otra, a lo largo del pasillo. ¿Cuántas baldosas caben en una fila?', 'Primero se pasa todo a centímetros: 6 m son 600 cm. Después se reparte: 600 ÷ 25 = 24 baldosas.', false),
    ('mat-m12', 41, 'Medidas', 'Sistema monetario nacional', 'intermedio', 'En la siguiente tabla se muestra el dinero que hay en la caja de la soda escolar al final del día:

| Billete o moneda | Cantidad |
| --- | --- |
| Billete de ₡5000 | 3 |
| Billete de ₡2000 | 4 |
| Moneda de ₡500 | 9 |

De acuerdo con la información anterior, ¿cuánto dinero hay en total en la caja?', 'Los billetes de ₡5000 suman ₡15 000, los de ₡2000 suman ₡8000 y las monedas suman 9 × 500 = ₡4500. En total hay 15 000 + 8000 + 4500 = ₡27 500.', false),
    ('mat-r12', 42, 'Relaciones y Álgebra', 'Relaciones entre cantidades en tablas', 'intermedio', 'La siguiente tabla muestra el costo total, en colones, según la cantidad de entradas que se compren para el festival de la escuela:

| Cantidad de entradas | Costo total (en colones) |
| --- | --- |
| 2 | 3000 |
| 3 | 4500 |
| 5 | 7500 |
| 8 | 12 000 |

De acuerdo con la información anterior, ¿cuál de las siguientes afirmaciones describe la relación entre las dos cantidades?', 'Si se divide el costo entre la cantidad de entradas, siempre da lo mismo: 3000 ÷ 2 = 1500, 4500 ÷ 3 = 1500, y así con todas. Por eso cada entrada cuesta ₡1500, y las dos cantidades aumentan juntas, en proporción.', false),
    ('mat-r03', 43, 'Relaciones y Álgebra', 'Proporcionalidad directa', 'intermedio', 'En una tortillería, la cantidad de tortillas es proporcional a la cantidad de masa que se usa. La siguiente tabla muestra algunos datos:

| Masa (en kg) | Cantidad de tortillas |
| --- | --- |
| 3 | 48 |
| 6 | 96 |
| 5 | ? |

De acuerdo con la información anterior, ¿cuántas tortillas se hacen con 5 kg de masa?', 'Según la tabla, con 3 kg salen 48 tortillas, así que con 1 kg salen 48 ÷ 3 = 16. Con 5 kg salen 16 × 5 = 80 tortillas.', false),
    ('mat-r02', 44, 'Relaciones y Álgebra', 'Valor desconocido', 'intermedio', 'Daniela pensó un número, lo multiplicó por 4 y al resultado le restó 7. Al final obtuvo 33. En la siguiente ecuación, «n» representa el número que pensó Daniela: 4 × n − 7 = 33. De acuerdo con la información anterior, ¿qué número pensó Daniela?', 'Se deshacen los pasos al revés: si al restarle 7 quedó 33, antes era 33 + 7 = 40. Y si 40 salió de multiplicar por 4, el número era 40 ÷ 4 = 10. Comprobación: 10 × 4 − 7 = 33.', false),
    ('mat-r08', 45, 'Relaciones y Álgebra', 'Sucesiones numéricas', 'alto', 'Para un proyecto de reciclaje, un grupo de sexto anota el total de botellas que ha recogido al final de cada semana. La siguiente tabla muestra los datos de las primeras semanas:

| Semana | Total de botellas |
| --- | --- |
| 1 | 7 |
| 2 | 11 |
| 3 | 15 |
| 4 | 19 |

De acuerdo con la información anterior, si el total sigue aumentando de la misma forma, ¿en cuál semana el total llegará a 83 botellas?', 'Cada semana el total aumenta 4 botellas. De 7 a 83 faltan 83 − 7 = 76 botellas, o sea 76 ÷ 4 = 19 aumentos, y como se empieza en la semana 1, se llega a 83 en la semana 20.', false),
    ('mat-r04', 46, 'Relaciones y Álgebra', 'Expresiones matemáticas con dos cantidades', 'alto', 'En una librería, un cuaderno cuesta $c$ colones y un lapicero cuesta ₡300 menos que un cuaderno. ¿Cuál expresión representa lo que se paga por 2 cuadernos y 3 lapiceros?', 'Cada lapicero cuesta c − 300 colones, así que los 3 lapiceros cuestan 3 × (c − 300): el paréntesis dice que se multiplica el precio completo del lapicero. A eso se le suma lo de los 2 cuadernos, que es 2 × c.', true),
    ('mat-r05', 47, 'Relaciones y Álgebra', 'Sucesiones numéricas', 'alto', 'En la sucesión 3, 8, 15, 24, 35, …, ¿cuál es el número que sigue?', 'De un número al siguiente se suma 5, luego 7, luego 9 y luego 11: lo que se suma crece de 2 en 2. Lo próximo es sumar 13, así que sigue 35 + 13 = 48.', false),
    ('mat-r07', 48, 'Relaciones y Álgebra', 'Cantidades variables y constantes', 'intermedio', 'En la soda de una escuela, el almuerzo cuesta ₡2200 todos los días, la soda abre 5 días por semana y cada día llega una cantidad distinta de clientes. ¿Cuál de las siguientes cantidades es constante?', 'Una cantidad es constante cuando no cambia. El precio del almuerzo es el mismo todos los días, así que es constante. Los clientes, el dinero que entra y las ventas de cada semana cambian: son variables.', false),
    ('mat-r01', 49, 'Relaciones y Álgebra', 'Patrones y sucesiones con figuras', 'alto', 'Con palillos se forman las figuras que se muestran: la figura 1 tiene un cuadrado, la figura 2 tiene dos cuadrados unidos y la figura 3 tiene tres.

![Tres figuras hechas con palillos. Figura 1: un cuadrado de 4 palillos. Figura 2: dos cuadrados unidos por un lado, 7 palillos. Figura 3: tres cuadrados en fila, 10 palillos.](/simulacros-nuevos/mat-r01-palillos.svg)

De acuerdo con la información anterior, si se sigue el mismo patrón, ¿cuántos palillos se necesitan para la figura 15?', 'La figura 1 usa 4 palillos y cada cuadrado nuevo agrega solo 3, porque comparte un lado con el anterior. Así, la figura 15 usa 4 + 3 × 14 = 46 palillos.', false),
    ('mat-r10', 50, 'Relaciones y Álgebra', 'Escalas y proporcionalidad', 'intermedio', 'El mapa muestra la ubicación de dos pueblos y la escala que se usó para dibujarlo.

![Mapa con dos pueblos, A y B, unidos por una línea que mide 7,5 cm. Abajo, una barra de escala indica que 1 cm del mapa equivale a 5 km en la realidad.](/simulacros-nuevos/mat-r10-mapa.svg)

De acuerdo con la información anterior, ¿cuál es la distancia real entre los dos pueblos?', 'Si 1 cm del mapa son 5 km, entonces 7,5 cm son 7,5 × 5 = 37,5 km. Es una relación proporcional: el doble de centímetros, el doble de kilómetros.', false),
    ('mat-r09', 51, 'Relaciones y Álgebra', 'Valor desconocido en una ecuación', 'alto', 'En una campaña de reforestación, los árboles que donó un vivero se repartieron en partes iguales entre 4 comunidades. Además, la municipalidad le entregó 15 árboles más a cada comunidad. Al final, cada comunidad recibió 40 árboles en total. En la siguiente ecuación, «a» representa la cantidad de árboles que donó el vivero:

$a \div 4 + 15 = 40$

De acuerdo con la información anterior, ¿cuántos árboles donó el vivero?', 'Primero se quitan los 15 árboles que dio la municipalidad: 40 − 15 = 25. Esos 25 árboles son lo que le tocó a cada comunidad cuando se repartió entre 4 lo del vivero, así que el vivero donó 25 × 4 = 100 árboles. Se comprueba: 100 ÷ 4 + 15 = 25 + 15 = 40.', true),
    ('mat-r06', 52, 'Relaciones y Álgebra', 'Número que falta en una representación gráfica', 'intermedio', 'La balanza de la figura está en equilibrio. En el platillo de la izquierda hay 3 cajas iguales y una pesa de 2 kg; en el de la derecha hay una pesa de 14 kg.

![Balanza de dos platillos, nivelada. En el platillo izquierdo hay tres cajas iguales y una pesa de 2 kg. En el platillo derecho hay una pesa de 14 kg.](/simulacros-nuevos/mat-r06-balanza.svg)

De acuerdo con la información anterior, ¿cuánto pesa cada caja?', 'Si se quitan 2 kg de cada lado, la balanza sigue en equilibrio: las 3 cajas pesan 14 − 2 = 12 kg. Entonces cada caja pesa 12 ÷ 3 = 4 kg.', false),
    ('mat-r11', 53, 'Relaciones y Álgebra', 'Expresiones matemáticas con dos cantidades', 'intermedio', 'Un taxi cobra ₡700 por subirse y ₡650 por cada kilómetro recorrido. El cobro total, en colones, se calcula con la expresión 700 + 650 × k, donde k es la cantidad de kilómetros. ¿Cuánto se paga por un viaje de 6 km?', 'Primero se multiplica: 650 × 6 = ₡3900 por los kilómetros. Después se suman los ₡700 de subirse: 700 + 3900 = ₡4600.', false),
    ('mat-e07', 54, 'Estadística y Probabilidad', 'Moda y recorrido', 'intermedio', 'La siguiente tabla muestra la cantidad de lluvia, en milímetros, que registró el pluviómetro de una escuela durante cinco días:

| Día | Lluvia (en milímetros) |
| --- | --- |
| Lunes | 12 |
| Martes | 15 |
| Miércoles | 9 |
| Jueves | 15 |
| Viernes | 14 |

De acuerdo con la información anterior, ¿cuál de las siguientes afirmaciones es verdadera?', 'La moda es el dato que más se repite: el 15 aparece dos veces. El recorrido es la diferencia entre el dato mayor y el menor: 15 − 9 = 6.', false),
    ('mat-e11', 55, 'Estadística y Probabilidad', 'Población y muestra', 'intermedio', 'Una municipalidad quiere saber cuántos kilogramos de basura produce por semana cada una de las 1200 casas de un distrito. Para eso, escogió al azar 150 de esas casas y pesó su basura durante una semana. En ese estudio, ¿cuál es la población?', 'La población es el grupo completo que se quiere estudiar: las 1200 casas del distrito. Las 150 casas escogidas al azar son solo una parte, y esa parte se llama muestra.', false),
    ('mat-e06', 56, 'Estadística y Probabilidad', 'Pictogramas', 'alto', 'El pictograma muestra los kilogramos de fruta que vendió un puesto de la feria en una mañana. Cada círculo completo representa 6 kg.

![Pictograma de fruta vendida, donde cada círculo completo vale 6 kg. Mango: 4 círculos. Papaya: 2 círculos y medio círculo. Piña: 3 círculos.](/simulacros-nuevos/mat-e06-frutas.svg)

De acuerdo con la información anterior, ¿cuántos kilogramos más de mango que de papaya se vendieron?', 'Mango tiene 4 círculos, o sea 4 × 6 = 24 kg. Papaya tiene 2 círculos y medio: 2,5 × 6 = 15 kg. La diferencia es 24 − 15 = 9 kg.', false),
    ('mat-e04', 57, 'Estadística y Probabilidad', 'Eventos más y menos probables', 'intermedio', 'En una bolsa hay 5 bolitas rojas, 3 azules y 4 verdes, todas del mismo tamaño. Se agregan 2 bolitas azules más. Si después se saca una bolita sin ver, ¿cuál de las siguientes afirmaciones es correcta?', 'Después de agregar las 2 azules quedan 5 rojas, 5 azules y 4 verdes. Como hay la misma cantidad de rojas que de azules, sacar una roja o una azul es igual de probable, y la verde es la menos probable.', false),
    ('mat-e09', 58, 'Estadística y Probabilidad', 'Media aritmética con tabla de frecuencias', 'alto', 'La tabla muestra cuántos goles anotó el equipo de la escuela en sus partidos del campeonato.

| Goles en el partido | Cantidad de partidos |
| --- | --- |
| 0 | 2 |
| 1 | 3 |
| 2 | 4 |
| 3 | 1 |

De acuerdo con la información anterior, ¿cuál fue el promedio (media aritmética) de goles por partido?', 'En total se jugaron 2 + 3 + 4 + 1 = 10 partidos y se anotaron 0 × 2 + 1 × 3 + 2 × 4 + 3 × 1 = 14 goles. El promedio es 14 ÷ 10 = 1,4 goles por partido.', false),
    ('mat-e02', 59, 'Estadística y Probabilidad', 'Frecuencia porcentual', 'alto', 'El gráfico muestra la cantidad de libros que leyó cada grupo de sexto durante un mes.

![Gráfico de barras de los libros leídos en un mes por cada grupo de sexto: 6-1 leyó 48, 6-2 leyó 60, 6-3 leyó 36 y 6-4 leyó 56.](/simulacros-nuevos/mat-e02-libros.svg)

De acuerdo con la información anterior, ¿qué porcentaje del total de libros leyó el grupo 6-4?', 'Entre los cuatro grupos leyeron 48 + 60 + 36 + 56 = 200 libros. El grupo 6-4 leyó 56 de esos 200, que es lo mismo que 28 de cada 100, o sea, el 28 %. Ojo: 56 es la cantidad de libros, no el porcentaje.', false),
    ('mat-e10', 60, 'Estadística y Probabilidad', 'Eventos más y menos probables', 'intermedio', 'Una ruleta está dividida en 8 partes iguales: 4 son rojas, 3 son azules y 1 es verde. Si se hace girar una vez, ¿cuál de las siguientes afirmaciones es correcta?', 'El color con más partes es el más probable. El verde tiene 1 parte y el azul tiene 3, así que es menos probable que salga verde. Pero no es imposible, porque sí hay una parte verde.', false)
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
    ('mat-n07', 'A', '$\frac{1}{4}$', false),
    ('mat-n07', 'B', '$\frac{3}{4}$', true),
    ('mat-n07', 'C', '$\frac{7}{5}$', false),
    ('mat-n07', 'D', '$\frac{75}{10}$', false),
    ('mat-n05', 'A', '$\frac{4}{15}$', true),
    ('mat-n05', 'B', '$\frac{3}{8}$', false),
    ('mat-n05', 'C', '$\frac{5}{8}$', false),
    ('mat-n05', 'D', '$\frac{11}{15}$', false),
    ('mat-n08', 'A', '₡2100', false),
    ('mat-n08', 'B', '₡2400', false),
    ('mat-n08', 'C', '₡2820', false),
    ('mat-n08', 'D', '₡3000', true),
    ('mat-n21', 'A', '0,0235 kg', false),
    ('mat-n21', 'B', '2,35 kg', false),
    ('mat-n21', 'C', '23,5 kg', false),
    ('mat-n21', 'D', '235 kg', true),
    ('mat-n19', 'A', '600', false),
    ('mat-n19', 'B', '60 000', false),
    ('mat-n19', 'C', '600 000', true),
    ('mat-n19', 'D', '6 000 000', false),
    ('mat-n13', 'A', '₡5000', true),
    ('mat-n13', 'B', '₡6000', false),
    ('mat-n13', 'C', '₡7000', false),
    ('mat-n13', 'D', '₡9000', false),
    ('mat-n02', 'A', '6:06 a. m.', false),
    ('mat-n02', 'B', '6:24 a. m.', false),
    ('mat-n02', 'C', '6:30 a. m.', false),
    ('mat-n02', 'D', '6:36 a. m.', true),
    ('mat-n03', 'A', '5 filas', true),
    ('mat-n03', 'B', '10 filas', false),
    ('mat-n03', 'C', '24 filas', false),
    ('mat-n03', 'D', '144 filas', false),
    ('mat-n14', 'A', '₡1200', false),
    ('mat-n14', 'B', '₡1850', true),
    ('mat-n14', 'C', '₡6400', false),
    ('mat-n14', 'D', '₡14 800', false),
    ('mat-n06', 'A', '8 estudiantes', false),
    ('mat-n06', 'B', '12 estudiantes', true),
    ('mat-n06', 'C', '18 estudiantes', false),
    ('mat-n06', 'D', '20 estudiantes', false),
    ('mat-n12', 'A', 'Sofía, Jimena y Yerlin', false),
    ('mat-n12', 'B', 'Yerlin, Jimena y Sofía', false),
    ('mat-n12', 'C', 'Yerlin, Sofía y Jimena', false),
    ('mat-n12', 'D', 'Jimena, Sofía y Yerlin', true),
    ('mat-n18', 'A', 'Ariana', false),
    ('mat-n18', 'B', 'Camila', false),
    ('mat-n18', 'C', 'Diego', false),
    ('mat-n18', 'D', 'Brenda', true),
    ('mat-n22', 'A', '5', false),
    ('mat-n22', 'B', '6', true),
    ('mat-n22', 'C', '15', false),
    ('mat-n22', 'D', '240', false),
    ('mat-n16', 'A', '531', false),
    ('mat-n16', 'B', '561', true),
    ('mat-n16', 'C', '571', false),
    ('mat-n16', 'D', '591', false),
    ('mat-n04', 'A', '9', false),
    ('mat-n04', 'B', '18', false),
    ('mat-n04', 'C', '29', false),
    ('mat-n04', 'D', '33', true),
    ('mat-n20', 'A', 'Es mayor que 48.', false),
    ('mat-n20', 'B', 'Es igual a 48.', false),
    ('mat-n20', 'C', 'Es menor que 48.', true),
    ('mat-n20', 'D', 'Es menor que 24.', false),
    ('mat-n01', 'A', '₡1700', false),
    ('mat-n01', 'B', '₡2150', true),
    ('mat-n01', 'C', '₡2350', false),
    ('mat-n01', 'D', '₡2850', false),
    ('mat-g04', 'A', '4', false),
    ('mat-g04', 'B', '6', false),
    ('mat-g04', 'C', '8', false),
    ('mat-g04', 'D', '12', true),
    ('mat-g14', 'A', 'Cuadrado', false),
    ('mat-g14', 'B', 'Romboide', false),
    ('mat-g14', 'C', 'Rectángulo', true),
    ('mat-g14', 'D', 'Trapecio', false),
    ('mat-g05', 'A', 'Radio de 4 cm y altura de 12 cm', true),
    ('mat-g05', 'B', 'Radio de 6 cm y altura de 8 cm', false),
    ('mat-g05', 'C', 'Radio de 8 cm y altura de 12 cm', false),
    ('mat-g05', 'D', 'Radio de 12 cm y altura de 4 cm', false),
    ('mat-g17', 'A', '(3, 7)', false),
    ('mat-g17', 'B', '(4, 6)', false),
    ('mat-g17', 'C', '(6, 2)', false),
    ('mat-g17', 'D', '(6, 4)', true),
    ('mat-g03', 'A', 'Rombo', true),
    ('mat-g03', 'B', 'Cuadrado', false),
    ('mat-g03', 'C', 'Romboide', false),
    ('mat-g03', 'D', 'Rectángulo', false),
    ('mat-g06', 'A', '36 m²', false),
    ('mat-g06', 'B', '68 m²', true),
    ('mat-g06', 'C', '80 m²', false),
    ('mat-g06', 'D', '92 m²', false),
    ('mat-g18', 'A', '32 m²', false),
    ('mat-g18', 'B', '64 m²', false),
    ('mat-g18', 'C', '120 m²', false),
    ('mat-g18', 'D', '240 m²', true),
    ('mat-g12', 'A', '₡135 000', false),
    ('mat-g12', 'B', '₡450 000', true),
    ('mat-g12', 'C', '₡900 000', false),
    ('mat-g12', 'D', '₡1 462 500', false),
    ('mat-g15', 'A', 'Acutángulo', false),
    ('mat-g15', 'B', 'Rectángulo', false),
    ('mat-g15', 'C', 'Obtusángulo', true),
    ('mat-g15', 'D', 'No se puede clasificar', false),
    ('mat-g11', 'A', 'Rectángulo isósceles', true),
    ('mat-g11', 'B', 'Rectángulo escaleno', false),
    ('mat-g11', 'C', 'Acutángulo isósceles', false),
    ('mat-g11', 'D', 'Obtusángulo isósceles', false),
    ('mat-g08', 'A', '10 cm', false),
    ('mat-g08', 'B', '15 cm', true),
    ('mat-g08', 'C', '19 cm', false),
    ('mat-g08', 'D', '20 cm', false),
    ('mat-g07', 'A', '600 cm²', false),
    ('mat-g07', 'B', '840 cm²', false),
    ('mat-g07', 'C', '7200 cm²', true),
    ('mat-g07', 'D', '14 400 cm²', false),
    ('mat-g16', 'A', '0', false),
    ('mat-g16', 'B', '1', false),
    ('mat-g16', 'C', '2', true),
    ('mat-g16', 'D', '4', false),
    ('mat-g13', 'A', 'Paralelogramo', false),
    ('mat-g13', 'B', 'Trapezoide', false),
    ('mat-g13', 'C', 'Romboide', false),
    ('mat-g13', 'D', 'Trapecio', true),
    ('mat-m03', 'A', '1000 mL', true),
    ('mat-m03', 'B', '2000 mL', false),
    ('mat-m03', 'C', '2750 mL', false),
    ('mat-m03', 'D', '2800 mL', false),
    ('mat-m02', 'A', '8 bolsas', true),
    ('mat-m02', 'B', '80 bolsas', false),
    ('mat-m02', 'C', '125 bolsas', false),
    ('mat-m02', 'D', '800 bolsas', false),
    ('mat-m04', 'A', '3:40 p. m.', false),
    ('mat-m04', 'B', '4:00 p. m.', false),
    ('mat-m04', 'C', '4:15 p. m.', true),
    ('mat-m04', 'D', '4:30 p. m.', false),
    ('mat-m08', 'A', '10:38 a. m.', false),
    ('mat-m08', 'B', '10:58 a. m.', false),
    ('mat-m08', 'C', '11:10 a. m.', true),
    ('mat-m08', 'D', '11:23 a. m.', false),
    ('mat-m06', 'A', '0,75 km', false),
    ('mat-m06', 'B', '1,5 km', false),
    ('mat-m06', 'C', '3,75 km', false),
    ('mat-m06', 'D', '7,5 km', true),
    ('mat-m05', 'A', '4800 cm²', false),
    ('mat-m05', 'B', '48 000 cm²', false),
    ('mat-m05', 'C', '480 000 cm²', true),
    ('mat-m05', 'D', '4 800 000 cm²', false),
    ('mat-m09', 'A', '1,875 kg', true),
    ('mat-m09', 'B', '3 kg', false),
    ('mat-m09', 'C', '7,5 kg', false),
    ('mat-m09', 'D', '18,75 kg', false),
    ('mat-m11', 'A', '25 °C', true),
    ('mat-m11', 'B', '45 °C', false),
    ('mat-m11', 'C', '81 °C', false),
    ('mat-m11', 'D', '109 °C', false),
    ('mat-m10', 'A', '2,4', false),
    ('mat-m10', 'B', '24', true),
    ('mat-m10', 'C', '150', false),
    ('mat-m10', 'D', '240', false),
    ('mat-m12', 'A', '₡7500', false),
    ('mat-m12', 'B', '₡23 000', false),
    ('mat-m12', 'C', '₡23 450', false),
    ('mat-m12', 'D', '₡27 500', true),
    ('mat-r12', 'A', 'Cada entrada cuesta ₡3000.', false),
    ('mat-r12', 'B', 'Cada entrada nueva duplica el costo.', false),
    ('mat-r12', 'C', 'El costo aumenta ₡1500 por fila.', false),
    ('mat-r12', 'D', 'Cada entrada cuesta ₡1500.', true),
    ('mat-r03', 'A', '50', false),
    ('mat-r03', 'B', '64', false),
    ('mat-r03', 'C', '80', true),
    ('mat-r03', 'D', '240', false),
    ('mat-r02', 'A', '6,5', false),
    ('mat-r02', 'B', '10', true),
    ('mat-r02', 'C', '40', false),
    ('mat-r02', 'D', '125', false),
    ('mat-r08', 'A', '19', false),
    ('mat-r08', 'B', '20', true),
    ('mat-r08', 'C', '21', false),
    ('mat-r08', 'D', '76', false),
    ('mat-r04', 'A', '$2 \times c + 3 \times (c - 300)$', true),
    ('mat-r04', 'B', '$2 \times c + 3 \times c - 300$', false),
    ('mat-r04', 'C', '$2 \times (c - 300) + 3 \times c$', false),
    ('mat-r04', 'D', '$5 \times (c - 300)$', false),
    ('mat-r05', 'A', '46', false),
    ('mat-r05', 'B', '47', false),
    ('mat-r05', 'C', '48', true),
    ('mat-r05', 'D', '70', false),
    ('mat-r07', 'A', 'El dinero que se recibe cada día.', false),
    ('mat-r07', 'B', 'Los clientes que piden almuerzo cada día.', false),
    ('mat-r07', 'C', 'El precio de cada almuerzo.', true),
    ('mat-r07', 'D', 'Las ventas totales de cada semana.', false),
    ('mat-r01', 'A', '45', false),
    ('mat-r01', 'B', '46', true),
    ('mat-r01', 'C', '49', false),
    ('mat-r01', 'D', '60', false),
    ('mat-r10', 'A', '1,5 km', false),
    ('mat-r10', 'B', '12,5 km', false),
    ('mat-r10', 'C', '37,5 km', true),
    ('mat-r10', 'D', '375 km', false),
    ('mat-r09', 'A', '100', true),
    ('mat-r09', 'B', '145', false),
    ('mat-r09', 'C', '160', false),
    ('mat-r09', 'D', '220', false),
    ('mat-r06', 'A', '4 kg', true),
    ('mat-r06', 'B', '6 kg', false),
    ('mat-r06', 'C', '12 kg', false),
    ('mat-r06', 'D', '16 kg', false),
    ('mat-r11', 'A', '₡3900', false),
    ('mat-r11', 'B', '₡4600', true),
    ('mat-r11', 'C', '₡4850', false),
    ('mat-r11', 'D', '₡8100', false),
    ('mat-e07', 'A', 'La moda es 15 y el recorrido es 15.', false),
    ('mat-e07', 'B', 'La moda es 2 y el recorrido es 6.', false),
    ('mat-e07', 'C', 'La moda es 15 y el recorrido es 6.', true),
    ('mat-e07', 'D', 'La moda es 6 y el recorrido es 15.', false),
    ('mat-e11', 'A', 'Todas las casas del distrito.', true),
    ('mat-e11', 'B', 'Las 150 casas escogidas al azar.', false),
    ('mat-e11', 'C', 'Los kilogramos de basura de cada casa.', false),
    ('mat-e11', 'D', 'Las personas que recogen la basura del distrito.', false),
    ('mat-e06', 'A', '1,5 kg', false),
    ('mat-e06', 'B', '6 kg', false),
    ('mat-e06', 'C', '9 kg', true),
    ('mat-e06', 'D', '15 kg', false),
    ('mat-e04', 'A', 'Solo el rojo es el más probable.', false),
    ('mat-e04', 'B', 'Solo el azul es el más probable.', false),
    ('mat-e04', 'C', 'Los tres colores son igual de probables.', false),
    ('mat-e04', 'D', 'Rojo y azul son igual de probables.', true),
    ('mat-e09', 'A', '1,4', true),
    ('mat-e09', 'B', '1,5', false),
    ('mat-e09', 'C', '2,5', false),
    ('mat-e09', 'D', '3,5', false),
    ('mat-e02', 'A', '25 %', false),
    ('mat-e02', 'B', '28 %', true),
    ('mat-e02', 'C', '56 %', false),
    ('mat-e02', 'D', '72 %', false),
    ('mat-e10', 'A', 'Azul es más probable que rojo.', false),
    ('mat-e10', 'B', 'Es imposible que salga verde.', false),
    ('mat-e10', 'C', 'Es seguro que salga rojo o que salga azul.', false),
    ('mat-e10', 'D', 'Verde es menos probable que azul.', true)
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

  if v_items <> 60 then
    raise exception 'nuevo-matematicas-1: quedaron % items y se esperaban 60', v_items;
  end if;
  if v_malos > 0 then
    raise exception 'nuevo-matematicas-1: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;

  -- Todo calza: ahora si se publica.
  update public.simulacros_nuevos set estado = 'publicado' where slug = 'nuevo-matematicas-1';
end
$revision$;
-- <<< datos generados
