// ============================================================
// El cerebro del simulacro.
//
// Se parece a usePractica pero no es lo mismo, y por eso vive aparte:
//   · las preguntas no se sortean, vienen fijas del cuadernillo
//   · el chiquito puede ir y volver entre las cuarenta
//   · puede cambiar una respuesta mientras no entregue
//   · no se corrige nada hasta el final
//   · el intento se respalda en el aparato para poder retomarlo
//
// Meterle todo eso a usePractica con banderitas habria dejado un hook
// con dos comportamientos peleando adentro, y la practica ya funciona.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SEGUNDOS_ITEM_SIMULACRO, SEGUNDOS_ITEM_SIMULACRO_EXTRA, type SlugMateria,
} from "../../config";
import { listarSimulacros, registrarResultados, traerSimulacro } from "../../lib/api";
import type { Simulacro, SimulacroResumen } from "../../lib/tipos";
import { useTiempoExtra } from "../../lib/apariencia";
import {
  avisoReloj,
  calificar,
  nivelReloj,
  type Calificacion,
  type NivelReloj,
  type Respuestas,
} from "../practica/calificar";
import {
  borrarEnCurso, guardarEnCurso, guardarIntento, leerEnCurso, leerMarcas,
  type EnCurso, type MarcaSimulacro,
} from "./marcas";

export type FaseSimulacro = "lista" | "examen" | "resultados";
export type EstadoLista = "cargando" | "listo" | "error";

export type Simulacros = {
  // --- la lista de cuadernillos de esta materia ---
  estadoLista: EstadoLista;
  recargar: () => void;
  lista: SimulacroResumen[];
  marcas: Record<string, MarcaSimulacro>;
  /** intento a medias guardado en este aparato, si es de esta materia */
  enCurso: SimulacroResumen | null;
  retomar: () => void;
  descartarEnCurso: () => void;

  // --- arranque ---
  fase: FaseSimulacro;
  abriendo: string | null;
  errorAbrir: string | null;
  empezar: (slug: string) => void;

  // --- el cuadernillo en curso ---
  actual: Simulacro | null;
  indice: number;
  respuestas: Respuestas;
  responder: (opcionId: string) => void;
  irA: (i: number) => void;
  siguiente: () => void;
  anterior: () => void;
  entregar: () => void;
  sinResponderAun: number;

  // --- reloj ---
  restante: number;
  totalSegundos: number;
  nivel: NivelReloj;
  aviso: string;

  // --- resultados ---
  calificacion: Calificacion;
  seAcaboElTiempo: boolean;
  repetir: () => void;
  volverALista: () => void;
};

