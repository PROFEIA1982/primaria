import { Link } from "react-router-dom";
import { CirclePlay, Mail, MessageCircle, Phone, Users } from "lucide-react";
import {
  CORREO,
  EMPRESA,
  IMG_LOGO_CONCURSO,
  SOPORTE_VISIBLE,
  TELEFONO_VISIBLE,
  URL_FACEBOOK,
  URL_IDONEA,
  URL_PROFESEGURO,
  URL_YOUTUBE,
  URL_YOUTUBE_ECOS,
  WA_SOPORTE,
  waLink,
} from "../config";
import "./Footer.css";

const ANIO = new Date().getFullYear();

// Pie del sitio. Tres columnas en escritorio, una en celular, y una franja
// legal abajo. Los iconos son de trazo, no emoji: un emoji se ve distinto
// en cada aparato y en algunos lectores de pantalla se lee entero.
export default function Footer() {
  return (
    <footer id="footer-principal">
      <div className="ps-contenedor footer-rejilla">
        <div className="footer-columna footer-marca">
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
          <p className="footer-titulo">Práctica gratuita para sexto grado</p>
          <p className="footer-descripcion">
            Preguntas al estilo de las pruebas estandarizadas de Costa Rica. Sin
            cuentas, sin costo y sin datos personales.
          </p>
        </div>

        <nav className="footer-columna" aria-labelledby="footer-nav-titulo">
          <h2 id="footer-nav-titulo" className="footer-encabezado">El sitio</h2>
          <ul className="footer-lista">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/espanol">Español</Link></li>
            <li><Link to="/estudios-sociales">Estudios Sociales</Link></li>
            <li><Link to="/ciencias">Ciencias</Link></li>
            <li><Link to="/matematicas">Matemáticas</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </nav>

        <div className="footer-columna">
          <h2 className="footer-encabezado">Contacto</h2>
          <ul className="footer-lista footer-canales">
            <li>
              <a href={waLink("Hola, le escribo por la práctica de sexto grado.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
                WhatsApp {TELEFONO_VISIBLE}
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <a href={waLink("Hola, tengo un problema técnico con la práctica de primaria.", WA_SOPORTE)} target="_blank" rel="noopener noreferrer">
                <Phone size={18} strokeWidth={2} aria-hidden="true" />
                Soporte técnico {SOPORTE_VISIBLE}
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

          <h2 className="footer-encabezado footer-encabezado-2">Redes</h2>
          <ul className="footer-lista footer-canales">
            <li>
              <a href={URL_FACEBOOK} target="_blank" rel="noopener noreferrer">
                <Users size={18} strokeWidth={2} aria-hidden="true" />
                Facebook
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <a href={URL_YOUTUBE} target="_blank" rel="noopener noreferrer">
                <CirclePlay size={18} strokeWidth={2} aria-hidden="true" />
                YouTube · Idoneidad
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <a href={URL_YOUTUBE_ECOS} target="_blank" rel="noopener noreferrer">
                <CirclePlay size={18} strokeWidth={2} aria-hidden="true" />
                YouTube · Ecos del Aprendizaje
                <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-legal">
        <div className="ps-contenedor footer-legal-caja">
          <p>
            Esta aplicación fue realizada por{" "}
            <a href={URL_PROFESEGURO} target="_blank" rel="noopener noreferrer">ProfeSeguro.com<span className="ps-solo-lectores"> (se abre en otra pestaña)</span></a>{" "}
            y <strong>EVI</strong>. Todos los derechos reservados.
          </p>
          <p className="footer-empresa">
            {EMPRESA} · {ANIO} ·{" "}
            <a href={URL_IDONEA} target="_blank" rel="noopener noreferrer">
              Preparación de idoneidad docente
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
