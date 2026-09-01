import { useEffect, useRef } from "react";
import { BookOpen, Calculator, Globe, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { MATERIAS, type SlugMateria } from "../config";
import { ponerConcentracion } from "../lib/concentracion";
import ListaPanel from "../components/simulacro/ListaPanel";
import PestanasMateria from "../components/PestanasMateria";
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

/** Los simulacros de una materia, y el que este en curso. */
export default function SimulacrosPage({ materia }: { materia: SlugMateria }) {
  const simulacros = useSimulacros(materia);

  // Mientras contesta, el menu de arriba y el pie desaparecen: en la
  // pantalla queda el item y nada mas (ver lib/concentracion.ts). Se apaga
  // tambien al desmontar, por si se va por el boton de atras del navegador.
  useEffect(() => {
    ponerConcentracion(simulacros.fase === "examen");
    return () => ponerConcentracion(false);
  }, [simulacros.fase]);
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
          Volvé al <Link to="/">inicio</Link> y escogé una de las cuatro materias.
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
      <h1 tabIndex={-1} ref={tituloRef}>
        <span className="res-icono" aria-hidden="true">
          <Icono size={30} strokeWidth={1.9} />
        </span>
        Simulacros de {datos.nombre}
      </h1>

      {/* Sin parrafo de instrucciones. Lo que decia -- de que va la
          materia, cuantas preguntas, cuanto dura, que las opciones se
          barajan -- o lo explica la maestra, o ya esta escrito en la
          tarjeta de cada cuadernillo. Repetirlo era relleno, y de 8 a 12
          anos los bloques de instrucciones se los saltan (Nielsen Norman
          Group, Children's UX). */}
      <PestanasMateria slug={datos.slug} actual="simulacro" />
      <ListaPanel nombreMateria={datos.nombre} simulacros={simulacros} />
    </section>
  );
}
