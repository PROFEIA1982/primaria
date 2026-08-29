// ============================================================
// Constantes del proyecto. Un solo lugar para cambiarlas.
// ============================================================

// La llave anon es publica a proposito: viaja al navegador en cualquier
// app de Supabase. Lo que protege los datos es el RLS, no esconderla.
const env = import.meta.env as Record<string, string | undefined>;
export const SUPABASE_URL =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mvgivfexfeukdznzjsxx.supabase.co";
export const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const NOMBRE_SITIO = "Práctica Estandarizada Primaria";
export const EMPRESA = "Educación Virtual Integral EVI S.A.";

// --- Contacto ---
export const WA_NUMERO = "50683190393";
export const WA_SOPORTE = "50687467333";
export const TELEFONO_VISIBLE = "+506 8319-0393";
export const SOPORTE_VISIBLE = "+506 8746-7333";
export const CORREO = "andres@profeseguro.com";

// --- Enlaces ---
export const URL_OFFLINE = "https://practicaprimaria.profeseguro.com";
export const URL_IDONEA = "https://idonea.profeseguro.com";
export const URL_PROFESEGURO = "https://profeseguro.com";
export const URL_FACEBOOK = "https://www.facebook.com/people/EVI-Costa-Rica/100043146595090/";
export const URL_YOUTUBE = "https://www.youtube.com/@idoneidadmep";
export const URL_YOUTUBE_ECOS = "https://www.youtube.com/@ECOSDelAprendizaje";

// Enlace del boton de simulacros para docentes. Es el formato largo que
// pidio el cliente, con el mensaje ya escrito.
export const WA_SIMULACROS =
  "https://api.whatsapp.com/send/?phone=50683190393&text=Hola%2C+quiero+informaci%C3%B3n+sobre+los+simulacros+de+idoneidad&type=phone_number&app_absent=0";

// Arma el enlace corto de WhatsApp con el mensaje ya escrito.
// Formato corto a proposito: el largo se corta cuando alguien lo pega
// dentro de un correo.
export function waLink(texto: string, numero: string = WA_NUMERO): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

// Dos minutos por item. Decision del 29 de agosto de 2026: con tres minutos
// una practica de 60 items dura tres horas y ningun chiquito la termina.
export const SEGUNDOS_POR_ITEM = 120;

// Las cantidades que puede elegir el estudiante.
export const CANTIDADES = [10, 20, 30, 60] as const;

// Los slugs calzan exacto con la columna slug de la tabla materias
// y con la ruta de la app. Se usa guion, no guion bajo.
export const MATERIAS = [
  { slug: "espanol", nombre: "Español", corto: "Español", color: "var(--espanol)", suave: "var(--espanol-suave)", emoji: "📚" },
  { slug: "estudios-sociales", nombre: "Estudios Sociales", corto: "Est. Sociales", color: "var(--sociales)", suave: "var(--sociales-suave)", emoji: "🌎" },
  { slug: "ciencias", nombre: "Ciencias", corto: "Ciencias", color: "var(--ciencias)", suave: "var(--ciencias-suave)", emoji: "🔬" },
  { slug: "matematicas", nombre: "Matemáticas", corto: "Matemáticas", color: "var(--mate)", suave: "var(--mate-suave)", emoji: "🔢" },
] as const;

export type SlugMateria = (typeof MATERIAS)[number]["slug"];
