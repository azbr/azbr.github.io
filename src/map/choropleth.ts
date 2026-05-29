import { geoMercator, geoPath, select, type Selection } from "d3";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { ENUM_ORIENTACAO, MAP_HEIGHT, MAP_WIDTH } from "../config";
import type {
  CitySelection,
  MunicipioProperties,
  PrefeitosPorAno,
  RjMunicipiosTopology,
} from "../types/election";
import { orientacaoToColor } from "../utils/colors";
import { listarAnos } from "../utils/years";

export type CitySelectHandler = (city: CitySelection) => void;
export type YearChangeHandler = (year: number) => void;

type MunicipioFeature = Feature<Geometry, MunicipioProperties>;

export class ChoroplethMap {
  private readonly listaAnos = listarAnos();
  private currentYear: number;
  private selectedCityId: string | null = null;
  private onCitySelect?: CitySelectHandler;
  private onYearChange?: YearChangeHandler;
  private readonly pathLayer: Selection<SVGPathElement, MunicipioFeature, SVGGElement, unknown>;
  private readonly titleEl: Selection<SVGTextElement, unknown, null, undefined>;
  private infobox: Selection<HTMLDivElement, unknown, HTMLElement, unknown>;

  constructor(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    private readonly prefeitos: PrefeitosPorAno,
    private readonly topology: RjMunicipiosTopology,
  ) {
    this.currentYear = this.listaAnos[0];
    const projection = geoMercator().center([-43, -22]).scale(8500);
    const path = geoPath().projection(projection);

    const geo = feature(
      this.topology,
      this.topology.objects.states as Parameters<typeof feature>[1],
    ) as FeatureCollection<Geometry, MunicipioProperties>;

    svg
      .attr("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    this.titleEl = svg
      .append("text")
      .attr("class", "chartTitle")
      .attr("transform", `translate(${MAP_WIDTH / 2},30)`)
      .attr("text-anchor", "middle");

    const stateG = svg.append("g").attr("class", "rj-state");

    this.pathLayer = stateG
      .selectAll<SVGPathElement, MunicipioFeature>("path")
      .data(geo.features)
      .join("path")
      .attr("class", "cities")
      .attr("d", path)
      .attr("data-id", (d) => d.properties.id)
      .on("mouseover", (event, d) => this.showTooltip(event, d))
      .on("mouseout", () => this.hideTooltip())
      .on("click", (_event, d) => {
        this.selectCity(String(d.properties.id));
        this.onCitySelect?.({
          id: String(d.properties.id),
          nome: d.properties.nome,
        });
      });

    this.infobox = select<HTMLDivElement, unknown>("body")
      .append("div")
      .attr("class", "infobox")
      .style("opacity", "0");

    this.updateYearDisplay();
    this.redraw();
  }

  setOnCitySelect(handler: CitySelectHandler): void {
    this.onCitySelect = handler;
  }

  setOnYearChange(handler: YearChangeHandler): void {
    this.onYearChange = handler;
  }

  getCurrentYear(): number {
    return this.currentYear;
  }

  getSelectedCityId(): string | null {
    return this.selectedCityId;
  }

  selectCity(id: string | null): void {
    this.selectedCityId = id;
    this.pathLayer.classed("selected", (d) => String(d.properties.id) === id);
  }

  stepYear(delta: "+" | "-"): void {
    const idx = this.listaAnos.indexOf(this.currentYear);
    if (delta === "+" && idx < this.listaAnos.length - 1) {
      this.currentYear = this.listaAnos[idx + 1];
    } else if (delta === "-" && idx > 0) {
      this.currentYear = this.listaAnos[idx - 1];
    } else {
      return;
    }
    this.updateYearDisplay();
    this.redraw();
    this.onYearChange?.(this.currentYear);
  }

  private updateYearDisplay(): void {
    const el = document.getElementById("ano-atual");
    if (el) el.textContent = String(this.currentYear);
    this.titleEl.text(`Prefeituras ${this.currentYear}`);
  }

  private fillForCity(id: string): string | undefined {
    const row = this.prefeitos[String(this.currentYear)]?.[id];
    if (!row) return undefined;
    return orientacaoToColor(row.ORIENTACAO);
  }

  redraw(): void {
    this.pathLayer
      .transition()
      .duration(300)
      .style("fill", (d) => this.fillForCity(String(d.properties.id)) ?? "#ddd");
  }

  private showTooltip(event: MouseEvent, d: MunicipioFeature): void {
    const id = String(d.properties.id);
    const row = this.prefeitos[String(this.currentYear)]?.[id];
    if (!row) return;

    const msg = [
      d.properties.nome,
      row.SIGLA,
      ENUM_ORIENTACAO[row.ORIENTACAO] ?? String(row.ORIENTACAO),
    ].join("<br/>");

    this.infobox
      .html(msg)
      .style("left", `${event.pageX}px`)
      .style("top", `${event.pageY - 28}px`)
      .style("padding", "10px")
      .transition()
      .duration(200)
      .style("opacity", "0.9");
  }

  private hideTooltip(): void {
    this.infobox.transition().duration(300).style("opacity", "0");
  }
}

export function bindYearControls(map: ChoroplethMap): void {
  document.getElementById("previous")?.addEventListener("click", () => map.stepYear("-"));
  document.getElementById("next")?.addEventListener("click", () => map.stepYear("+"));
}
