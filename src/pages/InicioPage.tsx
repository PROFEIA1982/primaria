import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  CircleCheckBig,
  Globe,
  GraduationCap,
  ListOrdered,
  Microscope,
  MousePointerClick,
  Timer,
  WifiOff,
} from "lucide-react";
import { MATERIAS, URL_OFFLINE, type SlugMateria } from "../config";
import { traerConteos, type ConteoMateria } from "../lib/api";
import { Cargando, ErrorCarga } from "../components/Estados";
import "./InicioPage.css";

// Un icono por materia. Se elige por slug para no depender del orden.
const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

const PASOS = [
  { icono: MousePointerClick, titulo: "Elegí la materia", texto: "Español, Estudios Sociales, Ciencias o Matemáticas. La que querás." },
  { icono: ListOrdered, titulo: "Escogé cuántas preguntas", texto: "Diez para un ratito, sesenta si querés entrenar en serio." },
  { icono: Timer, titulo: "Respondé a tu ritmo", texto: "Hay reloj, pero es para acostumbrarte. Nadie te está calificando." },
  { icono: CircleCheckBig, titulo: "Mirá tus resultados", texto: "Al final ves tu nota y cuáles fallaste, con la respuesta correcta." },
];

export default function InicioPage() {
  const [conteos, setConteos] = useState<ConteoMateria[] | null>(null);
  const [fallo, setFallo] = useState(false);

  async function cargar() {
    setFallo(false);
    setConteos(null);
    try {
      setConteos(await traerConteos());
    } catch {
      setFallo(true);
    }
  }

  useEffect(() => { void cargar(); }, []);

  function irAMaterias() {
    document.getElementById("inicio-materias")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* 1 · Hero */}
      <section id="inicio-hero">
        <div className="ps-contenedor">
          <span className="hero-icono" aria-hidden="true">
            <GraduationCap size={48} strokeWidth={1.8} />
          </span>
          <h1>Practicá para tu prueba de sexto</h1>
          <p className="hero-bajada">
            Preguntas de las cuatro materias para que llegués tranquilo el día de
            la prueba. Es gratis y no hay que hacer ninguna cuenta.
          </p>
          <button type="button" className="ps-boton hero-boton" onClick={irAMaterias}>
            Elegí tu materia →
          </button>
          <p className="hero-nota">Entrás y practicás. Así de simple.</p>
        </div>
      </section>

      {/* 2 · Como funciona */}
      <section id="inicio-pasos" className="ps-contenedor">
        <h2>Así de fácil</h2>
        <ol className="pasos-rejilla">
          {PASOS.map((p, i) => {
            const Icono = p.icono;
            return (
              <li className="paso" key={p.titulo}>
                <span className="paso-numero" aria-hidden="true">{i + 1}</span>
                <Icono size={34} strokeWidth={1.7} aria-hidden="true" />
                <span className="paso-titulo">{p.titulo}</span>
                <p>{p.texto}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 3 · Materias */}
      <section id="inicio-materias">
        <div className="ps-contenedor">
          <h2>Elegí tu materia</h2>

          {conteos === null && !fallo && <Cargando texto="Buscando las preguntas…" />}
          {fallo && (
            <ErrorCarga
              mensaje="No pudimos traer las materias."
              alReintentar={() => void cargar()}
            />
          )}

          {conteos !== null && (
            <ul className="materias-rejilla">
              {MATERIAS.map((m) => {
                const Icono = ICONOS[m.slug];
                const dato = conteos.find((c) => c.slug === m.slug);
                const cuantas = dato?.items ?? 0;
                return (
                  <li key={m.slug}>
                    <Link
                      to={`/${m.slug}`}
                      className="materia-tarjeta"
                      style={{
                        ["--acento" as string]: m.color,
                        ["--suave" as string]: m.suave,
                      }}
                    >
                      <span className="materia-icono" aria-hidden="true">
                        <Icono size={30} strokeWidth={1.8} />
                      </span>
                      <span className="materia-nombre">{m.nombre}</span>
                      <span className="materia-cuenta">
                        {cuantas > 0
                          ? `${cuantas} ${cuantas === 1 ? "pregunta" : "preguntas"} para practicar`
                          : "Preguntas en camino"}
                      </span>
                      <span className="materia-cta">Practicar →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 4 · Que son las pruebas */}
      <section id="inicio-info" className="ps-contenedor">
        <h2>¿Para qué te sirve esta práctica?</h2>
        <div className="info-texto">
          <p>
            En sexto grado, al terminar el año, se aplican pruebas estandarizadas
            en todo el país. Son de selección: te dan una pregunta y cuatro
            opciones, y vos escogés la que creés correcta. Nada más.
          </p>
          <p>
            Acá vas a encontrar preguntas del mismo tipo, para que cuando llegue el
            día ya sepás cómo se leen y cuánto tiempo te toma cada una. Eso es media
            batalla ganada. La otra media la ganás en clase, con tu maestra.
          </p>
          <p>
            Esto no es un examen de verdad y nadie ve tu nota. Es para que practiqués
            sin presión, las veces que querrás. No pedimos tu nombre, no guardamos
            nada y no cuesta un cinco.
          </p>
        </div>
      </section>

      {/* 5 · Recurso sin internet */}
      <section id="inicio-offline" className="ps-contenedor">
        <div className="offline-caja">
          <span aria-hidden="true"><WifiOff size={34} strokeWidth={1.7} /></span>
          <div className="offline-texto">
            <h2>¿En la escuela no hay internet?</h2>
            <p>
              Hay otra versión que se abre una vez y después funciona sin conexión.
              Sirve para practicar en el aula o en la casa.
            </p>
          </div>
          <a
            className="ps-boton offline-boton"
            href={URL_OFFLINE}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir a la versión sin internet →
          </a>
        </div>
      </section>
    </>
  );
}
