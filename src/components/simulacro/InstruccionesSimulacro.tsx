import { ClipboardList, Clock, Target } from "lucide-react";
import { GUIA_MATERIA, type SlugMateria } from "../../config";

type Props = {
  materia: SlugMateria;
  nombre: string;
  cantidad: number;
  haySim2: boolean;
};

// La tarjeta de instrucciones de la materia. Reemplaza el parrafo suelto
// que se veia como un hueco: ahora es una tarjeta con el color de la materia,
// tres chips de datos (cuantas preguntas, cuanto tiempo, que tipo de prueba)
// y un par de lineas de como funciona. Los chips y el "hacer" cambian segun
// la materia; el tiempo sale de si hay un Simulacro 2 (el unico con 3 o 4 h).
export default function InstruccionesSimulacro({ materia, nombre, cantidad, haySim2 }: Props) {
  const guia = GUIA_MATERIA[materia];
  const tiempo = haySim2 ? "2, 3 o 4 horas" : "2 horas";

  return (
    <section className="sim-guia" aria-label={`Cómo funcionan los simulacros de ${nombre}`}>
      <p className="sim-guia-hacer">{guia.hacer}</p>

      {/* Los chips son datos rapidos. Cada uno lleva icono Y texto: el color
          no comunica solo. role="list" explicito porque con list-style:none
          algunos lectores le quitan la semantica. */}
      <ul className="sim-guia-chips" role="list">
        <li className="sim-guia-chip">
          <ClipboardList size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>
            <strong>{cantidad}</strong> preguntas
          </span>
        </li>
        <li className="sim-guia-chip">
          <Clock size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>{tiempo}</span>
        </li>
        <li className="sim-guia-chip">
          <Target size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>{guia.foco}</span>
        </li>
      </ul>

      <p className="sim-guia-como">
        Escogé <strong>una sola respuesta</strong>. En cada intento las opciones
        se barajan, así que fijate en lo que dice cada una, no en la letra. Podés
        repetirlo las veces que querás y, al final, guardar el PDF.
      </p>
    </section>
  );
}
