// ============================================================
// Fondo alusivo a la materia: un patrón suave que se mueve despacio
// detrás de las pantallas de MENÚ (inicio, escoger práctica, lista de
// simulacros, rincón). Nunca detrás de un ítem: ahí manda la evidencia de
// que el adorno estorba (Sundararajan y Adesope 2020), y por eso las
// pantallas de examen no lo montan.
//
// Es un div fijo con un SVG en data-URI; pesa nada y no pide red. Se apaga
// con prefers-reduced-motion y en escala de grises queda gris, como todo.
// ============================================================

import "./Fondo.css";

export type TipoFondo = "confeti" | "espanol" | "estudios-sociales" | "ciencias" | "matematicas";

export default function Fondo({ tipo }: { tipo: TipoFondo }) {
  return <div className="fondo" data-tipo={tipo} aria-hidden="true" />;
}
