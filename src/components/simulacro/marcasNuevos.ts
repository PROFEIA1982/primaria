// ============================================================
// Lo que los examenes nuevos guardan en el aparato del chiquito.
//
// Misma arquitectura que marcas.ts, pero con llaves separadas
// para que los datos de examenes nuevos no se mezclen con los
// cuadernillos viejos.
//
// Nada viaja a ningun servidor. Sin cuentas: si borra historial,
// se va, y esta bien.
// ============================================================

import type { SimulacroNuevo } from "../../lib/tipos";
import { esCuadernilloSano } from "../../lib/validar";

const LLAVE = "ps_examenes_nuevos";
const LLAVE_CURSO = "ps_examen_nuevo_curso";
const LLAVE_CUADERNILLO = "ps_examen_nuevo_cuadernillo";

export type MarcaExamen = {
  intentos: number;
  mejor: number;
  ultima: number;
};

type Guardado = Record<string, MarcaExamen>;

function esMarca(x: unknown): x is MarcaExamen {
  if (typeof x !== "object" || x === null) return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m.intentos === "number" &&
    typeof m.mejor === "number" &&
    typeof m.ultima === "number"
  );
}

export function leerMarcas(): Guardado {
  try {
    const crudo = localStorage.getItem(LLAVE);
    if (!crudo) return {};
    const dato: unknown = JSON.parse(crudo);
    if (typeof dato !== "object" || dato === null) return {};
    const limpio: Guardado = {};
    for (const [slug, valor] of Object.entries(dato as Record<string, unknown>)) {
      if (esMarca(valor)) limpio[slug] = valor;
    }
    return limpio;
  } catch {
    return {};
  }
}

export function guardarIntento(slug: string, nota: number): Guardado {
  const previo = leerMarcas();
  const antes = previo[slug];
  const marca: MarcaExamen = {
    intentos: (antes?.intentos ?? 0) + 1,
    mejor: Math.max(antes?.mejor ?? 0, nota),
    ultima: nota,
  };
  const nuevo = { ...previo, [slug]: marca };
  try {
    localStorage.setItem(LLAVE, JSON.stringify(nuevo));
  } catch {
    // silencio: devuelve el objeto para la pantalla
  }
  return nuevo;
}

// --- El intento en curso ---

export type EnCurso = {
  slug: string;
  respuestas: (string | null)[];
  indice: number;
  fin: number;
  total: number;
};

function esEnCurso(x: unknown): x is EnCurso {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.slug === "string" &&
    Array.isArray(c.respuestas) &&
    c.respuestas.every((r) => r === null || typeof r === "string") &&
    typeof c.indice === "number" &&
    typeof c.fin === "number" &&
    typeof c.total === "number"
  );
}

export function leerEnCurso(): EnCurso | null {
  try {
    const crudo = localStorage.getItem(LLAVE_CURSO);
    if (!crudo) return null;
    const dato: unknown = JSON.parse(crudo);
    if (!esEnCurso(dato)) return null;
    return dato;
  } catch {
    return null;
  }
}

export function guardarEnCurso(curso: EnCurso): void {
  try {
    localStorage.setItem(LLAVE_CURSO, JSON.stringify(curso));
  } catch {
    // silencio: perder el respaldo no rompe el examen
  }
}

export function estaVencido(curso: EnCurso): boolean {
  return curso.fin <= Date.now();
}

export function borrarEnCurso(): void {
  for (const llave of [LLAVE_CURSO, LLAVE_CUADERNILLO]) {
    try {
      localStorage.removeItem(llave);
    } catch {
      // idem
    }
  }
}

// --- El cuadernillo del intento en curso ---

export function guardarCuadernillo(cuadernillo: SimulacroNuevo): void {
  try {
    localStorage.setItem(LLAVE_CUADERNILLO, JSON.stringify(cuadernillo));
  } catch {
    // sin copia local, retomar pasa por la red
  }
}

export function leerCuadernillo(slug: string, cuantasRespuestas: number): SimulacroNuevo | null {
  try {
    const crudo = localStorage.getItem(LLAVE_CUADERNILLO);
    if (!crudo) return null;
    const dato: unknown = JSON.parse(crudo);
    if (!esCuadernilloSano(dato)) return null;
    if (dato.slug !== slug) return null;
    if (dato.items.length !== cuantasRespuestas) return null;
    return dato as SimulacroNuevo;
  } catch {
    return null;
  }
}
