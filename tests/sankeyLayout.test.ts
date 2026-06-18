import { describe, expect, it } from "vitest";
import { SANKEY_HEIGHT, SANKEY_WIDTH } from "../src/config";
import {
  clampSankeyNodeY,
  SANKEY_NODE_WIDTH,
  sankeyLayoutExtent,
} from "../src/sankey/sankeyLayout";

describe("sankeyLayoutExtent", () => {
  it("mantém nós dentro da largura do viewBox", () => {
    const { extent } = sankeyLayoutExtent();
    const [, [xMax]] = extent;
    expect(xMax + SANKEY_NODE_WIDTH).toBeLessThanOrEqual(SANKEY_WIDTH);
  });

  it("reserva espaço vertical para o título", () => {
    const { yMin } = sankeyLayoutExtent();
    expect(yMin).toBeGreaterThan(20);
    expect(yMin).toBeLessThan(SANKEY_HEIGHT / 4);
  });
});

describe("clampSankeyNodeY", () => {
  it("limita deslocamento vertical do nó", () => {
    const { yMin, yMax } = sankeyLayoutExtent();
    const h = 40;
    expect(clampSankeyNodeY(0, h, yMin, yMax)).toBe(yMin);
    expect(clampSankeyNodeY(9999, h, yMin, yMax)).toBe(yMax - h);
    expect(clampSankeyNodeY(100, h, yMin, yMax)).toBe(100);
  });
});
