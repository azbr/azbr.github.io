import { drag, format, select, type Selection } from "d3";
import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import { SANKEY_HEIGHT, SANKEY_WIDTH } from "../config";
import type { SankeyGraph as AppSankeyGraph } from "../types/election";
import { orientacaoFromSankeyNodeName, orientacaoToColor } from "../utils/colors";

type LayoutNode = SankeyNode<{}, {}> & { name: string };
type LayoutLink = SankeyLink<LayoutNode, {}>;

const UNITS = "Cadeiras";
const MARGIN = { top: 20, right: 10, bottom: 50, left: 10 };
const INNER_HEIGHT = SANKEY_HEIGHT - 100;
/** Mesmo deslocamento do site legado (camara.js) */
const CHART_OFFSET_X = 100;
const CHART_OFFSET_Y = 55;

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
    this.svg.classed("is-visible", false).attr("aria-hidden", "true").style("display", null);
    this.messageEl.hidden = false;
    this.messageEl.textContent =
      "Selecione o município do Rio de Janeiro no mapa para ver a composição da câmara municipal.";
    this.messageEl.className = "sankey-message sankey-message--hint";
  }

  showUnavailable(cityName: string): void {
    this.clearChart();
    this.svg.classed("is-visible", false).attr("aria-hidden", "true").style("display", null);
    this.messageEl.hidden = false;
    this.messageEl.textContent = `Dados da câmara municipal de ${cityName} ainda não estão disponíveis. Por enquanto, apenas o Rio de Janeiro.`;
    this.messageEl.className = "sankey-message sankey-message--warn";
  }

  render(graph: AppSankeyGraph, title: string): void {
    if (!graph.nodes.length || !graph.links.length) {
      console.warn("Sankey: grafo vazio");
      this.showEmptyState();
      return;
    }

    this.clearChart();
    this.messageEl.hidden = true;
    this.svg.classed("is-visible", true).attr("aria-hidden", "false").style("display", null);

    const layoutGraph = {
      nodes: graph.nodes.map((n) => ({ name: n.name })),
      links: graph.links.map((l) => ({
        source: l.source as number,
        target: l.target as number,
        value: Math.max(0, l.value),
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

    const { nodes, links } = layout(layoutGraph);
    const linkPath = sankeyLinkHorizontal();
    const activeLinks = links.filter((l) => l.value > 0);
    const activeNodes = nodes.filter((n) => (n.value ?? 0) > 0);
    const graphForUpdate = { nodes: activeNodes, links: activeLinks };

    const innerG = this.chartG
      .append("g")
      .attr("class", "sankey-inner")
      .attr("transform", `translate(${CHART_OFFSET_X},${CHART_OFFSET_Y})`);

    const dragContainer = innerG.node()!;

    const linkSelection = innerG
      .append("g")
      .attr("class", "sankey-links")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.2)
      .style("pointer-events", "none")
      .selectAll<SVGPathElement, LayoutLink>("path")
      .data(activeLinks)
      .join("path")
      .attr("class", (d) => (d.value ? "link" : "link zero"))
      .attr("d", linkPath)
      .attr("stroke-width", (d) => Math.max(1, d.width ?? 0))
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

    linkSelection.append("title").text((d) => {
      const s = d.source as LayoutNode;
      const t = d.target as LayoutNode;
      return `${s.name} → ${t.name}\n${d.value}`;
    });

    const nodeSelection = innerG
      .append("g")
      .attr("class", "sankey-nodes")
      .selectAll<SVGGElement, LayoutNode>("g")
      .data(activeNodes)
      .join("g")
      .attr("class", (d) => ((d.value ?? 0) > 0 ? "node" : "node zero"))
      .attr("transform", (d) => `translate(${d.x0 ?? 0},${d.y0 ?? 0})`);

    nodeSelection
      .append("rect")
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("width", (d) => Math.max(1, (d.x1 ?? 0) - (d.x0 ?? 0)))
      .style("fill", (d) => orientacaoToColor(orientacaoFromSankeyNodeName(d.name)))
      .style("stroke", (d) => orientacaoToColor(orientacaoFromSankeyNodeName(d.name)))
      .append("title")
      .text((d) => `${d.name}\n${formatValue(d.value ?? 0)}`);

    nodeSelection
      .append("text")
      .attr("x", -6)
      .attr("y", (d) => ((d.y1 ?? 0) - (d.y0 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => d.name)
      .filter((d) => (d.x0 ?? 0) < SANKEY_WIDTH / 2)
      .attr("x", (d) => (d.x1 ?? 0) - (d.x0 ?? 0) + 6)
      .attr("text-anchor", "start");

    const nodeDrag = drag<SVGRectElement, LayoutNode>()
      .container(() => dragContainer)
      .subject(function (_event, d) {
        return { x: d.x0 ?? 0, y: d.y0 ?? 0 };
      })
      .on("start", function () {
        select(this.parentNode as SVGGElement).raise();
      })
      .on("drag", function (event, d) {
        const nodeHeight = (d.y1 ?? 0) - (d.y0 ?? 0);
        const y = Math.max(
          MARGIN.top,
          Math.min(INNER_HEIGHT - nodeHeight, event.y),
        );
        d.y0 = y;
        d.y1 = y + nodeHeight;
        select(this.parentNode as SVGGElement).attr(
          "transform",
          `translate(${d.x0 ?? 0},${y})`,
        );
        layout.update(graphForUpdate);
        linkSelection.attr("d", linkPath);
      });

    nodeSelection.selectAll<SVGRectElement, LayoutNode>("rect").call(nodeDrag);

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
