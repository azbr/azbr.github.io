import { describe, expect, it } from "vitest";
import { RIO_CAPITAL_ID } from "../src/config";
import { isRioCapital, normalizeCityName } from "../src/utils/geo";

describe("normalizeCityName", () => {
  it("remove acentos e normaliza caixa", () => {
    expect(normalizeCityName("Rio de Janeiro")).toBe("rio de janeiro");
  });
});

describe("isRioCapital", () => {
  it("reconhece pelo id legado", () => {
    expect(isRioCapital(RIO_CAPITAL_ID)).toBe(true);
  });

  it("reconhece pelo nome", () => {
    expect(isRioCapital("9999", "Rio de Janeiro")).toBe(true);
  });

  it("rejeita outros municípios", () => {
    expect(isRioCapital("3591", "Angra dos Reis")).toBe(false);
  });
});
