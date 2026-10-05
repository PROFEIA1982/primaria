# Simulacro nuevo 1 · Matemáticas · tabla de revisión

Versión para revisión humana del archivo `matematicas.json`, que es la fuente. Si algo se corrige, se corrige allá y se vuelve a generar la migración.

Claves: BCDDADBADBCDCAACDCABBCDCABCABADBCBACBDAD · A, B, C y D diez veces cada una.

Cada ítem se resolvió dos veces: a mano (la columna «Resolución») y con un programa que recalcula el resultado y comprueba que coincide con una sola opción, la de la clave.

## Resumen

| # | Id | Tema | Subtema | Nivel | Clave | Figura |
| ---: | --- | --- | --- | --- | :---: | --- |
| 1 | mat-n09 | Números | Porcentajes | intermedio | B | — |
| 2 | mat-n10 | Números | Operaciones combinadas con potencias | intermedio | C | — |
| 3 | mat-n08 | Números | Operaciones con números decimales | intermedio | D | — |
| 4 | mat-n11 | Números | Múltiplos y divisibilidad | alto | D | — |
| 5 | mat-n03 | Números | Máximo común divisor | alto | A | — |
| 6 | mat-n02 | Números | Mínimo común múltiplo | alto | D | — |
| 7 | mat-n01 | Números | Operaciones combinadas con números naturales | intermedio | B | — |
| 8 | mat-n05 | Números | Suma y resta de fracciones | intermedio | A | — |
| 9 | mat-n04 | Números | Números primos y compuestos | intermedio | D | — |
| 10 | mat-n06 | Números | Fracción de una cantidad | alto | B | — |
| 11 | mat-n07 | Números | División de fracciones | intermedio | C | — |
| 12 | mat-n12 | Números | Comparación de fracciones | alto | D | — |
| 13 | mat-m01 | Medidas | Conversión de medidas de longitud | intermedio | C | — |
| 14 | mat-m07 | Medidas | Volumen de prismas rectangulares | alto | A | mat-m07-caja.svg |
| 15 | mat-m03 | Medidas | Medidas de capacidad | intermedio | A | — |
| 16 | mat-m04 | Medidas | Medidas de tiempo | alto | C | — |
| 17 | mat-m06 | Medidas | Problemas con medidas de longitud | intermedio | D | — |
| 18 | mat-m05 | Medidas | Medidas de superficie | alto | C | — |
| 19 | mat-m02 | Medidas | Conversión de medidas de masa | intermedio | A | — |
| 20 | mat-g06 | Geometría | Área de figuras compuestas | intermedio | B | mat-g06-terreno.svg |
| 21 | mat-g01 | Geometría | Longitud de la circunferencia | alto | B | mat-g01-huerta.svg |
| 22 | mat-g07 | Geometría | Área del triángulo | intermedio | C | — |
| 23 | mat-g05 | Geometría | Desarrollo plano de cuerpos sólidos | intermedio | D | mat-g05-patron.svg |
| 24 | mat-g02 | Geometría | Ángulos internos del triángulo | alto | C | — |
| 25 | mat-g03 | Geometría | Clasificación de cuadriláteros | intermedio | A | — |
| 26 | mat-g08 | Geometría | Perímetro de polígonos regulares | alto | B | — |
| 27 | mat-g04 | Geometría | Elementos de los cuerpos sólidos | alto | C | — |
| 28 | mat-r06 | Relaciones y álgebra | Ecuaciones con balanzas | intermedio | A | mat-r06-balanza.svg |
| 29 | mat-r01 | Relaciones y álgebra | Patrones y sucesiones con figuras | alto | B | mat-r01-palillos.svg |
| 30 | mat-r04 | Relaciones y álgebra | Expresiones con variables | alto | A | — |
| 31 | mat-r05 | Relaciones y álgebra | Sucesiones numéricas | alto | D | — |
| 32 | mat-r02 | Relaciones y álgebra | Ecuaciones | intermedio | B | — |
| 33 | mat-r03 | Relaciones y álgebra | Proporcionalidad directa | intermedio | C | — |
| 34 | mat-e04 | Estadística y probabilidad | Probabilidad de un evento | intermedio | B | — |
| 35 | mat-e07 | Estadística y probabilidad | Media aritmética y moda | intermedio | A | — |
| 36 | mat-e06 | Estadística y probabilidad | Pictogramas | alto | C | mat-e06-frutas.svg |
| 37 | mat-e02 | Estadística y probabilidad | Gráficos de barras | alto | B | mat-e02-libros.svg |
| 38 | mat-e01 | Estadística y probabilidad | Promedio | alto | D | — |
| 39 | mat-e03 | Estadística y probabilidad | Moda | intermedio | A | — |
| 40 | mat-e05 | Estadística y probabilidad | Comparación de probabilidades | alto | D | — |

