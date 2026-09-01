// ============================================================
// Lo que el simulacro guarda en el aparato del chiquito.
//
// Dos cosas distintas:
//   · las marcas: cuantas veces hizo cada cuadernillo y que nota saco
//   · el intento en curso: para poder retomarlo si se sale a medias
//
// Nada de esto viaja a ningun servidor. No hay cuentas en esta app: si
// borra el historial del navegador, se va con el, y esta bien.
//
// Todo va envuelto en try/catch. En modo incognito, con el
// almacenamiento bloqueado o con la cuota llena, localStorage tira
// excepcion hasta para leer. Si falla, la pantalla se dibuja igual y
// sencillamente no muestra ni marcas ni el aviso de retomar.
// ============================================================

import type { Simulacro } from "../../lib/tipos";
import { esCuadernilloSano } from "../../lib/validar";

const LLAVE = "ps_simulacros";
const LLAVE_CURSO = "ps_simulacro_curso";
// El cuadernillo entero, aparte. Ver el comentario de guardarCuadernillo.
const LLAVE_CUADERNILLO = "ps_simulacro_cuadernillo";

export type MarcaSimulacro = {
  intentos: number;
  mejor: number;
  ultima: number;
};

type Guardado = Record<string, MarcaSimulacro>;

function esMarca(x: unknown): x is MarcaSimulacro {
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
    // Se filtra en vez de confiar: lo que hay guardado pudo escribirlo
    // una version vieja de la app, o quedar a medias.
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
  const marca: MarcaSimulacro = {
    intentos: (antes?.intentos ?? 0) + 1,
    mejor: Math.max(antes?.mejor ?? 0, nota),
    ultima: nota,
  };
  const nuevo = { ...previo, [slug]: marca };
  try {
    localStorage.setItem(LLAVE, JSON.stringify(nuevo));
  } catch {
    // No se pudo guardar. Igual se devuelve el objeto nuevo para que la
    // pantalla muestre la marca de este intento mientras dure la visita.
  }
  return nuevo;
}

// --- El intento en curso ---
//
// Un cuadernillo son ochenta minutos. En el celular de un chiquito eso
// no aguanta: Android mata la pestaña de atras a la media hora, o le da
// al boton de volver, o toca una materia en el menu. Sin esto, adios a
// las cuarenta respuestas. Con esto, al volver le sale "seguí donde
// ibas" y el reloj retoma con el tiempo que le quedaba.

export type EnCurso = {
  slug: string;
  /** id de opcion elegida por pregunta, o null */
  respuestas: (string | null)[];
  indice: number;
  /** hora de fin del reloj, en milisegundos */
  fin: number;
  /** cuantos segundos duraba el intento entero (para el color del reloj) */
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
    // OJO: el intento VENCIDO ya NO se borra aca.
    //
    // Antes, si al chiquito se le acababa el tiempo con la pestana
    // cerrada, al volver no encontraba nada: sus cuarenta y cinco
    // respuestas desaparecian sin dejar rastro, sin nota y sin aviso.
    // Ahora se devuelve igual y quien llama decide: si esta vencido, en
    // vez de retomarlo se le muestra la nota de lo que alcanzo a hacer,
    // que es lo unico honesto que se puede hacer con ese trabajo.
    return dato;
  } catch {
    return null;
  }
}

export function guardarEnCurso(curso: EnCurso): void {
  try {
    localStorage.setItem(LLAVE_CURSO, JSON.stringify(curso));
  } catch {
    // silencio a proposito: perder el respaldo no puede romper el examen
  }
}

/** Un intento cuyo reloj ya se acabo. No se retoma: se califica. */
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
//
// Va en su propia llave y se escribe UNA sola vez, al arrancar. Sesenta
// preguntas con sus opciones son unos 140 KB; el intento en curso, que se
// reescribe con cada toque, son cientos de bytes. Serializar los 140 KB
// en cada respuesta bloquea el hilo de la pantalla y se siente en un
// celular barato.
//
// Guardarlo sirve para dos cosas: retomar SIN INTERNET, que es lo comun
// cuando a alguien se le cae la pestana, y poder calificar un intento
// vencido sin tener que pedirle el cuadernillo al servidor otra vez.
//
// Si no cabe (cuota llena), no pasa nada: retomar vuelve a pedirlo por
// red, que es como funcionaba antes.
export function guardarCuadernillo(cuadernillo: Simulacro): void {
  try {
    localStorage.setItem(LLAVE_CUADERNILLO, JSON.stringify(cuadernillo));
  } catch {
    // silencio: sin copia local, retomar pasa por la red y ya
  }
}

/**
 * El cuadernillo guardado, solo si es el del intento que se esta
 * retomando y trae la misma cantidad de preguntas. Un cuadernillo de otro
 * largo (porque cambio en la base) no sirve: las respuestas guardadas no
 * calzarian con las preguntas.
 */
export function leerCuadernillo(slug: string, cuantasRespuestas: number): Simulacro | null {
  try {
    const crudo = localStorage.getItem(LLAVE_CUADERNILLO);
    if (!crudo) return null;
    const dato: unknown = JSON.parse(crudo);
    // El mismo validador que usa lo que llega del servidor: lo que sale de
    // localStorage merece la misma desconfianza, porque pudo escribirlo
    // una version de la app de hace un mes.
    if (!esCuadernilloSano(dato)) return null;
    if (dato.slug !== slug) return null;
    if (dato.items.length !== cuantasRespuestas) return null;
    return dato;
  } catch {
    return null;
  }
}
