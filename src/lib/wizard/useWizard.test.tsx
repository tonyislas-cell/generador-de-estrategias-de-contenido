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
});
