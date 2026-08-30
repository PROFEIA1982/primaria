import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Eye, Menu, Moon, Sun, X } from "lucide-react";
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
