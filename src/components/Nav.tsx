import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { MATERIAS } from "../config";
import "./Nav.css";

// Navegacion. En celular se abre con la hamburguesa; en pantalla grande
// siempre esta a la vista, porque un nino no deberia tener que buscarla.
export default function Nav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header id="nav-principal">
      <div className="ps-contenedor nav-caja">
        <Link to="/" className="nav-marca" onClick={() => setAbierto(false)}>
          <span aria-hidden="true">✏️</span> Practicá
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
                  <span aria-hidden="true">{m.emoji}</span> {m.corto}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/contacto" onClick={() => setAbierto(false)}>Contacto</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
