import { ENUM_ORIENTACAO } from "../config";
import { orientacaoToColor } from "../utils/colors";

export function renderOrientationLegend(container: HTMLElement): void {
  const heading = document.createElement("h2");
  heading.id = "legenda-orientacao-titulo";
  heading.textContent = "Orientação política (prefeitos)";
  container.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "orientacao-legend";
  list.setAttribute("aria-labelledby", "legenda-orientacao-titulo");

  for (const [key, label] of Object.entries(ENUM_ORIENTACAO)) {
    const orientacao = Number(key);
    const item = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.backgroundColor = orientacaoToColor(orientacao);
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(label));
    list.appendChild(item);
  }

  container.appendChild(list);

  const hint = document.createElement("p");
  hint.className = "map-hint";
  hint.textContent =
    "Clique em um município no mapa para ver a composição da câmara municipal (disponível para o Rio de Janeiro).";
  container.appendChild(hint);
}