## Ítem por ítem

### 1. mat-n09 · Números · Porcentajes · intermedio

Una camisa del uniforme cuesta ₡8500 y tiene un descuento del 20 %. ¿Cuánto se paga por la camisa con el descuento?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | ₡1700 | da el descuento, no el precio |
| B | ₡6800 | **Correcta** |
| C | ₡8075 | divide entre 20 en vez de sacar el 20 % |
| D | ₡8480 | resta 20 colones |

**Resolución:** El 20 % de 8500 es 8500 × 20 ÷ 100 = 1700, y eso es lo que se rebaja. Entonces se paga 8500 − 1700 = 6800 colones.

### 2. mat-n10 · Números · Operaciones combinadas con potencias · intermedio

¿Cuál es el resultado de la siguiente operación? $$2^3 + 4 \times 3^2 - 10 \div 2$$

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 25 | trata las dos potencias como multiplicaciones (2 × 3 y 3 × 2) |
| B | 27 | trata 3² como 3 × 2 |
| C | 39 | **Correcta** |
| D | 49 | opera de izquierda a derecha sin jerarquía |

**Resolución:** Primero van las potencias: 2³ = 8 y 3² = 9. Luego las multiplicaciones y divisiones: 4 × 9 = 36 y 10 ÷ 2 = 5. Por último, de izquierda a derecha: 8 + 36 − 5 = 39.

### 3. mat-n08 · Números · Operaciones con números decimales · intermedio

En la feria del agricultor, Andrés compró 2,5 kg de papas a ₡840 el kilogramo y 1,25 kg de zanahorias a ₡720 el kilogramo. ¿Cuánto pagó en total?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | ₡2100 | solo las papas |
| B | ₡2400 | ignora los decimales: 2 × 840 + 1 × 720 |
| C | ₡2820 | ignora el 0,25 de las zanahorias |
| D | ₡3000 | **Correcta** |

**Resolución:** Las papas cuestan 2,5 × 840 = 2100 colones y las zanahorias 1,25 × 720 = 900 colones. Sumando, 2100 + 900 = 3000. El medio kilo y el cuarto de kilo también se pagan.

### 4. mat-n11 · Números · Múltiplos y divisibilidad · alto

Keylor tiene entre 30 y 50 canicas. Si las acomoda en grupos de 6 no le sobra ninguna, y si las acomoda en grupos de 8 tampoco le sobra ninguna. ¿Cuántas canicas tiene?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 32 | múltiplo de 8 solamente |
| B | 36 | múltiplo de 6 solamente |
| C | 40 | múltiplo de 8 solamente |
| D | 48 | **Correcta** |

**Resolución:** La cantidad tiene que ser múltiplo de 6 y de 8 a la vez, o sea, múltiplo de 24. Entre 30 y 50 el único es 48: 48 ÷ 6 = 8 y 48 ÷ 8 = 6, sin que sobre nada.

### 5. mat-n03 · Números · Máximo común divisor · alto

Para la huerta escolar, don Rafael tiene 48 matas de chile dulce y 72 matas de tomate. Quiere sembrarlas en filas que tengan todas la misma cantidad de matas, sin mezclar chile con tomate y con la mayor cantidad posible de matas en cada fila. ¿Cuántas filas tendrá en total?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 5 filas | **Correcta** |
| B | 10 filas | reparte de 12 en 12, un divisor común que no es el mayor |
| C | 24 filas | da las matas por fila (el MCD), no las filas |
| D | 144 filas | usa el mínimo común múltiplo |

**Resolución:** El número más grande que divide exacto a 48 y a 72 es 24, su máximo común divisor: cada fila lleva 24 matas. Así quedan 48 ÷ 24 = 2 filas de chile y 72 ÷ 24 = 3 filas de tomate, o sea 5 filas en total.

### 6. mat-n02 · Números · Mínimo común múltiplo · alto

Desde la terminal de buses de Guápiles salen dos rutas a las 6:00 a. m. La ruta 1 sale cada 12 minutos y la ruta 2 sale cada 18 minutos. ¿A qué hora vuelven a salir juntas por primera vez?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 6:06 a. m. | usa el máximo común divisor (6) en vez del mínimo común múltiplo |
| B | 6:24 a. m. | se queda con un múltiplo de 12 que no es de 18 |
| C | 6:30 a. m. | suma 12 + 18 |
| D | 6:36 a. m. | **Correcta** |

