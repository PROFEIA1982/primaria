import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Clock, TriangleAlert } from "lucide-react";
import ItemRenderer from "../ItemRenderer";
import BarraApoyo, { type TamanoTexto } from "./BarraApoyo";
import { formatearReloj, PALABRA_RELOJ, type NivelReloj } from "./calificar";
import type { Practica } from "./usePractica";

const ICONO_RELOJ: Record<NivelReloj, typeof Clock> = {
  normal: Clock,
  poco: TriangleAlert,
  critico: CircleAlert,
};

type Props = {
  nombreMateria: string;
  practica: Practica;
};

// Pantalla 2: una pregunta a la vez, con la barra del reloj arriba.
export default function ExamenPanel({ nombreMateria, practica }: Props) {
  const { items, indice, respuestas, responder, siguiente, restante, nivel, aviso } = practica;

  const item = items[indice];
  const elegida = respuestas[indice] ?? null;
  const respondido = elegida !== null;
  const esLaUltima = indice === items.length - 1;
  const IconoReloj = ICONO_RELOJ[nivel];

  // La barra se pega debajo del menu, que es fijo. Se mide en vez de
  // escribir el numero a mano: el menu crece cuando se le da zoom o
  // cuando los enlaces se acomodan en dos filas. Lo mismo la barra: en
  // celular se parte en dos lineas y tapa el arranque de la pregunta.
  // Las tres ayudas de lectura. Viven aca y no en la barra para que el
  // estudiante no tenga que volver a agrandar la letra en cada pregunta;
  // no se guardan en el navegador a proposito, no hay nada que recordar.
  const [tamano, setTamano] = useState<TamanoTexto>("normal");
  const [altoContraste, setAltoContraste] = useState(false);

  const barraRef = useRef<HTMLDivElement>(null);
  const [altoMenu, setAltoMenu] = useState(0);
  const [altoBarra, setAltoBarra] = useState(0);
  useEffect(() => {
    const menu = document.getElementById("nav-principal");
    const barra = barraRef.current;
    const medir = () => {
      if (menu) setAltoMenu(menu.getBoundingClientRect().height);
      if (barra) setAltoBarra(barra.getBoundingClientRect().height);
    };
    medir();
    const observador = new ResizeObserver(medir);
    if (menu) observador.observe(menu);
    if (barra) observador.observe(barra);
    return () => observador.disconnect();
  }, []);

  // Al cambiar de pregunta el foco viaja al cuerpo: quien navega con
  // teclado o lector de pantalla no tiene que buscar donde quedo.
  const cuerpoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cuerpoRef.current?.focus();
  }, [indice]);

  if (!item) return null;

  const avance = items.length === 0 ? 0 : ((indice + 1) / items.length) * 100;

  return (
    <>
      <div className="examen-barra" ref={barraRef} style={{ top: `${altoMenu}px` }}>
        <div className="ps-contenedor examen-barra-caja">
          {/* El nombre de la materia es el h1 de esta pantalla: antes la
              pagina del examen no tenia ni un encabezado. */}
          <h1 className="examen-materia">{nombreMateria}</h1>
          <p className="examen-progreso">
            Pregunta <strong>{indice + 1}</strong> de {items.length}
          </p>
          <p className="examen-reloj" data-nivel={nivel}>
            <IconoReloj size={20} strokeWidth={2.2} aria-hidden="true" />
            <span className="examen-tiempo">{formatearReloj(restante)}</span>
            {/* La palabra acompana siempre al color: hay chiquitos que no
                distinguen el ambar del rojo. */}
            <span className="examen-palabra">{PALABRA_RELOJ[nivel]}</span>
          </p>
        </div>
        <div className="examen-barrita" aria-hidden="true">
          <span style={{ width: `${avance}%` }} />
        </div>
      </div>

      {/* La region viva no canta cada segundo: solo cambia al pasar de
          minuto o cuando el tiempo entra en ambar o en rojo. */}
      <p className="ps-solo-lectores" aria-live="polite">{aviso}</p>

      <div
        className="ps-contenedor examen-cuerpo"
        tabIndex={-1}
        ref={cuerpoRef}
        // Cuando el foco salta a la pregunta nueva, el navegador la sube:
        // sin este margen quedaria escondida bajo el menu y la barra.
        style={{ scrollMarginTop: `${altoMenu + altoBarra + 12}px` }}
        aria-label={`Pregunta ${indice + 1} de ${items.length}`}
      >
        {/* La key hace que la barra se rearme con cada pregunta: al
            desmontarse corta la lectura y el boton vuelve a "Escuchar". */}
        <BarraApoyo
          key={`apoyo-${item.id}`}
          enunciado={item.enunciado}
          opciones={item.opciones}
          tamano={tamano}
          alCambiarTamano={setTamano}
          altoContraste={altoContraste}
          alCambiarContraste={setAltoContraste}
        />

        <ItemRenderer
          key={item.id}
          enunciado={item.enunciado}
          opciones={item.opciones}
          elegida={elegida}
          alElegir={responder}
          imagenUrl={item.imagen_url}
          imagenAlt={item.imagen_alt}
          tamano={tamano}
          altoContraste={altoContraste}
        />

        {respondido && (
          <div className="examen-pie">
            <button type="button" className="ps-boton examen-siguiente" onClick={siguiente}>
              {esLaUltima ? "Ver resultados" : "Siguiente"}
              <ArrowRight size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
