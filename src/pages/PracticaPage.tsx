import { useEffect, useRef } from "react";
import { BookOpen, Calculator, Globe, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { MATERIAS, type SlugMateria } from "../config";
import { ponerConcentracion } from "../lib/concentracion";
import { ErrorCarga, Vacio } from "../components/Estados";
import EsqueletoPregunta from "../components/practica/EsqueletoPregunta";
import ExamenPanel from "../components/practica/ExamenPanel";
import ResultadosPanel from "../components/practica/ResultadosPanel";
import SeleccionPanel from "../components/practica/SeleccionPanel";
import PestanasMateria from "../components/PestanasMateria";
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
  // Al terminar, el navegador se queda donde estaba: el chiquito toca "Ver
  // resultados" desde el fondo y cae a media lista de las falladas, sin ver
  // nunca su nota, que esta hasta arriba. Con teclado ademas se pierde el
  // foco y con lector de pantalla no se oye nada. El simulacro ya lo
  // resolvia asi; esto es lo mismo para la practica.
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const fasePrevia = useRef(practica.fase);
  useEffect(() => {
    if (fasePrevia.current === practica.fase) return;
    fasePrevia.current = practica.fase;
    if (practica.fase !== "resultados") return;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [practica.fase]);

  // Mientras contesta, el menu de arriba y el pie desaparecen: en la
  // pantalla queda el item y nada mas (ver lib/concentracion.ts). Se apaga
  // tambien al desmontar, por si se va por el boton de atras del navegador.
  useEffect(() => {
    ponerConcentracion(practica.fase === "examen");
    return () => ponerConcentracion(false);
  }, [practica.fase]);
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
  const acento = {
    ["--acento" as string]: datos.color,
    ["--suave" as string]: datos.suave,
    // La placa de la ilustracion; ver el comentario de "arte" en config.ts.
    ["--arte" as string]: datos.arte,
  };

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
        <h1 tabIndex={-1} ref={tituloRef}>
          <span className="res-icono" aria-hidden="true">
            <Icono size={30} strokeWidth={1.9} />
          </span>
          Resultados de {datos.nombre}
        </h1>
        {/* Lo que oye quien usa lector de pantalla al terminar. */}
        <p role="status" className="ps-solo-lectores">
          Terminaste. Tu nota es {practica.calificacion.nota} de 100:{" "}
          {practica.calificacion.aciertos} buenas de {practica.calificacion.total}.
        </p>
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

      <div className="ps-contenedor" style={acento}>
        <PestanasMateria slug={datos.slug} actual="practicar" />
      </div>

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
          {/* Las instrucciones ya no van en parrafo: viven en las tres
              tarjetas que abre el panel. */}
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
