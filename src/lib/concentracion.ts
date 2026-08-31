// ============================================================
// Modo concentracion: mientras el estudiante contesta un item, la
// pantalla se queda con el item y nada mas.
//
// Por que existe: el manual de accesibilidad de las pruebas
// estandarizadas de Massachusetts (MCAS 2025-26) lista entre sus
// funciones universales -- las que aplican a TODO estudiante, no solo a
// quien tiene adecuacion -- tapar de la pantalla todo lo que no sea el
// item. Nielsen Norman Group encontro lo mismo por el otro lado: los
// preadolescentes se abruman con pantallas recargadas y escanean en vez
// de leer. Un menu de seis materias parpadeando arriba mientras un
// chiquito lee un enunciado de comprension es exactamente lo que hay
// que quitar.
//
// Vive en un almacen de modulo y no en un contexto de React porque
// quien lo prende (la pagina de la materia) y quien lo obedece (el
// armazon de la app) estan en ramas distintas del arbol, y meterlos en
// un proveedor comun obligaria a envolver todo por un booleano.
//
// La barra de accesibilidad NO se esconde: quien necesita agrandar el
// texto lo necesita justo cuando esta leyendo.
// ============================================================

import { useSyncExternalStore } from "react";

let concentrado = false;
const oyentes = new Set<() => void>();

function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

function leer(): boolean {
  return concentrado;
}

/** Lo llama la pagina que abre un examen; y lo apaga al salir. */
export function ponerConcentracion(valor: boolean): void {
  if (concentrado === valor) return;
  concentrado = valor;
  oyentes.forEach((fn) => fn());
}

export function useConcentracion(): boolean {
  return useSyncExternalStore(suscribir, leer, () => false);
}
