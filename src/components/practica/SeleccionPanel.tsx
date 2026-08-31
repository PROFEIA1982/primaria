import { Check, CircleAlert, Clock, EyeOff, ListChecks, Play, Timer, TimerOff } from "lucide-react";
import { CANTIDADES, SEGUNDOS_POR_ITEM } from "../../config";
import { ErrorCarga } from "../Estados";
import { tiempoLargo } from "./calificar";
import type { Practica } from "./usePractica";

type Props = {
  nombreMateria: string;
  practica: Practica;
};

// Las tres cosas que un chiquito de doce anios pregunta antes de empezar:
// que hago, cuanto dura y quien ve mi nota. Van arriba y en tarjetas, porque
// un parrafo de instrucciones nadie lo lee.
const INSTRUCCIONES = [
  {
    icono: ListChecks,
    titulo: "Escogé y practicá",
    texto: "Elegís un tema y contestás preguntas como las de la prueba.",
  },
  {
    icono: Clock,
    titulo: "Sin apuro",
    texto: "Si querés medirte contra el reloj, lo prendés abajo.",
  },
  {
    icono: EyeOff,
    titulo: "Tu nota no se guarda",
    texto: "Nadie la ve y podés repetir las veces que querás.",
  },
];

// Pantalla 1: se escoge tema y cantidad. Nada mas. Entre menos decisiones,
// mas rapido se pone a practicar el estudiante.
export default function SeleccionPanel({ nombreMateria, practica }: Props) {
  const {
    temas,
    conteoPorTema,
    temaSel,
    elegirTema,
    cantidad,
    elegirCantidad,
    itemsEnLaMateria,
    preparando,
    errorSorteo,
    pocasDisponibles,
    conReloj,
    alternarReloj,
    empezar,
    aceptarLasQueHay,
  } = practica;

  const nombreTemaSel = temas.find((t) => t.id === temaSel)?.nombre ?? null;
  // Cuantas preguntas hay para lo que tiene escogido ahora mismo. Si el
  // conteo por tema no cargo, queda en null y no se inventa ningun numero.
  const disponiblesAhora =
    temaSel === null ? itemsEnLaMateria : (conteoPorTema[temaSel] ?? null);
  const avisaPocasDeEntrada =
    disponiblesAhora !== null && disponiblesAhora > 0 && cantidad > disponiblesAhora;

  return (
    <>
      <ul className="sel-instrucciones" aria-label="Cómo funciona la práctica">
        {INSTRUCCIONES.map(({ icono: Icono, titulo, texto }) => (
          <li className="sel-instruccion" key={titulo}>
            <span className="sel-instruccion-icono" aria-hidden="true">
              <Icono size={22} strokeWidth={2} />
            </span>
            <span className="sel-instruccion-texto">
              <strong>{titulo}</strong>
              {texto}
            </span>
          </li>
        ))}
      </ul>

      <fieldset className="sel-grupo">
        <legend>¿De qué tema querés practicar?</legend>

        {/* "Todos los temas" sale del enrejado y se pone de banda ancha: es
            la opcion por omision y, metida entre las demas, quedaba una
            tarjeta estirada que descuadraba toda la fila. */}
        <label className="sel-todos">
          <input
            type="radio"
            name="practica-tema"
            checked={temaSel === null}
            onChange={() => elegirTema(null)}
          />
          <span className="sel-marca" aria-hidden="true">
            <Check size={17} strokeWidth={3.2} />
          </span>
          <span className="sel-todos-cuerpo">
            <span className="sel-todos-nombre">Todos los temas</span>
            <span className="sel-todos-cuenta">
              {itemsEnLaMateria} {itemsEnLaMateria === 1 ? "pregunta" : "preguntas"} · lo más
              parecido a la prueba
            </span>
          </span>
        </label>

        {temas.length > 0 && (
          <div className="sel-temas">
            {temas.map((t, i) => {
              const cuantas = conteoPorTema[t.id];
              return (
                // El tono se reparte por posicion, no por tema: es adorno para que
                // la rejilla se vea alegre y no informa nada por si solo.
                <label className="sel-tema" data-tono={i % 4} key={t.id}>
                  <input
                    type="radio"
                    name="practica-tema"
                    checked={temaSel === t.id}
                    onChange={() => elegirTema(t.id)}
                  />
                  <span className="sel-marca" aria-hidden="true">
                    <Check size={17} strokeWidth={3.2} />
                  </span>
                  <span className="sel-tema-nombre">{t.nombre}</span>
                  {/* El conteo se ancla abajo aunque el nombre ocupe una o tres
                      lineas: asi todas las tarjetas cierran a la misma altura. */}
                  <span className="sel-tema-cuenta">
                    {cuantas === undefined
                      ? "Practicá este tema"
                      : `${cuantas} ${cuantas === 1 ? "pregunta" : "preguntas"}`}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {temas.length === 0 && (
          <p className="sel-pista">
            Esta materia todavía no está separada por temas. Practicá con todas
            las preguntas y ya.
          </p>
        )}
      </fieldset>

      <fieldset className="sel-grupo">
        <legend>¿Cuántas preguntas querés hacer?</legend>
        <div className="sel-panel">
          <div className="sel-cantidades">
            {CANTIDADES.map((n) => (
              <label className="sel-cantidad" key={n}>
                <input
                  type="radio"
                  name="practica-cantidad"
                  checked={cantidad === n}
                  onChange={() => elegirCantidad(n)}
                />
                <span className="sel-cantidad-marca" aria-hidden="true">
                  <Check size={14} strokeWidth={3.2} />
                </span>
                <span className="sel-num">{n}</span>
                <span className="sel-tiempo">{tiempoLargo(n * SEGUNDOS_POR_ITEM)}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {avisaPocasDeEntrada && (
        <p className="sel-aviso">
          <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
          <span>
            {nombreTemaSel
              ? `En «${nombreTemaSel}» hay `
              : `Por ahora en ${nombreMateria} hay `}
            <strong>{disponiblesAhora}</strong>{" "}
            {disponiblesAhora === 1 ? "pregunta" : "preguntas"}. Si pedís {cantidad}, vas
            a practicar con las que hay.
          </span>
        </p>
      )}

      {/* El reloj arranca apagado. Khan Academy, IXL y Google Forms no ponen
          cuenta regresiva cuando el estudiante esta estudiando: el reloj es de
          las apps de competencia. Quien se quiere medir lo prende, y queda
          guardado para la proxima. El simulacro lo trae siempre. */}
      <div className="sel-reloj">
        <span className="sel-reloj-texto">
          <strong>Poner reloj</strong>
          <span>
            Apagado practicás con calma. El <strong>simulacro</strong> siempre
            lleva reloj, como el día de la prueba.
          </span>
        </span>
        <button
          type="button"
          className="sel-reloj-boton"
          aria-pressed={conReloj}
          onClick={alternarReloj}
        >
          {conReloj
            ? <Timer size={20} strokeWidth={2.2} aria-hidden="true" />
            : <TimerOff size={20} strokeWidth={2.2} aria-hidden="true" />}
          {conReloj ? "Encendido" : "Apagado"}
        </button>
      </div>

      <div className="sel-arranque">
        <button
          type="button"
          className="ps-boton sel-empezar"
          onClick={empezar}
          disabled={preparando}
        >
          <Play size={22} strokeWidth={2.2} aria-hidden="true" />
          {preparando ? "Preparando…" : "¡Empezar!"}
        </button>
      </div>

      {errorSorteo && (
        <ErrorCarga
          mensaje="No se armaron las preguntas."
          alReintentar={empezar}
        />
      )}

      {/* Salieron menos de las pedidas: se dice el numero y el estudiante
          decide, en vez de arrancar con menos sin avisar. */}
      {pocasDisponibles !== null && pocasDisponibles > 0 && (
        <div className="sel-pocas" role="alert">
          <p>
            <strong>Hay menos preguntas de las que pediste.</strong>{" "}
            {nombreTemaSel
              ? `De "${nombreTemaSel}" tenemos ${pocasDisponibles} `
              : `Tenemos ${pocasDisponibles} `}
            {pocasDisponibles === 1 ? "pregunta" : "preguntas"} y vos pediste {cantidad}.
          </p>
          <button type="button" className="ps-boton" onClick={aceptarLasQueHay}>
            Practicá con {pocasDisponibles === 1 ? "la que hay" : `las ${pocasDisponibles} que hay`} →
          </button>
        </div>
      )}

      {pocasDisponibles === 0 && (
        <div className="sel-pocas" role="alert">
          <p>
            <strong>Todavía no hay preguntas acá.</strong>{" "}
            {nombreTemaSel
              ? `El tema "${nombreTemaSel}" está vacío por ahora. Probá con otro tema o con "Todos los temas".`
              : "Volvé en unos días: las estamos subiendo."}
          </p>
        </div>
      )}
    </>
  );
}
