import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  Bug,
  Handshake,
  Lightbulb,
  LifeBuoy,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  Send,
} from "lucide-react";
import { enviarContacto, registrarVisita, leerVisitas } from "../lib/api";
import { CORREO, SOPORTE_VISIBLE, TELEFONO_VISIBLE, WA_SOPORTE, waLink } from "../config";
import BloqueDocentes from "../components/BloqueDocentes";
import "./ContactoPage.css";

// El texto que viaja en el mensaje de WhatsApp es el mismo que la persona
// leyo en la lista: si alla llega "Reportar un error" y aca decia otra cosa,
// quien contesta no sabe de que le hablan.
const TIPOS = [
  { valor: "duda", etiqueta: "Tengo una duda" },
  { valor: "consulta", etiqueta: "Quiero hacer una consulta" },
  { valor: "error", etiqueta: "Quiero reportar un error" },
  { valor: "mejora", etiqueta: "Quiero proponer una mejora" },
  { valor: "participar", etiqueta: "Quiero participar en el proyecto" },
] as const;

type ValorTipo = (typeof TIPOS)[number]["valor"];

const CANALES = [
  {
    id: "whatsapp",
    icono: MessageCircle,
    nombre: "WhatsApp",
    dato: TELEFONO_VISIBLE,
    accion: "Escribir",
    href: waLink("Hola, le escribo desde la práctica de sexto grado."),
    externo: true,
  },
  {
    id: "soporte",
    icono: LifeBuoy,
    nombre: "Soporte técnico",
    dato: SOPORTE_VISIBLE,
    accion: "Reportar una falla",
    href: waLink("Hola, tengo un problema técnico con la práctica de primaria.", WA_SOPORTE),
    externo: true,
  },
  {
    id: "telefono",
    icono: Phone,
    nombre: "Teléfono",
    dato: TELEFONO_VISIBLE,
    accion: "Llamar",
    href: `tel:${TELEFONO_VISIBLE.replace(/[^0-9+]/g, "")}`,
    externo: false,
  },
  {
    id: "correo",
    icono: Mail,
    nombre: "Correo",
    dato: CORREO,
    accion: "Escribir correo",
    href: `mailto:${CORREO}`,
    externo: false,
  },
] as const;

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<ValorTipo>("duda");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  // Se guarda el enlace armado para dejarlo a la vista: si el navegador
  // bloquea la pestana nueva, la persona todavia tiene por donde entrar.
  const [enlaceWa, setEnlaceWa] = useState<string | null>(null);
  const [visitas, setVisitas] = useState<number | null>(null);
  const confirmacion = useRef<HTMLParagraphElement | null>(null);
  const ubicacion = useLocation();

  // Quien llega desde la ruta vieja /anuncios viene a ver el aviso para
  // docentes, no el formulario: se le baja hasta el bloque y se le pone
  // el foco ahi, para que tambien lo note quien navega con teclado.
  useEffect(() => {
    const estado = ubicacion.state as { irA?: string } | null;
    if (!estado?.irA) return;
    const destino = document.getElementById(estado.irA);
    if (!destino) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
    destino.setAttribute("tabindex", "-1");
    destino.focus({ preventScroll: true });
  }, [ubicacion.state]);

  // La visita se cuenta una sola vez por sesion del navegador.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const sumada = await registrarVisita();
      const total = sumada ?? (await leerVisitas());
      if (vivo) setVisitas(total);
    })();
    return () => { vivo = false; };
  }, []);

  // Arma el mensaje con saltos de linea de verdad. encodeURIComponent los
  // convierte en %0A y WhatsApp los vuelve a mostrar como renglones aparte;
  // si se usara "\\n" literal llegaria esa basura escrita en el chat.
  function armarMensaje(): string {
    const etiqueta = TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? "";
    const lineas = [
      "Hola, le escribo desde la práctica de sexto grado.",
      "",
      `Nombre: ${nombre.trim()}`,
      `Tipo: ${etiqueta}`,
    ];
    if (correo.trim()) lineas.push(`Correo: ${correo.trim()}`);
    lineas.push(`Mensaje: ${mensaje.trim()}`);
    return lineas.join("\n");
  }

  function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    const enlace = waLink(armarMensaje());

    // El guardado en la base sale de primero pero sin esperar la respuesta.
    // Si se hiciera await, el window.open caeria fuera del clic y el
    // navegador lo tomaria como ventana emergente y lo bloquearia. Que
    // Supabase falle no puede dejar a la persona sin escribir.
    const etiqueta = TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? "";
    void enviarContacto({
      nombre,
      correo: correo || null,
      mensaje: `[${etiqueta}] ${mensaje}`,
    }).catch(() => {});

    window.open(enlace, "_blank", "noopener,noreferrer");
    setEnlaceWa(enlace);
  }

  // El aviso de "listo" aparece despues del boton: sin mover el foco, quien
  // usa lector de pantalla se queda sin saber que paso.
  useEffect(() => {
    if (enlaceWa) confirmacion.current?.focus();
  }, [enlaceWa]);

  return (
    <>
      {/* 1 · Hero: sin foto. El color, la trama de puntos y el icono grande
          cargan el peso visual, y asi no hay una imagen mas que bajar. */}
      <section id="contacto-hero" aria-labelledby="contacto-hero-titulo">
        <div className="ps-contenedor hero-caja">
          <span className="hero-icono" aria-hidden="true">
            <MessagesSquare size={44} strokeWidth={1.6} />
          </span>
          <p className="hero-kicker">Con gusto le ayudamos</p>
          <h1 id="contacto-hero-titulo">Escríbanos</h1>
          <p className="hero-bajada">
            Escoja el canal que le quede más cómodo. Por WhatsApp contestamos rápido.
          </p>
        </div>
      </section>

      <section id="contacto-principal" className="ps-contenedor ps-seccion">
        <p className="contacto-aviso">
          <strong>¿Sos estudiante?</strong> Esta parte es para personas adultas. Si
          necesitás algo, pedile a tu mamá, a tu papá o a tu maestra que nos escriba.
        </p>

        <h2 id="contacto-canales-titulo">Todos los canales</h2>
        <ul className="contacto-canales" aria-labelledby="contacto-canales-titulo">
          {CANALES.map((c) => {
            const Icono = c.icono;
            return (
              <li key={c.id}>
                <a
                  className="canal"
                  data-canal={c.id}
                  href={c.href}
                  {...(c.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span className="canal-chip" aria-hidden="true">
                    <Icono size={26} strokeWidth={1.9} />
                  </span>
                  <span className="canal-nombre">{c.nombre}</span>
                  <span className="canal-dato">{c.dato}</span>
                  <span className="canal-accion">
                    {c.accion}
                    <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                    {c.externo && (
                      <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <h2 id="contacto-forma-titulo">Mándenos un mensaje</h2>
        <p className="contacto-intro">
          Llene los tres campos y el mensaje se le abre ya escrito en WhatsApp.
          Solo le da <strong>Enviar</strong> allá y nos llega.
        </p>

        <div className="contacto-doble">
          <form
            className="contacto-forma"
            onSubmit={alEnviar}
            aria-labelledby="contacto-forma-titulo"
          >
            <div className="campo">
              <label htmlFor="c-nombre">Nombre</label>
              <input
                id="c-nombre" name="nombre" type="text" required
                minLength={2} maxLength={80} autoComplete="name"
                value={nombre} onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="c-tipo">¿De qué nos quiere hablar?</label>
              <select
                id="c-tipo" name="tipo" required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ValorTipo)}
              >
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="c-correo">
                Correo electrónico <span className="campo-nota">(opcional)</span>
              </label>
              <input
                id="c-correo" name="correo" type="email" maxLength={120} autoComplete="email"
                value={correo} onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="c-mensaje">Mensaje</label>
              <textarea
                id="c-mensaje" name="mensaje" required minLength={5} maxLength={2000}
                aria-describedby="c-mensaje-cuenta"
                value={mensaje} onChange={(e) => setMensaje(e.target.value)}
              />
              <span className="campo-nota" id="c-mensaje-cuenta">{mensaje.length} / 2000</span>
            </div>

            <button type="submit" className="ps-boton forma-boton">
              <Send size={20} strokeWidth={2} aria-hidden="true" />
              Abrir WhatsApp con mi mensaje
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </button>

            <p className="forma-nota">
              No pedimos cédula, ni teléfono, ni fecha de nacimiento.
              <strong> A un menor de edad no le pedimos ningún dato.</strong>
            </p>

            {enlaceWa && (
              <p
                className="ps-estado forma-listo"
                role="status"
                tabIndex={-1}
                ref={confirmacion}
              >
                <strong>Listo.</strong> Le abrimos WhatsApp con el mensaje ya
                escrito. Si no se abrió solo,{" "}
                <a href={enlaceWa} target="_blank" rel="noopener noreferrer">
                  toque aquí para abrirlo
                  <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
                </a>.
              </p>
            )}
          </form>

          {/* La invitacion a proponer mejoras va al lado del formulario y no
              enterrada en un parrafo: es lo que el cliente mas quiere recibir. */}
          <aside className="contacto-invita" aria-label="Qué más nos puede escribir">
            <h3>¿Se le ocurre algo para mejorar?</h3>
            <ul>
              <li>
                <Lightbulb size={20} strokeWidth={1.9} aria-hidden="true" />
                <span>
                  <strong>Una mejora.</strong> Si encontró algo que se le pueda
                  mejorar a la aplicación, escríbalo en el mensaje y nos llega
                  por WhatsApp.
                </span>
              </li>
              <li>
                <Handshake size={20} strokeWidth={1.9} aria-hidden="true" />
                <span>
                  <strong>Participar en el proyecto.</strong> Si quiere ayudar
                  —haciendo preguntas, revisando materia o corrigiendo— escoja
                  esa opción y cuéntenos en qué le gustaría meterle mano.
                </span>
              </li>
              <li>
                <Bug size={20} strokeWidth={1.9} aria-hidden="true" />
                <span>
                  <strong>Un error.</strong> Si una pregunta salió mala o algo no
                  cargó, dígalo con la materia y lo que vio en pantalla.
                </span>
              </li>
            </ul>
          </aside>
        </div>

        {visitas !== null && (
          <p className="contacto-visitas">
            {visitas.toLocaleString("es-CR")} personas han entrado a practicar.
          </p>
        )}
      </section>

      <BloqueDocentes />
    </>
  );
}
