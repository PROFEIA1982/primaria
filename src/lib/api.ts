import { supabase } from "./supabase";
import type { Item, Materia, Tema } from "./tipos";

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
