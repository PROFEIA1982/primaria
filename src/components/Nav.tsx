import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Eye, Menu, Moon, Sun, X } from "lucide-react";
import { IMG_LOGO_EVI, MATERIAS } from "../config";
import { useApariencia } from "../lib/apariencia";
import "./Nav.css";

// Navegacion. En celular se abre con la hamburguesa; en pantalla grande
// siempre esta a la vista, porque un nino no deberia tener que buscarla.
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  // Los dos apoyos de apariencia viven aca y en ningun otro lado: dos
  // copias del estado terminan mostrando cosas distintas en cada una.
  const { tema, vision, alternarTema, alternarVision } = useApariencia();

  // --- El desplegable de simulacros ---
  // Es un boton que muestra u oculta una lista, no un menu de escritorio
  // con flechas: el patron sencillo es el que mejor se porta en celular y
  // con lector de pantalla, y aca solo hay cinco enlaces adentro.
  const [simAbierto, setSimAbierto] = useState(false);
  const cajaSimRef = useRef<HTMLLIElement>(null);
  const botonSimRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra todo. Sin esto, en escritorio la lista
  // se quedaba abierta encima del contenido despues de navegar.
  useEffect(() => {
    setSimAbierto(false);
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!simAbierto) return;
    const alTocarAfuera = (e: MouseEvent) => {
      if (!cajaSimRef.current?.contains(e.target as Node)) setSimAbierto(false);
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSimAbierto(false);
      // El foco vuelve al boton que la abrio: si se queda suelto, quien
      // navega con teclado tiene que empezar desde arriba otra vez.
      botonSimRef.current?.focus();
    };
    document.addEventListener("mousedown", alTocarAfuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alTocarAfuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [simAbierto]);

  const enSimulacros = pathname === "/simulacros" || pathname.startsWith("/simulacros/");

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
            {MATERIAS.map((m) => (
              <li key={m.slug}>
                <NavLink
                  to={`/${m.slug}`}
                  style={{ ["--acento" as string]: m.color }}
                  onClick={() => setAbierto(false)}
                >
                  {m.corto}
                </NavLink>
              </li>
            ))}
            <li className="nav-desplegable" ref={cajaSimRef}>
              <button
                type="button"
                className="nav-sim-boton"
                ref={botonSimRef}
                aria-expanded={simAbierto}
                aria-controls="nav-simulacros"
                data-activo={enSimulacros ? "si" : undefined}
                onClick={() => setSimAbierto((v) => !v)}
              >
                Simulacros
                <ChevronDown
                  size={18}
                  strokeWidth={2.4}
                  aria-hidden="true"
                  className="nav-sim-flecha"
                  data-abierto={simAbierto ? "si" : "no"}
                />
              </button>
              {/* Con hidden y no con display:none en CSS: asi el enlace
                  cerrado tampoco recibe el tabulador ni lo lee el lector. */}
              <ul id="nav-simulacros" className="nav-sim-lista" hidden={!simAbierto}>
                <li>
                  <NavLink to="/simulacros" end>Todos los simulacros</NavLink>
                </li>
                {MATERIAS.map((m) => (
                  <li key={m.slug}>
                    <NavLink
                      to={`/simulacros/${m.slug}`}
                      style={{ ["--acento" as string]: m.color }}
                    >
                      {m.nombre}
                    </NavLink>
                  </li>
                ))}
              </ul>
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
          </div>
        </nav>
      </div>
    </header>
  );
}
