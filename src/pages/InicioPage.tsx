import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  CircleCheckBig,
  ClipboardList,
  Download,
  EyeOff,
  FolderOpen,
  Globe,
  GraduationCap,
  ListOrdered,
  Microscope,
  MousePointerClick,
  RefreshCw,
  Share2,
  Smartphone,
  Target,
  Timer,
  WifiOff,
} from "lucide-react";
import {
  IMG_HERO,
  MATERIAS,
  URL_DESCARGA_OFFLINE,
  URL_OFFLINE,
  waLink,
  type SlugMateria,
} from "../config";
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
  { icono: ListOrdered, titulo: "Escogé cuántas preguntas", texto: "Diez si andás con poco tiempo. Sesenta si querés entrenar en serio." },
  { icono: Timer, titulo: "Respondé a tu ritmo", texto: "Hay reloj, pero solo para que te acostumbrés." },
  { icono: CircleCheckBig, titulo: "Mirá tus resultados", texto: "Vas a ver en cuáles te equivocaste, con la respuesta buena al lado." },
];

// Lo que antes eran tres parrafos. El publico tiene doce anos: una idea corta
// por tarjeta y el detalle escondido en un details, para el que quiera mas.
const PARA_QUE = [
  {
    icono: ClipboardList,
    titulo: "Es la prueba de sexto",
    corto: "Al final del año se aplica en todo el país.",
    mas: "Son preguntas de escoger: te dan una pregunta y cuatro opciones, y vos marcás la que creés correcta.",
  },
  {
    icono: Target,
    titulo: "Preguntas del mismo tipo",
    corto: "Acá entrenás con preguntas parecidas.",
    mas: "Así, cuando llegue el día, ya sabés cómo se leen y cuánto tardás en cada una. Eso es media batalla ganada.",
  },
  {
    icono: EyeOff,
    titulo: "Nadie ve tu nota",
    corto: "Esto no es un examen.",
    mas: "Tu resultado no se guarda ni se le manda a nadie. Es solo para que vos sepás cómo vas.",
  },
  {
    icono: RefreshCw,
    titulo: "Repetí cuando querás",
    corto: "Es gratis y no hay que hacer cuenta.",
    mas: "Podés volver a la misma materia hoy, mañana y el otro mes, las veces que necesités.",
  },
];

// Fila 1 de "sin internet": que es. Fila 2: como se usa, con numero grande.
const SIN_NET_QUE = [
  {
    dato: "200",
    icono: null,
    titulo: "Doscientas preguntas",
    corto: "Cincuenta de cada materia.",
    mas: "Cada una trae la respuesta correcta y una explicación en palabras sencillas.",
  },
  {
    dato: null,
    icono: Smartphone,
    titulo: "Sirve en compu o celular",
    corto: "Es un solo archivo.",
    mas: "Se toca dos veces y se abre en el navegador que ya tenga el aparato. No hay que instalar nada.",
  },
  {
    dato: null,
    icono: WifiOff,
    titulo: "No gasta datos",
    corto: "Una vez guardado, no vuelve a pedir internet.",
    mas: "Sirve igual en el aula, en la casa o en el bus.",
  },
];

const SIN_NET_COMO = [
  {
    icono: Download,
    titulo: "Descargalo",
    corto: "Tocá el botón azul de abajo.",
    mas: "Se guarda un archivo que termina en .html. Pesa cinco megas y se baja una sola vez.",
  },
  {
    icono: FolderOpen,
    titulo: "Abrilo",
    corto: "Buscalo en la carpeta de descargas.",
    mas: "En compu, doble clic. En celular, un toque. Se abre como una página normal.",
  },
  {
    icono: Share2,
    titulo: "Pasalo",
    corto: "Por WhatsApp o en llave maya.",
    mas: "En la otra máquina funciona igual, aunque ahí no haya señal.",
  },
];

