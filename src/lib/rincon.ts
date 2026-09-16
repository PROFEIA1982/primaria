// ============================================================
// El rincón: estrellas y amigos del bosque.
//
// Reglas, tal como se decidieron el 16 de setiembre de 2026:
//   · Una estrella por cada respuesta CORRECTA (práctica o simulacro).
//   · Cada 25 estrellas llega un amigo nuevo. El primero (el perezoso)
//     viene de regalo desde el arranque.
//   · Cada amigo tiene tope: se "completa" con sus 25 estrellas y de ahí
//     la siguiente estrella ya trabaja para el próximo amigo. Son ocho
//     amigos; con el jaguar (175 estrellas) la colección está completa y
//     las estrellas siguen contando como estrellas de campeón.
//   · Todo vive en ESTE aparato (localStorage). No se guarda nombre, ni
//     cédula, ni correo: no hay cuentas en la app.
//   · Lo único que sale del aparato son dos números anónimos que se suman
//     al contador de toda la comunidad: cuántas estrellas y cuántos
//     amigos. Nada más.
//
// Es un almacén de módulo, igual que apariencia.ts: un solo estado, los
// componentes se suscriben con useRincon() y las acciones son funciones
// sueltas. Así el contador de la cabecera, la pantalla del examen y el
// rincón ven siempre el mismo número.
// ============================================================

import { useSyncExternalStore } from "react";
import { borrarLlaves, guardarJSON, leerJSON } from "./almacen";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";

export const POR_AMIGO = 25;

export type Amigo = {
  id: string;
  nombre: string;
  frase: string;
};

// El orden es el orden en que se desbloquean. Animales de Costa Rica que
// un chiquito de sexto reconoce, y que además tienen su propio "carácter"
// para que la frase enseñe algo sin sermón.
export const AMIGOS: readonly Amigo[] = [
  { id: "perezoso", nombre: "Lento, el perezoso", frase: "Va despacio, pero siempre llega." },
  { id: "tucan",    nombre: "Pico, el tucán",     frase: "Colorido y hablador, como los buenos lectores." },
  { id: "rana",     nombre: "Roja, la rana",      frase: "Ojos bien abiertos para no perder detalle." },
  { id: "mono",     nombre: "Congo, el mono",     frase: "Se oye desde lejos cuando acierta." },
  { id: "morpho",   nombre: "Azul, la morpho",    frase: "Aparece cuando menos lo esperás." },
  { id: "tortuga",  nombre: "Baula, la tortuga",  frase: "Cruza el océano entero sin rendirse." },
  { id: "quetzal",  nombre: "Quetzal",            frase: "El más difícil de ver en todo el bosque." },
  { id: "jaguar",   nombre: "Jaguar",             frase: "Cuando llegás acá, ya estás listo para la prueba." },
] as const;

export const TOTAL_AMIGOS = AMIGOS.length;
/** Estrellas con las que se completa la colección. */
export const TOPE_ESTRELLAS_COLECCION = POR_AMIGO * (TOTAL_AMIGOS - 1);

type Estado = {
  estrellas: number;
  /** Cuántos amigos ya llegaron. Se guarda aparte para que un desbloqueo
      se celebre una sola vez, aunque el estado se relea. */
  amigos: number;
  elegido: string;
  /** Amigo que llegó y todavía no se celebró en pantalla. */
  porCelebrar: string | null;
  /** Estrellas y amigos que aún no se han sumado al contador comunitario. */
  pendienteEstrellas: number;
  pendienteAmigos: number;
};

const LLAVE = "ps_rincon";

const INICIAL: Estado = {
  estrellas: 0,
  amigos: 1,
  elegido: AMIGOS[0].id,
  porCelebrar: null,
  pendienteEstrellas: 0,
  pendienteAmigos: 0,
};

/** Cuántos amigos corresponden a una cantidad de estrellas (con tope). */
export function amigosPara(estrellas: number): number {
  return Math.min(TOTAL_AMIGOS, 1 + Math.floor(Math.max(0, estrellas) / POR_AMIGO));
}

