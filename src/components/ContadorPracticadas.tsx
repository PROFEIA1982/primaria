import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { traerPracticadas } from "../lib/api";
import "./ContadorPracticadas.css";

// El contador de la portada: cuantas preguntas se han contestado en todo el
// sitio. Se lee de la base en cada carga, asi que siempre esta al dia sin
// depender de ninguna tarea programada que se pueda caer sin avisar.
//
// Por que este numero y no el de visitas: el de visitas existe (vive en la
// pagina de contacto) pero va muy abajo todavia, y un contador pobre en la
// portada espanta en vez de atraer. Las preguntas practicadas suben cada vez
// que alguien termina una practica, no cada vez que alguien pasa de largo.
//
// Si la consulta falla, el bloque NO se dibuja. Un cero grande en la portada
// miente peor que no poner nada.

const MINIMO = 25; // debajo de esto el numero no luce; mejor callado

// Cuenta de cero hasta el total en un segundo escaso. Es puro texto, no hay
// layout que recalcular. Se apaga con prefers-reduced-motion, y ahi el numero
// aparece de una.
function useConteoAnimado(total: number | null): number {
  const [valor, setValor] = useState(0);
  const cuadro = useRef<number | null>(null);

  useEffect(() => {
    if (total === null) return;

    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (quieto) { setValor(total); return; }

    const DURACION = 900;
    const arranque = performance.now();

    const paso = (ahora: number) => {
      const t = Math.min((ahora - arranque) / DURACION, 1);
      // easeOutCubic: arranca rapido y frena al final, que es como se siente
      // natural un contador subiendo
      const suave = 1 - Math.pow(1 - t, 3);
      setValor(Math.round(total * suave));
      if (t < 1) cuadro.current = requestAnimationFrame(paso);
    };
    cuadro.current = requestAnimationFrame(paso);

    return () => { if (cuadro.current !== null) cancelAnimationFrame(cuadro.current); };
  }, [total]);

  return valor;
}

export default function ContadorPracticadas() {
  const [total, setTotal] = useState<number | null>(null);
  const animado = useConteoAnimado(total);

  useEffect(() => {
    let vivo = true;
    void traerPracticadas().then((n) => { if (vivo) setTotal(n); });
    return () => { vivo = false; };
  }, []);

  // Nada que presumir todavia: el bloque no existe.
  if (total === null || total < MINIMO) return null;

  // Punto para los miles: 1.487, como se escribe en Costa Rica. A mano y no
  // con toLocaleString("es-CR") porque el ICU de cada navegador no coincide:
  // Chromium devuelve "1 487" con un espacio fino que aca se lee raro.
  const bonito = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <section id="inicio-contador" aria-labelledby="contador-titulo">
      <div className="ps-contenedor contador-caja">
        <span className="contador-icono" aria-hidden="true">
          <TrendingUp size={26} strokeWidth={2} />
        </span>

        <p className="contador-dato">
          {/* El numero que se ve va animado y oculto para lectores de
              pantalla: si no, cantarian cada valor intermedio. El texto real
              y completo va en el span de al lado, que solo ellos leen. */}
          <span className="contador-numero" aria-hidden="true">{bonito(animado)}</span>
          <span className="ps-solo-lectores">
            {bonito(total)} preguntas ya practicadas en este sitio.
          </span>
          <span className="contador-rotulo" aria-hidden="true" id="contador-titulo">
            preguntas ya practicadas
          </span>
        </p>

        <p className="contador-fino">
          Cada vez que alguien contesta, este número sube.
        </p>
      </div>
    </section>
  );
}
