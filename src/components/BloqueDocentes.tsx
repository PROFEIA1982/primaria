import { ArrowUpRight, GraduationCap, MessageCircle } from "lucide-react";
import { URL_IDONEA, WA_SIMULACROS } from "../config";
import "./BloqueDocentes.css";

// El aviso para docentes. Vive en dos lugares (inicio y contacto) y por eso
// es un componente y no dos copias que despues se desincronizan.
// La variante cambia el tono, no el contenido: en el inicio va mas discreto
// porque ahi el visitante es el estudiante.
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
      <div className="ps-contenedor docentes-caja">
        <span className="docentes-icono" aria-hidden="true">
          <GraduationCap size={30} strokeWidth={1.8} />
        </span>

        <div className="docentes-texto">
          <p className="docentes-etiqueta">Para maestros y familias</p>
          <h2 id={idTitulo}>
            ¿Se está preparando para la prueba de idoneidad docente?
          </h2>
          <p>
            Esta práctica de sexto grado es gratis y va a seguir siéndolo. Ahora,
            si usted es docente y anda en el proceso de idoneidad, hay una
            plataforma aparte con simulacros, clases y material de estudio.
          </p>
          <p className="docentes-fino">
            La preparación no sustituye los procesos oficiales de acreditación.
          </p>

          <div className="docentes-acciones">
            <a
              className="ps-boton docentes-boton"
              href={URL_IDONEA}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver la preparación de idoneidad
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
        </div>
      </div>
    </section>
  );
}