// Lo que sale del navegador se revisa, no se confía: lo pudo escribir una
// versión vieja o quedar a medias.
function sanear(crudo: unknown): Estado {
  if (typeof crudo !== "object" || crudo === null) return { ...INICIAL };
  const o = crudo as Record<string, unknown>;
  const estrellas = typeof o.estrellas === "number" && Number.isFinite(o.estrellas) && o.estrellas >= 0
    ? Math.floor(o.estrellas) : 0;
  // Los amigos nunca pueden pasar de lo que las estrellas justifican.
  const amigos = Math.min(
    amigosPara(estrellas),
    typeof o.amigos === "number" && o.amigos >= 1 ? Math.floor(o.amigos) : 1,
  );
  const ids = AMIGOS.slice(0, amigos).map((a) => a.id);
  const elegido = typeof o.elegido === "string" && ids.includes(o.elegido) ? o.elegido : AMIGOS[0].id;
  const porCelebrar = typeof o.porCelebrar === "string" && ids.includes(o.porCelebrar) ? o.porCelebrar : null;
  // Lo pendiente nunca puede ser mas que lo ganado: sin este tope, un
  // valor inventado en localStorage se convertia en llamadas sin fin.
  const pe = Math.min(estrellas, typeof o.pendienteEstrellas === "number" && o.pendienteEstrellas > 0 ? Math.floor(o.pendienteEstrellas) : 0);
  const pa = Math.min(amigos, typeof o.pendienteAmigos === "number" && o.pendienteAmigos > 0 ? Math.floor(o.pendienteAmigos) : 0);
  return { estrellas, amigos, elegido, porCelebrar, pendienteEstrellas: pe, pendienteAmigos: pa };
}

let estado: Estado = sanear(leerJSON(LLAVE));
const oyentes = new Set<() => void>();

function cambiar(parche: Partial<Estado>): void {
  estado = { ...estado, ...parche };
  guardarJSON(LLAVE, estado);
  for (const fn of oyentes) fn();
}

