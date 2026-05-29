import { drag, format, select, type Selection } from "d3";
import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
} from "d3-sankey";
import { SANKEY_HEIGHT, SANKEY_WIDTH } from "../config";
import type { SankeyGraph as AppSankeyGraph } from "../types/election";
import { orientacaoFromSankeyNodeName, orientacaoToColor } from "../utils/colors";

interface LayoutNode {
  name: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
}

interface LayoutLink {
  source: LayoutNode | number;
  target: LayoutNode | number;
  value: number;
  width?: number;
}

const UNITS = "Cadeiras";
const MARGIN = { top: 20, right: 10, bottom: 50, left: 10 };
const INNER_HEIGHT = SANKEY_HEIGHT - 100;

export class CouncilSankey {
  private readonly svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private readonly chartG: Selection<SVGGElement, unknown, null, undefined>;
  private readonly messageEl: HTMLElement;

  constructor(svgElement: SVGSVGElement, messageElement: HTMLElement) {
    this.svg = select(svgElement);
    this.messageEl = messageElement;

    this.svg
      .attr("viewBox", `0 0 ${SANKEY_WIDTH} ${SANKEY_HEIGHT}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    this.chartG = this.svg.append("g");
    this.showEmptyState();
  }

  showEmptyState(): void {
    this.clearChart();
    this.svg.attr("hidden", "").style("display", "none");
    this.messageEl.hidden = false;
    this.messageEl.textContent =
      "Selecione um município no mapa para ver a composição da câmara municipal.";
    this.messageEl.className = "sankey-message sankey-message--hint";
  }

  showUnavailable(cityName: string): void {
    this.clearChart();
    this.svg.attr("hidden", "").style("display", "none");
    this.messageEl.hidden = false;
    this.messageEl.textContent = `Dados da câmara municipal de ${cityName} ainda não estão disponíveis. Por enquanto, apenas o Rio de Janeiro.`;
    this.messageEl.className = "sankey-message sankey-message--warn";
  }

  render(graph: AppSankeyGraph, title: string): void {
    this.clearChart();
    this.messageEl.hidden = true;
    this.svg.attr("hidden", null).style("display", "block");

    const layoutGraph = {
      nodes: graph.nodes.map((n) => ({ name: n.name })),
      links: graph.links.map((l) => ({
        source: l.source as number,
        target: l.target as number,
        value: l.value,
      })),
    };

    const layout = sankey<LayoutNode, LayoutLink>()
      .nodeWidth(50)
      .nodePadding(30)
      .nodeAlign(sankeyJustify)
      .extent([
        [MARGIN.left, MARGIN.top],
        [SANKEY_WIDTH - MARGIN.right, INNER_HEIGHT],
      ]);

    const laidOut = layout(layoutGraph);

    const linkG = this.chartG
      .append("g")
      .attr("transform", "translate(100,55)")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.2)
      .selectAll<SVGPathElement, LayoutLink>("path")
      .data(laidOut.links)
      .join("path")
      .attr("class", (d) => (d.value ? "link" : "link zero"))
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", (d) => Math.max(1, d.width ?? 0));

    linkG.append("title").text((d) => {
      const s = d.source as LayoutNode;
      const t = d.target as LayoutNode;
      return `${s.name} → ${t.name}\n${d.value}`;
    });

    const nodeDrag = drag<SVGGElement, LayoutNode>()
      .subject((d) => d)
      .on("drag", (event, d) => {
        const height = (d.y1 ?? 0) - (d.y0 ?? 0);
        d.y0 = Math.max(0, Math.min(INNER_HEIGHT - height, event.y));
        d.y1 = (d.y0 ?? 0) + height;
        select(event.sourceEvent.target.parentNode as SVGGElement).attr(
          "transform",
          `translate(${d.x0 ?? 0},${d.y0 ?? 0})`,
        );
        linkG.attr("d", sankeyLinkHorizontal());
      });

    const node = this.chartG
      .append("g")
      .attr("transform", "translate(100,55)")
      .selectAll<SVGGElement, LayoutNode>("g")
      .data(laidOut.nodes)
      .join("g")
      .attr("class", (d) => (d.value ? "node" : "node zero"))
      .attr("transform", (d) => `translate(${d.x0 ?? 0},${d.y0 ?? 0})`)
      .call(nodeDrag);

    node
      .append("rect")
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .style("fill", (d) => orientacaoToColor(orientacaoFromSankeyNodeName(d.name)))
      .style("stroke", (d) => orientacaoToColor(orientacaoFromSankeyNodeName(d.name)))
      .append("title")
      .text((d) => `${d.name}\n${formatValue(d.value ?? 0)}`);

    node
      .append("text")
      .attr("x", -6)
      .attr("y", (d) => ((d.y1 ?? 0) - (d.y0 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => d.name)
      .filter((d) => (d.x0 ?? 0) < SANKEY_WIDTH / 2)
      .attr("x", (d) => (d.x1 ?? 0) - (d.x0 ?? 0) + 6)
      .attr("text-anchor", "start");

    this.chartG
      .append("text")
      .attr("class", "chartTitle2")
      .attr("transform", `translate(${SANKEY_WIDTH / 2},25)`)
      .attr("text-anchor", "middle")
      .text(title);
  }

  private clearChart(): void {
    this.chartG.selectAll("*").remove();
  }
}

function formatValue(value: number): string {
  return `${format(",.0f")(value)} ${UNITS}`;
}
