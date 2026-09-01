import { useSyncExternalStore } from "react";

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
const LLAVE_TIEMPO = "ps-tiempo-extra";

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
// UN SOLO ALMACEN PARA LOS SEIS AJUSTES.
//
// Antes cada ajuste vivia en un useState dentro de useApariencia(), y eso
// se rompio en cuanto el panel dejo de estar en un solo lugar: hoy
// useApariencia() se llama CUATRO veces a la vez -- el panel de la
// hamburguesa, el panel flotante, y useHayAjustes() dentro de cada uno --
// asi que habia cuatro copias del mismo ajuste sin hablarse. Se medio:
//
//   · el punto del boton flotante no se encendia al poner modo oscuro,
//     porque esa copia nunca corria su propio setter;
//   · tocar "Escala de grises" desde el panel desactualizado apagaba el
//     daltonismo que si estaba puesto;
//   · al salir de un examen el menu se vuelve a montar, resembraba los
//     valores desde localStorage y, si el navegador lo tiene bloqueado,
//     la adecuacion de tiempo se apagaba sola.
//
// Ahora el valor vive en el modulo, los componentes se suscriben con
// useSyncExternalStore y los setters son funciones sueltas que escriben
// el atributo, guardan y avisan. Un solo lugar donde equivocarse.
// ============================================================

type Estado = {
  tema: Tema;
  vision: Vision;
  color: Color;
  texto: Texto;
  voz: boolean;
  tiempoExtra: boolean;
};

function vozInicial(): boolean {
  if (typeof document === "undefined") return true;
  if (document.documentElement.getAttribute("data-voz") === "no") return false;
  return leer(LLAVE_VOZ) !== "no";
}

function tiempoExtraInicial(): boolean {
  if (typeof document === "undefined") return false;
  return leer(LLAVE_TIEMPO) === "si";
}

// Se siembra una sola vez, al cargar el modulo, con lo que ya dejo puesto
// el script de arranque de index.html.
let estado: Estado = {
  tema: temaInicial(),
  vision: visionInicial(),
  color: colorInicial(),
  texto: textoInicial(),
  voz: vozInicial(),
  tiempoExtra: tiempoExtraInicial(),
};

const oyentes = new Set<() => void>();

function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  return () => {
    oyentes.delete(fn);
  };
}

function leerEstado(): Estado {
  return estado;
}

// La instantanea del servidor tiene que ser un objeto ESTABLE, no uno
// nuevo en cada llamada: si cambia de identidad, React entra en un bucle
// de renders. Por eso es una constante y no un objeto literal inline.
const ESTADO_SERVIDOR: Estado = {
  tema: "claro", vision: "normal", color: "normal",
  texto: "normal", voz: true, tiempoExtra: false,
};

function cambiar(parche: Partial<Estado>): void {
  estado = { ...estado, ...parche };
  oyentes.forEach((fn) => fn());
}

// --- Los setters. Cada uno escribe el atributo, guarda y avisa. ---

export function alternarTema(): void {
  const tema: Tema = estado.tema === "oscuro" ? "claro" : "oscuro";
  document.documentElement.setAttribute("data-tema", tema);
  guardar(LLAVE_TEMA, tema);
  cambiar({ tema });
}

export function alternarVision(): void {
  const vision: Vision = estado.vision === "alto" ? "normal" : "alto";
  marcar("data-vision", vision, "normal");
  guardar(LLAVE_VISION, vision);
  cambiar({ vision });
}

/** Volver a tocar el modo que ya esta puesto lo apaga: el mismo boton
 *  sirve para poner y para quitar, sin un "normal" aparte. */
export function ponerColor(c: Color): void {
  const color: Color = estado.color === c ? "normal" : c;
  marcar("data-color", color, "normal");
  guardar(LLAVE_COLOR, color);
  cambiar({ color });
}

export function ciclarTexto(): void {
  const i = ORDEN_TEXTO.indexOf(estado.texto);
  const texto = ORDEN_TEXTO[(i + 1) % ORDEN_TEXTO.length];
  marcar("data-texto", texto, "normal");
  guardar(LLAVE_TEXTO, texto);
  cambiar({ texto });
}

export function alternarVoz(): void {
  const voz = !estado.voz;
  marcar("data-voz", voz ? "si" : "no", "si");
  guardar(LLAVE_VOZ, voz ? "si" : "no");
  cambiar({ voz });
}

export function alternarTiempoExtra(): void {
  const tiempoExtra = !estado.tiempoExtra;
  guardar(LLAVE_TIEMPO, tiempoExtra ? "si" : "no");
  cambiar({ tiempoExtra });
}

// --- Los lectores ---

/** Todo el estado. Lo usan los paneles, que pintan las seis filas. */
export function useAjustes(): Estado {
  return useSyncExternalStore(suscribir, leerEstado, () => ESTADO_SERVIDOR);
}

/** Para las pantallas que pintan el boton "Escuchar". */
export function useVozActiva(): boolean {
  return useAjustes().voz;
}

/** Lo consulta el simulacro para saber cuanto dura el cuadernillo. */
export function useTiempoExtra(): boolean {
  return useAjustes().tiempoExtra;
}

/** Para los botones discretos que van dentro del recuadro de la pregunta. */
export function useVisionAlta(): boolean {
  return useAjustes().vision === "alto";
}

export function useTextoActual(): Texto {
  return useAjustes().texto;
}

/** Hay algo puesto que no es lo de fabrica. Sirve para marcar el boton
 *  con un punto y que se note sin tener que abrir el panel. */
export function hayAjustesPuestos(e: Estado): boolean {
  return (
    e.tema === "oscuro" || e.vision === "alto" || e.color !== "normal" ||
    e.texto !== "normal" || !e.voz || e.tiempoExtra
  );
}
