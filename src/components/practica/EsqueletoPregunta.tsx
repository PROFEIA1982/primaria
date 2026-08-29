// Esqueleto con la forma de una pregunta: un bloque largo arriba y cuatro
// cortos abajo. Se prefiere a una rueda girando porque le dice al ojo que
// va a aparecer ahi mismo y la pagina no da el brinco al cargar.
export default function EsqueletoPregunta() {
  return (
    <div className="practica-esqueleto" role="status" aria-live="polite">
      <span className="ps-solo-lectores">Preparando las preguntas…</span>
      <div className="esq-enunciado" aria-hidden="true" />
      <div className="esq-opciones" aria-hidden="true">
        <div className="esq-opcion" />
        <div className="esq-opcion" />
        <div className="esq-opcion" />
        <div className="esq-opcion" />
      </div>
    </div>
  );
}
