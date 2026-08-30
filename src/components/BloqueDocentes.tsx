import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  MonitorPlay,
} from "lucide-react";
import { URL_IDONEA, WA_SIMULACROS } from "../config";
import "./BloqueDocentes.css";

// El aviso para docentes. Vive en dos lugares (inicio y contacto) y por eso
// es un componente y no dos copias que despues se desincronizan.
// La variante cambia el aire alrededor, no el mensaje: el maestro que llega
// por cualquiera de las dos puertas tiene que leer lo mismo.

// Cuatro tarjetas, una idea por tarjeta. El detalle largo va dentro de un
// details nativo: quien tiene prisa lee cuatro lineas y se va al boton.
const QUE_TRAE = [
  {
    icono: ClipboardCheck,
    titulo: "Simulacros como la prueba",
    corto: "Mismo formato y con reloj.",
    mas: "Al terminar ve la nota, en cuáles falló y por qué. Puede repetirlos las veces que quiera.",
  },
  {
    icono: BookOpen,
    titulo: "Material de estudio",
    corto: "Guías, resúmenes y ejercicios por tema.",
    mas: "Ordenado por área, para que le meta a lo que le falta y no repase de nuevo lo que ya domina.",
  },
  {
    icono: MonitorPlay,
    titulo: "Clases",
    corto: "Grabadas y sesiones en vivo.",
    mas: "Las grabadas quedan disponibles a la hora que pueda. En las de en vivo pregunta lo que no le calza.",
  },
  {
    icono: HeartHandshake,
    titulo: "Acompañamiento",
    corto: "Alguien le contesta por WhatsApp.",
    mas: "Si se le traba algo, escribe y le respondemos. Nadie queda solo con un PDF y buena suerte.",
  },
];

export default function BloqueDocentes({
  variante = "completa",
}: {
  variante?: "completa" | "discreta";
}) {
  // El id del titular sale de la variante igual que el de la seccion: si algun
  // dia las dos caen en la misma pagina, no se repite ningun id.
  const raiz = variante === "discreta" ? "docentes-inicio" : "docentes-contacto";
  const idTitulo = `${raiz}-titulo`;

  return (
    <section
      id={raiz}
      className="ps-docentes"
      data-variante={variante}
      aria-labelledby={idTitulo}
    >
      <div className="ps-contenedor">
        <div className="docentes-encabezado">
          <span className="docentes-icono" aria-hidden="true">
            <GraduationCap size={30} strokeWidth={1.8} />
          </span>
          <p className="docentes-etiqueta">Para maestros y familias</p>
          <h2 id={idTitulo}>Pruebe gratis un simulacro de idoneidad docente</h2>
          <p className="docentes-bajada">
            La práctica de sexto grado es gratis y va a seguir siéndolo. Si usted
            además anda en el proceso de idoneidad, hay una plataforma aparte:
            entre, haga el simulacro de prueba y de ahí decide.
          </p>
        </div>

        <ul className="docentes-rejilla">
          {QUE_TRAE.map((t) => {
            const Icono = t.icono;
            return (
              <li className="docentes-tarjeta" key={t.titulo}>
                <span className="docentes-tarjeta-icono" aria-hidden="true">
                  <Icono size={26} strokeWidth={1.9} />
                </span>
                <h3 className="docentes-tarjeta-titulo">{t.titulo}</h3>
                <p className="docentes-tarjeta-corto">{t.corto}</p>
                <details className="ps-mas">
                  <summary>
                    <span className="ps-mas-cerrado">Ver detalle</span>
                    <span className="ps-mas-abierto">Cerrar</span>
                    <ChevronDown className="ps-mas-flecha" size={18} strokeWidth={2.2} aria-hidden="true" />
                  </summary>
                  <p>{t.mas}</p>
                </details>
              </li>
            );
          })}
        </ul>

        <div className="docentes-acciones">
          <a
            className="ps-boton docentes-boton"
            href={URL_IDONEA}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hacer el simulacro gratis
            <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            <ArrowUpRight size={19} strokeWidth={2.2} aria-hidden="true" />
          </a>
          <a
            className="ps-boton docentes-secundario"
            href={WA_SIMULACROS}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={19} strokeWidth={2.2} aria-hidden="true" />
            Preguntar por WhatsApp
            <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
          </a>
        </div>

        <p className="docentes-fino">
          La preparación no sustituye los procesos oficiales de acreditación.
        </p>
      </div>
    </section>
  );
}