export function useSimulacros(materia: SlugMateria): Simulacros {
  const [estadoLista, setEstadoLista] = useState<EstadoLista>("cargando");
  // Se guarda la lista completa, sin filtrar. Filtrar aca dejaba que una
  // respuesta atrasada de otra materia pintara sus cuadernillos en la
  // pantalla equivocada; derivado, eso no puede pasar.
  const [todos, setTodos] = useState<SimulacroResumen[]>([]);
  const [marcas, setMarcas] = useState<Record<string, MarcaSimulacro>>({});
  const [respaldo, setRespaldo] = useState<EnCurso | null>(null);
  // Tres minutos por pregunta, parejo para todos los cuadernillos. Cuatro
  // si el estudiante tiene puesta la adecuacion de tiempo, que vive en el
  // panel de accesibilidad y no aca: asi no hay que declararla cada vez.
  const tiempoExtra = useTiempoExtra();

  const [fase, setFase] = useState<FaseSimulacro>("lista");
  const [abriendo, setAbriendo] = useState<string | null>(null);
  const [errorAbrir, setErrorAbrir] = useState<string | null>(null);

  const [actual, setActual] = useState<Simulacro | null>(null);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>([]);
  const [seAcaboElTiempo, setSeAcaboElTiempo] = useState(false);

  const lista = useMemo(
    () => todos.filter((s) => s.materia_slug === materia),
    [todos, materia],
  );

  const items = useMemo(() => actual?.items ?? [], [actual]);
  // Lo fija arrancar segun los minutos por pregunta (o lo que traiga el
  // respaldo al retomar). Arranca en cero: no hay examen todavia.
  const [totalSegundos, setTotalSegundos] = useState(0);
  const [restante, setRestante] = useState(0);
  const [aviso, setAviso] = useState("");
  // Hora de fin en milisegundos, no un contador que se resta: si el celular
  // duerme la pestana el contador se atrasa y la hora de fin no.
  const finRef = useRef(0);

  // Cada peticion se numera. Cuando llega una respuesta se compara con el
  // numero vigente y, si no calza, se bota: es de un toque anterior que ya
  // no interesa. Sin esto, tocar "Empezar" en Ciencias y cambiarse a
  // Matematicas por el menu terminaba abriendo el cuadernillo de Ciencias
  // dentro de la pantalla de Matematicas.
  const peticionRef = useRef(0);
  // Candado del cierre: que el intento se cuente y se mande una sola vez,
  // aunque los efectos se disparen dos veces (StrictMode).
  const cerradoRef = useRef(false);

  // --- carga de la lista ---
  const cargar = useCallback(async () => {
    const mia = ++peticionRef.current;
    setEstadoLista("cargando");
    try {
      const traidos = await listarSimulacros();
      if (peticionRef.current !== mia) return;
      setTodos(traidos);
      setEstadoLista("listo");
    } catch {
      if (peticionRef.current !== mia) return;
      setEstadoLista("error");
    }
    // Lo del aparato del chiquito, no de la base. Si el navegador tiene el
    // almacenamiento cerrado, sale vacio y ya.
    setMarcas(leerMarcas());
    setRespaldo(leerEnCurso());
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Si cambia de materia por el menu, se vuelve a la lista y se bota lo
  // que hubiera en curso. Se ajusta durante el render y no en un efecto
  // para que no se alcance a dibujar un cuadro con el cuadernillo viejo.
  const [materiaPrevia, setMateriaPrevia] = useState(materia);
  if (materia !== materiaPrevia) {
    setMateriaPrevia(materia);
    setFase("lista");
    setActual(null);
    setRespuestas([]);
    setIndice(0);
    setSeAcaboElTiempo(false);
    setErrorAbrir(null);
    // Y tambien lo que estuviera a medio abrir: si no, la lista nueva
    // aparecia con los tres botones muertos hasta que llegara la
    // respuesta de la materia anterior.
    setAbriendo(null);
    peticionRef.current += 1;
    // El respaldo se relee: el aviso de "seguí donde ibas" solo aplica si
    // el cuadernillo guardado es de la materia que se esta viendo.
    setRespaldo(leerEnCurso());
  }

  // El cuadernillo a medias, solo si es de esta materia y sigue existiendo.
  const enCurso = useMemo(
    () => (respaldo ? lista.find((s) => s.slug === respaldo.slug) ?? null : null),
    [respaldo, lista],
  );

  // --- arranque ---
  const arrancar = useCallback((cuadernillo: Simulacro, desde?: EnCurso) => {
    const n = cuadernillo.items.length;
    // Un respaldo de otro largo (porque cambio el cuadernillo) no se usa:
    // las respuestas no calzarian con las preguntas.
    const sirve = desde && desde.respuestas.length === n && desde.fin > Date.now();
    // Al retomar manda el total que traia guardado el intento; al empezar
    // de cero, tres minutos por pregunta, o cuatro con la adecuacion.
    const segPorItem = tiempoExtra
      ? SEGUNDOS_ITEM_SIMULACRO_EXTRA
      : SEGUNDOS_ITEM_SIMULACRO;
    const total = sirve ? desde.total : n * segPorItem;
    setActual(cuadernillo);
    setRespuestas(sirve ? [...desde.respuestas] : new Array(n).fill(null));
    setIndice(sirve ? Math.min(Math.max(desde.indice, 0), n - 1) : 0);
    setSeAcaboElTiempo(false);
    setTotalSegundos(total);
    finRef.current = sirve ? desde.fin : Date.now() + total * 1000;
    setRestante(Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000)));
    setAviso("");
    // El candado del guardado se suelta aca, con el arranque de verdad, y
    // no cuando alguien toca "Hacerlo otra vez": esa intencion puede
    // fallar y dejaria el intento anterior contado dos veces.
    cerradoRef.current = false;
    setFase("examen");
  }, [tiempoExtra]);

  const abrir = useCallback(
    (slug: string, desde?: EnCurso) => {
      const mia = ++peticionRef.current;
      setAbriendo(slug);
      setErrorAbrir(null);
      void traerSimulacro(slug)
        .then((cuadernillo) => {
          if (peticionRef.current !== mia) return;
          if (!cuadernillo) {
            setErrorAbrir("No se pudo abrir el simulacro. Revisá que tengás internet y probá otra vez.");
            return;
          }
          arrancar(cuadernillo, desde);
        })
        .catch(() => {
          if (peticionRef.current !== mia) return;
          setErrorAbrir("No se pudo abrir el simulacro. Revisá que tengás internet y probá otra vez.");
        })
        .finally(() => {
          if (peticionRef.current === mia) setAbriendo(null);
        });
    },
    [arrancar],
  );

  const empezar = useCallback(
    (slug: string) => {
      // Empezar de cero bota el respaldo: si no, terminado el nuevo
      // intento le seguiria saliendo el aviso del viejo.
      borrarEnCurso();
      setRespaldo(null);
      abrir(slug);
    },
    [abrir],
  );

  const retomar = useCallback(() => {
    if (!respaldo) return;
    abrir(respaldo.slug, respaldo);
  }, [abrir, respaldo]);

  const descartarEnCurso = useCallback(() => {
    borrarEnCurso();
    setRespaldo(null);
  }, []);

  // --- responder y moverse ---
  // Aca si se puede cambiar: mientras no entregue, la ultima que toque manda.
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
    // Entregado ya no hay nada que retomar.
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
  // Se guarda con cada toque. Son unos cientos de bytes y la escritura es
  // sincrona pero minima; a cambio, cerrar la pestana deja de costar
  // ochenta minutos de trabajo.
  useEffect(() => {
    if (fase !== "examen" || !actual) return;
    guardarEnCurso({ slug: actual.slug, respuestas, indice, fin: finRef.current, total: totalSegundos });
  }, [fase, actual, respuestas, indice, totalSegundos]);

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
    // Al volver de segundo plano el navegador puede tener el temporizador
    // congelado: se recalcula de una vez para que el numero no aparezca
    // viejo el primer medio segundo.
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

  // Al entregar pasan dos cosas, las dos una sola vez: se manda el
  // agregado anonimo a la base y se guarda la marca en este aparato.
  useEffect(() => {
    if (fase !== "resultados") return;
    if (cerradoRef.current) return;
    if (!actual) return;
    cerradoRef.current = true;
    if (calificacion.registro.length > 0) void registrarResultados(calificacion.registro);
    setMarcas(guardarIntento(actual.slug, calificacion.nota));
  }, [fase, actual, calificacion]);

  const volverALista = useCallback(() => {
    setActual(null);
    setRespuestas([]);
    setIndice(0);
    setSeAcaboElTiempo(false);
    setErrorAbrir(null);
    // Se relee el respaldo: si salio a medias, la lista tiene que
    // ofrecerle seguir donde iba.
    setRespaldo(leerEnCurso());
    setFase("lista");
  }, []);

  // Repetir el mismo cuadernillo. Se vuelve a pedir al servidor a
  // proposito: asi las cuatro opciones salen barajadas de nuevo y el
  // chiquito no se aprende "la respuesta es la C".
  //
  // Ojo con el orden: NO se borra nada antes de pedir. Si se cae la red,
  // los resultados que estaba viendo (y que iba a imprimir) tienen que
  // seguir ahi; antes se botaban de entrada y quedaba en la lista con un
  // error y sin nota.
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