function suscribir(fn: () => void): () => void {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function useRincon(): Estado {
  return useSyncExternalStore(suscribir, () => estado, () => estado);
}

export function amigoDe(id: string): Amigo {
  return AMIGOS.find((a) => a.id === id) ?? AMIGOS[0];
}

/** Datos derivados que las pantallas repiten: progreso hacia el próximo amigo. */
export function progreso(e: Estado): { dentro: number; faltan: number; porcentaje: number; completa: boolean } {
  const completa = e.amigos >= TOTAL_AMIGOS;
  if (completa) return { dentro: POR_AMIGO, faltan: 0, porcentaje: 100, completa };
  const dentro = e.estrellas % POR_AMIGO;
  return { dentro, faltan: POR_AMIGO - dentro, porcentaje: Math.round((dentro / POR_AMIGO) * 100), completa };
}

// --- acciones ---

/**
 * Suma estrellas por aciertos. Devuelve el amigo nuevo si con estas
 * estrellas llegó uno (para que la pantalla lo celebre), o null.
 */
export function sumarEstrellas(n: number): Amigo | null {
  const cuantas = Math.floor(n);
  if (!Number.isFinite(cuantas) || cuantas <= 0) return null;
  const estrellas = estado.estrellas + cuantas;
  const amigos = amigosPara(estrellas);
  const nuevos = amigos - estado.amigos;
  const nuevo = nuevos > 0 ? AMIGOS[amigos - 1] : null;
  cambiar({
    estrellas,
    amigos,
    porCelebrar: nuevo ? nuevo.id : estado.porCelebrar,
    pendienteEstrellas: estado.pendienteEstrellas + cuantas,
    pendienteAmigos: estado.pendienteAmigos + Math.max(0, nuevos),
  });
  programarEnvio();
  return nuevo;
}

export function elegirAmigo(id: string): void {
  if (!AMIGOS.slice(0, estado.amigos).some((a) => a.id === id)) return;
  cambiar({ elegido: id });
}

/** La pantalla que muestra la celebración la marca como vista. */
export function celebracionVista(): void {
  if (estado.porCelebrar) cambiar({ porCelebrar: null });
}

// Cada reinicio sube la generacion: un envio que estaba en vuelo no puede
// tocar el estado nuevo cuando vuelva.
let generacion = 0;

/** Borra todo lo del rincón en este aparato. Solo lo llama el propio niño. */
export function reiniciarRincon(): void {
  generacion++;
  if (temporizador) { clearTimeout(temporizador); temporizador = null; }
  borrarLlaves(LLAVE);
  estado = { ...INICIAL };
  for (const fn of oyentes) fn();
}

// --- contador comunitario (anónimo) ---

export type Comunidad = { estrellas: number; amigos: number; preguntas: number };

let comunidadCache: Comunidad | null = null;
const oyentesComunidad = new Set<() => void>();

function avisarComunidad(c: Comunidad): void {
  comunidadCache = c;
  for (const fn of oyentesComunidad) fn();
}

export function useComunidad(): Comunidad | null {
  return useSyncExternalStore(
    (fn) => { oyentesComunidad.add(fn); return () => oyentesComunidad.delete(fn); },
    () => comunidadCache,
    () => comunidadCache,
  );
}

// Se habla directo con el endpoint y con keepalive, sin pasar por el
// cliente de supabase-js: así el envío sobrevive aunque el chiquito cierre
// la pestaña justo después de acertar. La función del servidor pone tope
// (60 estrellas y 1 amigo por llamada), así que ni un envío repetido ni uno
// inventado puede inflar el contador de golpe.
async function llamarRincon(estrellas: number, amigos: number): Promise<Comunidad | null> {
  if (!SUPABASE_ANON_KEY) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_rincon`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_estrellas: estrellas, p_amigos: amigos }),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as Partial<Comunidad>;
    if (typeof d.estrellas !== "number") return null;
    const c = { estrellas: d.estrellas, amigos: d.amigos ?? 0, preguntas: d.preguntas ?? 0 };
    avisarComunidad(c);
    return c;
  } catch {
    return null;
  }
}

/** Lee los totales de la comunidad sin sumar nada. */
export function leerComunidad(): Promise<Comunidad | null> {
  return llamarRincon(0, 0);
}

let temporizador: ReturnType<typeof setTimeout> | null = null;
let enviando = false;

// Se junta lo pendiente y se manda una sola vez, un par de segundos después
// del último acierto: en una práctica de diez son diez estrellas y un solo
// viaje al servidor, no diez.
function programarEnvio(): void {
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => { temporizador = null; void enviarPendiente(); }, 2500);
}

export async function enviarPendiente(): Promise<void> {
  if (enviando) return;
  const e = Math.min(60, estado.pendienteEstrellas);
  const a = Math.min(1, estado.pendienteAmigos);
  if (e <= 0 && a <= 0) return;
  enviando = true;
  const g = generacion;
  // Se descuenta ANTES de mandar y NO se repone si falla: con keepalive no
  // se sabe si "fallo" quiere decir que no llego o que llego y se corto la
  // respuesta, y para un contador anonimo de ambiente es mucho menos grave
  // perder una tanda que contarla dos veces.
  cambiar({ pendienteEstrellas: estado.pendienteEstrellas - e, pendienteAmigos: estado.pendienteAmigos - a });
  let ok: Comunidad | null = null;
  try {
    ok = await Promise.race([
      llamarRincon(e, a),
      new Promise<null>((r) => setTimeout(() => r(null), 8000)),
    ]);
  } finally {
    enviando = false;
  }
  if (g !== generacion) return; // hubo un reinicio mientras tanto
  if (!ok) return;
  // Si quedó más (una práctica larga), sigue en la próxima tanda.
  if (estado.pendienteEstrellas > 0 || estado.pendienteAmigos > 0) programarEnvio();
}

// Al esconder la pestaña se manda lo que haya, sin esperar el temporizador.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (temporizador) { clearTimeout(temporizador); temporizador = null; }
      void enviarPendiente();
    }
  });
  // Lo que quedó pendiente de una visita anterior (se cerró sin red).
  if (estado.pendienteEstrellas > 0 || estado.pendienteAmigos > 0) programarEnvio();
}
