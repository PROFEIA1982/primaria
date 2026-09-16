import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MATERIAS, type SlugMateria } from "../config";
import { traerConteos, type ConteoMateria } from "../lib/api";
import { Cargando, ErrorCarga } from "../components/Estados";
import { Mascota } from "../components/Amigos";
import { Companero, Comunidad } from "../components/Rincon";
import Fondo from "../components/Fondo";
import "./InicioPage.css";

// El inicio es para el chiquito: hero, las cuatro materias, su compañero y
// los simulacros. Lo de maestras y familias (para qué sirve, idoneidad,
// práctica sin internet) vive en /maestras, enlazado desde el pie.
//
// Sin adornos irrelevantes en las pantallas de trabajo (Sundararajan y
// Adesope 2020): el color y los animales están aquí, en el menú, y no
// dentro del ítem.

// Figuras propias por materia: un dibujo de verdad, no un icono de línea
// de 24 px. Se pintan en SVG para que respeten grises y escalen.
function FiguraMateria({ slug }: { slug: SlugMateria }) {
  switch (slug) {
    case "espanol":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M8 14 q24 -8 24 4 v34 q0 -10 -24 -4 z" fill="#E8593C" />
          <path d="M56 14 q-24 -8 -24 4 v34 q0 -10 24 -4 z" fill="#FF9A82" />
          <path d="M14 22 h12 M14 30 h12 M38 22 h12 M38 30 h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "estudios-sociales":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#6D4AE8" />
          <path d="M12 24 q10 6 20 0 q10 -6 20 0 M12 40 q10 -6 20 0 q10 6 20 0" stroke="#C9B8FF" strokeWidth="3" fill="none" />
          <path d="M32 8 q-12 24 0 48 M32 8 q12 24 0 48" stroke="#C9B8FF" strokeWidth="3" fill="none" />
        </svg>
      );
    case "ciencias":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M26 8 h12 v18 l14 22 a4 4 0 0 1 -3.5 6 h-33 a4 4 0 0 1 -3.5 -6 l14 -22 z" fill="#DDF6EC" stroke="#17A673" strokeWidth="3" />
          <path d="M18 44 h28 l-9 -14 h-10 z" fill="#17A673" />
          <circle cx="30" cy="40" r="2.5" fill="#fff" /><circle cx="38" cy="46" r="2" fill="#fff" />
        </svg>
      );
    case "matematicas":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#2F6BFF" />
          <path d="M22 24 h8 M26 20 v8 M36 24 h8 M22 42 h8 M36 38 l8 8 M44 38 l-8 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

const VIVA: Record<SlugMateria, string> = {
  espanol: "var(--viva-espanol)",
  "estudios-sociales": "var(--viva-sociales)",
  ciencias: "var(--viva-ciencias)",
  matematicas: "var(--viva-mate)",
};

function HeroArte() {
  return (
    <svg viewBox="0 0 360 300" className="hero-arte" aria-hidden="true" focusable="false">
      <ellipse cx="180" cy="262" rx="150" ry="18" fill="var(--selva)" opacity=".18" />
      <path d="M20 100 Q100 40 180 80 Q260 120 340 70" stroke="#8C6A45" strokeWidth="16" fill="none" strokeLinecap="round" />
      <use href="#m-perezoso" x="100" y="40" width="190" height="190" />
      <use href="#m-tucan" x="255" y="150" width="105" height="105" />
      <use href="#m-rana" x="10" y="160" width="100" height="100" />
      <use href="#s-estrella" x="300" y="30" width="34" height="34" />
      <use href="#s-estrella" x="50" y="60" width="24" height="24" />
      <use href="#s-estrella" x="215" y="120" width="18" height="18" />
    </svg>
  );
}

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

  return (
    <div className="ps-contenedor inicio">
      <Fondo tipo="confeti" />
      {/* 1 · Hero: claro, con los animales y un solo botón. */}
      <section id="inicio-hero" className="hero">
        <div>
          <p className="hero-kicker">
            <span className="hero-punto" aria-hidden="true" />
            Un desafío de <b>ProfeSeguro.com</b> y <b>EVI</b> para los niños y niñas de Costa Rica
          </p>
          <h1 className="hero-titulo">
            Practicá para tu <span>prueba de sexto</span>
          </h1>
          <p className="hero-bajada">
            Preguntas de las cuatro materias, gratis y sin cuenta. Cada acierto te da una
            estrella, y con las estrellas vas ganando amigos del bosque.
          </p>
          <a className="ps-boton hero-boton" href="#inicio-materias">
            Elegí tu materia
            <ArrowRight size={22} strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
        <HeroArte />
      </section>

      {/* 2 · Materias: bloques de color, la tarjeta entera es el enlace. */}
      <section id="inicio-materias" className="inicio-seccion" aria-labelledby="t-materias">
        <h2 id="t-materias">¿Qué practicamos hoy?</h2>
        {conteos === null && !fallo && <Cargando texto="Buscando las preguntas…" />}
        {fallo && <ErrorCarga mensaje="No se cargaron las materias." alReintentar={() => void cargar()} />}
        {conteos !== null && (
          <ul className="materias">
            {MATERIAS.map((m) => {
              const dato = conteos.find((c) => c.slug === m.slug);
              const cuantas = dato?.items ?? 0;
              return (
                <li key={m.slug}>
                  <Link
                    to={`/${m.slug}`}
                    className="materia"
                    data-tarjeta=""
                    style={{ ["--c" as string]: VIVA[m.slug] }}
                  >
                    <span className="materia-ir" aria-hidden="true">
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </span>
                    <span className="materia-figura"><FiguraMateria slug={m.slug} /></span>
                    <span className="materia-nombre">{m.nombre}</span>
                    <span className="materia-n">
                      {cuantas > 0 ? `${cuantas} preguntas` : "Pronto"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 3 · Su compañero y lo de toda la comunidad. */}
      <section className="inicio-seccion" aria-labelledby="t-companero">
        <h2 id="t-companero">Tu compañero de estudio</h2>
        <Companero />
        <Comunidad />
      </section>

      {/* 4 · Simulacros. */}
      <section id="inicio-simulacros" className="inicio-seccion" aria-labelledby="t-simulacros">
        <h2 id="t-simulacros">¿Ya te sentís listo?</h2>
        <p className="inicio-lede">
          El simulacro son las 60 preguntas de corrido y con reloj, como el día de la prueba.
        </p>
        <ul className="simus">
          {MATERIAS.map((m) => (
            <li key={m.slug}>
              <Link to={`/simulacros/${m.slug}`} className="simu" data-tarjeta="" style={{ ["--c" as string]: VIVA[m.slug] }}>
                <i aria-hidden="true" />
                Simulacro de {m.corto}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 · Créditos: quién hace esto y para quién. */}
      <section className="creditos" aria-label="Quién hace esta práctica">
        <div>
          <h2>Este desafío lo crearon ProfeSeguro.com y EVI</h2>
          <p>
            Para que todos los niños y niñas de Costa Rica lleguen a la prueba de sexto con
            calma, gratis y sin cuentas. Cada estrella que ganás es tuya; el banco de preguntas
            lo revisan docentes de verdad.
          </p>
          <p className="creditos-enlace">
            <Link to="/maestras">Para maestras y familias →</Link>
          </p>
        </div>
        <div className="creditos-logos" aria-hidden="true">
          <span>ProfeSeguro.com</span>
          <span>EVI</span>
          <Mascota id="quetzal" size={64} />
        </div>
      </section>
    </div>
  );
}
