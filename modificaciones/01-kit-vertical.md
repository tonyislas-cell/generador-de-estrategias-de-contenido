# 01 — Kit vertical (Instagram Reels + TikTok)

Requiere `00-base-compartida.md` cargado. Tres prompts: hoja de plataforma (una vez), banco de ángulos (una vez por semana), guiones (una vez por semana).

Se cambió respecto al kit anterior: idear y escribir son turnos separados, la dirección de cámara es una tabla con segundos, la verificación se imprime, y la semana 2 arranca con tus números reales.

---

## Hoja de plataforma

Va en las instrucciones del proyecto, junto a la base. **Solo mecánicas comprobables.** Cada línea lleva fecha y fuente, o no entra.

<hoja_de_plataforma revisada="[FECHA]">

### Instagram Reels
- Duración: [VERIFICAR — rango permitido y rango recomendado por Instagram] · Fuente: [URL]
- Relación de aspecto y resolución de exportación: [VERIFICAR] · Fuente: [URL]
- Zona segura: [VERIFICAR px o % arriba y abajo que tapa la interfaz] · Fuente: [URL]
- Portada: [VERIFICAR si se elige cuadro, si se puede subir imagen aparte, si recorta distinto en el feed y en la cuadrícula] · Fuente: [URL]
- Pie: [VERIFICAR caracteres visibles antes del «más»] · Fuente: [URL]
- Etiquetas: 5 a 8, al final o en el primer comentario, mezclando comunidad y tema.
- Audio: [VERIFICAR reglas de audio original vs. licenciado y si el audio licenciado limita algo] · Fuente: [URL]

### TikTok
- Duración: [VERIFICAR] · Fuente: [URL]
- Zona segura: [VERIFICAR — la interfaz tapa el lado derecho y la franja del pie] · Fuente: [URL]
- Portada: [VERIFICAR si se elige cuadro y si admite texto propio] · Fuente: [URL]
- Pie: [VERIFICAR caracteres] · Fuente: [URL]

### Señales que persigo, en orden
1. Retención a 3 s.
2. Reproducción completa medida contra la duración de la pieza.
3. Reenvíos por mensaje privado.
4. Guardados.

### Quemado, prohibido
- Recortar un video de otra red y publicarlo con la marca de agua puesta.
- Audio de moda sin relación con el mensaje.
- Portadas que no se entienden si la pieza no se reproduce.

### Reaprovechamiento legítimo
Si una pieza se publica en las dos redes: se exporta limpio del original, se regraba el gancho para cada red, y se hace portada nueva. Nunca el mismo archivo con la interfaz de la otra red encima.
</hoja_de_plataforma>

---

## Prompt A — Banco de ángulos

_Pégalo al inicio de cada semana._

```
Semana [N] de [TOTAL]. Misión de esta semana: [una línea].
Estado actual: [pega el bloque <estado> con el que cerraste la semana pasada. Si es la primera, escribe "primera semana"].

No escribas guiones todavía.

Dame 12 ángulos, uno por línea, en este formato exacto:
[n]. [creencia concreta que ataca] → [gancho en una frase, máximo 12 palabras] → [formato: cámara o carrusel] → [dato del inventario que usa]

Reglas:
- Los 12 atacan creencias distintas. Nada de variaciones del mismo ángulo.
- Ningún gancho abre con la misma estructura sintáctica que otro.
- Ninguno repite un ángulo o gancho del <estado>.
- Cada uno declara qué dato del <inventario> lo sostiene. Si no hay dato, el ángulo no entra.

Después de los 12, marca los 3 que tú escogerías y por qué, en una línea cada uno.
Para ahí. Yo escojo los 3 definitivos.
```

---

## Prompt B — Guiones de la semana

_Pégalo cuando ya escogiste los 3._

```
Voy con los ángulos [n], [n], [n]. Escribe las 3 piezas.

Empieza con:

## Semana [N] — [nombre]
**Idea que empuja la semana:** una oración.
**Umbral que me puse:** [lo pongo yo, no lo inventes].

Después las 3 piezas. Cada una declara su formato en la primera línea y usa SOLO
los campos de ese formato.
```