**Resolución:** Hay que buscar el primer número que esté en la tabla del 12 y también en la del 18: ese es el mínimo común múltiplo, 36. Por eso las dos rutas vuelven a salir juntas 36 minutos después, a las 6:36 a. m.

### 7. mat-n01 · Números · Operaciones combinadas con números naturales · intermedio

En la soda de la escuela, Mariela compró 3 empanadas de ₡650 cada una y 2 refrescos naturales de ₡450 cada uno. Pagó con un billete de ₡5000. ¿Cuánto dinero le devolvieron?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | ₡1700 | multiplica por 3 también los refrescos: (650 + 450) × 3 |
| B | ₡2150 | **Correcta** |
| C | ₡2350 | cambia las cantidades: 2 empanadas y 3 refrescos |
| D | ₡2850 | da lo que gastó, no el vuelto |

**Resolución:** Primero se calcula lo que gastó: 3 × 650 = 1950 y 2 × 450 = 900, en total ₡2850. Después se resta del billete: 5000 − 2850 = 2150. Ese es el vuelto.

### 8. mat-n05 · Números · Suma y resta de fracciones · intermedio

Valeria pintó $\frac{2}{5}$ de un mural de la escuela el lunes y $\frac{1}{3}$ del mismo mural el martes. ¿Qué fracción del mural le falta por pintar?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | $\frac{4}{15}$ | **Correcta** |
| B | $\frac{3}{8}$ | suma numeradores y denominadores: 3/8 y lo toma como lo que falta |
| C | $\frac{5}{8}$ | suma mal (3/8) y le resta eso al entero |
| D | $\frac{11}{15}$ | da lo pintado, no lo que falta |

**Resolución:** Para sumar fracciones con distinto denominador se buscan equivalentes: 2/5 = 6/15 y 1/3 = 5/15, así que ya pintó 11/15. El mural completo es 15/15, entonces le falta 15/15 − 11/15 = 4/15.

### 9. mat-n04 · Números · Números primos y compuestos · intermedio

Josué asegura: «Todos los números impares mayores que 15 son primos». ¿Cuál de los siguientes números demuestra que Josué está equivocado?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 19 | primo |
| B | 23 | primo |
| C | 29 | primo; quien no conoce bien los primos duda con los que terminan en 9 o en 3 |
| D | 33 | **Correcta** |

**Resolución:** Un número primo solo se divide exacto entre 1 y entre sí mismo. El 33 es impar y mayor que 15, pero también se divide entre 3 y entre 11, porque 3 × 11 = 33. Por eso no es primo y le gana la discusión a Josué.

### 10. mat-n06 · Números · Fracción de una cantidad · alto

En un grupo de sexto hay 30 estudiantes. Las $\frac{2}{3}$ partes del grupo participan en la feria científica y, de quienes participan, $\frac{3}{5}$ presentan un proyecto sobre el agua. ¿Cuántos estudiantes presentan un proyecto sobre el agua?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 8 estudiantes | resta: 20 − 12, los que participan sin proyecto |
| B | 12 estudiantes | **Correcta** |
| C | 18 estudiantes | aplica 3/5 a los 30 del grupo |
| D | 20 estudiantes | se queda en el primer paso (2/3 de 30) |

**Resolución:** Primero se calcula cuántos participan: 2/3 de 30 es 20. Después se saca 3/5 de esos 20, que da 12. Ojo: el 3/5 se aplica a quienes participan, no a todo el grupo.

### 11. mat-n07 · Números · División de fracciones · intermedio

Una botella tiene $\frac{2}{3}$ de litro de fresco de cas. Si se sirve en vasos de $\frac{1}{6}$ de litro cada uno, ¿cuántos vasos se llenan?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 2 vasos | se queda con el numerador de 2/3 |
| B | 3 vasos | confunde 2/3 con “3 partes” |
| C | 4 vasos | **Correcta** |
| D | 6 vasos | cuenta los sextos de un litro entero |

**Resolución:** Hay que ver cuántas veces cabe 1/6 dentro de 2/3. Como 2/3 es lo mismo que 4/6, caben 4 vasos: 2/3 ÷ 1/6 = 4.

### 12. mat-n12 · Números · Comparación de fracciones · alto

Tres amigas compraron una pizza cada una, todas del mismo tamaño. Sofía comió $\frac{3}{8}$ de su pizza, Jimena comió $\frac{2}{5}$ de la suya y Yerlin comió $\frac{1}{3}$ de la suya. ¿Cuál es el orden correcto, de la que comió más a la que comió menos?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | Sofía, Jimena y Yerlin | ordena por el numerador |
| B | Yerlin, Jimena y Sofía | cree que el denominador menor siempre gana |
| C | Yerlin, Sofía y Jimena | ordena al revés, de menor a mayor |
| D | Jimena, Sofía y Yerlin | **Correcta** |

