-- El video largo de YouTube entra como plataforma propia.
--
-- No es una variante de `youtube_shorts`: cambia la cadencia (un video cada dos
-- semanas), el entregable (primero el par título/miniatura, después el guion) y
-- las señales que se persiguen (el CTR consigue el clic, la retención consigue
-- la siguiente impresión). El seed de `youtube_shorts` llega a decir que la
-- miniatura del formato largo «acá no cumple ninguna función», así que
-- mezclarlos daría consejos contradictorios.

alter table public.trends_snippets
  drop constraint if exists trends_snippets_plataforma_check;

alter table public.trends_snippets
  add constraint trends_snippets_plataforma_check
  check (
    plataforma in (
      'tiktok',
      'instagram_reels',
      'youtube_shorts',
      'youtube_largo',
      'linkedin'
    )
  );

insert into public.trends_snippets
  (plataforma, periodo, formatos, ganchos, senales, evitar, convenciones_copy)
values
  (
    'youtube_largo',
    'mecánicas estables — línea base, no tendencias del mes',
    array[
      'Desglose de un caso propio que salió mal, con el número real de lo que costó y la decisión que lo produjo.',
      'Comparación de dos formas de resolver el mismo problema, con el costo de cada una puesto sobre la mesa.',
      'Proceso interno completo, de los que la mayoría del sector mantiene puertas adentro.',
      'Serie con nombre propio, donde cada video cierra abriendo el siguiente: la contribución a la sesión es señal principal en formato largo.'
    ],
    array[
      'Entrar directo al caso en el primer segundo, sin saludo, sin presentación y sin decir el nombre del canal.',
      'Adelantar el resultado y dedicar el video a explicar cómo se llegó.',
      'Nombrar la decisión difícil en la primera frase y recién después dar el contexto.'
    ],
    array[
      'Porcentaje de clics de las impresiones, que decide si el video existe.',
      'Retención en el primer minuto, y el sostén hasta la mitad.',
      'Duración media reproducida contra la duración total, muy por encima del número de reproducciones.',
      'Comentarios con contenido, no felicitaciones.'
    ],
    array[
      'Miniatura con cara exagerada, flechas rojas o círculos rojos.',
      'Título que promete algo que el video no entrega en los primeros dos minutos.',
      'Recortar el video en vertical y publicarlo con la interfaz de YouTube encima.',
      'Estirar a 15 minutos lo que se cuenta en 8.'
    ],
    'Título descriptivo y buscable, escrito como una persona lo preguntaría de verdad y no como SEO de 2019. Los primeros 100 caracteres de la descripción reflejan esa misma pregunta. Debajo, las marcas de tiempo de los capítulos, una por línea.'
  )
on conflict (plataforma) do nothing;
