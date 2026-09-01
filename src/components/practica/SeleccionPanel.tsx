import { useId, useState } from "react";
import { Check, ChevronDown, CircleAlert, Play, PlayCircle } from "lucide-react";
import { CANTIDADES } from "../../config";
import { ErrorCarga } from "../Estados";
import type { Practica } from "./usePractica";

type Props = {
  nombreMateria: string;
  practica: Practica;
};

// ============================================================
// Pantalla 1: escoger y arrancar.
//
// Esta pantalla estuvo recargada y se rehizo con la cuenta en la mano.
// Antes de contestar la primera pregunta, un chiquito veia: tres tarjetas
// de instrucciones, una banda de "todos los temas", ocho tarjetas de tema
// cada una de un color pastel distinto, cuatro tarjetas de cantidad y una
// tarjeta de reloj de tres lineas. Veinte cajas y cinco titulos.
//
// La memoria de trabajo a los once o doce anos ronda las TRES unidades
// (Cowan, 2012), o sea lo mismo que la de un adulto. Veinte cajas no es
// generosidad: es ruido, y con un estudiante con deficit atencional o del
// espectro es directamente una barrera.
//
// Lo que quedo, y por que:
//   · Las tres tarjetas de instrucciones se fueron. Nielsen Norman Group
//     tiene medido que de 8 a 12 anos ya escanean como adultos y SALTAN los
//     bloques de instrucciones. Lo que decian cabe en un renglon al final.
//   · Los temas arrancan cerrados. Practicar todo es lo normal y es lo que
//     mas se parece a la prueba; quien quiera afinar, abre la lista.
//   · Se fueron los ocho colores pastel. Colores que no significan nada son
//     ruido: el color se guarda para lo que si dice algo (correcto,
//     incorrecto, escogido).
//   · El reloj bajo de tarjeta a renglon.
//
// Quedan TRES decisiones a la vista: que tema, cuantas, y arrancar.
// ============================================================

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
    empezar,
    aceptarLasQueHay,
    respaldo,
    retomar,
    descartarRespaldo,
  } = practica;

  // La lista arranca cerrada. Se abre sola si ya venia un tema escogido,
  // para que quien vuelve de una practica no crea que se le perdio.
  const [temasAbiertos, setTemasAbiertos] = useState(temaSel !== null);
  const idLista = useId();

  const nombreTemaSel = temas.find((t) => t.id === temaSel)?.nombre ?? null;
  // Cuantas preguntas hay para lo que tiene escogido ahora mismo. Si el
  // conteo por tema no cargo, queda en null y no se inventa ningun numero.
  const disponiblesAhora =
    temaSel === null ? itemsEnLaMateria : (conteoPorTema[temaSel] ?? null);
  const avisaPocasDeEntrada =
    disponiblesAhora !== null && disponiblesAhora > 0 && cantidad > disponiblesAhora;

  return (
    <>
      {/* Lo que quedo a medias va de primero, antes de escoger nada: es lo
          que el chiquito viene a buscar cuando vuelve. */}
      {respaldo && (
        <section className="sel-retomar" aria-labelledby="sel-retomar-titulo">
          <h2 id="sel-retomar-titulo">
            <PlayCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            Dejaste una práctica de {nombreMateria} a medias
          </h2>
          <p>
            Contestaste {respaldo.contestadas} de {respaldo.total}. Se guardó en este
            aparato, así que podés seguir donde ibas.
          </p>
          <div className="sel-retomar-botones">
            <button type="button" className="ps-boton" onClick={retomar}>
              Seguir donde iba
            </button>
            <button type="button" className="sel-descartar" onClick={descartarRespaldo}>
              Empezar de cero
            </button>
          </div>
        </section>
      )}

      <fieldset className="sel-grupo">
        <legend>¿Qué vas a practicar?</legend>

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
          <>
            <button
              type="button"
              className="sel-abrir-temas"
              aria-expanded={temasAbiertos}
              aria-controls={idLista}
              onClick={() => setTemasAbiertos((v) => !v)}
            >
              {nombreTemaSel ? `Tema: ${nombreTemaSel}` : "Escoger un tema"}
              <ChevronDown
                size={20}
                strokeWidth={2.4}
                aria-hidden="true"
                className="sel-flecha"
                data-abierto={temasAbiertos ? "si" : "no"}
              />
            </button>

            {/* Lista calmada, todos del mismo color. Lo escogido se marca con
                la barra de la izquierda, el fondo y la negrita: tres senales,
                ninguna de ellas solo el color. */}
            <div className="sel-lista-temas" id={idLista} hidden={!temasAbiertos}>
              {temas.map((t) => {
                const cuantas = conteoPorTema[t.id];
                return (
                  <label className="sel-tema-fila" key={t.id}>
                    <input
                      type="radio"
                      name="practica-tema"
                      checked={temaSel === t.id}
                      onChange={() => elegirTema(t.id)}
                    />
                    <span className="sel-fila-nombre">{t.nombre}</span>
                    <span className="sel-fila-cuenta">
                      {cuantas === undefined ? "" : cuantas}
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="sel-grupo">
        <legend>¿Cuántas?</legend>
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
            </label>
          ))}
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

      {/* Lo que antes eran tres tarjetas, en un renglon. */}
      <p className="sel-fino">
        Sin reloj y sin apuro. Tu nota no se guarda y podés repetir las veces que querás.
      </p>

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
