// ============================================================
// El cerebro de los examenes nuevos.
//
// Misma logica que useSimulacro, pero:
//   · llama las funciones de la API nuevas (tablas aparte)
//   · el tiempo por pregunta sale de la base, no de config
//   · respaldo en localStorage con llaves propias
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SlugMateria } from "../../config";
import {
  listarSimulacrosNuevos,
  registrarResultadosSimulacroNuevo,
  traerSimulacroNuevo,
} from "../../lib/api";
import type { SimulacroNuevo, SimulacroNuevoResumen } from "../../lib/tipos";
import { useTiempoExtra } from "../../lib/apariencia";
import { sumarEstrellas } from "../../lib/rincon";
import {
  avisoReloj,
  calificar,
  nivelReloj,
  type Calificacion,
  type NivelReloj,
  type Respuestas,
} from "../practica/calificar";
import {
  borrarEnCurso, estaVencido, guardarCuadernillo, guardarEnCurso,
  guardarIntento, leerCuadernillo, leerEnCurso, leerMarcas,
  type EnCurso, type MarcaExamen,
} from "./marcasNuevos";

export type FaseExamen = "lista" | "examen" | "resultados";
export type EstadoLista = "cargando" | "listo" | "error";

export type ExamenesNuevos = {
  estadoLista: EstadoLista;
  recargar: () => void;
  lista: SimulacroNuevoResumen[];
  marcas: Record<string, MarcaExamen>;
  enCurso: SimulacroNuevoResumen | null;
  enCursoVencido: boolean;
  enCursoRespondidas: number;
  retomar: () => void;
  descartarEnCurso: () => void;

  fase: FaseExamen;
  abriendo: string | null;
  errorAbrir: string | null;
  empezar: (slug: string) => void;

  actual: SimulacroNuevo | null;
  indice: number;
  respuestas: Respuestas;
  responder: (opcionId: string) => void;
  irA: (i: number) => void;
  siguiente: () => void;
  anterior: () => void;
  entregar: () => void;
  sinResponderAun: number;

  restante: number;
  totalSegundos: number;
  nivel: NivelReloj;
  aviso: string;

  calificacion: Calificacion;
  seAcaboElTiempo: boolean;
  repetir: () => void;
  volverALista: () => void;
};