**Resolución:** Para comparar se pueden pasar a decimales: 3/8 = 0,375; 2/5 = 0,4 y 1/3 es casi 0,33. Por eso Jimena comió más, luego Sofía y de última Yerlin. Fijate que el numerador más grande no siempre gana.

### 13. mat-m01 · Medidas · Conversión de medidas de longitud · intermedio

Para decorar el desfile del 15 de setiembre, la escuela necesita 4 cintas de 2,75 m cada una. Si compra un rollo de 12 m, ¿cuántos centímetros de cinta le sobran?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 1 cm | deja el metro sobrante sin convertir |
| B | 10 cm | convierte multiplicando por 10 |
| C | 100 cm | **Correcta** |
| D | 1000 cm | convierte multiplicando por 1000 |

**Resolución:** Las 4 cintas miden 4 × 2,75 = 11 m, así que sobra 12 − 11 = 1 m. Como 1 m tiene 100 cm, sobran 100 centímetros.

### 14. mat-m07 · Medidas · Volumen de prismas rectangulares · alto

La caja de la figura tiene forma de prisma rectangular. Por dentro mide 20 cm de largo, 10 cm de ancho y 15 cm de alto. (figura) ¿Cuántos cubitos de 5 cm de arista caben dentro de la caja, sin que queden espacios?

Figura `mat-m07-caja.svg`. Texto alternativo: Caja con forma de prisma rectangular. Mide 20 cm de largo, 10 cm de ancho y 15 cm de alto. A un lado hay un cubito de 5 cm de arista.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 24 cubitos | **Correcta** |
| B | 120 cubitos | divide el volumen entre 25 (el área de una cara) |
| C | 600 cubitos | divide el volumen entre 5 (la arista) |
| D | 3000 cubitos | da el volumen de la caja en cm³ |

**Resolución:** A lo largo caben 20 ÷ 5 = 4 cubitos, a lo ancho 10 ÷ 5 = 2 y a lo alto 15 ÷ 5 = 3. En total son 4 × 2 × 3 = 24 cubitos. También sale dividiendo el volumen de la caja, 3000 cm³, entre el de un cubito, 125 cm³.

### 15. mat-m03 · Medidas · Medidas de capacidad · intermedio

Una pichinga tiene 3 L de agua. Con ella se llenan 8 vasos de 250 mL cada uno. ¿Cuántos mililitros de agua quedan en la pichinga?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 1000 mL | **Correcta** |
| B | 2000 mL | da lo que se sirvió |
| C | 2750 mL | resta un solo vaso |
| D | 2800 mL | calcula 8 × 250 como 200 |

**Resolución:** 3 L son 3000 mL. Los 8 vasos usan 8 × 250 = 2000 mL. Quedan 3000 − 2000 = 1000 mL, que es lo mismo que 1 litro.

### 16. mat-m04 · Medidas · Medidas de tiempo · alto

Un partido de fútbol entre dos escuelas empezó a las 2:50 p. m. Tuvo dos tiempos de 35 minutos cada uno y un descanso de 15 minutos entre ellos. ¿A qué hora terminó el partido?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 3:40 p. m. | cuenta un solo tiempo y el descanso |
| B | 4:00 p. m. | olvida el descanso |
| C | 4:15 p. m. | **Correcta** |
| D | 4:30 p. m. | cuenta dos descansos |

**Resolución:** El partido duró 35 + 15 + 35 = 85 minutos, que es 1 hora y 25 minutos. A las 2:50 p. m. se le suma 1 hora y llegamos a las 3:50; con 25 minutos más son las 4:15 p. m.

### 17. mat-m06 · Medidas · Problemas con medidas de longitud · intermedio

Fabián camina 750 m de su casa a la escuela y la misma distancia de regreso, de lunes a viernes. ¿Cuántos kilómetros camina en total durante esos cinco días?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 0,75 km | un solo viaje de un día |
| B | 1,5 km | ida y vuelta de un solo día |
| C | 3,75 km | olvida el regreso |
| D | 7,5 km | **Correcta** |

**Resolución:** Cada día camina 750 + 750 = 1500 m. En cinco días son 1500 × 5 = 7500 m. Como 1 km tiene 1000 m, eso es 7,5 km.

### 18. mat-m05 · Medidas · Medidas de superficie · alto

