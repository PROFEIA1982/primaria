import { Link } from "react-router-dom";

export default function NoEncontradaPage() {
  return (
    <section className="ps-contenedor ps-seccion">
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté malo o que la página se haya movido de lugar.</p>
      <Link to="/" className="ps-boton">Volver al inicio</Link>
    </section>
  );
}
