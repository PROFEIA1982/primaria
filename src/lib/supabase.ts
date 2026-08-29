import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";

const faltaConfig = !SUPABASE_URL || !SUPABASE_ANON_KEY;

if (faltaConfig) {
  // Aviso claro en consola en vez de un error raro a media pagina.
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
}

// Si falta la llave se pasa un valor de relleno: createClient revienta con
// cadena vacia y eso dejaria la pagina en blanco. Asi la app carga, las
// consultas fallan con un error manejado y el usuario ve el estado de error.
export const supabase = createClient(
  SUPABASE_URL || "https://sin-configurar.supabase.co",
  SUPABASE_ANON_KEY || "sin-llave",
  { auth: { persistSession: false } }, // esta app no tiene cuentas
);
