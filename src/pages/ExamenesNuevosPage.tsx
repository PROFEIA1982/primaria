import { useEffect, useRef } from "react";
import { BookOpen, Calculator, Globe, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { MATERIAS, type SlugMateria } from "../config";
import { ponerConcentracion } from "../lib/concentracion";
import ListaPanelNuevos from "../components/simulacro/ListaPanelNuevos";
import PestanasMateria from "../components/PestanasMateria";
import ResultadosSimulacro from "../components/simulacro/ResultadosSimulacro";
import SimulacroPanel from "../components/simulacro/SimulacroPanel";
import { useExamenesNuevos } from "../components/simulacro/useSimulacrosNuevos";
import type { Simulacros } from "../components/simulacro/useSimulacro";
import "./PracticaPage.css";
import Fondo from "../components/Fondo";
import "./SimulacrosPage.css";

const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

/** Los examenes nuevos de una materia, con reloj y todo. */
export default function ExamenesNuevosPage({ materia }: { materia: SlugMateria }) {
  const examenes = useExamenesNuevos(materia);

  // Modo concentracion: el menu y el pie se van mientras contesta.
  useEffect(() => {
    ponerConcentracion(examenes.fase === "examen");
    return () => ponerConcentracion(false);
  }, [examenes.fase]);
  const datos = MATERIAS.find((m) => m.slug === materia);

  // Al cambiar de fase (entregar, volver a la lista) la pantalla sube y
  // el titulo recibe el foco, para que quien usa lector de pantalla sepa
  // donde esta.
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const fasePrevia = useRef(examenes.fase);
  useEffect(() => {
    if (fasePrevia.current === examenes.fase) return;
    fasePrevia.current = examenes.fase;
    if (examenes.fase === "examen") return;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [examenes.fase]);

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

  // SimulacroPanel y ResultadosSimulacro esperan el tipo Simulacros, que es
  // casi identico a ExamenesNuevos: mismos campos, mismas formas. La unica
  // diferencia es que materia_nombre puede ser null en el nuevo. En la
  // practica siempre viene con valor, asi que la asercion es segura.
  const comoSimulacros = examenes as unknown as Simulacros;

  if (examenes.fase === "examen") {
    return (
      <section
        id="sim-examen"
        style={acento}
        aria-label={`Examen nuevo de ${datos.nombre}`}
      >
        <SimulacroPanel simulacros={comoSimulacros} />
      </section>
    );
  }

  if (examenes.fase === "resultados") {
    return (
      <section id="sim-resultados" className="ps-contenedor ps-seccion" style={acento}>
        <Fondo tipo={datos.slug} />
        <h1 tabIndex={-1} ref={tituloRef}>
          <span className="res-icono" aria-hidden="true">
            <Icono size={30} strokeWidth={1.9} />
          </span>
          {examenes.actual?.titulo ?? "Examen"} de {datos.nombre}
        </h1>
        <p role="status" className="ps-solo-lectores">
          Entregaste. Tu nota es {examenes.calificacion.nota} de 100:{" "}
          {examenes.calificacion.aciertos} buenas de {examenes.calificacion.total}.
        </p>
        <ResultadosSimulacro simulacros={comoSimulacros} />
      </section>
    );
  }

  return (
    <section id="sim-lista" className="ps-contenedor ps-seccion" style={acento}>
      <Fondo tipo={datos.slug} />
      <h1 tabIndex={-1} ref={tituloRef}>
        <span className="res-icono" aria-hidden="true">
          <Icono size={30} strokeWidth={1.9} />
        </span>
        Simulacros nuevos de {datos.nombre}
      </h1>

      <PestanasMateria slug={datos.slug} actual="examen" />
      <ListaPanelNuevos nombreMateria={datos.nombre} examenes={examenes} />
    </section>
  );
}
