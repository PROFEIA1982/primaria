# Scripts de mantenimiento

## `pnpm verificar:items`

Revisa el banco de ítems buscando los problemas de formato que se ven feos en
pantalla. Sale con código 1 si encuentra algo, así que sirve tal cual en un
gancho de pre-despliegue o en integración continua.

**Por qué existe.** En agosto de 2026 aparecieron en el sitio 41 ítems de
matemáticas que mostraban esto, en texto plano, donde debía ir una fórmula:

```
A   ( (15 \times 150) + (10 \times75) )
```

Venían con los delimitadores de otro dialecto de LaTeX, `\( ... \)` en vez de
`$ ... $`. El renderizador solo entiende el segundo, así que Markdown se comía
la barra invertida y dejaba el comando a la vista. Nadie lo notó hasta que un
estudiante lo tenía enfrente. Este script existe para que la próxima vez se
note antes de publicar.

**Qué revisa.**

- Delimitadores de otro dialecto: `\( \)` y `\[ \]`.
- Comandos de LaTeX que quedaron fuera de todo `$`.
- Signos de dólar sin pareja.
- Que cada fórmula la pueda dibujar KaTeX de verdad, no que *parezca* válida.
- Tablas mal armadas: columnas disparejas o sin la línea `| --- |`.
- Tablas aplastadas: el ítem habla de una tabla y no trae ninguna, con las
  celdas sueltas entre líneas vacías. Es la firma exacta del destrozo de la
  migración desde Moodle.
- Que al renderizar no quede nada crudo a la vista: ni comandos, ni signos de
  dólar, ni tablas sin convertir, ni errores de KaTeX.
- Estructura: cuatro opciones, una sola correcta, sin opciones repetidas, y
  enunciados que no terminen justo donde acaba la tabla (señal de que la
  migración les cortó la pregunta).

La revisión de renderizado usa **la misma cadena de bibliotecas que la
aplicación** (`remark-math` + `remark-gfm` + `rehype-katex`). Si algo se ve mal
en pantalla, se ve mal acá.

**Cobertura.** Los enunciados se revisan todos, siempre. Las opciones salen por
`sortear_items`, que entrega 60 por llamada y al azar, porque la tabla
`opciones` está cerrada a propósito: tiene la columna `es_correcta`, o sea la
respuesta, y abierta le diría al estudiante cuáles son los fáciles. El script
insiste hasta que deja de aparecer material nuevo y reporta con franqueza qué
porcentaje alcanzó a ver. Con el banco actual llega al 100 %.

Si quiere cobertura total garantizada en una sola pasada, exporte la llave de
servicio antes de correrlo:

```sh
export SUPABASE_SERVICE_ROLE_KEY='...'   # del panel de Supabase, en Settings → API
pnpm verificar:items
```

Esa llave **no se imprime ni se guarda** en ningún lado: solo viaja en la
cabecera de la petición. No la ponga en `.env.local` si ese archivo puede
terminar en el repositorio, y no la comparta: da acceso total, saltándose RLS.

Sin esa variable el script funciona igual, con la llave anon de `.env.local`.

## `pnpm probar:revisiones`

Prueba las revisiones contra textos que sí están rotos y contra textos sanos.

Un detector que nunca encuentra nada se ve exactamente igual que uno bien
hecho. Esta prueba es la que distingue los dos casos: si alguien toca
`revisiones.mjs` y lo rompe, acá se nota. Los casos rotos son los textos
reales que tenía el banco antes del arreglo, copiados tal cual.

## Archivos

| Archivo | Qué es |
|---|---|
| `revisiones.mjs` | Las revisiones, sin entrada ni salida. Puro texto que entra, quejas que salen. |
| `verificar-items.mjs` | Trae los ítems de Supabase y les aplica las revisiones. |
| `revisiones.prueba.mjs` | La prueba de las revisiones. |

Están separados así para que las revisiones se puedan probar solas, sin tocar
la base.

## Para agregar una revisión nueva

Agregue un objeto a `REVISIONES` en `revisiones.mjs`:

```js
{
  nombre: 'como se llama el problema',
  ayuda: 'que hay que hacer para arreglarlo',
  revisar(t) { return /* lista de quejas, o [] si esta bien */; },
}
```

Y agréguele su caso a `revisiones.prueba.mjs`: uno roto que deba detectar y uno
sano que deba dejar pasar. Sin las dos mitades la prueba no dice nada.
