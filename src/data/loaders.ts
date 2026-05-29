import { DATA_PATHS } from "../config";
import type { CsvSankeyRow, ElectionData } from "../types/election";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao carregar ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function loadElectionData(): Promise<ElectionData> {
  const [prefeitos, municipios, vereadores] = await Promise.all([
    fetchJson<ElectionData["prefeitos"]>(DATA_PATHS.prefeitos),
    fetchJson<ElectionData["municipios"]>(DATA_PATHS.municipios),
    fetchJson<ElectionData["vereadores"]>(DATA_PATHS.vereadores),
  ]);
  return { prefeitos, municipios, vereadores };
}

export async function loadCamaraRioCsv(): Promise<CsvSankeyRow[]> {
  const res = await fetch(DATA_PATHS.camaraRioCsv);
  if (!res.ok) {
    throw new Error(`Falha ao carregar CSV: ${res.status}`);
  }
  const text = await res.text();
  return parseCsv(text);
}

function parseCsv(text: string): CsvSankeyRow[] {
  const lines = text.trim().split(/\r?\n/);
  const rows: CsvSankeyRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [source, target, value] = lines[i].split(",");
    if (source && target && value !== undefined) {
      rows.push({ source, target, value });
    }
  }
  return rows;
}
