import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCheck, CircleAlert, Clock, LogOut, TriangleAlert,
} from "lucide-react";
import ItemRenderer from "../ItemRenderer";
import BarraApoyo, { type TamanoTexto } from "../practica/BarraApoyo";
import { formatearReloj, PALABRA_RELOJ, type NivelReloj } from "../practica/calificar";
import { useBarraPegada, useLlevarALaPregunta } from "../practica/useBarraPegada";
import type { Simulacros } from "./useSimulacro";

const ICONO_RELOJ: Record<NivelReloj, typeof Clock> = {
  normal: Clock,
  poco: TriangleAlert,
  critico: CircleAlert,
};

type Props = {
  simulacros: Simulacros;
};

/**
 * Pantalla 2 del simulacro.
 *
 * Se parece al examen de la practica pero se porta distinto en tres cosas,
 * y las tres son a proposito:
 *   · no dice si la respuesta estuvo bien, eso se ve hasta el final
 *   · se puede ir y volver entre las cuarenta preguntas
 *   · se puede cambiar una respuesta mientras no entregue
 */
export default function SimulacroPanel({ simulacros }: Props) {
  const {
    actual, indice, respuestas, responder, irA, siguiente, anterior, entregar,
    sinResponderAun, restante, nivel, aviso, volverALista,
  } = simulacros;

  const items = actual?.items ?? [];
  const total = items.length;

  // Las dos ayudas de lectura, iguales que en la practica.
  const [tamano, setTamano] = useState<TamanoTexto>("normal");
  const [altoContraste, setAltoContraste] = useState(false);

  const { barraRef, altoMenu, altoBarra } = useBarraPegada();
  const cuerpoRef = useLlevarALaPregunta(indice);

  // Entregar y salir van en dos pasos, no en un confirm del navegador:
  // el confirm interrumpe, asusta y se ve distinto en cada aparato.
  const [aviso2, setAviso2] = useState<null | "entregar" | "salir">(null);
  const volverRef = useRef<HTMLButtonElement>(null);
  const botonEntregarRef = useRef<HTMLButtonElement>(null);
  const botonSalirRef = useRef<HTMLButtonElement>(null);
  // Cual boton hay que volver a enfocar al cerrar, y si toca hacerlo.
  // Solo se devuelve el foco cuando el chiquito se arrepintio; si el
  // aviso se cerro porque cambio de pregunta, el foco es de la pregunta
  // nueva y quitarselo le daria un brinco doble.
  const devolverFocoRef = useRef<null | "entregar" | "salir">(null);

  useEffect(() => {
    if (aviso2) {
      // El foco cae en la salida segura: si alguien le da a la barra
      // espaciadora sin leer, no entrega ni pierde nada.
      volverRef.current?.focus();
      return;
    }
    const destino = devolverFocoRef.current;
    if (!destino) return;
    devolverFocoRef.current = null;
    (destino === "salir" ? botonSalirRef : botonEntregarRef).current?.focus();
  }, [aviso2]);

  // Con Escape se cierra, igual que cualquier aviso de la casa.
  useEffect(() => {
    if (!aviso2) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      devolverFocoRef.current = aviso2;
      setAviso2(null);
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [aviso2]);

  const cerrarAviso = () => {
    devolverFocoRef.current = aviso2;
    setAviso2(null);
  };

  // Si se mueve de pregunta con un aviso abierto, se cierra solo. Se
  // ajusta durante el render y no en un efecto para que no se alcance a
  // dibujar un cuadro con el aviso de la pregunta anterior. Aca no se
  // pide devolver el foco: se lo lleva la pregunta nueva.
  const [indicePrevio, setIndicePrevio] = useState(indice);
  if (indice !== indicePrevio) {
    setIndicePrevio(indice);
    devolverFocoRef.current = null;
    setAviso2(null);
  }

  const item = items[indice];
  if (!actual || !item) return null;

  const elegida = respuestas[indice] ?? null;
  const avance = total === 0 ? 0 : ((indice + 1) / total) * 100;
  const IconoReloj = ICONO_RELOJ[nivel];
  const respondidas = total - sinResponderAun;

  return (
    <>
      <div className="examen-barra" ref={barraRef} style={{ top: `${altoMenu}px` }}>
        <div className="ps-contenedor examen-barra-caja">
          <h1 className="examen-materia">
            {actual.materia_nombre} · {actual.titulo}
          </h1>
          <p className="examen-progreso">
            Pregunta <strong>{indice + 1}</strong> de {total}
          </p>
          <p className="examen-reloj" data-nivel={nivel}>
            <IconoReloj size={20} strokeWidth={2.2} aria-hidden="true" />
            <span className="examen-tiempo">{formatearReloj(restante)}</span>
            {/* La palabra acompana siempre al color: hay chiquitos que no
                distinguen el ambar del rojo. */}
            <span className="examen-palabra">{PALABRA_RELOJ[nivel]}</span>
          </p>
        </div>
        {/* La barrita es dibujo y nada mas: el "Pregunta 3 de 40" de
            arriba ya dice lo mismo, y con role="progressbar" el lector
            de pantalla lo repetia dos veces seguidas. */}
        <div className="examen-barrita" aria-hidden="true">
          <span style={{ width: `${avance}%` }} />
        </div>
      </div>

      {/* La region viva no canta cada segundo: solo cambia al pasar de
          minuto o cuando el tiempo entra en ambar o en rojo. */}
      <p className="ps-solo-lectores" aria-live="polite">{aviso}</p>

      {/* role="group" y no un div pelado: un div sin rol mapea a
          "generic", y en generic el nombre accesible esta prohibido, o
          sea que el aria-label se lo tragaban los tres navegadores. Al
          saltar a la pregunta nueva no se anunciaba nada. */}
      <div
        className="ps-contenedor examen-cuerpo"
        tabIndex={-1}
        ref={cuerpoRef}
        role="group"
        style={{ scrollMarginTop: `${altoMenu + altoBarra + 12}px` }}
        aria-label={`Pregunta ${indice + 1} de ${total}`}
      >
        <BarraApoyo
          tamano={tamano}
          alCambiarTamano={setTamano}
          altoContraste={altoContraste}
          alCambiarContraste={setAltoContraste}
        />

        {/* La key rearma el item con cada pregunta: al desmontarse corta la
            lectura en voz alta y el boton vuelve a decir "Escuchar". */}
        <ItemRenderer
          key={`${item.id}-${indice}`}
          enunciado={item.enunciado}
          opciones={item.opciones}
          elegida={elegida}
          alElegir={responder}
          imagenUrl={item.imagen_url}
          imagenAlt={item.imagen_alt}
          tamano={tamano}
          altoContraste={altoContraste}
          conVoz
          modo="examen"
        />

        <div className="sim-pasos">
          <button
            type="button"
            className="sim-paso"
            onClick={anterior}
            disabled={indice === 0}
          >
            <ArrowLeft size={20} strokeWidth={2.2} aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            className="ps-boton sim-paso"
            onClick={siguiente}
            disabled={indice === total - 1}
          >
            Siguiente
            <ArrowRight size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        {/* El mapa va plegado con details, que es nativo: se abre con
            teclado, lo anuncia el lector de pantalla y no necesita una
            linea de JavaScript. Cuarenta botones desplegados de entrada
            se comerian la pantalla del celular. */}
        <details className="sim-mapa">
          <summary>
            Ir a otra pregunta
            <span className="sim-mapa-cuenta">
              {respondidas} de {total} respondidas
            </span>
          </summary>
          {/* role="list" explicito: con list-style:none, Safari y
              VoiceOver le quitan la semantica de lista y se pierde el
              "1 de 40" que le dice al chiquito ciego donde va. */}
          <ul className="sim-mapa-rejilla" role="list">
            {items.map((_, i) => {
              const hecha = (respuestas[i] ?? null) !== null;
              return (
                <li key={i}>
                  <button
                    type="button"
                    className="sim-cuadro"
                    data-hecha={hecha ? "" : undefined}
                    // "step" y no "true": es el paso en que va, y asi lo
                    // anuncia el lector sin que haya que repetirlo en el
                    // texto escondido.
                    aria-current={i === indice ? "step" : undefined}
                    onClick={() => irA(i)}
                  >
                    {/* El numero se ve; el resto se lo lleva el lector. El
                        estado nunca va solo en el color: la respondida
                        lleva ademas el fondo lleno y el punto. */}
                    <span aria-hidden="true">{i + 1}</span>
                    <span className="ps-solo-lectores">
                      Pregunta {i + 1}, {hecha ? "respondida" : "sin responder"}
                    </span>
                    {hecha && <span className="sim-cuadro-punto" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>

        <div className="sim-cierre">
          {/* El texto del aviso va amarrado con aria-describedby al boton
              que recibe el foco. Sin eso, el lector anunciaba el boton y
              la etiqueta del grupo, pero no la frase que importa: "te
              quedan siete sin responder y cuentan como malas". */}
          {aviso2 === "entregar" && (
            <div className="examen-confirmar" role="group" aria-label="Confirmar la entrega">
              <p className="examen-confirmar-texto" id="sim-confirmar-texto">
                {sinResponderAun === 0
                  ? `Respondiste las ${total}. ¿Entregamos?`
                  : `Te quedan ${sinResponderAun} ${
                      sinResponderAun === 1 ? "pregunta sin responder y cuenta" : "preguntas sin responder y cuentan"
                    } como malas. ¿Entregás así?`}
              </p>
              <div className="examen-confirmar-botones">
                <button
                  type="button"
                  className="ps-boton examen-seguir"
                  ref={volverRef}
                  aria-describedby="sim-confirmar-texto"
                  onClick={cerrarAviso}
                >
                  Volver al simulacro
                </button>
                <button type="button" className="sim-confirmar-si" onClick={entregar}>
                  Sí, entregar
                </button>
              </div>
            </div>
          )}

          {aviso2 === "salir" && (
            <div className="examen-confirmar" role="group" aria-label="Confirmar la salida">
              <p className="examen-confirmar-texto" id="sim-confirmar-texto">
                ¿Seguro que querés salir? El simulacro queda guardado en este aparato
                y podés seguirlo después, pero el reloj no se detiene.
              </p>
              <div className="examen-confirmar-botones">
                <button
                  type="button"
                  className="ps-boton examen-seguir"
                  ref={volverRef}
                  aria-describedby="sim-confirmar-texto"
                  onClick={cerrarAviso}
                >
                  Volver al simulacro
                </button>
                <button type="button" className="examen-salir-si" onClick={volverALista}>
                  Sí, salir
                </button>
              </div>
            </div>
          )}

          {aviso2 === null && (
            <>
              <button
                type="button"
                className="ps-boton sim-entregar"
                ref={botonEntregarRef}
                onClick={() => setAviso2("entregar")}
              >
                <CheckCheck size={22} strokeWidth={2.2} aria-hidden="true" />
                Entregar el simulacro
              </button>
              <button
                type="button"
                className="examen-salir"
                ref={botonSalirRef}
                onClick={() => setAviso2("salir")}
              >
                <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                Salir sin entregar
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
