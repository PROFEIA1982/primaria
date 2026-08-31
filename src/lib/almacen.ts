// ============================================================
// localStorage sin sustos.
//
// En modo incognito, con el almacenamiento bloqueado por politica del
// equipo, o con la cuota llena, localStorage tira excepcion hasta para
// LEER. Estas tres funciones se tragan el error y devuelven algo util,
// para que ninguna pantalla de la app se caiga por no poder guardar.
//
// Nada de esto viaja a un servidor. No hay cuentas en esta app: lo que
// se guarda vive en el aparato del chiquito y se va con el historial
// del navegador, y esta bien que asi sea.
// ============================================================

export function leerJSON(llave: string): unknown {
  try {
    const crudo = localStorage.getItem(llave);
    if (!crudo) return null;
    return JSON.parse(crudo) as unknown;
  } catch {
    return null;
  }
}

/**
 * Devuelve false si no se pudo guardar (cuota llena, modo privado, el
 * navegador con el almacenamiento cerrado). Quien llama decide si eso
 * importa; casi siempre no importa y se sigue de largo.
 */
export function guardarJSON(llave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(llave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function borrarLlaves(...llaves: string[]): void {
  for (const llave of llaves) {
    try {
      localStorage.removeItem(llave);
    } catch {
      // No poder borrar tampoco puede romper nada.
    }
  }
}
