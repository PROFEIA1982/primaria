import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import InicioPage from "./pages/InicioPage";
import { Cargando } from "./components/Estados";

// El inicio va directo porque es la primera pantalla. Lo demas se carga
// cuando hace falta: asi un celular con datos lentos no baja el motor de
// formulas ni la practica completa solo para ver la portada.
const PracticaPage = lazy(() => import("./pages/PracticaPage"));
const SimulacrosPage = lazy(() => import("./pages/SimulacrosPage"));
const IndiceSimulacros = lazy(() =>
  import("./pages/SimulacrosPage").then((m) => ({ default: m.IndiceSimulacros })),
);
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

// Las cuatro paginas de materia son pantalla de trabajo: el chiquito esta
// contestando y el pie, con sus enlaces, telefonos y redes, lo saca de ahi.
// El pie se queda donde sirve de verdad, que es donde uno anda buscando
// informacion: el inicio y contacto.
// La portada de simulacros si lleva pie: ahi el chiquito esta escogiendo,
// no contestando. Las paginas de materia con el cuadernillo abierto no.
const RUTAS_CON_PIE = ["/", "/contacto", "/simulacros"];

// El armazon vive dentro del router porque useLocation necesita el contexto
// que abre BrowserRouter. App queda por fuera y solo monta el router.
function Armazon() {
  const { pathname } = useLocation();
  // Se limpia la barra final para que "/contacto/" no se quede sin pie.
  const ruta = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const llevaPie = RUTAS_CON_PIE.includes(ruta);

  return (
    <>
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
            <Route path="/simulacros" element={<IndiceSimulacros />} />
            <Route path="/simulacros/espanol" element={<SimulacrosPage materia="espanol" />} />
            <Route path="/simulacros/estudios-sociales" element={<SimulacrosPage materia="estudios-sociales" />} />
            <Route path="/simulacros/ciencias" element={<SimulacrosPage materia="ciencias" />} />
            <Route path="/simulacros/matematicas" element={<SimulacrosPage materia="matematicas" />} />
            <Route path="/contacto" element={<ContactoPage />} />
            {/* El aviso para docentes ya vive dentro de inicio y contacto.
                La ruta vieja se conserva para no romper enlaces ya repartidos. */}
            <Route path="/anuncios" element={<LlevarAlAviso />} />
            <Route path="*" element={<NoEncontradaPage />} />
          </Routes>
        </Suspense>
      </main>
      {llevaPie && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Armazon />
    </BrowserRouter>
  );
}
