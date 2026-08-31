import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Clock, LogOut, TriangleAlert } from "lucide-react";
import ItemRenderer from "../ItemRenderer";
import BarraApoyo, { type TamanoTexto } from "./BarraApoyo";
import { formatearReloj, PALABRA_RELOJ, type NivelReloj } from "./calificar";
import { useBarraPegada, useLlevarALaPregunta } from "./useBarraPegada";
import type { Practica } from "./usePractica";
import { useVozActiva } from "../../lib/apariencia";

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
  // El interruptor de "Leer en voz alta" vive en el menu de accesibilidad;
  // aca solo se consulta para decidir si se pinta el boton "Escuchar".
  const vozActiva = useVozActiva();
  const { items, indice, respuestas, responder, siguiente, restante, nivel, aviso,
          conReloj, volverAPracticar } = practica;

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

  // Las tres ayudas de lectura. Viven aca y no en la barra para que el
  // estudiante no tenga que volver a agrandar la letra en cada pregunta;
  // no se guardan en el navegador a proposito, no hay nada que recordar.
  const [tamano, setTamano] = useState<TamanoTexto>("normal");
  const [altoContraste, setAltoContraste] = useState(false);

  // Las dos medidas de la barra pegada y el salto de foco a la pregunta
  // nueva salen del mismo sitio que en el simulacro: ver useBarraPegada.
  const { barraRef, altoMenu, altoBarra } = useBarraPegada();
  const cuerpoRef = useLlevarALaPregunta(indice);

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
          {/* El reloj solo si el estudiante lo pidio. Apagado, la practica
              corre sin apuro: es estudio, no competencia. */}
          {conReloj && (
            <p className="examen-reloj" data-nivel={nivel}>
              <IconoReloj size={20} strokeWidth={2.2} aria-hidden="true" />
              <span className="examen-tiempo">{formatearReloj(restante)}</span>
              {/* La palabra acompana siempre al color: hay chiquitos que no
                  distinguen el ambar del rojo. */}
              <span className="examen-palabra">{PALABRA_RELOJ[nivel]}</span>
            </p>
          )}
        </div>
        {/* La barrita es dibujo y nada mas. Llego a tener role="progressbar"
            para que el lector de pantalla dijera el avance, pero progressbar
            exige nombre accesible y no lo tenia; y con el "Pregunta 3 de 10"
            de arriba, que ya lo dice, quedaba diciendo lo mismo dos veces
            seguidas. Mejor callada. */}
        <div className="examen-barrita" aria-hidden="true">
          <span style={{ width: `${avance}%` }} />
        </div>
      </div>

      {/* La region viva no canta cada segundo: solo cambia al pasar de
          minuto o cuando el tiempo entra en ambar o en rojo. */}
      {conReloj && <p className="ps-solo-lectores" aria-live="polite">{aviso}</p>}

      {/* role="group" y no un div pelado: un div sin rol mapea a "generic",
          y en generic el nombre accesible esta prohibido, o sea que los
          navegadores se tragaban este aria-label. Al saltar a la pregunta
          nueva no se anunciaba nada. */}
      <div
        className="ps-contenedor examen-cuerpo"
        tabIndex={-1}
        role="group"
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
          conVoz={vozActiva}
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
