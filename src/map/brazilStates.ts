import { geoMercator, geoPath, select, type Selection } from "d3";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { BrEstadosTopology, EstadoProperties, UfSelection } from "../types/election";
import { orientacaoToColor } from "../utils/colors";

export type UfSelectHandler = (uf: UfSelection) => void;

type EstadoFeature = Feature<Geometry, EstadoProperties>;

export class BrazilStatesMap {
  private readonly pathLayer: Selection<SVGPathElement, EstadoFeature, SVGGElement, unknown>;
  private onUfSelect?: UfSelectHandler;
  private readonly fillByUf: Map<string, number> = new Map();

  constructor(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    topology: BrEstadosTopology,
  ) {
    const projection = geoMercator().center([-54, -15]).scale(700);
    const path = geoPath().projection(projection);

    const geo = feature(
      topology,
      topology.objects.estados as Parameters<typeof feature>[1],
    ) as FeatureCollection<Geometry, EstadoProperties>;

    svg.selectAll("*").remove();
    svg
      .attr("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg
      .append("text")
      .attr("class", "chartTitle")
      .attr("transform", `translate(${MAP_WIDTH / 2},30)`)
      .attr("text-anchor", "middle")
      .text("Brasil — clique em um estado");

    const layer = svg.append("g").attr("class", "br-states");
    this.pathLayer = layer
      .selectAll<SVGPathElement, EstadoFeature>("path")
      .data(geo.features)
      .join("path")
      .attr("class", "states")
      .attr("d", path)
      .attr("data-uf", (d) => d.properties.uf)
      .style("fill", "#ddd")
      .style("stroke", "#fff")
      .style("stroke-width", 0.5)
      .on("click", (_event, d) => {
        this.onUfSelect?.({
          uf: d.properties.uf,
          nome: d.properties.nome,
        });
      });
  }

  setOnUfSelect(handler: UfSelectHandler): void {
    this.onUfSelect = handler;
  }

  /** Coroplético agregado por UF (orientação numérica por estado). */
  setOrientationByUf(values: Record<string, number>): void {
    this.fillByUf.clear();
    for (const [uf, orientacao] of Object.entries(values)) {
      this.fillByUf.set(uf.toUpperCase(), orientacao);
    }
    this.pathLayer.style("fill", (d) => {
      const o = this.fillByUf.get(d.properties.uf.toUpperCase());
      return o !== undefined ? orientacaoToColor(o) : "#ddd";
    });
  }
}
