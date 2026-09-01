import { useEffect, useRef, useState } from "react";
import { ALargeSmall, Contrast, Square, Volume2 } from "lucide-react";
import {
  alternarVision, ciclarTexto, useTextoActual, useVisionAlta,
} from "../lib/apariencia";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./ItemRenderer.css";
import { useLectura } from "../lib/voz";
import type { Opcion } from "../lib/tipos";

const LETRAS = ["A", "B", "C", "D"];

// Los enunciados traen tablas (remark-gfm), formulas ($...$) e imagenes.
// Sin gfm, una tabla se ve como texto con barras: eso paso al principio.
const REMARK = [remarkMath, remarkGfm];
const REHYPE = [rehypeKatex];

/**
 * La caja de la tabla.
 *
 * Casi todas las tablas caben en la pantalla del celular. Alguna de tres
 * columnas con texto largo no, y esa se desliza dentro de su caja en vez de
 * correr la pagina entera.
 *
 * Cuando se desliza pasan dos cosas mas, y las dos hacen falta:
 * el borde derecho se sombrea, porque si no el estudiante no tiene como
 * saber que hay mas datos a la derecha; y la caja se vuelve alcanzable con
 * el tabulador y se anuncia como region, porque una zona que se desplaza y
 * no recibe foco deja fuera a quien navega con teclado.
 */
function TablaCaja({ children }: { children?: React.ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);
  const [seDesliza, setSeDesliza] = useState(false);
  const [apilar, setApilar] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const tabla = el.querySelector("table");
    if (!tabla) return;

    // Tres columnas o mas no caben en un celular, y ahi la tabla se apila en
    // tarjetas (lo hace el CSS). Dos columnas se quedan como tabla: asi es
    // mas compacta y se lee mejor.
    const columnas = tabla.querySelector("tr")?.children.length ?? 0;
    setApilar(columnas >= 3);

    // Cada dato lleva encima el rotulo de su columna, que es lo que se ve
    // cuando la tabla esta apilada y el encabezado queda escondido. Se copia
    // del thead una sola vez.
    const rotulos = [...tabla.querySelectorAll("thead th")].map((th) => th.textContent?.trim() ?? "");
    if (rotulos.length) {
      for (const fila of tabla.querySelectorAll("tbody tr")) {
        [...fila.children].forEach((celda, i) => {
          if (rotulos[i]) celda.setAttribute("data-rotulo", rotulos[i]);
        });
      }
    }

    const medir = () => setSeDesliza(el.scrollWidth > el.clientWidth + 1);
    medir();
    // Se vuelve a medir cuando cambia el tamano de la letra o gira el aparato.
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [children]);

  return (
    <div
      ref={caja}
      className="item-tabla-caja"
      data-apilar={apilar ? "" : undefined}
      data-desliza={seDesliza ? "" : undefined}
      tabIndex={seDesliza ? 0 : undefined}
      role={seDesliza ? "region" : undefined}
      aria-label={seDesliza ? "Tabla de datos, se desliza de lado" : undefined}
    >
      <table>{children}</table>
    </div>
  );
}

const BLOQUE = {
  table: (props: { children?: React.ReactNode }) => <TablaCaja>{props.children}</TablaCaja>,
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
  
  /**
   * Pinta el boton de escuchar en la esquina del recuadro. Va apagado por
   * defecto y solo lo enciende la pantalla del examen: en resultados hay
   * varios items a la vez y speechSynthesis es una sola cola, o sea que
   * dos botones encendidos se pisarian la voz.
   */
  conVoz?: boolean;
  /**
   * "practica" es lo de siempre: apenas toca una opcion se le dice si
   * estuvo bien y la pregunta se congela.
   *
   * "examen" es para los simulacros. Ahi no se corrige nada hasta el
   * final, y por lo mismo la respuesta se puede cambiar todas las veces
   * que quiera mientras no entregue: en una prueba de cuarenta preguntas
   * uno vuelve sobre lo que dudo, y dejarle la respuesta clavada desde el
   * primer toque castiga al que se arrepiente, no al que no sabe.
   */
  modo?: "practica" | "examen";
};

// Estructura base del item. La logica de la practica (reloj, avance,
// puntaje) vive afuera; este componente solo pinta y avisa que tocaron.
const NOMBRE_TAMANO = {
  normal: "normal",
  grande: "grande",
  extra: "muy grande",
} as const;

