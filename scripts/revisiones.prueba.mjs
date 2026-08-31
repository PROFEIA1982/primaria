#!/usr/bin/env node
/**
 * Prueba de las revisiones de scripts/revisiones.mjs.
 *
 * Por que existe: un detector que nunca encuentra nada se ve exactamente igual
 * que uno bien hecho. La unica forma de saber que sirve es darle de comer
 * textos que SI estan rotos y ver si se queja, y textos sanos y ver si se
 * calla. Los casos rotos de aca son los textos reales que tenia el banco
 * antes del arreglo de agosto de 2026, copiados tal cual.
 *
 *     pnpm probar:revisiones
 */

import process from 'node:process';
import { revisarTexto, revisarEstructura } from './revisiones.mjs';

// [ nombre, texto, se espera que se queje ]
const CASOS_TEXTO = [
  // --- rotos de verdad, sacados del banco ---
  ['delimitador viejo en la opcion', '\\( (15 \\times 150) + (10 \\times75) \\)', true],
  ['delimitador viejo en enunciado', 'En la siguiente ecuación \\( 25 + n = 75 \\) hay conejos', true],
  ['bloque con \\[ \\]', 'Considere \\[ x^2 + 1 \\] y conteste', true],
  ['fraccion sin ningun delimitador', '\\frac{1}{6}', true],
  ['la variable entrecomillada', 'La ecuación \\( “n” \\) representa algo', true],
  ['tabla aplastada por la migracion',
    'En la siguiente tabla se muestra el peso de tres conejos:\n\n\n\nConejo\n\n\n\nPeso\n\n\n\nW\n\n\n\n1,62\n\n\n\nR\n\n\n\n1,60\n\n\n\nDe acuerdo con lo anterior', true],
  // Este es el que se escapo al cliente, ya publicado: no dice "la siguiente
  // tabla" sino "se detallan a continuacion", asi que la revision vieja —que
  // exigia la frase antes de mirar la forma— lo dejo pasar.
  ['tabla aplastada que NO dice "la siguiente tabla"',
    'Las masas, en kilogramos, de seis niños se detallan a continuación:\n\n\n\nAna\n\n\n\nCarlos\n\n\n\nBeatriz\n\n\n\n41\n\n\n\n45\n\n\n\n43\n\n\n\nDe acuerdo con la información anterior', true],
  ['tabla ancha, se sale en celular',
    'Vea:\n\n| Día | 1 | 2 | 3 | 4 | 5 | 6 |\n| --- | --- | --- | --- | --- | --- | --- |\n| Color | A | R | V | A | R | V |\n\nY conteste', true],

  // --- rotos armados a proposito para cubrir el resto de las revisiones ---
  ['un dolar sin pareja', 'El total es $\\frac{1}{2} y ya', true],
  ['formula que KaTeX rechaza', 'Esto es $\\frac{1}{$ y se cae', true],
  ['tabla con columnas disparejas', 'Vea:\n\n| A | B |\n| --- | --- |\n| 1 |\n\nY conteste', true],
  ['tabla sin linea de separacion', 'Vea:\n\n| A | B |\n| 1 | 2 |\n\nY conteste', true],

  // --- sanos: si alguno de estos se queja, el detector molesta de gratis ---
  ['formula bien escrita', 'El procedimiento es $(15 \\times 150) + (10 \\times 75)$ colones', false],
  ['fraccion bien escrita', '$\\frac{3}{5}$', false],
  ['tabla bien armada', 'Vea:\n\n| Planta | Precio |\n| --- | --- |\n| Rosa | 1500 |\n| Clavel | 1005 |\n\nY conteste', false],
  ['tabla vertical, la forma buena', 'Vea:\n\n| Día | Color |\n| --- | --- |\n| 1 | A |\n| 2 | R |\n| 3 | V |\n\nY conteste', false],
  ['tres columnas y varias filas: sigue siendo vertical',
    'Vea:\n\n| Deporte | Hombres | Mujeres |\n| --- | --- | --- |\n| Fútbol | 32 | 22 |\n| Atletismo | 28 | 33 |\n\nY conteste', false],
  // Falsos positivos reales que aparecieron al calibrar esta revision.
  ['lista con letras, no es una tabla',
    'Lea el siguiente texto:\n\nEl mundo colonial estaba dividido así:\n\na) Virreinatos,\n\nb) Capitanías Generales,\n\nc) Gobernaciones,\n\nd) Audiencias,\n\ne) Corregimientos,\n\nf) Intendencias,\n\ng) Cabildos.\n\nSegún el texto anterior, Costa Rica', false],
  ['"se muestra a continuacion" hablando de una imagen, no de una tabla',
    'Axel construyó una piscina circular de radio 3 metros. Tal como se muestra a continuación:\n\n![Circunferencia con un radio rotulado 3 m.](https://ejemplo.test/x.webp)\n\n¿cuál es el área?', false],
  ['parrafos separados, no es una tabla aplastada',
    'Lea el siguiente texto:\n\n\nUn párrafo cualquiera del texto de lectura.\n\n\nSegún el texto anterior, ¿qué pasó?', false],
  ['texto normal sin matematica', 'Carlos compró 15 lápices y el precio de cada uno era ₡150.', false],
  ['precio en colones, no es LaTeX', 'La entrada cuesta ₡2500 y el pasaje ₡700.', false],
  ['tabla con fraccion adentro', 'Vea:\n\n| Día | Lunes |\n| --- | --- |\n| Cartones | $\\frac{15}{10}$ |\n\nY conteste', false],
];

