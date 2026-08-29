# Primaria · práctica de ítems para sexto grado

Web app gratuita de práctica de ítems estandarizados para estudiantes de sexto
grado de Costa Rica. Cuatro materias: Español, Estudios Sociales, Ciencias y
Matemáticas. Sin cuentas, sin costo y sin datos personales.

Producto de ProfeSeguro.com y EVI. La versión que funciona sin internet vive
aparte en practicaprimaria.profeseguro.com.

## Stack

React 19 + Vite + TypeScript · Supabase (base y storage) · Vercel (despliegue).

## Cómo se corre en local

```bash
pnpm install
cp .env.example .env.local   # y se llena la llave anon del panel de Supabase
pnpm dev
```

## Verificación antes de subir

```bash
pnpm exec tsc -b --noEmit
pnpm exec vite build
```

Si cualquiera de los dos falla, no se sube. Punto.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Llave pública. Es pública a propósito: lo que protege los datos es el RLS de la base. |

## Estructura

```
src/
  config.ts            constantes del sitio y de las materias
  index.css            tokens de color y base (contrastes AA calculados)
  lib/                 cliente de Supabase, tipos y llamadas a la base
  components/          Nav, Footer, ItemRenderer, estados de carga
  pages/               las siete páginas
```

## Accesibilidad

Contrastes WCAG AA calculados con la fórmula oficial, no a ojo. Botones de
48 px mínimo. Foco visible. Acierto y error se marcan con color, ícono y
palabra, nunca solo con color.
