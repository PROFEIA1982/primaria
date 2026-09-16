import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { purgarCopiasViejas } from "./lib/versionBanco";

// Antes de pintar nada: si el banco cambio desde la ultima visita, se
// botan las practicas y simulacros a medias que traen preguntas viejas.
purgarCopiasViejas();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