export function useExamenesNuevos(materia: SlugMateria): ExamenesNuevos {
  const [estadoLista, setEstadoLista] = useState<EstadoLista>("cargando");
  const [todos, setTodos] = useState<SimulacroNuevoResumen[]>([]);
  const [marcas, setMarcas] = useState<Record<string, MarcaExamen>>({});
  const [respaldo, setRespaldo] = useState<EnCurso | null>(null);
  const tiempoExtra = useTiempoExtra();

  const [fase, setFase] = useState<FaseExamen>("lista");
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [errorAbrir, setErrorAbrir] = useState<string | null>(null);

  const [actual, setActual] = useState<SimulacroNuevo | null>(null);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>([]);
  const [seAcaboElTiempo, setSeAcaboElTiempo] = useState(false);

  const lista = useMemo(
    () => todos.filter((s) => s.materia_slug === materia),
    [todos, materia],
  );

  const items = useMemo(() => actual?.items ?? [], [actual]);
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [restante, setRestante] = useState(0);
  const [aviso, setAviso] = useState("");
  const finRef = useRef(0);
  const peticionRef = useRef(0);
  const cerradoRef = useRef(false);

  // --- carga de la lista ---
  const cargar = useCallback(async () => {
    const mia = ++peticionRef.current;
    setEstadoLista("cargando");
    try {
      const traidos = await listarSimulacrosNuevos();
      if (peticionRef.current !== mia) return;
      setTodos(traidos);
      setEstadoLista("listo");
    } catch {
      if (peticionRef.current !== mia) return;
      setEstadoLista("error");
    }
    setMarcas(leerMarcas());
    setRespaldo(leerEnCurso());
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Cambio de materia: resetear
  const [materiaPrevia, setMateriaPrevia] = useState(materia);
  if (materia !== materiaPrevia) {
    setMateriaPrevia(materia);
    setFase("lista");
    setActual(null);
    setRespuestas([]);
    setIndice(0);
    setSeAcaboElTiempo(false);
    setErrorAbrir(null);
    setAbriendo(null);
    peticionRef.current += 1;
    setRespaldo(leerEnCurso());
  }

  const enCurso = useMemo(
    () => (respaldo ? lista.find((s) => s.slug === respaldo.slug) ?? null : null),
    [respaldo, lista],
  );
  const enCursoVencido = respaldo !== null && estaVencido(respaldo);
  const enCursoRespondidas = respaldo
    ? respaldo.respuestas.filter((r) => r !== null && r !== undefined).length
    : 0;

  // --- arranque ---
  const arrancar = useCallback((cuadernillo: SimulacroNuevo, desde?: EnCurso) => {
    const n = cuadernillo.items.length;
    const calza = desde !== undefined && desde.respuestas.length === n;

    if (calza && estaVencido(desde)) {
      setActual(cuadernillo);
      setRespuestas([...desde.respuestas]);
      setIndice(0);
      setSeAcaboElTiempo(true);
      setTotalSegundos(desde.total);
      setRestante(0);
      finRef.current = Date.now();
      setAviso("");
      cerradoRef.current = false;
      borrarEnCurso();
      setRespaldo(null);
      setFase("resultados");
      return;
    }

    const sirve = calza && desde.fin > Date.now();
    // Tiempo por pregunta: sale de la base, no de constantes globales.
    // Con la adecuacion de tiempo extra se aplica un 33 % mas (4/3).
    const segPorItem = tiempoExtra
      ? Math.round(cuadernillo.segundos_por_item * 4 / 3)
      : cuadernillo.segundos_por_item;
    const total = sirve ? desde.total : n * segPorItem;
    setActual(cuadernillo);
    setRespuestas(sirve ? [...desde.respuestas] : new Array(n).fill(null));
    setIndice(sirve ? Math.min(Math.max(desde.indice, 0), n - 1) : 0);
    setSeAcaboElTiempo(false);
    setTotalSegundos(total);
    finRef.current = sirve ? desde.fin : Date.now() + total * 1000;
    setRestante(Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000)));
    setAviso("");
    cerradoRef.current = false;
    borrarEnCurso();
    guardarCuadernillo(cuadernillo);
    setFase("examen");
  }, [tiempoExtra]);

  const abrir = useCallback(
    (slug: string, desde?: EnCurso) => {
      const mia = ++peticionRef.current;
      setAbriendo(slug);
      setErrorAbrir(null);
      void traerSimulacroNuevo(slug)
        .then((cuadernillo) => {
          if (peticionRef.current !== mia) return;
          if (!cuadernillo) {
            setErrorAbrir("No se pudo abrir el examen. Revisá que tengás internet y probá otra vez.");
            return;
          }
          arrancar(cuadernillo, desde);
        })
        .catch(() => {
          if (peticionRef.current !== mia) return;
          setErrorAbrir("No se pudo abrir el examen. Revisá que tengás internet y probá otra vez.");
        })
        .finally(() => {
          if (peticionRef.current === mia) setAbriendo(null);
        });
    },
    [arrancar],
  );

  const empezar = useCallback(
    (slug: string) => {
      abrir(slug);
    },
    [abrir],
  );

  const retomar = useCallback(() => {
    if (!respaldo) return;
    const local = leerCuadernillo(respaldo.slug, respaldo.respuestas.length);
    if (local) {
      arrancar(local, respaldo);
      return;
    }
    abrir(respaldo.slug, respaldo);
  }, [abrir, arrancar, respaldo]);

  const descartarEnCurso = useCallback(() => {
    borrarEnCurso();
    setRespaldo(null);
  }, []);

  // --- responder y moverse ---
  const responder = useCallback(
    (opcionId: string) => {
      setRespuestas((prev) => {
        const copia = [...prev];
        copia[indice] = opcionId;
        return copia;
      });
    },
    [indice],
  );

  const irA = useCallback(
    (i: number) => {
      if (i < 0 || i >= items.length) return;
      setIndice(i);
    },
    [items.length],
  );

  const terminar = useCallback((porTiempo: boolean) => {
    borrarEnCurso();
    setRespaldo(null);
    setSeAcaboElTiempo(porTiempo);
    setFase("resultados");
  }, []);

  const siguiente = useCallback(() => {
    if (indice + 1 < items.length) setIndice(indice + 1);
  }, [indice, items.length]);

  const anterior = useCallback(() => {
    if (indice > 0) setIndice(indice - 1);
  }, [indice]);

  const entregar = useCallback(() => terminar(false), [terminar]);

  const sinResponderAun = respuestas.filter((r) => r === null || r === undefined).length;

  // --- respaldo del intento ---
  useEffect(() => {
    if (fase !== "examen" || !actual) return;
    guardarEnCurso({ slug: actual.slug, respuestas, indice, fin: finRef.current, total: totalSegundos });
  }, [fase, actual, respuestas, indice, totalSegundos]);

  // --- el reloj ---
  useEffect(() => {
    if (fase !== "examen") return;
    const id = window.setInterval(() => {
      const seg = Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000));
      setRestante(seg);
      if (seg <= 0) {
        window.clearInterval(id);
        terminar(true);
      }
    }, 500);
    const alVolver = () => {
      if (document.visibilityState !== "visible") return;
      setRestante(Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000)));
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [fase, terminar]);

  const nivel = nivelReloj(restante, totalSegundos);

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

  useEffect(() => {
    if (fase !== "resultados") return;
    if (cerradoRef.current) return;
    if (!actual) return;
    cerradoRef.current = true;
    if (calificacion.registro.length > 0) void registrarResultadosSimulacroNuevo(calificacion.registro);
    const previa = marcas[actual.slug];
    const aciertosPrevios = previa && calificacion.total > 0
      ? Math.round((previa.mejor / 100) * calificacion.total)
      : 0;
    const nuevas = Math.max(0, calificacion.aciertos - aciertosPrevios);
    setMarcas(guardarIntento(actual.slug, calificacion.nota));
    if (nuevas > 0) sumarEstrellas(nuevas);
  }, [fase, actual, calificacion, marcas]);

  const volverALista = useCallback(() => {
    setActual(null);
    setRespuestas([]);
    setIndice(0);
    setSeAcaboElTiempo(false);
    setErrorAbrir(null);
    setRespaldo(leerEnCurso());
    setFase("lista");
  }, []);

  const repetir = useCallback(() => {
    if (!actual) return;
    abrir(actual.slug);
  }, [abrir, actual]);

  return {
    estadoLista,
    recargar: () => void cargar(),
    lista,
    marcas,
    enCurso,
    enCursoVencido,
    enCursoRespondidas,
    retomar,
    descartarEnCurso,
    fase,
    abriendo,
    errorAbrir,
    empezar,
    actual,
    indice,
    respuestas,
    responder,
    irA,
    siguiente,
    anterior,
    entregar,
    sinResponderAun,
    restante,
    totalSegundos,
    nivel,
    aviso,
    calificacion,
    seAcaboElTiempo,
    repetir,
    volverALista,
  };
}
