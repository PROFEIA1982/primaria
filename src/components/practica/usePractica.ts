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
import {
  borrarRespaldo,
  guardarCurso,
  guardarItems,
  leerRespaldo,
  type RespaldoPractica,
} from "./respaldo";

export type Fase = "seleccion" | "examen" | "resultados";
export type EstadoInicial = "cargando" | "listo" | "error";

/** Lo que la pantalla de escoger necesita saber de la practica a medias. */
export type ResumenRespaldo = {
  contestadas: number;
  total: number;
};

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

  // --- practica a medias guardada en este aparato ---
  // null si no hay, o si la que hay es de otra materia.
  respaldo: ResumenRespaldo | null;
  retomar: () => void;
  descartarRespaldo: () => void;

  // --- examen ---
  items: Item[];
  indice: number;
  respuestas: Respuestas;
  responder: (opcionId: string) => void;
  siguiente: () => void;
  anterior: () => void;

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
  // La practica a medias que quedo guardada en este aparato, ya revisada
  // contra esta materia. Ver respaldo.ts.
  const [respaldo, setRespaldo] = useState<RespaldoPractica | null>(null);

  // Cada peticion toma un turno. Cuando llega una respuesta se compara
  // con el turno vigente y, si no calza, se bota: es de un toque anterior
  // que ya no interesa. Sin esto, tocar "Empezar" en Ciencias y cambiarse
  // a Matematicas por el menu terminaba pintando las preguntas de
  // Ciencias dentro de la pantalla de Matematicas.
  const peticionRef = useRef(0);

  // --- carga inicial: id de la materia, cuantos items tiene y sus temas ---
  const cargar = useCallback(async () => {
    const turno = ++peticionRef.current;
    setEstadoInicial("cargando");
    // Esto sale del aparato, no de la red: se lee de una vez y no espera
    // a que conteste el servidor.
    setRespaldo(leerRespaldo(slug));
    try {
      const conteos = await traerConteos();
      if (peticionRef.current !== turno) return;
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
      if (peticionRef.current !== turno) return;
      setTemas(lista);
      // El conteo por tema es adorno de la tarjeta: si falla, la tarjeta
      // sale sin numero y la pantalla igual sirve. Por eso no toca el estado.
      let cuentas: Record<number, number> = {};
      try {
        cuentas = await traerConteosPorTema(mia.id);
      } catch {
        cuentas = {};
      }
      if (peticionRef.current !== turno) return;
      setConteoPorTema(cuentas);
      setEstadoInicial("listo");
    } catch {
      if (peticionRef.current !== turno) return;
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
    // El respaldo de la materia anterior no aplica aca. El de esta, si
    // lo hay, lo vuelve a leer cargar() de una vez.
    setRespaldo(null);
    // Y lo que estuviera a medio pedir: sin esto el boton de empezar
    // quedaba muerto en "Preparando…" hasta que llegara la respuesta de
    // la materia anterior, que ademas ya no se va a usar.
    setPreparando(false);
    peticionRef.current += 1;
  }

  // --- arranque del examen ---
  // `desde` viene lleno solo al retomar: leerRespaldo ya reviso que esas
  // respuestas calcen con estos items y que el indice este en rango.
  const arrancar = useCallback((lista: Item[], desde?: RespaldoPractica) => {
    setItems(lista);
    if (desde) {
      setRespuestas([...desde.respuestas]);
      setIndice(desde.indice);
    } else {
      setRespuestas(new Array(lista.length).fill(null));
      setIndice(0);
      // Recien aca se bota el respaldo viejo: con las preguntas nuevas ya
      // en la mano. Botarlo en empezar(), antes de pedirle al servidor,
      // dejaba al estudiante sin el respaldo viejo y sin practica nueva
      // cada vez que se cayera la red.
      borrarRespaldo();
      guardarItems(lista);
    }
    setPocasDisponibles(null);
    setGuardadas([]);
    setRespaldo(null);
    setFase("examen");
  }, []);

  const empezar = useCallback(() => {
    const turno = ++peticionRef.current;
    setPreparando(true);
    setErrorSorteo(false);
    setPocasDisponibles(null);
    const temasPedidos = temaSel === null ? null : [temaSel];
    void sortearItems(slug, cantidad, temasPedidos)
      .then((lista) => {
        if (peticionRef.current !== turno) return;
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
      .catch(() => {
        if (peticionRef.current !== turno) return;
        setErrorSorteo(true);
      })
      .finally(() => {
        if (peticionRef.current === turno) setPreparando(false);
      });
  }, [slug, cantidad, temaSel, arrancar]);

  const retomar = useCallback(() => {
    if (!respaldo) return;
    arrancar(respaldo.items, respaldo);
  }, [arrancar, respaldo]);

  const descartarRespaldo = useCallback(() => {
    borrarRespaldo();
    setRespaldo(null);
  }, []);

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

  // Devolverse. La respuesta anterior sigue congelada -- en la practica
  // manda la primera que toco -- asi que volver no sirve para cambiarla:
  // sirve para releer la pregunta y la explicacion, que es donde esta el
  // aprendizaje. Sin esto, el que se pasaba de pregunta sin terminar de
  // leer la retroalimentacion la perdia y no habia como recuperarla.
  const anterior = useCallback(() => {
    setIndice((i) => (i > 0 ? i - 1 : i));
  }, []);

  // --- respaldo del avance ---
  // Se escribe con cada respuesta y cada cambio de pregunta, pero solo la
  // parte liviana: los items se guardaron una sola vez en arrancar() y no
  // cambian en toda la practica. Ver el porque en respaldo.ts.
  useEffect(() => {
    if (fase !== "examen") return;
    if (items.length === 0) return;
    guardarCurso(slug, indice, respuestas);
  }, [fase, slug, indice, respuestas, items.length]);

  // Terminada la practica ya no hay nada que retomar. Va aparte del envio
  // de resultados porque ese se salta cuando no hay nada que mandar, y el
  // respaldo hay que botarlo igual.
  useEffect(() => {
    if (fase !== "resultados") return;
    borrarRespaldo();
  }, [fase]);

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
    // Se vuelve a la pantalla de escoger por dos puertas y en las dos el
    // estudiante ya decidio soltar esta practica: el boton de salir del
    // examen, que antes le avisa en letras que pierde las respuestas, y
    // el de practicar otra vez al final. Ofrecerle despues seguir donde
    // iba seria contradecir lo que la app acaba de decirle.
    borrarRespaldo();
    setRespaldo(null);
    setFase("seleccion");
  }, []);

  // Lo unico que la pantalla de escoger necesita del respaldo: cuantas
  // lleva y de cuantas. Las preguntas guardadas no salen del hook.
  const resumenRespaldo = useMemo<ResumenRespaldo | null>(() => {
    if (!respaldo) return null;
    return {
      contestadas: respaldo.respuestas.filter((r) => r !== null && r !== undefined).length,
      total: respaldo.items.length,
    };
  }, [respaldo]);

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
    respaldo: resumenRespaldo,
    retomar,
    descartarRespaldo,
    items,
    indice,
    respuestas,
    responder,
    siguiente,
    anterior,
    calificacion,
    volverAPracticar,
  };
}
