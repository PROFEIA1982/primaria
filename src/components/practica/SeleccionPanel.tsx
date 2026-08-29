import { CircleAlert, Play } from "lucide-react";
import { CANTIDADES, SEGUNDOS_POR_ITEM } from "../../config";
import { ErrorCarga } from "../Estados";
import { tiempoLargo } from "./calificar";
import type { Practica } from "./usePractica";

type Props = {
  nombreMateria: string;
  practica: Practica;
};

// Pantalla 1: se escoge tema y cantidad. Nada mas. Entre menos decisiones,
// mas rapido se pone a practicar el estudiante.
export default function SeleccionPanel({ nombreMateria, practica }: Props) {
  const {
    temas,
    temaSel,
    elegirTema,
    cantidad,
    elegirCantidad,
    itemsEnLaMateria,
    preparando,
    errorSorteo,
    pocasDisponibles,
    empezar,
    aceptarLasQueHay,
  } = practica;

  const nombreTemaSel = temas.find((t) => t.id === temaSel)?.nombre ?? null;
  // Solo se puede avisar de antemano cuando practica con todos los temas:
  // el conteo por tema no viaja al navegador.
  const avisaPocasDeEntrada =
    temaSel === null && itemsEnLaMateria > 0 && cantidad > itemsEnLaMateria;

  return (
    <>
      <fieldset className="sel-grupo">
        <legend>¿De qué tema querés practicar?</legend>
        <div className="sel-chips">
          <label className="sel-chip">
            <input
              type="radio"
              name="practica-tema"
              checked={temaSel === null}
              onChange={() => elegirTema(null)}
            />
            <span className="sel-marca" aria-hidden="true">✓</span>
            <span className="sel-chip-texto">Todos los temas</span>
          </label>

          {temas.map((t) => (
            <label className="sel-chip" key={t.id}>
              <input
                type="radio"
                name="practica-tema"
                checked={temaSel === t.id}
                onChange={() => elegirTema(t.id)}
              />
              <span className="sel-marca" aria-hidden="true">✓</span>
              <span className="sel-chip-texto">{t.nombre}</span>
            </label>
          ))}
        </div>
        {temas.length === 0 && (
          <p className="sel-pista">
            Esta materia todavía no está separada por temas. Practicá con todas
            las preguntas y ya.
          </p>
        )}
      </fieldset>

      <fieldset className="sel-grupo">
        <legend>¿Cuántas preguntas querés hacer?</legend>
        <div className="sel-rejilla">
          {CANTIDADES.map((n) => (
            <label className="sel-cantidad" key={n}>
              <input
                type="radio"
                name="practica-cantidad"
                checked={cantidad === n}
                onChange={() => elegirCantidad(n)}
              />
              <span className="sel-marca" aria-hidden="true">✓</span>
              <span className="sel-num">{n}</span>
              <span className="sel-tiempo">{tiempoLargo(n * SEGUNDOS_POR_ITEM)}</span>
            </label>
          ))}
        </div>
        <p className="sel-pista">
          Son dos minutos por pregunta, igual que el día de la prueba. Si
          terminás antes, mejor para vos.
        </p>
      </fieldset>

      {avisaPocasDeEntrada && (
        <p className="sel-aviso">
          <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
          <span>
            Por ahora en {nombreMateria} hay <strong>{itemsEnLaMateria}</strong>{" "}
            {itemsEnLaMateria === 1 ? "pregunta" : "preguntas"}. Si pedís {cantidad}, vas
            a practicar con las que hay.
          </span>
        </p>
      )}

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
        <p className="sel-nota">
          Nadie ve tu nota. Practicá las veces que querás.
        </p>
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
