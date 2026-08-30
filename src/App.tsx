import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InicioPage from "./pages/InicioPage";
import { Cargando } from "./components/Estados";

// El inicio va directo porque es la primera pantalla. Lo demas se carga
// cuando hace falta: asi un celular con datos lentos no baja el motor de
// formulas ni la practica completa solo para ver la portada.
const PracticaPage = lazy(() => import("./pages/PracticaPage"));
const ContactoPage = lazy(() => import("./pages/ContactoPage"));
const NoEncontradaPage = lazy(() => import("./pages/NoEncontradaPage"));

// La ruta vieja /anuncios manda a contacto y le avisa a esa pagina que baje
// hasta el aviso. No se hace el scroll aca: en cuanto se navega, este
// componente se desmonta y cualquier temporizador suyo muere con el.
function LlevarAlAviso() {
  const navegar = useNavigate();
  useEffect(() => {
    navegar("/contacto", { replace: true, state: { irA: "docentes-contacto" } });
  }, [navegar]);
  return null;
}

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
            {/* El aviso para docentes ya vive dentro de inicio y contacto.
                La ruta vieja se conserva para no romper enlaces ya repartidos. */}
            <Route path="/anuncios" element={<LlevarAlAviso />} />
            <Route path="*" element={<NoEncontradaPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
