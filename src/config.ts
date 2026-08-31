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

// Las imagenes del sitio viven en el CDN de Supabase, igual que las de los
// items. Asi el repo no carga con binarios y cada despliegue pesa menos.
const CDN = "https://mvgivfexfeukdznzjsxx.supabase.co/storage/v1/object/public/puente-repo/sitio/";
export const IMG_HERO = CDN + "hero-inicio.webp";
export const IMG_LOGO_EVI = CDN + "logo-evi.webp";
export const IMG_LOGO_CONCURSO = CDN + "logo-concurso-docente.png";
export const EMPRESA = "Educación Virtual Integral EVI S.A.";

// --- Contacto ---
export const WA_NUMERO = "50683190393";
export const WA_SOPORTE = "50687467333";
export const TELEFONO_VISIBLE = "+506 8319-0393";
export const SOPORTE_VISIBLE = "+506 8746-7333";
export const CORREO = "andres@profeseguro.com";

// --- Enlaces ---
export const URL_OFFLINE = "https://practicaprimaria.profeseguro.com";
// El archivo vive en el storage de Supabase y no en el repo: son cinco megas
// y no tiene sentido inflar cada despliegue con eso. El parametro download
// hace que el navegador lo baje en vez de abrirlo como texto.
export const URL_DESCARGA_OFFLINE =
  "https://mvgivfexfeukdznzjsxx.supabase.co/storage/v1/object/public/descargas/practica-sin-internet-primaria.html?download=practica-sin-internet-primaria.html";
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
//
// "arte" es el color de fondo que trae pintada la ilustracion del hero,
// medido del archivo pixel a pixel. En claro calza con la banda y no se
// ve; en oscuro le sirve de placa para que el dibujo no quede como un
// parche blanco flotando sobre el fondo negro.
export const MATERIAS = [
  { slug: "espanol", nombre: "Español", corto: "Español", color: "var(--espanol)", suave: "var(--espanol-suave)", arte: "#fdede3", emoji: "📚",
    hero: CDN + "hero-espanol.webp",
    gancho: "Leé, entendé y contestá con calma." },
  { slug: "estudios-sociales", nombre: "Estudios Sociales", corto: "Sociales", color: "var(--sociales)", suave: "var(--sociales-suave)", arte: "#f2ebfb", emoji: "🌎",
    hero: CDN + "hero-sociales.webp",
    gancho: "Costa Rica, su gente y su historia." },
  { slug: "ciencias", nombre: "Ciencias", corto: "Ciencias", color: "var(--ciencias)", suave: "var(--ciencias-suave)", arte: "#e9f5ef", emoji: "🔬",
    hero: CDN + "hero-ciencias.webp",
    gancho: "Del cuerpo humano al sistema solar." },
  { slug: "matematicas", nombre: "Matemáticas", corto: "Matemáticas", color: "var(--mate)", suave: "var(--mate-suave)", arte: "#e8f2fa", emoji: "🔢",
    hero: CDN + "hero-matematicas.webp",
    gancho: "Números, figuras y datos, paso a paso." },
] as const;

export type SlugMateria = (typeof MATERIAS)[number]["slug"];

// Lo que dice la tarjeta de instrucciones de cada materia. La cantidad de
// preguntas y el tiempo salen de los datos (no se escriben aca), pero el
// "foco" (que tipo de prueba es) y el "hacer" (que hace el chiquito) cambian
// segun la materia. Sin siglas ni promesas: solo lo que de verdad va a hacer.
export const GUIA_MATERIA: Record<SlugMateria, { foco: string; hacer: string }> = {
  espanol: {
    foco: "Comprensión de lectura",
    hacer: "Leés un texto y respondés preguntas sobre lo que dice.",
  },
  "estudios-sociales": {
    foco: "Geografía, historia y cívica",
    hacer: "Leés un texto corto sobre Costa Rica y respondés lo que entendiste.",
  },
  ciencias: {
    foco: "Comprensión de ciencias",
    hacer: "Leés una situación de ciencias y escogés la respuesta correcta.",
  },
  matematicas: {
    foco: "Resolución de problemas",
    hacer: "Resolvés un problema con números, figuras o datos.",
  },
};
