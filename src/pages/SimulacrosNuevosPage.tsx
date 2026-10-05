import { useEffect, useRef, useState } from "react";
import {
  Award, BookOpen, Calculator, ClipboardList, Clock, Droplet, Globe, Hourglass,
  Microscope, PlayCircle, RotateCcw, Sparkles,
} from "lucide-react";
import {
  MATERIAS, SIMULACRO_NUEVO_PREGUNTAS, SIMULACRO_NUEVO_SEGUNDOS_ITEM,
  segundosConAdecuacion, type SlugMateria,
} from "../config";
import { listarSimulacrosNuevos, registrarResultadosNuevos, traerSimulacroNuevo } from "../lib/api";
import { useTiempoExtra } from "../lib/apariencia";
import { ponerConcentracion } from "../lib/concentracion";
import type { SimulacroResumen } from "../lib/tipos";
import { Cargando, ErrorCarga } from "../components/Estados";
import Fondo from "../components/Fondo";
import ResultadosSimulacro from "../components/simulacro/ResultadosSimulacro";
import SimulacroPanel from "../components/simulacro/SimulacroPanel";
import {
  useSimulacros, type FuenteSimulacros, type Simulacros,
} from "../components/simulacro/useSimulacro";
// El examen y los resultados son los mismos de los simulacros de siempre:
// se importan sus hojas en vez de copiar reglas (ver SimulacrosPage.tsx).
import "./PracticaPage.css";
import "./SimulacrosPage.css";
import "./SimulacrosNuevosPage.css";

// La puerta de los simulacros nuevos: sus propias tablas y funciones en la
// base, el mismo motor en la pantalla. Constante de modulo a proposito (ver
// FuenteSimulacros en useSimulacro.ts).
const FUENTE_NUEVOS: FuenteSimulacros = {
  listar: listarSimulacrosNuevos,
  traer: traerSimulacroNuevo,
  registrar: registrarResultadosNuevos,
};

const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

