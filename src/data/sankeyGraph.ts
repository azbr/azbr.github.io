import {
  buildOrientationFlowLinks,
  computeNodeValues,
} from "../sankey/sankeyLinkPath";
import { listarAnos, parseSankeyNodeName } from "../utils/years";
import type {
  CsvSankeyRow,
  SankeyGraph,
  SankeyLink,
  SankeyNode,
  VereadoresPorAno,
} from "../types/election";

export function graphFromCsv(
  rows: CsvSankeyRow[],
  allowedYears?: readonly number[],
): SankeyGraph {
  const filteredRows =
    allowedYears && allowedYears.length > 0
      ? rows.filter((r) => {
          const s = parseSankeyNodeName(r.source);
          const t = parseSankeyNodeName(r.target);
          const years = allowedYears.map(String);
          return (
            s &&
            t &&
            years.includes(String(s.year)) &&
            years.includes(String(t.year))
          );
        })
      : rows;

  const nodeNames = new Set<string>();
  const csvLinks: SankeyLink[] = [];

  for (const row of filteredRows) {
    nodeNames.add(row.source);
    nodeNames.add(row.target);
    csvLinks.push({
      source: row.source,
      target: row.target,
      value: Number.parseInt(row.value, 10) || 0,
    });
  }

  const nodes: SankeyNode[] = [...nodeNames].sort().map((name) => ({ name }));
  const nodeValues = computeNodeValues(nodes, csvLinks);
  const links = buildOrientationFlowLinks(nodes, nodeValues);
  return indexGraph({ nodes, links });
}

/**
 * Agrega cadeiras por orientação e monta fluxos entre eleições consecutivas.
 * Usado quando dados por município estiverem completos (futuro pipeline TSE).
 */
export function graphFromVereadores(
  vereadores: VereadoresPorAno,
  municipioId: string,
  allowedYears: readonly number[] = listarAnos(),
): SankeyGraph | null {
  const anos = allowedYears.map(String).filter((a) => vereadores[a]?.[municipioId]);
  if (anos.length < 2) return null;

  const bucketsByYear = new Map<string, Map<number, number>>();

  for (const ano of anos) {
    const entry = vereadores[ano][municipioId];
    if (!entry || typeof entry !== "object" || !("SIGLAS" in entry)) continue;
    const buckets = new Map<number, number>();
    for (const partido of Object.values(entry.SIGLAS)) {
      const o = partido.ORIENTACAO;
      buckets.set(o, (buckets.get(o) ?? 0) + partido.N);
    }
    bucketsByYear.set(ano, buckets);
  }

  const nodeNames = new Set<string>();
  for (const ano of anos) {
    const buckets = bucketsByYear.get(ano);
    if (!buckets) continue;
    for (const orientacao of buckets.keys()) {
      nodeNames.add(`${ano}-${String(orientacao).padStart(2, "0")}`);
    }
  }

  const nodes: SankeyNode[] = [...nodeNames].sort().map((name) => ({ name }));
  const nodeValues = new Map<string, number>();
  for (const node of nodes) {
    const parsed = parseSankeyNodeName(node.name);
    if (!parsed) continue;
    const buckets = bucketsByYear.get(String(parsed.year));
    nodeValues.set(node.name, buckets?.get(parsed.orientacao) ?? 0);
  }
  const links = buildOrientationFlowLinks(nodes, nodeValues);
  return indexGraph({ nodes, links });
}

function indexGraph(graph: SankeyGraph): SankeyGraph {
  const nameToIndex = new Map(
    graph.nodes.map((n, i) => [n.name, i] as const),
  );

  return {
    nodes: graph.nodes,
    links: graph.links.map((link) => ({
      source:
        typeof link.source === "string"
          ? (nameToIndex.get(link.source) ?? 0)
          : link.source,
      target:
        typeof link.target === "string"
          ? (nameToIndex.get(link.target) ?? 0)
          : link.target,
      value: link.value,
    })),
  };
}
