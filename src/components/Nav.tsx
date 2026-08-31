import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Accessibility, ALargeSmall, ChevronDown, Contrast, Eye,
  Menu, Moon, Palette, Sun, Volume2, VolumeX, X,
} from "lucide-react";
import { IMG_LOGO_EVI, MATERIAS } from "../config";
import { useApariencia } from "../lib/apariencia";
import "./Nav.css";

// Abrir y cerrar un desplegable del menu. Vive aparte porque el panel de
// accesibilidad no es el unico que podria usarlo, y porque la logica de
// "cerrar al tocar afuera, cerrar con Escape y devolver el foco" es de las
// que se copian mal si se escriben dos veces.
function useDesplegable() {
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef<HTMLLIElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra. Sin esto, en escritorio el panel se
  // quedaba abierto encima del contenido despues de navegar.
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
      // El foco vuelve al boton que lo abrio: si se queda suelto, quien
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

  const alternar = useCallback(() => setAbierto((v) => !v), []);
  return { abierto, alternar, cajaRef, botonRef };
}

// Una fila del panel de accesibilidad: icono, nombre, y el estado
// escrito. El estado NUNCA se comunica solo con el color de fondo: va
// tambien la palabra ("Activado" / "Desactivado") y el icono cambia.
function FilaAjuste({
  icono,
  nombre,
  estado,
  encendido,
  onClick,
}: {
  icono: React.ReactNode;
  nombre: string;
  estado: string;
  encendido: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="nav-ax-fila"
        aria-pressed={encendido}
        onClick={onClick}
      >
        <span className="nav-ax-icono" aria-hidden="true">{icono}</span>
        <span className="nav-ax-nombre">{nombre}</span>
        <span className="nav-ax-estado">{estado}</span>
      </button>
    </li>
  );
}

// El panel de accesibilidad. Junta los cinco ajustes en un solo lugar
// con su nombre escrito: tres botones sueltos con puro icono en la
// barra no le decian a nadie que la lunita era el modo oscuro.
function MenuAccesibilidad() {
  const { abierto, alternar, cajaRef, botonRef } = useDesplegable();
  const {
    tema, vision, color, texto, voz,
    alternarTema, alternarVision, ponerColor, ciclarTexto, alternarVoz,
  } = useApariencia();

  const nombreTexto =
    texto === "normal" ? "Normal" : texto === "grande" ? "Grande" : "Muy grande";
  // Hay algo puesto que no es lo de fabrica: el boton lo avisa con un
  // punto, para que se note sin tener que abrir el panel.
  const hayAjustes =
    tema === "oscuro" || vision === "alto" || color !== "normal" || texto !== "normal" || !voz;

  return (
    <li className="nav-desplegable nav-ax" ref={cajaRef}>
      <button
        type="button"
        className="nav-sim-boton"
        ref={botonRef}
        aria-expanded={abierto}
        aria-controls="nav-accesibilidad"
        data-activo={hayAjustes ? "si" : undefined}
        onClick={alternar}
      >
        <Accessibility size={19} strokeWidth={2.2} aria-hidden="true" />
        Accesibilidad
        <ChevronDown
          size={18}
          strokeWidth={2.4}
          aria-hidden="true"
          className="nav-sim-flecha"
          data-abierto={abierto ? "si" : "no"}
        />
      </button>

      <div id="nav-accesibilidad" className="nav-ax-panel" hidden={!abierto}>
        <p className="nav-ax-titulo">Ajustá la página como la veas mejor</p>

        <ul className="nav-ax-lista">
          <FilaAjuste
            icono={tema === "oscuro" ? <Sun size={19} strokeWidth={2.2} /> : <Moon size={19} strokeWidth={2.2} />}
            nombre="Modo oscuro"
            estado={tema === "oscuro" ? "Activado" : "Desactivado"}
            encendido={tema === "oscuro"}
            onClick={alternarTema}
          />
          <FilaAjuste
            icono={<Eye size={19} strokeWidth={2.2} />}
            nombre="Alto contraste"
            estado={vision === "alto" ? "Activado" : "Desactivado"}
            encendido={vision === "alto"}
            onClick={alternarVision}
          />
          <FilaAjuste
            icono={<Palette size={19} strokeWidth={2.2} />}
            nombre="Modo daltonismo"
            estado={color === "daltonismo" ? "Activado" : "Desactivado"}
            encendido={color === "daltonismo"}
            onClick={() => ponerColor("daltonismo")}
          />
          <FilaAjuste
            icono={<Contrast size={19} strokeWidth={2.2} />}
            nombre="Escala de grises"
            estado={color === "grises" ? "Activado" : "Desactivado"}
            encendido={color === "grises"}
            onClick={() => ponerColor("grises")}
          />
          {/* El tamano no es de encender y apagar: da tres pasos, asi que
              en vez de aria-pressed dice cual esta puesto. */}
          <li>
            <button
              type="button"
              className="nav-ax-fila"
              data-nivel={texto}
              aria-label={`Tamaño del texto: ${nombreTexto}. Tocá para agrandarlo`}
              onClick={ciclarTexto}
            >
              <span className="nav-ax-icono" aria-hidden="true">
                <ALargeSmall size={21} strokeWidth={2.2} />
              </span>
              <span className="nav-ax-nombre" aria-hidden="true">Tamaño del texto</span>
              <span className="nav-ax-estado" aria-hidden="true">{nombreTexto}</span>
            </button>
          </li>
          <FilaAjuste
            icono={voz ? <Volume2 size={19} strokeWidth={2.2} /> : <VolumeX size={19} strokeWidth={2.2} />}
            nombre="Leer en voz alta"
            estado={voz ? "Activado" : "Desactivado"}
            encendido={voz}
            onClick={alternarVoz}
          />
        </ul>

        <p className="nav-ax-nota">
          Con la lectura activada, cada pregunta trae un botón «Escuchar».
        </p>
      </div>
    </li>
  );
}

// Navegacion. En celular se abre con la hamburguesa; en pantalla grande
// siempre esta a la vista, porque un nino no deberia tener que buscarla.
//
// Menu: Inicio · Español · Sociales · Ciencias · Matemáticas · Contacto ·
// Accesibilidad ▾. El enlace a la web de idoneidad docente salio de aca: es
// publicidad para adultos y no tiene por que ocupar un puesto en el menu de
// un chiquito. Sigue estando en la portada y en contacto, dentro del bloque
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
            <MenuAccesibilidad />
          </ul>
        </nav>
      </div>
    </header>
  );
}
