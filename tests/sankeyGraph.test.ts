import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RIO_CAPITAL_ID } from "../src/config";
import { graphFromCsv, graphFromVereadores } from "../src/data/sankeyGraph";
import { listarAnos } from "../src/utils/years";

describe("graphFromCsv", () => {
  it("filtra links fora dos anos do mapa", () => {
    const rows = [
      { source: "2004-01", target: "2008-01", value: "1" },
      { source: "2016-06", target: "2020-06", value: "4" },
    ];
    const graph = graphFromCsv(rows, listarAnos());
    const names = graph.nodes.map((n) => n.name);
    expect(names).not.toContain("2020-06");
    expect(names).toContain("2004-01");
  });
});

describe("graphFromVereadores", () => {
  it("monta grafo para Rio com anos consecutivos", () => {
    const raw = readFileSync(
      join(process.cwd(), "data/vereadores1.json"),
      "utf-8",
    );
    const vereadores = JSON.parse(raw);
    const graph = graphFromVereadores(
      vereadores,
      RIO_CAPITAL_ID,
      listarAnos(),
    );
    expect(graph).not.toBeNull();
    expect(graph!.nodes.length).toBeGreaterThan(0);
    expect(graph!.links.length).toBeGreaterThan(0);
  });
});

function loadCamaraRjRows() {
  return readFileSync(join(process.cwd(), "data/camara-rj.csv"), "utf-8")
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [source, target, value] = line.split(",");
      return { source, target, value };
    });
}

describe("graphFromCsv Rio", () => {
  it("produz links com value > 0 e índices válidos", () => {
    const graph = graphFromCsv(loadCamaraRjRows(), listarAnos());
    expect(graph.links.some((l) => l.value > 0)).toBe(true);
    for (const link of graph.links) {
      expect(link.source).toBeGreaterThanOrEqual(0);
      expect(link.target).toBeLessThan(graph.nodes.length);
    }
  });

  it("cria ligação direta quando ano intermediário tem zero cadeiras", () => {
    const rows = [
      { source: "2004-03", target: "2008-03", value: "5" },
      { source: "2008-03", target: "2012-03", value: "0" },
      { source: "2012-03", target: "2016-03", value: "3" },
    ];
    const graph = graphFromCsv(rows, listarAnos());
    const names = graph.nodes.map((n) => n.name);
    const idx = (name: string) => names.indexOf(name);
    const skipLink = graph.links.find(
      (l) => l.source === idx("2008-03") && l.target === idx("2016-03"),
    );
    expect(skipLink).toBeDefined();
    expect(skipLink!.value).toBe(3);
  });
});
