import { useEffect, useRef, useState } from "react";

/**
 * La barra del reloj se pega debajo del menu, que es fijo.
 *
 * Las dos alturas se miden en vez de escribirlas a mano: el menu crece
 * cuando se le da zoom o cuando los enlaces se acomodan en dos filas, y
 * la barra se parte en dos lineas en celular. Con numeros fijos, la
 * pregunta terminaba escondida debajo.
 */
export function useBarraPegada() {
  const barraRef = useRef<HTMLDivElement>(null);
  const [altoMenu, setAltoMenu] = useState(0);
  const [altoBarra, setAltoBarra] = useState(0);

  useEffect(() => {
    const menu = document.getElementById("nav-principal");
    const barra = barraRef.current;
    const medir = () => {
      if (menu) setAltoMenu(menu.getBoundingClientRect().height);
      if (barra) setAltoBarra(barra.getBoundingClientRect().height);
    };
    medir();
    const observador = new ResizeObserver(medir);
    if (menu) observador.observe(menu);
    if (barra) observador.observe(barra);
    return () => observador.disconnect();
  }, []);

  return { barraRef, altoMenu, altoBarra };
}

/**
 * Al cambiar de pregunta hay que hacer dos cosas: subir la pantalla al
 * arranque de la pregunta y llevar el foco ahi.
 *
 * Antes esto era solo un focus(), y no servia. El navegador desplaza al
 * enfocar UNICAMENTE cuando el elemento esta del todo fuera de vista, y
 * este contenedor es tan alto que siempre asoma por abajo: se daba por
 * satisfecho y no movia nada. Medido en celular de 360 px, el estudiante
 * caia con 128 px de la pregunta escondidos arriba, y peor conforme
 * avanzaba: despues de tres preguntas eran 338. O sea que empezaba a leer
 * a media tabla y tenia que subir a mano cada vez.
 *
 * Por eso el desplazamiento va explicito, y el foco despues con
 * preventScroll para que no pelee con el.
 */
export function useLlevarALaPregunta(indice: number) {
  const cuerpoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cuerpo = cuerpoRef.current;
    if (!cuerpo) return;
    // Dentro de un cuadro de animacion: al momento de correr el efecto el
    // enunciado todavia no termino de acomodarse, y una cuenta hecha antes
    // deja la pregunta mal parada. scrollIntoView la resuelve contra la
    // medida real y respeta el scrollMarginTop que calcula quien lo usa.
    const cuadro = requestAnimationFrame(() => {
      const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      cuerpo.scrollIntoView({ block: "start", behavior: quieto ? "auto" : "smooth" });
      cuerpo.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(cuadro);
  }, [indice]);

  return cuerpoRef;
}
