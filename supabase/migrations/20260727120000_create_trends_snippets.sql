create table if not exists public.trends_snippets (
  plataforma text primary key
    check (plataforma in ('tiktok', 'instagram_reels', 'youtube_shorts', 'linkedin')),
  periodo text not null,
  formatos text[] not null,
  ganchos text[] not null,
  senales text[] not null,
  evitar text[] not null,
  convenciones_copy text not null,
  updated_at timestamptz not null default now()
);

alter table public.trends_snippets enable row level security;

create policy "trends_snippets_public_read"
  on public.trends_snippets
  for select
  to anon, authenticated
  using (true);

-- Sin política de insert/update/delete a propósito: con RLS activo y ninguna
-- política de escritura, anon/authenticated quedan bloqueados por defecto.
-- Las ediciones desde el dashboard usan la service_role key, que sí bypassea
-- RLS. Un futuro ticket de panel admin agrega una política de escritura
-- autenticada cuando la necesite.

insert into public.trends_snippets
  (plataforma, periodo, formatos, ganchos, senales, evitar, convenciones_copy)
values
  (
    'tiktok',
    'mecánicas estables — línea base, no tendencias del mes',
    array[
      'Demostración en una sola toma, sin cortes, donde el resultado se ve antes de los 5 segundos.',
      'Listas en pantalla que avanzan más rápido de lo que se alcanzan a leer, para provocar que la pieza se vuelva a ver.',
      'Antes y después con el después mostrado primero.',
      'Respuesta a un comentario propio fijado, contestando algo que la audiencia preguntó de verdad.'
    ],
    array[
      'Afirmación numérica concreta que contradice lo que la audiencia da por hecho.',
      'Arrancar en la mitad de la acción, sin presentación ni saludo.',
      'Nombrar en voz alta al segmento exacto al que le hablas dentro de la primera frase.'
    ],
    array[
      'Porcentaje de reproducción completa: la pieza tiene que durar lo mínimo que necesita para cerrar la idea.',
      'Repeticiones, que suben cuando hay un detalle que solo se capta la segunda vez.',
      'Comentarios que discuten el contenido, no que felicitan.'
    ],
    array[
      'Intros con logo, cortina musical o presentación del canal.',
      'Bailes o transiciones que no tienen relación con lo que estás contando.',
      'Texto ubicado en los bordes superior e inferior, que la interfaz tapa.'
    ],
    'Pie de una línea que agregue contexto en lugar de repetir lo que ya se ve. Entre 3 y 5 etiquetas: una amplia del rubro, dos del subtema, ninguna genérica de las que se ponen para rellenar.'
  ),
  (
    'instagram_reels',
    'mecánicas estables — línea base, no tendencias del mes',
    array[
      'Pieza pensada para reenviarse por mensaje privado: algo que alguien quiere que otra persona en particular vea.',
      'Secuencia de cortes cortos donde cada corte desarma una objeción distinta.',
      'Tutorial a pantalla completa con una pausa marcada justo en el paso más difícil.',
      'Relato en primera persona sobre una decisión que salió mal y qué se cambió después.'
    ],
    array[
      'Frase que la audiencia querría reenviarle a alguien, escrita como un reproche cariñoso.',
      'Mostrar el error común dentro del cuadro en el primer segundo, todavía sin explicarlo.',
      'Prometer un criterio para decidir, no un listado de opciones.'
    ],
    array[
      'Reenvíos por mensaje privado, que es lo que más empuja alcance nuevo.',
      'Guardados, que indican que la pieza sirve como referencia para volver.',
      'Permanencia medida contra la duración de la propia pieza.'
    ],
    array[
      'Reaprovechar el mismo corte vertical de otra red con la marca de agua puesta.',
      'Audio de moda usado sin ninguna relación con el mensaje.',
      'Portadas que no se entienden si la pieza no se reproduce.'
    ],
    'La primera línea del texto funciona como titular, porque es lo único que se ve sin desplegar. Etiquetas al final o en el primer comentario, entre 5 y 8, mezclando comunidad y tema.'
  ),
  (
    'youtube_shorts',
    'mecánicas estables — línea base, no tendencias del mes',
    array[
      'Respuesta directa a una pregunta que la gente escribe en el buscador, con esa pregunta dicha textual.',
      'Fragmento que se entiende solo, sin haber visto nada anterior del canal.',
      'Comparación lado a lado de dos maneras de hacer lo mismo, con el costo de cada una.',
      'Explicación de un concepto apoyada en un objeto físico dentro del cuadro.'
    ],
    array[
      'Enunciar el problema con las mismas palabras que usaría alguien al buscarlo.',
      'Adelantar el resultado final en el primer segundo y recién después explicar cómo se llegó.',
      'Contradecir el consejo más repetido sobre el tema y dar el motivo en la misma frase.'
    ],
    array[
      'Relación entre quienes se quedan y quienes deslizan durante los primeros tres segundos.',
      'Duración media vista sobre duración total, bastante más que el número de reproducciones.',
      'Suscripciones atribuidas a la pieza, que muestran que sirvió de puerta de entrada.'
    ],
    array[
      'Pedir suscripción antes de haber entregado algo de valor.',
      'Cortar la idea por la mitad para forzar que vean otra pieza.',
      'Reutilizar la miniatura del formato largo, que acá no cumple ninguna función.'
    ],
    'Título descriptivo y buscable, con las palabras que alguien tipearía, sin signos de exclamación. Descripción de una o dos líneas que amplíe el tema. Máximo 3 etiquetas.'
  ),
  (
    'linkedin',
    'mecánicas estables — línea base, no tendencias del mes',
    array[
      'Publicación de texto que abre con una decisión profesional concreta y el resultado que produjo.',
      'Desglose de un proceso interno que la mayoría de las empresas mantiene puertas adentro.',
      'Análisis de un error caro propio, con el número real de lo que costó.',
      'Documento de varias páginas donde cada página sostiene un solo argumento.'
    ],
    array[
      'Abrir con una cifra del propio trabajo y la decisión que la produjo.',
      'Nombrar una práctica aceptada del sector y declarar por qué la dejaste de usar.',
      'Plantear la pregunta que hizo un cliente y que nadie del sector responde en público.'
    ],
    array[
      'Lectura sostenida antes de tocar ver más, que depende casi por completo de las tres primeras líneas.',
      'Comentarios extensos de gente del sector, que pesan mucho más que las reacciones.',
      'Republicaciones con comentario agregado.'
    ],
    array[
      'Historias de superación sin relación con el trabajo, puestas para forzar emoción.',
      'Frases motivacionales de una línea separadas por saltos de párrafo vacíos.',
      'Enlaces externos dentro del cuerpo, que recortan el alcance frente a dejarlos en comentarios.'
    ],
    'Las tres primeras líneas deciden todo, porque el resto queda detrás de ver más. Párrafos de una o dos líneas con aire entre ellos. Sin etiquetas, o tres como máximo al final. El enlace va en el primer comentario.'
  )
on conflict (plataforma) do nothing;
