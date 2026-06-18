import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CouncilSankey } from "../src/sankey/councilSankey";
import type { SankeyGraph } from "../src/types/election";

function miniGraph(): SankeyGraph {
  return JSON.parse(
    readFileSync(join(process.cwd(), "tests/fixtures/sankey-mini.json"), "utf-8"),
  ) as SankeyGraph;
}

describe("CouncilSankey", () => {
  it("renderiza nós e links preenchidos no SVG", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "sankeyChart";
    const message = document.createElement("p");
    message.id = "sankey-message";

    const chart = new CouncilSankey(svg, message);
    chart.render(miniGraph(), "Teste");

    expect(svg.classList.contains("is-visible")).toBe(true);
    expect(message.hidden).toBe(true);
    expect(svg.querySelectorAll(".node rect").length).toBeGreaterThan(0);
    const paths = svg.querySelectorAll(".sankey-links path");
    expect(paths.length).toBeGreaterThan(0);
    const firstPath = paths[0] as SVGPathElement;
    expect(firstPath.getAttribute("d")).toMatch(/Z$/);
    expect(firstPath.style.fillOpacity).toBe("0.45");
  });

  it("mostra estado vazio quando grafo não tem links", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const message = document.createElement("p");

    const chart = new CouncilSankey(svg, message);
    chart.render({ nodes: [], links: [] }, "Vazio");

    expect(svg.classList.contains("is-visible")).toBe(false);
    expect(message.hidden).toBe(false);
  });
});
