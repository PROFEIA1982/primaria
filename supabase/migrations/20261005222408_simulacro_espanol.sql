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

-- Simulacro nuevo 1 de espanol: 60 items.
-- Generado desde docs/simulacros-nuevos/espanol.json (version 2026-10-05).
-- Comparado contra el banco de banco-espanol-respaldo-2026-08-31-y-oficiales.json antes de generar.

-- Entra como borrador. Lo publica la revision del final, solo si todo calza.
insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  ('nuevo-espanol-1', 'espanol', 1, 'Simulacro nuevo 1', 180, false, 'borrador')
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
  and s.slug = 'nuevo-espanol-1'
  and i.codigo <> all (array['esp-1-a', 'esp-2-a', 'esp-3-a', 'esp-4-a', 'esp-5-a', 'esp-6-a', 'esp-7-a', 'esp-8-a', 'esp-1-b', 'esp-2-b', 'esp-3-b', 'esp-4-b', 'esp-5-b', 'esp-6-b', 'esp-7-b', 'esp-8-b', 'esp-1-c', 'esp-2-c', 'esp-3-c', 'esp-4-c', 'esp-5-c', 'esp-6-c', 'esp-7-c', 'esp-8-c', 'esp-1-d', 'esp-2-d', 'esp-3-d', 'esp-4-d', 'esp-5-d', 'esp-6-d', 'esp-7-d', 'esp-8-d', 'esp-1-e', 'esp-2-e', 'esp-3-e', 'esp-4-e', 'esp-5-e', 'esp-6-e', 'esp-7-e', 'esp-8-e', 'esp-1-f', 'esp-2-f', 'esp-3-f', 'esp-4-f', 'esp-5-f', 'esp-6-f', 'esp-7-f', 'esp-8-f', 'esp-1-g', 'esp-2-g', 'esp-3-g', 'esp-4-g', 'esp-5-g', 'esp-6-g', 'esp-7-g', 'esp-8-g', 'esp-1-h', 'esp-2-h', 'esp-3-h', 'esp-1-i']);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
    ('esp-1-a', 1, 'Ideas fundamentales', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«La danta es el mamífero terrestre más grande de Costa Rica. Vive en bosques húmedos y en zonas de montaña, cerca de ríos y pantanos. Pasa buena parte de la noche comiendo hojas, ramas tiernas y frutas.

Cuando come frutas, se traga las semillas enteras. Después camina largas distancias y deja esas semillas en su excremento, lejos del árbol de donde salieron. Así, nuevas plantas pueden nacer en otros sitios del bosque.

Por esta razón, a la danta se le llama la jardinera del bosque. Sin ella, a muchos árboles les costaría más extenderse.»

Según el texto anterior, ¿cuál es la idea fundamental?', 'El texto menciona qué come la danta y dónde vive, pero casi todo gira alrededor de las semillas que se traga. Al dejarlas lejos, ayuda a que nazcan árboles nuevos, y por eso la llaman la jardinera del bosque.', false),
    ('esp-2-a', 2, 'Ideas complementarias', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«Las alas de la mariposa morfo son su mejor defensa. Por encima, son de un azul brillante. Ese color no viene de un pigmento, es decir, de una sustancia que pinta. Se produce porque las alas tienen escamas diminutas que reflejan la luz de una forma especial.

La parte de abajo de las alas es café, con manchas redondas parecidas a ojos. Cuando la mariposa se posa y cierra las alas, casi desaparece entre las hojas secas. En vuelo, en cambio, el azul aparece y desaparece con cada aleteo. Esos destellos confunden a las aves que intentan atraparla.

Las orugas de la morfo se alimentan de hojas de plantas de la familia del frijol.»

En el texto anterior, ¿cuál es una idea complementaria?', 'La mayor parte del texto explica cómo las alas protegen a la morfo, y esa es la idea fundamental. Al final aparece un dato que la acompaña: sus orugas comen hojas de plantas de la familia del frijol.', false),
    ('esp-3-a', 3, 'Causas', 'Texto científico', 'intermedio', 'Lea el siguiente texto:

«¿Por qué un machete olvidado en el patio se pone rojizo? Esa capa áspera se llama herrumbre u óxido. Aparece cuando el hierro está en contacto con el agua y con el oxígeno del aire al mismo tiempo.

En los lugares húmedos, el hierro se oxida más rápido. Cerca del mar, la sal que lleva el viento acelera todavía más el proceso. Por eso las rejas de las casas de playa necesitan pintura con frecuencia.

Para evitar la herrumbre, las herramientas se guardan secas y bajo techo. También se les puede poner una capa de aceite o de pintura, que impide que el agua toque el metal.»

Según el texto anterior, ¿cuál es la causa de que se forme la herrumbre en el hierro?', 'El texto dice que la herrumbre aparece cuando el hierro toca el agua y el oxígeno del aire al mismo tiempo. Esa es la causa; el color rojizo es lo que resulta después, y el aceite sirve para evitarla.', false),
    ('esp-4-a', 4, 'Efectos', 'Noticia', 'intermedio', 'Lea el siguiente texto:

«Escuela de Turrialba estrena rampas

La semana pasada, una escuela de Turrialba terminó de construir rampas en sus entradas. También hizo una rampa en el camino hacia la biblioteca. El proyecto nació de una propuesta del gobierno estudiantil, y las familias organizaron ventas de comida para comprar los materiales.

Antes, Valentina, estudiante de quinto grado que usa silla de ruedas, necesitaba que alguien la ayudara a subir cada grada. Ahora llega sin ayuda a su aula y a la biblioteca.

La directora contó que el siguiente paso será instalar pasamanos en los baños.»

Según el texto anterior, ¿cuál es un efecto de la construcción de las rampas?', 'La noticia cuenta que antes Valentina necesitaba ayuda para subir cada grada y que ahora llega sola a su aula. Ese cambio es un efecto de las rampas. Las ventas de comida, en cambio, ocurrieron antes, para poder construirlas.', false),
    ('esp-5-a', 5, 'Temas de textos literarios', 'Fábula', 'intermedio', 'Lea el siguiente texto:

«Un sapo escuchaba cada mañana el canto del yigüirro y se llenaba de envidia. “Yo también quiero cantar así”, pensaba. Pasó días enteros ensayando, pero de su garganta solo salía un croar ronco. Los otros animales del potrero se reían al oírlo.

Una noche empezó a llover. El sapo, sin pensarlo, croó con fuerza junto a sus hermanos, a la orilla del charco. Aquel coro llenó la oscuridad. Desde su ventana, una niña sonrió y dijo: “Ya los sapos están anunciando el invierno”.

Esa noche el sapo comprendió que su voz también tenía un lugar en el mundo. Desde entonces dejó de imitar y cantó a su manera.»

En el texto anterior, ¿cuál es el tema tratado?', 'Al principio el sapo quería cantar como el yigüirro, pero al final descubre que su propia voz también vale. La fábula trata de aceptar y valorar lo que cada uno es; la lluvia solo es el momento en que el sapo lo descubre.', false),
    ('esp-6-a', 6, 'Pensamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Cuando su hermano mayor se fue a estudiar a San José, le dejó a Keilor su vieja bicicleta. Tenía la cadena floja, la pintura gastada y un timbre que no sonaba. Keilor la miró un buen rato y pensó en la bicicleta nueva de su vecino, roja y brillante.

Esa tarde sacó la caja de herramientas de su mamá. Apretó la cadena, limpió el óxido con una lija, arregló el timbre y le puso cinta de colores al manubrio. Al día siguiente, el vecino le propuso cambiarla por un juego de video. Keilor acarició el asiento remendado y respondió que no, sin dudar. Luego salió a pedalear por la calle de lastre, tocando el timbre recién arreglado.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por Keilor?', 'Keilor arregla la bicicleta con sus propias manos y después no la cambia por un juego de video. Además, acaricia el asiento remendado con cariño. Esas pistas muestran que piensa que lo que arregló con esfuerzo tiene mucho valor.', false),
    ('esp-7-a', 7, 'Conflictos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Gabriel encontró un pichón de pecho amarillo en el zacate, debajo del árbol de guayaba. Lo levantó con cuidado y lo llevó a la casa dentro de su gorra.

—¡Me lo quiero quedar! —le dijo a su abuela—. Le voy a hacer una jaula.

La abuela le explicó que los papás del pichón andaban cerca, buscándolo. Si lo dejaba en una rama baja, volverían a alimentarlo.

Gabriel miró al pajarito, que abría el pico hacia la guayaba. Pensó en la jaula que ya imaginaba pintada de azul. Después pensó en los pechos amarillos que cantaban cada tarde en ese árbol. Al rato, subió el pichón a una rama baja y se escondió detrás de la pila a esperar.»

En el texto anterior, ¿cuál conflicto enfrenta Gabriel?', 'Gabriel quiere hacerle una jaula al pichón, pero también piensa en los pájaros que cantan en la guayaba. Ese ir y venir entre quedárselo o devolverlo es su conflicto. Subirlo a la rama es la forma en que lo resuelve.', false),
    ('esp-8-a', 8, 'Comportamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«A inicios de año llegó a quinto grado un compañero nuevo, Fabián. Él es sordo y se comunica en LESCO, la lengua de señas costarricense. Los primeros días, casi nadie del grupo sabía cómo hablarle.

Mariela decidió hacer algo. Cada tarde veía videos con su mamá y practicaba frente al espejo las señas de los saludos, los números y los colores. En el recreo le preguntaba a Fabián cómo se decían otras palabras y las anotaba en una libreta.

Pocas semanas después, Mariela enseñaba al grupo una seña nueva cada mañana. Ahora el juego favorito del recreo es adivinar palabras con las manos.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Mariela?', 'Mariela practica cada tarde frente al espejo, pregunta palabras nuevas y las anota en una libreta. Esas acciones repetidas muestran una conducta perseverante: no se rinde hasta poder comunicarse con Fabián.', false),
    ('esp-1-b', 9, 'Ideas fundamentales', 'Texto de opinión', 'alto', 'Lea el siguiente texto:

«En muchas escuelas, el recreo se ha llenado de celulares y de conversaciones sobre videos. Creo que vale la pena recuperar los juegos de antes: la rayuela, el trompo, las bolinchas y la cuerda.

Estos juegos no necesitan batería ni internet. Se aprenden mirando a otros y se juegan en grupo, así que enseñan a esperar el turno y a ponerse de acuerdo con las reglas. Además, ponen a mover el cuerpo después de varias horas sentados.

Muchos abuelos todavía recuerdan cómo se brinca la cuerda o cómo se enrolla un trompo. El recreo puede volver a ser un rato de juego compartido.»

La idea fundamental del texto anterior expone que', 'Quien escribe da varias razones: los juegos de antes no necesitan batería, se juegan en grupo y ponen a mover el cuerpo. Todas apoyan una misma idea: que esos juegos vuelvan a los recreos.', false),
    ('esp-2-b', 10, 'Ideas complementarias', 'Noticia', 'intermedio', 'Lea el siguiente texto:

«Grupo de marimba escolar gana festival regional

El grupo de marimba de una escuela de Nicoya ganó el primer lugar en un festival regional.

Los ensayos se hacen dos tardes por semana, en el corredor de la escuela. La marimba fue construida hace años por un artesano del barrio, con madera de la zona. Los estudiantes la cuidan como un tesoro y la cubren con una manta después de cada ensayo.

La maestra de música contó que varios integrantes aprendieron las primeras piezas con sus abuelos. Para el próximo año, el grupo quiere grabar sus canciones y compartirlas con otras escuelas.»

Según el texto anterior, una idea complementaria destaca que', 'Lo principal de la noticia es el premio que ganó el grupo de marimba. Un dato que acompaña esa idea es que varios integrantes aprendieron sus primeras piezas con sus abuelos. Los ensayos, según el texto, son dos tardes por semana y no todas.', false),
    ('esp-3-b', 11, 'Causas', 'Artículo de divulgación', 'alto', 'Lea el siguiente texto:

«Las ranas de vidrio viven en los bosques húmedos de Costa Rica, cerca de ríos y quebradas. La piel de su espalda es verde claro, del mismo tono que las hojas. La piel del vientre, en cambio, es tan transparente que deja ver algunos órganos, como el corazón.

Durante el día, estas ranas duermen pegadas a la parte de abajo de una hoja. Así, la luz atraviesa su cuerpo y su sombra casi no se nota. A las aves y a las serpientes les cuesta mucho descubrirlas.

En la noche despiertan para cazar insectos pequeños.»

Según el texto anterior, ¿cuál es la causa de que a las aves les cueste descubrir a las ranas de vidrio?', 'El texto da dos pistas: la espalda tiene el mismo verde de las hojas y el vientre es transparente, así que la luz las atraviesa. Por eso se confunden con la hoja donde duermen y a las aves les cuesta verlas.', false),
    ('esp-4-b', 12, 'Efectos', 'Artículo de divulgación', 'alto', 'Lea el siguiente texto:

«Los colibríes están entre las aves más pequeñas del mundo, y en Costa Rica viven muchas especies. Para mantenerse quietos en el aire, mueven las alas tan rápido que el ojo humano casi no las ve. Ese esfuerzo gasta mucha energía; por eso toman néctar durante todo el día.

Cuando un colibrí mete el pico en una flor, se le pega en la cabeza polen, un polvito que producen las flores. Luego vuela a otra flor de la misma especie y deja allí parte de ese polen. Sin el polen que llega de otra flor, muchas plantas no podrían formar frutos ni semillas.»

Según el texto anterior, ¿cuál es un efecto de que el colibrí visite varias flores de la misma especie?', 'Cuando el colibrí pasa de flor en flor, lleva en su cabeza el polen de una a otra. El texto explica que sin ese polen las plantas no podrían formar frutos ni semillas. Al unir las dos ideas se encuentra el efecto de sus visitas.', false),
    ('esp-5-b', 13, 'Temas de textos literarios', 'Poema', 'alto', 'Lea el siguiente texto:

«Cuando la lluvia toca el techo de zinc,  
la casa entera se pone a cantar.  
Papá enciende el fogón de leña,  
mamá remienda una red junto al portal.  
Mi hermanita cuenta las goteras  
con un tarro, una taza y un comal.  
Afuera el río crece y se enoja  
y el viento sacude el platanal;  
adentro hay café, hay pan casero  
y un cuento viejo que dice el abuelo.  
Que llueva todo lo que quiera:  
aquí nadie tiene frío,  
porque estamos juntos los de siempre.»

En el texto anterior, ¿cuál es el tema tratado?', 'Afuera el río crece y el viento sacude el platanal, pero adentro la familia comparte café, pan y un cuento. Los últimos versos dicen que nadie tiene frío porque están juntos. Por eso el tema es la unión de la familia que protege en los días de lluvia.', false),
    ('esp-6-b', 14, 'Pensamientos de los personajes', 'Poema', 'alto', 'Lea el siguiente texto:

«El abuelo Tobías ya no sale al mar.  
Se sienta en la arena con su sombrero  
y mira la lancha que pintó de azul.  
Hoy la lleva Jeremy, su nieto,  
que aprendió a leer el viento  
mirando las manos del viejo.  
El abuelo sonríe cuando la lancha  
cruza la línea blanca de la ola.  
No grita consejos, no levanta el brazo:  
solo mueve los labios despacito,  
como quien repite una lección  
que su nieto ya se sabe de memoria.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por el abuelo Tobías?', 'El abuelo sonríe cuando la lancha cruza la ola y no grita consejos. Mueve los labios como quien repite una lección que el nieto ya se sabe. Esas pistas muestran que confía en que Jeremy está listo.', false),
    ('esp-7-b', 15, 'Conflictos de los personajes', 'Escena teatral', 'alto', 'Lea el siguiente texto:

«MÓNICA: (Con su cuaderno en la mano) Hoy tenemos que formar los grupos para la feria científica.  
ISAAC: Mónica, vení con nosotros. Vamos a hacer un volcán que echa humo de verdad.  
DANIELA: ¡Mónica! Desde la semana pasada quedamos en estudiar juntas las mariposas.  
ISAAC: Pero con nosotros vas a ganar, ya vas a ver.  
MÓNICA: (Mira a uno y a otra, en silencio) Es que... los dos son mis amigos.  
DANIELA: (Bajando la voz) Yo ya había comprado la cartulina.  
MÓNICA: Denme un ratito, por favor. Necesito pensar qué es lo más justo.»

En el texto anterior, ¿cuál conflicto enfrenta Mónica?', 'Isaac y Daniela quieren a Mónica en su grupo, y ella dice que los dos son sus amigos. Por eso no sabe a quién escoger: ese es su conflicto. Pedir un ratito para pensar es lo que hace frente al problema.', false),
    ('esp-8-b', 16, 'Comportamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Uriel vive en una comunidad cabécar, en las montañas de Chirripó. Para llegar a la escuela, camina más de una hora por un sendero de barro y cruza dos quebradas. Este año, su hermanita Maribel empezó primer grado.

La primera semana, Uriel salió de la casa más temprano que antes. En las partes resbalosas, caminaba delante de Maribel y le mostraba dónde pisar. En las quebradas, le cargaba el bulto y la esperaba en cada piedra. Cuando ella se cansaba, le inventaba adivinanzas sobre los pájaros del camino.

Un viernes, Maribel cruzó la primera quebrada sola. Uriel no dijo nada, pero esa tarde le regaló una pluma de oropéndola que había guardado.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Uriel con su hermana?', 'Uriel sale más temprano, camina adelante en las partes resbalosas, le carga el bulto en las quebradas y la entretiene con adivinanzas. Todas esas acciones muestran que la protege y la cuida mientras ella aprende el camino.', false),
    ('esp-1-c', 17, 'Ideas fundamentales', 'Noticia', 'alto', 'Lea el siguiente texto:

«Estudiantes de Upala siembran plantas medicinales

Los estudiantes de sexto grado de una escuela de Upala sembraron una huerta de plantas medicinales. La idea surgió en la clase de Ciencias, cuando una estudiante llevó una bolsita de hojas que le dio su abuela.

Cada grupo investigó una planta, preguntó en su casa cómo se usaba y preparó un rótulo con su nombre y sus cuidados. Varias abuelas visitaron la escuela para enseñar a cortar las hojas sin dañar la mata.

La maestra recordó que estas plantas no sustituyen la visita al médico. Aun así, los estudiantes han aprendido a cuidar la huerta y a valorar lo que se sabe en sus familias.»

Según el texto anterior, ¿cuál es la idea fundamental?', 'La noticia cuenta varias cosas: la siembra, los rótulos y la visita de las abuelas. La idea que las reúne es que la huerta permitió aprender en la escuela con lo que saben las familias. El texto aclara que estas plantas no reemplazan al médico.', false),
    ('esp-2-c', 18, 'Ideas complementarias', 'Texto científico', 'alto', 'Lea el siguiente texto:

«El arcoíris aparece cuando el sol brilla y, al mismo tiempo, hay gotas de agua en el aire. La luz del sol parece blanca, pero en realidad está formada por varios colores mezclados.

Al entrar en una gota, la luz se dobla y sus colores se separan, porque cada uno se desvía un poco distinto. Luego la luz rebota dentro de la gota y sale hacia nuestros ojos. Así vemos la franja de colores, del rojo al violeta.

Para ver un arcoíris, hay que tener el sol a la espalda y la lluvia al frente. Por eso suelen verse en las tardes de lluvia ligera, cuando el sol ya está bajo.»

En el texto anterior, ¿cuál es una idea complementaria?', 'El texto explica sobre todo cómo se forma el arcoíris: la luz entra en las gotas y sus colores se separan. Que haya que tener el sol a la espalda para verlo es un dato que acompaña esa explicación, por eso es una idea complementaria.', false),
    ('esp-3-c', 19, 'Causas', 'Noticia', 'intermedio', 'Lea el siguiente texto:

«Vecinos de Desamparados recuperan el parque del barrio

Durante varios sábados, vecinos de un barrio de Desamparados trabajaron juntos en el parque de la comunidad. Pintaron las bancas, repararon los columpios y sembraron árboles de sombra.

Hace un año, el parque tenía el zacate alto, los juegos quebrados y poca luz en las noches. Poco a poco, las familias dejaron de llevar a sus hijos. Los niños empezaron a jugar fútbol en la calle, entre los carros. Preocupada, una madre de familia propuso una reunión para buscar soluciones.

Ahora, las tardes vuelven a llenarse de risas y de bolas que ruedan por la cancha.»

Según el texto anterior, ¿cuál es la causa de que las familias dejaran de llevar a sus hijos al parque?', 'Antes de decir que las familias dejaron de ir, la noticia describe el parque: zacate alto, juegos quebrados y poca luz. Ese descuido fue la causa. Que los niños jugaran en la calle fue lo que pasó después.', false),
    ('esp-4-c', 20, 'Efectos', 'Texto científico', 'alto', 'Lea el siguiente texto:

«La columna vertebral es la fila de huesos que va desde el cuello hasta la cadera. Gracias a ella podemos estar de pie, doblarnos y girar. En la niñez, la columna todavía está creciendo.

Cuando una mochila pesa demasiado, el cuerpo se inclina hacia adelante para no irse de espaldas. Si eso pasa todos los días, los músculos de la espalda y de los hombros trabajan de más. Con el tiempo se cansan, y aparecen molestias y dolores.

Para evitarlo, conviene llevar solo los cuadernos del día, usar las dos tiras de la mochila y acomodar lo más pesado cerca de la espalda.»

Según el texto anterior, ¿cuál es un efecto de cargar todos los días una mochila muy pesada?', 'El texto explica una cadena: la mochila pesada hace que el cuerpo se incline, los músculos trabajan de más y, con el tiempo, aparecen molestias. Por eso el efecto es el dolor en la espalda y los hombros.', false),
    ('esp-5-c', 21, 'Temas de textos literarios', 'Leyenda', 'alto', 'Lea el siguiente texto:

«Cuentan los mayores que, hace mucho tiempo, un cerro de la llanura guardaba toda el agua de la región en una laguna escondida. Abajo, los pueblos sufrían largas sequías y sus milpas se secaban.

Una muchacha llamada Nayara subió al cerro a pedir un poco de agua para su gente. El cerro, que era gruñón, le dijo que solo la daría a cambio de algo valioso. Nayara no tenía joyas ni oro. Entonces le cantó las canciones de su pueblo durante tres noches seguidas.

El cerro se conmovió tanto que lloró. De sus lágrimas nacieron los ríos que todavía hoy bajan a la llanura.»

En el texto anterior, ¿cuál es el tema tratado?', 'El cerro pedía algo valioso, y Nayara no tenía joyas ni oro. Lo que ofreció fueron las canciones de su pueblo, y eso conmovió al cerro. La leyenda muestra que hay regalos muy valiosos que no se pueden comprar.', false),
    ('esp-6-c', 22, 'Pensamientos de los personajes', 'Fábula', 'alto', 'Lea el siguiente texto:

«Un pizote encontró un palo de mango cargado de frutas maduras. Al pie del árbol estaba la guatusa, mirando hacia arriba con hambre.

—Amiga —le dijo el pizote con voz dulce—, yo subo y escojo los mejores para los dos. Vos esperá abajo con la canasta.

La guatusa aceptó. Arriba, entre las hojas, el pizote se comía cada mango maduro y dejaba caer en la canasta solo las cáscaras y los verdes. De vez en cuando gritaba: “¡Ahí va otro regalito!”.

Cuando la guatusa revisó la canasta, encontró un montón de cáscaras. El pizote ya bajaba por el otro lado del tronco, con la panza redonda.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por el pizote?', 'El pizote promete escoger los mejores mangos para los dos, pero, escondido entre las hojas, se come los maduros y le tira cáscaras. Esa trampa muestra lo que pensaba: que podía quedarse con lo mejor si la guatusa no lo veía.', false),
    ('esp-7-c', 23, 'Conflictos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«En la casa de Ximena hay una sola tableta, y la usan ella y su hermano Andrey para las tareas. Esa noche, Ximena debía enviar a las ocho una presentación sobre los volcanes. Andrey, que está en sétimo, tenía un examen en línea a la misma hora.

—Yo la pedí primero —dijo Ximena, abrazando la tableta.

Andrey no discutió. Se sentó en la grada con los codos en las rodillas y repasó su cuaderno en voz baja. Ximena lo miró de reojo. Recordó la vez que él se desveló ayudándola a pegar fotos para su álbum de Ciencias.

Respiró hondo y miró el reloj de la cocina: eran las siete y media.»

En el texto anterior, ¿cuál conflicto enfrenta Ximena?', 'Ximena necesita la tableta para su presentación, pero recuerda que Andrey la ayudó una vez y lo ve repasar en la grada. Por eso duda entre usarla o prestársela. El examen en línea es el problema de su hermano.', false),
    ('esp-8-c', 24, 'Comportamientos de los personajes', 'Escena teatral', 'alto', 'Lea el siguiente texto:

«ESTEBAN: (Con la brocha en alto) Yo pinto un sol grande en el centro. Ustedes pinten el zacate abajo.  
KEISHA: Pero quedamos en que cada quien pintaba algo de su comunidad. Yo quería pintar el tren de Limón.  
ESTEBAN: Eso no cabe. El sol tiene que verse desde la calle.  
BRANDON: (En voz baja) Yo traje un dibujo de la lancha de mi tío...  
ESTEBAN: (Sin voltear) Después vemos. Pasame el amarillo.  
KEISHA: (Se cruza de brazos) Así no es un mural de todos, Esteban.  
ESTEBAN: (Sigue pintando) Cuando el sol esté listo, ustedes rellenan lo que falte.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Esteban?', 'Esteban decide qué pinta cada uno, rechaza la idea de Keisha y deja para después el dibujo de Brandon. Aunque Keisha le reclama, sigue pintando su sol. Esas acciones muestran que impone sus ideas sin escuchar al grupo.', false),
    ('esp-1-d', 25, 'Ideas fundamentales', 'Texto científico', 'intermedio', 'Lea el siguiente texto:

«Cuando hacemos ejercicio o cuando hace mucho calor, la temperatura del cuerpo sube. Para que no suba demasiado, la piel produce sudor, un líquido formado sobre todo por agua y un poco de sal.

El sudor sale por poros diminutos de la piel. Al secarse con el aire, se lleva parte del calor del cuerpo y nos refresca. Por eso sentimos alivio cuando sopla una brisa después de correr.

Como al sudar perdemos agua, conviene tomar líquidos durante el día, sobre todo en lugares calientes. El sudor casi no tiene olor; el olor aparece cuando algunas bacterias de la piel lo descomponen.»

¿Cuál es la idea fundamental del texto anterior?', 'El texto explica para qué sirve el sudor: cuando la temperatura del cuerpo sube, el sudor se seca y se lleva parte del calor. Los datos sobre la sal, el agua que perdemos y el olor acompañan esa idea principal.', false),
    ('esp-2-d', 26, 'Ideas complementarias', 'Texto de opinión', 'intermedio', 'Lea el siguiente texto:

«Pienso que en cada casa debería haber un rato para leer en familia, aunque sea quince minutos antes de dormir. No hace falta tener muchos libros: sirven una revista, un periódico o los cuentos que trae de la escuela el hermano menor.

Cuando una persona adulta lee en voz alta, los niños aprenden palabras nuevas casi sin darse cuenta. Además, escuchar historias juntos abre conversaciones que en otro momento no surgirían. En mi casa, un cuento sobre un pescador terminó en una larga plática sobre el pueblo donde creció mi abuela.

Las bibliotecas públicas prestan libros sin costo. Solo hace falta decidirse y apagar la televisión un ratito.»

Según el texto anterior, una idea complementaria destaca que', 'La idea principal es que las familias lean juntas un rato. Para apoyarla, el texto da datos como este: cuando un adulto lee en voz alta, los niños aprenden palabras nuevas. El texto también aclara que no hacen falta muchos libros.', false),
    ('esp-3-d', 27, 'Causas', 'Texto de opinión', 'alto', 'Lea el siguiente texto:

«Muchos patios escolares son de cemento de punta a punta. En los meses de verano, a media mañana, el piso arde bajo los zapatos. La poca sombra que hay junto a las paredes se llena enseguida, y muchos estudiantes prefieren quedarse en el aula durante el recreo.

Creo que cada escuela debería sembrar árboles en su patio. Un árbol grande da sombra fresca, y bajo sus ramas se puede leer, conversar o jugar. Además, atrae pájaros y mariposas que pueden observarse en las clases de Ciencias.

Sembrar un árbol cuesta poco. Esperar a que crezca exige paciencia, pero los estudiantes de los próximos años lo agradecerán.»

Según el texto anterior, ¿cuál es la causa de que muchos estudiantes prefieran quedarse en el aula durante el recreo?', 'El texto dice que el patio es de cemento, que el piso arde en verano y que la poca sombra se llena rápido. Al unir esas pistas se entiende que el calor hace que muchos prefieran quedarse adentro.', false),
    ('esp-4-d', 28, 'Efectos', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«Las iguanas verdes son reptiles que viven en las zonas cálidas del país, cerca de ríos y playas. Muchas personas las ven quietas sobre una rama o una piedra, con el cuerpo extendido al sol, y piensan que son perezosas.

En realidad, las iguanas no producen suficiente calor propio, como sí lo hacen las personas. Por eso, en las mañanas, se asolean para calentar su cuerpo. Cuando ya están calientes, pueden moverse con rapidez y digerir mejor las hojas y flores que comen.

Si sienten peligro, se lanzan al agua desde las ramas. Son excelentes nadadoras y pueden quedarse un buen rato bajo el agua.»

Según el texto anterior, ¿cuál es un efecto de que las iguanas se asoleen en las mañanas?', 'El texto explica que las iguanas se asolean para calentar su cuerpo. Después dice que, ya calientes, pueden moverse con rapidez y digerir mejor sus alimentos. Ese es el efecto de tomar el sol.', false),
    ('esp-5-d', 29, 'Temas de textos literarios', 'Cuento', 'intermedio', 'Lea el siguiente texto:

«Cada domingo, la abuela de Shanice cocina rice and beans en su casa de Limón. Este año, la abuela le dijo que ya era hora de aprender.

Shanice ralló el coco, exprimió la leche con un paño y midió el tomillo con los dedos, como hacía la abuela. Mientras cocinaban, la abuela le contó que esa receta la aprendió de su propia madre, en una cocina de leña frente al mar.

Al mediodía, la familia probó el plato. El tío Wilbert dijo que sabía igualito al de siempre. La abuela le guiñó un ojo a Shanice y le regaló el cucharón de madera que había usado por cuarenta años.»

En el texto anterior, ¿cuál es el tema tratado?', 'La abuela aprendió la receta de su madre y ahora se la enseña a Shanice. Al final le regala el cucharón que usó tantos años, como quien entrega una herencia. El tema es cómo una tradición pasa de una generación a otra.', false),
    ('esp-6-d', 30, 'Pensamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Antes de mudarse a Heredia, Yorleny vivía en una finca de San Carlos. Allí montaba cada tarde a Canela, su yegua. En el apartamento nuevo no había potrero ni árboles, solo un balcón con dos macetas.

El primer fin de semana, Yorleny sacó sus crayolas y dibujó a Canela corriendo por un potrero lleno de flores. Pegó el dibujo en la pared, junto a la cama. Después escribió en su diario: “En diciembre vuelvo a la finca. Mientras tanto, voy a sembrar zacate en una maceta, para que el balcón huela a casa”.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por Yorleny?', 'Yorleny dibuja a Canela, pega el dibujo junto a su cama y quiere sembrar zacate para que el balcón huela a casa. Además sabe que en diciembre volverá. Con esas acciones muestra que quiere mantener cerca el recuerdo de la finca.', false),
    ('esp-7-d', 31, 'Conflictos de los personajes', 'Fábula', 'alto', 'Lea el siguiente texto:

«Un armadillo juntaba todo lo que encontraba en el camino: semillas brillantes, tapitas, plumas y hojas de colores. Lo guardaba en su cueva, que cada semana estaba más llena.

Una tarde se acercó una tormenta. Los animales corrieron a sus refugios, y el armadillo también. Pero al llegar no pudo entrar: su cueva estaba repleta de cosas hasta la entrada. Empujó con el hocico, escarbó con las patas, y nada. Las primeras gotas le golpeaban el caparazón.

Un conejo que pasaba le ofreció su madriguera. Esa noche, mientras escuchaba la lluvia, el armadillo pensó que, de todo lo que guardaba, nada le había servido.»

En el texto anterior, ¿cuál conflicto enfrenta el armadillo?', 'Cuando llega la tormenta, el armadillo no puede entrar a su cueva porque la llenó con todo lo que juntaba. Ese es su conflicto: queda sin refugio por su propia costumbre. Dormir donde el conejo es como termina la historia.', false),
    ('esp-8-d', 32, 'Comportamientos de los personajes', 'Fábula', 'intermedio', 'Lea el siguiente texto:

«En una finca de Zarcero vivía un gallo que se creía el más guapo del corral. Cada mañana, en lugar de cantar al amanecer, corría al charco del patio para mirarse las plumas.

—¡Qué cresta tan roja! ¡Qué cola tan brillante! —se decía, girando de un lado a otro.

Las gallinas le recordaban que su trabajo era despertar a todos. Él ni siquiera volteaba a verlas.

Un día, el dueño de la finca se levantó tarde y no alcanzó a llevar la leche al pueblo. Esa misma tarde compró un despertador. Desde entonces, nadie en la finca espera el canto del gallo, que sigue admirándose solo en el charco.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por el gallo?', 'Cada mañana el gallo prefería mirarse en el charco en vez de cantar, y ni siquiera volteaba a ver a las gallinas. Por eso el dueño se levantó tarde. Su conducta es vanidosa: le importaba más su imagen que su trabajo.', false),
    ('esp-1-e', 33, 'Ideas fundamentales', 'Artículo de divulgación', 'alto', 'Lea el siguiente texto:

«Durante muchos años, la carreta tirada por bueyes fue el medio para llevar el café desde las fincas hasta el puerto de Puntarenas. Los caminos eran de barro, y pocas cosas resistían el viaje como una carreta.

Con el tiempo, los boyeros empezaron a decorar sus carretas. Pintaban las ruedas con estrellas y figuras de colores vivos. Cada familia tenía su propio estilo, y algunos pueblos se hicieron famosos por la habilidad de sus pintores.

Con la llegada del tren y, más tarde, de los camiones, las carretas dejaron de usarse para el trabajo. Sin embargo, siguen presentes en desfiles y celebraciones dedicadas a los boyeros. La carreta pintada se convirtió en un símbolo de la identidad costarricense.»

Según el texto anterior, ¿cuál es la idea fundamental?', 'El primer párrafo presenta la carreta como medio para llevar el café. El segundo cuenta cómo empezaron a pintarla y el último dice que hoy es un símbolo. Ese recorrido muestra la idea fundamental: la carreta pasó del trabajo a ser un símbolo nacional.', false),
    ('esp-2-e', 34, 'Ideas complementarias', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«Las zompopas son hormigas que cortan pedacitos de hojas y los llevan en fila hasta su nido. Muchas personas creen que se comen esas hojas, pero no es así.

Dentro del nido, bajo tierra, las zompopas mastican las hojas y forman con ellas una especie de colchón. Sobre ese colchón crece un hongo, y ese hongo es su verdadero alimento. Podría decirse que las zompopas son agricultoras.

En cada nido hay hormigas de distintos tamaños. Las más grandes cortan y cargan; las más pequeñas cuidan el hongo y limpian el nido. Algunas viajan encima de las hojas para defender a las cargadoras de unas moscas pequeñas.»

En el texto anterior, ¿cuál es una idea complementaria?', 'Lo principal del texto es que las zompopas usan las hojas para cultivar un hongo, que es su alimento. Que las más pequeñas cuiden ese hongo es un dato que completa la explicación. El texto también aclara que no se comen las hojas.', false),
    ('esp-3-e', 35, 'Causas', 'Artículo de divulgación', 'alto', 'Lea el siguiente texto:

«Al amanecer, en muchos bosques de Costa Rica se escucha un rugido ronco que parece de un animal enorme. Es el mono congo, también llamado aullador. Su garganta tiene un hueso hueco que funciona como una caja que agranda el sonido.

Los congos viven en grupos y pasan casi todo el día en las copas de los árboles, comiendo hojas. Las hojas dan poca energía; por eso se mueven despacio y descansan muchas horas.

Con sus aullidos, cada grupo avisa a los grupos vecinos dónde se encuentra. Así, los demás saben qué parte del bosque está ocupada y evitan acercarse. De este modo se ahorran peleas y viajes inútiles.»

Según el texto anterior, ¿cuál es la causa de que los grupos de monos congo se eviten entre sí?', 'El texto dice que con sus aullidos cada grupo avisa dónde se encuentra. Así los demás saben qué parte del bosque está ocupada y no se acercan. Ahorrarse peleas es lo que se consigue después, no la causa.', false),
    ('esp-4-e', 36, 'Efectos', 'Noticia', 'alto', 'Lea el siguiente texto:

«Escuela de Pérez Zeledón crea un banco de semillas

En una escuela de Pérez Zeledón, estudiantes de quinto y sexto crearon un banco de semillas. Son semillas criollas, es decir, las que las familias del lugar han guardado y sembrado durante muchos años.

Los estudiantes visitaron a vecinos agricultores y recogieron semillas de maíz, frijol, ayote y chile dulce. Las secaron al sol y las guardaron en frascos de vidrio con su nombre y el de la familia que las donó.

Este año, varias familias perdieron su cosecha por las lluvias y se quedaron sin semillas. Llegaron a la escuela a pedir algunas, y con ellas volvieron a sembrar sus parcelas.»

Según el texto anterior, ¿cuál es un efecto de la creación del banco de semillas?', 'Las familias que perdieron sus semillas fueron a la escuela a pedir algunas y así pudieron sembrar otra vez. Eso fue posible porque existía el banco de semillas. Perder la cosecha por las lluvias es efecto de otro hecho, no del banco.', false),
    ('esp-5-e', 37, 'Temas de textos literarios', 'Fábula', 'alto', 'Lea el siguiente texto:

«Una noche sin luna, un grillo, un caracol y una luciérnaga querían llegar a la poza del otro lado del monte. Cada uno salió por su cuenta.

El grillo saltaba rápido, pero en la oscuridad chocaba con las piedras. La luciérnaga veía el camino cercano, pero no sabía hacia dónde quedaba la poza. El caracol conocía la ruta de memoria, aunque avanzaba tan despacio que el amanecer lo iba a alcanzar.

Al encontrarse, decidieron viajar juntos. El caracol subió al lomo del grillo y le indicaba hacia dónde ir. La luciérnaga volaba adelante, alumbrando cada piedra. Antes de la medianoche, los tres bebían agua fresca en la poza.»

¿Cuál es el tema tratado en el texto anterior?', 'Cada animal tenía algo que los otros necesitaban: el grillo era rápido, la luciérnaga alumbraba y el caracol conocía el camino. Solos no lo lograban; juntos llegaron antes de la medianoche. El tema es la unión de habilidades diferentes.', false),
    ('esp-6-e', 38, 'Pensamientos de los personajes', 'Poema', 'alto', 'Lea el siguiente texto:

«Celeste mira el agua de la poza  
con los dedos apretados en la orilla.  
Su prima ya flota como una hoja,  
su hermano salta, salpica y grita.  
Ella mete un pie y lo saca,  
mete el otro y cuenta hasta tres.  
—Mañana —dice bajito—, mañana,  
cuando el agua esté menos fría.  
Pero el agua está tibia, lo sabe,  
y la tarde se le está yendo.  
Respira hondo, toma la mano de su tía  
y suelta despacito la orilla.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por Celeste?', 'Celeste duda y busca una excusa: dice que mañana, cuando el agua esté menos fría. Pero ella sabe que el agua está tibia, respira hondo, toma la mano de su tía y suelta la orilla. Esas pistas muestran que piensa que puede vencer su miedo.', false),
    ('esp-7-e', 39, 'Conflictos de los personajes', 'Cuento', 'intermedio', 'Lea el siguiente texto:

«A Natalia le encanta escribir. Por eso se emocionó cuando la escuela abrió inscripciones para el periódico estudiantil. Natalia tiene baja visión: con sus anteojos y una lupa puede leer, pero la letra pequeña se le vuelve una mancha gris.

En la primera reunión, el maestro repartió las hojas con las reglas del periódico. La letra era tan diminuta que Natalia no logró leer ni el título. Mientras los demás comentaban, ella doblaba la hoja en silencio.

Al día siguiente, se armó de valor y le propuso al maestro imprimir el periódico con letra grande. “Así lo podrán leer también los abuelos del barrio”, le dijo. El maestro sonrió y aceptó la idea.»

En el texto anterior, ¿cuál conflicto enfrenta Natalia?', 'Natalia quiere participar en el periódico, pero en la reunión no logra leer las hojas porque la letra es muy pequeña. Ese es su conflicto. Que el periódico se imprima con letra grande es la solución que ella misma propone.', false),
    ('esp-8-e', 40, 'Comportamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Antes de las vacaciones de medio año, la maestra preguntó quién podía regar las matas de tomate del huerto escolar. Nadie levantó la mano. Gerardo vivía a dos cuadras y dijo que él lo haría.

La primera semana fue todos los días. La segunda, se quedó jugando en la casa de un primo y olvidó ir. Cuando volvió, encontró varias matas caídas y con las hojas arrugadas.

Gerardo no le echó la culpa al sol. Ese mismo día llenó la regadera, amarró las matas a unas varas y le pidió a su abuelo un poco de abono. Al regresar a clases, le contó a la maestra lo sucedido antes de que ella preguntara.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Gerardo después de ver las matas dañadas?', 'Después de ver las matas caídas, Gerardo no culpa al sol: las riega, las amarra y busca abono. Además le cuenta a la maestra lo que pasó antes de que ella pregunte. Esas acciones muestran responsabilidad.', false),
    ('esp-1-f', 41, 'Ideas fundamentales', 'Texto científico', 'alto', 'Lea el siguiente texto:

«Los corales parecen piedras de colores, pero son animales. Cada coral está formado por miles de animalitos diminutos que construyen un esqueleto duro a su alrededor. Con el paso de muchísimos años, esos esqueletos forman los arrecifes.

Dentro de los corales viven unas algas microscópicas, es decir, tan pequeñas que solo se ven con microscopio. Las algas les dan alimento y color a los corales. A cambio, los corales les ofrecen un lugar seguro.

Cuando el agua del mar se calienta demasiado, los corales expulsan a las algas. Entonces se ponen blancos y, si el calor dura mucho, pueden morir. Por eso, el aumento de la temperatura del mar pone en riesgo a los arrecifes.»

¿Cuál es la idea fundamental del texto anterior?', 'El texto explica qué son los corales, cómo viven unidos a unas algas y qué les pasa cuando el agua se calienta. Al juntar esas partes, la idea fundamental es que dependen de las algas y que el calor del mar los pone en peligro.', false),
    ('esp-2-f', 42, 'Ideas complementarias', 'Noticia', 'intermedio', 'Lea el siguiente texto:

«Escuela de Liberia aprovecha el agua de lluvia

Una escuela de Liberia instaló un sistema para recoger la lluvia de sus techos. Las canoas del techo llevan el agua hasta dos tanques grandes, ubicados junto al comedor.

El agua recogida se usa para regar la huerta y para limpiar los pasillos. No se utiliza para tomar, porque no pasa por un proceso de limpieza. Los estudiantes de sexto grado revisan cada semana que las canoas estén libres de hojas.

En Guanacaste, los meses secos son largos. Con este sistema, la escuela gasta menos agua del tubo durante el verano, y la huerta se mantiene verde aunque no llueva.»

En el texto anterior, ¿cuál es una idea complementaria?', 'La noticia trata sobre todo del sistema para recoger agua de lluvia. Un dato que acompaña esa idea es que estudiantes de sexto revisan cada semana las canoas. El texto aclara que esa agua no se usa para tomar.', false),
    ('esp-3-f', 43, 'Causas', 'Texto científico', 'alto', 'Lea el siguiente texto:

«Para hacer pan, se mezcla harina, agua, sal y levadura. La levadura está formada por seres vivos diminutos, unos hongos tan pequeños que no se ven a simple vista.

Cuando la masa reposa en un lugar tibio, la levadura se alimenta de los azúcares de la harina. Al hacerlo, produce un gas que forma burbujas dentro de la masa. Como la masa es elástica, atrapa esas burbujas y se va inflando.

Si la masa se deja en un lugar muy frío, la levadura trabaja lentamente y el pan crece poco. Al hornearlo, las burbujas quedan fijas, y así el pan queda lleno de huequitos por dentro.»

Según el texto anterior, ¿cuál es la causa de que el pan tenga huequitos por dentro?', 'La levadura produce un gas que forma burbujas, y la masa elástica las atrapa. Al hornear, esas burbujas quedan fijas. Por eso el pan tiene huequitos: hay que unir varias partes del texto para encontrar la causa.', false),
    ('esp-4-f', 44, 'Efectos', 'Texto científico', 'intermedio', 'Lea el siguiente texto:

«El corazón es un músculo del tamaño de un puño. Su trabajo es bombear la sangre, que lleva oxígeno y alimento a todo el cuerpo.

Cuando corremos, saltamos o bailamos, los músculos de las piernas y los brazos necesitan más oxígeno. Por eso el corazón late más rápido y la respiración se acelera. Si ponemos la mano en el pecho después de jugar, sentimos los latidos con fuerza.

Al igual que otros músculos, el corazón se fortalece con el ejercicio frecuente. Un corazón fuerte bombea más sangre en cada latido, así que no necesita latir tan rápido cuando estamos en reposo.»

Según el texto anterior, un efecto de hacer ejercicio con frecuencia consiste en que', 'El último párrafo dice que el ejercicio frecuente fortalece el corazón y que un corazón fuerte no necesita latir tan rápido en reposo. Que la sangre lleve alimento al cuerpo es el trabajo diario del corazón, no un efecto del ejercicio.', false),
    ('esp-5-f', 45, 'Temas de textos literarios', 'Poema', 'intermedio', 'Lea el siguiente texto:

«Salimos de la escuela, Abril y yo,  
con un solo paraguas para las dos.  
La lluvia de octubre caía de lado  
y el viento nos jalaba el corazón.  
Ella se mojaba el hombro izquierdo,  
yo me mojaba el derecho,  
y nos reíamos de los charcos  
como si fueran espejos.  
Llegamos empapadas a la esquina  
donde cada una dobla su camino.  
Lo que la lluvia no pudo quitarnos  
fue la risa compartida.»

En el texto anterior, ¿cuál es el tema tratado?', 'Las dos amigas comparten un solo paraguas, se mojan cada una un poco y se ríen juntas. El poema termina diciendo que la lluvia no pudo quitarles la risa compartida. El tema es la amistad que se disfruta al compartir.', false),
    ('esp-6-f', 46, 'Pensamientos de los personajes', 'Leyenda', 'intermedio', 'Lea el siguiente texto:

«Cuentan en un pueblo de pescadores del golfo que, hace mucho tiempo, un muchacho llamado Julián encontró en la playa una piedra que cantaba. Su canto se oía cuando la marea subía. Todos querían comprársela, pues decían que traía buena pesca.

Un comerciante le ofreció un saco de monedas. Julián miró la piedra, miró el mar y no contestó.

—La piedra es del mar —murmuró esa noche—, y el mar la está llamando.

Cuando el pueblo dormía, caminó hasta las rocas de la punta y dejó la piedra en una grieta, donde la alcanzaba la ola. Desde entonces, dicen, en las noches de marea alta se oye un canto suave sobre el agua.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por Julián?', 'Julián no acepta el saco de monedas y murmura que la piedra es del mar. Luego la deja donde la alcanza la ola. Su pensamiento es que la piedra pertenece al mar y debía regresar a él.', false),
    ('esp-7-f', 47, 'Conflictos de los personajes', 'Leyenda', 'alto', 'Lea el siguiente texto:

«Dicen los abuelos de las faldas del volcán que, en tiempos antiguos, el río de la comunidad se volvió turbio y amargo. Los animales dejaron de beber en él y las siembras empezaron a secarse.

Una niña llamada Damaris soñó que el agua volvería a ser clara si alguien llevaba al nacimiento del río la primera flor de la mañana. Pero el nacimiento quedaba en lo alto de la montaña, entre neblinas espesas, y nadie del pueblo había subido tan lejos.

Damaris tenía miedo de perderse. Sin embargo, pensó en su abuela, que cada tarde caminaba lejos para traer agua de otro pueblo. Antes del amanecer, le avisó a su abuela, cortó una flor de itabo y empezó a subir.»

En el texto anterior, ¿cuál conflicto enfrenta Damaris?', 'Damaris sabe que alguien debe subir la montaña, pero tiene miedo de perderse entre la neblina. Al pensar en su abuela, que camina lejos para traer agua, decide subir. Su conflicto es enfrentar ese miedo para ayudar a su gente.', false),
    ('esp-8-f', 48, 'Comportamientos de los personajes', 'Escena teatral', 'intermedio', 'Lea el siguiente texto:

«DOÑA OFELIA: (Desde su tramo de verduras) ¿Qué ocupás, mi amor?  
ALONSO: Un kilo de tomates y dos chayotes, por favor. Mi mamá me dio este billete.  
DOÑA OFELIA: (Le entrega la bolsa y unas monedas) Aquí tenés el vuelto. ¡Saludos a tu mamá!  
ALONSO: (Camina unos pasos, cuenta las monedas y se detiene) Doña Ofelia, espere. Usted me dio quinientos colones de más.  
DOÑA OFELIA: (Se acerca y revisa) ¡Ay, es cierto! Con tanta gente, me enredé con las cuentas.  
ALONSO: (Le devuelve la moneda) Tenga, para que no le falte al final del día.  
DOÑA OFELIA: (Le regala una mandarina) ¡Muchas gracias, Alonso! Que te vaya bien.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Alonso?', 'Alonso cuenta el vuelto, se da cuenta de que le dieron quinientos colones de más y regresa a devolverlos. Esa acción muestra honestidad. Quien se enredó con las cuentas fue doña Ofelia, no él.', false),
    ('esp-1-g', 49, 'Ideas fundamentales', 'Noticia', 'intermedio', 'Lea el siguiente texto:

«Una biblioteca sobre ruedas llega a Talamanca

Desde hace unos meses, un camión convertido en biblioteca visita varias comunidades de Talamanca. Lleva libros de cuentos, de ciencias y de historia, además de mesas plegables y sombrillas para leer al aire libre.

La idea nació en un grupo de docentes de la zona, que notaron que muchos estudiantes vivían lejos de una biblioteca. Los niños pueden llevar dos libros a su casa y devolverlos en la siguiente visita.

Las personas mayores de las comunidades también participan. Algunas cuentan historias de su pueblo en bribri y en español, mientras los niños escuchan sentados en la sombra.»

¿Cuál es la idea fundamental del texto anterior?', 'La noticia explica que un camión lleva libros a comunidades de Talamanca donde muchos estudiantes viven lejos de una biblioteca. Esa es la idea fundamental. Que los niños se lleven dos libros o que los mayores cuenten historias son detalles que la acompañan.', false),
    ('esp-2-g', 50, 'Ideas complementarias', 'Texto científico', 'alto', 'Lea el siguiente texto:

«¿Alguna vez ha visto manchas verdes o grises en un pan viejo? Esas manchas son moho, un tipo de hongo. El moho crece a partir de esporas, unas partículas tan pequeñas que flotan en el aire sin que las veamos.

Cuando una espora cae sobre un alimento húmedo y tibio, empieza a crecer. Forma hilos finísimos que se meten dentro del pan, aunque por fuera solo se vea una mancha. Por eso no basta con quitar la parte manchada: es mejor no comer ese pan.

El frío de la refrigeradora hace que el moho crezca más despacio. Por esta razón, el pan guardado en frío dura más días.»

Según el texto anterior, una idea complementaria destaca que', 'Lo principal del texto es qué es el moho y cómo crece en los alimentos húmedos y tibios. Al final se agrega un dato que completa esa idea: el frío de la refrigeradora hace que crezca más despacio.', false),
    ('esp-3-g', 51, 'Causas', 'Noticia', 'alto', 'Lea el siguiente texto:

«Escuela de Coto Brus cambia su horario por las lluvias

A partir de setiembre, una escuela de Coto Brus empezará las clases media hora antes. También terminará a la una y media de la tarde.

En esta zona, durante los meses más lluviosos, los aguaceros suelen empezar después de las dos de la tarde. Muchos estudiantes viven en fincas alejadas y regresan caminando por caminos de lastre que se llenan de barro. Algunos deben cruzar quebradas que crecen con rapidez.

La directora explicó que el horario normal volverá en diciembre, cuando las lluvias disminuyan. Las familias se organizaron para que los más pequeños caminen acompañados.»

Según el texto anterior, ¿cuál es la causa de que la escuela adelante su hora de salida?', 'La noticia dice que los aguaceros empiezan después de las dos y que muchos estudiantes caminan por caminos de barro y cruzan quebradas. Al unir esos datos se entiende que la escuela sale más temprano para que lleguen a casa antes de la lluvia.', false),
    ('esp-4-g', 52, 'Efectos', 'Artículo de divulgación', 'alto', 'Lea el siguiente texto:

«En muchas fiestas de pueblo de Costa Rica aparecen las mascaradas. Son personajes con enormes cabezas de colores que bailan al ritmo de la cimarrona, una pequeña banda de música popular. Hay gigantes, animales y figuras inspiradas en personas del lugar.

Las máscaras se hacen con barro, papel y engrudo, y luego se pintan a mano. Fabricar una puede tomar varias semanas. Muchos artesanos aprendieron el oficio de sus padres o abuelos. Hoy algunos de ellos dan talleres para jóvenes de su comunidad.

Cuando una mascarada sale a la calle, los niños corren detrás de ella entre risas. De esta forma, el arte de las máscaras sigue vivo en los barrios y pueblos.»

Según el texto anterior, ¿cuál es un efecto de que los artesanos den talleres a los jóvenes?', 'El texto cuenta que los artesanos aprendieron de sus familias y que ahora enseñan en talleres a los jóvenes. Así, el oficio pasa a personas nuevas y el arte de las máscaras sigue vivo.', false),
    ('esp-5-g', 53, 'Temas de textos literarios', 'Leyenda', 'alto', 'Lea el siguiente texto:

«Cuentan los viejos de la llanura que, en tiempos lejanos, un jícaro solitario daba sombra al único pozo del camino. Los viajeros descansaban bajo sus ramas y le agradecían con una canción antes de seguir.

Un año llegó una viajera que no quería perder tiempo. Para ver mejor el camino, cortó las ramas más bajas del árbol y siguió su marcha sin decir nada. Esa misma tarde, el pozo se secó.

Durante meses, nadie encontró agua. Hasta que una niña regó el jícaro con lo poco que traía en su cántaro y le cantó como antes. A la mañana siguiente, el pozo amaneció lleno. Desde entonces, dicen, nadie pasa junto a un jícaro sin saludarlo.»

En el texto anterior, ¿cuál es el tema tratado?', 'Cuando una viajera corta las ramas sin agradecer, el pozo se seca; cuando la niña riega el jícaro y le canta, el agua vuelve. Por eso la leyenda trata del respeto y el agradecimiento que se le debe a la naturaleza.', false),
    ('esp-6-g', 54, 'Pensamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«Por primera vez, el tío Ronald dejó que Dylan sostuviera la cuerda mientras pescaban desde el muelle de Golfito. De pronto, algo jaló con fuerza. Dylan enrolló la cuerda con el corazón saltando y sacó un pargo pequeño, plateado y brillante.

—¡Es mío! —gritó—. Lo voy a llevar para que lo vea mi mamá.

El pez abría y cerraba la boca sobre las tablas. Dylan lo miró un rato. Se acordó de que el tío siempre decía que los peces pequeños son los grandes del próximo año. Se agachó, lo tomó con las dos manos mojadas y lo soltó en el agua verde.

El tío Ronald no dijo nada. Solo le revolvió el pelo y le pasó otra carnada.»

Según el texto anterior, ¿cuál es el pensamiento evidenciado por Dylan?', 'Dylan quería llevarle el pez a su mamá, pero recordó que los peces pequeños son los grandes del próximo año. Por eso lo devolvió al agua. Su pensamiento es que era mejor dejarlo crecer que presumirlo.', false),
    ('esp-7-g', 55, 'Conflictos de los personajes', 'Cuento', 'intermedio', 'Lea el siguiente texto:

«Esa tarde, el cielo de Santa Cruz se puso morado. Marisol fue al corral a guardar las cabras antes del aguacero. Contó una por una: faltaba la Pinta, la más pequeña.

Marisol miró hacia el potrero. El viento ya doblaba los árboles y se oían truenos lejanos. Si salía a buscarla, la lluvia podía alcanzarla en medio del campo. Si se quedaba, la cabrita pasaría la noche sola y mojada.

Cerró el portón del corral, se puso la capa amarilla de su papá y tomó una linterna. Antes de salir, le avisó a su hermano mayor por dónde iba a buscar. A los pocos minutos, escuchó un balido detrás de las piñuelas.»

En el texto anterior, ¿cuál conflicto enfrenta Marisol?', 'Falta una cabrita y se acerca un aguacero. Si Marisol sale, la lluvia puede alcanzarla; si se queda, la Pinta pasará la noche sola. Ese dilema entre la tormenta y la cabrita es su conflicto.', false),
    ('esp-8-g', 56, 'Comportamientos de los personajes', 'Cuento', 'alto', 'Lea el siguiente texto:

«En el barrio de Abigail, en Alajuela, nadie hacía papelotes como su abuelo, y ella había aprendido mirándolo. Sabía cortar las varillas de caña, amarrarlas en cruz y pegar el papel de china con engrudo.

Un domingo de diciembre, cuando soplaba el viento, Abigail elevó un papelote rojo y amarillo que subió más alto que todos. Varios niños se acercaron a preguntarle cómo lo había hecho.

Abigail enrolló el hilo, bajó su papelote y se sentó en el zacate con los demás. Sacó de la mochila varillas y papel que había llevado de más. Esa tarde, el cielo del barrio se llenó de papelotes.»

En el texto anterior, ¿cuál es el comportamiento evidenciado por Abigail?', 'Cuando los otros niños le preguntan, Abigail baja su papelote y se sienta con ellos. Además, llevaba varillas y papel de más, como si ya pensara compartir. Esas pistas muestran que es generosa con lo que sabe.', false),
    ('esp-1-h', 57, 'Ideas fundamentales', 'Texto de opinión', 'alto', 'Lea el siguiente texto:

«Cada tarde veo a muchos niños y jóvenes andar en bicicleta por las calles de mi pueblo. Me alegra, porque pedalear es divertido, no contamina y fortalece las piernas. Lo que me preocupa es que muy pocos usan casco.

Algunos dicen que el casco da calor o que se ve feo. Otros piensan que no lo necesitan si solo van a la pulpería. Pero una caída puede ocurrir en cualquier lugar, incluso a pocos metros de la casa. La cabeza es la parte del cuerpo que más debemos proteger.

Un casco cuesta menos que unas tenis de marca. Ponérselo toma apenas unos segundos. Ojalá pronto sea tan normal como amarrarse los zapatos.»

Según el texto anterior, ¿cuál es la idea fundamental?', 'Quien escribe se alegra de que muchos anden en bicicleta, pero le preocupa que pocos usen casco. Todo lo demás, como lo de las caídas cerca de la casa, sirve para convencer al lector. La idea fundamental es que usar casco debería volverse una costumbre.', false),
    ('esp-2-h', 58, 'Ideas complementarias', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«La ceiba es uno de los árboles más altos de los bosques tropicales de Costa Rica. Su tronco es grueso y recto, y en la base tiene raíces anchas que parecen paredes. Estas raíces, llamadas gambas, ayudan a sostener al árbol en suelos húmedos.

En la época seca, la ceiba pierde sus hojas y se llena de flores. De sus frutos sale una fibra blanca, suave como el algodón, que el viento lleva lejos junto con las semillas.

Muchos animales dependen de ella. En sus ramas altas anidan aves, y entre sus raíces se refugian ranas, insectos y pequeños mamíferos.»

En el texto anterior, ¿cuál es una idea complementaria?', 'El texto presenta a la ceiba como un árbol enorme, importante para muchos animales. Un dato que completa esa idea es que la fibra de sus frutos viaja con el viento y lleva las semillas. La ceiba pierde las hojas en la época seca, no en la lluviosa.', false),
    ('esp-3-h', 59, 'Causas', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«La oropéndola de Moctezuma es un ave grande, de plumas color café y cola amarilla. Vive en las zonas bajas y cálidas del país, sobre todo en el Caribe. Es famosa por sus nidos, que cuelgan como bolsas largas de las ramas más altas.

Las hembras tejen esos nidos con fibras de plantas y tardan varios días en terminarlos. Muchas veces construyen decenas de nidos en un mismo árbol, que suele estar separado de los demás. De esta forma, a los monos y a las serpientes se les hace muy difícil llegar hasta los huevos.

El canto del macho es muy curioso: suena como gotas de agua que caen dentro de una botella.»

Según el texto anterior, ¿cuál es la causa de que los huevos de la oropéndola estén fuera del alcance de monos y serpientes?', 'El texto dice que los nidos cuelgan de las ramas más altas y que el árbol suele estar separado de los demás. Por eso a los monos y a las serpientes se les hace difícil llegar hasta los huevos.', false),
    ('esp-1-i', 60, 'Ideas fundamentales', 'Artículo de divulgación', 'intermedio', 'Lea el siguiente texto:

«El yigüirro es el ave nacional de Costa Rica. No llama la atención por sus colores, pues sus plumas son de tonos café y crema. Sin embargo, es muy querido por su canto.

Su canto se escucha con más fuerza al final del verano, cuando empieza su época de reproducción. Esa época coincide con la llegada de las primeras lluvias. Por eso, muchas personas dicen que el yigüirro llama a la lluvia con su canto.

Esta ave se ha acostumbrado a vivir cerca de las personas. Se le ve en patios, parques y potreros, buscando lombrices e insectos en el suelo.»

La idea fundamental del texto anterior expone que', 'El texto aclara que el yigüirro no destaca por sus colores, sino por su canto. Ese canto se oye más cuando empiezan las lluvias, y por eso la gente dice que las llama. Lo de los patios y las plumas son detalles que acompañan la idea.', false)
) as v (codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
where s.slug = 'nuevo-espanol-1'
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
  and s.slug = 'nuevo-espanol-1';

insert into public.simulacro_nuevo_opciones (item_id, letra, texto, es_correcta)
select i.id, v.letra, v.texto, v.es_correcta
from (values
    ('esp-1-a', 'A', 'La danta come hojas, ramas y frutas durante la noche.', false),
    ('esp-1-a', 'B', 'La danta vive en la montaña porque allí hay más frutas.', false),
    ('esp-1-a', 'C', 'La danta ayuda a que nazcan árboles al esparcir semillas.', true),
    ('esp-1-a', 'D', 'Los animales grandes son los que más ayudan a los bosques.', false),
    ('esp-2-a', 'A', 'Sus orugas comen hojas de plantas parientes del frijol.', true),
    ('esp-2-a', 'B', 'Sus alas le ayudan a protegerse de las aves que la cazan.', false),
    ('esp-2-a', 'C', 'El azul de sus alas proviene de una sustancia que las pinta.', false),
    ('esp-2-a', 'D', 'La morfo vive sobre todo en las zonas altas y frías del país.', false),
    ('esp-3-a', 'A', 'La capa de aceite que se unta en el metal.', false),
    ('esp-3-a', 'B', 'El color rojizo y áspero que toma el metal.', false),
    ('esp-3-a', 'C', 'El calor fuerte del sol que cae sobre la herramienta.', false),
    ('esp-3-a', 'D', 'El contacto del hierro con el agua y el aire a la vez.', true),
    ('esp-4-a', 'A', 'Las familias hicieron ventas para comprar materiales.', false),
    ('esp-4-a', 'B', 'Valentina ya no necesita que la ayuden a ir a su aula.', true),
    ('esp-4-a', 'C', 'La escuela instalará pasamanos en los baños más adelante.', false),
    ('esp-4-a', 'D', 'Muchos más estudiantes visitan ahora la biblioteca escolar.', false),
    ('esp-5-a', 'A', 'La lluvia de una noche en el potrero.', false),
    ('esp-5-a', 'B', 'La aceptación de las cualidades propias.', true),
    ('esp-5-a', 'C', 'La envidia que rompe las amistades verdaderas.', false),
    ('esp-5-a', 'D', 'La importancia de todos los animales del campo.', false),
    ('esp-6-a', 'A', 'Hay que apretar la cadena antes de pedalear.', false),
    ('esp-6-a', 'B', 'Los hermanos mayores deben heredar sus cosas.', false),
    ('esp-6-a', 'C', 'El juego de video vale más que su vieja bicicleta.', false),
    ('esp-6-a', 'D', 'Lo que se arregla con el esfuerzo propio vale mucho.', true),
    ('esp-7-a', 'A', 'Subir el pichón a una rama y esperar escondido.', false),
    ('esp-7-a', 'B', 'Dudar entre quedarse con el pichón o devolverlo.', true),
    ('esp-7-a', 'C', 'Cargar al pichón hasta la casa metido en su gorra.', false),
    ('esp-7-a', 'D', 'Convencer a su nieto de devolver el pichón al árbol.', false),
    ('esp-8-a', 'A', 'Distante: evita hablarle a Fabián al inicio.', false),
    ('esp-8-a', 'B', 'Contenta: se siente feliz cuando llega el recreo.', false),
    ('esp-8-a', 'C', 'Perseverante: practica señas para hablar con Fabián.', true),
    ('esp-8-a', 'D', 'Cumplida: practica señas porque es una tarea escolar.', false),
    ('esp-1-b', 'A', 'los abuelos saben cómo se enrolla un trompo.', false),
    ('esp-1-b', 'B', 'los juegos en grupo enseñan a esperar el turno.', false),
    ('esp-1-b', 'C', 'los juegos tradicionales merecen volver al recreo.', true),
    ('esp-1-b', 'D', 'los niños pasan demasiado tiempo frente a las pantallas.', false),
    ('esp-2-b', 'A', 'la escuela compró una marimba nueva para los ensayos.', false),
    ('esp-2-b', 'B', 'los estudiantes practican tres tardes a la semana en el patio.', false),
    ('esp-2-b', 'C', 'el grupo de marimba de la escuela ganó un festival de la región.', false),
    ('esp-2-b', 'D', 'algunos integrantes aprendieron a tocar con ayuda de sus abuelos.', true),
    ('esp-3-b', 'A', 'Su cuerpo verde y transparente se confunde con la hoja.', true),
    ('esp-3-b', 'B', 'Salen de noche a buscar los insectos pequeños que comen.', false),
    ('esp-3-b', 'C', 'Se esconden bajo el agua de las quebradas durante el día.', false),
    ('esp-3-b', 'D', 'Las aves y las serpientes que las buscan pasan sin notarlas.', false),
    ('esp-4-b', 'A', 'Las plantas logran dar frutos con semillas.', true),
    ('esp-4-b', 'B', 'El colibrí necesita néctar para tener energía.', false),
    ('esp-4-b', 'C', 'Sus alas se mueven tan rápido que casi no se ven.', false),
    ('esp-4-b', 'D', 'Las flores cambian de color para atraer a las aves.', false),
    ('esp-5-b', 'A', 'La alegría de jugar en los días de lluvia.', false),
    ('esp-5-b', 'B', 'La vida diaria en las zonas rurales del país.', false),
    ('esp-5-b', 'C', 'Las goteras que aparecen en el techo de la casa.', false),
    ('esp-5-b', 'D', 'La unión familiar que da abrigo en días de lluvia.', true),
    ('esp-6-b', 'A', 'Su nieto ya está listo para llevar la lancha.', true),
    ('esp-6-b', 'B', 'Debe sentarse en la arena a mirar la lancha azul.', false),
    ('esp-6-b', 'C', 'Las personas mayores merecen descansar del trabajo.', false),
    ('esp-6-b', 'D', 'Jeremy necesita escuchar más consejos antes de salir.', false),
    ('esp-7-b', 'A', 'Pedir un rato para pensar qué es lo justo.', false),
    ('esp-7-b', 'B', 'Hacer un volcán que eche humo para la feria.', false),
    ('esp-7-b', 'C', 'Elegir entre dos amigos que la quieren en su grupo.', true),
    ('esp-7-b', 'D', 'Haber comprado la cartulina sin tener una compañera.', false),
    ('esp-8-b', 'A', 'Contento: siente alegría de tener compañía.', false),
    ('esp-8-b', 'B', 'Protector: guía y acompaña a Maribel en el camino.', true),
    ('esp-8-b', 'C', 'Impaciente: apura a su hermana para no llegar tarde.', false),
    ('esp-8-b', 'D', 'Obediente: la acompaña porque sus papás se lo pidieron.', false),
    ('esp-1-c', 'A', 'La huerta unió lo aprendido en clase con el saber familiar.', true),
    ('esp-1-c', 'B', 'Varias abuelas enseñaron a cortar hojas sin dañar las matas.', false),
    ('esp-1-c', 'C', 'Las plantas medicinales reemplazan la consulta con el médico.', false),
    ('esp-1-c', 'D', 'Cada grupo hizo un rótulo con el nombre y los cuidados de su planta.', false),
    ('esp-2-c', 'A', 'Los arcoíris se ven más en los meses de verano.', false),
    ('esp-2-c', 'B', 'El arcoíris nace cuando las gotas separan la luz.', false),
    ('esp-2-c', 'C', 'Quien quiera verlo debe tener el sol a sus espaldas.', true),
    ('esp-2-c', 'D', 'Cada gota de lluvia produce un solo color del arcoíris.', false),
    ('esp-3-c', 'A', 'Los niños jugaban fútbol en plena calle.', false),
    ('esp-3-c', 'B', 'El mal estado en que se encontraba el parque.', true),
    ('esp-3-c', 'C', 'La propuesta de una madre de reunir a los vecinos.', false),
    ('esp-3-c', 'D', 'El cobro de una cuota para usar la cancha del parque.', false),
    ('esp-4-c', 'A', 'Una columna que se detiene y ya no crece más.', false),
    ('esp-4-c', 'B', 'Músculos más fuertes en la espalda y los hombros.', false),
    ('esp-4-c', 'C', 'El peso de llevar cuadernos de todas las materias.', false),
    ('esp-4-c', 'D', 'Dolor de espalda y hombros por el cansancio muscular.', true),
    ('esp-5-c', 'A', 'El viaje de una muchacha hasta la cima.', false),
    ('esp-5-c', 'B', 'La importancia del agua para todos los seres.', false),
    ('esp-5-c', 'C', 'El valor de los regalos que no son materiales.', true),
    ('esp-5-c', 'D', 'El castigo que reciben quienes actúan con egoísmo.', false),
    ('esp-6-c', 'A', 'Debía subir al árbol y tirar los mangos.', false),
    ('esp-6-c', 'B', 'Los amigos deben repartir la comida por igual.', false),
    ('esp-6-c', 'C', 'La guatusa merecía comerse los mangos más dulces.', false),
    ('esp-6-c', 'D', 'Podía quedarse con lo mejor si la guatusa no lo veía.', true),
    ('esp-7-c', 'A', 'Hacer una presentación sobre los volcanes.', false),
    ('esp-7-c', 'B', 'Dudar entre usar la tableta o prestársela a Andrey.', true),
    ('esp-7-c', 'C', 'Mirar el reloj cuando faltaba media hora para enviar.', false),
    ('esp-7-c', 'D', 'Presentar un examen en línea sin contar con la tableta.', false),
    ('esp-8-c', 'A', 'Mandón: impone sus ideas sin oír al grupo.', true),
    ('esp-8-c', 'B', 'Enojado: siente rabia contra sus compañeros.', false),
    ('esp-8-c', 'C', 'Flexible: cambia su plan al escuchar al grupo.', false),
    ('esp-8-c', 'D', 'Tímido: habla en voz baja sobre el dibujo que trajo.', false),
    ('esp-1-d', 'A', 'El sudor contiene sobre todo agua y algo de sal.', false),
    ('esp-1-d', 'B', 'El cuerpo tiene muchas formas de protegerse del calor.', false),
    ('esp-1-d', 'C', 'Al sudar se pierde agua y por eso hay que tomar líquidos.', false),
    ('esp-1-d', 'D', 'El sudor ayuda a enfriar el cuerpo cuando este se calienta.', true),
    ('esp-2-d', 'A', 'se necesitan muchos libros en la casa para leer.', false),
    ('esp-2-d', 'B', 'oír leer a un adulto ayuda a aprender palabras nuevas.', true),
    ('esp-2-d', 'C', 'las familias deberían reservar un tiempo para leer juntas.', false),
    ('esp-2-d', 'D', 'los niños comprenden mejor cuando leen sin ninguna compañía.', false),
    ('esp-3-d', 'A', 'El calor de un patio de cemento casi sin sombra.', true),
    ('esp-3-d', 'B', 'Las lluvias fuertes que caen durante las mañanas.', false),
    ('esp-3-d', 'C', 'El patio se queda casi vacío a la hora del recreo.', false),
    ('esp-3-d', 'D', 'La sombra fresca que dan los árboles grandes del patio.', false),
    ('esp-4-d', 'A', 'Les falta calor propio dentro del cuerpo.', false),
    ('esp-4-d', 'B', 'Se tiran al agua cuando sienten algún peligro.', false),
    ('esp-4-d', 'C', 'Pueden moverse rápido y digerir mejor lo que comen.', true),
    ('esp-4-d', 'D', 'Pasan todo el resto del día sin necesitar comer nada.', false),
    ('esp-5-d', 'A', 'La herencia de una tradición familiar.', true),
    ('esp-5-d', 'B', 'El regalo de un cucharón viejo de madera.', false),
    ('esp-5-d', 'C', 'La alegría de cocinar con productos frescos.', false),
    ('esp-5-d', 'D', 'La gran variedad de comidas que hay en el país.', false),
    ('esp-6-d', 'A', 'Debe pegar el dibujo de Canela junto a la cama.', false),
    ('esp-6-d', 'B', 'Puede conservar el recuerdo de la finca mientras vuelve.', true),
    ('esp-6-d', 'C', 'Ya olvidó la finca y prefiere su nueva vida en la ciudad.', false),
    ('esp-6-d', 'D', 'Los caballos necesitan potreros amplios donde poder correr.', false),
    ('esp-7-d', 'A', 'Pasar la noche en la madriguera del conejo.', false),
    ('esp-7-d', 'B', 'Juntar semillas, plumas y tapitas del camino.', false),
    ('esp-7-d', 'C', 'Compartir la madriguera con un animal empapado.', false),
    ('esp-7-d', 'D', 'Quedarse sin refugio por llenar su cueva de cosas.', true),
    ('esp-8-d', 'A', 'Alegre: se siente feliz al ver sus plumas.', false),
    ('esp-8-d', 'B', 'Responsable: despierta a todos al amanecer.', false),
    ('esp-8-d', 'C', 'Vanidoso: cuida su imagen y olvida su trabajo.', true),
    ('esp-8-d', 'D', 'Insistente: les recuerda a otros cuál es su trabajo.', false),
    ('esp-1-e', 'A', 'Las ruedas se decoraban con estrellas y dibujos coloridos.', false),
    ('esp-1-e', 'B', 'La carreta pasó de ser medio de trabajo a símbolo del país.', true),
    ('esp-1-e', 'C', 'Las carretas todavía llevan el café de las fincas a los puertos.', false),
    ('esp-1-e', 'D', 'Las carretas resistían los caminos de barro mejor que otros medios.', false),
    ('esp-2-e', 'A', 'Las zompopas dañan los cultivos de las fincas.', false),
    ('esp-2-e', 'B', 'Las zompopas se alimentan de las hojas que cortan.', false),
    ('esp-2-e', 'C', 'Las zompopas usan las hojas para cultivar su comida.', false),
    ('esp-2-e', 'D', 'Las zompopas más pequeñas se encargan de cuidar el hongo.', true),
    ('esp-3-e', 'A', 'Las hojas les proporcionan muy poca energía.', false),
    ('esp-3-e', 'B', 'Se ahorran peleas y recorridos que no sirven.', false),
    ('esp-3-e', 'C', 'Cada grupo anuncia con aullidos el lugar donde está.', true),
    ('esp-3-e', 'D', 'Los grupos compiten por los árboles que tienen más frutas.', false),
    ('esp-4-e', 'A', 'Algunas familias pudieron sembrar de nuevo sus parcelas.', true),
    ('esp-4-e', 'B', 'Los estudiantes visitaron a varios agricultores de la zona.', false),
    ('esp-4-e', 'C', 'Varias familias perdieron su cosecha a causa de las lluvias.', false),
    ('esp-4-e', 'D', 'La comunidad dejó de comprar semillas en las tiendas del lugar.', false),
    ('esp-5-e', 'A', 'Un viaje nocturno hacia una poza del monte.', false),
    ('esp-5-e', 'B', 'La vida de los animales pequeños del bosque.', false),
    ('esp-5-e', 'C', 'La rapidez como la cualidad más útil para triunfar.', false),
    ('esp-5-e', 'D', 'La unión de habilidades distintas para lograr una meta.', true),
    ('esp-6-e', 'A', 'Puede vencer su temor aunque le cueste.', true),
    ('esp-6-e', 'B', 'Los niños deberían aprender a nadar pronto.', false),
    ('esp-6-e', 'C', 'El agua de la poza está muy fría para nadar.', false),
    ('esp-6-e', 'D', 'Debe meter un pie en el agua y contar hasta tres.', false),
    ('esp-7-e', 'A', 'Tener dificultad para leer la letra pequeña.', true),
    ('esp-7-e', 'B', 'Explicar al grupo las reglas del periódico escolar.', false),
    ('esp-7-e', 'C', 'Lograr que el periódico se imprima con letra grande.', false),
    ('esp-7-e', 'D', 'Inscribirse en el periódico estudiantil de la escuela.', false),
    ('esp-8-e', 'A', 'Preocupado: siente angustia por las matas.', false),
    ('esp-8-e', 'B', 'Responsable: reconoce su descuido y repara el daño.', true),
    ('esp-8-e', 'C', 'Evasivo: le oculta a la maestra lo que había pasado.', false),
    ('esp-8-e', 'D', 'Distraído: olvida regar las matas por quedarse jugando.', false),
    ('esp-1-f', 'A', 'Las algas microscópicas son las que dan su color a los corales.', false),
    ('esp-1-f', 'B', 'Con los años, los esqueletos de los corales forman los arrecifes.', false),
    ('esp-1-f', 'C', 'Los corales dependen de unas algas y el calor del mar los amenaza.', true),
    ('esp-1-f', 'D', 'El calentamiento del mar es el mayor peligro para los animales marinos.', false),
    ('esp-2-f', 'A', 'La escuela recoge agua de lluvia para varios usos.', false),
    ('esp-2-f', 'B', 'Estudiantes de sexto revisan cada semana las canoas del techo.', true),
    ('esp-2-f', 'C', 'Las familias construyeron los tanques durante un fin de semana.', false),
    ('esp-2-f', 'D', 'El agua de los tanques se usa para que los estudiantes la beban.', false),
    ('esp-3-f', 'A', 'La masa aumenta de tamaño mientras está en reposo.', false),
    ('esp-3-f', 'B', 'El frío hace que la levadura trabaje más lentamente.', false),
    ('esp-3-f', 'C', 'El horno seca toda el agua que había dentro de la masa.', false),
    ('esp-3-f', 'D', 'El gas de la levadura forma burbujas que la masa atrapa.', true),
    ('esp-4-f', 'A', 'la sangre lleva alimento a todo el cuerpo.', false),
    ('esp-4-f', 'B', 'los músculos usan menos oxígeno cuando corremos.', false),
    ('esp-4-f', 'C', 'el corazón se fortalece y late más lento en reposo.', true),
    ('esp-4-f', 'D', 'el corazón ya no se acelera aunque corramos o saltemos.', false),
    ('esp-5-f', 'A', 'La amistad que crece al compartir.', true),
    ('esp-5-f', 'B', 'El clima lluvioso de todo nuestro país.', false),
    ('esp-5-f', 'C', 'La valentía para enfrentar el mal tiempo.', false),
    ('esp-5-f', 'D', 'El regreso a casa bajo la lluvia de octubre.', false),
    ('esp-6-f', 'A', 'Debía caminar de noche hasta la punta.', false),
    ('esp-6-f', 'B', 'Le convenía vender la piedra al comerciante.', false),
    ('esp-6-f', 'C', 'Las leyendas de los pueblos merecen contarse.', false),
    ('esp-6-f', 'D', 'La piedra pertenecía al mar y debía volver a él.', true),
    ('esp-7-f', 'A', 'Cortar la primera flor de itabo de la mañana.', false),
    ('esp-7-f', 'B', 'Vencer su miedo de perderse para ayudar a su pueblo.', true),
    ('esp-7-f', 'C', 'Caminar largas distancias para traer agua hasta la casa.', false),
    ('esp-7-f', 'D', 'Emprender el camino de subida hacia el nacimiento del río.', false),
    ('esp-8-f', 'A', 'Asustado: teme que la señora lo regañe.', false),
    ('esp-8-f', 'B', 'Aprovechado: se queda con lo que le sobra.', false),
    ('esp-8-f', 'C', 'Honesto: devuelve el dinero que recibió de más.', true),
    ('esp-8-f', 'D', 'Generoso: le regala una mandarina a doña Ofelia.', false),
    ('esp-1-g', 'A', 'Personas mayores cuentan historias en bribri y español.', false),
    ('esp-1-g', 'B', 'Cada niño puede llevarse dos libros a su casa por visita.', false),
    ('esp-1-g', 'C', 'Las comunidades construyeron una biblioteca en su escuela.', false),
    ('esp-1-g', 'D', 'Una biblioteca móvil acerca los libros a comunidades alejadas.', true),
    ('esp-2-g', 'A', 'el frío retrasa el crecimiento del moho.', true),
    ('esp-2-g', 'B', 'los hilos del moho quedan en la parte de afuera.', false),
    ('esp-2-g', 'C', 'el moho se elimina al calentar el pan en el horno.', false),
    ('esp-2-g', 'D', 'el moho es un hongo que crece en alimentos húmedos.', false),
    ('esp-3-g', 'A', 'Las lluvias disminuyen cuando llega diciembre.', false),
    ('esp-3-g', 'B', 'La escuela quiere ahorrar electricidad en la tarde.', false),
    ('esp-3-g', 'C', 'Los aguaceros de la tarde complican el regreso a casa.', true),
    ('esp-3-g', 'D', 'Las familias se organizaron para acompañar a los pequeños.', false),
    ('esp-4-g', 'A', 'Los artesanos aprendieron de sus padres y abuelos.', false),
    ('esp-4-g', 'B', 'El oficio de hacer máscaras llega a nuevas generaciones.', true),
    ('esp-4-g', 'C', 'Cada comunidad del país fabrica hoy sus propias máscaras.', false),
    ('esp-4-g', 'D', 'Los niños corren detrás de las figuras por la calle entre risas.', false),
    ('esp-5-g', 'A', 'El corte de las ramas bajas de un árbol.', false),
    ('esp-5-g', 'B', 'Las costumbres de los pueblos de la llanura.', false),
    ('esp-5-g', 'C', 'El respeto y la gratitud hacia la naturaleza.', true),
    ('esp-5-g', 'D', 'La valentía de una niña durante una larga sequía.', false),
    ('esp-6-g', 'A', 'Su mamá debía ver el pez para creerle.', false),
    ('esp-6-g', 'B', 'Pescar en el muelle es un buen pasatiempo.', false),
    ('esp-6-g', 'C', 'Tenía que soltar el pez usando ambas manos.', false),
    ('esp-6-g', 'D', 'Dejar crecer al pez valía más que presumirlo.', true),
    ('esp-7-g', 'A', 'Oír balar a la Pinta detrás de las piñuelas.', false),
    ('esp-7-g', 'B', 'Decidir si busca a la cabrita o se resguarda.', true),
    ('esp-7-g', 'C', 'Pasar la noche sola y mojada lejos del corral.', false),
    ('esp-7-g', 'D', 'Contar todas las cabras una por una dentro del corral.', false),
    ('esp-8-g', 'A', 'Generosa: enseña a otros lo que aprendió.', true),
    ('esp-8-g', 'B', 'Orgullosa: se siente feliz por su papelote.', false),
    ('esp-8-g', 'C', 'Presumida: muestra que su papelote es el mejor.', false),
    ('esp-8-g', 'D', 'Concentrada: amarra las varillas con mucho cuidado.', false),
    ('esp-1-h', 'A', 'Pedalear es divertido y ayuda a fortalecer las piernas.', false),
    ('esp-1-h', 'B', 'Usar casco al andar en bicicleta debería ser una costumbre.', true),
    ('esp-1-h', 'C', 'Una caída puede pasar en cualquier lugar, aun cerca de la casa.', false),
    ('esp-1-h', 'D', 'La bicicleta es el medio de transporte más seguro para los niños.', false),
    ('esp-2-h', 'A', 'La ceiba se queda sin hojas en la época lluviosa.', false),
    ('esp-2-h', 'B', 'La madera de la ceiba se usa para construir casas.', false),
    ('esp-2-h', 'C', 'La fibra de sus frutos viaja con el viento llevando semillas.', true),
    ('esp-2-h', 'D', 'La ceiba es un árbol enorme del que dependen muchos seres vivos.', false),
    ('esp-3-h', 'A', 'Los nidos cuelgan altos en árboles aislados.', true),
    ('esp-3-h', 'B', 'Los huevos quedan protegidos de sus enemigos.', false),
    ('esp-3-h', 'C', 'Los machos vigilan el árbol con cantos de alerta.', false),
    ('esp-3-h', 'D', 'Las hembras tejen los nidos con fibras de plantas.', false),
    ('esp-1-i', 'A', 'las plumas del yigüirro tienen colores café y crema.', false),
    ('esp-1-i', 'B', 'el yigüirro fue escogido ave nacional por sus colores.', false),
    ('esp-1-i', 'C', 'esta ave vive cerca de las personas, en patios y parques.', false),
    ('esp-1-i', 'D', 'el yigüirro es querido por su canto, asociado a la lluvia.', true)
) as v (codigo, letra, texto, es_correcta)
join public.simulacro_nuevo_items i on i.codigo = v.codigo
join public.simulacros_nuevos s on s.id = i.simulacro_id and s.slug = 'nuevo-espanol-1'
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
  where s.slug = 'nuevo-espanol-1';

  select count(*) into v_malos
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = 'nuevo-espanol-1'
    and (
      (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id) <> 4
      or (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id and o.es_correcta) <> 1
    );

  if v_items <> 60 then
    raise exception 'nuevo-espanol-1: quedaron % items y se esperaban 60', v_items;
  end if;
  if v_malos > 0 then
    raise exception 'nuevo-espanol-1: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;

  -- Todo calza: ahora si se publica.
  update public.simulacros_nuevos set estado = 'publicado' where slug = 'nuevo-espanol-1';
end
$revision$;

commit;
