import { describe, expect, it } from "vitest";
import {
  buildOrientationFlowLinks,
  computeNodeValues,
  orientationFromNode,
  sankeyFlowPath,
  yearFromNode,
} from "../src/sankey/sankeyLinkPath";

describe("orientationFromNode / yearFromNode", () => {
  it("extrai ano e orientação do nome do nó", () => {
    expect(orientationFromNode("2008-03")).toBe(3);
    expect(yearFromNode("2008-03")).toBe(2008);
    expect(orientationFromNode("invalid")).toBeNull();
  });
});

describe("sankeyFlowPath", () => {
  it("gera path fechado com curvas Bezier", () => {
    const d = sankeyFlowPath(
      { x0: 10, x1: 60, y0: 20, y1: 70 },
      { x0: 200, x1: 250, y0: 40, y1: 90 },
    );
    expect(d).toMatch(/^M/);
    expect(d).toContain("C");
    expect(d).toMatch(/Z$/);
  });

  it("ancora nas bordas inferiores com espessura da altura do nó", () => {
    const d = sankeyFlowPath(
      { x0: 0, x1: 50, y0: 10, y1: 60 },
      { x0: 150, x1: 200, y0: 30, y1: 80 },
    );
    expect(d).toContain("M50,10");
    expect(d).toContain("L150,80");
    expect(d).toContain("50,60");
  });
});

describe("buildOrientationFlowLinks", () => {
  const nodes = [
    { name: "2004-02" },
    { name: "2008-02" },
    { name: "2012-02" },
    { name: "2016-02" },
    { name: "2004-03" },
    { name: "2008-03" },
    { name: "2012-03" },
    { name: "2016-03" },
  ];

  it("liga anos consecutivos com cadeiras", () => {
    const csvLinks = [
      { source: "2004-02", target: "2008-02", value: 1 },
      { source: "2008-02", target: "2012-02", value: 1 },
      { source: "2012-02", target: "2016-02", value: 1 },
    ];
    const values = computeNodeValues(nodes, csvLinks);

    const links = buildOrientationFlowLinks(nodes, values);
    const o2 = links.filter((l) => l.source.endsWith("-02"));
    expect(o2).toHaveLength(3);
    expect(o2[0]).toEqual({ source: "2004-02", target: "2008-02", value: 1 });
    expect(o2[1]).toEqual({ source: "2008-02", target: "2012-02", value: 1 });
    expect(o2[2]).toEqual({ source: "2012-02", target: "2016-02", value: 1 });
  });

  it("pula anos intermediários sem cadeiras", () => {
    const csvLinks = [
      { source: "2004-03", target: "2008-03", value: 5 },
      { source: "2008-03", target: "2012-03", value: 0 },
      { source: "2012-03", target: "2016-03", value: 3 },
    ];
    const values = computeNodeValues(nodes, csvLinks);
    expect(values.get("2012-03")).toBe(0);

    const links = buildOrientationFlowLinks(nodes, values);
    const skip = links.find(
      (l) => l.source === "2008-03" && l.target === "2016-03",
    );
    expect(skip).toBeDefined();
    expect(skip!.value).toBe(3);
  });
});
