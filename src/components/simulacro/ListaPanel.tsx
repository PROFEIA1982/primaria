import { useEffect, useRef } from "react";
import { Award, ClipboardList, Clock, PlayCircle, RotateCcw } from "lucide-react";
import { SEGUNDOS_POR_ITEM } from "../../config";
import { tiempoLargo } from "../practica/calificar";
import { ErrorCarga, Vacio } from "../Estados";
import EsqueletoPregunta from "../practica/EsqueletoPregunta";
import type { Simulacros } from "./useSimulacro";

type Props = {
  nombreMateria: string;
  simulacros: Simulacros;
};

// Pantalla 1 del simulacro: los tres cuadernillos de la materia.
export default function ListaPanel({ nombreMateria, simulacros }: Props) {
  const {
    estadoLista, recargar, lista, marcas, abriendo, errorAbrir, empezar,
    enCurso, retomar, descartarEnCurso,
  } = simulacros;

  // Si falla la apertura, el foco vuelve al boton que se toco. Sin esto
  // quedaba suelto en el cuerpo del documento y quien anda con teclado
  // tenia que tabular desde arriba para volver a intentarlo.
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});
  const ultimoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!errorAbrir || !ultimoRef.current) return;
    botones.current[ultimoRef.current]?.focus();
  }, [errorAbrir]);

  if (estadoLista === "cargando") return <EsqueletoPregunta />;

  if (estadoLista === "error") {
    return (
      <ErrorCarga
        mensaje="No se cargaron los simulacros de esta materia."
        alReintentar={recargar}
      />
    );
  }

  if (lista.length === 0) {
    return (
      <Vacio mensaje={`Todavía no hay simulacros de ${nombreMateria}. Los estamos armando.`} />
    );
  }

  function tocar(slug: string) {
    ultimoRef.current = slug;
    empezar(slug);
  }

  return (
    <>
      {/* Lo que quedo a medias va de primero: es lo que el chiquito viene
          a buscar cuando vuelve. */}
      {enCurso && (
        <section className="sim-retomar" aria-labelledby="sim-retomar-titulo">
          <h2 id="sim-retomar-titulo">
            <PlayCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            Dejaste el {enCurso.titulo} a medias
          </h2>
          <p>
            Se guardó en este aparato. Podés seguirlo donde ibas, con el tiempo
            que te quedaba.
          </p>
          <div className="sim-retomar-botones">
            <button
              type="button"
              className="ps-boton"
              onClick={() => { ultimoRef.current = enCurso.slug; retomar(); }}
              aria-busy={abriendo === enCurso.slug}
            >
              {abriendo === enCurso.slug ? "Preparando…" : "Seguir donde iba"}
            </button>
            <button type="button" className="sim-descartar" onClick={descartarEnCurso}>
              Empezar de cero
            </button>
          </div>
        </section>
      )}

      {/* role="list" explicito: con list-style:none, Safari y VoiceOver le
          quitan la semantica de lista. */}
      <ul className="sim-lista" role="list">
        {lista.map((s) => {
          const marca = marcas[s.slug];
          const cargando = abriendo === s.slug;
          const minutos = tiempoLargo(s.cantidad * SEGUNDOS_POR_ITEM);
          return (
            <li key={s.slug}>
              <article className="sim-tarjeta">
                <h2 className="sim-tarjeta-titulo">{s.titulo}</h2>

                <p className="sim-tarjeta-datos">
                  <span className="sim-dato">
                    <ClipboardList size={20} strokeWidth={2} aria-hidden="true" />
                    {s.cantidad} preguntas
                  </span>
                  <span className="sim-dato">
                    <Clock size={20} strokeWidth={2} aria-hidden="true" />
                    {minutos}
                  </span>
                </p>

                {/* La marca solo aparece si ya lo hizo alguna vez. El
                    numero de intentos va escrito, no en una racha de
                    puntitos: es mas claro y se lee en voz alta bien. */}
                {marca ? (
                  <p className="sim-marca">
                    <Award size={20} strokeWidth={2} aria-hidden="true" />
                    <span>
                      Lo hiciste <strong>{marca.intentos}</strong>{" "}
                      {marca.intentos === 1 ? "vez" : "veces"}. Tu mejor nota:{" "}
                      <strong>{marca.mejor}</strong> de 100.
                    </span>
                  </p>
                ) : (
                  <p className="sim-marca sim-marca--nueva">Todavía no lo has hecho.</p>
                )}

                {/* aria-disabled y no disabled: un boton deshabilitado
                    pierde el foco, y el chiquito que acaba de tocarlo con
                    el teclado quedaba tirado en el cuerpo del documento. */}
                <button
                  type="button"
                  className="ps-boton sim-empezar"
                  ref={(el) => { botones.current[s.slug] = el; }}
                  onClick={() => { if (abriendo === null) tocar(s.slug); }}
                  aria-disabled={abriendo !== null}
                  data-esperando={abriendo !== null ? "" : undefined}
                >
                  {marca && !cargando ? (
                    <RotateCcw size={20} strokeWidth={2.2} aria-hidden="true" />
                  ) : null}
                  {cargando ? "Preparando…" : marca ? "Volver a hacerlo" : "Empezar"}
                  {/* El nombre completo es para el lector de pantalla: con
                      tres botones que dicen "Empezar" no se sabe cual es cual. */}
                  <span className="ps-solo-lectores"> el {s.titulo} de {nombreMateria}</span>
                </button>

                {/* El error va dentro de la tarjeta que fallo, no al final
                    de la lista: en un celular, quien toco la primera no
                    veia nunca el aviso de abajo. */}
                {errorAbrir && ultimoRef.current === s.slug && (
                  <p className="sim-error" role="alert">{errorAbrir}</p>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
