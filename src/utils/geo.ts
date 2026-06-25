import { RIO_CAPITAL_IBGE, RIO_CAPITAL_ID, RIO_CAPITAL_NOME } from "../config";
import type { MunicipioProperties } from "../types/election";

export function normalizeCityName(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function isRioCapital(id: string, nome?: string): boolean {
  if (id === RIO_CAPITAL_ID || id === RIO_CAPITAL_IBGE) return true;
  if (nome && normalizeCityName(nome) === RIO_CAPITAL_NOME) return true;
  return false;
}

export function findRioCapitalId(
  features: Array<{ properties: MunicipioProperties }>,
): string {
  const byName = features.find(
    (f) => normalizeCityName(f.properties.nome) === RIO_CAPITAL_NOME,
  );
  if (byName) return String(byName.properties.id);
  return RIO_CAPITAL_ID;
}
