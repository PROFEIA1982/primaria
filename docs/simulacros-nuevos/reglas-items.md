# Simulacros nuevos · reglas de los ítems

Este documento lo leen las sesiones que armen los exámenes de Español, Ciencias
y Estudios Sociales. Las reglas son las mismas del piloto de Matemáticas
(octubre de 2026). Si una regla cambia, se cambia aquí primero.

## Fuentes que mandan

1. **Marco de especificaciones 2026 de la materia** (MEP, Dirección de Gestión y
   Evaluación de la Calidad). Su Tabla 2 define los bloques, las afirmaciones y
   las evidencias. Todo ítem se ancla a una evidencia de esa tabla; lo que la
   tabla no incluye, no entra. En Matemáticas, por ejemplo, quedaron fuera
   potencias, longitud de la circunferencia, suma de ángulos internos,
   pirámides, volumen y razones.
2. **Ítems oficiales de la materia** (la prueba de práctica del MEP). Dan el
   estilo y la proporción por bloque. No se copian ni se parafrasean.
3. Estas reglas.

## Formato de cada examen

- **60 ítems** por examen, **3 minutos por ítem**: tres horas en total, igual
  que los cuadernillos de siempre. La cantidad va en el JSON
  (`simulacro.preguntas`) y el tiempo en la base (`segundos_por_item`), no en
  el código.
  - Ojo: la prueba nacional diagnóstica 2026 es de 40 ítems en 120 minutos
    (marco de especificaciones). Los simulacros de la app son más largos a
    propósito, para practicar con holgura.
- Los 60 ítems se reparten entre los bloques **en la misma proporción que los
  ítems oficiales de la materia** (resto mayor, suma exacta 60). En
  Matemáticas, con 50 oficiales (14 de Números, 12 de Geometría, 8 de Medidas,
  10 de Relaciones y Álgebra y 6 de Estadística y Probabilidad), quedó en
  17, 14, 10, 12 y 7.
- Orden: agrupados por bloque en el orden del marco, y cada bloque arranca con
  un ítem de nivel intermedio.
- **Claves balanceadas:** A, B, C y D son la clave exactamente 15 veces cada
  una. Sin tres claves iguales seguidas, sin escaleras (ABCD, DCBA) y sin
  vaivenes (ABAB).

## Reglas de redacción

- Sexto grado, programa de estudio del MEP vigente, contexto costarricense:
  nombres, lugares, colones, situaciones de escuela y comunidad.
- **Originales.** Prohibido copiar o parafrasear de cerca un enunciado del
  banco. Cada enunciado nuevo se compara contra los publicados de su materia
  (`pnpm verificar:simulacros-nuevos <materia>` lo hace si tiene las variables
  de Supabase) y se descarta el que se parezca demasiado.
- **Nivel intermedio a alto:** comprender, aplicar, analizar o resolver
  problemas de varios pasos, no solo recordar. En Matemática, resolución de
  problemas, argumentación y representaciones múltiples. En Español, lectura
  comprensiva de textos breves **originales**.
- **Cuatro opciones, una sola correcta y defendible.** Distractores plausibles
  que representen errores reales de un niño de sexto (cálculo típico,
  confusión de conceptos cercanos), nunca absurdos.
- **Opciones equilibradas** en extensión y estructura gramatical. La correcta
  no puede ser la más larga ni repetir palabras del enunciado. Prohibido
  «todas las anteriores» y «ninguna de las anteriores».
- Opciones numéricas en orden ascendente; la clave se acomoda escogiendo los
  distractores, no desordenando las opciones.
- **Estilo oficial:** enunciados con datos completos y cierres como «De acuerdo
  con la información anterior, …»; tablas cuando ordenan la información;
  contextos variados (personal, ocupacional y productivo, comunitario,
  científico, como define el marco). Nombres variados, sin repetir, con
  equilibrio de género.
- **Por qué de cada distractor:** en `por_que`, una frase con el error que
  representa cada opción incorrecta. Si no se puede escribir, el distractor
  no sirve.
- **Explicación breve para niños:** dos o tres oraciones, cálidas y claras,
  que digan por qué la correcta es correcta. Va en **texto plano**: la revisión
  de resultados no dibuja LaTeX, así que se escribe 2/5, ×, ÷.
- Vocabulario del sistema educativo costarricense. Nada de contenido de otros
  países.
- **Geometría sin figuras** cuando la figura se puede describir con palabras
  (decisión del 5 de octubre de 2026): se describe la forma y sus medidas.
- **No se inventan datos** históricos, geográficos ni científicos. Si un dato
  no es seguro, se cambia el ítem. Los datos de un problema (precios,
  distancias) se dan en el enunciado como datos del problema, no como hechos
  del mundo real.
- Números: coma decimal (2,5 kg). Miles con espacio duro desde cinco cifras
  (₡47 100, con ` ` en el JSON); las de cuatro cifras van pegadas (₡8500),
  igual que el banco.
- Fórmulas con `$...$` (nunca `\( \)`). Fracciones con `$\frac{2}{5}$`. Coma
  decimal dentro de una fórmula: `3{,}14`.

## Campos de cada ítem (JSON)

