import { parseSankeyNodeName } from "../utils/years";

export interface SankeyFlowNode {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export function orientationFromNode(name: string): number | null {
  return parseSankeyNodeName(name)?.orientacao ?? null;
}

export function yearFromNode(name: string): number | null {
  return parseSankeyNodeName(name)?.year ?? null;
}

export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

/** Cadeiras por nó: fluxo de entrada (eleição anterior); na primeira coluna, fluxo de saída. */
export function computeNodeValues(
  nodes: { name: string }[],
  links: {
    source: string | number;
    target: string | number;
    value: number;
  }[],
): Map<string, number> {
  const values = new Map<string, number>();
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();

  for (const node of nodes) {
    values.set(node.name, 0);
    incoming.set(node.name, 0);
    outgoing.set(node.name, 0);
  }

  for (const link of links) {
    const srcName =
      typeof link.source === "string"
        ? link.source
        : nodes[link.source as number]?.name;
    const tgtName =
      typeof link.target === "string"
        ? link.target
        : nodes[link.target as number]?.name;
    if (!srcName || !tgtName) continue;
    const v = link.value;
    incoming.set(tgtName, Math.max(incoming.get(tgtName) ?? 0, v));
    outgoing.set(srcName, Math.max(outgoing.get(srcName) ?? 0, v));
  }

  for (const node of nodes) {
    const inc = incoming.get(node.name) ?? 0;
    const out = outgoing.get(node.name) ?? 0;
    const hasIncomingLink = links.some((link) => {
      const tgtName =
        typeof link.target === "string"
          ? link.target
          : nodes[link.target as number]?.name;
      return tgtName === node.name;
    });
    values.set(node.name, hasIncomingLink ? inc : out);
  }

  return values;
}

/**
 * Para cada orientação, liga cada ano ao próximo ano em que o grupo tem cadeiras (> 0),
 * ignorando anos intermediários ausentes ou com valor zero.
 */
export function buildOrientationFlowLinks(
  nodes: { name: string }[],
  nodeValues: Map<string, number>,
): FlowLink[] {
  const byOrientation = new Map<
    number,
    { year: number; name: string; value: number }[]
  >();

  for (const node of nodes) {
    const parsed = parseSankeyNodeName(node.name);
    if (!parsed) continue;
    const value = nodeValues.get(node.name) ?? 0;
    if (value <= 0) continue;

    let list = byOrientation.get(parsed.orientacao);
    if (!list) {
      list = [];
      byOrientation.set(parsed.orientacao, list);
    }
    list.push({ year: parsed.year, name: node.name, value });
  }

  const links: FlowLink[] = [];
  for (const entries of byOrientation.values()) {
    entries.sort((a, b) => a.year - b.year);
    for (let i = 0; i < entries.length - 1; i++) {
      const src = entries[i]!;
      const tgt = entries[i + 1]!;
      links.push({
        source: src.name,
        target: tgt.name,
        value: Math.min(src.value, tgt.value) || src.value || tgt.value,
      });
    }
  }
  return links;
}

/**
 * Faixa preenchida entre a borda inferior direita da origem e a borda inferior esquerda
 * do destino, com espessura igual à altura de cada nó (cadeiras).
 */
export function sankeyFlowPath(
  source: SankeyFlowNode,
  target: SankeyFlowNode,
  curvature = 0.5,
): string {
  const xSource = source.x1 ?? 0;
  const xTarget = target.x0 ?? 0;
  const ySourceBottom = source.y1 ?? 0;
  const yTargetBottom = target.y1 ?? 0;
  const hSource = Math.max(1, (source.y1 ?? 0) - (source.y0 ?? 0));
  const hTarget = Math.max(1, (target.y1 ?? 0) - (target.y0 ?? 0));

  const ySourceTop = ySourceBottom - hSource;
  const yTargetTop = yTargetBottom - hTarget;

  const gap = xTarget - xSource;
  const c1 = xSource + gap * curvature;
  const c2 = xTarget - gap * curvature;

  return [
    `M${xSource},${ySourceTop}`,
    `C${c1},${ySourceTop} ${c2},${yTargetTop} ${xTarget},${yTargetTop}`,
    `L${xTarget},${yTargetBottom}`,
    `C${c2},${yTargetBottom} ${c1},${ySourceBottom} ${xSource},${ySourceBottom}`,
    "Z",
  ].join("");
}
