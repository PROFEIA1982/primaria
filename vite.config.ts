import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // La integracion de Supabase con Vercel inyecta NEXT_PUBLIC_SUPABASE_*.
  // Aceptar ese prefijo evita tener que duplicar las variables a mano.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
