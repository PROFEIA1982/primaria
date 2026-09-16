// ============================================================
// Piezas del rincón que se usan en varias pantallas:
//   · Mochila: el contador de estrellas de la cabecera (y de la barra del
//     examen). Late cuando entra una estrella.
//   · NuevoAmigo: la celebración cuando llega un amigo. Vive en App, así
//     salta en cualquier pantalla (práctica, simulacro, resultados).
//   · Companero: la tarjeta del inicio con el amigo elegido y el progreso.
//   · Comunidad: los tres números grandes de toda la comunidad.
//   · BotonCompartir: comparte estrellas y amigos por WhatsApp o el menú
//     nativo del celular. No manda nada a ningún servidor nuestro.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { Estrella, Mascota } from "./Amigos";
import {
  POR_AMIGO, amigoDe, celebracionVista, leerComunidad, progreso,
  useComunidad, useRincon,
} from "../lib/rincon";
import "./Rincon.css";

// Números con espacio fino de millar, como se escriben en Costa Rica.
export function num(n: number): string {
  return new Intl.NumberFormat("es-CR").format(n).replace(/\./g, " ");
}

export function Mochila({ compacta = false }: { compacta?: boolean }) {
  const { estrellas } = useRincon();
  const [late, setLate] = useState(false);
  const previo = useRef(estrellas);
  useEffect(() => {
    if (estrellas > previo.current) {
      setLate(true);
      const t = setTimeout(() => setLate(false), 600);
      previo.current = estrellas;
      return () => clearTimeout(t);
    }
    previo.current = estrellas;
  }, [estrellas]);
  return (
    <Link
      to="/rincon"
      data-mochila=""
      className="mochila"
      data-late={late ? "" : undefined}
      data-compacta={compacta ? "" : undefined}
      aria-label={`Mi rincón: ${estrellas} ${estrellas === 1 ? "estrella" : "estrellas"}`}
    >
      <Estrella size={compacta ? 22 : 26} />
      <span className="mochila-n">{num(estrellas)}</span>
    </Link>
  );
}

/**
 * Manda una estrella volando desde un elemento (la opción correcta) hasta
 * la mochila de la cabecera. Es puro adorno: si algo falta, no hace nada.
 */
export function volarEstrella(desde: Element | null): void {
  // Durante un frame pueden existir dos mochilas (la del menu y la de la
  // barra del examen): se toma la ultima, que es la visible en el examen.
  const todas = document.querySelectorAll("[data-mochila]");
  const mochila = todas[todas.length - 1] ?? null;
  if (!desde || !mochila) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const a = desde.getBoundingClientRect();
  const b = mochila.getBoundingClientRect();
  const s = document.createElement("div");
  s.className = "estrella-vuela";
  s.setAttribute("aria-hidden", "true");
  s.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24"><use href="#s-estrella"/></svg>';
  s.style.left = `${a.left + 20}px`;
  s.style.top = `${a.top + 10}px`;
  s.style.setProperty("--dx", `${b.left + b.width / 2 - 17 - (a.left + 20)}px`);
  s.style.setProperty("--dy", `${b.top + b.height / 2 - 17 - (a.top + 10)}px`);
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 850);
}

