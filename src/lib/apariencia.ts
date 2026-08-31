import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================
// Tema (claro/oscuro) y modo de mejor vision. Los dos viven en el
// atributo del <html> y los pinta index.css; aca solo se decide cual va
// y se guarda la eleccion.
//
// El sitio esta desplegado de verdad, asi que localStorage sirve. Aun
// asi todo va en try/catch: en modo privado de algunos navegadores
// leerlo tira excepcion y no hay por que tumbar la pagina por eso.
// ============================================================

export type Tema = "claro" | "oscuro";
export type Vision = "normal" | "alto";
// Tamano del texto de toda la web. Tres pasos, no un interruptor: un chiquito
// que ve poco no necesita lo mismo que uno que ve bien pero lee mejor con
// letra grande. "normal" no pone atributo; los otros dos escalan el font-size
// del <html> en index.css, asi crece todo lo que esta en rem de una sola vez.
export type Texto = "normal" | "grande" | "extra";
const ORDEN_TEXTO: Texto[] = ["normal", "grande", "extra"];

const LLAVE_TEMA = "ps-tema";
const LLAVE_VISION = "ps-vision";
const LLAVE_TEXTO = "ps-texto";

function leer(llave: string): string | null {
  try {
    return window.localStorage.getItem(llave);
  } catch {
    return null;
  }
}

function guardar(llave: string, valor: string): void {
  try {
    window.localStorage.setItem(llave, valor);
  } catch {
    // Sin memoria: la eleccion vale para esta visita y ya. No es motivo
    // para romperle la pagina a nadie.
  }
}

// El script de index.html ya dejo el atributo puesto antes de que React
// pintara. Se lee de ahi primero para que el boton no arranque diciendo
// lo contrario de lo que se ve.
function temaInicial(): Tema {
  const puesto = document.documentElement.getAttribute("data-tema");
  if (puesto === "claro" || puesto === "oscuro") return puesto;
  const guardado = leer(LLAVE_TEMA);
  if (guardado === "claro" || guardado === "oscuro") return guardado;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
  } catch {
    return "claro";
  }
}

function visionInicial(): Vision {
  if (document.documentElement.getAttribute("data-vision") === "alto") return "alto";
  return leer(LLAVE_VISION) === "alto" ? "alto" : "normal";
}

function esTexto(v: string | null): v is Texto {
  return v === "normal" || v === "grande" || v === "extra";
}

function textoInicial(): Texto {
  const puesto = document.documentElement.getAttribute("data-texto");
  if (esTexto(puesto)) return puesto;
  const guardado = leer(LLAVE_TEXTO);
  return esTexto(guardado) ? guardado : "normal";
}

export type Apariencia = {
  tema: Tema;
  vision: Vision;
  texto: Texto;
  alternarTema: () => void;
  alternarVision: () => void;
  ciclarTexto: () => void;
};

// Un solo consumidor (el menu) para que no haya dos estados peleandose.
export function useApariencia(): Apariencia {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const [vision, setVision] = useState<Vision>(visionInicial);
  const [texto, setTexto] = useState<Texto>(textoInicial);

  // En la primera pasada no se escribe nada si el visitante nunca eligio:
  // sin atributo manda el prefers-color-scheme del CSS y el sitio sigue al
  // sistema en vivo. Guardar ahi seria decidir por el.
  const primeraTema = useRef(true);
  useEffect(() => {
    if (primeraTema.current) {
      primeraTema.current = false;
      if (!document.documentElement.hasAttribute("data-tema")) return;
    }
    document.documentElement.setAttribute("data-tema", tema);
    guardar(LLAVE_TEMA, tema);
  }, [tema]);

  const primeraVision = useRef(true);
  useEffect(() => {
    if (primeraVision.current) {
      primeraVision.current = false;
      if (!document.documentElement.hasAttribute("data-vision")) return;
    }
    document.documentElement.setAttribute("data-vision", vision);
    guardar(LLAVE_VISION, vision);
  }, [vision]);

  // "normal" no deja atributo puesto: asi la web arranca en su tamano de
  // siempre y solo se marca cuando el visitante pide letra mas grande. En la
  // primera pasada, si no hay eleccion previa, no se escribe nada.
  const primeraTexto = useRef(true);
  useEffect(() => {
    if (primeraTexto.current) {
      primeraTexto.current = false;
      if (!document.documentElement.hasAttribute("data-texto") && texto === "normal") return;
    }
    if (texto === "normal") {
      document.documentElement.removeAttribute("data-texto");
    } else {
      document.documentElement.setAttribute("data-texto", texto);
    }
    guardar(LLAVE_TEXTO, texto);
  }, [texto]);

  const alternarTema = useCallback(
    () => setTema((t) => (t === "oscuro" ? "claro" : "oscuro")),
    [],
  );
  const alternarVision = useCallback(
    () => setVision((v) => (v === "alto" ? "normal" : "alto")),
    [],
  );
  const ciclarTexto = useCallback(
    () => setTexto((v) => ORDEN_TEXTO[(ORDEN_TEXTO.indexOf(v) + 1) % ORDEN_TEXTO.length]),
    [],
  );

  return { tema, vision, texto, alternarTema, alternarVision, ciclarTexto };
}
