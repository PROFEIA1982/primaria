import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Link } from "react-router-dom";
import { CircleAlert, PartyPopper, RotateCcw } from "lucide-react";
import { nivelNota, PALABRA_NOTA } from "./calificar";
import type { Practica } from "./usePractica";

// Los enunciados traen tablas y formulas: sin gfm la tabla sale como
// texto con barras, y sin math las fracciones salen en crudo.
const REMARK = [remarkMath, remarkGfm];
const REHYPE = [rehypeKatex];
const ENLINEA = { p: (props: { children?: React.ReactNode }) => <>{props.children}</> };

type Props = {
  nombreMateria: string;
  practica: Practica;
};

// Pantalla 3: la nota, el desglose por tema y las que fallo. Sin
// explicaciones didacticas: eso lo trabaja con su maestra.
export default function ResultadosPanel({ nombreMateria, practica }: Props) {
  const { calificacion, seAcaboElTiempo, volverAPracticar } = practica;
  const { nota, aciertos, total, respondidas, sinResponder, porTema, falladas } = calificacion;

  const nivel = nivelNota(nota);
  const perfecta = total > 0 && aciertos === total;

  return (
    <>
      <div className="res-tarjeta" data-nivel={nivel}>
        <p className="res-etiqueta-nota">Tu nota</p>
        <p className="res-nota">
          <span className="res-numero">{nota}</span>
          <span className="res-sobre"> de 100</span>
        </p>
        {/* La palabra va siempre pegada al numero: el color solo no basta. */}
        <p className="res-palabra">{PALABRA_NOTA[nivel]}</p>
        <p className="res-cuenta">
          Acertaste <strong>{aciertos}</strong> de <strong>{total}</strong>{" "}
          {total === 1 ? "pregunta" : "preguntas"}. Respondiste {respondidas} de {total}.
        </p>
      </div>

      {sinResponder > 0 && (
        <p className="res-aviso">
          <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
          <span>
            {seAcaboElTiempo ? "Se te acabó el tiempo. " : ""}
            Quedaron <strong>{sinResponder}</strong>{" "}
            {sinResponder === 1 ? "pregunta sin responder" : "preguntas sin responder"} y
            cuentan como malas. La próxima vez pedí menos preguntas o andá más rápido.
          </span>
        </p>
      )}

      {perfecta && (
        <p className="res-felicita">
          <PartyPopper size={24} strokeWidth={2} aria-hidden="true" />
          <span>
            <strong>¡Todas buenas!</strong> Te las echaste todas. Probá ahora con
            más preguntas o con otro tema, a ver si aguantás el ritmo.
          </span>
        </p>
      )}

      {porTema.length > 0 && (
        <section className="res-bloque" aria-labelledby="res-temas-titulo">
          <h2 id="res-temas-titulo">¿Cómo te fue en cada tema?</h2>
          <p className="res-bajada">
            Arriba está lo que hay que repasar primero.
          </p>
          <ul className="res-temas">
            {porTema.map((t) => {
              const nt = nivelNota(t.porcentaje);
              return (
                <li className="res-tema" key={t.tema} data-nivel={nt}>
                  <span className="res-tema-nombre">{t.tema}</span>
                  <span className="res-tema-dato">
                    {t.aciertos} de {t.total} · {t.porcentaje}%
                  </span>
                  <span className="res-tema-barra" aria-hidden="true">
                    <span style={{ width: `${t.porcentaje}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {falladas.length > 0 && (
        <section className="res-bloque" aria-labelledby="res-falladas-titulo">
          <h2 id="res-falladas-titulo">Las que no te salieron</h2>
          <p className="res-bajada">
            Mirá bien la respuesta buena y volvé a intentarlo cuando querás.
          </p>
          <ol className="res-falladas">
            {falladas.map((f) => (
              <li className="res-fallada" key={f.itemId}>
                <div className="res-fallada-enunciado">
                  <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE}>
                    {f.enunciado}
                  </Markdown>
                </div>
                <p className="res-marcaste">
                  <span className="res-mini">Marcaste</span>
                  {f.textoElegido === null ? (
                    <span className="res-valor" data-tipo="vacia">No la respondiste</span>
                  ) : (
                    <span className="res-valor" data-tipo="mala">
                      <span aria-hidden="true">✗ </span>
                      {f.letraElegida}.{" "}
                      <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={ENLINEA}>
                        {f.textoElegido}
                      </Markdown>
                    </span>
                  )}
                </p>
                <p className="res-correcta">
                  <span className="res-mini">La buena era</span>
                  <span className="res-valor" data-tipo="buena">
                    <span aria-hidden="true">✓ </span>
                    {f.letraCorrecta}.{" "}
                    <Markdown remarkPlugins={REMARK} rehypePlugins={REHYPE} components={ENLINEA}>
                      {f.textoCorrecto}
                    </Markdown>
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="res-acciones">
        <button type="button" className="ps-boton" onClick={volverAPracticar}>
          <RotateCcw size={20} strokeWidth={2.2} aria-hidden="true" />
          Volver a practicar
        </button>
        <Link to="/" className="ps-boton res-boton-secundario">
          Elegir otra materia
        </Link>
      </div>
      <p className="res-nota-pie">
        Practicaste {nombreMateria}. Esta nota no queda guardada en ningún lado:
        es solo para vos.
      </p>
    </>
  );
}
