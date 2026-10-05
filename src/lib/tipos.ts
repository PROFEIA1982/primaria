// Tipos que devuelve la base. Calzan con lo que arma sortear_items().

export type Opcion = {
  id: string;
  texto: string;
  es_correcta: boolean;
};

export type Item = {
  id: string;
  enunciado: string;
  imagen_url: string | null;
  imagen_alt: string | null;
  tiene_latex: boolean;
  retroalimentacion: string | null;
  tema_id: number | null;
  tema: string | null;
  opciones: Opcion[];
};

export type Materia = {
  id: number;
  slug: string;
  nombre: string;
  color: string;
  color_suave: string;
  emoji: string | null;
  orden: number;
};

export type Tema = {
  id: number;
  materia_id: number;
  slug: string;
  nombre: string;
  orden: number;
};

// --- Simulacros ---
// Cuadernillos fijos de 40 preguntas. Lo que cambia entre un intento y
// otro es solo el orden de las opciones; las preguntas son las mismas.

export type SimulacroResumen = {
  slug: string;
  numero: number;
  titulo: string;
  materia_slug: string;
  materia_nombre: string;
  cantidad: number;
  /** Solo los simulacros nuevos lo traen de la base. Sin el, manda la
   *  constante de config.ts, como siempre. */
  segundos_por_item?: number;
  /** Simulacros nuevos: los temas del examen, en el orden en que salen. */
  temas?: string[];
};

export type Simulacro = {
  slug: string;
  numero: number;
  titulo: string;
  materia_slug: string;
  materia_nombre: string;
  /** Ver SimulacroResumen.segundos_por_item. */
  segundos_por_item?: number;
  items: Item[];
};
