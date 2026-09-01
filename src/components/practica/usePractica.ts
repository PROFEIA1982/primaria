// ============================================================
// El cerebro de la practica. Todo el estado vive aca, en memoria
// del navegador: de este estudiante no se guarda nada en la base.
//
// LA PRACTICA NO LLEVA RELOJ. Ni cuenta regresiva ni interruptor para
// ponerla. Practicar contra el reloj mide la prisa, no lo que el
// estudiante sabe: Khan Academy, IXL y Google Forms tampoco lo ponen, y
// la cuenta regresiva es de las apps de competencia tipo Kahoot. Aca el
// estudiante para cuando quiera y sigue cuando quiera. Quien se quiera
// medir contra el tiempo tiene el simulacro, que si lo trae y para eso
// existe.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type SlugMateria } from "../../config";
import {
  registrarResultados,
  sortearItems,
  traerConteos,
  traerConteosPorTema,
  traerTemas,
} from "../../lib/api";
import type { Item, Tema } from "../../lib/tipos";
import { calificar, type Calificacion, type Respuestas } from "./calificar";

export type Fase = "seleccion" | "examen" | "resultados";
export type EstadoInicial = "cargando" | "listo" | "error";

export type Practica = {
  // --- carga inicial ---
  estadoInicial: EstadoInicial;
  recargar: () => void;
  temas: Tema[];
  // cuantas preguntas publicadas tiene cada tema, por id. Vacio si no cargo.
  conteoPorTema: Record<number, number>;
  itemsEnLaMateria: number;

  // --- seleccion ---
  fase: Fase;
  temaSel: number | null;
  elegirTema: (id: number | null) => void;
  cantidad: number;
  elegirCantidad: (n: number) => void;
  preparando: boolean;
  errorSorteo: boolean;
  // cuantas aparecieron cuando salieron menos de las pedidas; null si no aplica
  pocasDisponibles: number | null;
  empezar: () => void;
  aceptarLasQueHay: () => void;

  // --- examen ---
  items: Item[];
  indice: number;
  respuestas: Respuestas;
  responder: (opcionId: string) => void;
  siguiente: () => void;

  // --- lo que saco ---
  calificacion: Calificacion;
  volverAPracticar: () => void;
};