### Estructura — Cámara

```
### Pieza {n} — {título interno}
**Formato:** Cámara
**Publicar:** {día} · **Se graba junto con:** {pieza o "sola"}
**Ángulo:** una línea.
**Duración objetivo:** {n} s — dentro del rango de la hoja de plataforma.

**Tres ganchos, palabra por palabra:**
- A: … (≤ 12 palabras)
- B: … (≤ 12 palabras)
- C: … (≤ 12 palabras)
Los tres abren con estructura distinta. Marca cuál recomiendas y por qué, en una línea.

**Tabla de beats:**
| s | qué se dice, palabra por palabra | texto en pantalla (≤ 6 palabras) | corte |
| 0-3 | | | — |
| 3-… | | | |
**Suma:** {n} s. Tiene que dar exactamente la duración objetivo. Si no da, reescribe.

**Producción:**
- Encuadre: {plano y altura de cámara}
- Acción concreta durante el gancho: {qué agarras, giras o sueltas — algo que se vea, no un estado de ánimo}
- Tomas: {n} · Cortes: {n}
- Texto fuera de la zona segura declarada en la hoja de plataforma.
- Cuadro de portada: segundo {n}, y qué tiene que verse en él.

**Pie de publicación:** primera línea como titular. Etiquetas según la hoja.
**Primer comentario:** {contenido, o "ninguno"}
**Llamada a la acción:** una sola.
**Delta por red:** qué cambia entre Instagram y TikTok. Si no cambia nada, dilo.
**Por qué funciona:** una línea, honesta.
```

### Estructura — Texto / carrusel

```
### Pieza {n} — {título interno}
**Formato:** Texto / carrusel
**Publicar:** {día}
**Ángulo:** una línea.
**Lámina 1 (portada):** ≤ 10 palabras. Es el gancho y es lo único que se ve en el feed.
**Láminas 2 a N:** numeradas, ≤ 25 palabras cada una, una idea por lámina.
**Lámina del giro:** en cuál cambia la idea.
**Lámina final:** la llamada a la acción.
**Pie de publicación:** primera línea como titular. Etiquetas según la hoja.
**Por qué funciona:** una línea, honesta.

Sin guion hablado y sin indicaciones de cámara. Acá no hay video.
```

---

## Verificación

Va al final del Prompt B. **Se imprime.** Una revisión silenciosa no se puede auditar.

```
<verificacion>
Imprime esta tabla al final. Si una celda falla, corrige la pieza antes de mandarme
la respuesta y deja la celda en OK. No me expliques la corrección.

| pieza | duración objetivo | suma de beats | palabras del gancho recomendado | palabras máx por lámina | datos fuera del inventario | ganchos que abren igual que otro |

Después, en una línea cada uno:
- Prueba del reemplazo: ¿alguna pieza funcionaría igual en otro nicho? Cuál y qué cambiaste.
- Clichés del nicho: ¿usaste alguno de los tres? Cuál.
- Producción: ¿alguna pasa de 60 minutos o necesita a otra persona? Cuál y cómo la simplificaste.
</verificacion>
```

---

## Cierre y arrastre

```
<estado>
- Ganchos usados, por estructura de apertura: …
- Ángulos quemados: …
- Datos del inventario ya gastados: …
- Piezas publicadas y en qué red: …
- Pendiente para la semana que viene: …
</estado>
```

Guárdalo en un archivo, no en el chat. Si la conversación se cae, el arrastre se pierde.

---

## Cierre del ciclo

Esto es lo único que hace que el plan se ajuste de verdad a lo que premia la plataforma. Va al inicio del Prompt A de la semana siguiente.

```
<resultados_semana_anterior>
| pieza | red | retención 3 s | reproducción completa | reenvíos | guardados | comentarios |

La peor pieza fue: [cuál] · Lo que creo que pasó: [tu lectura, en una línea].
</resultados_semana_anterior>

Antes de darme los 12 ángulos, dime en tres líneas qué cambias por estos números y
qué dejas igual. Si los números no alcanzan para concluir nada, dilo en vez de
inventar una lectura.
```
