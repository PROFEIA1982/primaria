import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./ItemRenderer.css";
import type { Opcion } from "../lib/tipos";

const LETRAS = ["A", "B", "C", "D"];

type Props = {
  enunciado: string;
  opciones: Opcion[];
  /** id de la opcion que toco el estudiante; null si todavia no responde */
  elegida: string | null;
  /** se llama solo la primera vez que responde */
  alElegir: (opcionId: string) => void;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
};

// Estructura base del item. La logica de la practica (reloj, avance,
// puntaje) vive afuera; este componente solo pinta y avisa que tocaron.
export default function ItemRenderer({
  enunciado,
  opciones,
  elegida,
  alElegir,
  imagenUrl,
  imagenAlt,
}: Props) {
  const respondido = elegida !== null;

  // Que estado le toca a cada opcion una vez que ya respondio.
  function estadoDe(op: Opcion): "correcta" | "incorrecta" | undefined {
    if (!respondido) return undefined;
    if (op.es_correcta) return "correcta";
    if (op.id === elegida) return "incorrecta";
    return undefined;
  }

  // Cual era la correcta, para poder anunciarla al lector de pantalla.
  const iCorrecta = opciones.findIndex((o) => o.es_correcta);
  const acerto = respondido && opciones.find((o) => o.id === elegida)?.es_correcta;

  return (
    <article className="ps-item">
      <div className="item-enunciado">
        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {enunciado}
        </Markdown>
        {imagenUrl && (
          <img
            src={imagenUrl}
            alt={imagenAlt ?? ""}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <ul className="item-opciones">
        {opciones.map((op, i) => {
          const estado = estadoDe(op);
          return (
            <li key={op.id}>
              <button
                type="button"
                className="item-opcion"
                data-estado={estado}
                // aria-disabled y no disabled: un boton deshabilitado pierde el
                // foco del teclado y quien navega asi queda tirado al inicio.
                aria-disabled={respondido}
                onClick={() => { if (!respondido) alElegir(op.id); }}
              >
                <span className="item-letra" aria-hidden="true">{LETRAS[i] ?? i + 1}</span>
                <span className="item-texto">{op.texto}</span>
                {estado === "correcta" && <span className="item-marca">✓ Correcta</span>}
                {estado === "incorrecta" && <span className="item-marca">✗ Incorrecta</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {/* El resultado tiene que llegarle tambien a quien usa lector de pantalla. */}
      {respondido && (
        <p role="status" className="ps-solo-lectores">
          {acerto
            ? "Correcta."
            : `Incorrecta. La correcta era la opción ${LETRAS[iCorrecta] ?? iCorrecta + 1}.`}
        </p>
      )}
    </article>
  );
}