// Confeti sencillo: cuarenta pedacitos que caen. Solo transform y opacity,
// y se apaga con prefers-reduced-motion desde el CSS.
function Confeti() {
  const colores = ["#FFB020", "#17A673", "#EE4F2F", "#6F3DF0", "#2457F5"];
  return (
    <div className="confeti" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: colores[i % colores.length],
            animationDelay: `${(i % 7) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

export function NuevoAmigo() {
  const { porCelebrar } = useRincon();
  const botonRef = useRef<HTMLButtonElement>(null);
  const previoRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!porCelebrar) return;
    // Modal de verdad: foco adentro, Escape cierra, Tab no se escapa (solo
    // hay un control) y al cerrar el foco vuelve a donde estaba.
    previoRef.current = document.activeElement as HTMLElement | null;
    botonRef.current?.focus();
    const alTeclear = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") celebracionVista();
      if (ev.key === "Tab") { ev.preventDefault(); botonRef.current?.focus(); }
    };
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      previoRef.current?.focus?.();
    };
  }, [porCelebrar]);
  if (!porCelebrar) return null;
  const amigo = amigoDe(porCelebrar);
  return (
    <div className="amigo-velo" role="dialog" aria-modal="true" aria-labelledby="amigo-titulo" aria-describedby="amigo-texto">
      <Confeti />
      <div className="amigo-modal">
        <Mascota id={amigo.id} size={170} />
        <h2 id="amigo-titulo">¡Nuevo amigo!</h2>
        <p id="amigo-texto">
          <strong>{amigo.nombre}</strong> se une a tu rincón. {amigo.frase}
        </p>
        <button type="button" className="ps-boton amigo-ok" ref={botonRef} onClick={celebracionVista}>
          ¡Genial!
        </button>
      </div>
    </div>
  );
}

export function BarraAmigo() {
  const e = useRincon();
  const p = progreso(e);
  return (
    <>
      <div className="rincon-barra" aria-hidden="true">
        <i style={{ width: `${p.porcentaje}%` }} />
      </div>
      <div className="rincon-barra-leyenda">
        <span>{p.completa ? "¡Colección completa!" : `Faltan ${p.faltan} estrellas para el próximo amigo`}</span>
        <span>{num(e.estrellas)} en total</span>
      </div>
    </>
  );
}

export function Companero() {
  const e = useRincon();
  const amigo = amigoDe(e.elegido);
  const p = progreso(e);
  return (
    <div className="companero">
      <Mascota id={amigo.id} size={140} className="companero-mascota" />
      <div>
        <h3 className="companero-nombre">{amigo.nombre}</h3>
        <p className="companero-estado">
          {p.completa
            ? "Ya tenés a todos los amigos del bosque. Eso es de campeón."
            : `${amigo.frase} Cada ${POR_AMIGO} estrellas llega un amigo nuevo.`}
        </p>
        <BarraAmigo />
      </div>
      <Link to="/rincon" className="ps-boton ps-boton-borde companero-ir">Ver mi rincón</Link>
    </div>
  );
}

export function Comunidad() {
  const c = useComunidad();
  // Una sola lectura por montaje (StrictMode corre el efecto dos veces), y
  // si falla se deja reintentar en el siguiente montaje.
  const pedidoRef = useRef(false);
  useEffect(() => {
    if (c || pedidoRef.current) return;
    pedidoRef.current = true;
    void leerComunidad().then((r) => { if (!r) pedidoRef.current = false; });
  }, [c]);
  return (
    <div className="comunidad" aria-label="Lo que llevamos entre todos">
      <div className="comunidad-dato comunidad-principal">
        <b>{c ? num(c.preguntas) : "…"}</b>
        <span>preguntas resueltas por chiquillos de todo el país</span>
      </div>
      <div className="comunidad-dato">
        <Estrella size={30} />
        <b>{c ? num(c.estrellas) : "…"}</b>
        <span>estrellas ganadas entre todos</span>
      </div>
      <div className="comunidad-dato">
        <Mascota id="tucan" size={34} />
        <b>{c ? num(c.amigos) : "…"}</b>
        <span>amigos del bosque adoptados</span>
      </div>
    </div>
  );
}

function textoParaCompartir(estrellas: number, amigos: number, elegido: string): string {
  const a = amigoDe(elegido);
  return `Ya tengo ${estrellas} ${estrellas === 1 ? "estrella" : "estrellas"} y ${amigos} ${amigos === 1 ? "amigo" : "amigos"} del bosque en Practicá Sexto. Me acompaña ${a.nombre}. Es un desafío de ProfeSeguro.com y EVI para los niños y niñas de Costa Rica. Practicá vos también, es gratis: https://primaria.profeseguro.com`;
}

export function BotonCompartir({ className = "" }: { className?: string }) {
  const e = useRincon();
  const [aviso, setAviso] = useState("");
  const texto = textoParaCompartir(e.estrellas, e.amigos, e.elegido);
  const wa = `https://wa.me/?text=${encodeURIComponent(texto)}`;

  const compartir = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: texto });
        return;
      }
      await navigator.clipboard.writeText(texto);
      setAviso("Texto copiado. Pegalo en WhatsApp, Facebook o donde querás.");
    } catch {
      // Canceló o el navegador no deja: no pasa nada.
    }
  };

  return (
    <div className={`compartir ${className}`}>
      <button type="button" className="ps-boton compartir-boton" onClick={compartir}>
        <Share2 size={20} strokeWidth={2.2} aria-hidden="true" />
        Compartir mis estrellas
      </button>
      <a className="ps-boton ps-boton-borde" href={wa} target="_blank" rel="noopener noreferrer">
        Por WhatsApp
      </a>
      {aviso && <p className="compartir-aviso" role="status">{aviso}</p>}
    </div>
  );
}
