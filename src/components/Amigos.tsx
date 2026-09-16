// ============================================================
// Los amigos del bosque, dibujados en SVG.
//
// Van como símbolos en un sprite que se monta una sola vez en App, y cada
// <Mascota id="tucan" /> los reutiliza con <use>. Son formas simples a
// propósito (círculos, elipses, trazos): pesan nada, escalan a cualquier
// tamaño y respetan el modo de grises con el mismo filtro que las demás
// imágenes.
// ============================================================

import type { CSSProperties } from "react";

export function SpriteAmigos() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <symbol id="s-estrella" viewBox="0 0 24 24">
        <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#FFB020" stroke="#E89A00" strokeWidth="1.2" strokeLinejoin="round" />
      </symbol>

      <symbol id="m-perezoso" viewBox="0 0 120 120">
        <path d="M14 30 Q60 6 106 30" stroke="#7A5A3A" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M28 30 v22 M92 30 v22" stroke="#8C6A45" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="60" cy="78" rx="38" ry="32" fill="#A98456" />
        <ellipse cx="60" cy="72" rx="26" ry="20" fill="#E9D3B0" />
        <path d="M40 66 q10 -6 14 4 M66 70 q4 -10 14 -4" stroke="#5C3F26" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="48" cy="70" r="3.5" fill="#1C2B2A" /><circle cx="72" cy="70" r="3.5" fill="#1C2B2A" />
        <ellipse cx="60" cy="80" rx="5" ry="3.5" fill="#5C3F26" />
        <path d="M52 87 q8 6 16 0" stroke="#5C3F26" strokeWidth="3" fill="none" strokeLinecap="round" />
      </symbol>

      <symbol id="m-tucan" viewBox="0 0 120 120">
        <ellipse cx="52" cy="72" rx="30" ry="36" fill="#1C2B2A" />
        <ellipse cx="52" cy="76" rx="16" ry="24" fill="#FFD84D" />
        <circle cx="52" cy="44" r="22" fill="#1C2B2A" />
        <circle cx="52" cy="46" r="15" fill="#FFD84D" />
        <circle cx="56" cy="44" r="5" fill="#fff" /><circle cx="57" cy="44" r="2.8" fill="#1C2B2A" />
        <path d="M62 40 q40 -10 46 10 q-6 12 -46 8 z" fill="#FF8A2A" />
        <path d="M62 48 q34 2 44 4 q-10 8 -44 6 z" fill="#E8593C" />
        <path d="M40 106 l6 -8 l6 8 M56 106 l6 -8 l6 8" stroke="#6D9BFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      </symbol>

      <symbol id="m-rana" viewBox="0 0 120 120">
        <ellipse cx="60" cy="78" rx="36" ry="26" fill="#3CC46A" />
        <ellipse cx="60" cy="86" rx="22" ry="12" fill="#BFE9C8" />
        <circle cx="38" cy="54" r="15" fill="#3CC46A" /><circle cx="82" cy="54" r="15" fill="#3CC46A" />
        <circle cx="38" cy="54" r="9.5" fill="#E8382E" /><circle cx="82" cy="54" r="9.5" fill="#E8382E" />
        <ellipse cx="38" cy="54" rx="2.6" ry="7" fill="#1C2B2A" /><ellipse cx="82" cy="54" rx="2.6" ry="7" fill="#1C2B2A" />
        <path d="M48 76 q12 8 24 0" stroke="#1E7A44" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M24 96 q-8 8 4 12 M96 96 q8 8 -4 12" stroke="#FF8A2A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="108" r="4" fill="#FF8A2A" /><circle cx="92" cy="108" r="4" fill="#FF8A2A" />
      </symbol>

      <symbol id="m-mono" viewBox="0 0 120 120">
        <path d="M92 70 q26 -4 18 24 q-6 14 -20 6" stroke="#4A2E1C" strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="58" cy="80" rx="32" ry="28" fill="#5A3A22" />
        <circle cx="58" cy="48" r="26" fill="#5A3A22" />
        <circle cx="34" cy="48" r="9" fill="#5A3A22" /><circle cx="82" cy="48" r="9" fill="#5A3A22" />
        <circle cx="34" cy="48" r="5" fill="#D9A57A" /><circle cx="82" cy="48" r="5" fill="#D9A57A" />
        <ellipse cx="58" cy="54" rx="17" ry="14" fill="#D9A57A" />
        <circle cx="50" cy="48" r="3.5" fill="#1C2B2A" /><circle cx="66" cy="48" r="3.5" fill="#1C2B2A" />
        <path d="M50 60 q8 6 16 0" stroke="#1C2B2A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="58" cy="84" rx="16" ry="12" fill="#D9A57A" />
      </symbol>

      <symbol id="m-morpho" viewBox="0 0 120 120">
        <path d="M60 60 C30 20 6 30 12 56 C16 74 40 80 58 66 Z" fill="#2F6BFF" />
        <path d="M60 60 C90 20 114 30 108 56 C104 74 80 80 62 66 Z" fill="#2F6BFF" />
        <path d="M60 64 C36 74 22 96 34 104 C44 110 56 90 60 72 Z" fill="#4C86FF" />
        <path d="M60 64 C84 74 98 96 86 104 C76 110 64 90 60 72 Z" fill="#4C86FF" />
        <path d="M60 60 C40 40 24 44 24 56" stroke="#1C2B2A" strokeWidth="3" fill="none" opacity=".35" />
        <path d="M60 60 C80 40 96 44 96 56" stroke="#1C2B2A" strokeWidth="3" fill="none" opacity=".35" />
        <ellipse cx="60" cy="66" rx="5" ry="22" fill="#1C2B2A" />
        <path d="M56 46 q-6 -12 -14 -14 M64 46 q6 -12 14 -14" stroke="#1C2B2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </symbol>

      <symbol id="m-tortuga" viewBox="0 0 120 120">
        <ellipse cx="62" cy="70" rx="38" ry="28" fill="#2F9E6B" />
        <ellipse cx="62" cy="68" rx="26" ry="18" fill="#3CC46A" />
        <path d="M42 62 l10 -8 l14 2 l10 10 l-6 12 l-16 2 l-10 -8 z" fill="#2F9E6B" />
        <ellipse cx="24" cy="58" rx="14" ry="11" fill="#5FD08A" />
        <circle cx="20" cy="55" r="3" fill="#1C2B2A" />
        <path d="M30 92 q-14 8 -8 14 M92 92 q14 8 8 14 M30 46 q-16 -6 -14 -14 M96 50 q14 -8 10 -16" stroke="#5FD08A" strokeWidth="9" fill="none" strokeLinecap="round" />
      </symbol>

      <symbol id="m-quetzal" viewBox="0 0 120 120">
        <path d="M56 84 q-8 24 -14 32 M62 84 q2 24 -2 34 M68 84 q10 22 10 32" stroke="#17A673" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="60" cy="66" rx="24" ry="30" fill="#17A673" />
        <ellipse cx="60" cy="76" rx="14" ry="18" fill="#E8382E" />
        <circle cx="60" cy="38" r="18" fill="#17A673" />
        <path d="M44 28 q10 -14 26 -6" stroke="#0E7A54" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="66" cy="38" r="4.5" fill="#fff" /><circle cx="67" cy="38" r="2.5" fill="#1C2B2A" />
        <path d="M76 40 l12 4 l-12 4 z" fill="#FFD84D" />
      </symbol>

      <symbol id="m-jaguar" viewBox="0 0 120 120">
        <ellipse cx="60" cy="80" rx="36" ry="26" fill="#F2B84B" />
        <circle cx="60" cy="50" r="28" fill="#F2B84B" />
        <circle cx="36" cy="30" r="10" fill="#F2B84B" /><circle cx="84" cy="30" r="10" fill="#F2B84B" />
        <circle cx="36" cy="30" r="5" fill="#1C2B2A" opacity=".5" /><circle cx="84" cy="30" r="5" fill="#1C2B2A" opacity=".5" />
        <g fill="#5A3A22"><circle cx="38" cy="58" r="4" /><circle cx="82" cy="60" r="4" /><circle cx="34" cy="86" r="4" /><circle cx="88" cy="88" r="4" /><circle cx="60" cy="100" r="4" /><circle cx="44" cy="24" r="3" /><circle cx="76" cy="22" r="3" /></g>
        <ellipse cx="60" cy="60" rx="14" ry="10" fill="#FFF0CC" />
        <circle cx="50" cy="48" r="4" fill="#1C2B2A" /><circle cx="70" cy="48" r="4" fill="#1C2B2A" />
        <ellipse cx="60" cy="58" rx="4" ry="3" fill="#1C2B2A" />
        <path d="M52 66 q8 5 16 0" stroke="#1C2B2A" strokeWidth="3" fill="none" strokeLinecap="round" />
      </symbol>
    </svg>
  );
}

type Props = {
  id: string;
  /** Tamaño en píxeles (ancho y alto). */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Texto alternativo. Vacío = decorativa (lo normal, el nombre va al lado). */
  alt?: string;
};

export function Mascota({ id, size = 96, className, style, alt = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={style}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      focusable="false"
    >
      <use href={`#m-${id}`} />
    </svg>
  );
}

export function Estrella({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <use href="#s-estrella" />
    </svg>
  );
}
