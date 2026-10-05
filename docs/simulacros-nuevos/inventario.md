# Simulacros nuevos · inventario

Fecha: 5 de octubre de 2026.

## Lo que no se pudo leer, de frente

Los ítems viven solo en la base de Supabase del proyecto Primaria. Desde el
entorno donde se armó el piloto **no hubo acceso a esa base**: la política de
red del entorno rechazó la conexión al host del proyecto (y también al sitio
publicado), y no estaban definidas `SUPABASE_URL` ni `SUPABASE_ANON_KEY`. El
conector de Supabase disponible tampoco tiene ese proyecto en su lista.

Por eso **este inventario no trae conteos del banco publicado**. No hay
números inventados: donde falta el dato, se dice. El reparto del examen se
hizo con la prueba oficial que aportó el dueño (más abajo). Para completar los
conteos del banco:

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

## Reparto del examen de Matemáticas (60 ítems)

**Evidencia documental.** El 5 de octubre de 2026 el dueño del proyecto aportó
la prueba de práctica oficial de Matemáticas para primaria (50 ítems, con su
solucionario) y el *Marco de especificaciones de la Prueba Nacional
Estandarizada Diagnóstica de Matemáticas 2026, primaria* (MEP, Dirección de
Gestión y Evaluación de la Calidad, marzo de 2026). De ahí salen:

- La proporción por bloque de los 50 oficiales: Números 14, Geometría 12,
  Medidas 8, Relaciones y Álgebra 10, Estadística y Probabilidad 6.
- Los nombres oficiales de los cinco bloques y las afirmaciones y evidencias
  de la Tabla 2 del marco, a las que se ancla cada ítem.

Llevada a 60 por resto mayor:

| Bloque | Oficiales (50) | Simulacro (60) | Intermedio | Alto |
| --- | ---: | ---: | ---: | ---: |
| Números | 14 | 17 | 11 | 6 |
| Geometría | 12 | 14 | 10 | 4 |
| Medidas | 8 | 10 | 6 | 4 |
| Relaciones y Álgebra | 10 | 12 | 6 | 6 |
| Estadística y Probabilidad | 6 | 7 | 4 | 3 |
| **Total** | **50** | **60** | **37** | **23** |

La prueba diagnóstica 2026 tiene 40 ítems y dura 120 minutos, según el marco.
El simulacro de la app es de 60 a 3 minutos cada uno, como los cuadernillos de
siempre: más largo a propósito.

**Lo que sigue pendiente.** La comparación contra el banco publicado en
Supabase (que las preguntas no estén ya en la práctica de la app) no se pudo
correr desde este entorno. Contra los 50 oficiales sí se comparó: el parecido
más alto en frases fue 0,15, muy por debajo del umbral de 0,5.

## Español, Ciencias y Estudios Sociales

Sin datos todavía. Se completan con el mismo script antes de escribir cada
examen.
