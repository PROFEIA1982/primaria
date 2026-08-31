import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Accessibility, ALargeSmall, ChevronDown, Contrast, ExternalLink, Eye,
  GraduationCap, Menu, Moon, Palette, Sun, Volume2, VolumeX, X,
} from "lucide-react";
import { IMG_LOGO_EVI, MATERIAS, URL_IDONEA } from "../config";
import { useApariencia } from "../lib/apariencia";
import "./Nav.css";

type ItemMenu = { slug: string; nombre: string; color: string; to: string };

// Abrir y cerrar un desplegable del menu. Lo comparten el de materias y
// el de accesibilidad: dos copias de esta logica terminan con uno que
// cierra al tocar afuera y otro que no.
function useDesplegable() {
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

  const alternar = useCallback(() => setAbierto((v) => !v), []);
  return { abierto, alternar, cajaRef, botonRef };
}

// Un desplegable de enlaces. Se usa dos veces: "Practicar" (por tema) y
// "Simulacros" (examen completo).
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
  const { abierto, alternar, cajaRef, botonRef } = useDesplegable();

  return (
    <li className="nav-desplegable" ref={cajaRef}>
      <button
        type="button"
        className="nav-sim-boton"
        ref={botonRef}
        aria-expanded={abierto}
        aria-controls={id}
        data-activo={activo ? "si" : undefined}
        onClick={alternar}
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
// Menu: Inicio · Practicar ▾ · Simulacros ▾ · Idoneidad Docente ↗ ·
// Contacto · Accesibilidad ▾. Las cuatro materias no van sueltas en la
// barra; viven dentro de los dos desplegables, que hacen la misma
// pregunta al chiquito: practicar por tema o hacer el simulacro completo.
export default function Nav() {
  const [abierto, setAbierto] = useState(false);
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
            <MenuAccesibilidad />
          </ul>
        </nav>
      </div>
    </header>
  );
}
