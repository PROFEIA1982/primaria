# Simulacros nuevos · inventario

Fecha: 5 de octubre de 2026.

## Lo que no se pudo leer, de frente

Los ítems viven solo en la base de Supabase del proyecto Primaria. Desde el
entorno donde se armó el piloto **no hubo acceso a esa base**: la política de
red del entorno rechazó la conexión al host del proyecto (y también al sitio
publicado), y no estaban definidas `SUPABASE_URL` ni `SUPABASE_ANON_KEY`. El
conector de Supabase disponible tampoco tiene ese proyecto en su lista.

Por eso **este inventario no trae conteos del banco**. No hay números
inventados: donde falta el dato, se dice. Para completarlo:

```sh
# con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
pnpm inventario:simulacros-nuevos --escribir
```

El script (`scripts/simulacros-nuevos/inventario.mjs`) solo lee, con la llave
pública, y escribe abajo, entre las marcas, la tabla por materia: ítems por
tema, porcentaje del banco, largo típico del enunciado, cuántos traen imagen,
tabla o LaTeX, y **cuántos de los 40 le tocan a cada tema** en la misma
proporción del banco (reparto por resto mayor, suma exacta 40).

<!-- >>> inventario del banco -->
_Pendiente: correr `pnpm inventario:simulacros-nuevos --escribir` con acceso a la base._
<!-- <<< inventario del banco -->

## Lo que sí se verificó en el repositorio

**Cómo se cargan los ítems.** No hay semillas, JSON ni migraciones en el repo:
todo sale de la base por estas puertas (leídas en `src/lib/api.ts`):

| Puerta | Qué entrega |
| --- | --- |
| `materias` (tabla, lectura pública) | id, slug, nombre, colores, orden |
| `temas` (tabla, lectura pública) | id, materia_id, slug, nombre, orden |
| `items` (tabla, lectura pública de los publicados) | se usa `tema_id`, `enunciado`, `estado`, `materia_id`, `origen_moodle_id` |
| `opciones` (tabla cerrada por RLS) | tiene `es_correcta` |
| `item_stats` (tabla cerrada) | el agregado anónimo por ítem |
| `sortear_items(p_materia, p_cantidad, p_temas)` | la práctica, barajada en el servidor |
| `registrar_resultados(p_resultados)` | suma el agregado anónimo |
| `listar_simulacros()` y `traer_simulacro(p_slug)` | los cuadernillos de `/simulacros/<materia>` (tablas `simulacros` y `simulacro_items`, cerradas) |
| `v_conteo_materias`, `total_practicadas`, `registrar_visita` | conteos de la portada |

**Forma de un ítem** (`src/lib/tipos.ts`): enunciado en Markdown, cuatro
opciones con una sola correcta, `imagen_url` e `imagen_alt` opcionales,
`tiene_latex`, `retroalimentacion` en texto plano (el banco la escribe con
emoji y pasos numerados) y el nombre del tema.

**Formato del texto** (`scripts/LEEME.md`, `scripts/revisiones.prueba.mjs`):

- Fórmulas con `$...$`. En agosto de 2026 se corrigieron 41 ítems de
  Matemáticas que traían `\( \)`.
- Tablas en Markdown con `| --- |` (remark-gfm). En celular, las de tres
  columnas o más se apilan en tarjetas.
- Imágenes como Markdown dentro del enunciado o en `imagen_url`, servidas
  desde el storage de Supabase.
- Coma decimal (1,62), colones con ₡ y sin separador en cuatro cifras (₡2500).
- Estilo de los enunciados del banco, por los textos reales que guarda la
  prueba de revisiones: «Carlos compró 15 lápices y el precio de cada uno era
  ₡150», «Axel construyó una piscina circular de radio 3 metros… ¿cuál es el
  área?», «En la siguiente ecuación $25 + n = 75$…», tablas de masas de niños,
  de deportes por sexo y de precios de plantas; cierre típico «De acuerdo con
  la información anterior, …». Los ítems nuevos se escribieron lejos de esos
  enunciados (ver `matematicas.md`).

**Una contradicción del código que conviene aclarar.** `tipos.ts` dice que los
cuadernillos de siempre son «fijos de 40 preguntas», pero la pestaña de cada
materia dice «Las 60 de corrido» y `config.ts` habla de «60 preguntas son 3
horas». Sin la base no se puede saber cuál es la cantidad real hoy. No afecta
a los simulacros nuevos, que traen su cantidad de la base.

## Temas del piloto de Matemáticas (provisional)

Sin los conteos del banco, el examen se repartió entre las cinco áreas del
programa de estudio de Matemáticas del MEP para II Ciclo, con un peso mayor
para Números por ser el área con más contenidos del grado. **Es criterio
profesional, no proporción medida.**

| Tema | Ítems | Intermedio | Alto |
| --- | ---: | ---: | ---: |
| Números | 12 | 7 | 5 |
| Medidas | 7 | 4 | 3 |
| Geometría | 8 | 4 | 4 |
| Relaciones y álgebra | 6 | 3 | 3 |
| Estadística y probabilidad | 7 | 3 | 4 |
| **Total** | **40** | **21** | **19** |

[VERIFICAR] Dos cosas, apenas haya acceso a la base:

1. Que los nombres de tema calcen con los de la tabla `temas` de Matemáticas.
   Si el banco usa otros nombres, se cambian en el JSON para que el desglose
   «¿Cómo te fue en cada tema?» hable el mismo idioma que la práctica.
2. Que la proporción calce con la del banco. Si el inventario da otro reparto,
   se cambian ítems de un tema a otro (manteniendo 10 claves por letra) y se
   regenera la migración.

## Español, Ciencias y Estudios Sociales

Sin datos todavía. Se completan con el mismo script antes de escribir cada
examen.
