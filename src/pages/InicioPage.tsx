import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  CircleCheckBig,
  Globe,
  GraduationCap,
  ListOrdered,
  Microscope,
  Download,
  MousePointerClick,
  Smartphone,
  Timer,
  WifiOff,
} from "lucide-react";
import { IMG_HERO, MATERIAS, URL_DESCARGA_OFFLINE, URL_OFFLINE, type SlugMateria } from "../config";
import { traerConteos, type ConteoMateria } from "../lib/api";
import { Cargando, ErrorCarga } from "../components/Estados";
import BloqueDocentes from "../components/BloqueDocentes";
import "./InicioPage.css";

// Un icono por materia. Se elige por slug para no depender del orden.
const ICONOS: Record<SlugMateria, typeof BookOpen> = {
  espanol: BookOpen,
  "estudios-sociales": Globe,
  ciencias: Microscope,
  matematicas: Calculator,
};

const PASOS = [
  { icono: MousePointerClick, titulo: "Elegí la materia", texto: "Vos escogés." },
  { icono: ListOrdered, titulo: "Escogé cuántas preguntas", texto: "Diez si andás con poco tiempo. Sesenta si querés entrenar en serio, como el día de la prueba." },
  { icono: Timer, titulo: "Respondé a tu ritmo", texto: "Hay reloj, pero solo para que te acostumbrés. Esta nota no va al cuaderno." },
  { icono: CircleCheckBig, titulo: "Mirá tus resultados", texto: "Vas a ver en cuáles te equivocaste, con la respuesta buena al lado." },
];

