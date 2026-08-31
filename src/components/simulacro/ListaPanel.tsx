import { useEffect, useRef } from "react";
import { Award, ClipboardList, Clock, PlayCircle, RotateCcw } from "lucide-react";
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
    enCurso, retomar, descartarEnCurso, horas, elegirHoras,
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

  // El selector de tiempo solo tiene sentido si hay un Simulacro 2 en esta
  // materia: es el unico con opcion de horas. El Simulacro 1 siempre es 2 h.
  const haySim2 = lista.some((s) => s.numero >= 2);

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

      {/* El tiempo solo aplica al Simulacro 2: el Simulacro 1 siempre dura dos
          horas. Por eso el selector aparece nada mas cuando esta materia tiene
          un Simulacro 2. Es un radiogroup de verdad (fieldset + radios): asi el
          lector de pantalla lo anuncia como grupo y se anda con flechas. */}
      {haySim2 && (
        <fieldset className="sim-tiempo">
          <legend>¿Cuánto tiempo para el Simulacro 2?</legend>
          <div className="sim-tiempo-ops">
            <label className="sim-tiempo-op" data-elegida={horas === 3 ? "" : undefined}>
              <input
                type="radio"
                name="sim-horas"
                checked={horas === 3}
                onChange={() => elegirHoras(3)}
              />
              <span className="sim-tiempo-titulo">3 horas</span>
              <span className="sim-tiempo-nota">Lo normal</span>
            </label>
            <label className="sim-tiempo-op" data-elegida={horas === 4 ? "" : undefined}>
              <input
                type="radio"
                name="sim-horas"
                checked={horas === 4}
                onChange={() => elegirHoras(4)}
              />
              <span className="sim-tiempo-titulo">4 horas</span>
              <span className="sim-tiempo-nota">Con más tiempo</span>
            </label>
          </div>
          <p className="sim-tiempo-ayuda">
            Las <strong>4 horas</strong> son para estudiantes con apoyo educativo no
            significativo. Si no es tu caso, dejá las 3 horas. El{" "}
            <strong>Simulacro 1</strong> siempre dura 2 horas.
          </p>
        </fieldset>
      )}

      {/* role="list" explicito: con list-style:none, Safari y VoiceOver le
          quitan la semantica de lista. */}
      <ul className="sim-lista" role="list">
        {lista.map((s) => {
          const marca = marcas[s.slug];
          const cargando = abriendo === s.slug;
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
                    {s.numero >= 2 ? "3 o 4 horas" : "2 horas"}
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