export default function ItemRenderer({
  enunciado,
  opciones,
  elegida,
  alElegir,
  imagenUrl,
  imagenAlt,
  conVoz = false,
  modo = "practica",
}: Props) {
  const respondido = elegida !== null;
  // En simulacro no se corrige a la vista ni se traba la opcion.
  const corrige = modo === "practica";
  const bloqueado = corrige && respondido;
  // El hook se llama siempre, encendido o no: los hooks no se condicionan.
  // Lo unico que decide conVoz es si el boton se pinta.
  const voz = useLectura(enunciado, opciones);
  const mostrarVoz = conVoz && voz.hayVoz;
  // Los dos ajustes salen del almacen compartido: los mismos que mueve el
  // panel de accesibilidad, no una copia local.
  const visionAlta = useVisionAlta();
  const tamanoTexto = useTextoActual();

  // Que estado le toca a cada opcion una vez que ya respondio.
  function estadoDe(op: Opcion): "correcta" | "incorrecta" | undefined {
    if (!corrige || !respondido) return undefined;
    if (op.es_correcta) return "correcta";
    if (op.id === elegida) return "incorrecta";
    return undefined;
  }

  // Cual era la correcta, para poder anunciarla al lector de pantalla.
  const iCorrecta = opciones.findIndex((o) => o.es_correcta);
  const acerto = respondido && opciones.find((o) => o.id === elegida)?.es_correcta;

  // --- Andar por las opciones con las flechas ---
  // Un radiogroup se recorre con flechas, no con tabulador: el grupo entero
  // es una sola parada y adentro las flechas mueven. Asi el estudiante que
  // usa teclado no tiene que tabular cuatro veces para llegar a la D.
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([]);
  const elegidaIdx = opciones.findIndex((o) => o.id === elegida);
  // Quien recibe el tabulador. Se deriva en vez de sincronizarse con un
  // efecto: mientras el estudiante no mueva nada manda la elegida, y si
  // todavia no contesta, la primera. El componente se rearma con cada
  // pregunta (la key del padre), asi que esto arranca limpio cada vez.
  const [focoManual, setFocoManual] = useState<number | null>(null);
  const indiceFoco = focoManual ?? (elegidaIdx >= 0 ? elegidaIdx : 0);
  const setIndiceFoco = setFocoManual;

  function alTeclearEnGrupo(e: React.KeyboardEvent, i: number) {
    const ultimo = opciones.length - 1;
    let destino: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") destino = i === ultimo ? 0 : i + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") destino = i === 0 ? ultimo : i - 1;
    if (e.key === "Home") destino = 0;
    if (e.key === "End") destino = ultimo;
    if (destino === null) return;
    e.preventDefault();
    setIndiceFoco(destino);
    botonesRef.current[destino]?.focus();
    // En un radiogroup la flecha tambien escoge. En practica, cuando ya
    // contesto solo mueve el foco, asi puede releer las opciones sin
    // cambiar su respuesta; en simulacro escoge siempre.
    if (!bloqueado) alElegir(opciones[destino].id);
  }

  return (
    // El tamano y el contraste se quedan encerrados en el recuadro de la
    // pregunta: no se toca el html ni el body, que arrastrarian el menu,
    // la barra del reloj y todo lo demas.
    <article
      className="ps-item"
    >
      {/* Las tres ayudas, en la esquina de arriba y en pequeno: quien las
          necesita las encuentra donde ya esta mirando, y quien no, casi ni
          las ve. No llevan estado propio -- mueven el MISMO ajuste que el
          panel de accesibilidad (ver lib/apariencia.ts) -- asi que nunca
          van a decir una cosa aca y otra alla.
          "Escuchar" conserva la palabra porque es la accion principal; las
          otras dos van con icono y su nombre en aria-label y en title. */}
      <div className="item-cima">
        {mostrarVoz && (
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
        )}
        <button
          type="button"
          className="item-ayuda"
          aria-pressed={visionAlta}
          title="Más contraste"
          aria-label={`Más contraste: ${visionAlta ? "activado" : "desactivado"}`}
          onClick={alternarVision}
        >
          <Contrast size={20} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="item-ayuda"
          data-nivel={tamanoTexto}
          title={`Tamaño del texto: ${NOMBRE_TAMANO[tamanoTexto]}`}
          aria-label={`Tamaño del texto: ${NOMBRE_TAMANO[tamanoTexto]}. Tocá para agrandarlo`}
          onClick={ciclarTexto}
        >
          <ALargeSmall size={22} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

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

      {/* Escoger una de cuatro es justo lo que describe un radiogroup.
          Antes eran botones con aria-pressed y el lector de pantalla decia
          "boton, no presionado", que suena a interruptor: el estudiante
          ciego no se enteraba de cuantas opciones habia ni en cual iba.
          Ahora dice "opcion 2 de 4, seleccionada".

          El li va en presentation porque entre el radiogroup y sus radios no
          puede haber nada mas; la lista se conserva solo por el dibujo. */}
      <ul className="item-opciones" role="radiogroup" aria-label="Opciones de respuesta">
        {opciones.map((op, i) => {
          const estado = estadoDe(op);
          const seleccionada = op.id === elegida;
          return (
            <li key={op.id} role="presentation">
              <button
                type="button"
                className="item-opcion"
                role="radio"
                aria-checked={seleccionada}
                // Tabulacion movil: el grupo entero es UNA parada de tabulador
                // y adentro se anda con las flechas, que es el patron de los
                // radios. Antes habia que tabular cuatro veces para pasarlas.
                tabIndex={indiceFoco === i ? 0 : -1}
                ref={(el) => { botonesRef.current[i] = el; }}
                data-estado={estado}
                // aria-disabled y no disabled: un boton deshabilitado pierde el
                // foco del teclado y quien navega asi queda tirado al inicio.
                aria-disabled={bloqueado}
                onClick={() => { if (!bloqueado) alElegir(op.id); setIndiceFoco(i); }}
                onKeyDown={(e) => alTeclearEnGrupo(e, i)}
              >
                <span className="item-letra" aria-hidden="true">{LETRAS[i] ?? i + 1}</span>
                <span className="item-texto">
                  <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={ENLINEA}>
                    {op.texto}
                  </Markdown>
                </span>
                {estado === "correcta" && <span className="item-marca">✓ Correcta</span>}
                {estado === "incorrecta" && <span className="item-marca">✗ Incorrecta</span>}
                {/* En simulacro no hay corrección, pero SÍ tiene que verse cuál
                    tocó. Sin esto el chiquito marcaba y la pantalla no le
                    respondía nada: quedaba sin saber si le había pegado al
                    botón. La palabra acompaña al color, igual que siempre. */}
                {!corrige && seleccionada && <span className="item-marca">✓ Marcada</span>}
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
      {corrige && respondido && (
        <p role="status" className="ps-solo-lectores">
          {acerto
            ? "Correcta."
            : `Incorrecta. La correcta era la opción ${LETRAS[iCorrecta] ?? iCorrecta + 1}.`}
        </p>
      )}
    </article>
  );
}
