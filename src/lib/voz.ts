import { useCallback, useEffect, useRef, useState } from "react";
import type { Opcion } from "./tipos";

// ============================================================
// Lectura en voz alta de un item. Vive aca y no dentro de un
// componente porque el boton de escuchar se usa en mas de un lugar:
// dos copias del mismo codigo terminan desincronizadas y una de las
// dos deja de cortar la voz al cambiar de pregunta.
// ============================================================

const LETRAS = ["A", "B", "C", "D"];

// Hay navegadores sin sintesis de voz (algunos Android viejos, algunos
// modos de privacidad). Ahi el boton no se pinta: mas vale que no exista
// a que exista y no haga nada.
export const HAY_VOZ =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

// El enunciado viene en Markdown y a veces con formulas. Si se le tira
// crudo al sintetizador, dicta "asterisco", "signo de dolar" y "barra"
// una por una y no se entiende nada.
export function aVoz(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\$+/g, " ")
    .replace(/[*_`>#|~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// es-CR primero, es-ES de respaldo y, si no hay ninguna de las dos,
// cualquier voz en espaniol. Si tampoco hay, se manda solo el idioma y
// que el navegador resuelva.
function vozEnEspanol(): SpeechSynthesisVoice | undefined {
  const voces = window.speechSynthesis.getVoices();
  const codigo = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  return (
    voces.find((v) => codigo(v) === "es-cr") ??
    voces.find((v) => codigo(v) === "es-es") ??
    voces.find((v) => codigo(v).startsWith("es"))
  );
}

export type Lectura = {
  /** false en navegadores sin sintesis: ahi el boton no se pinta */
  hayVoz: boolean;
  leyendo: boolean;
  /** arranca la lectura o la corta, segun como este */
  alternar: () => void;
};

// Lee el enunciado y despues cada opcion con su letra por delante. El
// componente que la usa se monta con key={item.id}, asi que al cambiar
// de pregunta se desmonta y la limpieza del efecto corta la voz sola.
export function useLectura(enunciado: string, opciones: Opcion[]): Lectura {
  const [leyendo, setLeyendo] = useState(false);
  // Cada lectura lleva su numero de turno. Cuando se cancela una, sus
  // eventos llegan tarde: sin el turno apagarian la lectura que ya arranco.
  const turnoRef = useRef(0);

  useEffect(() => {
    if (!HAY_VOZ) return;
    // Chrome arma la lista de voces despues de la primera consulta. Se le
    // pide al montar para que ya este cuando el estudiante toque el boton.
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.cancel();
  }, []);

  const parar = useCallback(() => {
    turnoRef.current += 1;
    window.speechSynthesis.cancel();
    setLeyendo(false);
  }, []);

  const leer = useCallback(() => {
    const sintesis = window.speechSynthesis;
    sintesis.cancel();
    const turno = (turnoRef.current += 1);
    const apagar = () => {
      if (turnoRef.current === turno) setLeyendo(false);
    };

    const voz = vozEnEspanol();
    // Primero el enunciado y despues cada opcion con su letra por delante:
    // sin la letra, quien escucha no sabe cual boton tocar.
    const partes = [
      aVoz(enunciado),
      ...opciones.map((op, i) => `${LETRAS[i] ?? i + 1}. ${aVoz(op.texto)}`),
    ].filter((t) => t.length > 0);
    if (partes.length === 0) return;

    // Una frase por parte y no un solo chorro: el sintetizador respira
    // entre opciones y el corte con "Parar" se siente al instante.
    const frases = partes.map((texto) => {
      const frase = new SpeechSynthesisUtterance(texto);
      frase.lang = voz?.lang ?? "es-CR";
      if (voz) frase.voice = voz;
      frase.rate = 0.95;   // un pelin mas lento: es un chiquito siguiendo la voz
      frase.onerror = apagar;
      return frase;
    });
    frases[frases.length - 1].onend = apagar;
    setLeyendo(true);
    frases.forEach((f) => sintesis.speak(f));
  }, [enunciado, opciones]);

  const alternar = useCallback(() => {
    if (leyendo) parar();
    else leer();
  }, [leyendo, parar, leer]);

  return { hayVoz: HAY_VOZ, leyendo, alternar };
}
