import { supabase } from "./supabase";
import type { Item, Materia, Simulacro, SimulacroResumen, Tema } from "./tipos";

// Trae las cuatro materias con su conteo de items publicados.
export async function traerMaterias(): Promise<Materia[]> {
  const { data, error } = await supabase
    .from("materias")
    .select("id, slug, nombre, color, color_suave, emoji, orden")
    .order("orden");
  if (error) throw error;
  return (data ?? []) as Materia[];
}

// Temas de una materia, para el filtro de la practica.
export async function traerTemas(materiaId: number): Promise<Tema[]> {
  const { data, error } = await supabase
    .from("temas")
    .select("id, materia_id, slug, nombre, orden")
    .eq("materia_id", materiaId)
    .order("orden");
  if (error) throw error;
  return (data ?? []) as Tema[];
}

// Arma la practica. El barajado pasa en el servidor para no bajarle
// todo el banco al celular de un estudiante.
export async function sortearItems(
  materia: string,
  cantidad: number,
  temas: number[] | null = null,
): Promise<Item[]> {
  const { data, error } = await supabase.rpc("sortear_items", {
    p_materia: materia,
    p_cantidad: cantidad,
    p_temas: temas,
  });
  if (error) throw error;
  return (data ?? []) as Item[];
}

// Guarda el agregado anonimo al terminar. Si falla, no pasa nada:
// no es dato critico y no se le muestra ningun error al estudiante.
export async function registrarResultados(
  resultados: { item_id: string; acerto: boolean }[],
): Promise<void> {
  try {
    await supabase.rpc("registrar_resultados", { p_resultados: resultados });
  } catch {
    // silencio a proposito
  }
}

// Suma una visita, una sola vez por sesion del navegador.
export async function registrarVisita(): Promise<number | null> {
  try {
    if (sessionStorage.getItem("ps_visita_contada")) return null;
    const { data, error } = await supabase.rpc("registrar_visita");
    if (error) throw error;
    sessionStorage.setItem("ps_visita_contada", "1");
    return data as number;
  } catch {
    return null;
  }
}

// Guarda un mensaje del formulario de contacto. La tabla solo permite
// insertar: nadie puede leer la lista desde el navegador.
export async function enviarContacto(datos: {
  nombre: string;
  correo?: string | null;
  mensaje: string;
}): Promise<void> {
  const { error } = await supabase.from("contactos").insert({
    nombre: datos.nombre.trim(),
    correo: datos.correo?.trim() || null,
    mensaje: datos.mensaje.trim(),
  });
  if (error) throw error;
}

// Lee el contador de visitas sin sumarle nada.
export async function leerVisitas(): Promise<number | null> {
  const { data, error } = await supabase
    .from("metricas_sitio")
    .select("valor")
    .eq("clave", "visitas")
    .single();
  if (error) return null;
  return (data?.valor as number) ?? null;
}

// Cuantas preguntas publicadas tiene cada materia. Sale de la base,
// no escrito a mano: si todavia no hay items, devuelve cero y la
// pantalla lo dice en vez de inventar un numero.
export type ConteoMateria = {
  id: number;
  slug: string;
  nombre: string;
  color: string;
  color_suave: string;
  emoji: string | null;
  orden: number;
  items: number;
};

export async function traerConteos(): Promise<ConteoMateria[]> {
  const { data, error } = await supabase
    .from("v_conteo_materias")
    .select("id, slug, nombre, color, color_suave, emoji, orden, items")
    .order("orden");
  if (error) throw error;
  return (data ?? []) as ConteoMateria[];
}

// Cuantas preguntas publicadas tiene cada tema de una materia. Se pide el
// arreglo de tema_id y se cuenta aca: son unas decenas de filas de un solo
// campo, mucho menos que bajarse los enunciados solo para contarlos.
// El filtro por estado va explicito ademas del RLS: si algun dia la politica
// cambia, el numero que ve el estudiante no se desalinea con el sorteo.
export async function traerConteosPorTema(
  materiaId: number,
): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from("items")
    .select("tema_id")
    .eq("materia_id", materiaId)
    .eq("estado", "publicado");
  if (error) throw error;
  const cuenta: Record<number, number> = {};
  for (const fila of (data ?? []) as { tema_id: number | null }[]) {
    if (fila.tema_id === null) continue;
    cuenta[fila.tema_id] = (cuenta[fila.tema_id] ?? 0) + 1;
  }
  return cuenta;
}

// Cuantas preguntas se han contestado en total, para el contador de la
// portada. Sale de una funcion y no de un select porque item_stats tiene
// RLS sin politicas y tiene que seguir cerrada: esa tabla dice cuantas
// veces se acerto cada item, y abierta le diria al estudiante cuales son
// los faciles. La funcion devuelve solo el total.
export async function traerPracticadas(): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc("total_practicadas");
    if (error) throw error;
    const n = Number(data);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// --- Simulacros ---

// La lista de cuadernillos. Sale de una funcion y no de un select porque
// las tablas simulacros y simulacro_items quedaron cerradas con RLS: si
// se pudiera leer simulacro_items de frente, cualquiera sabria de antemano
// cuales cuarenta preguntas trae el cuadernillo.
export async function listarSimulacros(): Promise<SimulacroResumen[]> {
  const { data, error } = await supabase.rpc("listar_simulacros");
  if (error) throw error;
  return (data ?? []) as SimulacroResumen[];
}

// Un cuadernillo tiene que traer preguntas, y cada pregunta sus opciones
// con UNA correcta. Se revisa antes de devolverlo en vez de confiar en la
// asercion de tipo: un item con opciones en null reventaria adentro de
// ItemRenderer a mitad del examen, y ahi el chiquito se queda con la
// pantalla en blanco y sin salida. Mejor decirle que no se pudo abrir.
function cuadernilloSano(d: unknown): d is Simulacro {
  if (typeof d !== "object" || d === null) return false;
  const c = d as Record<string, unknown>;
  if (typeof c.slug !== "string" || !Array.isArray(c.items) || c.items.length === 0) return false;
  return (c.items as unknown[]).every((x) => {
    if (typeof x !== "object" || x === null) return false;
    const i = x as Record<string, unknown>;
    if (typeof i.id !== "string" || typeof i.enunciado !== "string") return false;
    if (!Array.isArray(i.opciones) || i.opciones.length < 2) return false;
    let correctas = 0;
    for (const o of i.opciones as unknown[]) {
      if (typeof o !== "object" || o === null) return false;
      const op = o as Record<string, unknown>;
      if (typeof op.id !== "string" || typeof op.texto !== "string") return false;
      if (op.es_correcta === true) correctas += 1;
    }
    return correctas === 1;
  });
}

// Un cuadernillo completo, en su orden fijo y con las opciones barajadas
// por el servidor. Devuelve null si el slug no existe, no esta publicado
// o si lo que llego no calza.
export async function traerSimulacro(slug: string): Promise<Simulacro | null> {
  // Con corte a los quince segundos. supabase-js no le pone limite al
  // fetch, y en una conexion estancada (el wifi del cole, tipico) el
  // boton se quedaba en "Preparando…" para siempre, sin error y sin
  // manera de arrepentirse.
  const { data, error } = await supabase
    .rpc("traer_simulacro", { p_slug: slug })
    .abortSignal(AbortSignal.timeout(15000));
  if (error) throw error;
  if (!cuadernilloSano(data)) return null;
  return data;
}
