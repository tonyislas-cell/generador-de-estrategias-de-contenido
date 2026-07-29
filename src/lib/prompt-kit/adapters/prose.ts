export const bullets = (items: string[]): string =>
  items.map((item) => `- ${item}`).join("\n");

export const present = (value: string | null): value is string => value !== null;

/** Une líneas dentro de una sección, descartando las que no aplican. */
export const lines = (values: (string | null)[]): string =>
  values.filter(present).join("\n");

/** Une secciones con una línea en blanco entre ellas, descartando las que no aplican. */
export const sections = (values: (string | null)[]): string =>
  values.filter(present).join("\n\n");
