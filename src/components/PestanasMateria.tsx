import { Link } from "react-router-dom";
import { ClipboardList, Dumbbell } from "lucide-react";
import "./PestanasMateria.css";

type Props = {
  /** slug de la materia: espanol, estudios-sociales, ciencias, matematicas */
  slug: string;
  /** cual de las dos esta abierta */
  actual: "practicar" | "simulacro";
};

// Las dos formas de trabajar una materia, una al lado de la otra.
//
// Antes vivian en dos menus distintos del encabezado ("Practicar" y
// "Simulacros"), y eso obligaba al chiquito a entender la diferencia ANTES
// de escoger materia. La diferencia necesita dos frases para explicarse y
// una linea de menu no las aguanta; aca si caben.
//
// Van como enlaces y no como botones con estado: cada una es una direccion
// de verdad (/espanol y /simulacros/espanol), asi que se pueden compartir,
// guardar en favoritos y abrir en otra pestaña. El boton de atras del
// navegador tambien hace lo que uno espera.
export default function PestanasMateria({ slug, actual }: Props) {
  const enPractica = actual === "practicar";

  return (
    <nav className="mat-pestanas" aria-label="Cómo trabajar esta materia">
      <ul>
        <li>
          <Link
            to={`/${slug}`}
            className="mat-pestana"
            aria-current={enPractica ? "page" : undefined}
          >
            <span className="mat-pestana-icono" aria-hidden="true">
              <Dumbbell size={20} strokeWidth={2.1} />
            </span>
            <span className="mat-pestana-cuerpo">
              <span className="mat-pestana-nombre">Practicar</span>
              <span className="mat-pestana-pie">
                Escogé el tema y cuántas. Te digo al toque si está bien.
              </span>
            </span>
          </Link>
        </li>
        <li>
          <Link
            to={`/simulacros/${slug}`}
            className="mat-pestana"
            aria-current={!enPractica ? "page" : undefined}
          >
            <span className="mat-pestana-icono" aria-hidden="true">
              <ClipboardList size={20} strokeWidth={2.1} />
            </span>
            <span className="mat-pestana-cuerpo">
              <span className="mat-pestana-nombre">Simulacro</span>
              <span className="mat-pestana-pie">
                Las 60 de corrido, con reloj, como el día de la prueba.
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
