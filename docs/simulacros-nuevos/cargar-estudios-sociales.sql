-- ============================================================
-- Carga del Simulacro nuevo 1 de estudios-sociales (60 items) para /simulacros-nuevos.
--
-- QUE HACE
--   Crea o actualiza el examen "nuevo-estudios-sociales-1" con sus 60 preguntas y
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
-- Es una copia de supabase/migrations/20261005215925_simulacro_estudios_sociales.sql.
-- Se genera con: pnpm generar:simulacros-nuevos estudios-sociales --copia ...
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

-- Simulacro nuevo 1 de estudios-sociales: 60 items.
-- Generado desde docs/simulacros-nuevos/estudios-sociales.json (version 2026-10-05).
-- Comparado contra el banco de banco-estudios-sociales-respaldo-2026-08-31-y-oficiales.json antes de generar.

-- Entra como borrador. Lo publica la revision del final, solo si todo calza.
insert into public.simulacros_nuevos
  (slug, materia_slug, numero, titulo, segundos_por_item, barajar_opciones, estado)
values
  ('nuevo-estudios-sociales-1', 'estudios-sociales', 1, 'Simulacro nuevo 1', 180, false, 'borrador')
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
  and s.slug = 'nuevo-estudios-sociales-1'
  and i.codigo <> all (array['soc-1-1-a', 'soc-1-1-b', 'soc-1-2-a', 'soc-1-2-b', 'soc-1-2-c', 'soc-1-3-a', 'soc-1-3-b', 'soc-1-3-c', 'soc-1-4-a', 'soc-1-4-b', 'soc-1-4-c', 'soc-1-5-a', 'soc-1-5-b', 'soc-1-5-c', 'soc-1-6-a', 'soc-1-6-b', 'soc-1-6-c', 'soc-1-7-a', 'soc-1-7-b', 'soc-1-7-c', 'soc-2-1-a', 'soc-2-2-a', 'soc-2-2-b', 'soc-2-3-a', 'soc-2-3-b', 'soc-2-4-a', 'soc-2-4-b', 'soc-2-5-a', 'soc-2-5-b', 'soc-2-6-a', 'soc-2-6-b', 'soc-2-7-a', 'soc-2-8-a', 'soc-2-8-b', 'soc-2-9-a', 'soc-2-9-b', 'soc-2-10-a', 'soc-2-10-b', 'soc-2-11-a', 'soc-2-12-a', 'soc-2-12-b', 'soc-2-13-a', 'soc-2-14-a', 'soc-2-14-b', 'soc-2-15-a', 'soc-2-15-b', 'soc-2-16-a', 'soc-2-16-b', 'soc-2-17-a', 'soc-2-17-b', 'soc-2-18-a', 'soc-2-18-b', 'soc-2-19-a', 'soc-2-19-b', 'soc-2-20-a', 'soc-2-20-b', 'soc-2-21-a', 'soc-2-21-b', 'soc-2-22-a', 'soc-2-22-b']);