El piso de un aula mide 8 m de largo y 6 m de ancho. ¿Cuál es el área del piso en centímetros cuadrados?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 4800 cm² | convierte m² multiplicando por 10 |
| B | 48 000 cm² | convierte m² multiplicando por 100, como si fueran metros |
| C | 480 000 cm² | **Correcta** |
| D | 4 800 000 cm² | se pasa de ceros |

**Resolución:** El área es 8 × 6 = 48 m². Cada metro cuadrado es un cuadro de 100 cm por 100 cm, o sea 10 000 cm². Entonces el piso mide 48 × 10 000 = 480 000 cm².

### 19. mat-m02 · Medidas · Conversión de medidas de masa · intermedio

Doña Lucía empaca 3,6 kg de frijoles en bolsas de 450 g cada una. ¿Cuántas bolsas llena?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 8 bolsas | **Correcta** |
| B | 80 bolsas | se le corre un cero al convertir (36 000 g) |
| C | 125 bolsas | divide al revés: 450 entre 3,6 |
| D | 800 bolsas | divide 3600 entre 4,5 |

**Resolución:** Primero se pasa todo a la misma unidad: 3,6 kg son 3600 g. Luego se reparte: 3600 ÷ 450 = 8 bolsas.

### 20. mat-g06 · Geometría · Área de figuras compuestas · intermedio

La figura representa el terreno de una escuela, con sus medidas en metros. (figura) ¿Cuál es el área del terreno?

Figura `mat-g06-terreno.svg`. Texto alternativo: Terreno con forma de L. Abajo mide 10 m y a la izquierda mide 8 m. Arriba mide 6 m; de ahí baja 3 m, sigue 4 m hacia la derecha y baja 5 m por el lado derecho hasta la base.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 36 m² | da el perímetro |
| B | 68 m² | **Correcta** |
| C | 80 m² | no le quita el pedazo que falta |
| D | 92 m² | suma el pedazo en vez de restarlo |

**Resolución:** Se puede partir en dos rectángulos: uno de 6 m por 8 m, que da 48 m², y otro de 4 m por 5 m, que da 20 m². Sumados son 48 + 20 = 68 m². También sale restando: 10 × 8 − 4 × 3 = 68.

### 21. mat-g01 · Geometría · Longitud de la circunferencia · alto

La huerta de la escuela tiene forma de círculo y mide 10 m de diámetro, como se ve en la figura. (figura) Se quiere poner malla alrededor de toda la huerta y cada metro de malla cuesta ₡1500. Si se usa $\pi \approx 3{,}14$, ¿cuánto cuesta la malla?

Figura `mat-g01-huerta.svg`. Texto alternativo: Círculo que representa la huerta. Una línea lo cruza por el centro, de un borde al otro, y está rotulada: diámetro 10 m.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | ₡23 550 | usa el radio en vez del diámetro |
| B | ₡47 100 | **Correcta** |
| C | ₡94 200 | usa 2 × π × diámetro |
| D | ₡117 750 | calcula el área en vez del borde |

**Resolución:** La malla va por el borde del círculo, que se calcula con π × diámetro: 3,14 × 10 = 31,4 m. Después se multiplica por el precio: 31,4 × 1500 = 47 100 colones.

### 22. mat-g07 · Geometría · Área del triángulo · intermedio

Para la fiesta de la escuela se van a coser 12 banderines con forma de triángulo. Cada banderín tiene 30 cm de base y 40 cm de altura. ¿Cuánta tela se necesita para los 12 banderines, sin contar desperdicios?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 600 cm² | un solo banderín |
| B | 840 cm² | suma base y altura y multiplica por 12 |
| C | 7200 cm² | **Correcta** |
| D | 14 400 cm² | olvida dividir entre 2 |

**Resolución:** El área de un triángulo es base por altura entre 2: 30 × 40 ÷ 2 = 600 cm² por banderín. Para 12 banderines se necesitan 600 × 12 = 7200 cm².

### 23. mat-g05 · Geometría · Desarrollo plano de cuerpos sólidos · intermedio

La figura muestra el patrón que Jimena recortó en cartulina. (figura) Si lo dobla por las líneas punteadas y lo arma, ¿qué cuerpo sólido se forma?

Figura `mat-g05-patron.svg`. Texto alternativo: Patrón de cartulina: tres rectángulos iguales en fila, uno al lado del otro, y un triángulo pegado arriba y otro abajo del rectángulo del centro. Las líneas donde se dobla están punteadas.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | Pirámide de base triangular | ve los triángulos y piensa en pirámide |
| B | Pirámide de base cuadrada | confunde las caras |
| C | Prisma de base rectangular | se fija solo en los rectángulos |
| D | Prisma de base triangular | **Correcta** |