```json
{
  "id": "mat-n01",            // prefijo de materia + tema + número; no se reusa
  "orden": 1,                  // posición en el examen, 1 a 60
  "materia": "matematicas",    // espanol | estudios-sociales | ciencias | matematicas
  "tema": "Números",
  "subtema": "Operaciones combinadas con números naturales",
  "nivel": "intermedio",       // intermedio | alto
  "afirmacion": { "codigo": "N4", "texto": "…" },      // Tabla 2 del marco
  "evidencia":  { "codigo": "N4.2", "texto": "…" },    // N4.2 = Números, afirmación 4, evidencia 2
  "enunciado": "… [[figura]] …",
  "opciones": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "clave": "B",
  "explicacion": "Dos o tres oraciones.",
  "por_que": { "A": "…", "C": "…", "D": "…" },      // solo los distractores
  "imagen": null               // o { "archivo": "mat-g01-huerta.svg", "alt": "…" }
}
```

### Materias con contexto (Estudios Sociales, Ciencias)

Siguen el marco 2026 al pie de la letra: cada ítem trae un contexto aparte y
el enunciado es solo la pregunta. En la base van juntos, el contexto primero.
Además de los campos de arriba, cada ítem lleva:

```json
{
  "bloque": "Costa Rica: su construcción histórica, geográfica y ciudadana",
  "afirmacion": { "codigo": "2.15", "texto": "…" },   // bloque 2, afirmación 15
  "evidencia":  { "codigo": "2.15.2", "texto": "…" },
  "verbo": "relacionar",                 // los verbos de la Tabla 1 del marco
  "tipo_contexto": "espacial",           // los tipos de contexto del marco
  "contexto": "Lea el siguiente texto:\n\nTexto original de 40 a 90 palabras…",
  "enunciado": "Según el texto anterior, ¿…?"
}
```

- La primera línea del contexto es la apertura del MEP ("Lea el siguiente
  texto:", "Analice la siguiente tabla:", "Observe el siguiente esquema:").
- Los contextos son originales: nada de "Adaptado de" ni "Tomado de". El
  verificador lo revisa.
- La clave no repite palabras del contexto (el verificador mira contexto y
  enunciado juntos).
- Cada materia define en `scripts/simulacros-nuevos/verificar.mjs` sus verbos,
  sus tipos de contexto y el largo del contexto.

La carga de estas materias se genera como migración propia, dentro de una
transacción y con una copia para pegar en el editor SQL de Supabase:

```bash
pnpm generar:simulacros-nuevos estudios-sociales --nombre simulacro_estudios_sociales \
  --copia docs/simulacros-nuevos/cargar-estudios-sociales.sql --banco-archivo <respaldo>.json
```

`--banco-archivo` compara contra un respaldo del banco cuando no hay acceso a
Supabase; si se vuelve a generar, se reescribe la misma migración.

El bloque `simulacro` del archivo trae `slug`, `materia`, `numero`, `titulo`,
`preguntas`, `segundos_por_item`, `barajar_opciones` (false: las opciones salen en el orden
A-D con que se balancearon las claves) y `version`.

## Imágenes

- Figuras, gráficos, tablas visuales, mapas sencillos y diagramas: **SVG hechos
  en código**, guardados en `public/simulacros-nuevos/`.
- Cada SVG lleva `role="img"` y un `<title>` descriptivo, y cada ítem trae su
  `alt` en el JSON: texto alternativo que describe los datos que hacen falta
  para contestar (medidas, valores de las barras), no solo «una figura».
- **Nada de imágenes de URLs externas.**
- Donde va la figura se escribe `[[figura]]` en el enunciado; el generador la
  cambia por la imagen en Markdown. Así sale en el examen y en la revisión de
  resultados.
- Si hay un servidor MCP de imágenes funcionando, se puede usar para
  ilustraciones, guardando el archivo dentro del repositorio. Si no hay, se
  sigue con SVG.
- Fondo blanco propio en cada SVG: se ve igual en modo claro y oscuro.

## Audio

Se usa la lectura en voz alta que ya trae la app. No se generan archivos de
audio. Ojo: la voz lee las fórmulas como texto (`\frac{2}{5}`), así que
conviene usar LaTeX solo donde haga falta.

## Cómo se agrega una materia

1. Escribir `docs/simulacros-nuevos/<materia>.json` siguiendo estas reglas, y
   su tabla legible `docs/simulacros-nuevos/<materia>.md`.
2. Dibujar las figuras en `public/simulacros-nuevos/`.
3. `pnpm verificar:simulacros-nuevos <materia>` hasta que salga sin errores
   (con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para comparar contra el
   banco).
4. Resolver cada ítem paso a paso y hacer una segunda pasada como revisor
   crítico: dos respuestas defendibles, pistas por largo, cálculos que no dan,
   datos dudosos.
5. `pnpm generar:simulacros-nuevos <materia>` crea una migración nueva **solo
   con datos** en `supabase/migrations/`. El esquema ya existe. Exige la
   comparación contra el banco; sin acceso a la base hay que pedirlo con
   `--sin-banco`, y queda anotado en el SQL.
6. Aplicar la migración en Supabase. La tarjeta de la materia pasa sola de
   «Próximamente» a «Listo para hacer»: no se toca código.
