import { describe, expect, it } from "vitest";
import { conVoseo } from "./voseo";

/**
 * El guarda se prueba a sí mismo porque ya falló en silencio una vez: escrito
 * con `\b`, ninguna forma de imperativo voseante enganchaba, y el test que lo
 * usaba pasaba sin poder fallar. Un guarda sin test es una opinión.
 */
describe("conVoseo", () => {
  it.each([
    "Mirá el video antes de publicar",
    "Hacé la pieza en una sola toma",
    "Poné el texto arriba",
    "Empezá por el gancho",
    "Dejá el enlace en el comentario",
    "Cortá en seco cuando cae el pago",
    "Tenés que grabar el audio de nuevo",
    "Vos sos quien decide",
    "Contame qué pasó",
    "Invitame un café",
    "Marcame los tres que elegirías",
  ])("catches %j", (frase) => {
    expect(conVoseo([frase])).toEqual([frase]);
  });

  it.each([
    "Mira el video antes de publicar",
    "Haz la pieza en una sola toma",
    "Empieza por el gancho",
    "Elige uno y sigue",
    "Tienes que grabar el audio de nuevo",
    "Invítame un café",
    "Márcame los tres que elegirías",
    "El plan es de catorce días",
  ])("leaves correct tuteo alone: %j", (frase) => {
    expect(conVoseo([frase])).toEqual([]);
  });

  it.each([
    "Mira cómo escribí mis respuestas más arriba",
    "Si repites literal lo que te escribí, no sirve",
    "Elegí este ángulo la semana pasada y no funcionó",
  ])("leaves the first-person preterite alone: %j", (frase) => {
    // «Escribí» y «elegí» son a la vez imperativo voseante y pretérito de
    // primera persona. Marcarlos daría falsos positivos sobre tuteo correcto,
    // así que el guarda los deja pasar a propósito.
    expect(conVoseo([frase])).toEqual([]);
  });

  it("does not fire on a voseo form embedded inside a longer word", () => {
    // «Sos» dentro de «sostiene» no es voseo. Sin límites de palabra el guarda
    // sería ruido y alguien terminaría desactivándolo.
    expect(conVoseo(["Lo sostiene con un argumento"])).toEqual([]);
    expect(conVoseo(["La conversación mirándolo de cerca"])).toEqual([]);
  });
});
