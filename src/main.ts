import { select } from "d3";
import { loadCamaraRioCsv, loadElectionData } from "./data/loaders";
import { graphFromCsv } from "./data/sankeyGraph";
import { bindYearControls, ChoroplethMap } from "./map/choropleth";
import { CouncilSankey } from "./sankey/councilSankey";
import { renderOrientationLegend } from "./ui/legend";
import { isRioCapital } from "./utils/geo";
import { listarAnos } from "./utils/years";

async function init(): Promise<void> {
  const legendContainer = document.getElementById("lista-features");
  if (legendContainer) renderOrientationLegend(legendContainer);

  const [data, csvRows] = await Promise.all([
    loadElectionData(),
    loadCamaraRioCsv(),
  ]);

  const allowedYears = listarAnos();
  const rioGraph = graphFromCsv(csvRows, allowedYears);

  const mapEl = document.querySelector<SVGSVGElement>("#mainChart");
  const sankeyEl = document.querySelector<SVGSVGElement>("#sankeyChart");
  const sankeyMessage = document.getElementById("sankey-message");

  if (!mapEl || !sankeyEl || !sankeyMessage) {
    throw new Error("Elementos da página não encontrados.");
  }

  const map = new ChoroplethMap(select(mapEl), data.prefeitos, data.municipios);
  const sankey = new CouncilSankey(sankeyEl, sankeyMessage);

  bindYearControls(map);

  let selectedRio = false;

  const refreshSankey = (): void => {
    if (!selectedRio) return;
    sankey.render(rioGraph, "Câmara Municipal do Rio de Janeiro");
  };

  map.setOnCitySelect((city) => {
    map.selectCity(city.id);
    if (isRioCapital(city.id, city.nome)) {
      selectedRio = true;
      refreshSankey();
    } else {
      selectedRio = false;
      sankey.showUnavailable(city.nome);
    }
  });

  map.setOnYearChange(() => {
    if (selectedRio) refreshSankey();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((err) => {
    console.error("Erro ao inicializar aplicação:", err);
    const main = document.querySelector("main");
    if (main) {
      const p = document.createElement("p");
      p.className = "app-error";
      p.textContent =
        "Não foi possível carregar os dados. Execute npm run build e npm run preview (não abra o HTML como arquivo local).";
      main.prepend(p);
    }
  });
});
