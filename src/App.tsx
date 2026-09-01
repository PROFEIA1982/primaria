import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import AccesibilidadFlotante, { AccesibilidadMovil } from "./components/Accesibilidad";
import Footer from "./components/Footer";
import InicioPage from "./pages/InicioPage";
import { Cargando } from "./components/Estados";
import { useConcentracion } from "./lib/concentracion";

// El inicio va directo porque es la primera pantalla. Lo demas se carga
// cuando hace falta: asi un celular con datos lentos no baja el motor de
// formulas ni la practica completa solo para ver la portada.
const PracticaPage = lazy(() => import("./pages/PracticaPage"));
const SimulacrosPage = lazy(() => import("./pages/SimulacrosPage"));
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
const RUTAS_CON_PIE = ["/", "/contacto"];

// El armazon vive dentro del router porque useLocation necesita el contexto
// que abre BrowserRouter. App queda por fuera y solo monta el router.
// Al navegar, el navegador conserva el desplazamiento. El chiquito baja
// hasta "Las cuatro materias" en la portada, toca Matematicas, y cae en la
// pagina nueva a media altura: sin ver el titulo ni la ilustracion, como si
// la app se hubiera saltado un pedazo. Esto la sube al inicio.
//
// Se salta cuando la navegacion trae `irA`, porque en ese caso la pagina de
// destino ya lleva ella misma al bloque que corresponde.
function SubirAlCambiar() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (state && typeof state === "object" && "irA" in state) return;
    window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
}

function Armazon() {
  const { pathname } = useLocation();
  // Se limpia la barra final para que "/contacto/" no se quede sin pie.
  const ruta = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const llevaPie = RUTAS_CON_PIE.includes(ruta);
  // Mientras contesta, el menu se va. La pagina del examen ya trae su
  // propio boton de salir, asi que nadie queda encerrado.
  const concentrado = useConcentracion();

  return (
    <>
      <a className="ps-saltar" href="#contenido">Saltar al contenido</a>
      <SubirAlCambiar />
      {!concentrado && <Nav />}
      <main id="contenido" tabIndex={-1}>
        <Suspense fallback={<div className="ps-contenedor ps-seccion"><Cargando /></div>}>
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/espanol" element={<PracticaPage materia="espanol" />} />
            <Route path="/estudios-sociales" element={<PracticaPage materia="estudios-sociales" />} />
            <Route path="/ciencias" element={<PracticaPage materia="ciencias" />} />
            <Route path="/matematicas" element={<PracticaPage materia="matematicas" />} />
            {/* /simulacros ya no tiene pagina propia: el menu lleva
                directo a la materia. La ruta se conserva y redirige, para
                no romper un enlace que alguien ya haya guardado. */}
            <Route path="/simulacros" element={<Navigate to="/simulacros/espanol" replace />} />
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
      {llevaPie && !concentrado && <Footer />}
      {/* Los ajustes de accesibilidad, flotando abajo a la izquierda. Van
          al final del documento y no en el encabezado: asi quien navega
          con teclado llega primero al menu y al contenido, que es lo que
          viene a hacer. En celular esto no se ve; ahi el mismo panel vive
          dentro de la hamburguesa. */}
      <AccesibilidadFlotante />
      {/* Y su gemela de celular y tablet: barra fija abajo, donde llega el
          pulgar. Cada una se apaga sola con CSS en el ancho de la otra. */}
      <AccesibilidadMovil />
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
