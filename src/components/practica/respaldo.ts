// ============================================================
// El respaldo de la practica, en el aparato del chiquito.
//
// Una practica de sesenta preguntas es un rato largo y la pestana se
// cierra sola: Android mata la pestana de atras, el hermano toca el
// boton de volver, se acaba la bateria. Sin esto, el que iba en la 45
// perdia las 45 y no habia nada que hacer. El simulacro ya se
// respaldaba; la practica no, y era la que mas dura.
//
// Va en DOS llaves y no en una, a proposito:
//   · ps_practica_items: las preguntas completas. Se escriben UNA sola
//     vez, al arrancar. Con sesenta items son unos 140 KB.
//   · ps_practica_curso: en cual va y que lleva contestado. Unos
//     cientos de bytes, y se reescribe con cada toque.
// JSON.stringify y localStorage.setItem son sincronos y bloquean el
// hilo de la pantalla: volver a serializar 140 KB cada vez que el
// chiquito toca una opcion SE SIENTE en un celular barato. Partido en
// dos, cada toque paga solo los cientos de bytes.
//
// LA PRACTICA NO LLEVA RELOJ (ver la cabecera de usePractica.ts), asi
// que aca no hay hora de vencimiento y el respaldo no caduca. Vive
// hasta que el estudiante termine, arranque otra practica, toque
// "Empezar de cero" o le borren el historial al navegador.
//
// Nada de esto viaja a un servidor. Todo pasa por lib/almacen.ts, que
// se traga los errores de localStorage: en modo incognito o con el
// almacenamiento cerrado por politica del equipo, sencillamente no hay
// respaldo y la practica funciona igual.
// ============================================================

import type { SlugMateria } from "../../config";
import { borrarLlaves, guardarJSON, leerJSON } from "../../lib/almacen";
import type { Item } from "../../lib/tipos";
import { sonItemsSanos } from "../../lib/validar";
import type { Respuestas } from "./calificar";

const LLAVE_ITEMS = "ps_practica_items";
const LLAVE_CURSO = "ps_practica_curso";

// La parte liviana. `materia` va aca y no con los items porque es lo
// que decide si el respaldo le sirve a la pantalla que se esta viendo,
// y eso se quiere saber sin leer los 140 KB.
type Curso = {
  materia: string;
  indice: number;
  respuestas: Respuestas;
};

export type RespaldoPractica = {
  materia: SlugMateria;
  items: Item[];
  indice: number;
  respuestas: Respuestas;
};

// Lo que sale de localStorage se revisa entero, sin confiar: lo pudo
// escribir una version de la app de hace un mes, o quedar a medias
// porque el navegador cerro la pestana a mitad de la escritura. Un
// `as Curso` no revisa nada en tiempo de ejecucion y el error saldria
// mucho despues, con la practica ya abierta y las respuestas corridas.
function esCurso(x: unknown): x is Curso {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.materia === "string" &&
    typeof c.indice === "number" &&
    Number.isFinite(c.indice) &&
    Array.isArray(c.respuestas) &&
    c.respuestas.every((r) => r === null || typeof r === "string")
  );
}

/** Se llama una sola vez por practica, al arrancar. */
export function guardarItems(items: Item[]): void {
  guardarJSON(LLAVE_ITEMS, items);
}

/** Se llama con cada respuesta y cada cambio de pregunta. */
export function guardarCurso(
  materia: SlugMateria,
  indice: number,
  respuestas: Respuestas,
): void {
  const curso: Curso = { materia, indice, respuestas };
  guardarJSON(LLAVE_CURSO, curso);
}

export function borrarRespaldo(): void {
  borrarLlaves(LLAVE_ITEMS, LLAVE_CURSO);
}

/**
 * El respaldo, solo si sirve para la materia que se esta viendo. Si algo
 * no calza se descarta completo y se devuelve null: al estudiante no se
 * le dice nada porque no hay nada que pueda hacer al respecto, y un
 * aviso de "se dano tu respaldo" antes de practicar solo asusta.
 */
export function leerRespaldo(materia: SlugMateria): RespaldoPractica | null {
  const curso = leerJSON(LLAVE_CURSO);
  if (!esCurso(curso)) {
    // Sin la parte liviana, los items guardados no sirven para nada y
    // son 140 KB comiendose la cuota. Se van los dos.
    borrarRespaldo();
    return null;
  }

  // De otra materia: no se toca nada. Quien salta de Matematicas a
  // Ciencias por el menu tiene que encontrar su practica de
  // Matematicas cuando vuelva.
  if (curso.materia !== materia) return null;

  const items = leerJSON(LLAVE_ITEMS);
  if (!sonItemsSanos(items)) {
    borrarRespaldo();
    return null;
  }
  // Una respuesta por pregunta. Si no calzan, las respuestas quedarian
  // corridas y la nota no significaria nada.
  if (curso.respuestas.length !== items.length) {
    borrarRespaldo();
    return null;
  }

  // Al indice si se le perdona lo que se puede: se acota y ya. Que
  // aparezca en otra pregunta es molesto; botarle las respuestas por
  // eso, no.
  const indice = Math.min(Math.max(Math.trunc(curso.indice), 0), items.length - 1);
  return { materia, items, indice, respuestas: curso.respuestas };
}
