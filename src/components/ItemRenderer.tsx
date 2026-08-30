import { Square, Volume2 } from "lucide-react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./ItemRenderer.css";
import type { TamanoTexto } from "./practica/BarraApoyo";
import { useLectura } from "../lib/voz";
import type { Opcion } from "../lib/tipos";

const LETRAS = ["A", "B", "C", "D"];

// Los enunciados traen tablas (remark-gfm), formulas ($...$) e imagenes.
// Sin gfm, una tabla se ve como texto con barras: eso paso al principio.
const REMARK = [remarkMath, remarkGfm];
const REHYPE = [rehypeKatex];

// La tabla va dentro de una caja que se desliza sola: en un celular de
// 320px una tabla de seis columnas no cabe de otra forma.
const BLOQUE = {
  table: (props: { children?: React.ReactNode }) => (
    <div className="item-tabla-caja">
      <table>{props.children}</table>
    </div>
  ),
};

// En las opciones no queremos parrafos ni tablas: solo el texto, que a
// veces trae una fraccion en LaTeX.
const ENLINEA = {
  p: (props: { children?: React.ReactNode }) => <>{props.children}</>,
};

type Props = {
  enunciado: string;
  opciones: Opcion[];
  /** id de la opcion que toco el estudiante; null si todavia no responde */
  elegida: string | null;
  /** se llama solo la primera vez que responde */
  alElegir: (opcionId: string) => void;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  /** tamano de letra que pidio el estudiante en la barra de apoyo */
  tamano?: TamanoTexto;
  /** modo de mas contraste, tambien pedido desde la barra de apoyo */
  altoContraste?: boolean;
  /**
   * Pinta el boton de escuchar en la esquina del recuadro. Va apagado por
   * defecto y solo lo enciende la pantalla del examen: en resultados hay
   * varios items a la vez y speechSynthesis es una sola cola, o sea que
   * dos botones encendidos se pisarian la voz.
   */
  conVoz?: boolean;
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
  tamano = "normal",
  altoContraste = false,
  conVoz = false,
}: Props) {
  const respondido = elegida !== null;
  // El hook se llama siempre, encendido o no: los hooks no se condicionan.
  // Lo unico que decide conVoz es si el boton se pinta.
  const voz = useLectura(enunciado, opciones);
  const mostrarVoz = conVoz && voz.hayVoz;

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
    // El tamano y el contraste se quedan encerrados en el recuadro de la
    // pregunta: no se toca el html ni el body, que arrastrarian el menu,
    // la barra del reloj y todo lo demas.
    <article
      className="ps-item"
      data-tamano={tamano}
      data-contraste={altoContraste ? "alto" : undefined}
    >
      {mostrarVoz && (
        // En la esquina de arriba, antes del enunciado: quien lo necesita lo
        // encuentra donde esta mirando y no en una barra aparte.
        <div className="item-cima">
          <button
            type="button"
            className="item-escuchar"
            aria-pressed={voz.leyendo}
            onClick={voz.alternar}
          >
            {voz.leyendo ? (
              <Square size={20} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Volume2 size={20} strokeWidth={2.2} aria-hidden="true" />
            )}
            {voz.leyendo ? "Parar" : "Escuchar"}
          </button>
        </div>
      )}

      <div className="item-enunciado">
        <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={BLOQUE}>
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
                <span className="item-texto">
                  <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={ENLINEA}>
                    {op.texto}
                  </Markdown>
                </span>
                {estado === "correcta" && <span className="item-marca">✓ Correcta</span>}
                {estado === "incorrecta" && <span className="item-marca">✗ Incorrecta</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {/* El estado de la lectura se dice, no se deja solo en el color del
          boton. Cambia de vacio a texto y ahi el lector lo canta. */}
      {mostrarVoz && (
        <p className="ps-solo-lectores" role="status">
          {voz.leyendo ? "Leyendo la pregunta en voz alta." : ""}
        </p>
      )}

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