// "2 horas", "2 horas y 40 minutos", "45 minutos". Sale de la cuenta, nunca
// escrito a mano: si la base cambia el tiempo, la tarjeta cambia sola.
function duracion(segundos: number): string {
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} minutos`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  const parteH = h === 1 ? "1 hora" : `${h} horas`;
  return resto === 0 ? parteH : `${parteH} y ${resto} minutos`;
}

function minutos(segundos: number): string {
  const m = Math.round(segundos / 60);
  return m === 1 ? "1 minuto" : `${m} minutos`;
}

// "Números, Medidas y Geometría". La lista de temas viene de la base.
function enumerar(cosas: string[]): string {
  if (cosas.length <= 1) return cosas.join("");
  return `${cosas.slice(0, -1).join(", ")} y ${cosas[cosas.length - 1]}`;
}

/** /simulacros-nuevos: un examen nuevo por materia, con su reloj. */
export default function SimulacrosNuevosPage() {
  const simulacros = useSimulacros(null, FUENTE_NUEVOS);

  // Mientras contesta, el menu y el pie se van (ver lib/concentracion.ts).
  useEffect(() => {
    ponerConcentracion(simulacros.fase === "examen");
    return () => ponerConcentracion(false);
  }, [simulacros.fase]);

  // Al cambiar de pantalla: arriba y foco al titulo, igual que en
  // SimulacrosPage. La fase "examen" la maneja el panel.
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const fasePrevia = useRef(simulacros.fase);
  useEffect(() => {
    if (fasePrevia.current === simulacros.fase) return;
    fasePrevia.current = simulacros.fase;
    if (simulacros.fase === "examen") return;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [simulacros.fase]);

  // El color de la materia del examen abierto, para el examen y la nota.
  const enCursoMateria = MATERIAS.find((m) => m.slug === simulacros.actual?.materia_slug);
  const acento = enCursoMateria
    ? {
        ["--acento" as string]: enCursoMateria.color,
        ["--suave" as string]: enCursoMateria.suave,
        ["--arte" as string]: enCursoMateria.arte,
      }
    : undefined;

  if (simulacros.fase === "examen") {
    return (
      <section id="sim-examen" style={acento} aria-label="Simulacro nuevo">
        <SimulacroPanel simulacros={simulacros} />
      </section>
    );
  }

  if (simulacros.fase === "resultados" && enCursoMateria) {
    const Icono = ICONOS[enCursoMateria.slug];
    return (
      <section id="sim-resultados" className="ps-contenedor ps-seccion" style={acento}>
        <Fondo tipo={enCursoMateria.slug} />
        <h1 tabIndex={-1} ref={tituloRef}>
          <span className="res-icono" aria-hidden="true">
            <Icono size={30} strokeWidth={1.9} />
          </span>
          {simulacros.actual?.titulo ?? "Simulacro nuevo"} de {enCursoMateria.nombre}
        </h1>
        <p role="status" className="ps-solo-lectores">
          Entregaste. Tu nota es {simulacros.calificacion.nota} de 100:{" "}
          {simulacros.calificacion.aciertos} buenas de {simulacros.calificacion.total}.
        </p>
        <ResultadosSimulacro simulacros={simulacros} />
      </section>
    );
  }

  return (
    <section id="simn-lista" className="ps-contenedor ps-seccion">
      <Fondo tipo="confeti" />
      <h1 tabIndex={-1} ref={tituloRef}>
        <span className="simn-icono" aria-hidden="true">
          <Sparkles size={30} strokeWidth={1.9} />
        </span>
        Simulacros nuevos
      </h1>
      <p className="simn-bajada">
        Exámenes completos con preguntas que no salen en la práctica. Son para
        medirte como el día de la prueba: todas de corrido, con reloj, y al
        final ves tu nota y la explicación de cada pregunta.
      </p>
      <Tarjetas simulacros={simulacros} />
    </section>
  );
}

function Tarjetas({ simulacros }: { simulacros: Simulacros }) {
  const {
    estadoLista, recargar, lista, marcas, abriendo, errorAbrir, empezar,
    enCurso, enCursoVencido, enCursoRespondidas, retomar, descartarEnCurso,
  } = simulacros;
  // Con la adecuacion de tiempo puesta (panel de accesibilidad) el examen
  // da cuatro minutos por pregunta, y la tarjeta tiene que decirlo.
  const tiempoExtra = useTiempoExtra();
  const segPorItem = (s: SimulacroResumen) =>
    segundosConAdecuacion(s.segundos_por_item ?? SIMULACRO_NUEVO_SEGUNDOS_ITEM, tiempoExtra);
  const segProximo = segundosConAdecuacion(SIMULACRO_NUEVO_SEGUNDOS_ITEM, tiempoExtra);

  // Si falla la apertura, el foco vuelve al boton que se toco. El ultimo
  // tocado va en estado y no en una ref porque tambien decide, al pintar,
  // en cual tarjeta sale el error.
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ultimo, setUltimo] = useState<string | null>(null);
  useEffect(() => {
    if (!errorAbrir || !ultimo) return;
    botones.current[ultimo]?.focus();
  }, [errorAbrir, ultimo]);

  if (estadoLista === "cargando") return <Cargando texto="Buscando los simulacros…" />;
  if (estadoLista === "error") {
    return <ErrorCarga mensaje="No se cargaron los simulacros nuevos." alReintentar={recargar} />;
  }

  // Las materias con examen primero; dentro de cada grupo, el orden del sitio.
  const materiasEnOrden = MATERIAS
    .map((m) => ({ m, examenes: lista.filter((s) => s.materia_slug === m.slug) }))
    .sort((a, b) => Number(b.examenes.length > 0) - Number(a.examenes.length > 0));

  function tocar(slug: string) {
    setUltimo(slug);
    empezar(slug);
  }

  return (
    <>
      {enCurso && (
        <section className="sim-retomar simn-columna" aria-labelledby="simn-retomar-titulo">
          <h2 id="simn-retomar-titulo">
            <PlayCircle size={22} strokeWidth={2.2} aria-hidden="true" />
            {enCursoVencido
              ? `Se te acabó el tiempo en el simulacro de ${enCurso.materia_nombre}`
              : `Dejaste el simulacro de ${enCurso.materia_nombre} a medias`}
          </h2>
          <p>
            {enCursoVencido ? (
              <>
                Alcanzaste a contestar <strong>{enCursoRespondidas}</strong> de{" "}
                {enCurso.cantidad}. Ese trabajo no se perdió: mirá cómo te fue.
              </>
            ) : (
              <>
                Llevás <strong>{enCursoRespondidas}</strong> de {enCurso.cantidad} y
                se guardó en este aparato. Seguí donde ibas, con el tiempo que te quedaba.
              </>
            )}
          </p>
          <div className="sim-retomar-botones">
            <button
              type="button"
              className="ps-boton"
              onClick={() => { setUltimo(enCurso.slug); retomar(); }}
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

      {/* Una tarjeta por materia, siempre las cuatro. Una materia esta
          lista cuando la base trae un examen publicado para ella; si no,
          dice "Proximamente" y no lleva boton: una tarjeta que se ve
          tocable y no lleva a nada enseña a desconfiar de las demas.
          Las listas van primero y a todo lo ancho: en un celular, la unica
          que se puede hacer quedaba de cuarta, abajo de tres que no. */}
      <ul className="simn-tarjetas" role="list">
        {materiasEnOrden.map(({ m, examenes }) => {
          const Icono = ICONOS[m.slug];
          const estaLista = examenes.length > 0;
          return (
            <li key={m.slug} className={estaLista ? "simn-ancha" : undefined}>
              <article
                className="simn-tarjeta"
                data-estado={estaLista ? "lista" : "proximamente"}
                aria-labelledby={`simn-${m.slug}`}
                style={{ ["--acento" as string]: m.color, ["--suave" as string]: m.suave }}
              >
                <div className="simn-cabeza">
                  <span className="simn-materia-icono" aria-hidden="true">
                    <Icono size={26} strokeWidth={2} />
                  </span>
                  <h2 id={`simn-${m.slug}`} className="simn-materia">{m.nombre}</h2>
                  <span className="simn-estado">
                    {estaLista ? "Listo para hacer" : "Próximamente"}
                  </span>
                </div>

                {estaLista ? (
                  examenes.map((s) => {
                    const marca = marcas[s.slug];
                    const cargando = abriendo === s.slug;
                    const seg = segPorItem(s);
                    return (
                      <div className="simn-examen" key={s.slug}>
                        <div className="simn-info">
                          {examenes.length > 1 && <h3 className="simn-examen-titulo">{s.titulo}</h3>}
                          {s.temas && s.temas.length > 0 && (
                            <p className="simn-trae">
                              Trae preguntas de {enumerar(s.temas)}.
                            </p>
                          )}
                          <ul className="simn-datos" role="list">
                            <li>
                              <ClipboardList size={20} strokeWidth={2} aria-hidden="true" />
                              {s.cantidad} preguntas
                            </li>
                            <li>
                              <Clock size={20} strokeWidth={2} aria-hidden="true" />
                              {minutos(seg)} por pregunta
                            </li>
                            <li>
                              <Hourglass size={20} strokeWidth={2} aria-hidden="true" />
                              {duracion(s.cantidad * seg)} en total
                            </li>
                          </ul>
                          <Consejo materia={m.slug} />
                        </div>
                        <div className="simn-accion">
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
                            <span className="ps-solo-lectores"> el {s.titulo} de {m.nombre}</span>
                          </button>
                          {errorAbrir && ultimo === s.slug && (
                            <p className="sim-error" role="alert">{errorAbrir}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="simn-examen">
                    <p className="simn-trae">
                      Lo estamos preparando. Va a traer {SIMULACRO_NUEVO_PREGUNTAS} preguntas
                      nuevas de {m.nombre}, con {minutos(segProximo)} por
                      pregunta: {duracion(SIMULACRO_NUEVO_PREGUNTAS * segProximo)} en
                      total.
                    </p>
                    <Consejo materia={m.slug} />
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      <p className="simn-remate simn-columna">
        <strong>Para las familias:</strong> cada examen es largo a propósito, como la
        prueba de verdad. Si se cierra la pestaña no se pierde nada: al volver, sigue
        donde iba. Al entregar puede guardar la revisión en PDF para repasarla con la
        maestra.
      </p>
    </>
  );
}

// La recomendacion va en cada tarjeta y no una sola vez arriba: quien llega
// directo a su materia la lee justo antes de tocar "Empezar". Una materia
// puede traer su propio consejo; las demas usan el de siempre.
const CONSEJO_GENERAL = "Hacelo con calma, en un lugar tranquilo y con agua a mano.";
const CONSEJOS: Partial<Record<SlugMateria, string>> = {
  "estudios-sociales":
    "Hacelo en un lugar tranquilo y con agua a mano. Si tu familia lo permite, hacé una pausa corta a la mitad: el reloj sigue corriendo mientras tanto.",
  ciencias:
    "Es un simulacro de práctica más largo que la prueba oficial, para entrenar resistencia y ritmo. Hacelo en un lugar tranquilo, con agua a mano y, si tu familia lo permite, con una pausa corta a la mitad.",
  espanol:
    "Leé cada texto con calma y volvé a él cuantas veces haga falta: las pistas están en el texto. Hacelo en un lugar tranquilo y con agua a mano.",
};

function Consejo({ materia }: { materia: SlugMateria }) {
  return (
    <p className="simn-consejo">
      <Droplet size={20} strokeWidth={2} aria-hidden="true" />
      <span>{CONSEJOS[materia] ?? CONSEJO_GENERAL}</span>
    </p>
  );
}