export default function InicioPage() {
  const [conteos, setConteos] = useState<ConteoMateria[] | null>(null);
  const [fallo, setFallo] = useState(false);

  async function cargar() {
    setFallo(false);
    setConteos(null);
    try {
      setConteos(await traerConteos());
    } catch {
      setFallo(true);
    }
  }

  useEffect(() => { void cargar(); }, []);

  return (
    <>
      {/* 1 · Hero */}
      <section id="inicio-hero" style={{ ["--hero" as string]: `url(${IMG_HERO})` }}>
        <div className="ps-contenedor">
          <span className="hero-icono" aria-hidden="true">
            <GraduationCap size={48} strokeWidth={1.8} />
          </span>
          <h1>Practicá para tu prueba de sexto</h1>
          <p className="hero-bajada">
            Preguntas de las cuatro materias para que llegués con calma el día de
            la prueba. Es gratis y no hay que hacer ninguna cuenta.
          </p>
          <a className="ps-boton hero-boton" href="#inicio-materias">
            Elegí tu materia →
          </a>
          <p className="hero-nota">Entrás y practicás. Así de simple.</p>
        </div>
      </section>

      {/* 2 · Como funciona */}
      <section id="inicio-pasos" className="ps-contenedor">
        <h2>¿Cómo funciona?</h2>
        <ol className="pasos-rejilla">
          {PASOS.map((p, i) => {
            const Icono = p.icono;
            return (
              <li className="paso" key={p.titulo}>
                <span className="paso-numero" aria-hidden="true">{i + 1}</span>
                <Icono size={34} strokeWidth={1.7} aria-hidden="true" />
                <span className="paso-titulo">{p.titulo}</span>
                <p>{p.texto}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 3 · Materias */}
      <section id="inicio-materias">
        <div className="ps-contenedor">
          <h2>Las cuatro materias</h2>

          {conteos === null && !fallo && <Cargando texto="Buscando las preguntas…" />}
          {fallo && (
            <ErrorCarga
              mensaje="No se cargaron las materias."
              alReintentar={() => void cargar()}
            />
          )}

          {conteos !== null && (
            <ul className="materias-rejilla">
              {MATERIAS.map((m) => {
                const Icono = ICONOS[m.slug];
                const dato = conteos.find((c) => c.slug === m.slug);
                const cuantas = dato?.items ?? 0;
                return (
                  <li key={m.slug}>
                    <Link
                      to={`/${m.slug}`}
                      className="materia-tarjeta"
                      style={{
                        ["--acento" as string]: m.color,
                        ["--suave" as string]: m.suave,
                      }}
                    >
                      <span className="materia-icono" aria-hidden="true">
                        <Icono size={30} strokeWidth={1.8} />
                      </span>
                      <span className="materia-nombre">{m.nombre}</span>
                      <span className="materia-cuenta">
                        {cuantas > 0
                          ? `${cuantas} ${cuantas === 1 ? "pregunta" : "preguntas"} para practicar`
                          : "Todavía no hay preguntas acá"}
                      </span>
                      <span className="materia-cta">Practicá →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 4 · Que son las pruebas */}
      <section id="inicio-info" className="ps-contenedor">
        <h2>¿Para qué te sirve esta práctica?</h2>
        <div className="info-texto">
          <p>
            En sexto grado, al terminar el año, se aplican pruebas estandarizadas
            en todo el país. Son de escoger: te dan una pregunta y cuatro opciones,
            y vos marcás la que creés correcta. Nada más.
          </p>
          <p>
            Acá vas a encontrar preguntas del mismo tipo, para que cuando llegue el
            día ya sepás cómo se leen y cuánto tiempo te toma cada una. Eso es media
            batalla ganada. La otra media la ganás en clase, con tu maestra.
          </p>
          <p>
            Esto no es un examen. Nadie ve tu nota, nadie te la pide y no queda
            guardada en ningún lado. Practicá las veces que querás. No cuesta un
            cinco.
          </p>
        </div>
      </section>

      {/* 5 · Aviso para maestros y familias */}
      <BloqueDocentes variante="discreta" />

      {/* 6 · Practica sin internet */}
      <section id="inicio-sin-internet">
        <div className="ps-contenedor">
          <span className="sin-net-icono" aria-hidden="true">
            <WifiOff size={34} strokeWidth={1.7} />
          </span>
          <h2>Práctica sin internet</h2>
          <p className="sin-net-bajada">
            En muchas escuelas la señal va y viene. Por eso hay un archivo que se
            descarga una sola vez y después funciona solo, sin conexión. Se lo
            pasás a los estudiantes en una llave maya y listo.
          </p>

          <ul className="sin-net-tarjetas">
            <li className="sin-net-tarjeta">
              <span className="sin-net-num" aria-hidden="true">50</span>
              <span className="sin-net-titulo">Cincuenta preguntas por materia</span>
              <p>
                Doscientas en total, de las cuatro materias, con la respuesta
                correcta y una explicación en palabras sencillas.
              </p>
            </li>
            <li className="sin-net-tarjeta">
              <span className="sin-net-icono-chico" aria-hidden="true">
                <Smartphone size={30} strokeWidth={1.7} />
              </span>
              <span className="sin-net-titulo">Se abre en compu o celular</span>
              <p>
                Es un solo archivo. Se toca dos veces y se abre en el navegador
                que ya tenga el aparato. No hay que instalar nada.
              </p>
            </li>
            <li className="sin-net-tarjeta">
              <span className="sin-net-icono-chico" aria-hidden="true">
                <WifiOff size={30} strokeWidth={1.7} />
              </span>
              <span className="sin-net-titulo">No gasta datos</span>
              <p>
                Una vez guardado en el aparato, ya no vuelve a pedir internet.
                Sirve igual en el aula, en la casa o en el bus.
              </p>
            </li>
          </ul>

          <div className="sin-net-pasos">
            <h3>Cómo se usa</h3>
            <ol>
              <li>Tocá el botón de descarga. Se guarda un archivo que termina en <code>.html</code>.</li>
              <li>Buscalo en la carpeta de descargas y abrilo con doble clic. Si es celular, tocalo una vez.</li>
              <li>Se abre como una página normal. Elegí la materia y practicá.</li>
              <li>Para compartirlo, pasalo por WhatsApp, correo o llave maya. Funciona igual en la otra máquina.</li>
            </ol>
          </div>

          <div className="sin-net-acciones">
            <a className="ps-boton sin-net-boton" href={URL_DESCARGA_OFFLINE} download>
              <Download size={20} strokeWidth={2} aria-hidden="true" />
              Descargar la práctica (5 MB)
            </a>
            <a
              className="ps-boton sin-net-enlace"
              href={URL_OFFLINE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrí la versión en línea →
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