**Resolución:** Los dos triángulos iguales son las bases, una de cada lado, y los tres rectángulos forman las caras de alrededor. Un cuerpo con dos bases iguales y caras rectangulares es un prisma, y aquí sus bases son triángulos.

### 24. mat-g02 · Geometría · Ángulos internos del triángulo · alto

Un triángulo isósceles tiene dos ángulos iguales y el ángulo distinto mide 40°. ¿Cuánto mide cada uno de los ángulos iguales?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 40° | cree que los tres ángulos son iguales al dado |
| B | 50° | resta de 90°, como en el triángulo rectángulo |
| C | 70° | **Correcta** |
| D | 140° | no divide entre los dos ángulos iguales |

**Resolución:** Los tres ángulos de cualquier triángulo suman 180°. Si uno mide 40°, a los otros dos les quedan 180 − 40 = 140°, y como son iguales, cada uno mide 140 ÷ 2 = 70°.

### 25. mat-g03 · Geometría · Clasificación de cuadriláteros · intermedio

Un cuadrilátero tiene dos pares de lados paralelos, sus cuatro lados miden lo mismo y ninguno de sus ángulos es recto. ¿Qué cuadrilátero es?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | Rombo | **Correcta** |
| B | Cuadrado | se fija en los lados iguales y olvida que no hay ángulos rectos |
| C | Rectángulo | se fija solo en los lados paralelos |
| D | Trapecio | confunde paralelogramo con trapecio |

**Resolución:** Tener los cuatro lados iguales deja por fuera al rectángulo y al trapecio. Entre el cuadrado y el rombo, la pista es que no tiene ángulos rectos: el cuadrado sí los tiene, así que la figura es un rombo.

### 26. mat-g08 · Geometría · Perímetro de polígonos regulares · alto

Con un alambre, Esteban formó un pentágono regular de 18 cm de lado. Después lo desarmó y, con todo el alambre, formó un hexágono regular. ¿Cuánto mide cada lado del hexágono?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 12 cm | le quita un lado de 18 al alambre: 72 ÷ 6 |
| B | 15 cm | **Correcta** |
| C | 17 cm | cree que con un lado más se pierde 1 cm |
| D | 18 cm | cree que los lados no cambian |

**Resolución:** El alambre mide lo mismo que el perímetro del pentágono: 5 × 18 = 90 cm. Al repartir esos 90 cm en los 6 lados iguales del hexágono, cada lado mide 90 ÷ 6 = 15 cm.

### 27. mat-g04 · Geometría · Elementos de los cuerpos sólidos · alto

Una pirámide tiene como base un hexágono. ¿Cuántas aristas tiene en total?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 6 | cuenta solo las aristas de la base |
| B | 7 | cuenta caras |
| C | 12 | **Correcta** |
| D | 18 | aristas del prisma hexagonal |

**Resolución:** La base hexagonal tiene 6 aristas, y de cada vértice de la base sale una arista que sube hasta la punta: 6 más. En total son 6 + 6 = 12 aristas.

### 28. mat-r06 · Relaciones y álgebra · Ecuaciones con balanzas · intermedio

La balanza de la figura está en equilibrio. En el platillo de la izquierda hay 3 cajas iguales y una pesa de 2 kg; en el de la derecha hay una pesa de 14 kg. (figura) ¿Cuánto pesa cada caja?

Figura `mat-r06-balanza.svg`. Texto alternativo: Balanza de dos platillos, nivelada. En el platillo izquierdo hay tres cajas iguales y una pesa de 2 kg. En el platillo derecho hay una pesa de 14 kg.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 4 kg | **Correcta** |
| B | 6 kg | reparte los 12 kg entre los dos platillos |
| C | 12 kg | da el peso de las tres cajas juntas |
| D | 16 kg | suma la pesa de 2 kg en vez de quitarla |

**Resolución:** Si se quitan 2 kg de cada lado, la balanza sigue en equilibrio: las 3 cajas pesan 14 − 2 = 12 kg. Entonces cada caja pesa 12 ÷ 3 = 4 kg.

### 29. mat-r01 · Relaciones y álgebra · Patrones y sucesiones con figuras · alto

Con palillos se forman las figuras que se muestran: la figura 1 tiene un cuadrado, la figura 2 tiene dos cuadrados unidos y la figura 3 tiene tres. (figura) Si se sigue el mismo patrón, ¿cuántos palillos se necesitan para la figura 15?

