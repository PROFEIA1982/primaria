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
