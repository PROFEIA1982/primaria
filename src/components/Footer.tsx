import { Link } from "react-router-dom";
import { Mail, MessageCircle } from "lucide-react";
import {
  CORREO,
  EMPRESA,
  IMG_LOGO_CONCURSO,
  TELEFONO_VISIBLE,
  URL_PROFESEGURO,
  waLink,
} from "../config";
import "./Footer.css";

const ANIO = new Date().getFullYear();

// Pie del sitio: logo, que es esto, cuatro enlaces y una linea legal.
// Se quedo en lo minimo a proposito. Un pie largo compite con la practica
// y en celular obliga a un scroll que nadie pidio; lo demas del contacto
// ya vive en su propia pagina. Los iconos son de trazo, no emoji: un emoji
// se ve distinto en cada aparato y algunos lectores lo leen entero.
export default function Footer() {
  return (
    <footer id="footer-principal">
      <div className="ps-contenedor footer-caja">
        <div className="footer-marca">
          <img
            className="footer-logo"
            src={IMG_LOGO_CONCURSO}
            alt=""
            width={260}
            height={337}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <p className="footer-descripcion">
            Práctica gratuita de sexto grado, sin cuentas y sin costo.
          </p>
        </div>

        <nav className="footer-enlaces" aria-label="Pie de página">
          <ul className="footer-lista">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li>
              <a
                href={waLink("Hola, le escribo por la práctica de sexto grado.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
                WhatsApp {TELEFONO_VISIBLE}
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CORREO}`}>
                <Mail size={18} strokeWidth={2} aria-hidden="true" />
                {CORREO}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer-legal">
        <div className="ps-contenedor footer-legal-caja">
          <p>
            Hecho por{" "}
            <a href={URL_PROFESEGURO} target="_blank" rel="noopener noreferrer">
              ProfeSeguro.com
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </a>{" "}
            para {EMPRESA} · {ANIO}
          </p>
        </div>
      </div>
    </footer>
  );
}
