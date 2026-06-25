import { select } from "d3";
import {
  loadBrEstadosTopo,
  loadCamaraRioCsv,
  loadStateView,
} from "./data/loaders";
import { graphFromCsv, graphFromVereadores } from "./data/sankeyGraph";
import { bindYearControls, ChoroplethMap } from "./map/choropleth";
import { BrazilStatesMap } from "./map/brazilStates";
import { CouncilSankey } from "./sankey/councilSankey";
import { renderOrientationLegend } from "./ui/legend";
import { isRioCapital } from "./utils/geo";
import { listarAnos } from "./utils/years";
import type { ElectionData } from "./types/election";

async function init(): Promise<void> {
  const legendContainer = document.getElementById("lista-features");
  if (legendContainer) renderOrientationLegend(legendContainer);

  const [brTopo, csvRows] = await Promise.all([
    loadBrEstadosTopo(),
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

  const svg = select(mapEl);
  const sankey = new CouncilSankey(sankeyEl, sankeyMessage);
  let map: ChoroplethMap | null = null;
  let stateData: ElectionData | null = null;
  let selectedRio = false;

  const refreshSankey = (): void => {
    if (!selectedRio || !map) return;
    sankey.render(rioGraph, "Câmara Municipal do Rio de Janeiro");
  };

  const mountStateMap = async (uf: string): Promise<void> => {
    stateData = await loadStateView(uf);
    map = new ChoroplethMap(svg, stateData.prefeitos, stateData.municipios);
    bindYearControls(map);

    map.setOnCitySelect((city) => {
      map?.selectCity(city.id);
      if (isRioCapital(city.id, city.nome)) {
        selectedRio = true;
        refreshSankey();
        return;
      }
      selectedRio = false;
      const graph = stateData
        ? graphFromVereadores(stateData.vereadores, city.id, allowedYears)
        : null;
      if (graph) {
        sankey.render(graph, `Câmara Municipal — ${city.nome}`);
      } else {
        sankey.showUnavailable(city.nome);
      }
    });

    map.setOnYearChange(() => {
      if (selectedRio) refreshSankey();
    });
  };

  const brMap = new BrazilStatesMap(svg, brTopo);
  brMap.setOnUfSelect((ufSel) => {
    void mountStateMap(ufSel.uf);
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
        "Não foi possível carregar os dados. Use npm run dev ou npm run build && npm run preview.";
      main.prepend(p);
    }
  });
});
