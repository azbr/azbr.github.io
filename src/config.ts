export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 500;

export const SANKEY_WIDTH = 850;
export const SANKEY_HEIGHT = 600;

export const ANO_INICIAL = 2004;
export const NUM_PERIODOS = 4;

export const DATA_PATHS = {
  prefeitos: "data/prefeitos.json",
  municipios: "data/rj-cidades.json",
  vereadores: "data/vereadores1.json",
  camaraRioCsv: "data/camara-rj.csv",
  brEstadosTopo: "data/topo/br-estados.topo.json",
  stateTopo: (uf: string) => `data/topo/${uf.toLowerCase()}-municipios.topo.json`,
  stateElection: (uf: string) => `data/states/${uf.toLowerCase()}.json`,
} as const;

/** ID interno do município Rio de Janeiro na base legada */
export const RIO_CAPITAL_ID = "3658";

/** Código IBGE do município Rio de Janeiro */
export const RIO_CAPITAL_IBGE = "3304557";

export const RIO_CAPITAL_NOME = "rio de janeiro";

export const ENUM_ORIENTACAO: Record<number, string> = {
  1: "extrema-esquerda",
  2: "esquerda",
  3: "centro-esquerda",
  4: "centro",
  5: "centro-direita",
  6: "direita",
  7: "extrema-direita",
};
