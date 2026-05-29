import { describe, expect, it } from "vitest";
import {
  orientacaoFromSankeyNodeName,
  orientacaoToColor,
} from "../src/utils/colors";

describe("orientacaoToColor", () => {
  it("mapeia orientação 1 para vermelho e 6 para azul", () => {
    expect(orientacaoToColor(1).toLowerCase()).toMatch(/d73027|215,\s*48,\s*39/);
    expect(orientacaoToColor(6).toLowerCase()).toMatch(/4575b4|69,\s*117,\s*180/);
  });
});

describe("orientacaoFromSankeyNodeName", () => {
  it("lê dígito de orientação na posição legada", () => {
    expect(orientacaoFromSankeyNodeName("2004-03")).toBe(3);
  });
});
