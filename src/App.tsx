import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InicioPage from "./pages/InicioPage";
import PracticaPage from "./pages/PracticaPage";
import ContactoPage from "./pages/ContactoPage";
import AnunciosPage from "./pages/AnunciosPage";
import NoEncontradaPage from "./pages/NoEncontradaPage";

// Las siete rutas. Las cuatro materias comparten PracticaPage,
// parametrizada por el slug, para no duplicar codigo.
export default function App() {
  return (
    <BrowserRouter>
      <a className="ps-saltar" href="#contenido">Saltar al contenido</a>
      <Nav />
      <main id="contenido">
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
      </main>
      <Footer />
    </BrowserRouter>
  );
}
