import { DATA_PATHS } from "../config";
import type {
  BrEstadosTopology,
  CsvSankeyRow,
  ElectionData,
  RjMunicipiosTopology,
  StateElectionBundle,
} from "../types/election";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao carregar ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function loadBrEstadosTopo(): Promise<BrEstadosTopology> {
  return fetchJson<BrEstadosTopology>(DATA_PATHS.brEstadosTopo);
}

export async function loadStateElection(uf: string): Promise<StateElectionBundle> {
  return fetchJson<StateElectionBundle>(DATA_PATHS.stateElection(uf));
}

export async function loadStateMunicipiosTopo(uf: string): Promise<RjMunicipiosTopology> {
  return fetchJson<RjMunicipiosTopology>(DATA_PATHS.stateTopo(uf));
}

/** Converte bundle por UF para o formato legado do ChoroplethMap. */
export function bundleToElectionData(
  bundle: StateElectionBundle,
  municipiosTopo: RjMunicipiosTopology,
): ElectionData {
  return {
    prefeitos: bundle.prefeitos,
    vereadores: bundle.vereadores,
    municipios: municipiosTopo,
  };
}

export async function loadStateView(uf: string): Promise<ElectionData> {
  const [bundle, municipios] = await Promise.all([
    loadStateElection(uf),
    loadStateMunicipiosTopo(uf),
  ]);
  return bundleToElectionData(bundle, municipios);
}

export async function loadElectionData(): Promise<ElectionData> {
  return loadStateView("RJ");
}

export async function loadLegacyElectionData(): Promise<ElectionData> {
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
