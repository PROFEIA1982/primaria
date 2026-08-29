import type { ReactNode } from "react";

// Los tres estados que lleva todo componente que carga datos:
// cargando, error y vacio. Sin excepcion.

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div className="ps-estado" role="status" aria-live="polite">
      <span className="ps-estado-punto" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function ErrorCarga({
  mensaje = "No pudimos cargar esto.",
  alReintentar,
}: {
  mensaje?: string;
  alReintentar?: () => void;
}) {
  return (
    <div className="ps-estado ps-estado--error" role="alert">
      <p><strong>Uy. </strong>{mensaje} Revisá tu conexión y probá de nuevo.</p>
      {alReintentar && (
        <button type="button" className="ps-boton" onClick={alReintentar}>
          Probar otra vez
        </button>
      )}
    </div>
  );
}

export function Vacio({ mensaje, accion }: { mensaje: string; accion?: ReactNode }) {
  return (
    <div className="ps-estado">
      <p>{mensaje}</p>
      {accion}
    </div>
  );
}