// wa.me sin numero abre la lista de contactos del telefono: es el enlace de
// compartir, no el de escribirle a EVI. Por eso el segundo argumento va vacio.
const WA_COMPARTIR = waLink(
  `Te paso la práctica de sexto grado para estudiar, sirve hasta sin internet: ${URL_OFFLINE}`,
  "",
);

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
                      // La tarjeta entera es el enlace. En modo de mejor
                      // vision los enlaces van subrayados, y aca eso le
                      // caeria a todo el texto de la tarjeta: data-tarjeta
                      // lo saca de esa regla (ver src/index.css).
                      data-tarjeta=""
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

      {/* 4 · Para que sirve */}
      <section id="inicio-info" className="ps-contenedor">
        <h2>¿Para qué te sirve esta práctica?</h2>
        <ul className="info-rejilla">
          {PARA_QUE.map((t) => {
            const Icono = t.icono;
            return (
              <li className="info-tarjeta" key={t.titulo}>
                <span className="info-icono" aria-hidden="true">
                  <Icono size={28} strokeWidth={1.8} />
                </span>
                <h3 className="info-titulo">{t.titulo}</h3>
                <p className="info-corto">{t.corto}</p>
                <details className="ps-mas">
                  <summary>
                    <span className="ps-mas-cerrado">Contame más</span>
                    <span className="ps-mas-abierto">Ya entendí</span>
                    <ChevronDown className="ps-mas-flecha" size={18} strokeWidth={2.2} aria-hidden="true" />
                  </summary>
                  <p>{t.mas}</p>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 5 · Aviso para maestros y familias */}
      <BloqueDocentes variante="discreta" />

      {/* 6 · Practica sin internet */}
      <section id="inicio-sin-internet">
        <div className="ps-contenedor">
          <div className="sin-net-encabezado">
            <span className="sin-net-icono" aria-hidden="true">
              <WifiOff size={34} strokeWidth={1.7} />
            </span>
            <h2>Práctica sin internet</h2>
            <p className="sin-net-bajada">
              Un archivo que se baja una vez y después funciona solo, aunque la
              señal se caiga.
            </p>
          </div>

          <h3 className="sin-net-rotulo">Qué trae</h3>
          <ul className="sin-net-rejilla">
            {SIN_NET_QUE.map((t) => {
              const Icono = t.icono;
              return (
                <li className="sin-net-tarjeta" key={t.titulo}>
                  {t.dato ? (
                    <span className="sin-net-num" aria-hidden="true">{t.dato}</span>
                  ) : Icono ? (
                    <span className="sin-net-icono-chico" aria-hidden="true">
                      <Icono size={28} strokeWidth={1.7} />
                    </span>
                  ) : null}
                  <h4 className="sin-net-titulo">{t.titulo}</h4>
                  <p className="sin-net-corto">{t.corto}</p>
                  <details className="ps-mas">
                    <summary>
                      <span className="ps-mas-cerrado">Contame más</span>
                      <span className="ps-mas-abierto">Ya entendí</span>
                      <ChevronDown className="ps-mas-flecha" size={18} strokeWidth={2.2} aria-hidden="true" />
                    </summary>
                    <p>{t.mas}</p>
                  </details>
                </li>
              );
            })}
          </ul>

          <h3 className="sin-net-rotulo">Cómo se usa</h3>
          <ol className="sin-net-rejilla sin-net-rejilla--pasos">
            {SIN_NET_COMO.map((t, i) => {
              const Icono = t.icono;
              return (
                <li className="sin-net-tarjeta sin-net-paso" key={t.titulo}>
                  <span className="sin-net-paso-cima" aria-hidden="true">
                    <span className="sin-net-paso-num">{i + 1}</span>
                    <span className="sin-net-icono-chico">
                      <Icono size={28} strokeWidth={1.7} />
                    </span>
                  </span>
                  <h4 className="sin-net-titulo">{t.titulo}</h4>
                  <p className="sin-net-corto">{t.corto}</p>
                  <details className="ps-mas">
                    <summary>
                      <span className="ps-mas-cerrado">Contame más</span>
                      <span className="ps-mas-abierto">Ya entendí</span>
                      <ChevronDown className="ps-mas-flecha" size={18} strokeWidth={2.2} aria-hidden="true" />
                    </summary>
                    <p>{t.mas}</p>
                  </details>
                </li>
              );
            })}
          </ol>

          <div className="sin-net-acciones">
            <a className="ps-boton sin-net-boton" href={URL_DESCARGA_OFFLINE} download>
              <Download size={20} strokeWidth={2} aria-hidden="true" />
              Descargar el archivo (5 MB)
            </a>
            <a
              className="ps-boton sin-net-enlace"
              href={URL_OFFLINE}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir la versión en línea →
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </a>
            <a
              className="ps-boton sin-net-compartir"
              href={WA_COMPARTIR}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 size={20} strokeWidth={2} aria-hidden="true" />
              Compartir por WhatsApp
              <span className="ps-solo-lectores"> (se abre en otra pestaña)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
