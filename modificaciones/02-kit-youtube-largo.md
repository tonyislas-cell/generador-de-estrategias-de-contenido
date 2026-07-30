# 02 — Kit de YouTube largo

Requiere `00-base-compartida.md` cargado. **No comparte esquema con el kit vertical y no debe mezclarse con él.**

---

## Lo primero: la cadencia

Un video largo no cabe en 30 a 60 minutos de producción. Con la carga que ya tienes, esto es lo que aguanta:

- **1 video cada dos semanas.** Un guion de 8 a 12 minutos, grabado en una sola sesión, editado en dos bloques.
- Los 3 verticales por semana **no se tocan**. Son otro plan.
- El video largo es el pilar; los verticales de esa quincena pueden salir de él, **regrabando el gancho**, nunca recortando el largo con subtítulos encima.

Si en dos quincenas seguidas no alcanzas a publicar el largo, el problema es la cadencia, no tú. Bájalo a uno por mes antes de bajarle la calidad.

---

## Por qué el esquema es distinto

Un vertical se gana con la pieza ya reproduciéndose: los primeros 3 segundos. Un video largo se gana **antes** de reproducirse: título y miniatura son la decisión completa del espectador, y son una sola decisión, no dos. Después se defiende por minutos, no por segundos.

Por eso acá el orden es: primero el par título/miniatura, luego el guion. Nunca al revés. Si el par no se sostiene solo, el video no se hace.

---

## Hoja de plataforma — YouTube

<hoja_youtube revisada="[FECHA]">
- Resolución y relación de aspecto de exportación: [VERIFICAR] · Fuente: [URL]
- Miniatura: [VERIFICAR dimensiones, peso máximo y formato] · Fuente: [URL]
- Título: [VERIFICAR límite de caracteres y cuántos se ven en móvil antes de cortarse] · Fuente: [URL]
- Descripción: [VERIFICAR caracteres visibles antes del «más»] · Fuente: [URL]
- Capítulos: [VERIFICAR requisitos para que se activen — formato de marcas de tiempo, mínimo de capítulos, duración mínima de cada uno] · Fuente: [URL]
- Subtítulos: [VERIFICAR si conviene subir archivo propio o dejar los automáticos] · Fuente: [URL]

### Señales que persigo, en orden
1. Porcentaje de clics de las impresiones (decide si el video existe).
2. Retención en el primer minuto.
3. Duración media de la reproducción contra la duración total.
4. Comentarios con contenido.

### Prohibido
- Miniatura con cara exagerada, flechas rojas, círculos rojos.
- Título que promete algo que el video no entrega en los primeros dos minutos.
- Recortar este video en vertical y publicarlo con la interfaz de YouTube encima.
</hoja_youtube>

---

## Prompt A — Par título/miniatura

_Pégalo primero. Sin este paso resuelto, no hay guion._

```
Video largo número [n]. Tema: [en una línea].
Estado: [pega el <estado_youtube> del video anterior, o "primero"].

No escribas guion todavía.

Dame 5 pares título/miniatura. Formato exacto:

[n]. TÍTULO: … (≤ el límite de la hoja, y legible en móvil sin cortarse en la parte que importa)
    MINIATURA: qué se ve, en una frase. Objetos y encuadre concretos, nada de "expresión de sorpresa".
    TEXTO EN MINIATURA: ≤ 4 palabras, y no repite las palabras del título.
    PROMESA: qué se lleva el espectador. Una línea.
    DÓNDE SE PAGA: en qué minuto del video se cumple esa promesa.

Reglas:
- Los 5 prometen cosas distintas, no el mismo video con otro nombre.
- La miniatura tiene que grabarse con lo que tengo: celular, mi cara, objetos que ya
  están en el inventario. Nada de gráficos que yo no pueda hacer.
- Si la promesa no se puede pagar antes del minuto 3, el par se descarta.
- Ninguno usa las palabras de <formulas_prohibidas> ni los <cliches_del_nicho>.

Después de los 5, marca el que escogerías y por qué. Para ahí.
```

---

## Prompt B — Guion largo

_Pégalo cuando ya escogiste el par._

```
Voy con el par [n]. Escribe el guion.

### Video [n] — {título elegido}
**Duración objetivo:** {n} minutos.
**Promesa:** la del par elegido, textual.
**Se paga en:** minuto {n}.

**Primer minuto, palabra por palabra:**
Sin presentación, sin «bienvenidos», sin decir mi nombre. Se entra al caso.
Al final del primer minuto tiene que estar claro qué se lleva el espectador y por qué
le conviene quedarse. Escríbelo completo, no en viñetas.

**Cuerpo, por bloques:**
| minuto | qué se dice (idea, no palabra por palabra) | qué se ve | por qué no se van aquí |
| 1-3 | | | |
| 3-… | | | |

- Cada bloque cierra abriendo el siguiente. Nada de bloques que terminan cerrados.
- Marca los dos minutos donde creo que la gente se va, y qué pusiste ahí para retenerla.
- Al menos un bloque muestra criterio en un caso difícil, con un dato del inventario.

**Capítulos:** marcas de tiempo con nombre, según los requisitos de la hoja.
**Tomas de apoyo:** lista de lo que tengo que grabar aparte. Solo cosas que pueda
grabar solo, con celular, en la misma sesión. Máximo 5.
**Cierre:** una sola llamada a la acción, de conversación o de guardado. Cero venta.
**Descripción:** primera línea como titular, y las marcas de tiempo abajo.
**Derivados verticales:** 2 ideas que salen de este video, cada una con su gancho nuevo
regrabado. No son recortes: son piezas nuevas que usan el mismo material.
**Por qué funciona:** una línea, honesta.
```

---

## Verificación

```
<verificacion>
Imprime esto. Corrige antes de mandarme la respuesta y deja las celdas en OK.

| duración objetivo | suma del minutaje | minuto donde se paga la promesa | caracteres del título | palabras en la miniatura | tomas de apoyo | datos fuera del inventario |

Y en una línea cada uno:
- ¿El título promete algo que el video no entrega antes del minuto 3?
- ¿La miniatura se puede grabar sola, con celular y con lo que hay?
- ¿El primer minuto se presenta a sí mismo en vez de entrar al caso?
- ¿Algún bloque cierra sin abrir el siguiente? Cuál.
- Prueba del reemplazo: ¿este video funcionaría igual en otro nicho?
</verificacion>
```

---

## Cierre del ciclo

Va al inicio del Prompt A del video siguiente. Sin esto, el kit no aprende nada.

```
<resultados_video_anterior>
Impresiones: __ · Clics de las impresiones: __% · Retención al minuto 1: __%
Duración media reproducida: __ de __ min · Comentarios con contenido: __
Minuto exacto de la caída más grande: __
</resultados_video_anterior>

Antes de darme los 5 pares, dime en tres líneas:
1. Si el problema fue el par título/miniatura o el video. El porcentaje de clics
   contra la retención lo dice.
2. Qué cambias por eso.
3. Qué dejas igual.
Si los números no alcanzan para concluir, dilo en vez de inventar una lectura.
```

```
<estado_youtube>
- Títulos y promesas usadas: …
- Temas quemados: …
- Datos del inventario ya gastados en video largo: …
- Pendiente: …
</estado_youtube>
```
