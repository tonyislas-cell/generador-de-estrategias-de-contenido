import { NOMBRE_DE_MODELO } from "./adapters";
import { plataformaLabel } from "@/lib/wizard/labels";
import { DURACION_CONFIG, type PromptKit } from "./types";

/**
 * Junta todos los bloques de un kit en un único documento Markdown, separados
 * por reglas horizontales — pensado para leerse fuera de la app, así que
 * repite el mismo encabezado que ya se ve en pantalla en vez de asumir
 * contexto.
 */
export function buildKitMarkdown(kit: PromptKit): string {
  const encabezado = [
    `# Kit de prompts — ${NOMBRE_DE_MODELO[kit.modelo]}`,
    `Plan de ${DURACION_CONFIG[kit.duracion].etiqueta} · ${plataformaLabel(kit.plataformaPrincipal)}`,
  ].join("\n\n");

  const bloques = kit.bloques.map((bloque) =>
    [`## ${bloque.titulo}`, `_${bloque.descripcion}_`, bloque.contenido].join("\n\n")
  );

  return [encabezado, ...bloques].join("\n\n---\n\n");
}

/** El modelo ya es un slug válido; la duración solo necesita guiones en vez de guiones bajos. */
export function kitFileName(kit: PromptKit): string {
  return `kit-prompts-${kit.modelo}-${kit.duracion.replace(/_/g, "-")}.md`;
}
