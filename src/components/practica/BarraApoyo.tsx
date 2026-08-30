import { useCallback, useEffect, useRef, useState } from "react";
import { AArrowUp, Contrast, Square, Type, Volume2 } from "lucide-react";
import type { Opcion } from "../../lib/tipos";

export type TamanoTexto = "normal" | "grande" | "mayor";

const LETRAS = ["A", "B", "C", "D"];

const TAMANOS: { valor: TamanoTexto; palabra: string; icono: typeof Type; tam: number }[] = [
  { valor: "normal", palabra: "Normal", icono: Type, tam: 18 },
  { valor: "grande", palabra: "Grande", icono: AArrowUp, tam: 21 },
  { valor: "mayor", palabra: "Más grande", icono: AArrowUp, tam: 25 },
];

// Hay navegadores sin sintesis de voz (algunos Android viejos, algunos
// modos de privacidad). Ahi el boton no se pinta: mas vale que no exista
// a que exista y no haga nada.
const HAY_VOZ =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

// El enunciado viene en Markdown y a veces con formulas. Si se le tira
// crudo al sintetizador, dicta "asterisco", "signo de dolar" y "barra"
// una por una y no se entiende nada.
function aVoz(md: string): string {
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

type Props = {
  enunciado: string;
  opciones: Opcion[];
  tamano: TamanoTexto;
  alCambiarTamano: (t: TamanoTexto) => void;
  altoContraste: boolean;
  alCambiarContraste: (v: boolean) => void;
};

// La barra de apoyo del examen: escuchar la pregunta, agrandar la letra y
// subir el contraste. Se monta con key={item.id} desde el panel, asi que
// al cambiar de pregunta se desmonta y la lectura se corta sola en la
// limpieza del efecto, sin tocar estado dentro de un efecto.
export default function BarraApoyo({
  enunciado,
  opciones,
  tamano,
  alCambiarTamano,
  altoContraste,
  alCambiarContraste,
}: Props) {
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

  return (
    <div className="examen-apoyo" role="group" aria-label="Ayudas para leer la pregunta">
      {HAY_VOZ && (
        <button
          type="button"
          className="apoyo-boton"
          aria-pressed={leyendo}
          onClick={leyendo ? parar : leer}
        >
          {leyendo ? (
            <Square size={20} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Volume2 size={20} strokeWidth={2.2} aria-hidden="true" />
          )}
          {leyendo ? "Parar" : "Escuchar"}
        </button>
      )}

      <button
        type="button"
        className="apoyo-boton"
        aria-pressed={altoContraste}
        onClick={() => alCambiarContraste(!altoContraste)}
      >
        <Contrast size={20} strokeWidth={2.2} aria-hidden="true" />
        Más contraste
      </button>

      <span className="apoyo-grupo" role="group" aria-label="Tamaño del texto">
        <span className="apoyo-rotulo" aria-hidden="true">Texto</span>
        {TAMANOS.map(({ valor, palabra, icono: Icono, tam }) => (
          <button
            key={valor}
            type="button"
            className="apoyo-boton"
            aria-pressed={tamano === valor}
            onClick={() => alCambiarTamano(valor)}
          >
            <Icono size={tam} strokeWidth={2.2} aria-hidden="true" />
            {palabra}
          </button>
        ))}
      </span>

      {/* El estado de la lectura se dice, no se deja solo en el color del
          boton. Cambia de vacio a texto y ahi el lector lo canta. */}
      <p className="ps-solo-lectores" role="status">
        {leyendo ? "Leyendo la pregunta en voz alta." : ""}
      </p>
    </div>
  );
}
