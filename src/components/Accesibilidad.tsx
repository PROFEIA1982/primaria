// ============================================================
// Los ajustes de accesibilidad: el panel y sus dos envases.
//
// El panel es uno solo (PanelAccesibilidad) y se monta en dos lugares
// distintos segun el ancho de la pantalla:
//
//   · en celular, dentro de la hamburguesa del menu (lo arma Nav.tsx)
//   · en pantalla grande, en un boton flotante abajo a la izquierda
//
// Por que salio del menu en escritorio: se midio. Con el texto en
// tamano normal los siete botones cabian en un renglon por 19 px. Con
// "Grande" faltaban 54 y con "Muy grande" faltaban 113, y el renglon se
// partia dejando "Accesibilidad" colgando solo. O sea que lo que rompia
// el menu era el propio boton de agrandar el texto: justo a quien mas
// necesita estos ajustes se le desacomodaba la barra. Flotando no
// compite por ancho con nada, y ademas queda a mano en cualquier pagina
// y a cualquier altura del scroll, incluso a media prueba.
//
// Abajo a la IZQUIERDA y no a la derecha: la esquina derecha es donde
// se paran las burbujas de las extensiones del navegador.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Accessibility, ALargeSmall, ChevronDown, Contrast, Eye,
  Moon, Palette, Sun, Volume2, VolumeX,
} from "lucide-react";
import { useApariencia } from "../lib/apariencia";
import "./Accesibilidad.css";

// Abrir y cerrar un desplegable. Vive aca porque lo usan los dos
// envases, y porque la logica de "cerrar al tocar afuera, cerrar con
// Escape y devolver el foco" es de las que se copian mal si se
// escriben dos veces.
export function useDesplegable<T extends HTMLElement>() {
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef<T>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Al cambiar de pagina se cierra. Sin esto el panel se quedaba
  // abierto encima del contenido despues de navegar.
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

// Una fila del panel: icono, nombre, y el estado escrito. El estado
// NUNCA se comunica solo con el color de fondo: va tambien la palabra
// ("Activado" / "Desactivado") y el icono cambia.
function FilaAjuste({
  icono, nombre, estado, encendido, onClick,
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
        className="ax-fila"
        aria-pressed={encendido}
        onClick={onClick}
      >
        <span className="ax-icono" aria-hidden="true">{icono}</span>
        <span className="ax-nombre">{nombre}</span>
        <span className="ax-estado">{estado}</span>
      </button>
    </li>
  );
}

/** Hay algo puesto que no es lo de fabrica. Sirve para marcar el boton
 *  con un punto y que se note sin tener que abrir el panel. */
export function useHayAjustes(): boolean {
  const { tema, vision, color, texto, voz } = useApariencia();
  return (
    tema === "oscuro" || vision === "alto" || color !== "normal" ||
    texto !== "normal" || !voz
  );
}

// El contenido del panel. Los seis ajustes con su nombre escrito: tres
// botones sueltos con puro icono no le decian a nadie que la lunita era
// el modo oscuro.
export function PanelAccesibilidad({ id, abierto }: { id: string; abierto: boolean }) {
  const {
    tema, vision, color, texto, voz,
    alternarTema, alternarVision, ponerColor, ciclarTexto, alternarVoz,
  } = useApariencia();

  const nombreTexto =
    texto === "normal" ? "Normal" : texto === "grande" ? "Grande" : "Muy grande";

  return (
    <div id={id} className="ax-panel" hidden={!abierto}>
      <p className="ax-titulo">Ajustá la página como la veas mejor</p>

      <ul className="ax-lista">
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
            className="ax-fila"
            data-nivel={texto}
            aria-label={`Tamaño del texto: ${nombreTexto}. Tocá para agrandarlo`}
            onClick={ciclarTexto}
          >
            <span className="ax-icono" aria-hidden="true">
              <ALargeSmall size={21} strokeWidth={2.2} />
            </span>
            <span className="ax-nombre" aria-hidden="true">Tamaño del texto</span>
            <span className="ax-estado" aria-hidden="true">{nombreTexto}</span>
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

      <p className="ax-nota">
        Con la lectura activada, cada pregunta trae un botón «Escuchar».
      </p>
    </div>
  );
}

// El envase de pantalla grande: un boton fijo abajo a la izquierda que
// abre el panel hacia arriba. En celular queda oculto por CSS, porque
// ahi el mismo panel vive dentro de la hamburguesa.
export default function AccesibilidadFlotante() {
  const { abierto, alternar, cajaRef, botonRef } = useDesplegable<HTMLDivElement>();
  const hayAjustes = useHayAjustes();

  return (
    <div className="ax-flota" ref={cajaRef}>
      <PanelAccesibilidad id="ax-panel-flotante" abierto={abierto} />
      <button
        type="button"
        className="ax-flota-boton"
        ref={botonRef}
        aria-expanded={abierto}
        aria-controls="ax-panel-flotante"
        data-activo={hayAjustes ? "si" : undefined}
        onClick={alternar}
      >
        <Accessibility size={22} strokeWidth={2.2} aria-hidden="true" />
        <span className="ax-flota-texto">Accesibilidad</span>
        <ChevronDown
          size={18}
          strokeWidth={2.4}
          aria-hidden="true"
          className="ax-flecha"
          data-abierto={abierto ? "si" : "no"}
        />
      </button>
    </div>
  );
}
