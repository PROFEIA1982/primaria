import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { IMG_LOGO_EVI, MATERIAS } from "../config";
import "./Nav.css";

// Navegacion. En celular se abre con la hamburguesa; en pantalla grande
// siempre esta a la vista, porque un nino no deberia tener que buscarla.
//
// Menu: Inicio · Español · Sociales · Ciencias · Matemáticas · Contacto.
// Accesibilidad ya no vive aca. En pantalla grande esta en el boton
// flotante de abajo a la izquierda; en celular y tablet, en la barra fija
// de abajo. Dentro de la hamburguesa el panel se salia de la pantalla y el
// ultimo ajuste quedaba cortado, sin manera de alcanzarlo.
// El enlace a la web de idoneidad docente salio de aca: es publicidad
// para adultos y no tiene por que ocupar un puesto en el menu de un
// chiquito. Sigue estando en la portada y en contacto, dentro del bloque
// de docentes, que es donde corresponde.
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra la hamburguesa del celular.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

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
            {/* Las cuatro materias van sueltas y no dentro de un desplegable.
                Un chiquito no piensa "quiero hacer un simulacro, de que"; piensa
                "me va mal en mate". La materia es la unidad, y partir por verbo
                dejaba "Español" repetido en dos menus. Escoger entre practicar y
                simulacro se hace ya adentro, con las dos pestañas, que es donde
                cabe explicar la diferencia. */}
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
        </nav>
      </div>
    </header>
  );
}
