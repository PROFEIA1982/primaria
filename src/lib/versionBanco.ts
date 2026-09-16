// ============================================================
// Version del banco de items.
//
// La practica y el simulacro guardan una copia de sus preguntas en el
// aparato del estudiante para que no se pierda el trabajo si se cierra
// la pestana. Esa copia se queda vieja cuando el banco se corrige en la
// base (claves, opciones, enunciados). Cada vez que se corrige el banco
// se cambia VERSION_BANCO: al abrir la app, si la version guardada no es
// esta, se botan las copias a medias y todo vuelve a salir fresco.
//
// No se tocan las notas de los simulacros (ps_simulacros) ni los ajustes
// de accesibilidad: eso no depende del contenido de los items.
// ============================================================

import { borrarLlaves } from "./almacen";

export const VERSION_BANCO = "2026-09-16";

const LLAVE_VERSION = "ps_version_banco";

// Llaves que guardan preguntas o avances a medias. Si se agrega otra
// copia local de items, hay que sumarla aqui.
const COPIAS_DE_ITEMS = [
  "ps_practica_items",
  "ps_practica_curso",
  "ps_simulacro_curso",
  "ps_simulacro_cuadernillo",
];

/** Devuelve true si hubo que limpiar (sirve para probarlo). */
export function purgarCopiasViejas(): boolean {
  let guardada: string | null = null;
  try {
    guardada = localStorage.getItem(LLAVE_VERSION);
  } catch {
    return false; // sin almacenamiento no hay copias que limpiar
  }
  if (guardada === VERSION_BANCO) return false;
  borrarLlaves(...COPIAS_DE_ITEMS);
  try {
    localStorage.setItem(LLAVE_VERSION, VERSION_BANCO);
  } catch {
    // Si no se pudo anotar la version, la proxima carga limpia otra vez.
    // Es barato y no rompe nada.
  }
  return true;
}
