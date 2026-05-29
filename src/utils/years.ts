import { ANO_INICIAL, NUM_PERIODOS } from "../config";

export function listarAnos(
  anoInicial: number = ANO_INICIAL,
  numPeriodos: number = NUM_PERIODOS,
): number[] {
  const anos: number[] = [];
  let ano = anoInicial;
  for (let i = 0; i < numPeriodos; i++) {
    anos.push(ano);
    ano += 4;
  }
  return anos;
}

export function parseSankeyNodeName(name: string): {
  year: number;
  orientacao: number;
} | null {
  const match = /^(\d{4})-(\d{2})$/.exec(name);
  if (!match) return null;
  return {
    year: Number(match[1]),
    orientacao: Number(match[2]),
  };
}

export function filterGraphByYears(
  years: readonly number[],
  nodeNames: Iterable<string>,
): Set<string> {
  const yearSet = new Set(years.map(String));
  const allowed = new Set<string>();
  for (const name of nodeNames) {
    const parsed = parseSankeyNodeName(name);
    if (parsed && yearSet.has(String(parsed.year))) {
      allowed.add(name);
    }
  }
  return allowed;
}
