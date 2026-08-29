import { Link } from "react-router-dom";
import {
  CORREO,
  EMPRESA,
  SOPORTE_VISIBLE,
  TELEFONO_VISIBLE,
  URL_FACEBOOK,
  URL_IDONEA,
  URL_YOUTUBE,
  URL_YOUTUBE_ECOS,
  WA_SOPORTE,
  waLink,
} from "../config";
import "./Footer.css";

const ANIO = new Date().getFullYear();

export default function Footer() {
  return (
    <footer id="footer-principal">
      <div className="ps-contenedor footer-rejilla">
        <img
          className="footer-logo"
          src="/logo-concurso-docente.png"
          alt="Concurso Docente. Educar, inspirar, transformar."
          width={260}
          height={337}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />

        <div>
          <p className="footer-titulo">Práctica gratuita para sexto grado</p>
          <p>Ítems de pruebas estandarizadas de Costa Rica. Sin cuentas y sin costo.</p>

          <ul className="footer-enlaces">
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/anuncios">Para maestros y familias</Link></li>
          </ul>

          <p className="footer-docentes">
            <strong>¿Es usted docente?</strong> Hay un simulacro gratis de idoneidad
            esperándolo.{" "}
            <a href={URL_IDONEA} target="_blank" rel="noopener noreferrer">
              Probarlo en idonea.profeseguro.com →
            </a>
          </p>

          <ul className="footer-canales">
            <li>
              <a href={waLink("Hola, le escribo por la práctica de sexto grado.")} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">💬</span> WhatsApp {TELEFONO_VISIBLE}
              </a>
            </li>
            <li>
              <a href={waLink("Hola, tengo un problema técnico con la práctica de primaria.", WA_SOPORTE)} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">🛠️</span> Soporte técnico {SOPORTE_VISIBLE}
              </a>
            </li>
            <li>
              <a href={`mailto:${CORREO}`}>
                <span aria-hidden="true">✉️</span> {CORREO}
              </a>
            </li>
          </ul>

          <ul className="footer-canales" aria-label="Redes sociales">
            <li>
              <a href={URL_FACEBOOK} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">📘</span> Facebook
              </a>
            </li>
            <li>
              <a href={URL_YOUTUBE} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">▶️</span> YouTube · Idoneidad
              </a>
            </li>
            <li>
              <a href={URL_YOUTUBE_ECOS} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">▶️</span> YouTube · Ecos del Aprendizaje
              </a>
            </li>
          </ul>

          <div className="footer-legal">
            <p>
              Esta aplicación fue realizada por <strong>ProfeSeguro.com</strong> y{" "}
              <strong>EVI</strong>. Todos los derechos reservados.
            </p>
            <p>{EMPRESA} · {ANIO}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
