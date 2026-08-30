// ============================================================
// El cerebro de la practica. Todo el estado vive aca, en memoria
// del navegador: de este estudiante no se guarda nada en la base.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEGUNDOS_POR_ITEM, type SlugMateria } from "../../config";
import {
  registrarResultados,
  sortearItems,
  traerConteos,
  traerConteosPorTema,
  traerTemas,
} from "../../lib/api";
import type { Item, Tema } from "../../lib/tipos";
import {
  avisoReloj,
  calificar,
  nivelReloj,
  type Calificacion,
  type NivelReloj,
  type Respuestas,
} from "./calificar";

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
  restante: number;
  totalSegundos: number;
  nivel: NivelReloj;
  aviso: string;

  // --- resultados ---
  calificacion: Calificacion;
  seAcaboElTiempo: boolean;
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
  const [seAcaboElTiempo, setSeAcaboElTiempo] = useState(false);

  const totalSegundos = items.length * SEGUNDOS_POR_ITEM;
  const [restante, setRestante] = useState(0);
  const [aviso, setAviso] = useState("");
  // Marca del reloj en milisegundos. Se guarda la hora de fin y no un
  // contador que se resta: si el celular duerme la pestana, el contador
  // se atrasa y la hora de fin no.
  const finRef = useRef(0);

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
    setSeAcaboElTiempo(false);
    setGuardadas([]);
  }

  // --- arranque del examen ---
  const arrancar = useCallback((lista: Item[]) => {
    setItems(lista);
    setRespuestas(new Array(lista.length).fill(null));
    setIndice(0);
    setSeAcaboElTiempo(false);
    setPocasDisponibles(null);
    setGuardadas([]);
    const segundos = lista.length * SEGUNDOS_POR_ITEM;
    finRef.current = Date.now() + segundos * 1000;
    setRestante(segundos);
    setAviso("");
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

  const terminar = useCallback((porTiempo: boolean) => {
    setSeAcaboElTiempo(porTiempo);
    setFase("resultados");
  }, []);

  const siguiente = useCallback(() => {
    if (indice + 1 < items.length) setIndice(indice + 1);
    else terminar(false);
  }, [indice, items.length, terminar]);

  // --- el reloj ---
  useEffect(() => {
    if (fase !== "examen") return;
    // Medio segundo: con un segundo justo, el reloj a veces se salta un
    // numero cuando el navegador atrasa el disparo.
    const id = window.setInterval(() => {
      const seg = Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000));
      setRestante(seg);
      if (seg <= 0) {
        window.clearInterval(id);
        terminar(true);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [fase, terminar]);

  const nivel = nivelReloj(restante, totalSegundos);

  // La region viva solo habla al cambiar de minuto o de nivel. Si cantara
  // cada segundo, el lector de pantalla taparia la pregunta.
  const claveAvisoRef = useRef("");
  useEffect(() => {
    if (fase !== "examen") {
      claveAvisoRef.current = "";
      return;
    }
    const clave = `${nivel}|${Math.ceil(restante / 60)}`;
    if (clave === claveAvisoRef.current) return;
    claveAvisoRef.current = clave;
    setAviso(avisoReloj(restante, nivel));
  }, [fase, restante, nivel]);

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
    setSeAcaboElTiempo(false);
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
    restante,
    totalSegundos,
    nivel,
    aviso,
    calificacion,
    seAcaboElTiempo,
    volverAPracticar,
  };
}