Figura `mat-r01-palillos.svg`. Texto alternativo: Tres figuras hechas con palillos. Figura 1: un cuadrado de 4 palillos. Figura 2: dos cuadrados unidos por un lado, 7 palillos. Figura 3: tres cuadrados en fila, 10 palillos.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 45 | 3 × 15, olvida el primer palillo |
| B | 46 | **Correcta** |
| C | 49 | 4 + 3 × 15, se pasa de un cuadrado |
| D | 60 | cuenta 4 palillos por cuadrado |

**Resolución:** La figura 1 usa 4 palillos y cada cuadrado nuevo agrega solo 3, porque comparte un lado con el anterior. Así, la figura 15 usa 4 + 3 × 14 = 46 palillos.

### 30. mat-r04 · Relaciones y álgebra · Expresiones con variables · alto

En una librería, un cuaderno cuesta $c$ colones y un lapicero cuesta ₡300 menos que un cuaderno. ¿Cuál expresión representa lo que se paga por 2 cuadernos y 3 lapiceros?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | $5c - 900$ | **Correcta** |
| B | $5c - 300$ | no multiplica el 300 por los 3 lapiceros |
| C | $5c - 600$ | aplica el 300 a los 2 cuadernos |
| D | $5c + 900$ | error de signo al distribuir |

**Resolución:** Cada lapicero cuesta c − 300. Los 2 cuadernos son 2c y los 3 lapiceros son 3 × (c − 300) = 3c − 900. Sumando todo: 2c + 3c − 900 = 5c − 900.

### 31. mat-r05 · Relaciones y álgebra · Sucesiones numéricas · alto

Observe la siguiente sucesión: 3, 7, 15, 31, 63, … ¿Cuál es el número que sigue?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 67 | repite la primera diferencia (+4) |
| B | 95 | repite la última diferencia (+32) |
| C | 126 | duplica sin sumar 1 |
| D | 127 | **Correcta** |

**Resolución:** Las diferencias entre un número y el siguiente se van duplicando: 4, 8, 16, 32. La próxima diferencia es 64, así que sigue 63 + 64 = 127. Otra forma de verlo: cada número es el anterior por 2, más 1.

### 32. mat-r02 · Relaciones y álgebra · Ecuaciones · intermedio

Daniela pensó un número, lo multiplicó por 4 y al resultado le restó 7. Al final obtuvo 33. ¿Qué número pensó Daniela?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 6,5 | resta el 7 en vez de sumarlo |
| B | 10 | **Correcta** |
| C | 40 | se queda en el primer paso |
| D | 125 | hace las operaciones hacia adelante con el 33 |

**Resolución:** Se deshacen los pasos al revés: si al restarle 7 quedó 33, antes era 33 + 7 = 40. Y si 40 salió de multiplicar por 4, el número era 40 ÷ 4 = 10. Comprobación: 10 × 4 − 7 = 33.

### 33. mat-r03 · Relaciones y álgebra · Proporcionalidad directa · intermedio

En una tortillería, con 3 kg de masa se hacen 48 tortillas. Si la cantidad de tortillas es proporcional a la masa, ¿cuántas tortillas se hacen con 5 kg de masa?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 50 | suma la diferencia de kilos a las tortillas |
| B | 64 | suma solo un kilo más de tortillas |
| C | 80 | **Correcta** |
| D | 240 | multiplica 48 por 5 |

**Resolución:** Primero se averigua cuántas salen con 1 kg: 48 ÷ 3 = 16 tortillas. Con 5 kg salen 16 × 5 = 80 tortillas.

### 34. mat-e04 · Estadística y probabilidad · Probabilidad de un evento · intermedio

En una bolsa hay 5 bolitas rojas, 3 azules y 4 verdes, todas del mismo tamaño. Si se saca una bolita sin ver, ¿cuál es la probabilidad de que sea azul?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | $\frac{1}{12}$ | piensa en una sola bolita |
| B | $\frac{1}{4}$ | **Correcta** |
| C | $\frac{1}{3}$ | tres colores, uno es azul |
| D | $\frac{3}{4}$ | da la probabilidad de que no sea azul |

**Resolución:** En total hay 5 + 3 + 4 = 12 bolitas y 3 son azules. La probabilidad es 3/12, que simplificada es 1/4.

### 35. mat-e07 · Estadística y probabilidad · Media aritmética y moda · intermedio

Durante cinco días, una pulpería vendió esta cantidad de helados: lunes 12, martes 15, miércoles 9, jueves 15 y viernes 14. ¿Cuál de las siguientes afirmaciones es verdadera?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | La moda es 15 y la media es 13. | **Correcta** |
| B | La moda es 15 y la media es 15. | confunde la media con la moda |
| C | La moda es 2 y la media es 13. | da cuántas veces se repite el 15 |
| D | La moda es 13 y la media es 15. | cambia moda por media |

