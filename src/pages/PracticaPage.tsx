import { BookOpen, Calculator, Globe, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { MATERIAS, type SlugMateria } from "../config";
import { ErrorCarga, Vacio } from "../components/Estados";
import EsqueletoPregunta from "../components/practica/EsqueletoPregunta";
import ExamenPanel from "../components/practica/ExamenPanel";
import ResultadosPanel from "../components/practica/ResultadosPanel";
import SeleccionPanel from "../components/practica/SeleccionPanel";
import { usePractica } from "../components/practica/usePractica";
import "./PracticaPage.css";

// Un icono por materia, elegido por slug para no depender del orden
// del arreglo de config.
const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

// Un solo componente para las cuatro materias. La materia entra por prop
// desde las rutas: asi no hay cuatro archivos casi iguales que despues
// se desincronizan cuando se cambia una sola cosa.
export default function PracticaPage({ materia }: { materia: SlugMateria }) {
  const practica = usePractica(materia);
  const datos = MATERIAS.find((m) => m.slug === materia);

  if (!datos) {
    return (
      <section id="practica-seleccion" className="ps-contenedor ps-seccion">
        <h1>Esa materia no existe</h1>
        <p>
          Volvé al <Link to="/">inicio</Link> y escogé una de las cuatro.
        </p>
      </section>
    );
  }

  const Icono = ICONOS[datos.slug];
  const acento = { ["--acento" as string]: datos.color, ["--suave" as string]: datos.suave };

  // --- Pantalla 2: el examen ---
  if (practica.fase === "examen") {
    return (
      <section id="practica-examen" style={acento} aria-label={`Práctica de ${datos.nombre}`}>
        <ExamenPanel nombreMateria={datos.nombre} practica={practica} />
      </section>
    );
  }

  // --- Pantalla 3: los resultados ---
  if (practica.fase === "resultados") {
    return (
      <section id="practica-resultados" className="ps-contenedor ps-seccion" style={acento}>
        <h1>
          <span className="res-icono" aria-hidden="true">
            <Icono size={30} strokeWidth={1.9} />
          </span>
          Resultados de {datos.nombre}
        </h1>
        <ResultadosPanel nombreMateria={datos.nombre} practica={practica} />
      </section>
    );
  }

  // --- Pantalla 1: la seleccion ---
  return (
    <>
      <section
        id="practica-hero"
        style={acento}
        aria-labelledby="practica-hero-titulo"
      >
        <div className="ps-contenedor hero-caja">
          <div className="hero-texto">
            <span className="hero-chip">
              <Icono size={22} strokeWidth={2} aria-hidden="true" />
              Sexto grado
            </span>
            <h1 id="practica-hero-titulo">{datos.nombre}</h1>
            <p className="hero-gancho">{datos.gancho}</p>
          </div>
          <img
            className="hero-arte"
            src={datos.hero}
            alt=""
            width={860}
            height={560}
            fetchPriority="high"
            decoding="async"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
      </section>

      <section id="practica-seleccion" className="ps-contenedor ps-seccion" style={acento}>

      {practica.estadoInicial === "cargando" && <EsqueletoPregunta />}

      {practica.estadoInicial === "error" && (
        <ErrorCarga
          mensaje="No se cargó la información de esta materia."
          alReintentar={practica.recargar}
        />
      )}

      {practica.estadoInicial === "listo" && practica.itemsEnLaMateria === 0 && (
        <Vacio
          mensaje="Todavía no hay preguntas de esta materia. Las estamos subiendo poco a poco."
          accion={
            <Link className="ps-boton" to="/">
              Probá con otra materia
            </Link>
          }
        />
      )}

      {practica.estadoInicial === "listo" && practica.itemsEnLaMateria > 0 && (
        <>
          <p className="sel-bajada">
            Escogé el tema y cuántas preguntas querés. Después dale a
            «¡Empezar!» y a trabajar.
          </p>
          <SeleccionPanel nombreMateria={datos.nombre} practica={practica} />
          {/* Mientras el servidor arma las preguntas se muestra la forma que
              van a tener, no una rueda girando. */}
          {practica.preparando && <EsqueletoPregunta />}
        </>
      )}
    </section>
    </>
  );
}
