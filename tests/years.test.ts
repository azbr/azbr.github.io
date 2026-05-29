import { describe, expect, it } from "vitest";
import { listarAnos, parseSankeyNodeName } from "../src/utils/years";

describe("listarAnos", () => {
  it("gera anos eleitorais com intervalo de 4 anos", () => {
    expect(listarAnos(2004, 4)).toEqual([2004, 2008, 2012, 2016]);
  });
});

describe("parseSankeyNodeName", () => {
  it("extrai ano e orientação de nó no formato AAAA-OO", () => {
    expect(parseSankeyNodeName("2008-03")).toEqual({
      year: 2008,
      orientacao: 3,
    });
  });

  it("retorna null para formato inválido", () => {
    expect(parseSankeyNodeName("invalid")).toBeNull();
  });
});
