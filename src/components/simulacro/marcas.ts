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

const LLAVE = "ps_simulacros";
const LLAVE_CURSO = "ps_simulacro_curso";

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
    // Si al reloj ya no le queda tiempo, no hay nada que retomar.
    if (dato.fin <= Date.now()) {
      borrarEnCurso();
      return null;
    }
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

export function borrarEnCurso(): void {
  try {
    localStorage.removeItem(LLAVE_CURSO);
  } catch {
    // idem
  }
}
