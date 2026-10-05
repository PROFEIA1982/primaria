/**
 * Lo que comparten el verificador y el generador de la migracion de los
 * simulacros nuevos: leer el examen de docs/simulacros-nuevos/<materia>.json
 * y armar el texto final de cada item tal como lo va a ver el estudiante.
 *
 * Vive aparte para que los dos lean el examen EXACTAMENTE igual. Si cada uno
 * armara el enunciado a su manera, el verificador podria aprobar un texto y
 * la migracion cargar otro.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_DOCS = path.join(RAIZ, 'docs', 'simulacros-nuevos');
export const DIR_FIGURAS = path.join(RAIZ, 'public', 'simulacros-nuevos');
// Ruta publica de las figuras: Vite sirve public/ en la raiz del sitio.
export const URL_FIGURAS = '/simulacros-nuevos/';

export const MATERIAS = ['espanol', 'estudios-sociales', 'ciencias', 'matematicas'];
export const LETRAS = ['A', 'B', 'C', 'D'];
export const NIVELES = ['intermedio', 'alto'];

// Marca que se escribe en el enunciado donde va la figura. Se reemplaza por
// la imagen en Markdown, con su texto alternativo. Asi la figura sale en el
// examen Y en la revision de resultados, que solo pinta el enunciado.
export const MARCA_FIGURA = '[[figura]]';

export function leerExamen(materia) {
  if (!MATERIAS.includes(materia)) {
    throw new Error(`Materia desconocida: "${materia}". Use una de: ${MATERIAS.join(', ')}.`);
  }
  const ruta = path.join(DIR_DOCS, `${materia}.json`);
  if (!fs.existsSync(ruta)) throw new Error(`No existe ${path.relative(RAIZ, ruta)}.`);
  const datos = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  return { ruta, ...datos };
}

/** El enunciado con la figura ya puesta en Markdown. */
export function enunciadoFinal(item) {
  if (!item.imagen) return item.enunciado;
  const alt = item.imagen.alt.replace(/[[\]]/g, '');
  return item.enunciado.replace(MARCA_FIGURA, `![${alt}](${URL_FIGURAS}${item.imagen.archivo})`);
}

/** Si el item trae formulas: el signo de dolar sin barra delante abre LaTeX. */
export function tieneLatex(item) {
  const textos = [item.enunciado, ...Object.values(item.opciones)];
  return textos.some((t) => /(^|[^\\])\$/.test(t));
}

/** Texto plano aproximado, para medir largos y comparar parecidos. */
export function textoPlano(t) {
  return t
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[$*_`|{}\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