**Resolución:** La moda es el dato que más se repite: el 15 aparece dos veces. La media se saca sumando todo y dividiendo entre la cantidad de días: 65 ÷ 5 = 13.

### 36. mat-e06 · Estadística y probabilidad · Pictogramas · alto

El pictograma muestra los kilogramos de fruta que vendió un puesto de la feria en una mañana. Cada círculo completo representa 6 kg. (figura) ¿Cuántos kilogramos más de mango que de papaya se vendieron?

Figura `mat-e06-frutas.svg`. Texto alternativo: Pictograma de fruta vendida, donde cada círculo completo vale 6 kg. Mango: 4 círculos. Papaya: 2 círculos y medio círculo. Piña: 3 círculos.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 1,5 kg | responde en círculos, no en kilos |
| B | 6 kg | cuenta el medio círculo como uno entero |
| C | 9 kg | **Correcta** |
| D | 15 kg | da lo que se vendió de papaya |

**Resolución:** Mango tiene 4 círculos, o sea 4 × 6 = 24 kg. Papaya tiene 2 círculos y medio: 2,5 × 6 = 15 kg. La diferencia es 24 − 15 = 9 kg.

### 37. mat-e02 · Estadística y probabilidad · Gráficos de barras · alto

El gráfico muestra la cantidad de libros que leyó cada grupo de sexto durante un mes. (figura) ¿Qué porcentaje del total de libros leyó el grupo 6-4?

Figura `mat-e02-libros.svg`. Texto alternativo: Gráfico de barras de los libros leídos en un mes por cada grupo de sexto: 6-1 leyó 24, 6-2 leyó 30, 6-3 leyó 18 y 6-4 leyó 28.

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 25 % | reparte en cuatro partes iguales |
| B | 28 % | **Correcta** |
| C | 30 % | toma el grupo que más leyó |
| D | 72 % | da lo que leyeron los otros grupos |

**Resolución:** Entre los cuatro grupos leyeron 24 + 30 + 18 + 28 = 100 libros. Como el total es 100, los 28 libros del grupo 6-4 son el 28 % del total.

### 38. mat-e01 · Estadística y probabilidad · Promedio · alto

Las notas de Esteban en cinco pruebas cortas fueron 88, 90, 76, 94 y 82. ¿Qué nota necesita en la sexta prueba para que el promedio de las seis sea 87?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 86 | da el promedio que ya tiene |
| B | 87 | cree que sacar 87 deja el promedio en 87 |
| C | 88 | sube un punto porque le falta uno |
| D | 92 | **Correcta** |

**Resolución:** Para tener promedio 87 en seis pruebas, las seis notas deben sumar 87 × 6 = 522. Las cinco que ya tiene suman 430, así que en la sexta necesita 522 − 430 = 92.

### 39. mat-e03 · Estadística y probabilidad · Moda · intermedio

La tabla muestra cuántos hermanos tienen los estudiantes de un grupo de sexto. (tabla)

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | 1 hermano | **Correcta** |
| B | 2 hermanos | escoge el valor del medio de la tabla |
| C | 4 hermanos | escoge el valor más alto |
| D | 8 hermanos | confunde la moda con la frecuencia |

**Resolución:** La moda es el dato que más se repite. Tener 1 hermano es lo que más aparece, en 8 estudiantes. El 8 no es la moda: es cuántas veces se repite el dato.

### 40. mat-e05 · Estadística y probabilidad · Comparación de probabilidades · alto

Para una rifa del comité de padres hay dos cajas. En la caja A hay 20 boletos y 4 tienen premio. En la caja B hay 12 boletos y 3 tienen premio. Si solo se puede sacar un boleto de una caja, ¿en cuál es más probable ganar y por qué?

| Opción | Texto | Qué revela |
| :---: | --- | --- |
| A | En la A, porque tiene más boletos que ganan. | compara cantidades de premios y no la parte del total |
| B | En la A, porque tiene más boletos en total. | cree que más boletos dan más chance |
| C | En las dos por igual, porque ambas dan premio. | cree que basta con que haya premios |
| D | En la B, porque su parte favorable es mayor. | **Correcta** |

**Resolución:** Lo que importa es qué parte de cada caja tiene premio. En la A es 4/20 = 1/5 y en la B es 3/12 = 1/4. Como 1/4 es mayor que 1/5, es más probable ganar sacando de la caja B.
