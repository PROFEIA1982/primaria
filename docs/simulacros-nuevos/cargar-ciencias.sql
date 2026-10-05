-- ============================================================
-- Carga del Simulacro nuevo 1 de ciencias (60 items) para /simulacros-nuevos.
--
-- QUE HACE
--   Crea o actualiza el examen "nuevo-ciencias-1" con sus 60 preguntas y
--   sus cuatro opciones cada una. Es idempotente: si se corre dos veces, no
--   duplica nada; actualiza por el slug del examen y por el codigo de cada
--   item, y borra los items que ya no esten en el archivo.
--   Todo va dentro de una transaccion: si algo falla, no queda nada a medias.
--   El examen entra como borrador y solo se publica al final, si cada item
--   tiene cuatro opciones y exactamente una correcta.
--
-- ANTES DE CORRERLO
--   Tiene que estar aplicado el esquema de los simulacros nuevos
--   (supabase/migrations/20261005210000_simulacros_nuevos.sql). Si falta,
--   este archivo se detiene con un mensaje y no cambia nada.
--
-- COMO SE USA
--   Se pega completo en el editor SQL de Supabase y se ejecuta. Las dos
--   consultas del final muestran cuantos items quedaron y cuantas veces es
--   clave cada letra.
--
-- Es una copia de supabase/migrations/20261005220535_simulacro_ciencias.sql.
-- Se genera con: pnpm generar:simulacros-nuevos ciencias --copia ...
-- No se edita a mano: se corrige el JSON y se vuelve a generar.
-- ============================================================

begin;

-- El esquema lo crea la migracion del piloto (20261005210000_simulacros_nuevos.sql).
-- Sin esas tablas no hay donde cargar: mejor un mensaje claro que un error raro.
do $esquema$
begin
  if to_regclass('public.simulacros_nuevos') is null
     or to_regclass('public.simulacro_nuevo_items') is null
     or to_regclass('public.simulacro_nuevo_opciones') is null then
    raise exception 'Falta el esquema de los simulacros nuevos: aplique primero la migracion 20261005210000_simulacros_nuevos.sql';
  end if;
end
$esquema$;

-- Simulacro nuevo 1 de ciencias: 60 items.
-- Generado desde docs/simulacros-nuevos/ciencias.json (version 2026-10-05).
-- Comparado contra el banco de banco-ciencias-respaldo-2026-08-31-y-oficiales.json antes de generar.

-- Entra como borrador. Lo publica la revision del final, solo si todo calza.
insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  ('nuevo-ciencias-1', 'ciencias', 1, 'Simulacro nuevo 1', 180, false, 'borrador')
on conflict (slug) do update set
  materia_slug      = excluded.materia_slug,
  numero            = excluded.numero,
  titulo            = excluded.titulo,
  segundos_por_item = excluded.segundos_por_item,
  barajar_opciones  = excluded.barajar_opciones,
  estado            = 'borrador';