insert into public.simulacro_nuevo_items
  (simulacro_id, codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
select s.id, v.codigo, v.orden, v.tema, v.subtema, v.nivel, v.enunciado, v.explicacion, v.tiene_latex
from public.simulacros_nuevos s
cross join (values
    ('soc-1-1-a', 1, 'Estudios Sociales y geografía', 'Definición e importancia de los Estudios Sociales y la Educación Cívica', 'intermedio', 'Lea el siguiente texto:

En la escuela de Santa Cruz, el grupo de sexto investigó por qué el parque del barrio se llenaba de basura los domingos. Entrevistaron a vecinos, revisaron fotos viejas del lugar y leyeron las reglas municipales sobre el uso de los espacios públicos. Con lo aprendido, le propusieron a la asociación de desarrollo colocar basureros y organizar turnos de limpieza entre las familias.

Según el texto anterior, ¿qué muestra esa experiencia sobre la importancia de los Estudios Sociales y la Educación Cívica para la convivencia?', 'El grupo estudió el problema desde varias miradas y después propuso una solución para acordarla con la comunidad. Eso es lo que aportan los Estudios Sociales y la Educación Cívica: entender lo que pasa y convivir mejor buscando acuerdos.', false),
    ('soc-1-1-b', 2, 'Estudios Sociales y geografía', 'Definición e importancia de los Estudios Sociales y la Educación Cívica', 'alto', 'Considere la siguiente información:

Antes de las elecciones del gobierno estudiantil, Daniela leyó en un chat que uno de los partidos iba a eliminar el recreo largo. Le preguntó al Tribunal Electoral Estudiantil y leyó el plan de trabajo del partido: la noticia era falsa. Luego lo explicó con respeto en el mismo chat.

A partir de la información anterior, ¿qué actitud ciudadana, de las que promueve la Educación Cívica, mostró Daniela?', 'Daniela no se quedó con lo primero que leyó: buscó la fuente, comprobó y después aclaró con respeto. Esa es una acción ciudadana crítica y responsable, justo lo que busca la Educación Cívica.', false),
    ('soc-1-2-a', 3, 'Estudios Sociales y geografía', 'Posición geográfica de Costa Rica', 'intermedio', 'Lea la siguiente información:

Una estudiante de Japón le escribió a Mateo, que vive en Liberia, para preguntarle dónde queda Costa Rica. Mateo le contestó con tres pistas: el país está al norte de la línea del ecuador, está al oeste del meridiano de Greenwich y forma parte del istmo que une a América del Norte con América del Sur.

De acuerdo con las pistas de Mateo, ¿cuál es la ubicación de Costa Rica?', 'Al norte del ecuador está el hemisferio norte, y al oeste del meridiano de Greenwich, el occidental. El istmo que une las dos Américas es América Central, y ahí está Costa Rica.', false),
    ('soc-1-2-b', 4, 'Estudios Sociales y geografía', 'Posición geográfica de Costa Rica', 'intermedio', 'Lea el siguiente texto:

Costa Rica tiene costas en el mar Caribe y en el océano Pacífico, y forma parte de un istmo angosto entre dos grandes masas continentales. Por eso, plantas y animales del norte y del sur se encontraron en su territorio. Pero esa misma posición la deja en la ruta de algunas tormentas tropicales y sobre placas de la corteza terrestre que se mueven.

Según el texto anterior, ¿cuál opción presenta una ventaja y una desventaja de la posición geográfica de Costa Rica?', 'Que se encuentren especies del norte y del sur es una ventaja: por eso el país tiene tanta biodiversidad. Estar sobre placas que se mueven es una desventaja, porque trae sismos.', false),
    ('soc-1-2-c', 5, 'Estudios Sociales y geografía', 'Posición geográfica de Costa Rica', 'alto', 'Lea el siguiente texto:

Cuando un huracán afecta a un país de Centroamérica, los gobiernos vecinos suelen coordinar el envío de ayuda por carretera, porque las fronteras están cerca y comparten rutas. Los países del istmo también se reúnen en el Sistema de la Integración Centroamericana para tomar acuerdos sobre comercio, salud y protección ante desastres.

De acuerdo con el texto anterior, ¿cómo favorece la posición geográfica de Costa Rica sus relaciones con la región?', 'Los países del istmo están cerca y comparten fronteras y rutas, y eso les permite ayudarse y tomar acuerdos. Cada país mantiene su propio gobierno: lo que comparten es la cooperación.', false),
    ('soc-1-3-a', 6, 'Estudios Sociales y geografía', 'Formas de relieve', 'intermedio', 'Lea el siguiente texto:

Durante una gira al volcán Irazú, Keylor observó desde lo alto una larga cadena de montañas y volcanes, unidos unos con otros, que se extendía por muchos kilómetros. El guía explicó que esa formación separa las aguas que corren hacia el mar Caribe de las que bajan hacia el océano Pacífico.

La forma de relieve que observó Keylor se conoce como', 'Una cadena larga de montañas y volcanes unidos es una cordillera. La del Irazú es la Cordillera Volcánica Central, que reparte las aguas entre las dos vertientes del país.', false),
    ('soc-1-3-b', 7, 'Estudios Sociales y geografía', 'Formas de relieve', 'alto', 'Considere la siguiente información:

En una clase de Estudios Sociales, el grupo de Randall comparó las dos costas del país con ayuda de un mapa físico y anotó lo que observó en esta tabla:

| Característica | Costa 1 | Costa 2 |
| --- | --- | --- |
| Forma del litoral | Muy recortada, con golfos y penínsulas | Casi recta, con pocas entradas del mar |
| Extensión | Más larga | Más corta |

De acuerdo con la información anterior, ¿cuál opción distingue correctamente las dos costas de Costa Rica?', 'La costa del Pacífico es larga y muy recortada, con golfos como el de Nicoya y penínsulas como la de Osa. La del Caribe es más corta y casi recta.', false),
    ('soc-1-3-c', 8, 'Estudios Sociales y geografía', 'Formas de relieve', 'alto', 'Lea el siguiente texto:

En el Valle Central, rodeado de montañas, buena parte de los suelos se formó con ceniza de antiguas erupciones y el clima es templado. Desde hace mucho tiempo ahí se concentran ciudades, carreteras y cafetales. En cambio, en las partes altas de la cordillera de Talamanca, con pendientes fuertes y mucho frío, hay pocos poblados.

A partir del texto anterior, ¿qué se puede inferir sobre la relación entre el relieve y las actividades humanas?', 'En el Valle Central el terreno, el suelo y el clima ayudan a vivir y a sembrar, por eso ahí hay tantas ciudades y cafetales. En las partes altas y empinadas de Talamanca es más difícil, y hay menos poblados.', false),
    ('soc-1-4-a', 9, 'Estudios Sociales y geografía', 'Concepto de región y regionalización', 'intermedio', 'Lea el siguiente texto:

Para un trabajo de clase, Ana Lucía pintó en un mapa de Costa Rica un área que incluye cantones de distintas provincias. Explicó que los escogió porque comparten características: clima cálido y húmedo, llanuras extensas, ríos caudalosos y fincas dedicadas a cultivos como la piña y la yuca.

La información anterior hace referencia al concepto de', 'Una región es un espacio que se delimita porque sus partes comparten características, aunque sean de provincias distintas. Provincias, cantones y distritos son divisiones administrativas con límites fijos.', false),
    ('soc-1-4-b', 10, 'Estudios Sociales y geografía', 'Concepto de región y regionalización', 'alto', 'Lea la siguiente información:

Dos estudiantes discuten en clase. Camila asegura que una región siempre tiene los mismos límites que una provincia. Esteban dice que una región solo se puede delimitar según el clima de la zona, sin tomar en cuenta el relieve ni las actividades de la gente.

De acuerdo con la información anterior, ¿cuál afirmación sobre el concepto de región es correcta?', 'Una región se delimita con las características que se escojan: el clima, el relieve o las actividades económicas, entre otras. Por eso no tiene que coincidir con una provincia ni depender solo del clima.', false),
    ('soc-1-4-c', 11, 'Estudios Sociales y geografía', 'Concepto de región y regionalización', 'alto', 'Lea el siguiente texto:

Costa Rica se organiza en seis regiones socioeconómicas, como la Chorotega, la Brunca y la Huetar Norte, para planificar su desarrollo. Suponga que en una de ellas se detecta que muchos jóvenes deben viajar lejos para estudiar una carrera técnica, y que por eso se abren nuevas opciones de formación técnica dentro de esa misma región.

A partir del texto anterior, ¿cómo favorece la regionalización el desarrollo del país?', 'Al dividir el país en regiones, se puede estudiar qué necesita cada una y tomar decisiones a su medida, como abrir estudios técnicos donde hacen falta. Las regiones no hacen leyes: sirven para planificar.', false),
    ('soc-1-5-a', 12, 'Derechos y ambiente', 'Instituciones que promueven los derechos de las personas estudiantes', 'intermedio', 'Lea la siguiente información:

La maestra de Sebastián notó que él llegaba triste, con miedo de volver a su casa, y que sus derechos podían estar en peligro. Siguiendo el protocolo de la escuela, la directora informó de inmediato a la institución encargada de proteger a las personas menores de edad cuando sus derechos están en riesgo.

¿A cuál institución se refiere la información anterior?', 'El PANI es la institución que protege a niñas, niños y adolescentes cuando sus derechos están en riesgo, y la escuela tiene el deber de avisarle. La Defensoría vigila a las instituciones públicas y el IMAS da ayudas económicas.', false),
    ('soc-1-5-b', 13, 'Derechos y ambiente', 'Instituciones que promueven los derechos de las personas estudiantes', 'intermedio', 'Lea el siguiente texto:

Joselyn tiene doce años. Desde hace dos meses no va a la escuela, porque sus papás le pidieron que cuidara a sus hermanos pequeños mientras ellos trabajan todo el día en una finca. Ella dice que le gustaría volver a clases y que extraña a sus compañeros.

Según el texto anterior, ¿cuál derecho de Joselyn se está vulnerando?', 'Joselyn dejó de ir a la escuela, así que se le está quitando su derecho a estudiar. A su edad, lo que le corresponde es aprender y estar protegida, no cargar con el trabajo de cuidar a otros todo el día.', false),
    ('soc-1-5-c', 14, 'Derechos y ambiente', 'Instituciones que promueven los derechos de las personas estudiantes', 'intermedio', 'Lea el siguiente texto:

En una comunidad de Upala, el Ebais organizó una feria de salud en la escuela. Revisaron las vacunas, el peso y la talla de los niños, y una enfermera explicó cómo lavarse bien las manos. Al final, el comité estudiantil propuso hacer carteles para que toda la escuela practicara lo aprendido.

De acuerdo con el texto anterior, ¿por qué es importante conocer el derecho a la salud para actuar como ciudadanos?', 'El derecho a la salud no es solo recibir atención: también es aprender a cuidarse. Los estudiantes que hicieron carteles usaron lo aprendido para ayudar a toda la escuela, y eso es actuar como ciudadanos.', false),
    ('soc-1-6-a', 15, 'Derechos y ambiente', 'Clima, biodiversidad y vida cotidiana', 'intermedio', 'Lea el siguiente texto:

En Cañas, Guanacaste, la familia de Yerlin recoge agua de lluvia entre mayo y noviembre, porque de diciembre a abril casi no llueve, los potreros se secan y muchos árboles botan sus hojas. En cambio, su prima, que vive en Limón, cuenta que allá llueve en casi todos los meses del año.

Según el texto anterior, ¿cómo influye el clima en la vida de la familia de Yerlin?', 'En Guanacaste hay una época seca muy marcada, así que la familia guarda agua cuando llueve para tenerla en los meses secos. El clima cambia lo que hacen durante el año, y también a las plantas: los árboles botan las hojas para ahorrar agua.', false),
    ('soc-1-6-b', 16, 'Derechos y ambiente', 'Clima, biodiversidad y vida cotidiana', 'alto', 'Analice la siguiente información:

| | Lugar 1 | Lugar 2 |
| --- | --- | --- |
| Clima | Fresco, húmedo y con neblina casi todo el año | Cálido, con varios meses sin lluvia |
| Vegetación | Árboles cubiertos de musgos, helechos y orquídeas | Árboles que botan sus hojas en verano |
| Actividad común | Observación de aves en senderos | Ganadería en potreros |

De acuerdo con la información anterior, ¿cuál conclusión es correcta?', 'Los musgos, helechos y orquídeas necesitan humedad casi todo el año, y eso es lo que tiene el lugar 1. En el lugar 2, los meses secos hacen que los árboles boten las hojas para ahorrar agua.', false),
    ('soc-1-6-c', 17, 'Derechos y ambiente', 'Clima, biodiversidad y vida cotidiana', 'alto', 'Lea el siguiente texto:

En una cuenca, varias fincas cortaron los árboles que crecían a la orilla del río para sembrar hasta el borde. Con los años, los vecinos notaron que en verano el río llevaba menos agua, que con los aguaceros el agua bajaba turbia y que ya casi no se veían los peces ni las nutrias de antes.

A partir del texto anterior, ¿qué se puede inferir sobre el efecto de esa actividad humana?', 'Los árboles de la orilla protegen el suelo y dan sombra y alimento a los animales del río. Al cortarlos, la tierra cae al agua, el río se seca más en verano y las especies pierden su hogar.', false),
    ('soc-1-7-a', 18, 'Derechos y ambiente', 'Actitudes ciudadanas y ambiente', 'intermedio', 'Lea el siguiente texto:

La familia de Andrea paga cada mes un recibo de agua muy alto. Al revisar, notaron que la manguera queda abierta mientras lavan el carro y que una llave del baño gotea todo el día. El agua de su comunidad viene de una naciente que en verano baja su caudal.

¿Cuál práctica de la familia ayudaría más a conservar la naciente?', 'Lo que más agua desperdicia es la llave que gotea y la manguera abierta. Arreglar la fuga y lavar con balde ahorra agua todos los días, y así la naciente sufre menos en verano.', false),
    ('soc-1-7-b', 19, 'Derechos y ambiente', 'Actitudes ciudadanas y ambiente', 'alto', 'Lea el siguiente texto:

En una playa del Pacífico, los vecinos, los dueños de restaurantes y los pescadores firmaron un acuerdo: no dejar basura en la arena, recoger cada sábado lo que trae la marea y no usar pajillas de plástico. Al año siguiente, la playa recibió la Bandera Azul Ecológica y llegaron más visitantes.

Según el texto anterior, ¿por qué fue importante el acuerdo entre los distintos grupos?', 'El acuerdo funcionó porque todos se comprometieron a lo mismo. La playa quedó limpia, se protegió la vida del mar y la comunidad ganó con más visitantes.', false),
    ('soc-1-7-c', 20, 'Derechos y ambiente', 'Actitudes ciudadanas y ambiente', 'intermedio', 'Lea el siguiente texto:

Para la feria científica, el grupo de Allan investigó qué hacen las familias de su barrio con los residuos. Encontraron que algunas queman las hojas secas y los plásticos en el patio, otras entierran las latas y otras separan lo reciclable y hacen abono con las cáscaras de las frutas.

De acuerdo con el texto anterior, ¿cuál práctica contribuye a la conservación ambiental?', 'Quemar o enterrar residuos contamina el aire y el suelo. Convertir los restos de comida en abono reduce la basura y le devuelve nutrientes a la tierra.', false),
    ('soc-2-1-a', 21, 'Costa Rica antigua y pueblos originarios', 'Historia antigua de Costa Rica', 'intermedio', 'Analice la siguiente información:

| Momento | Cómo vivían las personas |
| --- | --- |
| 1 | Formaban aldeas permanentes, sembraban y hacían vasijas de cerámica. |
| 2 | Se movían de un lugar a otro siguiendo a los animales que cazaban y los frutos de cada época. |
| 3 | Vivían en cacicazgos, con jefes, caminos empedrados y grandes obras de piedra. |

¿Cuál es el orden de esos momentos de la historia antigua de Costa Rica, del más antiguo al más reciente?', 'Primero hubo grupos que se movían para cazar y recolectar. Después, al aprender a sembrar, formaron aldeas, y más tarde surgieron los cacicazgos, con jefes y grandes obras como las de Guayabo.', false),
    ('soc-2-2-a', 22, 'Costa Rica antigua y pueblos originarios', 'Etnias de la Costa Rica antigua', 'intermedio', 'Lea el siguiente texto:

En un museo, el grupo de Ariana vio vasijas de cerámica pintada con varios colores, decoradas con figuras de jaguares y serpientes. La guía explicó que piezas como esas se encontraron en la península de Nicoya y en otras zonas de lo que hoy es Guanacaste, donde vivía uno de los pueblos de la Costa Rica antigua.

Según el texto anterior, ¿cuál pueblo de la Costa Rica antigua habitaba esa zona?', 'Los chorotegas vivieron en la península de Nicoya y el resto de Guanacaste, y son conocidos por su cerámica de varios colores. Los huetares vivían en el centro del país, los cabécares en Talamanca y los malekus en las llanuras del norte.', false),
    ('soc-2-2-b', 23, 'Costa Rica antigua y pueblos originarios', 'Etnias de la Costa Rica antigua', 'alto', 'Lea el siguiente texto:

Para muchos pueblos de la Costa Rica antigua, la naturaleza tenía un valor sagrado: animales como el jaguar, el cocodrilo o el águila representaban fuerza y protección. Por eso los tallaban en piedra o los pintaban en la cerámica que se usaba en ceremonias, y algunos jefes llevaban adornos con esas figuras.

A partir del texto anterior, ¿qué se puede inferir sobre la cosmovisión de esos pueblos?', 'Los animales tallados y pintados no eran solo adornos: representaban fuerza y protección. Por eso aparecían en objetos de ceremonia y en los adornos de los jefes, lo que muestra cómo sus creencias se unían con su vida social.', false),
    ('soc-2-3-a', 24, 'Costa Rica antigua y pueblos originarios', 'Pueblos originarios y aportes culturales', 'alto', 'Analice la siguiente tabla:

| Aporte | Ejemplo en la Costa Rica de hoy |
| --- | --- |
| 1 | El rice and beans, el patí y el pan bon de Limón |
| 2 | La chicha de maíz, el uso ceremonial del cacao y el saber sobre plantas medicinales |
| 3 | El arroz cantonés y el chop suey, que se comen en todo el país |

¿Cuál opción relaciona correctamente cada aporte con la población que lo hizo?', 'El rice and beans, el patí y el pan bon vienen de la población afrodescendiente de Limón. La chicha de maíz y el saber sobre plantas son de los pueblos originarios, y el arroz cantonés llegó con la población china.', false),
    ('soc-2-3-b', 25, 'Costa Rica antigua y pueblos originarios', 'Pueblos originarios y aportes culturales', 'alto', 'Lea el siguiente texto:

En Talamanca, algunas familias bribris siembran cacao bajo la sombra de otros árboles, junto con plátano y frutales, sin cortar el bosque. Ese saber, que pasa de abuelas y abuelos a nietos, hoy interesa a productores de otras zonas que buscan cultivar sin dañar los suelos ni los ríos.

Según el texto anterior, ¿cómo contribuye ese conocimiento bribri al desarrollo del país?', 'Sembrar cacao bajo la sombra del bosque permite producir sin destruirlo. Por eso ese saber ancestral sirve de ejemplo a otras personas productoras y fortalece la identidad del país.', false),
    ('soc-2-4-a', 26, 'Costa Rica antigua y pueblos originarios', 'Situación actual de los pueblos originarios', 'intermedio', 'Lea el siguiente texto:

En un territorio boruca, muchas familias hacen máscaras de madera y tejidos teñidos con plantas. Un comerciante les compra cada máscara a un precio bajo y luego la vende cara en San José. Además, en algunas tiendas se venden copias hechas en fábrica como si fueran piezas borucas.

De acuerdo con el texto anterior, ¿cuál desafío enfrenta esa comunidad?', 'El comerciante paga poco por las máscaras y otras tiendas venden imitaciones. Eso le quita a la comunidad el fruto de su trabajo y afecta su bienestar.', false),
    ('soc-2-4-b', 27, 'Costa Rica antigua y pueblos originarios', 'Situación actual de los pueblos originarios', 'alto', 'Lea el siguiente texto:

En varios territorios indígenas, personas que no pertenecen a esos pueblos ocupan tierras que la ley reserva para ellos. Algunas comunidades también piden que en sus escuelas se enseñe su propia lengua y que las decisiones sobre su territorio se tomen consultándoles.

A partir del texto anterior, ¿cuál es un reto para la sociedad costarricense?', 'Garantizar los derechos de los pueblos originarios significa respetar sus tierras, su lengua y su derecho a ser consultados. Ese es un reto de todo el país, no solo de ellos.', false),
    ('soc-2-5-a', 28, 'Costa Rica antigua y pueblos originarios', 'Identidad intercultural, multiétnica y plurilingüe', 'intermedio', 'Lea la siguiente información:

Para el acto cívico del 31 de agosto, Día de la Persona Negra y la Cultura Afrocostarricense, el grupo de Brenda preparó una presentación. Querían mostrar una expresión cultural que naciera en esa población y que hoy forme parte de la diversidad del país.

¿Cuál expresión cultural cumple con lo que buscaba el grupo?', 'El calipso nació en Limón, en la población afrodescendiente, y hoy es parte de la cultura de todo el país. El punto guanacasteco y el tope vienen de otras tradiciones, y el Juego de los Diablitos es del pueblo boruca.', false),
    ('soc-2-5-b', 29, 'Costa Rica antigua y pueblos originarios', 'Identidad intercultural, multiétnica y plurilingüe', 'alto', 'Lea el siguiente texto:

En Costa Rica, además del español, se hablan lenguas indígenas como el bribri, el cabécar, el maleku y el ngäbere, y en Limón muchas personas hablan un inglés criollo. En algunas escuelas hay docentes que enseñan la lengua y la cultura de su pueblo.

Según el texto anterior, ¿qué aporta esa diversidad de lenguas a la identidad nacional?', 'Que se hablen varias lenguas muestra que Costa Rica es un país multiétnico y plurilingüe. Enseñarlas en las escuelas ayuda a que esas culturas sigan vivas y sean parte de la identidad de todos.', false),
    ('soc-2-6-a', 30, 'Conquista y colonia', 'Conquista española', 'intermedio', 'Analice la siguiente información:

| Año | Hecho |
| --- | --- |
| 1502 | Cristóbal Colón llega a la costa caribeña, cerca de lo que hoy es Limón. |
| 1524 | Se funda Villa Bruselas, cerca del golfo de Nicoya. |
| 1563 | Juan Vázquez de Coronado funda Cartago, en el valle del Guarco. |

La tabla resume tres hechos ocurridos en lo que hoy es el territorio de Costa Rica.

De acuerdo con la información anterior, ¿qué proceso de la historia de Costa Rica se ubica en esas fechas y lugares?', 'La llegada de Colón y la fundación de las primeras poblaciones españolas marcan el tiempo de la conquista: los españoles exploraron el territorio y lo tomaron por la fuerza. La colonia vino después, cuando ya estaban asentados.', false),
    ('soc-2-6-b', 31, 'Conquista y colonia', 'Conquista española', 'alto', 'Lea el siguiente texto:

Con la conquista llegaron enfermedades como la viruela y el sarampión, contra las que la población indígena no tenía defensas. Además, muchos indígenas murieron en enfrentamientos o por el trabajo forzado, y otros huyeron a las montañas. En pocas décadas, los pueblos originarios del territorio se redujeron muchísimo.

La información anterior describe una consecuencia de la conquista de tipo', 'Lo que describe el texto es la caída de la población indígena: cuántas personas había y cuántas quedaron. Eso es una consecuencia demográfica, la que tiene que ver con la población.', false),
    ('soc-2-7-a', 32, 'Conquista y colonia', 'Periodo colonial en el espacio y el tiempo', 'intermedio', 'Analice la siguiente información:

| Tramo | Fechas aproximadas |
| --- | --- |
| 1 | Antes de 1502 |
| 2 | De 1502 a la década de 1570 |
| 3 | De la década de 1570 a 1821 |
| 4 | De 1821 en adelante |

En una época de la historia de Costa Rica, el territorio era una provincia de la Capitanía General de Guatemala, bajo el dominio de España, Cartago era la capital y la mayor parte de la población española vivía en el Valle Central.

¿En cuál tramo se ubica la época descrita?', 'Esa época es la colonia: Costa Rica era una provincia de la Capitanía General de Guatemala, bajo el dominio español, y Cartago era su capital. Empezó cuando terminó la conquista, en la década de 1570, y duró hasta la independencia, en 1821.', false),
    ('soc-2-8-a', 33, 'Conquista y colonia', 'Características y aportes de la colonia', 'intermedio', 'Lea el siguiente texto:

Valentina dibujó el centro de su pueblo: una plaza en el medio, la iglesia frente a ella y las calles cruzándose en ángulo recto, formando cuadras. Su abuelo le contó que muchos pueblos de Costa Rica se trazaron así desde hace siglos, siguiendo las normas que España usaba en sus colonias.

Según el texto anterior, ¿qué aporte del periodo colonial se mantiene en la actualidad?', 'Los pueblos con plaza al centro, iglesia al frente y calles en cuadras siguen el modelo que España usó en la colonia. Las siete provincias son de la vida republicana, y el café, aunque llegó al final de la colonia, se extendió después de la independencia.', false),
    ('soc-2-8-b', 34, 'Conquista y colonia', 'Características y aportes de la colonia', 'intermedio', 'Lea el siguiente texto:

En el siglo XVIII, algunos vecinos de Cartago tenían plantaciones de cacao en el valle de Matina, en el Caribe. Para trabajarlas usaban a personas africanas esclavizadas. El cacao era tan importante que, en la provincia, sus semillas se usaban como moneda para comprar y vender.

De acuerdo con el texto anterior, ¿qué característica de la economía colonial se puede reconocer?', 'El cacao se cultivaba con el trabajo de personas esclavizadas y hasta sirvió como moneda. Eso muestra una economía agrícola, con poco dinero y basada en mano de obra forzada; el café se volvió el producto principal hasta después de la independencia.', false),
    ('soc-2-9-a', 35, 'Conquista y colonia', 'Sociedad colonial y discriminación', 'intermedio', 'Lea la siguiente información:

En la sociedad colonial, los cargos más importantes del gobierno local solo podían ocuparlos españoles y sus descendientes. Los mestizos se dedicaban a oficios y a la agricultura; los indígenas debían pagar tributo, y las personas africanas esclavizadas no tenían libertad.

La información anterior describe una sociedad en la que', 'En la colonia, nacer español, mestizo, indígena o africano decidía qué podía hacer cada persona. A eso se le llama estratificación social: una sociedad dividida en grupos con derechos desiguales.', false),
    ('soc-2-9-b', 36, 'Conquista y colonia', 'Sociedad colonial y discriminación', 'alto', 'Analice la siguiente tabla:

Durante la colonia, varios grupos de la población sufrieron discriminación. La tabla resume algunas situaciones de esa época.

| Grupo | Situación durante la colonia |
| --- | --- |
| Mujeres | ? |
| Pueblos indígenas | Debían pagar tributo y trabajar para los encomenderos. |
| Personas africanas esclavizadas | Eran compradas y vendidas como si fueran objetos. |

¿Cuál situación completa correctamente la fila de las mujeres?', 'En la colonia, las mujeres no podían ocupar cargos públicos y muy pocas aprendían a leer y escribir. El tributo era para los indígenas, y en esa época nadie votaba como lo hacemos hoy.', false),
    ('soc-2-10-a', 37, 'Independencia y Estado', 'Independencia y principios democráticos', 'alto', 'Lea el siguiente texto:

El 15 de setiembre de 1821 se firmó en Guatemala el acta de independencia de Centroamérica. La noticia llegó a Cartago a mediados de octubre, y como la provincia no tenía un gobierno propio, los ayuntamientos de las ciudades tuvieron que reunirse para decidir cómo organizarse.

Según el texto anterior, ¿cuál fue una consecuencia de la independencia para Costa Rica?', 'Al independizarse, Costa Rica se quedó sin el gobierno español y tuvo que decidir cómo organizarse. Las ideas de libertad que venían de otros países fueron una causa, no una consecuencia.', false),
    ('soc-2-10-b', 38, 'Independencia y Estado', 'Independencia y principios democráticos', 'intermedio', 'Lea el siguiente texto:

Con la independencia, los habitantes de Costa Rica empezaron a decidir por sí mismos su forma de gobierno. Más de doscientos años después, en la escuela de Josué, cada grupo elige a sus representantes y todos los estudiantes votan por el gobierno estudiantil, con las mismas reglas para cada candidatura.

A partir del texto anterior, ¿cuáles principios de la independencia siguen vigentes en la escuela de Josué?', 'Votar es participar en las decisiones, y que todas las candidaturas tengan las mismas reglas es igualdad. Esos principios democráticos nacieron con la independencia y siguen vivos hoy.', false),
    ('soc-2-11-a', 39, 'Independencia y Estado', 'Pacto de Concordia', 'alto', 'Lea el siguiente texto:

Después de la independencia, los pueblos de Costa Rica no estaban de acuerdo: unos querían unirse a México y otros preferían gobernarse solos. Para evitar un enfrentamiento, enviaron representantes a una junta en la que discutieron y, el 1 de diciembre de 1821, firmaron el Pacto de Concordia, que organizó un gobierno provisional.

A partir del texto anterior, ¿qué enseñanza del Pacto de Concordia sigue siendo útil para la convivencia democrática?', 'Los pueblos pensaban distinto, pero en vez de pelear se sentaron a discutir y firmaron un pacto. Por eso el Pacto de Concordia es un ejemplo de diálogo y negociación en el nacimiento del Estado.', false),
    ('soc-2-12-a', 40, 'Independencia y Estado', 'Anexión del Partido de Nicoya', 'alto', 'Lea el siguiente texto:

El 25 de julio de 1824, los habitantes del Partido de Nicoya decidieron unirse a Costa Rica. Con esa decisión, el país sumó llanuras y montañas, una larga costa en el Pacífico norte con la península de Nicoya, y también tradiciones como la música de marimba, los bailes y las comidas de maíz de esa región.

De acuerdo con el texto anterior, ¿cuál fue un aporte cultural de la Anexión del Partido de Nicoya?', 'La música de marimba y los bailes tradicionales guanacastecos hoy son parte de la cultura de todo el país. La costa y las tierras son aportes geográficos, no culturales.', false),
    ('soc-2-12-b', 41, 'Independencia y Estado', 'Anexión del Partido de Nicoya', 'alto', 'Lea la siguiente información:

Cada 25 de julio, en escuelas de todo el país se celebra la Anexión del Partido de Nicoya con bailes, comidas típicas y desfiles. En Guanacaste, la fecha se vive como una fiesta de su identidad regional, y en el resto del país se recuerda como el día en que el territorio nacional quedó más completo.

A partir de la información anterior, ¿qué se puede inferir sobre la Anexión?', 'La Anexión se celebra en todo el país y en Guanacaste es una fiesta propia. Eso muestra que unió territorios y también identidades: lo guanacasteco es parte de lo costarricense.', false),
    ('soc-2-13-a', 42, 'Independencia y Estado', 'Símbolos nacionales', 'intermedio', 'Lea la siguiente información:

El Escudo Nacional muestra tres volcanes entre dos mares, con un barco navegando en cada uno. Al fondo sale el sol y arriba hay siete estrellas. Cuando Pablo lo dibujó para un trabajo, su maestra le pidió explicar qué parte del escudo representa la posición geográfica del país.

¿Cuál parte del escudo debería señalar Pablo?', 'Los dos mares del escudo son el Pacífico y el Caribe, y muestran que Costa Rica está entre dos océanos. Las estrellas representan las provincias y los volcanes, el relieve del país.', false),
    ('soc-2-14-a', 43, 'Campaña Nacional', 'Campaña Nacional y consolidación del Estado', 'alto', 'Lea el siguiente texto:

En 1856, el presidente Juan Rafael Mora llamó a defender el país del ejército filibustero de William Walker, que se había apoderado del gobierno de Nicaragua. Campesinos, artesanos y personas de todas las provincias se unieron al ejército. Al terminar la guerra, en 1857, Costa Rica había defendido su independencia.

Según el texto anterior, ¿por qué la Campaña Nacional fue determinante en la consolidación del Estado costarricense?', 'Ante una amenaza externa, gente de todas las provincias luchó por el mismo país. Esa unión fortaleció el sentimiento de ser costarricenses y consolidó al Estado.', false),
    ('soc-2-14-b', 44, 'Campaña Nacional', 'Campaña Nacional y consolidación del Estado', 'alto', 'Lea el siguiente texto:

Después de la batalla de Rivas, en abril de 1856, las tropas costarricenses regresaron al país enfermas de cólera. La enfermedad se extendió rápidamente por los pueblos y causó la muerte de miles de personas en todo el país, lo que dejó a muchas familias sin sostén.

La información anterior describe una consecuencia de la Campaña Nacional que fue', 'El cólera mató a miles de personas y dejó a muchas familias sin quien las sostuviera. Eso cambió la vida de la población: fue una consecuencia social de la guerra.', false),
    ('soc-2-15-a', 45, 'Campaña Nacional', 'Escenarios y rutas de la Campaña Nacional', 'intermedio', 'Analice la siguiente tabla:

Durante la Campaña Nacional, el ejército costarricense combatió en su propio territorio y en Nicaragua contra los filibusteros de William Walker.

| Hecho de la Campaña Nacional | Lugar |
| --- | --- |
| Batalla de Rivas | Nicaragua |
| Batalla de Santa Rosa | Guanacaste |
| Toma de los vapores en la Vía del Tránsito | Río San Juan |

¿En qué orden ocurrieron esos hechos?', 'Primero, en marzo de 1856, se peleó en Santa Rosa, dentro de Costa Rica. En abril siguió Rivas, en Nicaragua, y a finales de ese año se tomó el control de la Vía del Tránsito.', false),
    ('soc-2-15-b', 46, 'Campaña Nacional', 'Escenarios y rutas de la Campaña Nacional', 'alto', 'Observe el siguiente esquema:

![Esquema sin escala de la Vía del Tránsito. Al norte, Nicaragua con el lago de Nicaragua; al sur, Costa Rica. Una línea punteada marca la ruta: por tierra desde San Juan del Sur, en el océano Pacífico, hasta La Virgen, a orillas del lago; luego por el lago y por el río San Juan, que corre por el límite con Costa Rica, hasta San Juan del Norte, en el mar Caribe.](/simulacros-nuevos/soc-2-15-via-del-transito.svg)

En la época de la Campaña Nacional, muchos viajeros cruzaban de un océano al otro por esta ruta: en barcos de vapor por el río y el lago, y en carretas por tierra. Por ella también le llegaban a Walker soldados y armas desde otros países.

A partir de la información anterior, ¿por qué fue importante que el ejército costarricense tomara el control de la Vía del Tránsito?', 'Por la Vía del Tránsito llegaban soldados y armas para Walker. Al controlarla, Costa Rica le cortó la ayuda que venía de afuera y lo debilitó.', false),
    ('soc-2-16-a', 47, 'Campaña Nacional', 'Figuras de la Campaña Nacional y personas de hoy', 'intermedio', 'Lea el siguiente texto:

Francisca Carrasco, conocida como Pancha Carrasco, marchó con el ejército durante la Campaña Nacional. En la batalla de Rivas atendió a soldados heridos, les llevó agua y alimentos y, según se cuenta, también tomó las armas para defender a sus compañeros.

¿Cuál persona de la actualidad muestra un valor semejante al de Pancha Carrasco?', 'Pancha Carrasco se arriesgó para cuidar a otras personas en un momento difícil. Hoy, quienes dan primeros auxilios en una emergencia muestran ese mismo valor de servicio y solidaridad.', false),
    ('soc-2-16-b', 48, 'Campaña Nacional', 'Figuras de la Campaña Nacional y personas de hoy', 'alto', 'Lea la siguiente información:

En la batalla de Rivas, Juan Santamaría, un joven de Alajuela, se ofreció a incendiar el edificio desde donde disparaban los filibusteros, y perdió la vida al hacerlo. Hoy, muchos bomberos entran a casas en llamas para rescatar a personas que ni siquiera conocen.

¿Qué valor comparten Juan Santamaría y los bomberos de hoy?', 'Juan Santamaría arriesgó su vida por su país, y los bomberos se arriesgan para salvar a gente que ni conocen. Lo que los une es la entrega al servicio de los demás, no la fama ni el gusto por el peligro.', false),
    ('soc-2-17-a', 49, 'Reformas y logros sociales', 'Reformas Liberales', 'intermedio', 'Lea el siguiente texto:

En 1886, el gobierno aprobó leyes para que las escuelas primarias de todo el país quedaran a cargo del Estado. Se prepararon mejor los maestros, se abrieron nuevos colegios, como el Liceo de Costa Rica y el Colegio Superior de Señoritas, y se buscó que niñas y niños de todas las clases sociales pudieran asistir a clases.

La información anterior se refiere a la parte de las Reformas Liberales conocida como', 'Poner la educación en manos del Estado y abrir colegios fue la Reforma Educativa de 1886. Las garantías sociales son de la década de 1940, mucho después.', false),
    ('soc-2-17-b', 50, 'Reformas y logros sociales', 'Reformas Liberales', 'alto', 'Lea el siguiente texto:

En la década de 1880, con las reformas liberales, el Estado costarricense asumió tareas que antes llevaba la Iglesia católica, como registrar los nacimientos, los matrimonios y las defunciones. Desde entonces, esos registros se hacen ante oficinas del Estado y valen para todas las personas, sin importar su religión.

Según el texto anterior, ¿qué buscaban los gobiernos liberales con esas leyes?', 'Las reformas liberales pasaron al Estado tareas que antes hacía la Iglesia, como registrar a las personas. No prohibieron la religión: buscaban que el Estado fuera la autoridad en los asuntos civiles.', false),
    ('soc-2-18-a', 51, 'Reformas y logros sociales', 'Logros sociales de la década de 1940', 'intermedio', 'Lea el siguiente texto:

La mamá de Isaac trabaja en una empresa. Cada mes, una parte de su salario y un aporte de la empresa se pagan a la Caja. Gracias a eso, cuando Isaac se enfermó, lo atendieron en el Ebais y en el hospital sin que la familia tuviera que pagar la consulta.

La situación anterior se relaciona con uno de los logros de la década de 1940, conocido como', 'La Caja Costarricense de Seguro Social, creada en 1941, permite que trabajadores y empresas aporten para que todas las personas reciban atención médica. Eso es la seguridad social, uno de los grandes logros de la década de 1940.', false),
    ('soc-2-18-b', 52, 'Reformas y logros sociales', 'Logros sociales de la década de 1940', 'alto', 'Lea la siguiente información:

Don Rodrigo trabaja para una empresa constructora privada. Su contrato dice que su jornada es de ocho horas diarias, que tiene un día de descanso a la semana y que su salario no puede ser menor que el mínimo que fija la ley. Si lo despiden sin una causa justa, tiene derecho a una indemnización.

A partir de la información anterior, ¿qué impacto tienen hoy el Código de Trabajo y las garantías sociales de 1943?', 'La jornada máxima de ocho horas, el descanso semanal y el salario mínimo quedaron protegidos por las garantías sociales y el Código de Trabajo de 1943. Hoy siguen protegiendo a quienes trabajan, para que el trabajo sea justo.', false),
    ('soc-2-19-a', 53, 'Derechos y retos de hoy', 'Derechos fundamentales de la Constitución de 1949', 'intermedio', 'Lea el siguiente texto:

En un barrio, la asociación de vecinos organizó un programa para que personas voluntarias visiten cada semana a señores y señoras de más de setenta años que viven solos. Les ayudan con las compras, conversan con ellos y avisan al Ebais si notan que alguno está enfermo.

Según el texto anterior, ¿cuál derecho de la Constitución Política se está apoyando?', 'La Constitución dice que el Estado debe proteger de forma especial a las personas adultas mayores. El programa de los vecinos ayuda a cumplir ese derecho, cuidando a quienes viven solos.', false),
    ('soc-2-19-b', 54, 'Derechos y retos de hoy', 'Derechos fundamentales de la Constitución de 1949', 'alto', 'Lea la siguiente información:

En una escuela, dos estudiantes tenían religiones distintas y otro compañero se burlaba de ellos. La directora reunió al grupo y explicó que en Costa Rica cada persona puede tener sus propias creencias y opiniones, y que nadie puede ser tratado de forma distinta por eso.

¿Cuáles derechos fundamentales explicó la directora?', 'Tener las propias creencias y opiniones es la libertad de pensamiento, y que nadie sea tratado distinto por eso es igualdad ante la ley. Los dos están en la Constitución de 1949.', false),
    ('soc-2-20-a', 55, 'Derechos y retos de hoy', 'Derechos constitucionales en la vida cotidiana', 'alto', 'Lea el siguiente texto:

Mariana publicó en el chat del grupo su opinión sobre el nuevo horario del comedor escolar. Un compañero le respondió con insultos y con una foto de ella cambiada para burlarse. Cuando lo llamaron a la dirección, dijo que solo estaba usando su libertad de expresión.

A partir del texto anterior, ¿qué se puede inferir sobre la libertad de expresión?', 'Mariana usó su derecho a opinar con respeto. La libertad de expresión no da permiso para insultar ni burlarse de nadie: termina donde empieza la dignidad de los demás.', false),
    ('soc-2-20-b', 56, 'Derechos y retos de hoy', 'Derechos constitucionales en la vida cotidiana', 'intermedio', 'Lea la siguiente información:

Los vecinos de una comunidad están preocupados porque el puente que usan los escolares está en mal estado. Algunos proponen escribir una carta a la municipalidad, firmada por todos, para pedir que lo reparen. Otros quieren juntarse frente al edificio municipal, sin violencia, para que los escuchen.

¿Qué derechos constitucionales están ejerciendo los vecinos?', 'Pedir por escrito a una institución es el derecho de petición, y juntarse sin violencia para hacerse oír es el derecho de reunión. Los dos están en la Constitución y se usan en la vida diaria.', false),
    ('soc-2-21-a', 57, 'Derechos y retos de hoy', 'Retos actuales y participación ciudadana', 'intermedio', 'Lea el siguiente texto:

En la escuela de Fabiola se hizo un simulacro de evacuación por terremoto. Cada grupo salió por la ruta señalada, sin correr, hasta la zona de seguridad de la cancha. Después, el comité de gestión del riesgo revisó cuánto tardaron y les pidió a las familias preparar en casa un plan con un punto de reunión.

Según el texto anterior, ¿por qué la gestión del riesgo es un espacio de participación ciudadana?', 'En un simulacro participan estudiantes, docentes y familias, y cada quien aprende qué hacer. Nadie puede predecir un terremoto, pero sí prepararse: por eso la gestión del riesgo es de todos.', false),
    ('soc-2-21-b', 58, 'Derechos y retos de hoy', 'Retos actuales y participación ciudadana', 'alto', 'Lea el siguiente texto:

Al comprar unos zapatos, el papá de Gabriel pidió la factura electrónica. El vendedor le ofreció un descuento si la compra se hacía sin factura. El papá no aceptó y le explicó a Gabriel que, con los impuestos de cada compra, el Estado paga escuelas, carreteras y hospitales.

A partir del texto anterior, ¿qué actitud de cultura fiscal mostró el papá de Gabriel?', 'Pedir factura asegura que el impuesto de la compra llegue al Estado. Con ese dinero se pagan escuelas, carreteras y hospitales que usamos todas las personas.', false),
    ('soc-2-22-a', 59, 'Derechos y retos de hoy', 'Desafíos contemporáneos y soluciones ciudadanas', 'intermedio', 'Considere la siguiente información:

Un grupo de sexto anotó algunos desafíos que enfrenta hoy la sociedad costarricense.

| Desafío | Ejemplo |
| --- | --- |
| 1 | Muchas personas jóvenes buscan empleo y no lo encuentran. |
| 2 | En las elecciones, una parte de las personas que pueden votar no lo hace. |
| 3 | Algunos ríos de las ciudades reciben aguas sucias y basura. |

¿Cuál opción clasifica correctamente esos desafíos?', 'La falta de empleo es un desafío económico, no ir a votar es un desafío político y la contaminación de los ríos es ambiental. Clasificarlos ayuda a pensar quién y cómo puede resolver cada uno.', false),
    ('soc-2-22-b', 60, 'Derechos y retos de hoy', 'Desafíos contemporáneos y soluciones ciudadanas', 'alto', 'Lea el siguiente texto:

En un cantón, muchas personas mayores se sentían solas y no sabían usar el celular para pedir sus citas médicas. Un grupo de colegiales y escolares propuso enseñarles los sábados en la biblioteca pública, y la municipalidad les prestó computadoras. Al cabo de unos meses, esos vecinos ya pedían sus citas sin ayuda.

A partir del texto anterior, ¿qué se puede inferir sobre la solución de los desafíos sociales?', 'Los estudiantes vieron un problema, propusieron una solución y la municipalidad los apoyó. Así se ve que los desafíos sociales se pueden enfrentar con la participación de la comunidad.', false)
) as v (codigo, orden, tema, subtema, nivel, enunciado, explicacion, tiene_latex)
where s.slug = 'nuevo-estudios-sociales-1'
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
  and s.slug = 'nuevo-estudios-sociales-1';

insert into public.simulacro_nuevo_opciones (item_id, letra, texto, es_correcta)
select i.id, v.letra, v.texto, v.es_correcta
from (values
    ('soc-1-1-a', 'A', 'Sirven sobre todo para conocer cómo se fundó y creció el barrio.', false),
    ('soc-1-1-a', 'B', 'Enseñan que las reglas municipales resuelven por sí mismas los problemas.', false),
    ('soc-1-1-a', 'C', 'Ayudan a entender un problema común y a acordar cómo resolverlo.', true),
    ('soc-1-1-a', 'D', 'Permiten que la escuela decida por las familias cómo usar el parque.', false),
    ('soc-1-1-b', 'A', 'Confirmar si un dato es cierto y aclararlo sin ofender a nadie.', true),
    ('soc-1-1-b', 'B', 'Apoyar al partido contrario para que el recreo largo se mantenga.', false),
    ('soc-1-1-b', 'C', 'Evitar opinar en los chats para no meterse en ningún problema.', false),
    ('soc-1-1-b', 'D', 'Pedir que el Tribunal sacara de la elección al partido acusado.', false),
    ('soc-1-2-a', 'A', 'Hemisferios norte y occidental, en América Central.', true),
    ('soc-1-2-a', 'B', 'Hemisferios norte y oriental, en América Central.', false),
    ('soc-1-2-a', 'C', 'Hemisferios sur y occidental, en América del Sur.', false),
    ('soc-1-2-a', 'D', 'Hemisferios norte y occidental, en las islas Antillas.', false),
    ('soc-1-2-b', 'A', 'Ventaja: salida a dos mares. Desventaja: riesgo de sequías.', false),
    ('soc-1-2-b', 'B', 'Ventaja: gran variedad de especies. Desventaja: riesgo de sismos.', true),
    ('soc-1-2-b', 'C', 'Ventaja: suelos buenos para el café. Desventaja: paso de tormentas.', false),
    ('soc-1-2-b', 'D', 'Ventaja: clima frío en las costas. Desventaja: paso de tormentas.', false),
    ('soc-1-2-c', 'A', 'La cercanía facilita que los países cooperen entre sí.', true),
    ('soc-1-2-c', 'B', 'La cercanía hace que los países vecinos compartan un mismo gobierno.', false),
    ('soc-1-2-c', 'C', 'Estar entre dos mares hace innecesario el comercio con los vecinos.', false),
    ('soc-1-2-c', 'D', 'Los acuerdos se deben al idioma común más que a la cercanía.', false),
    ('soc-1-3-a', 'A', 'cordillera.', true),
    ('soc-1-3-a', 'B', 'valle.', false),
    ('soc-1-3-a', 'C', 'llanura costera.', false),
    ('soc-1-3-a', 'D', 'meseta.', false),
    ('soc-1-3-b', 'A', 'La costa 1 es la del Caribe, con la península de Osa.', false),
    ('soc-1-3-b', 'B', 'La costa 2 es la del Pacífico, con el golfo de Nicoya.', false),
    ('soc-1-3-b', 'C', 'La costa 2 es la del Caribe, con la península de Nicoya.', false),
    ('soc-1-3-b', 'D', 'La costa 1 es la del Pacífico, con el golfo Dulce.', true),
    ('soc-1-3-c', 'A', 'Las partes altas atraen más gente, porque el frío ayuda al cultivo de café.', false),
    ('soc-1-3-c', 'B', 'El relieve no influye: los poblados crecen donde hubo erupciones recientes.', false),
    ('soc-1-3-c', 'C', 'Los terrenos poco empinados y de buen suelo facilitan poblar y sembrar.', true),
    ('soc-1-3-c', 'D', 'Las ciudades y carreteras hicieron que el clima del valle sea templado.', false),
    ('soc-1-4-a', 'A', 'provincia.', false),
    ('soc-1-4-a', 'B', 'cantón.', false),
    ('soc-1-4-a', 'C', 'región.', true),
    ('soc-1-4-a', 'D', 'distrito.', false),
    ('soc-1-4-b', 'A', 'Camila acierta, porque las regiones siguen los límites provinciales.', false),
    ('soc-1-4-b', 'B', 'Ninguno acierta: los rasgos escogidos marcan los límites.', true),
    ('soc-1-4-b', 'C', 'Esteban acierta, porque el clima es lo único que define una región.', false),
    ('soc-1-4-b', 'D', 'Los dos aciertan, porque cada uno usa un criterio distinto.', false),
    ('soc-1-4-c', 'A', 'Permite conocer las necesidades de cada zona y atenderlas mejor.', true),
    ('soc-1-4-c', 'B', 'Hace que cada región se gobierne sola, con sus propias leyes.', false),
    ('soc-1-4-c', 'C', 'Obliga a que todas las regiones reciban exactamente lo mismo.', false),
    ('soc-1-4-c', 'D', 'Busca que la gente joven se traslade a estudiar a la región Central.', false),
    ('soc-1-5-a', 'A', 'Instituto Mixto de Ayuda Social', false),
    ('soc-1-5-a', 'B', 'Defensoría de los Habitantes de la República', false),
    ('soc-1-5-a', 'C', 'Ministerio de Educación Pública', false),
    ('soc-1-5-a', 'D', 'Patronato Nacional de la Infancia', true),
    ('soc-1-5-b', 'A', 'El derecho a la salud.', false),
    ('soc-1-5-b', 'B', 'El derecho al trabajo.', false),
    ('soc-1-5-b', 'C', 'El derecho a la educación.', true),
    ('soc-1-5-b', 'D', 'El derecho a la libre expresión.', false),
    ('soc-1-5-c', 'A', 'Porque permite exigir que lo atiendan antes que a los demás.', false),
    ('soc-1-5-c', 'B', 'Porque lleva a cuidarse uno mismo y a cuidar a los demás.', true),
    ('soc-1-5-c', 'C', 'Porque ese derecho consiste en recibir vacunas y controles.', false),
    ('soc-1-5-c', 'D', 'Porque cuidar la salud es tarea del Ebais y no de la escuela.', false),
    ('soc-1-6-a', 'A', 'Viven igual todo el año, porque en Guanacaste llueve como en Limón.', false),
    ('soc-1-6-a', 'B', 'Siembran en diciembre, cuando hay menos lluvias.', false),
    ('soc-1-6-a', 'C', 'Ajustan sus tareas a la época seca y a la lluviosa.', true),
    ('soc-1-6-a', 'D', 'Recogen agua de diciembre a abril, cuando más llueve.', false),
    ('soc-1-6-b', 'A', 'La humedad del lugar 1 favorece plantas que necesitan mucha agua.', true),
    ('soc-1-6-b', 'B', 'El calor del lugar 2 hace que sus árboles conserven las hojas todo el año.', false),
    ('soc-1-6-b', 'C', 'La ganadería del lugar 2 es la causa de que su clima sea cálido.', false),
    ('soc-1-6-b', 'D', 'El lugar 2 tiene más especies de plantas porque es más cálido.', false),
    ('soc-1-6-c', 'A', 'Los peces se fueron y por eso el río lleva menos agua en verano.', false),
    ('soc-1-6-c', 'B', 'Los cultivos junto al río protegen el suelo igual que los árboles.', false),
    ('soc-1-6-c', 'C', 'Quitar el bosque junto al río dañó el hogar de muchas especies.', true),
    ('soc-1-6-c', 'D', 'El agua turbia viene de los aguaceros y no tiene que ver con las fincas.', false),
    ('soc-1-7-a', 'A', 'Pagar el recibo a tiempo para no tener que pagar multas.', false),
    ('soc-1-7-a', 'B', 'Comprar agua embotellada para tomar durante el verano.', false),
    ('soc-1-7-a', 'C', 'Arreglar la fuga y usar un balde para lavar el carro.', true),
    ('soc-1-7-a', 'D', 'Lavar el carro de noche, cuando hace menos calor.', false),
    ('soc-1-7-b', 'A', 'Porque su fin principal era que llegaran más turistas a los negocios.', false),
    ('soc-1-7-b', 'B', 'Porque una ley obligaba a cada grupo a limpiar su parte de la playa.', false),
    ('soc-1-7-b', 'C', 'Porque los pescadores eran los únicos que ensuciaban la playa.', false),
    ('soc-1-7-b', 'D', 'Porque cuidarla juntos benefició a la naturaleza y al pueblo.', true),
    ('soc-1-7-c', 'A', 'Transformar los restos orgánicos en tierra fértil.', true),
    ('soc-1-7-c', 'B', 'Quemar las cáscaras y las hojas para no atraer moscas.', false),
    ('soc-1-7-c', 'C', 'Enterrar las latas para que no se vean en el patio.', false),
    ('soc-1-7-c', 'D', 'Juntar todo en una sola bolsa para el camión.', false),
    ('soc-2-1-a', 'A', '1, 2 y 3', false),
    ('soc-2-1-a', 'B', '1, 3 y 2', false),
    ('soc-2-1-a', 'C', '2, 1 y 3', true),
    ('soc-2-1-a', 'D', '2, 3 y 1', false),
    ('soc-2-2-a', 'A', 'Huetar', false),
    ('soc-2-2-a', 'B', 'Cabécar', false),
    ('soc-2-2-a', 'C', 'Maleku', false),
    ('soc-2-2-a', 'D', 'Chorotega', true),
    ('soc-2-2-b', 'A', 'Los jefes eran quienes tallaban las figuras de animales en piedra.', false),
    ('soc-2-2-b', 'B', 'Tallaban animales para enseñar a los jóvenes a cazarlos.', false),
    ('soc-2-2-b', 'C', 'Sus creencias se reflejaban en su arte y en sus formas de autoridad.', true),
    ('soc-2-2-b', 'D', 'Los animales tallados mostraban las especies que criaban en las aldeas.', false),
    ('soc-2-3-a', 'A', '1 pueblos originarios, 2 afrodescendiente y 3 asiática', false),
    ('soc-2-3-a', 'B', '1 afrodescendiente, 2 asiática y 3 pueblos originarios', false),
    ('soc-2-3-a', 'C', '1 afrodescendiente, 2 pueblos originarios y 3 asiática', true),
    ('soc-2-3-a', 'D', '1 asiática, 2 pueblos originarios y 3 afrodescendiente', false),
    ('soc-2-3-b', 'A', 'Demuestra que el mejor cacao del país se cultiva en Talamanca.', false),
    ('soc-2-3-b', 'B', 'Reemplaza el trabajo de las personas productoras de otras zonas.', false),
    ('soc-2-3-b', 'C', 'Sirve sobre todo para vender más cacao en el extranjero.', false),
    ('soc-2-3-b', 'D', 'Ofrece una forma de producir que protege la naturaleza.', true),
    ('soc-2-4-a', 'A', 'El poco pago por sus artesanías y las imitaciones.', true),
    ('soc-2-4-a', 'B', 'La pérdida de su lengua por el uso del español en la escuela.', false),
    ('soc-2-4-a', 'C', 'La falta de interés de los jóvenes por aprender el oficio.', false),
    ('soc-2-4-a', 'D', 'La escasez de plantas para teñir lo que tejen.', false),
    ('soc-2-4-b', 'A', 'Darles más ayudas económicas sin atender quién ocupa sus tierras.', false),
    ('soc-2-4-b', 'B', 'Hacer cumplir la ley que los protege y tomar en cuenta su voz.', true),
    ('soc-2-4-b', 'C', 'Enseñarles en español para que puedan reclamar sus derechos.', false),
    ('soc-2-4-b', 'D', 'Dejar que cada comunidad resuelva sola los conflictos de tierras.', false),
    ('soc-2-5-a', 'A', 'El punto guanacasteco.', false),
    ('soc-2-5-a', 'B', 'El Juego de los Diablitos.', false),
    ('soc-2-5-a', 'C', 'El tope de caballos.', false),
    ('soc-2-5-a', 'D', 'El calipso limonense.', true),
    ('soc-2-5-b', 'A', 'Complica la identidad, porque un país debe tener una sola lengua.', false),
    ('soc-2-5-b', 'B', 'Tiene valor sobre todo en las comunidades donde se habla cada una.', false),
    ('soc-2-5-b', 'C', 'Sirve sobre todo para atraer a turistas de otros países.', false),
    ('soc-2-5-b', 'D', 'Muestra que el país se forma con muchos pueblos que conviven.', true),
    ('soc-2-6-a', 'A', 'El periodo colonial', false),
    ('soc-2-6-a', 'B', 'La época de la independencia', false),
    ('soc-2-6-a', 'C', 'La conquista española', true),
    ('soc-2-6-a', 'D', 'La historia antigua', false),
    ('soc-2-6-b', 'A', 'cultural.', false),
    ('soc-2-6-b', 'B', 'demográfico.', true),
    ('soc-2-6-b', 'C', 'económico.', false),
    ('soc-2-6-b', 'D', 'religioso.', false),
    ('soc-2-7-a', 'A', 'Tramo 1', false),
    ('soc-2-7-a', 'B', 'Tramo 2', false),
    ('soc-2-7-a', 'C', 'Tramo 3', true),
    ('soc-2-7-a', 'D', 'Tramo 4', false),
    ('soc-2-8-a', 'A', 'El trazado en cuadrícula con un espacio central.', true),
    ('soc-2-8-a', 'B', 'La división del territorio en siete provincias.', false),
    ('soc-2-8-a', 'C', 'El cultivo de café alrededor de las ciudades.', false),
    ('soc-2-8-a', 'D', 'La costumbre de hacer ferias en la plaza cada domingo.', false),
    ('soc-2-8-b', 'A', 'Se basaba en fábricas que exportaban chocolate a Europa.', false),
    ('soc-2-8-b', 'B', 'Tenía cultivos que se sostenían con mano de obra forzada.', true),
    ('soc-2-8-b', 'C', 'Usaba monedas de oro acuñadas en la ciudad de Cartago.', false),
    ('soc-2-8-b', 'D', 'Tenía al café como el producto más vendido de la provincia.', false),
    ('soc-2-9-a', 'A', 'todas las personas tenían los mismos derechos ante la ley.', false),
    ('soc-2-9-a', 'B', 'el trabajo de cada quien dependía de su propio esfuerzo.', false),
    ('soc-2-9-a', 'C', 'los cargos de gobierno se escogían por votación de todos.', false),
    ('soc-2-9-a', 'D', 'el origen de cada persona definía sus derechos y su labor.', true),
    ('soc-2-9-b', 'A', 'Podían votar, pero no ser elegidas para el gobierno local.', false),
    ('soc-2-9-b', 'B', 'Debían pagar tributo en productos a los encomenderos.', false),
    ('soc-2-9-b', 'C', 'No podían ocupar cargos públicos y pocas sabían leer.', true),
    ('soc-2-9-b', 'D', 'Tenían prohibido participar en las fiestas del pueblo.', false),
    ('soc-2-10-a', 'A', 'La llegada de las ideas de libertad desde otros países.', false),
    ('soc-2-10-a', 'B', 'La firma del acta de independencia en Guatemala.', false),
    ('soc-2-10-a', 'C', 'La necesidad de crear sus propias formas de gobierno.', true),
    ('soc-2-10-a', 'D', 'El regreso del gobierno de España a la provincia.', false),
    ('soc-2-10-b', 'A', 'La participación y la igualdad.', true),
    ('soc-2-10-b', 'B', 'La obediencia y la disciplina.', false),
    ('soc-2-10-b', 'C', 'La tradición y el respeto a los mayores.', false),
    ('soc-2-10-b', 'D', 'La libertad de comercio y la propiedad.', false),
    ('soc-2-11-a', 'A', 'Aceptar lo que proponga el pueblo con más habitantes.', false),
    ('soc-2-11-a', 'B', 'Esperar que una autoridad de afuera decida por todos.', false),
    ('soc-2-11-a', 'C', 'Dejar que cada pueblo se gobierne aparte de los otros.', false),
    ('soc-2-11-a', 'D', 'Resolver las diferencias conversando y negociando.', true),
    ('soc-2-12-a', 'A', 'La salida al océano Pacífico por el golfo de Nicoya.', false),
    ('soc-2-12-a', 'B', 'El aumento de las tierras para la ganadería del país.', false),
    ('soc-2-12-a', 'C', 'La firma de un acuerdo de límites con Nicaragua.', false),
    ('soc-2-12-a', 'D', 'Las expresiones musicales y de danza de esa zona.', true),
    ('soc-2-12-b', 'A', 'Tiene importancia sobre todo para la identidad de Guanacaste.', false),
    ('soc-2-12-b', 'B', 'Hace que lo guanacasteco sea parte de lo costarricense.', true),
    ('soc-2-12-b', 'C', 'Separó a Guanacaste del resto del territorio nacional.', false),
    ('soc-2-12-b', 'D', 'Es una celebración que nació durante el periodo colonial.', false),
    ('soc-2-13-a', 'A', 'Las siete estrellas', false),
    ('soc-2-13-a', 'B', 'Los tres volcanes', false),
    ('soc-2-13-a', 'C', 'Los dos mares', true),
    ('soc-2-13-a', 'D', 'El sol que sale', false),
    ('soc-2-14-a', 'A', 'Porque enfrentar juntos al invasor unió a la población del país.', true),
    ('soc-2-14-a', 'B', 'Porque Costa Rica ganó territorio nicaragüense al final de la guerra.', false),
    ('soc-2-14-a', 'C', 'Porque el ejército pasó a gobernar el país después de 1857.', false),
    ('soc-2-14-a', 'D', 'Porque después de la guerra se abolió el ejército en el país.', false),
    ('soc-2-14-b', 'A', 'política, porque provocó un cambio de gobierno.', false),
    ('soc-2-14-b', 'B', 'territorial, porque el país perdió parte de su tierra.', false),
    ('soc-2-14-b', 'C', 'cultural, porque llegaron costumbres de otros lugares.', false),
    ('soc-2-14-b', 'D', 'social, porque cambió la vida de la población.', true),
    ('soc-2-15-a', 'A', 'Rivas, Santa Rosa y Vía del Tránsito', false),
    ('soc-2-15-a', 'B', 'Santa Rosa, Rivas y Vía del Tránsito', true),
    ('soc-2-15-a', 'C', 'Santa Rosa, Vía del Tránsito y Rivas', false),
    ('soc-2-15-a', 'D', 'Vía del Tránsito, Rivas y Santa Rosa', false),
    ('soc-2-15-b', 'A', 'Porque era el único camino entre San José y la capital de Nicaragua.', false),
    ('soc-2-15-b', 'B', 'Porque así se cortaban los refuerzos para los filibusteros.', true),
    ('soc-2-15-b', 'C', 'Porque por esa ruta salía el café que Costa Rica vendía a Europa.', false),
    ('soc-2-15-b', 'D', 'Porque de esa forma el río San Juan pasó a ser costarricense.', false),
    ('soc-2-16-a', 'A', 'Una socorrista que da primeros auxilios en una emergencia.', true),
    ('soc-2-16-a', 'B', 'Una deportista que gana una medalla en un torneo internacional.', false),
    ('soc-2-16-a', 'C', 'Una empresaria que abre una tienda nueva en su comunidad.', false),
    ('soc-2-16-a', 'D', 'Una cantante que compone canciones sobre la patria.', false),
    ('soc-2-16-b', 'A', 'La búsqueda de reconocimiento y fama.', false),
    ('soc-2-16-b', 'B', 'La obediencia a las órdenes recibidas.', false),
    ('soc-2-16-b', 'C', 'El gusto por las situaciones de peligro.', false),
    ('soc-2-16-b', 'D', 'La entrega para proteger a los demás.', true),
    ('soc-2-17-a', 'A', 'leyes anticlericales.', false),
    ('soc-2-17-a', 'B', 'Reforma Educativa.', true),
    ('soc-2-17-a', 'C', 'Constitución de 1871.', false),
    ('soc-2-17-a', 'D', 'garantías sociales.', false),
    ('soc-2-17-b', 'A', 'Prohibir que las personas practicaran la religión católica.', false),
    ('soc-2-17-b', 'B', 'Cobrar un impuesto por cada nacimiento y matrimonio.', false),
    ('soc-2-17-b', 'C', 'Unir al Estado y a la Iglesia en una sola institución.', false),
    ('soc-2-17-b', 'D', 'Poner en manos civiles lo que hacía la Iglesia.', true),
    ('soc-2-18-a', 'A', 'la educación gratuita y obligatoria.', false),
    ('soc-2-18-a', 'B', 'el derecho al voto de las mujeres.', false),
    ('soc-2-18-a', 'C', 'la abolición del ejército.', false),
    ('soc-2-18-a', 'D', 'la seguridad social.', true),
    ('soc-2-18-b', 'A', 'Ponen límites para que el empleo sea digno y justo.', true),
    ('soc-2-18-b', 'B', 'Permiten que cada patrono fije la jornada que prefiera.', false),
    ('soc-2-18-b', 'C', 'Protegen sobre todo a quienes trabajan para el Estado.', false),
    ('soc-2-18-b', 'D', 'Garantizan que a las personas no se les pueda despedir.', false),
    ('soc-2-19-a', 'A', 'La libertad de comercio de las personas de la comunidad.', false),
    ('soc-2-19-a', 'B', 'La igualdad de todas las personas ante la ley.', false),
    ('soc-2-19-a', 'C', 'El derecho a la educación de niñas y niños.', false),
    ('soc-2-19-a', 'D', 'La protección especial a las personas adultas mayores.', true),
    ('soc-2-19-b', 'A', 'La libertad de reunión y el derecho a recibir educación gratuita.', false),
    ('soc-2-19-b', 'B', 'La libertad de pensamiento y la igualdad ante la ley.', true),
    ('soc-2-19-b', 'C', 'El derecho de petición y la protección especial a la niñez.', false),
    ('soc-2-19-b', 'D', 'La igualdad ante la ley y la libertad de reunión pacífica.', false),
    ('soc-2-20-a', 'A', 'Permite publicar lo que uno quiera cuando se hace en un chat.', false),
    ('soc-2-20-a', 'B', 'Tiene límites y no permite dañar la dignidad de otra persona.', true),
    ('soc-2-20-a', 'C', 'Es un derecho de las personas adultas, no de los estudiantes.', false),
    ('soc-2-20-a', 'D', 'Prohíbe dar opiniones sobre las decisiones de la escuela.', false),
    ('soc-2-20-b', 'A', 'El de petición y el de reunión.', true),
    ('soc-2-20-b', 'B', 'El de votar y el de elegir alcalde.', false),
    ('soc-2-20-b', 'C', 'El de propiedad y el de comercio.', false),
    ('soc-2-20-b', 'D', 'El de salud y el de educación.', false),
    ('soc-2-21-a', 'A', 'Porque saber qué hacer en un sismo es tarea de los bomberos.', false),
    ('soc-2-21-a', 'B', 'Porque estar preparados ante una emergencia es tarea de todos.', true),
    ('soc-2-21-a', 'C', 'Porque los simulacros permiten saber cuándo habrá un terremoto.', false),
    ('soc-2-21-a', 'D', 'Porque así la escuela cumple un requisito y no hace falta más.', false),
    ('soc-2-21-b', 'A', 'Ahorrar dinero aunque los impuestos de la compra no se paguen.', false),
    ('soc-2-21-b', 'B', 'Cuidar que los impuestos lleguen a servicios para todos.', true),
    ('soc-2-21-b', 'C', 'Pagar los impuestos que a cada quien le parezcan justos.', false),
    ('soc-2-21-b', 'D', 'Pedir la factura cuando la compra es muy grande.', false),
    ('soc-2-22-a', 'A', '1 económico, 2 político y 3 ambiental', true),
    ('soc-2-22-a', 'B', '1 político, 2 económico y 3 ambiental', false),
    ('soc-2-22-a', 'C', '1 económico, 2 ambiental y 3 político', false),
    ('soc-2-22-a', 'D', '1 ambiental, 2 político y 3 económico', false),
    ('soc-2-22-b', 'A', 'El Estado es el que debe resolverlos con leyes nuevas.', false),
    ('soc-2-22-b', 'B', 'La comunidad organizada ayuda a resolverlos.', true),
    ('soc-2-22-b', 'C', 'Las personas mayores son las que deben buscar cómo resolverlos.', false),
    ('soc-2-22-b', 'D', 'La municipalidad los resuelve sin ayuda de los vecinos.', false)
) as v (codigo, letra, texto, es_correcta)
join public.simulacro_nuevo_items i on i.codigo = v.codigo
join public.simulacros_nuevos s on s.id = i.simulacro_id and s.slug = 'nuevo-estudios-sociales-1'
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
  where s.slug = 'nuevo-estudios-sociales-1';

  select count(*) into v_malos
  from public.simulacro_nuevo_items i
  join public.simulacros_nuevos s on s.id = i.simulacro_id
  where s.slug = 'nuevo-estudios-sociales-1'
    and (
      (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id) <> 4
      or (select count(*) from public.simulacro_nuevo_opciones o where o.item_id = i.id and o.es_correcta) <> 1
    );

  if v_items <> 60 then
    raise exception 'nuevo-estudios-sociales-1: quedaron % items y se esperaban 60', v_items;
  end if;
  if v_malos > 0 then
    raise exception 'nuevo-estudios-sociales-1: % items sin cuatro opciones o sin exactamente una correcta', v_malos;
  end if;

  -- Todo calza: ahora si se publica.
  update public.simulacros_nuevos set estado = 'publicado' where slug = 'nuevo-estudios-sociales-1';
end
$revision$;

commit;

-- ------------------------------------------------------------
-- Verificacion: cuantos items quedaron y si el examen se publico.
select s.slug, s.estado, count(i.id) as items
from public.simulacros_nuevos s
left join public.simulacro_nuevo_items i on i.simulacro_id = s.id
where s.slug = 'nuevo-estudios-sociales-1'
group by s.slug, s.estado;

-- Verificacion: cuantas veces es clave cada letra (deben salir 15 de cada una).
select o.letra, count(*) as veces_clave
from public.simulacro_nuevo_opciones o
join public.simulacro_nuevo_items i on i.id = o.item_id
join public.simulacros_nuevos s on s.id = i.simulacro_id
where s.slug = 'nuevo-estudios-sociales-1' and o.es_correcta
group by o.letra
order by o.letra;
