import { useEffect, useRef } from "react";
import { Award, ClipboardList, Clock, PlayCircle, RotateCcw } from "lucide-react";
import { ErrorCarga, Vacio } from "../Estados";
import EsqueletoPregunta from "../practica/EsqueletoPregunta";
import {
  SEGUNDOS_ITEM_SIMULACRO, SEGUNDOS_ITEM_SIMULACRO_EXTRA,
} from "../../config";
import { useTiempoExtra } from "../../lib/apariencia";
import type { Simulacros } from "./useSimulacro";

// "3 horas", "3 h 20 min", "45 minutos". Sin decimales raros.
function duracion(segundos: number): string {
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} minutos`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  const parteH = h === 1 ? "1 hora" : `${h} horas`;
  return resto === 0 ? parteH : `${parteH} y ${resto} min`;
}

type Props = {
  nombreMateria: string;
  simulacros: Simulacros;
};

// Pantalla 1 del simulacro: los tres cuadernillos de la materia.
export default function ListaPanel({ nombreMateria, simulacros }: Props) {
  const {
    estadoLista, recargar, lista, marcas, abriendo, errorAbrir, empezar,
    enCurso, enCursoVencido, enCursoRespondidas, retomar, descartarEnCurso,
  } = simulacros;
  // La duracion sale de la cuenta, no escrita a mano: son tres minutos por
  // pregunta, o cuatro con la adecuacion puesta. Decia "3 horas" fijo, que
  // solo calzaba con cuadernillos de 60 y con la adecuacion apagada.
  const tiempoExtra = useTiempoExtra();
  const segPorItem = tiempoExtra ? SEGUNDOS_ITEM_SIMULACRO_EXTRA : SEGUNDOS_ITEM_SIMULACRO;

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
            {enCursoVencido
              ? `Se te acabó el tiempo del ${enCurso.titulo}`
              : `Dejaste el ${enCurso.titulo} a medias`}
          </h2>
          <p>
            {enCursoVencido ? (
              <>
                Alcanzaste a contestar <strong>{enCursoRespondidas}</strong> de{" "}
                {enCurso.cantidad}. Ese trabajo no se perdió: mirá cómo te fue y
                qué fallaste.
              </>
            ) : (
              <>
                Llevás <strong>{enCursoRespondidas}</strong> de {enCurso.cantidad}{" "}
                y se guardó en este aparato. Seguí donde ibas, con el tiempo que
                te quedaba.
              </>
            )}
          </p>
          <div className="sim-retomar-botones">
            <button
              type="button"
              className="ps-boton"
              onClick={() => { ultimoRef.current = enCurso.slug; retomar(); }}
              aria-busy={abriendo === enCurso.slug}
            >
              {abriendo === enCurso.slug
                ? "Preparando…"
                : enCursoVencido ? "Ver cómo me fue" : "Seguir donde iba"}
            </button>
            <button type="button" className="sim-descartar" onClick={descartarEnCurso}>
              {enCursoVencido ? "Descartarlo" : "Empezar de cero"}
            </button>
          </div>
        </section>
      )}

      {/* Las tres reglas del simulacro, arriba y en una sola pasada. Van
          aca y no repetidas dentro de cada tarjeta: son iguales para los
          dos cuadernillos y decirlas dos veces es relleno.
          Tres, no diez: de 8 a 12 anos los bloques largos de instrucciones
          se los saltan (Nielsen Norman Group, Children's UX). */}
      <section className="sim-reglas" aria-label="Cómo funciona el simulacro">
        <p><strong>Todas de corrido, con reloj.</strong> Como el día de la prueba.</p>
        <p><strong>Podés devolverte.</strong> Cambiás lo que querás hasta entregar.</p>
        <p><strong>No se pierde.</strong> Si se cierra la pestaña, seguís donde ibas.</p>
      </section>

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
                    {duracion(s.cantidad * segPorItem)}
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

      {/* Lo unico que quedaba por decir de esta pantalla, y apoya la
          ultima tarjeta para que no quede colgando sobre el vacio. */}
      <p className="sim-cierre">
        <strong>Al entregar ves tu nota</strong> y, pregunta por pregunta, cuál
        fallaste y por qué. Podés guardarlo en PDF para repasarlo después o
        enseñárselo a la maestra.
      </p>
    </>
  );
}
