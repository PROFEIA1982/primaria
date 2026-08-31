import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// ============================================================
// Los cinco ajustes de accesibilidad. Todos viven en un atributo del
// <html> y los pinta index.css; aca solo se decide cual va y se guarda
// la eleccion.
//
//   data-tema   claro | oscuro
//   data-vision alto            (alto contraste; ausente = normal)
//   data-color  daltonismo | grises   (ausente = color normal)
//   data-texto  grande | extra        (ausente = tamano normal)
//   data-voz    no                    (ausente = lectura encendida)
//
// Los valores "por defecto" NO ponen atributo: asi la web arranca como
// siempre y solo se marca lo que el visitante pidio de verdad.
//
// El sitio esta desplegado, asi que localStorage sirve. Aun asi todo va
// en try/catch: en modo privado de algunos navegadores leerlo tira
// excepcion y no hay por que tumbar la pagina por eso.
// ============================================================

export type Tema = "claro" | "oscuro";
export type Vision = "normal" | "alto";
export type Color = "normal" | "daltonismo" | "grises";
export type Texto = "normal" | "grande" | "extra";

const ORDEN_TEXTO: Texto[] = ["normal", "grande", "extra"];

const LLAVE_TEMA = "ps-tema";
const LLAVE_VISION = "ps-vision";
const LLAVE_COLOR = "ps-color";
const LLAVE_TEXTO = "ps-texto";
const LLAVE_VOZ = "ps-voz";

function leer(llave: string): string | null {
  try {
    return window.localStorage.getItem(llave);
  } catch {
    return null;
  }
}

function guardar(llave: string, valor: string): void {
  try {
    window.localStorage.setItem(llave, valor);
  } catch {
    // Sin memoria: la eleccion vale para esta visita y ya. No es motivo
    // para romperle la pagina a nadie.
  }
}

// Pone o quita el atributo segun si el valor es el de por defecto.
function marcar(atributo: string, valor: string, pordefecto: string): void {
  const raiz = document.documentElement;
  if (valor === pordefecto) raiz.removeAttribute(atributo);
  else raiz.setAttribute(atributo, valor);
}

// El script de index.html ya dejo los atributos puestos antes de que
// React pintara. Se leen de ahi primero para que los botones no
// arranquen diciendo lo contrario de lo que se ve.
function temaInicial(): Tema {
  const puesto = document.documentElement.getAttribute("data-tema");
  if (puesto === "claro" || puesto === "oscuro") return puesto;
  const guardado = leer(LLAVE_TEMA);
  if (guardado === "claro" || guardado === "oscuro") return guardado;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  } catch {
    return "claro";
  }
}

function visionInicial(): Vision {
  if (document.documentElement.getAttribute("data-vision") === "alto") return "alto";
  return leer(LLAVE_VISION) === "alto" ? "alto" : "normal";
}

function esColor(v: string | null): v is Color {
  return v === "normal" || v === "daltonismo" || v === "grises";
}

function colorInicial(): Color {
  const puesto = document.documentElement.getAttribute("data-color");
  if (esColor(puesto)) return puesto;
  const guardado = leer(LLAVE_COLOR);
  return esColor(guardado) ? guardado : "normal";
}

function esTexto(v: string | null): v is Texto {
  return v === "normal" || v === "grande" || v === "extra";
}

function textoInicial(): Texto {
  const puesto = document.documentElement.getAttribute("data-texto");
  if (esTexto(puesto)) return puesto;
  const guardado = leer(LLAVE_TEXTO);
  return esTexto(guardado) ? guardado : "normal";
}

// ============================================================
// La lectura en voz alta la enciende el menu, pero el boton "Escuchar"
// lo pintan las pantallas de practica y de simulacro, que estan lejos
// del menu en el arbol. En vez de arrastrar un contexto por toda la
// app, el valor vive en este modulo y los dos lados se suscriben con
// useSyncExternalStore: una sola fuente de verdad y sin desincronizar.
// ============================================================

function vozInicial(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.getAttribute("data-voz") === "no") return false;
  return leer(LLAVE_VOZ) !== "no";
}

let vozActiva = true;
const oyentes = new Set<() => void>();

function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

