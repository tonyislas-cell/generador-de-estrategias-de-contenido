import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearWizardState, loadWizardState, saveWizardState } from "./storage";

describe("wizard storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been saved yet", () => {
    expect(loadWizardState()).toBeNull();
  });

  it("round-trips a saved state", () => {
    saveWizardState({
      answers: { nicho: "Finanzas personales" },
      currentStepId: "objetivo",
      duracion: "1_mes",
    });

    expect(loadWizardState()).toEqual({
      answers: { nicho: "Finanzas personales" },
      currentStepId: "objetivo",
      duracion: "1_mes",
    });
  });

  it("loads a state saved before duracion existed without it", () => {
    window.localStorage.setItem(
      "viral-content-kit:wizard:v1",
      JSON.stringify({ answers: {}, currentStepId: "contexto" })
    );

    expect(loadWizardState()?.duracion).toBeUndefined();
  });

  it("returns null and doesn't throw when the stored value is corrupt JSON", () => {
    window.localStorage.setItem("viral-content-kit:wizard:v1", "{not json");

    expect(loadWizardState()).toBeNull();
  });

  it("returns null when the stored value doesn't look like wizard state", () => {
    window.localStorage.setItem(
      "viral-content-kit:wizard:v1",
      JSON.stringify({ somethingElse: true })
    );

    expect(loadWizardState()).toBeNull();
  });

  it("clearWizardState removes the saved state", () => {
    saveWizardState({ answers: { nicho: "x" }, currentStepId: "contexto" });
    clearWizardState();

    expect(loadWizardState()).toBeNull();
  });

  it("saveWizardState fails silently if localStorage throws (e.g. quota exceeded)", () => {
    const setItemSpy = vi
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    expect(() =>
      saveWizardState({ answers: {}, currentStepId: "contexto" })
    ).not.toThrow();

    setItemSpy.mockRestore();
  });
});
