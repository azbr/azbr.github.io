import type { Topology } from "topojson-specification";

export type AnoEleicao = "2004" | "2008" | "2012" | "2016" | "2020" | "2024";

export interface Prefeito {
  ORIENTACAO: number;
  NOME: string;
  SIGLA: string;
}

export type PrefeitosPorAno = Record<string, Record<string, Prefeito>>;

export interface PartidoVereador {
  ORIENTACAO: number;
  N: number;
}

export interface MunicipioVereadores {
  NOME: string;
  SIGLAS: Record<string, PartidoVereador>;
}

export type VereadoresPorAno = Record<string, Record<string, MunicipioVereadores>>;

export interface MunicipioProperties {
  id: string;
  nome: string;
  uf: string;
  populacao: number;
  pib: number;
  estado_id: string;
  codigo_ibg: string;
}

export type RjMunicipiosTopology = Topology;

export interface EstadoProperties {
  uf: string;
  nome: string;
  codigo_ibg: string;
}

export type BrEstadosTopology = Topology;

export interface MunicipioMeta {
  nome: string;
  id_legacy?: number;
}

export interface StateElectionBundle {
  uf: string;
  anos: number[];
  municipios: Record<string, MunicipioMeta>;
  prefeitos: PrefeitosPorAno;
  vereadores: VereadoresPorAno;
}

export interface UfSelection {
  uf: string;
  nome: string;
}

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number | string;
  target: number | string;
  value: number;
}

export interface SankeyGraph {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface CsvSankeyRow {
  source: string;
  target: string;
  value: string;
}

export interface ElectionData {
  prefeitos: PrefeitosPorAno;
  municipios: RjMunicipiosTopology;
  vereadores: VereadoresPorAno;
}

export interface CitySelection {
  id: string;
  nome: string;
}
