import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useWizard } from "./useWizard";
import { loadWizardState } from "./storage";

describe("useWizard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts on the contexto step once hydrated", async () => {
    const { result } = renderHook(() => useWizard());

    await waitFor(() => expect(result.current.status).toBe("in-progress"));
    expect(result.current.currentStep?.id).toBe("contexto");
    expect(result.current.canGoBack).toBe(false);
  });

  it("advances through steps and persists progress on every change", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => {
      result.current.updateAnswers({
        nicho: "Finanzas personales",
        audiencia: "Freelancers 25-35",
        plataformas: ["tiktok"],
        tono: "cercano",
      });
    });
    act(() => result.current.goNext());

    expect(result.current.currentStep?.id).toBe("objetivo");
    expect(loadWizardState()?.currentStepId).toBe("objetivo");
    expect(loadWizardState()?.answers.nicho).toBe("Finanzas personales");
  });

  it("skips the oferta step for the autoridad path and reaches summary", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => {
      result.current.updateAnswers({ objetivo: "autoridad" });
    });
    // objetivo -> formato -> recursos -> gancho -> summary (4 more goNext calls
    // from contexto, since objetivo was set on the contexto step's render pass)
    act(() => result.current.goNext()); // contexto -> objetivo
    act(() => result.current.goNext()); // objetivo -> formato
    act(() => result.current.goNext()); // formato -> recursos
    act(() => result.current.goNext()); // recursos -> gancho
    act(() => result.current.goNext()); // gancho -> summary

    expect(result.current.status).toBe("summary");
    expect(result.current.steps.map((s) => s.id)).not.toContain("oferta");
  });

  it("includes the oferta step for the lanzamiento path", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "lanzamiento" }));

    expect(result.current.steps.map((s) => s.id)).toContain("oferta");
  });

  it("goBack moves to the previous step without losing later answers", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    act(() => result.current.goNext()); // -> objetivo
    act(() => result.current.updateAnswers({ formato: "camara" }));
    act(() => result.current.goNext()); // -> formato

    act(() => result.current.goBack()); // -> objetivo
    expect(result.current.currentStep?.id).toBe("objetivo");
    expect(result.current.answers.formato).toBe("camara");
  });

  it("goBack from summary returns to the last step", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 5; i++) act(() => result.current.goNext());
    expect(result.current.status).toBe("summary");

    act(() => result.current.goBack());
    expect(result.current.status).toBe("in-progress");
    expect(result.current.currentStep?.id).toBe("gancho");
  });

  it("resumes from localStorage on a fresh hook instance (reload simulation)", async () => {
    const first = renderHook(() => useWizard());
    await waitFor(() => expect(first.result.current.status).toBe("in-progress"));

    act(() => {
      first.result.current.updateAnswers({ nicho: "Finanzas personales" });
    });
    act(() => first.result.current.goNext());

    const second = renderHook(() => useWizard());
    await waitFor(() => expect(second.result.current.status).toBe("in-progress"));

    expect(second.result.current.currentStep?.id).toBe("objetivo");
    expect(second.result.current.answers.nicho).toBe("Finanzas personales");
  });

  it("restart clears answers and resets a freshly-hydrated instance to the start", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ nicho: "x" }));
    act(() => result.current.goNext());
    act(() => result.current.restart());

    expect(result.current.answers).toEqual({});
    expect(result.current.currentStep?.id).toBe("contexto");

    const reloaded = renderHook(() => useWizard());
    await waitFor(() => expect(reloaded.result.current.status).toBe("in-progress"));
    expect(reloaded.result.current.answers).toEqual({});
    expect(reloaded.result.current.currentStep?.id).toBe("contexto");
  });

  it("goNext from the summary reaches the modelos status, then the result status", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 5; i++) act(() => result.current.goNext());
    expect(result.current.status).toBe("summary");

    act(() => result.current.goNext());
    expect(result.current.status).toBe("modelos");

    act(() => result.current.goNext());
    expect(result.current.status).toBe("result");
  });

  it("reports no current step while on the modelos or result screens", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 6; i++) act(() => result.current.goNext());
    expect(result.current.status).toBe("modelos");
    expect(result.current.currentStep).toBeNull();
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.canGoBack).toBe(false);

    act(() => result.current.goNext());
    expect(result.current.status).toBe("result");

    // Guards the index arithmetic: a position that is not a step must not
    // resolve to steps[0] via findIndex returning -1.
    expect(result.current.currentStep).toBeNull();
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.canGoBack).toBe(false);
  });

  it("stays on the result screen when goNext is called again", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 8; i++) act(() => result.current.goNext());

    expect(result.current.status).toBe("result");
  });

  it("goBack from the result returns to modelos, and from modelos to the summary", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 7; i++) act(() => result.current.goNext());
    expect(result.current.status).toBe("result");

    act(() => result.current.goBack());
    expect(result.current.status).toBe("modelos");

    act(() => result.current.goBack());
    expect(result.current.status).toBe("summary");
  });

  it("keeps the selected modelos when going back from the result to add more", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 5; i++) act(() => result.current.goNext());
    expect(result.current.status).toBe("summary");

    act(() => result.current.goNext());
    expect(result.current.status).toBe("modelos");
    act(() => result.current.setModelos(["claude", "chatgpt"]));
    act(() => result.current.goNext());
    expect(result.current.status).toBe("result");

    act(() => result.current.goBack());
    expect(result.current.status).toBe("modelos");
    // The whole point of going back here is adding models without losing the
    // ones already picked — nothing should have cleared the selection.
    expect(result.current.modelos).toEqual(["claude", "chatgpt"]);

    act(() => result.current.setModelos(["claude", "chatgpt", "gemini"]));
    act(() => result.current.goNext());
    expect(result.current.status).toBe("result");
    expect(result.current.modelos).toEqual(["claude", "chatgpt", "gemini"]);
  });

  it("resumes on the result screen after a reload", async () => {
    const first = renderHook(() => useWizard());
    await waitFor(() => expect(first.result.current.status).toBe("in-progress"));

    act(() => first.result.current.updateAnswers({ objetivo: "autoridad" }));
    for (let i = 0; i < 7; i++) act(() => first.result.current.goNext());
    expect(first.result.current.status).toBe("result");

    const second = renderHook(() => useWizard());

    await waitFor(() => expect(second.result.current.status).toBe("result"));
  });

  it("defaults duracion to 14_dias", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    expect(result.current.duracion).toBe("14_dias");
  });

  it("setDuracion updates the duration and persists it", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.setDuracion("1_mes"));

    expect(result.current.duracion).toBe("1_mes");
    expect(loadWizardState()?.duracion).toBe("1_mes");
  });

  it("resumes the saved duration after a reload", async () => {
    const first = renderHook(() => useWizard());
    await waitFor(() => expect(first.result.current.status).toBe("in-progress"));

    act(() => first.result.current.setDuracion("1_mes"));

    const second = renderHook(() => useWizard());
    await waitFor(() => expect(second.result.current.status).toBe("in-progress"));

    expect(second.result.current.duracion).toBe("1_mes");
  });

  it("falls back to 14_dias when resuming a state saved before duracion existed", async () => {
    window.localStorage.setItem(
      "viral-content-kit:wizard:v1",
      JSON.stringify({ answers: {}, currentStepId: "contexto" })
    );

    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    expect(result.current.duracion).toBe("14_dias");
  });

  it("restart resets duracion back to the default", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.setDuracion("1_mes"));
    act(() => result.current.restart());

    expect(result.current.duracion).toBe("14_dias");
  });

  it("defaults modelos to an empty array", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    expect(result.current.modelos).toEqual([]);
  });

  it("setModelos updates the selection and persists it", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.setModelos(["claude", "chatgpt"]));

    expect(result.current.modelos).toEqual(["claude", "chatgpt"]);
    expect(loadWizardState()?.modelos).toEqual(["claude", "chatgpt"]);
  });

  it("resumes the saved modelos after a reload", async () => {
    const first = renderHook(() => useWizard());
    await waitFor(() => expect(first.result.current.status).toBe("in-progress"));

    act(() => first.result.current.setModelos(["gemini"]));

    const second = renderHook(() => useWizard());
    await waitFor(() => expect(second.result.current.status).toBe("in-progress"));

    expect(second.result.current.modelos).toEqual(["gemini"]);
  });

  it("falls back to an empty array when resuming a state saved before modelos existed", async () => {
    window.localStorage.setItem(
      "viral-content-kit:wizard:v1",
      JSON.stringify({ answers: {}, currentStepId: "contexto" })
    );

    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    expect(result.current.modelos).toEqual([]);
  });

  it("restart resets modelos back to the default", async () => {
    const { result } = renderHook(() => useWizard());
    await waitFor(() => expect(result.current.status).toBe("in-progress"));

    act(() => result.current.setModelos(["claude", "gemini"]));
    act(() => result.current.restart());

    expect(result.current.modelos).toEqual([]);
  });
});
