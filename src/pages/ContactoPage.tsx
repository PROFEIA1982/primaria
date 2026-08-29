import { useEffect, useState } from "react";
import { enviarContacto, registrarVisita, leerVisitas } from "../lib/api";
import { CORREO, SOPORTE_VISIBLE, TELEFONO_VISIBLE, WA_SOPORTE, waLink } from "../config";
import "./ContactoPage.css";

type Estado = "quieto" | "enviando" | "listo" | "error";

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState<Estado>("quieto");
  const [visitas, setVisitas] = useState<number | null>(null);

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

  async function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (estado === "enviando") return;
    setEstado("enviando");
    try {
      await enviarContacto({ nombre, correo, mensaje });
      setEstado("listo");
      setNombre(""); setCorreo(""); setMensaje("");
    } catch {
      setEstado("error");
    }
  }

  return (
    <section id="contacto-principal" className="ps-contenedor ps-seccion">
      <p className="contacto-kicker">Con gusto le ayudamos</p>
      <h1>Escríbanos</h1>
      <p className="contacto-intro">
        Escoja por dónde le queda más cómodo. Por WhatsApp contestamos rápido;
        por correo también, aunque tardamos un poco más.
      </p>

      <p className="contacto-aviso">
        <strong>¿Sos estudiante?</strong> Esta parte es para personas adultas. Si
        necesitás algo, pedile a tu mamá, a tu papá o a tu maestra que nos escriba.
      </p>

      <h2>Todos los canales</h2>
      <ul className="contacto-canales">
        <li>
          <a className="contacto-canal" href={waLink("Hola, le escribo por la práctica de sexto grado.")} target="_blank" rel="noopener noreferrer">
            <span className="canal-icono" aria-hidden="true">💬</span>
            <span>
              <span className="canal-nombre">WhatsApp</span>
              <span className="canal-dato">{TELEFONO_VISIBLE} · Escribir →</span>
            </span>
          </a>
        </li>
        <li>
          <a className="contacto-canal" href={waLink("Hola, tengo un problema técnico con la práctica de primaria.", WA_SOPORTE)} target="_blank" rel="noopener noreferrer">
            <span className="canal-icono" aria-hidden="true">🛠️</span>
            <span>
              <span className="canal-nombre">Soporte técnico</span>
              <span className="canal-dato">{SOPORTE_VISIBLE} · Escribir →</span>
            </span>
          </a>
        </li>
        <li>
          <a className="contacto-canal" href={`tel:${TELEFONO_VISIBLE.replace(/[^0-9+]/g, "")}`}>
            <span className="canal-icono" aria-hidden="true">📞</span>
            <span>
              <span className="canal-nombre">Teléfono</span>
              <span className="canal-dato">{TELEFONO_VISIBLE} · Llamar →</span>
            </span>
          </a>
        </li>
        <li>
          <a className="contacto-canal" href={`mailto:${CORREO}`}>
            <span className="canal-icono" aria-hidden="true">✉️</span>
            <span>
              <span className="canal-nombre">Correo</span>
              <span className="canal-dato">{CORREO} · Escribir →</span>
            </span>
          </a>
        </li>
      </ul>

      <h2>Mándenos un mensaje</h2>
      <p className="contacto-intro">
        Con el nombre y el mensaje alcanza. El correo lo pedimos solo si quiere
        que le respondamos por ahí. No pedimos cédula ni teléfono. A un menor de
        edad no le pedimos ningún dato.
      </p>

      <form className="contacto-forma" onSubmit={alEnviar}>
        <div className="campo">
          <label htmlFor="c-nombre">Nombre</label>
          <input
            id="c-nombre" name="nombre" type="text" required
            minLength={2} maxLength={80} autoComplete="name"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
          />
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

        <button type="submit" className="ps-boton" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar mensaje"}
        </button>

        {estado === "listo" && (
          <p className="ps-estado" role="status">
            <strong>✓ Listo. </strong>Su mensaje llegó. Le respondemos apenas podamos.
          </p>
        )}
        {estado === "error" && (
          <p className="ps-estado ps-estado--error" role="alert">
            <strong>✗ </strong>No se pudo enviar. Revise su conexión y pruebe de
            nuevo, o escríbanos por WhatsApp.
          </p>
        )}
      </form>

      {visitas !== null && (
        <p className="contacto-visitas">
          {visitas.toLocaleString("es-CR")} personas han entrado a practicar.
        </p>
      )}
    </section>
  );
}
