/**
 * Las revisiones de formato del banco de items, sin nada de entrada ni salida.
 *
 * Viven aparte del script que las corre para poder probarlas solas: vea
 * scripts/revisiones.prueba.mjs, que las alimenta con los textos exactos que
 * estaban rotos antes del arreglo de agosto de 2026. Un detector que nunca
 * encuentra nada se ve igual que uno bien hecho, y esa prueba es la unica que
 * distingue los dos casos.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import katex from 'katex';

// Misma cadena que arma ItemRenderer en la aplicacion. Si algo se ve mal en
// pantalla, se ve mal aca: por eso la revision sirve de algo.
const render = unified()
  .use(remarkParse).use(remarkMath).use(remarkGfm)
  .use(remarkRehype).use(rehypeKatex).use(rehypeStringify);

/**
 * Cada revision recibe un texto y devuelve una lista de quejas. Estan
 * separadas para poder agregar una nueva sin tocar las demas.
 */
export const REVISIONES = [
  {
    nombre: 'delimitador de otro dialecto',
    ayuda: 'Cambie \\( ... \\) por $ ... $ y \\[ ... \\] por $$ ... $$',
    revisar(t) {
      const quejas = [];
      if (t.includes('\\(') || t.includes('\\)')) quejas.push('usa \\( \\) en vez de $ $');
      if (t.includes('\\[') || t.includes('\\]')) quejas.push('usa \\[ \\] en vez de $$ $$');
      return quejas;
    },
  },
  {
    nombre: 'comando de LaTeX sin delimitador',
    ayuda: 'Envuelva la formula entre signos de dolar: $\\frac{1}{2}$',
    revisar(t) {
      // Se quita lo que ya esta entre dolares y se mira si queda un comando
      // suelto. Sin esto, una formula bien escrita se denunciaria a si misma.
      const fuera = t.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, '');
      const m = fuera.match(/\\(frac|times|div|cdot|sqrt|pm|leq|geq|neq)\b/);
      return m ? [`"${m[0]}" queda fuera de todo $`] : [];
    },
  },
  {
    nombre: 'signos de dolar sin pareja',
    ayuda: 'Cada $ de apertura necesita su $ de cierre',
    revisar(t) {
      const cuantos = (t.match(/\$/g) ?? []).length;
      return cuantos % 2 === 1 ? [`hay ${cuantos} signos $, o sea uno sin pareja`] : [];
    },
  },
  {
    nombre: 'formula que KaTeX no puede dibujar',
    ayuda: 'Revise la sintaxis de la formula',
    revisar(t) {
      const quejas = [];
      const trozos = [...t.matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)].map((m) => m[1] ?? m[2]);
      for (const f of trozos) {
        try {
          katex.renderToString(f, { throwOnError: true, strict: false });
        } catch (e) {
          quejas.push(`"${f.slice(0, 40)}" -> ${String(e.message).slice(0, 90)}`);
        }
      }
      return quejas;
    },
  },
  {
    nombre: 'tabla mal armada',
    ayuda: 'Toda fila necesita el mismo numero de columnas y una sola linea | --- |',
    revisar(t) {
      const filas = t.split('\n').filter((l) => l.trim().startsWith('|'));
      if (filas.length === 0) return [];
      const quejas = [];
      const separadoras = filas.filter((l) => /^\s*\|[\s:|-]+\|\s*$/.test(l));
      if (separadoras.length !== 1) {
        quejas.push(`tiene ${separadoras.length} lineas de separacion y debe tener una`);
      }
      const anchos = new Set(filas.map((l) => l.split('|').length));
      if (anchos.size > 1) {
        quejas.push(`las filas no tienen el mismo numero de columnas (${[...anchos].join(', ')})`);
      }
      return quejas;
    },
  },
  {
    nombre: 'tabla aplastada',
    ayuda: 'La tabla se perdio al migrar: rearmela con pipes',
    revisar(t) {
      // Habla de una tabla pero no trae ninguna. Es la firma exacta del
      // destrozo de la migracion desde Moodle: las celdas quedan sueltas, una
      // por renglon, entre montones de lineas vacias.
      if (!/\b(la siguiente tabla|siguiente cuadro|se presenta una tabla)\b/i.test(t)) return [];
      if (t.includes('|')) return [];
      const rachas = t.match(/\n{3,}/g) ?? [];
      return rachas.length >= 3
        ? ['menciona una tabla, no trae ninguna, y tiene celdas sueltas entre lineas vacias']
        : ['menciona una tabla pero no trae ninguna'];
    },
  },
  {
    nombre: 'queda algo crudo al renderizar',
    ayuda: 'El estudiante veria esto tal cual',
    revisar(t) {
      let html;
      try {
        html = String(render.processSync(t));
      } catch (e) {
        return [`el renderizador se cayo: ${String(e.message).slice(0, 90)}`];
      }
      // KaTeX guarda el fuente original dentro de <annotation>. Hay que
      // quitarlo antes de buscar comandos crudos, o toda formula bien
      // renderizada se acusa a si misma.
      const visible = html
        .replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, '')
        .replace(/<[^>]+>/g, '');
      const quejas = [];
      if (/\\(frac|times|div|cdot|sqrt)/.test(visible)) quejas.push('se ve un comando de LaTeX en pantalla');
      if (visible.includes('$'))                        quejas.push('se ve un signo $ en pantalla');
      if (/\|\s*---/.test(visible))                     quejas.push('la tabla no se convirtio');
      if (html.includes('katex-error'))                 quejas.push('KaTeX marco error');
      return quejas;
    },
  },
];

/** Corre todas las revisiones sobre un texto y devuelve las quejas con su tipo. */
export function revisarTexto(texto) {
  if (!texto) return [];
  return REVISIONES.flatMap((r) => r.revisar(texto).map((queja) => ({ tipo: r.nombre, ayuda: r.ayuda, queja })));
}

/**
 * Revisiones que miran el item completo y no un texto suelto. Solo opina de
 * las opciones si se pudieron ver todas: con la llave anon a veces no se
 * alcanzan, y acusar a un item por opciones que no se leyeron es peor que
 * callarse.
 */
export function revisarEstructura(item) {
  const quejas = [];

  if (!item.enunciado?.trim()) quejas.push('no tiene enunciado');

  // Un enunciado que termina justo donde acaba la tabla suele ser un item al
  // que la migracion le corto la pregunta final. Paso de verdad: el item
  // 32495 quedo sin pregunta y hubo que despublicarlo.
  if (item.enunciado?.trimEnd().endsWith('|')) {
    quejas.push('el enunciado termina en la tabla: puede faltarle la pregunta');
  }

  if (!item.opcionesCompletas) return quejas;

  const ops = item.opciones ?? [];
  if (ops.length !== 4) quejas.push(`tiene ${ops.length} opciones y deberian ser 4`);

  const buenas = ops.filter((o) => o.es_correcta).length;
  if (buenas !== 1) quejas.push(`tiene ${buenas} respuestas marcadas como correctas y debe haber 1`);

  const normal = (s) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[.,;]$/, '').trim();
  const vistas = new Set();
  for (const o of ops) {
    const n = normal(o.texto);
    if (vistas.has(n)) quejas.push(`la opcion "${o.texto.slice(0, 40)}" esta repetida`);
    vistas.add(n);
  }

  return quejas;
}
