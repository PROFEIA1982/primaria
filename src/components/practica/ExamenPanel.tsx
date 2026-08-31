import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Clock, LogOut, TriangleAlert } from "lucide-react";
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
  const { items, indice, respuestas, responder, siguiente, restante, nivel, aviso,
          volverAPracticar } = practica;

  // Salir a medio camino. Antes no habia forma: el estudiante que se
  // arrepentia en la tres solo podia irse por el menu de arriba, y en celular
  // el menu esta plegado. Va en dos pasos y no en un confirm del navegador:
  // el confirm interrumpe y a un chiquito lo asusta, ademas de que se ve
  // distinto en cada aparato.
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const salirRef = useRef<HTMLButtonElement>(null);
  // Guarda si el aviso llego a abrirse, para no robar el foco al montar.
  const seAbrioRef = useRef(false);
  useEffect(() => {
    if (confirmandoSalida) {
      seAbrioRef.current = true;
      // El foco cae en "Seguir practicando", que es la salida segura: si
      // alguien le da a la tecla de espacio sin leer, no pierde la practica.
      cancelarRef.current?.focus();
    } else if (seAbrioRef.current) {
      // Al arrepentirse, el foco vuelve al boton que abrio el aviso. Sin esto
      // se caia al cuerpo del documento y quien usa teclado quedaba perdido.
      //
      // Si lo que cerro el aviso fue un cambio de pregunta, este foco igual
      // se pierde: el efecto que lleva el foco a la pregunta nueva se declara
      // mas abajo y los efectos corren en orden, asi que ese manda.
      seAbrioRef.current = false;
      salirRef.current?.focus();
    }
  }, [confirmandoSalida]);
  // Si cambia de pregunta con el aviso abierto, se cierra solo. Se ajusta
  // durante el render y no en un efecto, que es el patron que ya usa
  // usePractica con el cambio de materia: asi no se alcanza a dibujar un
  // cuadro con el aviso de la pregunta anterior.
  const [indicePrevio, setIndicePrevio] = useState(indice);
  if (indice !== indicePrevio) {
    setIndicePrevio(indice);
    setConfirmandoSalida(false);
  }

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

  // Al cambiar de pregunta hay que hacer dos cosas: subir la pantalla al
  // arranque de la pregunta y llevar el foco ahi.
  //
  // Antes esto era solo un focus(), y no servia. El navegador desplaza al
  // enfocar UNICAMENTE cuando el elemento esta del todo fuera de vista, y
  // este contenedor es tan alto que siempre asoma por abajo: se daba por
  // satisfecho y no movia nada. Medido en celular de 360 px, el estudiante
  // caia con 128 px de la pregunta escondidos arriba, y peor conforme
  // avanzaba: despues de tres preguntas eran 338. O sea que empezaba a leer
  // a media tabla y tenia que subir a mano cada vez.
  //
  // Por eso el desplazamiento va explicito, y el foco despues con
  // preventScroll para que no pelee con el.
  const cuerpoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cuerpo = cuerpoRef.current;
    if (!cuerpo) return;
    // Dentro de un cuadro de animacion: al momento de correr el efecto el
    // enunciado todavia no termino de acomodarse, y una cuenta hecha antes
    // deja la pregunta mal parada. scrollIntoView la resuelve contra la
    // medida real y respeta el scrollMarginTop que se calcula abajo, asi
    // que la pregunta queda justo debajo del menu y de la barra.
    const cuadro = requestAnimationFrame(() => {
      const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      cuerpo.scrollIntoView({ block: "start", behavior: quieto ? "auto" : "smooth" });
      cuerpo.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(cuadro);
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
        {/* La barrita era decorativa: quien no la ve no se enteraba de cuanto
            llevaba. Con el rol y sus valores, el lector de pantalla lo dice.
            El aria-valuetext va en preguntas y no en porcentaje, que es como
            piensa el estudiante: "tres de diez", no "treinta por ciento". */}
        <div
          className="examen-barrita"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={items.length}
          aria-valuenow={indice + 1}
          aria-valuetext={`Pregunta ${indice + 1} de ${items.length}`}
        >
          <span style={{ width: `${avance}%` }} aria-hidden="true" />
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
        <BarraApoyo
          tamano={tamano}
          alCambiarTamano={setTamano}
          altoContraste={altoContraste}
          alCambiarContraste={setAltoContraste}
        />

        {/* La key rearma el item con cada pregunta: al desmontarse corta la
            lectura en voz alta y el boton vuelve a decir "Escuchar". */}
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
          conVoz
        />

        {respondido && (
          <div className="examen-pie">
            <button type="button" className="ps-boton examen-siguiente" onClick={siguiente}>
              {esLaUltima ? "Ver resultados" : "Siguiente"}
              <ArrowRight size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Discreto y al final, que es donde nace la idea de parar. No va en
            la barra de arriba a proposito: esa barra es para el reloj y ya
            estaba comiendose mucha pantalla en celular. */}
        <div className="examen-salida">
          {confirmandoSalida ? (
            <div className="examen-confirmar" role="group" aria-label="Confirmar la salida">
              <p className="examen-confirmar-texto">
                ¿Seguro que querés salir? Se pierden las respuestas de esta práctica.
              </p>
              <div className="examen-confirmar-botones">
                <button
                  type="button"
                  className="ps-boton examen-seguir"
                  ref={cancelarRef}
                  onClick={() => setConfirmandoSalida(false)}
                >
                  Seguir practicando
                </button>
                <button type="button" className="examen-salir-si" onClick={volverAPracticar}>
                  Sí, salir
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="examen-salir"
              ref={salirRef}
              onClick={() => setConfirmandoSalida(true)}
            >
              <LogOut size={18} strokeWidth={2} aria-hidden="true" />
              Salir de la práctica
            </button>
          )}
        </div>
      </div>
    </>
  );
}
