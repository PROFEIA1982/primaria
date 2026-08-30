import { AArrowUp, Contrast, Type } from "lucide-react";

export type TamanoTexto = "normal" | "grande" | "mayor";

const TAMANOS: { valor: TamanoTexto; palabra: string; icono: typeof Type; tam: number }[] = [
  { valor: "normal", palabra: "Normal", icono: Type, tam: 18 },
  { valor: "grande", palabra: "Grande", icono: AArrowUp, tam: 21 },
  { valor: "mayor", palabra: "Más grande", icono: AArrowUp, tam: 25 },
];

type Props = {
  tamano: TamanoTexto;
  alCambiarTamano: (t: TamanoTexto) => void;
  altoContraste: boolean;
  alCambiarContraste: (v: boolean) => void;
};

// La barra de apoyo del examen: agrandar la letra y subir el contraste del
// recuadro de la pregunta. El boton de escuchar se fue de aca al item
// mismo (ItemRenderer): tenerlo en los dos lados dejaba dos botones que
// hacen lo mismo en la misma pantalla.
export default function BarraApoyo({
  tamano,
  alCambiarTamano,
  altoContraste,
  alCambiarContraste,
}: Props) {
  return (
    <div className="examen-apoyo" role="group" aria-label="Ayudas para leer la pregunta">
      <button
        type="button"
        className="apoyo-boton"
        aria-pressed={altoContraste}
        onClick={() => alCambiarContraste(!altoContraste)}
      >
        <Contrast size={20} strokeWidth={2.2} aria-hidden="true" />
        Más contraste
      </button>

      <span className="apoyo-grupo" role="group" aria-label="Tamaño del texto">
        <span className="apoyo-rotulo" aria-hidden="true">Texto</span>
        {TAMANOS.map(({ valor, palabra, icono: Icono, tam }) => (
          <button
            key={valor}
            type="button"
            className="apoyo-boton"
            aria-pressed={tamano === valor}
            onClick={() => alCambiarTamano(valor)}
          >
            <Icono size={tam} strokeWidth={2.2} aria-hidden="true" />
            {palabra}
          </button>
        ))}
      </span>
    </div>
  );
}