// [ nombre, item, se espera que se queje ]
const CASOS_ITEM = [
  ['item sano', {
    enunciado: '¿Cuánto es 2 + 2?',
    opciones: [{ texto: '4', es_correcta: true }, { texto: '3', es_correcta: false },
               { texto: '5', es_correcta: false }, { texto: '6', es_correcta: false }],
    opcionesCompletas: true }, false],
  ['enunciado que termina en la tabla, sin pregunta', {
    enunciado: 'Vea la tabla:\n\n| Día | Lunes |\n| --- | --- |\n| Cartones | 3 |',
    opciones: [{ texto: 'Lunes', es_correcta: true }, { texto: 'Martes', es_correcta: false },
               { texto: 'Miércoles', es_correcta: false }, { texto: 'Jueves', es_correcta: false }],
    opcionesCompletas: true }, true],
  ['solo tres opciones', {
    enunciado: '¿Cuánto es 2 + 2?',
    opciones: [{ texto: '4', es_correcta: true }, { texto: '3', es_correcta: false }, { texto: '5', es_correcta: false }],
    opcionesCompletas: true }, true],
  ['dos respuestas correctas', {
    enunciado: '¿Cuánto es 2 + 2?',
    opciones: [{ texto: '4', es_correcta: true }, { texto: 'cuatro', es_correcta: true },
               { texto: '5', es_correcta: false }, { texto: '6', es_correcta: false }],
    opcionesCompletas: true }, true],
  ['dos opciones identicas', {
    enunciado: '¿Cuánto es 2 + 2?',
    opciones: [{ texto: '4', es_correcta: true }, { texto: '3', es_correcta: false },
               { texto: '3', es_correcta: false }, { texto: '6', es_correcta: false }],
    opcionesCompletas: true }, true],
  ['opciones que no se alcanzaron a ver: no se opina', {
    enunciado: '¿Cuánto es 2 + 2?', opciones: [], opcionesCompletas: false }, false],
];

let fallos = 0;

console.log('Revisiones de texto\n');
for (const [nombre, texto, seEspera] of CASOS_TEXTO) {
  const quejas = revisarTexto(texto);
  const bien = (quejas.length > 0) === seEspera;
  if (!bien) fallos++;
  console.log(`  ${bien ? 'ok  ' : 'MAL '} ${nombre}`);
  if (!bien) {
    console.log(`        se esperaba que ${seEspera ? 'se quejara y no lo hizo' : 'pasara limpio y se quejo'}`);
    for (const q of quejas.slice(0, 2)) console.log(`        ${q.tipo}: ${q.queja}`);
  }
}

console.log('\nRevisiones de estructura\n');
for (const [nombre, item, seEspera] of CASOS_ITEM) {
  const quejas = revisarEstructura(item);
  const bien = (quejas.length > 0) === seEspera;
  if (!bien) fallos++;
  console.log(`  ${bien ? 'ok  ' : 'MAL '} ${nombre}`);
  if (!bien) {
    console.log(`        se esperaba que ${seEspera ? 'se quejara y no lo hizo' : 'pasara limpio y se quejo'}`);
    for (const q of quejas.slice(0, 2)) console.log(`        ${q}`);
  }
}

const total = CASOS_TEXTO.length + CASOS_ITEM.length;
console.log(fallos === 0
  ? `\nPasan las ${total} pruebas.`
  : `\n${fallos} de ${total} pruebas fallaron.`);
process.exit(fallos === 0 ? 0 : 1);
