import { useEffect, useRef } from "react";
import { BookOpen, Calculator, ClipboardList, Globe, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { MATERIAS, type SlugMateria } from "../config";
import ListaPanel from "../components/simulacro/ListaPanel";
import ResultadosSimulacro from "../components/simulacro/ResultadosSimulacro";
import SimulacroPanel from "../components/simulacro/SimulacroPanel";
import { useSimulacros } from "../components/simulacro/useSimulacro";
// El simulacro reusa la barra del reloj y la tarjeta de nota de la
// practica. Se importa la misma hoja en vez de copiar las reglas: dos
// copias del mismo estilo terminan separandose sin que nadie se entere.
import "./PracticaPage.css";
import "./SimulacrosPage.css";

const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

/** Portada de simulacros: las cuatro materias. Es lo que abre el menu. */
export function IndiceSimulacros() {
  return (
    <section id="sim-indice" className="ps-contenedor ps-seccion">
      <h1>Simulacros</h1>
      <p className="sim-bajada">
        Cada simulacro es un cuadernillo de <strong>cuarenta preguntas</strong> que no
        cambia: son siempre las mismas y en el mismo orden, como una prueba de verdad.
        Lo único que se baraja en cada intento son las cuatro opciones. Podés repetirlo
        las veces que querás y guardar cada intento en PDF.
      </p>
      <ul className="sim-materias" role="list">
        {MATERIAS.map((m) => {
          const Icono = ICONOS[m.slug];
          return (
            <li key={m.slug}>
              {/* Toda la tarjeta es el enlace: en celular, un area grande
                  se acierta con el dedo mucho mejor que un texto suelto. */}
              <Link
                className="sim-materia"
                data-tarjeta
                to={`/simulacros/${m.slug}`}
                style={{ ["--acento" as string]: m.color, ["--suave" as string]: m.suave }}
              >
                <span className="sim-materia-icono" aria-hidden="true">
                  <Icono size={30} strokeWidth={1.9} />
                </span>
                <span className="sim-materia-nombre">{m.nombre}</span>
                <span className="sim-materia-dato">
                  <ClipboardList size={18} strokeWidth={2} aria-hidden="true" />
                  3 simulacros de 40
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="sim-pista">
        ¿Preferís practicar poquito y por tema? Eso está en{" "}
        <Link to="/">el inicio</Link>, en la materia que querás.
      </p>
    </section>
  );
}

/** Los tres cuadernillos de una materia, y el simulacro en curso. */
export default function SimulacrosPage({ materia }: { materia: SlugMateria }) {
  const simulacros = useSimulacros(materia);
  const datos = MATERIAS.find((m) => m.slug === materia);

  // Al entregar o al salir, la pantalla cambia entera pero el navegador se
  // queda donde estaba. Medido: entregando desde el fondo del examen, el
  // chiquito caia a media revision y nunca veia su nota, que esta hasta
  // arriba. Y quien anda con teclado perdia el foco, porque el boton que
  // toco dejo de existir. Por eso: arriba y foco al titulo.
  //
  // La fase "examen" se salta a proposito: de eso ya se encarga el panel,
  // que lleva el foco a la pregunta.
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

  if (!datos) {
    return (
      <section className="ps-contenedor ps-seccion">
        <h1>Esa materia no existe</h1>
        <p>
          Volvé a <Link to="/simulacros">los simulacros</Link> y escogé una de las cuatro.
        </p>
      </section>
    );
  }

  const Icono = ICONOS[datos.slug];
  const acento = {
    ["--acento" as string]: datos.color,
    ["--suave" as string]: datos.suave,
    ["--arte" as string]: datos.arte,
  };

  if (simulacros.fase === "examen") {
    return (
      <section
        id="sim-examen"
        style={acento}
        aria-label={`Simulacro de ${datos.nombre}`}
      >
        <SimulacroPanel simulacros={simulacros} />
      </section>
    );
  }

  if (simulacros.fase === "resultados") {
    return (
      <section id="sim-resultados" className="ps-contenedor ps-seccion" style={acento}>
        <h1 tabIndex={-1} ref={tituloRef}>
          <span className="res-icono" aria-hidden="true">
            <Icono size={30} strokeWidth={1.9} />
          </span>
          {simulacros.actual?.titulo ?? "Simulacro"} de {datos.nombre}
        </h1>
        {/* Lo que oye quien usa lector de pantalla al entregar. Sin esto
            entregaba y quedaba en silencio, sin saber ni la nota. */}
        <p role="status" className="ps-solo-lectores">
          Entregaste. Tu nota es {simulacros.calificacion.nota} de 100:{" "}
          {simulacros.calificacion.aciertos} buenas de {simulacros.calificacion.total}.
        </p>
        <ResultadosSimulacro simulacros={simulacros} />
      </section>
    );
  }

  return (
    <section id="sim-lista" className="ps-contenedor ps-seccion" style={acento}>
      <p className="sim-migas">
        <Link to="/simulacros">Simulacros</Link>
        <span aria-hidden="true"> › </span>
        <span>{datos.nombre}</span>
      </p>
      <h1 tabIndex={-1} ref={tituloRef}>
        <span className="res-icono" aria-hidden="true">
          <Icono size={30} strokeWidth={1.9} />
        </span>
        Simulacros de {datos.nombre}
      </h1>
      <p className="sim-bajada">
        Tres cuadernillos de cuarenta preguntas cada uno, con preguntas fijas de
        todos los temas. Al final te sale la nota y podés guardarla en PDF.
      </p>
      <ListaPanel nombreMateria={datos.nombre} simulacros={simulacros} />
    </section>
  );
}
