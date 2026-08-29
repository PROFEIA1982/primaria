import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InicioPage from "./pages/InicioPage";
import { Cargando } from "./components/Estados";

// El inicio va directo porque es la primera pantalla. Lo demas se carga
// cuando hace falta: asi un celular con datos lentos no baja el motor de
// formulas ni la practica completa solo para ver la portada.
const PracticaPage = lazy(() => import("./pages/PracticaPage"));
const ContactoPage = lazy(() => import("./pages/ContactoPage"));
const AnunciosPage = lazy(() => import("./pages/AnunciosPage"));
const NoEncontradaPage = lazy(() => import("./pages/NoEncontradaPage"));

export default function App() {
  return (
    <BrowserRouter>
      <a className="ps-saltar" href="#contenido">Saltar al contenido</a>
      <Nav />
      <main id="contenido" tabIndex={-1}>
        <Suspense fallback={<div className="ps-contenedor ps-seccion"><Cargando /></div>}>
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/espanol" element={<PracticaPage materia="espanol" />} />
            <Route path="/estudios-sociales" element={<PracticaPage materia="estudios-sociales" />} />
            <Route path="/ciencias" element={<PracticaPage materia="ciencias" />} />
            <Route path="/matematicas" element={<PracticaPage materia="matematicas" />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/anuncios" element={<AnunciosPage />} />
            <Route path="*" element={<NoEncontradaPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
