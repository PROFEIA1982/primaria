// ============================================================
// Revisar que lo que llega tenga la forma que decimos que tiene.
//
// Vive aparte porque los mismos datos entran por dos puertas y las dos
// mienten igual de facil:
//   · el servidor, con una respuesta a medias o de una version vieja
//   · localStorage, con un respaldo que escribio la app de hace un mes
//
// Una asercion de tipo (`as Item[]`) no revisa nada en tiempo de
// ejecucion: si viene un item con `opciones` en null, TypeScript se
// queda tranquilo y ItemRenderer revienta a mitad del examen. Ahi el
// chiquito se queda con la pantalla en blanco y sin salida. Mejor
// enterarse aca y decirle que no se pudo abrir.
// ============================================================

import type { Item, Simulacro } from "./tipos";

// Una pregunta sirve si tiene enunciado y al menos dos opciones, con
// UNA sola correcta. Con cero correctas no se puede calificar; con dos,
// la nota que saque el chiquito no significa nada.
export function esItemSano(x: unknown): x is Item {
  if (typeof x !== "object" || x === null) return false;
  const i = x as Record<string, unknown>;
  if (typeof i.id !== "string" || typeof i.enunciado !== "string") return false;
  if (!Array.isArray(i.opciones) || i.opciones.length < 2) return false;
  let correctas = 0;
  for (const o of i.opciones as unknown[]) {
    if (typeof o !== "object" || o === null) return false;
    const op = o as Record<string, unknown>;
    if (typeof op.id !== "string" || typeof op.texto !== "string") return false;
    if (op.es_correcta === true) correctas += 1;
  }
  return correctas === 1;
}

export function sonItemsSanos(x: unknown): x is Item[] {
  return Array.isArray(x) && x.length > 0 && x.every(esItemSano);
}

export function esCuadernilloSano(x: unknown): x is Simulacro {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  if (typeof c.slug !== "string") return false;
  return sonItemsSanos(c.items);
}
