import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Link } from "react-router-dom";
import { CircleAlert, ListChecks, PartyPopper, Printer, RotateCcw } from "lucide-react";
import { NOMBRE_SITIO } from "../../config";
import { letraDe, nivelNota, PALABRA_NOTA } from "../practica/calificar";
import type { Simulacros } from "./useSimulacro";

const REMARK = [remarkMath, remarkGfm];
const REHYPE = [rehypeKatex];
const ENLINEA = { p: (props: { children?: React.ReactNode }) => <>{props.children}</> };

// La revision de un cuadernillo de cuarenta son cuarenta enunciados y
// ciento sesenta opciones. Montar doscientos react-markdown con KaTeX de
// un solo golpe congela un celular de gama baja varios segundos justo
// despues de entregar, que es el peor momento.
//
// Casi toda opcion es texto pelado ("14", "Los pueblos originarios"). Si
// no trae ni un caracter de marcado, se pinta como texto y se ahorra el
// motor entero. Los enunciados si pasan siempre por el motor: ahi hay
// tablas, imagenes y formulas de verdad.
const MARCADO = /[$*_`|~[\]\\<>]|!\[|^\s*[-+#>]|\d\./;

function Texto({ children }: { children: string }) {
  if (!MARCADO.test(children)) return <>{children}</>;
  return (
    <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={ENLINEA}>
      {children}
    </Markdown>
  );
}

type Props = {
  simulacros: Simulacros;
};

// Fecha en palabras, como la escribiria un tico. Sale del aparato del
// chiquito, no del servidor: es solo para que la hoja impresa tenga
// cuando se hizo.
function fechaDeHoy(): string {
  try {
    return new Intl.DateTimeFormat("es-CR", {
      day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  } catch {
    return new Date().toLocaleDateString();
  }
}

/**
 * Pantalla 3 del simulacro: la nota, el desglose por tema y la revision
 * completa de las cuarenta.
 *
 * A diferencia de la practica, aca se muestran TODAS y no solo las
 * falladas. Es lo que hace que la hoja impresa sirva: el chiquito se
 * lleva el cuadernillo entero con lo que marco y lo que era.
 */
export default function ResultadosSimulacro({ simulacros }: Props) {
  const { actual, respuestas, calificacion, seAcaboElTiempo, repetir, volverALista,
          abriendo, errorAbrir } = simulacros;
  const { nota, aciertos, total, respondidas, sinResponder, porTema } = calificacion;

  if (!actual) return null;

  const nivel = nivelNota(nota);
  const perfecta = total > 0 && aciertos === total;
  const items = actual.items;

  return (
    <>
      {/* Encabezado que solo sale en la hoja impresa. En pantalla estorba:
          el titulo de la materia ya esta arriba. */}
      <header className="sim-membrete" aria-hidden="true">
        <p className="sim-membrete-sitio">{NOMBRE_SITIO}</p>
        <p className="sim-membrete-titulo">
          {actual.materia_nombre} · {actual.titulo}
        </p>
        <p className="sim-membrete-linea">
          Nombre: ______________________________ &nbsp;&nbsp; Fecha: {fechaDeHoy()}
        </p>
        <p className="sim-membrete-linea">
          Nota: {nota} de 100 · {aciertos} buenas de {total}
        </p>
      </header>

      <div className="res-tarjeta" data-nivel={nivel}>
        <p className="res-etiqueta-nota">Tu nota</p>
        <p className="res-nota">
          <span className="res-numero">{nota}</span>
          <span className="res-sobre"> de 100</span>
        </p>
        {/* La palabra va siempre pegada al numero: el color solo no basta. */}
        <p className="res-palabra">{PALABRA_NOTA[nivel]}</p>
        <p className="res-cuenta">
          Acertaste <strong>{aciertos}</strong> de <strong>{total}</strong> preguntas.
          Respondiste {respondidas} de {total}.
        </p>
      </div>

      <div className="sim-acciones sim-no-imprime">
        <button type="button" className="ps-boton sim-imprimir" onClick={() => window.print()}>
          <Printer size={20} strokeWidth={2.2} aria-hidden="true" />
          Guardar en PDF o imprimir
        </button>
        <button
          type="button"
          className="ps-boton res-boton-secundario"
          onClick={() => { if (!abriendo) repetir(); }}
          aria-disabled={abriendo !== null}
          aria-busy={abriendo !== null}
        >
          <RotateCcw size={20} strokeWidth={2.2} aria-hidden="true" />
          {abriendo ? "Preparando…" : "Hacerlo otra vez"}
        </button>
        <button type="button" className="ps-boton res-boton-secundario" onClick={volverALista}>
          <ListChecks size={20} strokeWidth={2.2} aria-hidden="true" />
          Otro simulacro
        </button>
      </div>
      {/* Si se cae la red al pedir el cuadernillo de nuevo, el error se ve
          aca mismo y los resultados NO se pierden: siguen abajo, listos
          para imprimir. */}
      {errorAbrir && (
        <p className="sim-error sim-no-imprime" role="alert">{errorAbrir}</p>
      )}
      <p className="sim-pista sim-no-imprime">
        Al darle a guardar, el aparato abre su ventana de impresión. Ahí escogés
        <strong> Guardar como PDF</strong> y te queda el cuadernillo completo con lo
        que marcaste y lo que era. Sirve para repasarlo con la maestra o en la casa.
      </p>

      {sinResponder > 0 && (
        <p className="res-aviso">
          <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
          <span>
            {seAcaboElTiempo ? "Se te acabó el tiempo. " : ""}
            Quedaron <strong>{sinResponder}</strong>{" "}
            {sinResponder === 1 ? "pregunta sin responder" : "preguntas sin responder"} y
            cuentan como malas.
          </span>
        </p>
      )}

      {perfecta && (
        <p className="res-felicita">
          <PartyPopper size={24} strokeWidth={2} aria-hidden="true" />
          <span>
            <strong>¡Las {total} buenas!</strong> Eso no se ve todos los días.
            Probá con otro simulacro de la misma materia.
          </span>
        </p>
      )}

      {porTema.length > 0 && (
        <section className="res-bloque" aria-labelledby="sim-temas-titulo">
          <h2 id="sim-temas-titulo">¿Cómo te fue en cada tema?</h2>
          <p className="res-bajada">Arriba está lo que hay que repasar primero.</p>
          <ul className="res-temas">
            {porTema.map((t) => {
              const nt = nivelNota(t.porcentaje);
              return (
                <li className="res-tema" key={t.tema} data-nivel={nt}>
                  <span className="res-tema-nombre">{t.tema}</span>
                  <span className="res-tema-dato">
                    {t.aciertos} de {t.total} · {t.porcentaje}%
                  </span>
                  <span className="res-tema-barra" aria-hidden="true">
                    <span style={{ width: `${t.porcentaje}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="res-bloque" aria-labelledby="sim-revision-titulo">
        <h2 id="sim-revision-titulo">Las {total}, una por una</h2>
        <p className="res-bajada">
          Cada pregunta con sus cuatro opciones: la buena va marcada con ✓ y lo que
          vos marcaste, con ✗ cuando no era. Donde hay explicación, viene abajo.
        </p>

        <ol className="sim-revision" role="list">
          {items.map((item, i) => {
            const elegida = respuestas[i] ?? null;
            const bien = item.opciones.find((o) => o.id === elegida)?.es_correcta === true;
            const sinContestar = elegida === null;
            return (
              <li
                className="sim-revi"
                key={item.id}
                data-estado={sinContestar ? "vacia" : bien ? "buena" : "mala"}
              >
                <p className="sim-revi-cima">
                  <span className="sim-revi-numero">Pregunta {i + 1}</span>
                  <span className="sim-revi-tema">{item.tema ?? "Sin tema"}</span>
                  {/* El resultado se dice con palabra y con simbolo, nunca
                      solo con el color del borde. */}
                  <span className="sim-revi-sello">
                    {sinContestar ? "— Sin responder" : bien ? "✓ Buena" : "✗ Mala"}
                  </span>
                </p>

                <div className="sim-revi-enunciado">
                  <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE}>
                    {item.enunciado}
                  </Markdown>
                </div>

                <ul className="sim-revi-opciones" role="list">
                  {item.opciones.map((op, j) => {
                    const laMarque = op.id === elegida;
                    const esLaBuena = op.es_correcta;
                    const tipo = esLaBuena ? "buena" : laMarque ? "mala" : undefined;
                    return (
                      <li key={op.id} className="sim-revi-op" data-tipo={tipo}>
                        <span className="sim-revi-letra" aria-hidden="true">
                          {letraDe(j)}
                        </span>
                        <span className="sim-revi-texto">
                          <Texto>{op.texto}</Texto>
                        </span>
                        {esLaBuena && <span className="sim-revi-nota">✓ Era esta</span>}
                        {laMarque && !esLaBuena && (
                          <span className="sim-revi-nota">✗ Marcaste esta</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* La retroalimentacion, cuando el item la trae. Va en texto
                    plano con los saltos de linea respetados: el banco la
                    escribe con emoji y pasos numerados, no con marcado.
                    Todavia hay items sin ella; ahi el chiquito ve al menos
                    cual era la buena, que es lo que ya marca la lista. */}
                {item.retroalimentacion && item.retroalimentacion.trim() && (
                  <div className="sim-revi-retro">
                    <p className="sim-revi-retro-titulo">Por qué</p>
                    <p className="sim-revi-retro-texto">{item.retroalimentacion.trim()}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="res-acciones sim-no-imprime">
        <button
          type="button"
          className="ps-boton"
          onClick={() => { if (!abriendo) repetir(); }}
          aria-disabled={abriendo !== null}
        >
          <RotateCcw size={20} strokeWidth={2.2} aria-hidden="true" />
          Hacerlo otra vez
        </button>
        <Link to="/" className="ps-boton res-boton-secundario">
          Volver al inicio
        </Link>
      </div>
      <p className="res-nota-pie">
        Esta nota no queda guardada en ningún servidor: se guarda solo en este
        aparato, para que puedas comparar cuando lo repitás.
      </p>
    </>
  );
}
