import { useEffect, useRef } from "react";
import { Award, ClipboardList, Clock, PlayCircle, RotateCcw } from "lucide-react";
import { ErrorCarga, Vacio } from "../Estados";
import EsqueletoPregunta from "../practica/EsqueletoPregunta";
import { useTiempoExtra } from "../../lib/apariencia";
import type { ExamenesNuevos } from "./useSimulacrosNuevos";

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
  examenes: ExamenesNuevos;
};

export default function ListaPanelNuevos({ nombreMateria, examenes }: Props) {
  const {
    estadoLista, recargar, lista, marcas, abriendo, errorAbrir, empezar,
    enCurso, enCursoVencido, enCursoRespondidas, retomar, descartarEnCurso,
  } = examenes;
  // El tiempo por pregunta sale de cada examen en la base, no de una
  // constante global. La adecuacion de tiempo extra aplica el factor 4/3.
  const tiempoExtra = useTiempoExtra();

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
        mensaje="No se cargaron los exámenes de esta materia."
        alReintentar={recargar}
      />
    );
  }

  if (lista.length === 0) {
    return (
      <Vacio mensaje={`Todavía no hay exámenes de ${nombreMateria}. Los estamos armando.`} />
    );
  }

  function tocar(slug: string) {
    ultimoRef.current = slug;
    empezar(slug);
  }

  return (
    <>
      {enCurso && (
        <section className="sim-retomar" aria-labelledby="exn-retomar-titulo">
          <h2 id="exn-retomar-titulo">
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

      <section className="sim-reglas" aria-label="Cómo funciona el examen">
        <p><strong>Todas de corrido, con reloj.</strong> Como el día de la prueba.</p>
        <p><strong>Podés devolverte.</strong> Cambiás lo que querás hasta entregar.</p>
        <p><strong>No se pierde.</strong> Si se cierra la pestaña, seguís donde ibas.</p>
      </section>

      <ul className="sim-lista" role="list">
        {lista.map((s) => {
          const marca = marcas[s.slug];
          const cargando = abriendo === s.slug;
          // Cada examen trae su propio tiempo por pregunta desde la base.
          const segPorItem = tiempoExtra
            ? Math.round(s.segundos_por_item * 4 / 3)
            : s.segundos_por_item;
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

                {/* Temas del examen, si trae */}
                {s.temas && s.temas.length > 0 && (
                  <p className="sim-temas">
                    {s.temas.join(" · ")}
                  </p>
                )}

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
                  <span className="ps-solo-lectores"> el {s.titulo} de {nombreMateria}</span>
                </button>

                {errorAbrir && ultimoRef.current === s.slug && (
                  <p className="sim-error" role="alert">{errorAbrir}</p>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      <p className="sim-remate">
        <strong>Al entregar ves tu nota</strong> y, pregunta por pregunta, cuál
        fallaste y por qué. Podés guardarlo en PDF para repasarlo después o
        enseñárselo a la maestra.
      </p>
    </>
  );
}