-- Lo que ya no esta en el JSON se va, con sus opciones y estadisticas.
delete from public.simulacro_nuevo_items i
using public.simulacros_nuevos s
where i.simulacro_id = s.id
  and s.slug = 'nuevo-ciencias-1'
  and i.codigo <> all (array['cie-1-1-a', 'cie-1-1-b', 'cie-1-1-c', 'cie-1-2-a', 'cie-1-2-b', 'cie-1-2-c', 'cie-1-3-a', 'cie-1-3-b', 'cie-1-3-c', 'cie-1-4-a', 'cie-1-4-b', 'cie-1-4-c', 'cie-1-4-d', 'cie-1-5-a', 'cie-1-5-b', 'cie-1-5-c', 'cie-2-1-a', 'cie-2-1-b', 'cie-2-1-c', 'cie-2-1-d', 'cie-2-2-a', 'cie-2-2-b', 'cie-2-2-c', 'cie-2-2-d', 'cie-2-3-a', 'cie-2-3-b', 'cie-2-3-c', 'cie-2-3-d', 'cie-2-4-a', 'cie-2-4-b', 'cie-3-1-a', 'cie-3-1-b', 'cie-3-1-c', 'cie-3-1-d', 'cie-3-1-e', 'cie-3-1-f', 'cie-3-2-a', 'cie-3-2-b', 'cie-3-2-c', 'cie-3-2-d', 'cie-3-2-e', 'cie-3-2-f', 'cie-3-2-g', 'cie-3-2-h', 'cie-3-3-a', 'cie-3-3-b', 'cie-3-3-c', 'cie-3-3-d', 'cie-4-1-a', 'cie-4-1-b', 'cie-4-1-c', 'cie-4-1-d', 'cie-4-1-e', 'cie-4-2-a', 'cie-4-2-b', 'cie-4-2-c', 'cie-4-2-d', 'cie-4-3-a', 'cie-4-3-b', 'cie-4-3-c']);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
    ('cie-1-1-a', 1, 'Cuerpo humano', 'Niveles de organización del cuerpo humano', 'intermedio', 'Lea la siguiente información:

En una feria científica, un grupo de sexto año comparó una célula del cuerpo humano con una ciudad rodeada por una muralla. Explicaron que la muralla tiene portones vigilados: permite que entren el agua y los nutrientes que la ciudad necesita y que salgan los desechos, pero impide el paso de sustancias que podrían dañarla. Así, la muralla separa lo que está dentro de la ciudad de lo que está afuera.

En la comparación anterior, la muralla con portones vigilados representa', 'La membrana celular rodea a la célula y regula qué entra y qué sale, igual que una muralla con portones vigilados. Por eso deja pasar agua y nutrientes, deja salir desechos y frena lo que podría hacerle daño.', false),
    ('cie-1-1-b', 2, 'Cuerpo humano', 'Niveles de organización del cuerpo humano', 'alto', 'Analice la siguiente tabla:

| Elemento | Descripción |
|---|---|
| P | Conjunto de órganos que trabajan juntos para transformar el alimento y aprovecharlo. |
| Q | Unidad más pequeña con vida que forma parte de la pared del estómago. |
| R | Grupo de células parecidas que se contraen para mezclar el alimento. |
| S | Estructura en forma de bolsa, formada por varios tejidos, donde continúa la digestión. |

¿Cuál opción ordena los elementos de la tabla desde el nivel de organización más simple hasta el más complejo?', 'La célula es la unidad más pequeña con vida; varias células parecidas forman un tejido, varios tejidos forman un órgano como el estómago y varios órganos forman el sistema digestivo. Por eso el orden correcto es Q, R, S y P.', false),
    ('cie-1-1-c', 3, 'Cuerpo humano', 'Niveles de organización del cuerpo humano', 'intermedio', 'Lea la siguiente información:

Mariela estira el brazo para alcanzar una guayaba del árbol. Para lograrlo, un grupo de células alargadas del brazo se acorta y jala los huesos; esas células forman un tejido que trabaja cuando recibe una orden del cerebro. Al mismo tiempo, otro tejido, duro y rico en calcio, mantiene firme el brazo para que no se doble mientras sostiene la fruta.

Según la información anterior, ¿qué función cumplen, en orden, los dos tejidos descritos?', 'El tejido muscular se acorta, es decir, se contrae, y así jala los huesos para mover el brazo. El tejido óseo es duro gracias al calcio y sirve de soporte para que el cuerpo no se doble.', false),
    ('cie-1-2-a', 4, 'Cuerpo humano', 'Tejido sanguíneo e inmunidad', 'alto', 'Lea la siguiente información:

Fiorella se raspó la rodilla al caer de la bicicleta. A los pocos minutos la herida dejó de sangrar, porque unos fragmentos de células de la sangre se pegaron entre sí y formaron un tapón que después se convirtió en costra. Al día siguiente, alrededor del raspón la piel estaba roja y un poco hinchada: hasta ese lugar habían llegado otras células de la sangre que rodeaban y destruían a los microbios que entraron por la herida.

¿Cuáles componentes del tejido sanguíneo actuaron en cada momento, en el orden en que se describen?', 'Las plaquetas se unen y forman el tapón que detiene el sangrado, y luego los glóbulos blancos llegan a la herida para atacar a los microbios. Por eso la zona se pone roja e hinchada mientras el cuerpo se defiende.', false),
    ('cie-1-2-b', 5, 'Cuerpo humano', 'Tejido sanguíneo e inmunidad', 'alto', 'Lea la siguiente información:

La inmunidad es activa cuando el propio cuerpo fabrica sus anticuerpos después de tener contacto con un microbio o con una vacuna. Es pasiva cuando la persona recibe anticuerpos que ya fueron fabricados por otro organismo.

Caso 1: Mauricio tuvo varicela cuando era pequeño y su cuerpo produjo defensas contra ese virus.

Caso 2: En Costa Rica, a las personas mordidas por serpientes venenosas se les aplica un suero con anticuerpos obtenidos de caballos.

De acuerdo con la información, ¿qué tipo de inmunidad se presenta en cada caso?', 'Mauricio fabricó sus propios anticuerpos cuando tuvo varicela, por eso su inmunidad es activa. La persona que recibe el suero obtiene anticuerpos ya hechos por los caballos, y eso es inmunidad pasiva.', false),
    ('cie-1-2-c', 6, 'Cuerpo humano', 'Tejido sanguíneo e inmunidad', 'intermedio', 'El siguiente texto se relaciona con la función inmunológica:

Cada día entran al cuerpo virus, bacterias y hongos por la nariz, la boca o pequeñas heridas. El cuerpo cuenta con un conjunto de defensas que reconoce a esos invasores como extraños, los ataca y además guarda un registro de cómo vencerlos si vuelven a entrar. Gracias a ese trabajo constante, muchas veces la persona ni se entera de que estuvo en contacto con ellos.

La información anterior permite concluir que la función inmunológica es importante porque', 'La función inmunológica reconoce y ataca a los microbios que entran al cuerpo, y además recuerda cómo vencerlos. Así evita que enfermen a la persona y protege su salud.', false),
    ('cie-1-3-a', 7, 'Cuerpo humano', 'Vacunas', 'intermedio', 'Lea la siguiente información:

En la escuela de Josué hacen simulacros de evacuación varias veces al año. Aunque no haya un temblor real, los estudiantes practican qué hacer y por dónde salir. Así, cuando ocurre un temblor de verdad, reaccionan con rapidez y orden. La maestra explicó que una vacuna funciona de manera parecida: presenta al cuerpo un microbio debilitado o inactivo, o solo una parte de él, que no causa la enfermedad.

Según la comparación, la vacuna se parece a un simulacro porque', 'La vacuna muestra al cuerpo un microbio debilitado, inactivo o solo una parte de él, y el cuerpo aprende a fabricar defensas sin enfermarse. Si después llega el microbio verdadero, las defensas ya están listas, igual que los estudiantes después de practicar.', false),
    ('cie-1-3-b', 8, 'Cuerpo humano', 'Vacunas', 'alto', 'Analice la siguiente tabla:

En dos comunidades imaginarias con la misma cantidad de habitantes apareció una persona con una enfermedad contagiosa que se puede prevenir con una vacuna.

| Comunidad | Personas vacunadas | Personas que se contagiaron después |
|---|---|---|
| Las Brisas | 9 de cada 10 | 3 |
| El Roble | 4 de cada 10 | 85 |

En Las Brisas también se libraron del contagio dos bebés que todavía no podían vacunarse.

¿Qué beneficio de la vacunación muestran los datos?', 'En Las Brisas casi todas las personas estaban vacunadas y la enfermedad casi no pudo pasar de una persona a otra, por eso hasta los bebés quedaron protegidos. Cuando la mayoría se vacuna, se cuida también a quienes todavía no pueden recibir la vacuna.', false),
    ('cie-1-3-c', 9, 'Cuerpo humano', 'Vacunas', 'intermedio', 'Lea la siguiente información:

La viruela fue una enfermedad contagiosa que durante siglos afectó a personas de todos los continentes. Como el virus solo podía pasar de una persona a otra, se organizaron campañas para vacunar a la población de muchísimos países. Poco a poco el virus dejó de encontrar personas a quienes contagiar, y hoy esa enfermedad ya no circula en ningún lugar del planeta.

Del caso de la viruela se concluye que la vacunación', 'Al vacunar a tanta gente, el virus de la viruela ya no encontró a quién contagiar y desapareció del planeta. Esto muestra el gran poder de la vacunación cuando se hace en muchos países a la vez.', false),
    ('cie-1-4-a', 10, 'Cuerpo humano', 'Órganos, sistemas y salud', 'alto', 'Lea la siguiente información:

Un órgano del sistema digestivo mide varios metros de largo y está doblado muchas veces dentro del abdomen. Su pared interna tiene millones de pliegues diminutos, parecidos a dedos, que aumentan la superficie en contacto con el alimento ya digerido. Por dentro de cada pliegue pasan vasos sanguíneos muy delgados.

Por sus características, la función principal de ese órgano es', 'Los pliegues parecidos a dedos aumentan la superficie para que los nutrientes del alimento digerido pasen a los vasos sanguíneos. Así trabaja el intestino delgado, que absorbe los nutrientes y los entrega a la sangre.', false),
    ('cie-1-4-b', 11, 'Cuerpo humano', 'Órganos, sistemas y salud', 'intermedio', 'Analice la siguiente tabla:

Andrés anotó algunos de sus hábitos durante una semana.

| Hábito | Frecuencia |
|---|---|
| Dormir nueve horas | Todas las noches |
| Jugar fútbol en el recreo | Cuatro días |
| Cargar el bulto en un hombro | Todos los días |
| Tomar agua en lugar de refresco | Casi siempre |

¿Cuál hábito de la tabla puede afectar de forma negativa a los huesos y músculos de la espalda?', 'Cargar todo el peso del bulto en un solo hombro inclina la espalda hacia un lado y obliga a huesos y músculos a trabajar de forma desigual. Lo recomendable es usar los dos tirantes y llevar solo lo necesario.', false),
    ('cie-1-4-c', 12, 'Cuerpo humano', 'Órganos, sistemas y salud', 'alto', 'Lea la siguiente información:

En un cantón del país, la municipalidad cierra al tránsito una calle principal cada domingo en la mañana para que las familias caminen, patinen o anden en bicicleta. Por su parte, la asociación de desarrollo de un barrio instaló aparatos para ejercitarse en el parque, y el comité de deportes organiza clases gratuitas de baile para personas adultas mayores.

¿Por qué estas acciones comunales e institucionales favorecen la salud de los sistemas del cuerpo?', 'Caminar, patinar, andar en bicicleta o bailar mantienen el cuerpo en movimiento, y eso fortalece el corazón, los pulmones, los músculos y los huesos. Cuando la comunidad y las instituciones abren estos espacios, a más personas les resulta fácil mantenerse activas.', false),
    ('cie-1-4-d', 13, 'Cuerpo humano', 'Órganos, sistemas y salud', 'intermedio', 'Considere la siguiente información:

Después de jugar bajo el sol, Isaac nota que su camiseta está mojada y que en su frente quedan gotitas con sabor salado. El sudor sale por pequeños poros de la piel y, al evaporarse, ayuda a enfriar el cuerpo. Ese líquido contiene agua, sales y pequeñas cantidades de urea, una sustancia de desecho que el cuerpo no necesita.

Además de regular la temperatura, el sudor muestra que la piel participa en la función de', 'El sudor lleva agua, sales y un poco de urea, que el cuerpo no necesita. Al expulsar esas sustancias, la piel ayuda al sistema excretor, además de refrescar el cuerpo.', false),
    ('cie-1-5-a', 14, 'Cuerpo humano', 'Interrelación de los sistemas', 'intermedio', 'Observe la siguiente imagen:

![Esquema con flechas. Los pulmones envían oxígeno al corazón y los vasos sanguíneos. El intestino delgado envía nutrientes al corazón y los vasos sanguíneos. El corazón y los vasos sanguíneos llevan oxígeno y nutrientes a los músculos. Los músculos devuelven dióxido de carbono al corazón y los vasos sanguíneos, que lo llevan a los pulmones para expulsarlo.](/simulacros-nuevos/cie-1-5-sistemas.svg)

El esquema representa cómo se relacionan algunos órganos cuando Esteban corre durante la clase de Educación Física. Mientras corre, sus músculos trabajan más y necesitan más oxígeno; Esteban respira más rápido y su corazón late con más fuerza y rapidez.

Según el esquema, ¿por qué aumentan al mismo tiempo la respiración y los latidos de Esteban?', 'Al correr, los músculos gastan más oxígeno. Por eso los pulmones trabajan más rápido para tomarlo del aire y el corazón late con más fuerza para que la sangre lo lleve a los músculos.', false),
    ('cie-1-5-b', 15, 'Cuerpo humano', 'Interrelación de los sistemas', 'intermedio', 'Lea la siguiente información:

Hazel se rió a carcajadas mientras comía arroz y empezó a toser con fuerza. Su abuela le explicó que en la garganta hay un conducto por el que pasan tanto el aire como los alimentos. Al tragar, una pequeña tapa cierra el camino hacia la tráquea para que la comida siga hacia el esófago; si una persona habla o se ríe al tragar, esa tapa puede no cerrarse a tiempo.

La situación muestra una acción que comparten los sistemas', 'La faringe es un conducto que usan el sistema respiratorio, para el paso del aire, y el sistema digestivo, para el paso de los alimentos. La pequeña tapa llamada epiglotis se cierra al tragar para que la comida vaya al esófago y no a la tráquea.', false),
    ('cie-1-5-c', 16, 'Cuerpo humano', 'Interrelación de los sistemas', 'alto', 'Lea la siguiente información:

En un día muy caluroso, el cuerpo pierde mucha agua por el sudor. Cuando eso ocurre, el encéfalo detecta el cambio y produce la sensación de sed. Al mismo tiempo, se envían señales a los riñones para que eliminen menos agua, por lo que la orina sale en menor cantidad y de color más oscuro. Al beber líquido, la sangre recupera la cantidad de agua que necesita.

¿Qué conclusión se obtiene de la información anterior?', 'El sistema nervioso detecta la falta de agua y provoca la sed, el sistema excretor ahorra agua al producir menos orina y el circulatorio la reparte cuando se bebe. Todos trabajan juntos para mantener la salud del cuerpo.', false),
    ('cie-2-1-a', 17, 'Biodiversidad', 'Biodiversidad y adaptaciones', 'intermedio', 'Lea la siguiente información:

La biodiversidad se puede observar en tres niveles: la variedad de genes dentro de una misma especie, la variedad de especies que habitan un lugar y la variedad de ecosistemas de una región. Costa Rica, con un territorio pequeño, reúne bosques lluviosos, bosques nubosos, manglares, páramos y arrecifes de coral, entre otros ambientes.

Según la información, ¿cuál opción es un ejemplo de diversidad de especies?', 'La diversidad de especies se refiere a las distintas clases de seres vivos que hay en un lugar, como varias especies de colibríes en un mismo jardín. Las mazorcas de colores muestran diversidad genética y el manglar con el páramo, diversidad de ecosistemas.', false),
    ('cie-2-1-b', 18, 'Biodiversidad', 'Biodiversidad y adaptaciones', 'alto', 'Lea la siguiente información:

En el Refugio de Vida Silvestre Ostional, en Guanacaste, ocurre un fenómeno llamado arribada: durante algunas noches, miles de hembras de tortuga lora salen del mar casi al mismo tiempo para poner sus huevos en la arena. Al llegar tantas juntas, los depredadores no logran comerse todos los huevos y muchas crías sobreviven.

La arribada es un ejemplo de adaptación', 'Llegar todas juntas a la playa es un comportamiento, por eso la arribada es una adaptación conductual. Gracias a esa conducta, muchas crías logran sobrevivir aunque haya depredadores.', false),
    ('cie-2-1-c', 19, 'Biodiversidad', 'Biodiversidad y adaptaciones', 'intermedio', 'Lea la siguiente información:

En los potreros y a la orilla de muchos caminos de Costa Rica crece la dormilona, una planta pequeña de hojas divididas en muchas hojitas. Cuando Gabriel pasa la mano sobre ella, las hojitas se cierran en pocos segundos y el tallo de la hoja se dobla hacia abajo. Al rato, si nada la toca, las hojas vuelven a abrirse.

La reacción de la dormilona es un ejemplo de la función vital de', 'La dormilona percibe el roce de la mano como un estímulo y responde cerrando sus hojitas. Percibir cambios del entorno y reaccionar ante ellos es la función vital de relación.', false),
    ('cie-2-1-d', 20, 'Biodiversidad', 'Biodiversidad y adaptaciones', 'alto', 'Lea la siguiente información:

El pez león es originario del océano Índico y del oeste del océano Pacífico, pero desde hace algunos años se encuentra en el mar Caribe, incluidas las costas de Costa Rica. Allí se alimenta de muchos peces pequeños nativos y casi ningún animal lo depreda. Además, se reproduce con gran rapidez y puede ocupar arrecifes y manglares.

La situación del pez león en el Caribe representa una amenaza para la biodiversidad causada por', 'El pez león llegó desde otros océanos, come peces nativos y casi no tiene enemigos que controlen su población. Las especies que invaden lugares donde no son originarias alteran el equilibrio y ponen en riesgo a las especies nativas.', false),
    ('cie-2-2-a', 21, 'Biodiversidad', 'Clasificación de los seres vivos', 'alto', 'Analice la siguiente tabla:

| Animal | ¿Tiene columna vertebral? | ¿Cómo respira? |
|---|---|---|
| 1 | Sí | Por branquias durante toda su vida |
| 2 | No | Por pequeños tubos que llevan el aire por dentro del cuerpo |
| 3 | Sí | Por pulmones; su piel tiene escamas secas |
| 4 | No | A través de su piel, que siempre se mantiene húmeda |

¿Cuáles animales podrían corresponder, en ese orden, a los números 2 y 4?', 'El saltamontes es invertebrado y respira por tráqueas, que son tubitos que llevan el aire por dentro del cuerpo. La lombriz de tierra también es invertebrada y respira a través de su piel húmeda.', false),
    ('cie-2-2-b', 22, 'Biodiversidad', 'Clasificación de los seres vivos', 'alto', 'Lea la siguiente información:

Para hacer pan casero, la abuela de Sofía mezcla la harina con levadura. Le explicó que la levadura está formada por hongos diminutos de una sola célula, distintos de los hongos grandes que crecen sobre los troncos podridos. Las células de la levadura tienen núcleo y se nutren de los azúcares de la masa; al hacerlo, liberan un gas que hace que el pan quede esponjoso.

¿Qué característica comparten la levadura y los hongos de los troncos, que permite ubicarlos en el mismo reino?', 'Tanto la levadura como los hongos de los troncos obtienen su alimento de otros materiales, porque no pueden fabricarlo. Esa forma de nutrirse, junto con tener células con núcleo, los ubica en el reino Fungi, aunque unos tengan una sola célula y otros muchas.', false),
    ('cie-2-2-c', 23, 'Biodiversidad', 'Clasificación de los seres vivos', 'intermedio', 'Lea la siguiente información:

En los bosques húmedos de Costa Rica viven las ranas de vidrio, llamadas así porque en algunas se pueden ver órganos a través de la piel del vientre. Las hembras colocan sus huevos sobre hojas que cuelgan encima de las quebradas. Al nacer, los renacuajos caen al agua, donde respiran por branquias; ya adultas, las ranas viven en la vegetación cercana y respiran por pulmones y por la piel.

Según la información, la rana de vidrio se clasifica como un animal', 'La rana de vidrio nace de huevos, por eso es ovípara. Cuando es renacuajo vive en el agua y respira por branquias, y de adulta vive fuera del agua, como muchos anfibios.', false),
    ('cie-2-2-d', 24, 'Biodiversidad', 'Clasificación de los seres vivos', 'alto', 'Considere la siguiente información:

En todos los continentes, menos en la Antártida, hay murciélagos. Algunos comen insectos, otros frutos o néctar, y ayudan a controlar plagas, dispersar semillas y polinizar flores. Muchas personas creen que los murciélagos son aves porque vuelan; sin embargo, se clasifican en el mismo grupo que los perros, los delfines y los seres humanos.

¿Cuál característica de los murciélagos justifica que no se clasifiquen como aves?', 'Los murciélagos tienen pelo y alimentan a sus crías con leche, igual que los perros, los delfines y las personas, por eso son mamíferos. Volar no basta para ser ave, porque las aves tienen plumas y nacen de huevos.', false),
    ('cie-2-3-a', 25, 'Biodiversidad', 'Relaciones entre seres vivos', 'intermedio', 'Lea la siguiente información:

El venado cola blanca es uno de los símbolos nacionales de Costa Rica. Durante la época de apareamiento, los machos de esta especie se enfrentan entre sí: bajan la cabeza, chocan sus astas y empujan con fuerza hasta que uno de ellos se retira. El ganador tiene más oportunidades de aparearse con las hembras del grupo.

La relación entre los machos descrita en el texto corresponde a una', 'Los machos son de la misma especie y se enfrentan para tener la oportunidad de aparearse, por eso es una competencia intraespecífica por la reproducción. Este tipo de competencia favorece que se reproduzcan los individuos más fuertes.', false),
    ('cie-2-3-b', 26, 'Biodiversidad', 'Relaciones entre seres vivos', 'alto', 'Observe la siguiente imagen:

![Esquema de tres parejas de especies con signos. Pareja 1: rémora con signo más y tiburón con cero. Pareja 2: pulga con signo más y perro con signo menos. Pareja 3: colibrí con signo más y flor con signo más.](/simulacros-nuevos/cie-2-3-relaciones.svg)

En una clase de Ciencias, Tatiana elaboró este esquema para representar tres relaciones entre especies. Usó el signo más (+) cuando una especie se beneficia, el signo menos (−) cuando se perjudica y el cero (0) cuando no se beneficia ni se perjudica.

¿Cuál opción clasifica correctamente las relaciones 1, 2 y 3 del esquema?', 'En la pareja 1 la rémora se beneficia y el tiburón no se afecta, y eso es comensalismo. La pulga se beneficia y perjudica al perro, que es parasitismo, y el colibrí y la flor se benefician los dos, que es mutualismo.', false),
    ('cie-2-3-c', 27, 'Biodiversidad', 'Relaciones entre seres vivos', 'alto', 'Lea la siguiente información:

En la finca del abuelo de Joseph hay un granero donde viven varias lechuzas. Cada noche, ellas cazan ratones que se comen el maíz almacenado y los granos de los cultivos. Un vecino propuso ahuyentar a las lechuzas porque le dan miedo. El abuelo le respondió que eso podría causar un problema en la finca.

¿Cuál problema es más probable que ocurra si las lechuzas se van del granero?', 'Las lechuzas son depredadoras de los ratones y ayudan a mantener su población bajo control. Si se van, los ratones se multiplicarían y dañarían más granos, por eso la depredación ayuda al equilibrio ecológico.', false),
    ('cie-2-3-d', 28, 'Biodiversidad', 'Relaciones entre seres vivos', 'intermedio', 'Lea la siguiente información:

En los bosques secos de Guanacaste crece el cornizuelo, un arbusto con espinas grandes y huecas. Dentro de esas espinas viven colonias de hormigas que se alimentan de un néctar y de unas pequeñas bolitas nutritivas que produce la planta. Las hormigas, a cambio, atacan a los insectos que se comen las hojas y cortan las enredaderas que crecen alrededor del arbusto.

La relación entre el cornizuelo y las hormigas se clasifica como', 'La planta da casa y alimento a las hormigas, y las hormigas protegen a la planta de insectos y enredaderas. Como las dos especies se benefician, la relación es de mutualismo.', false),
    ('cie-2-4-a', 29, 'Biodiversidad', 'Fotosíntesis', 'intermedio', 'Observe la siguiente imagen:

![Dibujo de una planta iluminada por el Sol. Una flecha rotulada luz va del Sol a la hoja. Una flecha rotulada agua sube desde las raíces. Una flecha rotulada X entra a la hoja desde el aire. Una flecha rotulada Y sale de la hoja hacia el aire. Dentro de la hoja se lee azúcar.](/simulacros-nuevos/cie-2-4-fotosintesis.svg)

El esquema muestra las sustancias que entran a la hoja de una planta y las que salen de ella mientras realiza fotosíntesis durante el día. El agua llega desde las raíces y la luz proviene del Sol; en la hoja se forma un azúcar que la planta usa como alimento.

¿Qué sustancias representan las letras X y Y del esquema, respectivamente?', 'Durante la fotosíntesis, la hoja toma dióxido de carbono del aire, que es la X, y con agua y luz fabrica azúcar. Como resultado, libera oxígeno al aire, que es la Y.', false),
    ('cie-2-4-b', 30, 'Biodiversidad', 'Fotosíntesis', 'alto', 'El siguiente texto se relaciona con la fotosíntesis:

En los océanos flotan millones de algas microscópicas que forman el fitoplancton. Como tienen clorofila, aprovechan la luz que penetra en las capas superiores del agua. Pequeños animales marinos se alimentan de ellas, y estos a su vez sirven de alimento a peces más grandes. Una parte importante del oxígeno de la atmósfera proviene de estas algas.

Según la información, ¿por qué la fotosíntesis del fitoplancton es importante para la vida en el planeta?', 'Las algas del fitoplancton usan la luz para fabricar su alimento y, al hacerlo, liberan oxígeno. Así alimentan a muchos animales marinos y ayudan a mantener el oxígeno del aire que respiran los seres vivos.', false),
    ('cie-3-1-a', 31, 'Energía', 'Tipos, clases y transformaciones de la energía', 'intermedio', 'Lea la siguiente información:

Randall lanza una bola de fútbol hacia arriba en el patio de su casa. Al principio la bola sube muy rápido, pero cada vez avanza más despacio hasta que se detiene por un instante en el punto más alto. Luego empieza a caer y va cada vez más rápido hasta llegar a las manos de Randall.

Mientras la bola sube, ¿qué ocurre con su energía?', 'Al subir, la bola pierde rapidez y gana altura, así que su energía cinética se va transformando en energía potencial. En el punto más alto casi toda la energía es potencial, y al caer ocurre lo contrario.', false),
    ('cie-3-1-b', 32, 'Energía', 'Tipos, clases y transformaciones de la energía', 'alto', 'Analice la siguiente tabla:

Ximena acomodó cuatro cajas en los estantes de la bodega de su casa.

| Caja | Masa | Altura del estante |
|---|---|---|
| 1 | 2 kg | 1 m |
| 2 | 1 kg | 3 m |
| 3 | 3 kg | 2 m |
| 4 | 4 kg | 1 m |

La energía potencial de un objeto es mayor cuanto más masa tiene y cuanto más alto se encuentra.

¿Cuál caja tiene mayor energía potencial?', 'Hay que tomar en cuenta la masa y la altura al mismo tiempo. Si se multiplica la masa por la altura, la caja 3 da 6, más que las cajas 1, 2 y 4, que dan 2, 3 y 4.', false),
    ('cie-3-1-c', 33, 'Energía', 'Tipos, clases y transformaciones de la energía', 'intermedio', 'Lea la siguiente información:

En algunas zonas de Guanacaste cercanas a volcanes se perforan pozos profundos de donde sale vapor muy caliente que proviene del interior de la Tierra; ese vapor mueve turbinas que generan electricidad. En cambio, en las colinas de Tilarán se aprovechan las corrientes de aire, que son fuertes y constantes durante buena parte del año, para hacer girar grandes aspas.

¿Qué clases de energía se aprovechan, en orden, en los dos lugares descritos?', 'La energía geotérmica aprovecha el calor del interior de la Tierra, como el vapor de los pozos cercanos a volcanes. La energía eólica aprovecha la fuerza del viento, como en las colinas de Tilarán.', false),
    ('cie-3-1-d', 34, 'Energía', 'Tipos, clases y transformaciones de la energía', 'intermedio', 'Lea la siguiente información:

En algunas regiones del mundo, la electricidad se produce en plantas que queman carbón mineral; el humo que sale de sus chimeneas lleva gases y partículas que ensucian el aire y aumentan el calentamiento del planeta. En otras regiones se instalan campos con paneles que convierten la luz del Sol en electricidad.

La segunda forma de producir electricidad se considera energía limpia porque', 'Los paneles solares transforman la luz del Sol en electricidad sin quemar nada, por eso no echan humo ni gases contaminantes. En cambio, quemar carbón ensucia el aire y calienta el planeta.', false),
    ('cie-3-1-e', 35, 'Energía', 'Tipos, clases y transformaciones de la energía', 'intermedio', 'Lea la siguiente información:

Durante un apagón, Kendall usa una linterna que no tiene baterías. Para encenderla, gira con la mano una manivela durante un minuto. Al girar, la manivela mueve un pequeño generador que produce electricidad, y esa electricidad hace brillar el bombillo de la linterna.

¿Cuál es la secuencia de transformaciones de energía que ocurre en la linterna?', 'Al girar la manivela se produce movimiento, que es energía cinética, y el generador la transforma en energía eléctrica. Luego el bombillo transforma esa electricidad en energía lumínica.', false),
    ('cie-3-1-f', 36, 'Energía', 'Tipos, clases y transformaciones de la energía', 'alto', 'Considere la siguiente información:

En muchos países se están cambiando los bombillos incandescentes por bombillos LED. Un bombillo incandescente se pone tan caliente que no se puede tocar después de un rato encendido; en cambio, un bombillo LED apenas se entibia. Para alumbrar un cuarto con la misma intensidad, el bombillo LED consume mucha menos electricidad.

¿Por qué el bombillo LED consume menos electricidad que el incandescente?', 'El bombillo incandescente gasta gran parte de la electricidad en producir calor, por eso se calienta tanto. El LED pierde mucho menos energía en calor, así que con menos electricidad da la misma luz.', false),
    ('cie-3-2-a', 37, 'Energía', 'Manifestaciones de la energía', 'alto', 'Observe la siguiente imagen:

![Tabla de cuatro ciclistas. Ciclista 1: 600 metros en 100 segundos. Ciclista 2: 800 metros en 200 segundos. Ciclista 3: 900 metros en 180 segundos. Ciclista 4: 300 metros en 75 segundos.](/simulacros-nuevos/cie-3-2-rapidez.svg)

En una actividad de Educación Física, cuatro estudiantes recorrieron en bicicleta distintas distancias en un terreno plano y midieron el tiempo que tardó cada uno. Cada estudiante mantuvo la misma rapidez durante todo su recorrido. Los datos se anotaron en la tabla de la imagen.

¿Cuál ciclista tuvo la mayor rapidez?', 'La rapidez se obtiene al dividir la distancia entre el tiempo. Ciclista 1 recorrió 600 m en 100 s, es decir, 6 m/s, la mayor rapidez del grupo.', false),
    ('cie-3-2-b', 38, 'Energía', 'Manifestaciones de la energía', 'alto', 'Lea la siguiente información:

En el Parque Metropolitano La Sabana, en San José, Priscilla entrena para una competencia de atletismo. Su entrenadora le pidió correr un tramo recto de 100 m manteniendo siempre una rapidez de 5 m/s. Mientras tanto, la entrenadora toma el tiempo con un cronómetro desde la salida hasta la llegada.

¿Cuánto tiempo tardará Priscilla en recorrer el tramo completo?', 'Si Priscilla avanza 5 m en cada segundo, para recorrer 100 m necesita 100 ÷ 5 = 20 segundos. Para hallar el tiempo se divide la distancia entre la rapidez.', false),
    ('cie-3-2-c', 39, 'Energía', 'Manifestaciones de la energía', 'alto', 'Observe la siguiente imagen:

![Tres escenas numeradas. Situación 1: unas manos frente a una fogata, sin tocarla. Situación 2: una cuchara de metal dentro de una taza con bebida caliente; el mango que queda afuera se calienta. Situación 3: un calentador en el piso de un cuarto; flechas muestran el aire caliente que sube y el aire frío que baja.](/simulacros-nuevos/cie-3-2-calor.svg)

En la clase de Ciencias se presentaron tres situaciones de la vida diaria en las que el calor pasa de un cuerpo más caliente a otro más frío. La docente explicó que en cada situación el calor se transmite de una manera diferente y pidió identificar cuál es cada una.

¿Cuál opción indica la forma de transmisión del calor en las situaciones 1, 2 y 3, respectivamente?', 'Las manos se calientan sin tocar la fogata, y eso es radiación. El mango de la cuchara se calienta por contacto con la bebida, que es conducción, y el aire caliente sube y el frío baja alrededor del calentador, que es convección.', false),
    ('cie-3-2-d', 40, 'Energía', 'Manifestaciones de la energía', 'intermedio', 'Lea la siguiente información:

Allison y su papá van a cambiar el techo del gallinero. Quieren un material que deje pasar parte de la claridad del día, para que las gallinas no queden a oscuras, pero que no permita ver con nitidez lo que hay del otro lado, para que las aves estén tranquilas. En la ferretería les ofrecen varias opciones.

¿Qué tipo de material necesitan y cuál es un ejemplo?', 'Un material translúcido deja pasar parte de la luz, pero no permite ver con claridad lo que hay detrás, como el plástico lechoso. Así las gallinas tienen claridad y a la vez están tranquilas.', false),
    ('cie-3-2-e', 41, 'Energía', 'Manifestaciones de la energía', 'intermedio', 'Lea la siguiente información:

Un domingo, Dylan visitó un río con su familia.

1. Al mirar el fondo de una poza de agua clara, le pareció poco profunda; pero cuando entró, el agua le llegó más arriba de la cintura.

2. En una parte donde el agua estaba muy quieta, vio sobre la superficie la imagen de los árboles de la orilla, como en un espejo.

¿Qué fenómenos de la luz se presentan en las situaciones 1 y 2, respectivamente?', 'En la poza, la luz se desvía al pasar del agua al aire, y eso hace que el fondo parezca más cerca: es refracción. En el agua quieta, la luz rebota en la superficie y forma una imagen como en un espejo: es reflexión.', false),
    ('cie-3-2-f', 42, 'Energía', 'Manifestaciones de la energía', 'alto', 'Lea la siguiente información:

Durante una tormenta, Emanuel ve un relámpago y empieza a contar los segundos hasta escuchar el trueno: cuenta 3 segundos. Su hermana le explica que la luz del relámpago llega casi al instante, mientras que el sonido del trueno viaja por el aire con una rapidez aproximada de 340 m/s.

¿A qué distancia aproximada de Emanuel se produjo el relámpago?', 'El sonido avanza unos 340 m en cada segundo, así que en 3 segundos recorre 340 × 3 = 1020 m. Por eso el relámpago ocurrió a poco más de un kilómetro de Emanuel.', false),
    ('cie-3-2-g', 43, 'Energía', 'Manifestaciones de la energía', 'intermedio', 'Lea la siguiente información:

En un festival de un pueblo de Guanacaste, un grupo interpretó piezas tradicionales con la marimba, instrumento nacional de Costa Rica. Sus teclas de madera vibran de forma ordenada y producen notas agradables. Mientras tanto, en una finca cercana, un trabajador cortaba un árbol caído con una motosierra, que producía un zumbido fuerte, desordenado y molesto para el público.

¿Qué característica permite clasificar el sonido de la motosierra como ruido?', 'El ruido es un sonido producido por vibraciones irregulares, sin orden, que resulta molesto. La marimba, en cambio, produce vibraciones ordenadas que se escuchan como notas agradables.', false),
    ('cie-3-2-h', 44, 'Energía', 'Manifestaciones de la energía', 'alto', 'Considere la siguiente información:

En muchas playas del mundo donde anidan tortugas marinas, las crías salen del nido por la noche y se orientan hacia el horizonte del mar, que suele ser la zona más clara. Cuando cerca de la playa hay hoteles, casas o calles muy iluminadas, muchas crías caminan tierra adentro y no logran llegar al agua.

¿Qué efecto de la luz en el ambiente se describe?', 'Las crías de tortuga buscan la zona más clara para llegar al mar. Las luces de hoteles, casas y calles las confunden y las llevan en la dirección equivocada, por eso la luz artificial puede dañar a la fauna.', false),
    ('cie-3-3-a', 45, 'Energía', 'Electricidad y magnetismo', 'alto', 'Observe la siguiente imagen:

![Dos circuitos con una batería y tres bombillos cada uno. Circuito 1: los tres bombillos están uno detrás de otro en un solo camino; el bombillo del centro tiene una X. Circuito 2: cada bombillo está en su propio camino conectado a la batería; el bombillo del centro tiene una X.](/simulacros-nuevos/cie-3-3-circuitos.svg)

Nicole armó dos circuitos con una batería, cables y tres bombillos iguales en cada uno. En ambos circuitos, el bombillo marcado con una X se fundió, es decir, su filamento se rompió y la corriente ya no puede pasar a través de él. Los demás bombillos están en buen estado.

¿Qué ocurre con los demás bombillos de cada circuito después de que se funde el bombillo marcado?', 'En el circuito 1 los bombillos están en serie, uno detrás de otro, y si uno se funde se corta el único camino de la corriente. En el circuito 2 están en paralelo, así que la corriente sigue por los otros caminos y esos bombillos siguen encendidos.', false),
    ('cie-3-3-b', 46, 'Energía', 'Electricidad y magnetismo', 'intermedio', 'Analice la siguiente tabla:

En el laboratorio, Brandon probó varios objetos en un circuito con una batería y un bombillo. Colocó cada objeto entre los extremos de dos cables y observó si el bombillo encendía.

| Objeto | ¿Encendió el bombillo? |
|---|---|
| Clip de metal | Sí |
| Borrador | No |
| Mina de lápiz | Sí |
| Palito de madera | No |

Según los resultados, ¿cuál opción reúne solo materiales aislantes?', 'Los materiales aislantes no dejan pasar la corriente eléctrica, por eso con ellos el bombillo no encendió. En la prueba de Brandon, eso ocurrió con el borrador y con el palito de madera.', false),
    ('cie-3-3-c', 47, 'Energía', 'Electricidad y magnetismo', 'alto', 'Lea la siguiente información:

En la clase de Ciencias, Rebeca frotó dos tiras de plástico iguales con el mismo paño de lana. Luego las sostuvo de un extremo y las acercó, sin que se tocaran. Las tiras se separaron una de la otra. Después acercó una de las tiras a pedacitos de papel, y los pedacitos se pegaron a la tira.

¿Qué explica que las dos tiras se separaran?', 'Como las dos tiras se frotaron con el mismo paño, quedaron con el mismo tipo de carga eléctrica. Las cargas iguales se repelen, por eso las tiras se alejaron una de la otra.', false),
    ('cie-3-3-d', 48, 'Energía', 'Electricidad y magnetismo', 'intermedio', 'Lea la siguiente información:

En un centro de reciclaje, una grúa tiene en su extremo un disco grande formado por una bobina de alambre enrollado alrededor de un núcleo de hierro. Cuando el operario activa el interruptor, el disco levanta piezas de chatarra de hierro. Al llegar al contenedor, el operario apaga el interruptor y la chatarra cae.

¿Qué característica del disco permite soltar la chatarra en el contenedor?', 'La grúa usa un electroimán, que es una bobina con corriente eléctrica que se comporta como un imán. Al apagar el interruptor deja de pasar la corriente, el disco pierde su magnetismo y la chatarra cae.', false),
    ('cie-4-1-a', 49, 'Geofísica', 'Estructura de la Tierra, clima y relieve', 'intermedio', 'Observe la siguiente imagen:

![Columna de la atmósfera dividida en cuatro capas numeradas desde la superficie. Capa 1: de 0 a unos 12 kilómetros. Capa 2: de unos 12 a unos 50 kilómetros. Capa 3: de unos 50 a unos 80 kilómetros. Capa 4: por encima de unos 80 kilómetros.](/simulacros-nuevos/cie-4-1-atmosfera.svg)

La imagen representa las capas de la atmósfera ordenadas según su altura sobre la superficie terrestre. Los límites entre una capa y otra son aproximados, porque cambian un poco según el lugar del planeta y la época del año. En cada capa la temperatura se comporta de manera distinta.

¿Qué ocurre en la capa marcada con el número 2?', 'La capa 2 es la estratosfera, donde se encuentra la capa de ozono. El ozono filtra parte de los rayos ultravioleta del Sol y así protege a los seres vivos.', false),
    ('cie-4-1-b', 50, 'Geofísica', 'Estructura de la Tierra, clima y relieve', 'alto', 'Lea la siguiente información:

Durante una semana, Karla anotó dos frases que escuchó en su casa:

1. «En Guanacaste, de diciembre a abril casi no llueve y hace mucho calor; así ha sido durante muchísimos años».

2. «Esta tarde, en Cartago, cayó un fuerte aguacero con granizo y luego salió el sol».

¿A qué concepto se refiere cada frase, en ese orden?', 'El clima describe las condiciones que se repiten en un lugar durante muchos años, como la época seca de Guanacaste. El tiempo atmosférico es lo que ocurre en un momento corto, como el aguacero de una tarde en Cartago.', false),
    ('cie-4-1-c', 51, 'Geofísica', 'Estructura de la Tierra, clima y relieve', 'alto', 'Lea la siguiente información:

En las faldas de varios volcanes del Valle Central de Costa Rica, la ceniza y otros materiales expulsados en erupciones de hace mucho tiempo se acumularon capa tras capa y formaron suelos muy fértiles. Hoy esas tierras se aprovechan para cultivar hortalizas, papas y café.

¿Qué tipo de agente modificó ese relieve y qué influencia tiene en las actividades humanas?', 'Las erupciones volcánicas se originan en el interior de la Tierra, por eso son un agente interno que modifica el relieve. En este caso, la ceniza formó suelos fértiles que favorecen la agricultura.', false),
    ('cie-4-1-d', 52, 'Geofísica', 'Estructura de la Tierra, clima y relieve', 'alto', 'El siguiente texto se relaciona con la geosfera:

Costa Rica se ubica en una zona donde la placa del Coco se hunde lentamente debajo de la placa Caribe. Esas placas son grandes pedazos de la capa rígida exterior de la Tierra, que está formada por la corteza y por la parte más alta del manto. Debajo de ella, el manto es más caliente y sus materiales se pueden mover muy despacio.

Según la información, ¿cuál afirmación describe correctamente la capa que forma las placas?', 'Las placas son pedazos de la litosfera, la capa rígida que abarca la corteza y la parte superior del manto. Por eso la litosfera no es lo mismo que la corteza: es un poco más gruesa.', false),
    ('cie-4-1-e', 53, 'Geofísica', 'Estructura de la Tierra, clima y relieve', 'intermedio', 'Lea la siguiente información:

El agua del planeta se encuentra en lugares muy distintos. Una parte forma los océanos y mares; otra corre por ríos y quebradas; otra está congelada en los polos y en las cumbres de montañas muy altas. También hay agua en las nubes y en el vapor del aire, y una gran cantidad se acumula bajo el suelo, entre las rocas.

¿Cuál conclusión sobre la hidrosfera es correcta?', 'La hidrosfera reúne toda el agua del planeta: la líquida de mares, ríos y aguas subterráneas, la sólida del hielo y la gaseosa del vapor. Por eso incluye el agua en sus tres estados.', false),
    ('cie-4-2-a', 54, 'Geofísica', 'Movimientos de la Tierra y la Luna', 'intermedio', 'Lea la siguiente información:

Melany vive en Costa Rica y tiene una prima que vive en Japón. Un día, a las doce del mediodía en Costa Rica, Melany la llamó por videollamada: su prima ya estaba en pijama porque allá era de madrugada del día siguiente. Esta diferencia de horario ocurre todos los días del año.

¿Cuál movimiento explica que en ambos países sea de día y de noche en momentos distintos?', 'La Tierra gira sobre su eje y tarda un día en dar una vuelta completa. Mientras un lado mira hacia el Sol y tiene día, el lado opuesto, como Japón en ese momento, tiene noche.', false),
    ('cie-4-2-b', 55, 'Geofísica', 'Movimientos de la Tierra y la Luna', 'alto', 'Observe la siguiente imagen:

![Esquema sin escala con el Sol a la izquierda, la Tierra en el centro y la Luna a la derecha, en línea recta. La Luna está dentro de la sombra que proyecta la Tierra.](/simulacros-nuevos/cie-4-2-eclipse.svg)

El esquema, que no está dibujado a escala, muestra la posición del Sol, la Tierra y la Luna durante un fenómeno que muchas personas observaron desde el lado de la Tierra donde era de noche. En ese momento, los tres astros estaban alineados.

¿Qué fenómeno representa el esquema y en qué fase se encontraba la Luna?', 'Cuando la Tierra queda entre el Sol y la Luna, su sombra cae sobre la Luna y se produce un eclipse lunar. En esa posición la Luna está del lado opuesto al Sol, por eso este eclipse ocurre en fase de luna llena.', false),
    ('cie-4-2-c', 56, 'Geofísica', 'Movimientos de la Tierra y la Luna', 'intermedio', 'Lea la siguiente información:

En Puntarenas, los pescadores artesanales revisan cada día una tabla de mareas antes de salir en sus botes. Saben que el nivel del mar sube y baja dos veces al día y que, en ciertos momentos, la marea baja deja al descubierto parte del estero. Por eso planifican la salida y el regreso según esos cambios.

¿Cuál es la causa principal de los cambios que observan los pescadores?', 'La Luna atrae el agua de los océanos con su fuerza de gravedad, y eso hace que el nivel del mar suba y baje. Como la Tierra gira, cada costa pasa por esos cambios dos veces al día.', false),
    ('cie-4-2-d', 57, 'Geofísica', 'Movimientos de la Tierra y la Luna', 'alto', 'Lea la siguiente información:

En diciembre, en Argentina las familias van a la playa porque es verano, mientras que en Canadá cae nieve porque es invierno. En junio ocurre lo contrario. Durante todo el año, la Tierra está casi a la misma distancia del Sol; de hecho, en enero está un poco más cerca que en julio.

¿Qué explica que las estaciones estén invertidas en esos dos países?', 'El eje de la Tierra está inclinado y, mientras la Tierra viaja alrededor del Sol, cada hemisferio recibe los rayos solares de forma más directa en distintos meses. Por eso, cuando en Argentina es verano, en Canadá es invierno.', false),
    ('cie-4-3-a', 58, 'Geofísica', 'Sistema Solar y Universo', 'intermedio', 'El siguiente texto se relaciona con el Sistema Solar:

Entre las órbitas de Marte y Júpiter hay una gran cantidad de asteroides que forman un cinturón. Ese cinturón sirve como referencia para separar los ocho planetas del Sistema Solar en dos grupos: los cuatro que están antes del cinturón, más cercanos al Sol, y los cuatro que están después, más alejados.

¿Qué característica diferencia a los planetas del grupo más alejado del Sol?', 'Júpiter, Saturno, Urano y Neptuno están después del cinturón de asteroides y son planetas gigantes formados en su mayor parte por gases. Los cuatro más cercanos al Sol, en cambio, son pequeños y rocosos.', false),
    ('cie-4-3-b', 59, 'Geofísica', 'Sistema Solar y Universo', 'intermedio', 'Lea la siguiente información:

En una noche despejada, lejos de las luces de la ciudad, se observa en el cielo una franja blanquecina formada por miles de millones de estrellas. Esa franja es parte de la galaxia en la que se encuentra el Sistema Solar. El Sol, que ilumina y calienta la Tierra, es solo una de las estrellas de esa galaxia.

¿Cuál opción describe correctamente al Sol y su ubicación?', 'El Sol es una estrella de tamaño mediano que se encuentra en uno de los brazos de la Vía Láctea, lejos de su centro. Parece tan grande y brillante porque está mucho más cerca de la Tierra que las demás estrellas.', false),
    ('cie-4-3-c', 60, 'Geofísica', 'Sistema Solar y Universo', 'alto', 'Lea la siguiente información:

1. Nave sin tripulación que viaja durante años hacia otros planetas y envía fotografías y datos a la Tierra.

2. Laboratorio que gira alrededor de la Tierra, donde astronautas viven varios meses y hacen experimentos.

3. Aparato que gira alrededor de la Tierra y transmite imágenes de las nubes para pronosticar el tiempo.

¿Cuál opción nombra correctamente, en orden, los aportes tecnológicos descritos?', 'La sonda viaja lejos sin tripulación para estudiar otros planetas, la estación espacial es un laboratorio en órbita donde viven astronautas y el satélite artificial gira alrededor de la Tierra enviando información. Cada uno aporta datos distintos para conocer el espacio y nuestro planeta.', false)
) as v (codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
where s.slug = 'nuevo-ciencias-1'
on conflict (simulacro_id, codigo) do update set
  orden       = excluded.orden,
  tema        = excluded.tema,
  subtema     = excluded.subtema,
  nivel       = excluded.nivel,
  enunciado   = excluded.enunciado,
  explicacion = excluded.explicacion,
  tiene_latex = excluded.tiene_latex;

-- Si la clave de un item cambio de letra, la vieja tiene que dejar de ser
-- correcta antes de marcar la nueva: el indice de una sola correcta no
-- espera al final de la carga.
update public.simulacro_nuevo_opciones o
set es_correcta = false
from public.simulacro_nuevo_items i
join public.simulacros_nuevos s on s.id = i.simulacro_id
where o.item_id = i.id
  and s.slug = 'nuevo-ciencias-1';

insert into public.simulacro_nuevo_opciones (item_id, letra, texto, es_correcta)
select i.id, v.letra, v.texto, v.es_correcta
from (values
    ('cie-1-1-a', 'A', 'el núcleo de la célula.', false),
    ('cie-1-1-a', 'B', 'el citoplasma.', false),
    ('cie-1-1-a', 'C', 'la pared celular.', false),
    ('cie-1-1-a', 'D', 'la membrana celular.', true),
    ('cie-1-1-b', 'A', 'R, Q, S y P', false),
    ('cie-1-1-b', 'B', 'Q, R, S y P', true),
    ('cie-1-1-b', 'C', 'Q, S, R y P', false),
    ('cie-1-1-b', 'D', 'P, S, R y Q', false),
    ('cie-1-1-c', 'A', 'Contraerse para mover y servir de soporte.', true),
    ('cie-1-1-c', 'B', 'Transmitir mensajes y servir de soporte.', false),
    ('cie-1-1-c', 'C', 'Contraerse para mover y cubrir el cuerpo.', false),
    ('cie-1-1-c', 'D', 'Servir de soporte y contraerse para mover.', false),
    ('cie-1-2-a', 'A', 'Las plaquetas y luego los glóbulos blancos.', true),
    ('cie-1-2-a', 'B', 'Los glóbulos blancos y luego las plaquetas.', false),
    ('cie-1-2-a', 'C', 'Los glóbulos rojos y luego los glóbulos blancos.', false),
    ('cie-1-2-a', 'D', 'Las plaquetas y luego los glóbulos rojos.', false),
    ('cie-1-2-b', 'A', 'En el 1 es pasiva y en el 2 es activa.', false),
    ('cie-1-2-b', 'B', 'En ambos casos la inmunidad es activa.', false),
    ('cie-1-2-b', 'C', 'En ambos casos la inmunidad es pasiva.', false),
    ('cie-1-2-b', 'D', 'En el 1 es activa y en el 2 es pasiva.', true),
    ('cie-1-2-c', 'A', 'evita que los microbios dañen la salud.', true),
    ('cie-1-2-c', 'B', 'lleva oxígeno a todas las células del cuerpo.', false),
    ('cie-1-2-c', 'C', 'detiene el sangrado de las heridas pequeñas.', false),
    ('cie-1-2-c', 'D', 'elimina por la orina los desechos de la sangre.', false),
    ('cie-1-3-a', 'A', 'elimina de inmediato al microbio que ya causó la enfermedad.', false),
    ('cie-1-3-a', 'B', 'entrena las defensas para actuar pronto ante el microbio verdadero.', true),
    ('cie-1-3-a', 'C', 'le da al cuerpo los anticuerpos listos sin que tenga que fabricarlos.', false),
    ('cie-1-3-a', 'D', 'debilita al microbio verdadero cuando este entra en el cuerpo.', false),
    ('cie-1-3-b', 'A', 'Si alguien ya se enfermó, la vacuna lo cura en pocos días.', false),
    ('cie-1-3-b', 'B', 'Con pocas personas vacunadas, toda la comunidad queda igual de protegida.', false),
    ('cie-1-3-b', 'C', 'Si la mayoría recibe la vacuna, se protege a quienes no la tienen.', true),
    ('cie-1-3-b', 'D', 'Las vacunas protegen solo a quien las recibe y a nadie más.', false),
    ('cie-1-3-c', 'A', 'cura a las personas que ya tienen la enfermedad en su cuerpo.', false),
    ('cie-1-3-c', 'B', 'solo puede proteger a la persona vacunada por pocos días.', false),
    ('cie-1-3-c', 'C', 'puede eliminar una enfermedad si se aplica en todo el mundo.', true),
    ('cie-1-3-c', 'D', 'hace que los virus se vuelvan más fuertes y peligrosos.', false),
    ('cie-1-4-a', 'A', 'absorber el agua que sobra para formar las heces.', false),
    ('cie-1-4-a', 'B', 'triturar el alimento y mezclarlo con jugos.', false),
    ('cie-1-4-a', 'C', 'producir la bilis que ayuda a digerir grasas.', false),
    ('cie-1-4-a', 'D', 'absorber los nutrientes y pasarlos a la sangre.', true),
    ('cie-1-4-b', 'A', 'Cargar el bulto en un hombro', true),
    ('cie-1-4-b', 'B', 'Jugar fútbol en el recreo', false),
    ('cie-1-4-b', 'C', 'Dormir nueve horas', false),
    ('cie-1-4-b', 'D', 'Tomar agua en lugar de refresco', false),
    ('cie-1-4-c', 'A', 'Reemplazan la necesidad de comer de forma variada y sana.', false),
    ('cie-1-4-c', 'B', 'Fomentan el ejercicio, que fortalece corazón y pulmones.', true),
    ('cie-1-4-c', 'C', 'Evitan que las personas se contagien de cualquier microbio.', false),
    ('cie-1-4-c', 'D', 'Sustituyen las horas de descanso que el cuerpo necesita.', false),
    ('cie-1-4-d', 'A', 'excretar residuos que el cuerpo no usa.', true),
    ('cie-1-4-d', 'B', 'absorber agua y sales desde fuera del cuerpo.', false),
    ('cie-1-4-d', 'C', 'transportar oxígeno hacia los músculos.', false),
    ('cie-1-4-d', 'D', 'digerir las grasas que se acumulan en ella.', false),
    ('cie-1-5-a', 'A', 'Los pulmones toman más oxígeno y la sangre lo lleva a los músculos.', true),
    ('cie-1-5-a', 'B', 'Los pulmones toman más nutrientes y la sangre los lleva a los músculos.', false),
    ('cie-1-5-a', 'C', 'Los músculos producen oxígeno y la sangre lo lleva a los pulmones.', false),
    ('cie-1-5-a', 'D', 'El corazón produce oxígeno y los pulmones lo llevan a los músculos.', false),
    ('cie-1-5-b', 'A', 'digestivo y circulatorio.', false),
    ('cie-1-5-b', 'B', 'nervioso y circulatorio.', false),
    ('cie-1-5-b', 'C', 'digestivo y respiratorio.', true),
    ('cie-1-5-b', 'D', 'respiratorio y excretor.', false),
    ('cie-1-5-c', 'A', 'Los riñones controlan el agua del cuerpo sin ayuda de otros órganos.', false),
    ('cie-1-5-c', 'B', 'Varios sistemas actúan coordinados para mantener el agua del cuerpo.', true),
    ('cie-1-5-c', 'C', 'El sistema nervioso solo participa cuando el cuerpo está en movimiento.', false),
    ('cie-1-5-c', 'D', 'El sudor y la orina son procesos que no tienen relación entre sí.', false),
    ('cie-2-1-a', 'A', 'Mazorcas de maíz de distintos colores en una misma finca.', false),
    ('cie-2-1-a', 'B', 'Un manglar y un páramo dentro del mismo país.', false),
    ('cie-2-1-a', 'C', 'El crecimiento de un mismo colibrí desde que nace.', false),
    ('cie-2-1-a', 'D', 'Varias clases de colibríes que visitan un mismo jardín.', true),
    ('cie-2-1-b', 'A', 'estructural, porque depende de la forma del caparazón.', false),
    ('cie-2-1-b', 'B', 'fisiológica, porque ocurre dentro del cuerpo de la hembra.', false),
    ('cie-2-1-b', 'C', 'conductual, porque es una forma de actuar en grupo.', true),
    ('cie-2-1-b', 'D', 'estructural, porque las aletas les permiten cavar nidos.', false),
    ('cie-2-1-c', 'A', 'nutrición, porque así fabrica su propio alimento.', false),
    ('cie-2-1-c', 'B', 'reproducción, porque así protege sus semillas.', false),
    ('cie-2-1-c', 'C', 'relación, porque responde a un estímulo del entorno.', true),
    ('cie-2-1-c', 'D', 'relación, porque así se comunica con las otras plantas.', false),
    ('cie-2-1-d', 'A', 'la tala de los bosques cercanos a las playas.', false),
    ('cie-2-1-d', 'B', 'la invasión de una especie de otra región.', true),
    ('cie-2-1-d', 'C', 'la cacería ilegal de especies en peligro.', false),
    ('cie-2-1-d', 'D', 'la contaminación del agua por desechos plásticos.', false),
    ('cie-2-2-a', 'A', 'Un saltamontes y una lombriz de tierra.', true),
    ('cie-2-2-a', 'B', 'Una lombriz de tierra y un saltamontes.', false),
    ('cie-2-2-a', 'C', 'Un saltamontes y un sapo.', false),
    ('cie-2-2-a', 'D', 'Un cangrejo y una lombriz de tierra.', false),
    ('cie-2-2-b', 'A', 'Ambos están formados por una sola célula.', false),
    ('cie-2-2-b', 'B', 'Ninguno de los dos produce su propio alimento.', true),
    ('cie-2-2-b', 'C', 'Ambos fabrican su alimento con la luz del sol.', false),
    ('cie-2-2-b', 'D', 'Ninguno de los dos tiene núcleo en sus células.', false),
    ('cie-2-2-c', 'A', 'vivíparo, que pasa su vida entre el agua y la tierra.', false),
    ('cie-2-2-c', 'B', 'ovíparo, que pasa toda su vida dentro del agua.', false),
    ('cie-2-2-c', 'C', 'vivíparo, que pasa toda su vida fuera del agua.', false),
    ('cie-2-2-c', 'D', 'ovíparo, que pasa su vida entre el agua y la tierra.', true),
    ('cie-2-2-d', 'A', 'Tienen alas que les permiten volar.', false),
    ('cie-2-2-d', 'B', 'Ponen sus huevos dentro de cuevas.', false),
    ('cie-2-2-d', 'C', 'Comen frutos, insectos o néctar.', false),
    ('cie-2-2-d', 'D', 'Alimentan a sus crías con leche.', true),
    ('cie-2-3-a', 'A', 'competencia interespecífica por la reproducción.', false),
    ('cie-2-3-a', 'B', 'competencia intraespecífica por el alimento.', false),
    ('cie-2-3-a', 'C', 'competencia intraespecífica por la reproducción.', true),
    ('cie-2-3-a', 'D', 'depredación entre individuos de la misma especie.', false),
    ('cie-2-3-b', 'A', 'Mutualismo, parasitismo y comensalismo.', false),
    ('cie-2-3-b', 'B', 'Comensalismo, parasitismo y mutualismo.', true),
    ('cie-2-3-b', 'C', 'Comensalismo, depredación y mutualismo.', false),
    ('cie-2-3-b', 'D', 'Parasitismo, comensalismo y mutualismo.', false),
    ('cie-2-3-c', 'A', 'Los ratones desaparecerían por falta de depredadores.', false),
    ('cie-2-3-c', 'B', 'Las plantas de maíz producirían más mazorcas.', false),
    ('cie-2-3-c', 'C', 'Los ratones dejarían de reproducirse en la finca.', false),
    ('cie-2-3-c', 'D', 'Los ratones aumentarían y dañarían más cosechas.', true),
    ('cie-2-3-d', 'A', 'comensalismo, porque solo las hormigas salen ganando.', false),
    ('cie-2-3-d', 'B', 'parasitismo, porque las hormigas viven dentro de la planta.', false),
    ('cie-2-3-d', 'C', 'mutualismo, porque ambas especies salen ganando.', true),
    ('cie-2-3-d', 'D', 'depredación, porque las hormigas atacan a otros insectos.', false),
    ('cie-2-4-a', 'A', 'Oxígeno y dióxido de carbono.', false),
    ('cie-2-4-a', 'B', 'Nitrógeno y oxígeno.', false),
    ('cie-2-4-a', 'C', 'Vapor de agua y oxígeno.', false),
    ('cie-2-4-a', 'D', 'Dióxido de carbono y oxígeno.', true),
    ('cie-2-4-b', 'A', 'Elimina por completo el dióxido de carbono del aire.', false),
    ('cie-2-4-b', 'B', 'Sostiene las cadenas alimentarias y renueva el aire.', true),
    ('cie-2-4-b', 'C', 'Calienta el agua del mar para que vivan los peces.', false),
    ('cie-2-4-b', 'D', 'Permite que los peces respiren sin necesitar oxígeno.', false),
    ('cie-3-1-a', 'A', 'La potencial se transforma en cinética.', false),
    ('cie-3-1-a', 'B', 'La cinética y la potencial aumentan juntas.', false),
    ('cie-3-1-a', 'C', 'La cinética se transforma en potencial.', true),
    ('cie-3-1-a', 'D', 'La potencial disminuye hasta desaparecer.', false),
    ('cie-3-1-b', 'A', 'La caja 1', false),
    ('cie-3-1-b', 'B', 'La caja 2', false),
    ('cie-3-1-b', 'C', 'La caja 3', true),
    ('cie-3-1-b', 'D', 'La caja 4', false),
    ('cie-3-1-c', 'A', 'Hidroeléctrica y eólica.', false),
    ('cie-3-1-c', 'B', 'Geotérmica y magnética.', false),
    ('cie-3-1-c', 'C', 'Química y eólica.', false),
    ('cie-3-1-c', 'D', 'Geotérmica y eólica.', true),
    ('cie-3-1-d', 'A', 'funciona igual durante el día y durante la noche.', false),
    ('cie-3-1-d', 'B', 'no contamina la atmósfera al generar corriente.', true),
    ('cie-3-1-d', 'C', 'se obtiene de restos de seres vivos muy antiguos.', false),
    ('cie-3-1-d', 'D', 'produce más electricidad que cualquier otra fuente.', false),
    ('cie-3-1-e', 'A', 'De eléctrica a cinética y de cinética a lumínica.', false),
    ('cie-3-1-e', 'B', 'De cinética a eléctrica y de eléctrica a lumínica.', true),
    ('cie-3-1-e', 'C', 'De química a eléctrica y de eléctrica a lumínica.', false),
    ('cie-3-1-e', 'D', 'De cinética a lumínica y de lumínica a eléctrica.', false),
    ('cie-3-1-f', 'A', 'Transforma la electricidad en calor y no en luz.', false),
    ('cie-3-1-f', 'B', 'Funciona con energía química en lugar de eléctrica.', false),
    ('cie-3-1-f', 'C', 'Desperdicia menos energía en forma de calor.', true),
    ('cie-3-1-f', 'D', 'Produce una luz más débil que la del otro bombillo.', false),
    ('cie-3-2-a', 'A', 'Ciclista 1', true),
    ('cie-3-2-a', 'B', 'Ciclista 2', false),
    ('cie-3-2-a', 'C', 'Ciclista 3', false),
    ('cie-3-2-a', 'D', 'Ciclista 4', false),
    ('cie-3-2-b', 'A', '0,05 s', false),
    ('cie-3-2-b', 'B', '20 s', true),
    ('cie-3-2-b', 'C', '95 s', false),
    ('cie-3-2-b', 'D', '500 s', false),
    ('cie-3-2-c', 'A', 'Radiación, convección y conducción.', false),
    ('cie-3-2-c', 'B', 'Conducción, radiación y convección.', false),
    ('cie-3-2-c', 'C', 'Convección, conducción y radiación.', false),
    ('cie-3-2-c', 'D', 'Radiación, conducción y convección.', true),
    ('cie-3-2-d', 'A', 'Translúcido, como una lámina de plástico lechoso.', true),
    ('cie-3-2-d', 'B', 'Transparente, como una lámina de vidrio sin color.', false),
    ('cie-3-2-d', 'C', 'Opaco, como una lámina de zinc.', false),
    ('cie-3-2-d', 'D', 'Opaco, como una lámina de plástico lechoso.', false),
    ('cie-3-2-e', 'A', 'Reflexión y refracción.', false),
    ('cie-3-2-e', 'B', 'Refracción y refracción.', false),
    ('cie-3-2-e', 'C', 'Refracción y reflexión.', true),
    ('cie-3-2-e', 'D', 'Reflexión y reflexión.', false),
    ('cie-3-2-f', 'A', '113 m', false),
    ('cie-3-2-f', 'B', '337 m', false),
    ('cie-3-2-f', 'C', '343 m', false),
    ('cie-3-2-f', 'D', '1020 m', true),
    ('cie-3-2-g', 'A', 'No produce vibraciones que viajen por el aire.', false),
    ('cie-3-2-g', 'B', 'Viaja más despacio por el aire que la música.', false),
    ('cie-3-2-g', 'C', 'Tiene un volumen más bajo que la música.', false),
    ('cie-3-2-g', 'D', 'Vibra de manera irregular y desagradable.', true),
    ('cie-3-2-h', 'A', 'La luz de la luna impide que las crías salgan de los nidos.', false),
    ('cie-3-2-h', 'B', 'La luz artificial altera la orientación de algunas especies.', true),
    ('cie-3-2-h', 'C', 'El calor de los bombillos seca la arena de los nidos.', false),
    ('cie-3-2-h', 'D', 'La luz de las ciudades ayuda a las crías a encontrar el mar.', false),
    ('cie-3-3-a', 'A', 'En el 1 siguen encendidos y en el 2 se apagan.', false),
    ('cie-3-3-a', 'B', 'En el 1 se apagan y en el 2 siguen encendidos.', true),
    ('cie-3-3-a', 'C', 'En los dos circuitos se apagan todos.', false),
    ('cie-3-3-a', 'D', 'En los dos circuitos siguen encendidos.', false),
    ('cie-3-3-b', 'A', 'El borrador y el palito de madera.', true),
    ('cie-3-3-b', 'B', 'El clip de metal y el borrador.', false),
    ('cie-3-3-b', 'C', 'La mina de lápiz y el palito de madera.', false),
    ('cie-3-3-b', 'D', 'El clip de metal y la mina de lápiz.', false),
    ('cie-3-3-c', 'A', 'Quedaron con cargas de distinto tipo y se repelen.', false),
    ('cie-3-3-c', 'B', 'Quedaron sin carga después de frotarlas con el paño.', false),
    ('cie-3-3-c', 'C', 'Quedaron con cargas del mismo tipo y se repelen.', true),
    ('cie-3-3-c', 'D', 'Quedaron con cargas del mismo tipo y se atraen.', false),
    ('cie-3-3-d', 'A', 'Su magnetismo depende de que pase corriente eléctrica.', true),
    ('cie-3-3-d', 'B', 'Su magnetismo es permanente, como el de un imán común.', false),
    ('cie-3-3-d', 'C', 'El hierro pierde su peso cuando se apaga la grúa.', false),
    ('cie-3-3-d', 'D', 'Atrae solo materiales de aluminio, como las latas.', false),
    ('cie-4-1-a', 'A', 'Se forman las nubes, la lluvia y casi todo el viento.', false),
    ('cie-4-1-a', 'B', 'Se queman muchos meteoroides al entrar a la atmósfera.', false),
    ('cie-4-1-a', 'C', 'Se reflejan las ondas de radio que viajan por el planeta.', false),
    ('cie-4-1-a', 'D', 'El ozono filtra parte de los rayos ultravioleta del Sol.', true),
    ('cie-4-1-b', 'A', 'Al tiempo atmosférico y al clima.', false),
    ('cie-4-1-b', 'B', 'Al clima en las dos frases.', false),
    ('cie-4-1-b', 'C', 'Al clima y al tiempo atmosférico.', true),
    ('cie-4-1-b', 'D', 'Al tiempo atmosférico en las dos frases.', false),
    ('cie-4-1-c', 'A', 'Un agente externo, que favoreció la agricultura de la zona.', false),
    ('cie-4-1-c', 'B', 'Un agente interno, que favoreció la agricultura de la zona.', true),
    ('cie-4-1-c', 'C', 'Un agente interno, que impidió la agricultura de la zona.', false),
    ('cie-4-1-c', 'D', 'Un agente externo, que impidió la agricultura de la zona.', false),
    ('cie-4-1-d', 'A', 'Es la corteza, que también abarca todo el manto terrestre.', false),
    ('cie-4-1-d', 'B', 'Es el manto, que forma una capa sólida y rígida.', false),
    ('cie-4-1-d', 'C', 'Es la litosfera, que está formada solo por la corteza terrestre.', false),
    ('cie-4-1-d', 'D', 'Es la litosfera, que abarca la corteza y el manto superior.', true),
    ('cie-4-1-e', 'A', 'Incluye el agua en estado sólido, líquido y gaseoso.', true),
    ('cie-4-1-e', 'B', 'Está formada solo por el agua salada de los océanos.', false),
    ('cie-4-1-e', 'C', 'Abarca únicamente el agua que se ve en la superficie.', false),
    ('cie-4-1-e', 'D', 'Excluye el hielo porque este forma parte de la geosfera.', false),
    ('cie-4-2-a', 'A', 'La rotación de la Tierra sobre su propio eje.', true),
    ('cie-4-2-a', 'B', 'La traslación de la Tierra alrededor del Sol.', false),
    ('cie-4-2-a', 'C', 'La rotación de la Luna sobre su propio eje.', false),
    ('cie-4-2-a', 'D', 'La traslación de la Luna alrededor de la Tierra.', false),
    ('cie-4-2-b', 'A', 'Un eclipse solar, con la Luna en fase nueva.', false),
    ('cie-4-2-b', 'B', 'Un eclipse lunar, con la Luna en fase llena.', true),
    ('cie-4-2-b', 'C', 'Un eclipse lunar, con la Luna en fase nueva.', false),
    ('cie-4-2-b', 'D', 'Un eclipse solar, con la Luna en fase llena.', false),
    ('cie-4-2-c', 'A', 'El viento que sopla con fuerza desde la costa hacia el mar.', false),
    ('cie-4-2-c', 'B', 'La lluvia que aumenta el caudal de los ríos que llegan al mar.', false),
    ('cie-4-2-c', 'C', 'La atracción que ejerce la Luna sobre el agua de los océanos.', true),
    ('cie-4-2-c', 'D', 'La rotación de la Luna sobre su eje cada día.', false),
    ('cie-4-2-d', 'A', 'La mayor cercanía de la Tierra al Sol en algunos meses.', false),
    ('cie-4-2-d', 'B', 'La rotación de la Tierra sobre su eje cada día.', false),
    ('cie-4-2-d', 'C', 'El eje inclinado de la Tierra en su traslación.', true),
    ('cie-4-2-d', 'D', 'La posición de la Luna con respecto a la Tierra.', false),
    ('cie-4-3-a', 'A', 'Son gigantes formados sobre todo por gases.', true),
    ('cie-4-3-a', 'B', 'Son pequeños y tienen una superficie rocosa.', false),
    ('cie-4-3-a', 'C', 'No tienen ningún satélite natural a su alrededor.', false),
    ('cie-4-3-a', 'D', 'Tienen las temperaturas más altas del sistema.', false),
    ('cie-4-3-b', 'A', 'Es una estrella mediana ubicada en un brazo de la Vía Láctea.', true),
    ('cie-4-3-b', 'B', 'Es una estrella gigante ubicada en el centro de la Vía Láctea.', false),
    ('cie-4-3-b', 'C', 'Es un planeta brillante ubicado en el centro del Sistema Solar.', false),
    ('cie-4-3-b', 'D', 'Es la estrella más grande ubicada en una galaxia vecina.', false),
    ('cie-4-3-c', 'A', 'Satélite artificial, estación espacial y sonda espacial.', false),
    ('cie-4-3-c', 'B', 'Sonda espacial, satélite artificial y estación espacial.', false),
    ('cie-4-3-c', 'C', 'Estación espacial, sonda espacial y satélite artificial.', false),
    ('cie-4-3-c', 'D', 'Sonda espacial, estación espacial y satélite artificial.', true)
) as v (codigo, letra, texto, es_correcta)
join public.simulacro_nuevo_items i on i.codigo = v.codigo
join public.simulacros_nuevos s on s.id = i.simulacro_id and s.slug = 'nuevo-ciencias-1'
on conflict (item_id, letra) do update set
  texto       = excluded.texto,
  es_correcta = excluded.es_correcta;

-- Revision final: si algo no calza, la migracion entera se cae y no queda
-- un examen a medias publicado.
do $revision$
declare
  v_items     integer;
  v_malos     integer;
begin
  select count(*) into v_items
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = 'nuevo-ciencias-1';

  select count(*) into v_malos
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = 'nuevo-ciencias-1'
    and (
      (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id) <> 4
      or (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id and o.es_correcta) <> 1
    );

  if v_items <> 60 then
    raise exception 'nuevo-ciencias-1: quedaron % items y se esperaban 60', v_items;
  end if;
  if v_malos > 0 then
    raise exception 'nuevo-ciencias-1: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;

  -- Todo calza: ahora si se publica.
  update public.simulacros_nuevos set estado = 'publicado' where slug = 'nuevo-ciencias-1';
end
$revision$;

commit;

-- ------------------------------------------------------------
-- Verificacion: cuantos items quedaron y si el examen se publico.
select s.slug, s.estado, count(i.id) as items
from public.simulacros_nuevos s
left join public.simulacro_nuevo_items i on i.simulacro_id = s.id
where s.slug = 'nuevo-ciencias-1'
group by s.slug, s.estado;

-- Verificacion: cuantas veces es clave cada letra (deben salir 15 de cada una).
select o.letra, count(*) as veces_clave
from public.simulacro_nuevo_opciones o
join public.simulacro_nuevo_items i on i.id = o.item_id
join public.simulacros_nuevos s on s.id = i.simulacro_id
where s.slug = 'nuevo-ciencias-1' and o.es_correcta
group by o.letra
order by o.letra;
