import { MATERIAS, type SlugMateria } from "../config";

// Un solo componente para las cuatro materias. La materia entra por prop
// desde las rutas: asi no hay cuatro archivos casi iguales que despues
// se desincronizan cuando se cambia una sola cosa.
export default function PracticaPage({ materia }: { materia: SlugMateria }) {
  const datos = MATERIAS.find((m) => m.slug === materia);

  if (!datos) {
    return (
      <section className="ps-contenedor ps-seccion">
        <h1>Esa materia no existe</h1>
      </section>
    );
  }

  return (
    <section id="practica-materia" className="ps-contenedor ps-seccion">
      <h1>
        <span aria-hidden="true">{datos.emoji}</span> {datos.nombre}
      </h1>
      <p>Andamio de la Fase 2. El generador de prácticas llega en la Fase 4.</p>
    </section>
  );
}
