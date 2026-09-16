import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mascota } from "../components/Amigos";
import { BarraAmigo, BotonCompartir, num } from "../components/Rincon";
import {
  AMIGOS, POR_AMIGO, amigoDe, elegirAmigo, reiniciarRincon, useRincon,
} from "../lib/rincon";
import Fondo from "../components/Fondo";
import "./RinconPage.css";

// Mi rincón: las estrellas del estudiante y sus amigos del bosque. Todo lo
// que se ve aquí vive en este aparato; no hay cuenta ni nombre detrás.
export default function RinconPage() {
  const e = useRincon();
  const elegido = amigoDe(e.elegido);
  const [confirmando, setConfirmando] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  return (
    <section id="rincon" className="ps-contenedor ps-seccion">
      <Fondo tipo="ciencias" />
      <div className="rincon-col">
        <div className="rincon-cabecera">
          <Mascota id={elegido.id} size={170} className="rincon-mascota" alt={`Tu compañero: ${elegido.nombre}`} />
          <div>
            <h1 tabIndex={-1} ref={tituloRef}>Mi rincón</h1>
            <p className="rincon-bajada">
              Acá viven tus estrellas y tus amigos del bosque. Cada acierto en una práctica o
              un simulacro suma una estrella; cada {POR_AMIGO} estrellas llega un amigo nuevo.
            </p>
            <BarraAmigo />
            <BotonCompartir className="rincon-compartir" />
          </div>
        </div>

        <h2 className="rincon-titulo">Amigos del bosque</h2>
        <ul className="rincon-amigos">
          {AMIGOS.map((a, i) => {
            const libre = i < e.amigos;
            const esElegido = a.id === e.elegido;
            return (
              <li
                key={a.id}
                className="rincon-amigo"
                data-bloqueado={libre ? undefined : ""}
                data-elegido={esElegido ? "" : undefined}
              >
                <Mascota id={a.id} size={96} />
                <b>{libre ? a.nombre : "¿Quién será?"}</b>
                <small>
                  {libre
                    ? esElegido ? "Te acompaña ahora" : a.frase
                    : `Llega con ${num(i * POR_AMIGO)} estrellas`}
                </small>
                {libre && !esElegido && (
                  <button type="button" className="ps-boton ps-boton-borde rincon-elegir" onClick={() => elegirAmigo(a.id)}>
                    Elegir
                  </button>
                )}
                {esElegido && <span className="rincon-chip">Tu compañero</span>}
              </li>
            );
          })}
        </ul>

        <p className="rincon-nota">
          Todo se guarda en este aparato, sin cuentas ni nombres. Si cambiás de computadora o de
          celular, las estrellas se quedan en el otro. Para seguir ganando,{" "}
          <Link to="/">elegí una materia</Link>.
        </p>

        <div className="rincon-reinicio">
          {confirmando ? (
            <div role="group" aria-label="Confirmar el reinicio" className="rincon-confirmar">
              <p>¿Seguro? Se borran tus {num(e.estrellas)} estrellas y tus amigos de este aparato. No se puede deshacer.</p>
              <div className="rincon-confirmar-botones">
                <button type="button" className="ps-boton" onClick={() => setConfirmando(false)}>Mejor no</button>
                <button type="button" className="rincon-borrar" onClick={() => {
                    reiniciarRincon();
                    setConfirmando(false);
                    // El bloque de confirmar desaparece: el foco va al titulo
                    // para que quien usa teclado no caiga al vacio.
                    requestAnimationFrame(() => tituloRef.current?.focus());
                  }}>
                  Sí, empezar de cero
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="rincon-reiniciar" onClick={() => setConfirmando(true)}>
              Empezar de cero
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
