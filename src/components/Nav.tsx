import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ALargeSmall, ChevronDown, ExternalLink, Eye, GraduationCap, Menu, Moon, Sun, X } from "lucide-react";
import { IMG_LOGO_EVI, MATERIAS, URL_IDONEA } from "../config";
import { useApariencia } from "../lib/apariencia";
import "./Nav.css";

type ItemMenu = { slug: string; nombre: string; color: string; to: string };

// Un desplegable del menu: un boton que muestra u oculta una lista. Es el
// patron sencillo, no un menu de escritorio con flechas, porque es el que
// mejor se porta en celular y con lector de pantalla. Se usa dos veces:
// "Practicar" (por tema) y "Simulacros" (examen completo).
function MenuDesplegable({
  etiqueta,
  id,
  activo,
  items,
}: {
  etiqueta: string;
  id: string;
  activo: boolean;
  items: ItemMenu[];
}) {
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef<HTMLLIElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra. Sin esto, en escritorio la lista se
  // quedaba abierta encima del contenido despues de navegar.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const alTocarAfuera = (e: MouseEvent) => {
      if (!cajaRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      // El foco vuelve al boton que la abrio: si se queda suelto, quien
      // navega con teclado tiene que empezar desde arriba otra vez.
      botonRef.current?.focus();
    };
    document.addEventListener("mousedown", alTocarAfuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alTocarAfuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <li className="nav-desplegable" ref={cajaRef}>
      <button
        type="button"
        className="nav-sim-boton"
        ref={botonRef}
        aria-expanded={abierto}
        aria-controls={id}
        data-activo={activo ? "si" : undefined}
        onClick={() => setAbierto((v) => !v)}
      >
        {etiqueta}
        <ChevronDown
          size={18}
          strokeWidth={2.4}
          aria-hidden="true"
          className="nav-sim-flecha"
          data-abierto={abierto ? "si" : "no"}
        />
      </button>
      {/* Con hidden y no con display:none en CSS: asi el enlace cerrado
          tampoco recibe el tabulador ni lo lee el lector. */}
      <ul id={id} className="nav-sim-lista" hidden={!abierto}>
        {items.map((it) => (
          <li key={it.slug}>
            <NavLink to={it.to} style={{ ["--acento" as string]: it.color }}>
              {it.nombre}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

// Navegacion. En celular se abre con la hamburguesa; en pantalla grande
// siempre esta a la vista, porque un nino no deberia tener que buscarla.
//
// Menu limpio: Inicio · Practicar ▾ · Simulacros ▾ · Contacto. Las cuatro
// materias no van sueltas en la barra; viven dentro de los dos desplegables,
// que hacen la misma pregunta al chiquito: practicar por tema o hacer el
// simulacro completo.
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  // Los dos apoyos de apariencia viven aca y en ningun otro lado: dos
  // copias del estado terminan mostrando cosas distintas en cada una.
  const { tema, vision, texto, alternarTema, alternarVision, ciclarTexto } = useApariencia();
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra la hamburguesa del celular.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  // "Practicar" queda activo en las paginas de materia (/espanol, /ciencias…);
  // "Simulacros" en /simulacros y sus hijos.
  const enPracticar = MATERIAS.some((m) => pathname === `/${m.slug}`);
  const enSimulacros = pathname === "/simulacros" || pathname.startsWith("/simulacros/");

  const itemsPracticar: ItemMenu[] = MATERIAS.map((m) => ({
    slug: m.slug, nombre: m.nombre, color: m.color, to: `/${m.slug}`,
  }));
  const itemsSimulacros: ItemMenu[] = MATERIAS.map((m) => ({
    slug: m.slug, nombre: m.nombre, color: m.color, to: `/simulacros/${m.slug}`,
  }));

  // El boton de tamano da tres pasos. La etiqueta le dice al lector de
  // pantalla en cual esta y que pasa al tocarlo, porque aria-pressed solo
  // sirve para si/no y aca hay tres estados.
  const nombreTexto = texto === "normal" ? "normal" : texto === "grande" ? "grande" : "extra grande";
  const etiquetaTexto = `Tamaño del texto: ${nombreTexto}. Tocá para cambiarlo`;

  return (
    <header id="nav-principal">
      <div className="ps-contenedor nav-caja">
        <Link to="/" className="nav-marca" onClick={() => setAbierto(false)}>
          <img
            src={IMG_LOGO_EVI}
            alt="EVI · Accesible para todos. Ir al inicio"
            width={300}
            height={118}
            fetchPriority="high"
            decoding="async"
          />
        </Link>

        <button
          type="button"
          className="nav-hamburguesa"
          aria-expanded={abierto}
          aria-controls="nav-menu"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          {abierto ? "Cerrar" : "Menú"}
        </button>

        <nav id="nav-menu" className="nav-menu" data-abierto={abierto ? "si" : "no"} aria-label="Principal">
          <ul className="nav-lista">
            <li>
              <NavLink to="/" onClick={() => setAbierto(false)}>Inicio</NavLink>
            </li>
            <MenuDesplegable
              etiqueta="Practicar"
              id="nav-practicar"
              activo={enPracticar}
              items={itemsPracticar}
            />
            <MenuDesplegable
              etiqueta="Simulacros"
              id="nav-simulacros"
              activo={enSimulacros}
              items={itemsSimulacros}
            />
            {/* Enlace de salida a la web de idoneidad docente (adultos). Es
                otro sitio, asi que abre en otra pestaña y lleva el icono de
                enlace externo; no es NavLink porque no es una ruta de esta
                app. */}
            <li>
              <a
                href={URL_IDONEA}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-externo"
                onClick={() => setAbierto(false)}
              >
                <GraduationCap size={18} strokeWidth={2.2} aria-hidden="true" />
                Idoneidad Docente
                <ExternalLink size={15} strokeWidth={2.2} aria-hidden="true" className="nav-externo-icono" />
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <NavLink to="/contacto" onClick={() => setAbierto(false)}>Contacto</NavLink>
            </li>
          </ul>

          {/* Los dos botones van dentro del menu y no en la barra: en un
              celular de 320px, al lado del logo y de la hamburguesa, no
              caben sin dejar el menu apretado. Con el menu abierto quedan
              a la vista, que es donde se buscan. */}
          <div className="nav-apariencia" role="group" aria-label="Apariencia de la página">
            <button
              type="button"
              className="nav-ap-boton"
              aria-pressed={tema === "oscuro"}
              aria-label="Modo oscuro"
              onClick={alternarTema}
            >
              {/* El icono cambia con el estado: encendido no se dice solo
                  con el color de fondo del boton. */}
              {tema === "oscuro"
                ? <Sun size={20} strokeWidth={2.2} aria-hidden="true" />
                : <Moon size={20} strokeWidth={2.2} aria-hidden="true" />}
              <span className="nav-ap-texto">Modo oscuro</span>
            </button>
            <button
              type="button"
              className="nav-ap-boton"
              aria-pressed={vision === "alto"}
              aria-label="Mejor visión"
              onClick={alternarVision}
            >
              <Eye size={20} strokeWidth={2.2} aria-hidden="true" />
              <span className="nav-ap-texto">Mejor visión</span>
            </button>
            <button
              type="button"
              className="nav-ap-boton"
              data-nivel={texto}
              aria-label={etiquetaTexto}
              onClick={ciclarTexto}
            >
              <ALargeSmall size={22} strokeWidth={2.2} aria-hidden="true" />
              <span className="nav-ap-texto">Tamaño del texto</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
