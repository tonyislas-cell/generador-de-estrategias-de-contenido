-- Instagram bajó el tope de etiquetas de 30 a 5 por publicación: anunciado en
-- diciembre de 2025 y desplegado durante enero de 2026. El seed original de
-- `trends_snippets` recomienda «entre 5 y 8», que a partir de ese cambio es un
-- consejo que no se puede ejecutar: las etiquetas 6, 7 y 8 no entran.
--
-- Se corrige solo esta fila y solo si sigue teniendo el texto original. Si
-- alguien ya la editó desde el panel de admin, su versión gana: una migración
-- no debe pisar una edición manual posterior.
--
-- Fuentes en modificaciones/03-hoja-de-plataforma-2026.md.
update public.trends_snippets
set
  convenciones_copy = 'La primera línea del texto funciona como titular, porque es lo único que se ve sin desplegar. Entre 3 y 5 etiquetas —el tope de la plataforma es 5— al final o en el primer comentario, mezclando comunidad y tema, todas específicas.',
  updated_at = now()
where
  plataforma = 'instagram_reels'
  and convenciones_copy = 'La primera línea del texto funciona como titular, porque es lo único que se ve sin desplegar. Etiquetas al final o en el primer comentario, entre 5 y 8, mezclando comunidad y tema.';