export function usePractica(slug: SlugMateria): Practica {
  const [estadoInicial, setEstadoInicial] = useState<EstadoInicial>("cargando");
  const [temas, setTemas] = useState<Tema[]>([]);
  const [conteoPorTema, setConteoPorTema] = useState<Record<number, number>>({});
  const [itemsEnLaMateria, setItemsEnLaMateria] = useState(0);

  const [fase, setFase] = useState<Fase>("seleccion");
  const [temaSel, setTemaSel] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(10);
  const [preparando, setPreparando] = useState(false);
  const [errorSorteo, setErrorSorteo] = useState(false);
  const [pocasDisponibles, setPocasDisponibles] = useState<number | null>(null);
  // Lo que ya trajo el servidor cuando salieron menos de las pedidas: se
  // guarda para no volver a pegarle a la base si el estudiante acepta.
  const [guardadas, setGuardadas] = useState<Item[]>([]);

  const [items, setItems] = useState<Item[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>([]);

  // --- carga inicial: id de la materia, cuantos items tiene y sus temas ---
  const cargar = useCallback(async () => {
    setEstadoInicial("cargando");
    try {
      const conteos = await traerConteos();
      const mia = conteos.find((c) => c.slug === slug);
      if (!mia) {
        setEstadoInicial("error");
        return;
      }
      setItemsEnLaMateria(mia.items ?? 0);
      // Si la materia todavia no tiene temas, la pantalla muestra solo
      // "Todos los temas" y no pasa nada raro.
      let lista: Tema[] = [];
      try {
        lista = await traerTemas(mia.id);
      } catch {
        lista = [];
      }
      setTemas(lista);
      // El conteo por tema es adorno de la tarjeta: si falla, la tarjeta
      // sale sin numero y la pantalla igual sirve. Por eso no toca el estado.
      let cuentas: Record<number, number> = {};
      try {
        cuentas = await traerConteosPorTema(mia.id);
      } catch {
        cuentas = {};
      }
      setConteoPorTema(cuentas);
      setEstadoInicial("listo");
    } catch {
      setEstadoInicial("error");
    }
  }, [slug]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Si cambia la materia (el estudiante salta de Ciencias a Español por
  // el menu) se limpia todo: mezclar preguntas de dos materias seria feo.
  // Se hace durante el render y no en un efecto para que no se alcance a
  // dibujar un cuadro con las preguntas de la materia anterior.
  const [slugPrevio, setSlugPrevio] = useState(slug);
  if (slug !== slugPrevio) {
    setSlugPrevio(slug);
    setEstadoInicial("cargando");
    setFase("seleccion");
    setTemaSel(null);
    setCantidad(10);
    setTemas([]);
    setConteoPorTema({});
    setItemsEnLaMateria(0);
    setItems([]);
    setRespuestas([]);
    setIndice(0);
    setPocasDisponibles(null);
    setErrorSorteo(false);
    setGuardadas([]);
  }

  // --- arranque del examen ---
  const arrancar = useCallback((lista: Item[]) => {
    setItems(lista);
    setRespuestas(new Array(lista.length).fill(null));
    setIndice(0);
    setPocasDisponibles(null);
    setGuardadas([]);
    setFase("examen");
  }, []);

  const empezar = useCallback(() => {
    setPreparando(true);
    setErrorSorteo(false);
    setPocasDisponibles(null);
    const temasPedidos = temaSel === null ? null : [temaSel];
    void sortearItems(slug, cantidad, temasPedidos)
      .then((lista) => {
        if (lista.length === 0) {
          setGuardadas([]);
          setPocasDisponibles(0);
          return;
        }
        if (lista.length < cantidad) {
          // Menos de las pedidas: no se arranca a la brava, se le dice
          // cuantas hay y el estudiante decide.
          setGuardadas(lista);
          setPocasDisponibles(lista.length);
          return;
        }
        arrancar(lista);
      })
      .catch(() => setErrorSorteo(true))
      .finally(() => setPreparando(false));
  }, [slug, cantidad, temaSel, arrancar]);

  const aceptarLasQueHay = useCallback(() => {
    if (guardadas.length > 0) arrancar(guardadas);
  }, [arrancar, guardadas]);

  const elegirTema = useCallback((id: number | null) => {
    setTemaSel(id);
    setPocasDisponibles(null);
    setErrorSorteo(false);
  }, []);

  const elegirCantidad = useCallback((n: number) => {
    setCantidad(n);
    setPocasDisponibles(null);
    setErrorSorteo(false);
  }, []);

  // --- responder y avanzar ---
  const responder = useCallback(
    (opcionId: string) => {
      // La primera respuesta manda. Despues el item queda congelado.
      setRespuestas((prev) => {
        if (prev[indice] !== null && prev[indice] !== undefined) return prev;
        const copia = [...prev];
        copia[indice] = opcionId;
        return copia;
      });
    },
    [indice],
  );

  const siguiente = useCallback(() => {
    if (indice + 1 < items.length) setIndice(indice + 1);
    else setFase("resultados");
  }, [indice, items.length]);

  // --- resultados ---
  const calificacion = useMemo(() => calificar(items, respuestas), [items, respuestas]);

  // El agregado anonimo se manda una sola vez por practica. Si falla,
  // silencio: al estudiante no le sirve de nada ese error.
  const enviadoRef = useRef(false);
  useEffect(() => {
    if (fase !== "resultados") return;
    if (enviadoRef.current) return;
    if (calificacion.registro.length === 0) return;
    enviadoRef.current = true;
    void registrarResultados(calificacion.registro);
  }, [fase, calificacion]);

  const volverAPracticar = useCallback(() => {
    enviadoRef.current = false;
    setItems([]);
    setRespuestas([]);
    setIndice(0);
    setPocasDisponibles(null);
    setErrorSorteo(false);
    setFase("seleccion");
  }, []);

  return {
    estadoInicial,
    recargar: () => void cargar(),
    temas,
    conteoPorTema,
    itemsEnLaMateria,
    fase,
    temaSel,
    elegirTema,
    cantidad,
    elegirCantidad,
    preparando,
    errorSorteo,
    pocasDisponibles,
    empezar,
    aceptarLasQueHay,
    items,
    indice,
    respuestas,
    responder,
    siguiente,
    calificacion,
    volverAPracticar,
  };
}
