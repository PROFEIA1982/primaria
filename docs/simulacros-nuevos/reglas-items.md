# Simulacros nuevos · reglas de los ítems

Este documento lo leen las sesiones que armen los exámenes de Español, Ciencias
y Estudios Sociales. Las reglas son las mismas del piloto de Matemáticas
(octubre de 2026). Si una regla cambia, se cambia aquí primero.

## Formato de cada examen

- **40 ítems** por examen, **3 minutos por ítem**: dos horas en total. El
  tiempo vive en la base (`segundos_por_item`), no en el código.
- Los 40 ítems se reparten entre los temas de la materia **en la misma
  proporción que el banco actual** (ver `inventario.md` y el script de
  inventario más abajo).
- Orden: agrupados por tema, y cada bloque arranca con un ítem de nivel
  intermedio.
- **Claves balanceadas:** A, B, C y D son la clave exactamente 10 veces cada
  una. Sin tres claves iguales seguidas, sin escaleras (ABCD, DCBA) y evitando
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
- **Explicación breve para niños:** dos o tres oraciones, cálidas y claras,
  que digan por qué la correcta es correcta. Va en **texto plano**: la revisión
  de resultados no dibuja LaTeX, así que se escribe 2/5, ×, ÷.
- Vocabulario del sistema educativo costarricense. Nada de contenido de otros
  países.
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
  "orden": 1,                  // posición en el examen, 1 a 40
  "materia": "matematicas",    // espanol | estudios-sociales | ciencias | matematicas
  "tema": "Números",
  "subtema": "Operaciones combinadas con números naturales",
  "nivel": "intermedio",       // intermedio | alto
  "enunciado": "… [[figura]] …",
  "opciones": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "clave": "B",
  "explicacion": "Dos o tres oraciones.",
  "imagen": null               // o { "archivo": "mat-g01-huerta.svg", "alt": "…" }
}
```

El bloque `simulacro` del archivo trae `slug`, `materia`, `numero`, `titulo`,
`segundos_por_item`, `barajar_opciones` (false: las opciones salen en el orden
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
   con datos** en `supabase/migrations/`. El esquema ya existe.
6. Aplicar la migración en Supabase. La tarjeta de la materia pasa sola de
   «Próximamente» a «Listo para hacer»: no se toca código.