function leerVoz(): boolean {
  return vozActiva;
}

function ponerVoz(valor: boolean): void {
  if (vozActiva === valor) return;
  vozActiva = valor;
  marcar("data-voz", valor ? "si" : "no", "si");
  guardar(LLAVE_VOZ, valor ? "si" : "no");
  oyentes.forEach((fn) => fn());
}

/** Para las pantallas que pintan el boton "Escuchar". */
export function useVozActiva(): boolean {
  return useSyncExternalStore(suscribir, leerVoz, () => true);
}

export type Apariencia = {
  tema: Tema;
  vision: Vision;
  color: Color;
  texto: Texto;
  voz: boolean;
  alternarTema: () => void;
  alternarVision: () => void;
  ponerColor: (c: Color) => void;
  ciclarTexto: () => void;
  alternarVoz: () => void;
};

// Un solo consumidor (el menu) para que no haya dos estados peleandose.
export function useApariencia(): Apariencia {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [vision, setVision] = useState<Vision>(visionInicial);
  const [color, setColor] = useState<Color>(colorInicial);
  const [texto, setTexto] = useState<Texto>(textoInicial);
  const [voz, setVoz] = useState<boolean>(vozInicial);

  // En la primera pasada no se escribe nada si el visitante nunca eligio:
  // sin atributo manda el prefers-color-scheme del CSS y el sitio sigue al
  // sistema en vivo. Guardar ahi seria decidir por el.
  const primeraTema = useRef(true);
  useEffect(() => {
    if (primeraTema.current) {
      primeraTema.current = false;
      if (!document.documentElement.hasAttribute("data-tema")) return;
    }
    document.documentElement.setAttribute("data-tema", tema);
    guardar(LLAVE_TEMA, tema);
  }, [tema]);

  const primeraVision = useRef(true);
  useEffect(() => {
    if (primeraVision.current) {
      primeraVision.current = false;
      if (!document.documentElement.hasAttribute("data-vision")) return;
    }
    document.documentElement.setAttribute("data-vision", vision);
    guardar(LLAVE_VISION, vision);
  }, [vision]);

  const primeraColor = useRef(true);
  useEffect(() => {
    if (primeraColor.current) {
      primeraColor.current = false;
      if (!document.documentElement.hasAttribute("data-color") && color === "normal") return;
    }
    marcar("data-color", color, "normal");
    guardar(LLAVE_COLOR, color);
  }, [color]);

  const primeraTexto = useRef(true);
  useEffect(() => {
    if (primeraTexto.current) {
      primeraTexto.current = false;
      if (!document.documentElement.hasAttribute("data-texto") && texto === "normal") return;
    }
    marcar("data-texto", texto, "normal");
    guardar(LLAVE_TEXTO, texto);
  }, [texto]);

  // La voz arranca sincronizando el modulo con lo que se guardo, sin
  // avisarle a nadie todavia (nadie escucha aun en el primer render).
  const primeraVoz = useRef(true);
  useEffect(() => {
    if (primeraVoz.current) {
      primeraVoz.current = false;
      vozActiva = voz;
      marcar("data-voz", voz ? "si" : "no", "si");
      return;
    }
    ponerVoz(voz);
  }, [voz]);

  const alternarTema = useCallback(
    () => setTema((t) => (t === "oscuro" ? "claro" : "oscuro")),
    [],
  );
  const alternarVision = useCallback(
    () => setVision((v) => (v === "alto" ? "normal" : "alto")),
    [],
  );
  // Volver a tocar el modo que ya esta puesto lo apaga: asi el mismo
  // boton sirve para poner y para quitar, sin un "normal" aparte.
  const ponerColor = useCallback(
    (c: Color) => setColor((actual) => (actual === c ? "normal" : c)),
    [],
  );
  const ciclarTexto = useCallback(
    () => setTexto((v) => ORDEN_TEXTO[(ORDEN_TEXTO.indexOf(v) + 1) % ORDEN_TEXTO.length]),
    [],
  );
  const alternarVoz = useCallback(() => setVoz((v) => !v), []);

  return {
    tema, vision, color, texto, voz,
    alternarTema, alternarVision, ponerColor, ciclarTexto, alternarVoz,
  };
}
