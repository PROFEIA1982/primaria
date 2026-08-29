// ============================================================
// Logica pura de la practica: calificar, formatear el reloj y
// decidir los niveles de aviso. Nada de React aca a proposito,
// para poder probarlo con datos falsos sin levantar el navegador.
// ============================================================

import type { Item, Opcion } from "../../lib/tipos";

// Las mismas letras que pinta ItemRenderer. Si algun dia un item trae
// mas de cuatro opciones, cae al numero y no rompe nada.
export const LETRAS = ["A", "B", "C", "D"];

export function letraDe(indice: number): string {
  return LETRAS[indice] ?? String(indice + 1);
}

// Una respuesta por item, en el mismo orden que vino del servidor.
// null = todavia no la toco o se le acabo el tiempo.
export type Respuestas = (string | null)[];

export type Fallada = {
  itemId: string;
  enunciado: string;
  temaNombre: string;
  letraElegida: string | null;
  textoElegido: string | null;
  letraCorrecta: string;
  textoCorrecto: string;
};

export type PorTema = {
  tema: string;
  aciertos: number;
  total: number;
  porcentaje: number;
};

export type Calificacion = {
  total: number;
  aciertos: number;
  respondidas: number;
  sinResponder: number;
  nota: number;
  porTema: PorTema[];
  falladas: Fallada[];
  registro: { item_id: string; acerto: boolean }[];
};

const SIN_TEMA = "Sin tema";

// La correcta ya viene marcada por el servidor con es_correcta. No hay
// columna clave ni indices que mapear: se busca la opcion y ya.
function opcionCorrecta(opciones: Opcion[]): { op: Opcion | null; indice: number } {
  const indice = opciones.findIndex((o) => o.es_correcta);
  return { op: indice >= 0 ? opciones[indice] : null, indice };
}

export function acerto(item: Item, opcionId: string | null): boolean {
  if (opcionId === null) return false;
  const op = item.opciones.find((o) => o.id === opcionId);
  return op?.es_correcta === true;
}

export function calificar(items: Item[], respuestas: Respuestas): Calificacion {
  const total = items.length;
  let aciertos = 0;
  let respondidas = 0;

  const falladas: Fallada[] = [];
  const registro: { item_id: string; acerto: boolean }[] = [];
  // Se agrupa en un Map para conservar el orden en que aparecieron los
  // temas antes de reordenar por porcentaje.
  const temas = new Map<string, { aciertos: number; total: number }>();

  items.forEach((item, i) => {
    const elegida = respuestas[i] ?? null;
    const bien = acerto(item, elegida);

    if (elegida !== null) respondidas += 1;
    if (bien) aciertos += 1;
    registro.push({ item_id: item.id, acerto: bien });

    const nombreTema = item.tema ?? SIN_TEMA;
    const fila = temas.get(nombreTema) ?? { aciertos: 0, total: 0 };
    fila.total += 1;
    if (bien) fila.aciertos += 1;
    temas.set(nombreTema, fila);

    if (!bien) {
      const { op: correcta, indice: iCorrecta } = opcionCorrecta(item.opciones);
      const iElegida = elegida === null ? -1 : item.opciones.findIndex((o) => o.id === elegida);
      falladas.push({
        itemId: item.id,
        enunciado: item.enunciado,
        temaNombre: nombreTema,
        letraElegida: iElegida >= 0 ? letraDe(iElegida) : null,
        textoElegido: iElegida >= 0 ? item.opciones[iElegida].texto : null,
        letraCorrecta: iCorrecta >= 0 ? letraDe(iCorrecta) : "—",
        textoCorrecto: correcta?.texto ?? "—",
      });
    }
  });

  const porTema: PorTema[] = [...temas.entries()]
    .map(([tema, f]) => ({
      tema,
      aciertos: f.aciertos,
      total: f.total,
      porcentaje: f.total === 0 ? 0 : Math.round((f.aciertos / f.total) * 100),
    }))
    // De peor a mejor: primero lo que hay que repasar. Si empatan, va
    // adelante el tema con mas preguntas, que pesa mas en la nota.
    .sort((a, b) => a.porcentaje - b.porcentaje || b.total - a.total || a.tema.localeCompare(b.tema, "es"));

  return {
    total,
    aciertos,
    respondidas,
    sinResponder: total - respondidas,
    nota: total === 0 ? 0 : Math.round((aciertos / total) * 100),
    porTema,
    falladas,
    registro,
  };
}

// --- Reloj ---

// MM:SS. Con sesenta items son 120 minutos, asi que los minutos pueden
// pasar de dos cifras y eso esta bien: no se recorta.
export function formatearReloj(segundos: number): string {
  const seg = Math.max(0, Math.floor(segundos));
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export type NivelReloj = "normal" | "poco" | "critico";

// Ambar bajo el 25% del tiempo, rojo bajo el 10%. El color nunca va solo:
// quien lo pinta agrega la palabra y el icono al lado.
export function nivelReloj(restante: number, total: number): NivelReloj {
  if (total <= 0) return "normal";
  const fraccion = restante / total;
  if (fraccion < 0.1) return "critico";
  if (fraccion < 0.25) return "poco";
  return "normal";
}

export const PALABRA_RELOJ: Record<NivelReloj, string> = {
  normal: "Con calma",
  poco: "Apurate",
  critico: "Ya casi se acaba",
};

// Lo que oye quien usa lector de pantalla. No canta cada segundo: quien
// lo llama solo cambia el texto al cambiar de minuto o de nivel.
export function avisoReloj(restante: number, nivel: NivelReloj): string {
  if (restante <= 0) return "Se acabó el tiempo.";
  const minutos = Math.ceil(restante / 60);
  const cuanto = minutos === 1 ? "Queda menos de un minuto." : `Quedan ${minutos} minutos.`;
  if (nivel === "critico") return `${cuanto} Ya casi se acaba.`;
  if (nivel === "poco") return `${cuanto} Apurate.`;
  return cuanto;
}

// Texto largo del tiempo total, para la pantalla de seleccion.
export function tiempoLargo(segundos: number): string {
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos} minutos`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  const parteHoras = horas === 1 ? "1 hora" : `${horas} horas`;
  if (resto === 0) return parteHoras;
  return `${parteHoras} y ${resto} min`;
}

// --- Nota ---

export type NivelNota = "bien" | "medio" | "bajo";

export function nivelNota(nota: number): NivelNota {
  if (nota >= 70) return "bien";
  if (nota >= 50) return "medio";
  return "bajo";
}

export const PALABRA_NOTA: Record<NivelNota, string> = {
  bien: "¡Muy bien!",
  medio: "Vas por buen camino",
  bajo: "Hay que repasar",
};
