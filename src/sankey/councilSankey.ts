import { drag, format, select, type Selection } from "d3";
import {
  sankey,
  sankeyJustify,
  type SankeyLink,
  type SankeyNode,
} from "d3-sankey";
import { SANKEY_HEIGHT, SANKEY_WIDTH } from "../config";
import type { SankeyGraph as AppSankeyGraph } from "../types/election";
import { orientacaoFromSankeyNodeName, orientacaoToColor } from "../utils/colors";
import {
  clampSankeyNodeY,
  SANKEY_NODE_WIDTH,
  sankeyLayoutExtent,
} from "./sankeyLayout";
import { sankeyFlowPath } from "./sankeyLinkPath";

type LayoutNode = SankeyNode<{}, {}> & { name: string };
type LayoutLink = SankeyLink<LayoutNode, {}>;

const UNITS = "Cadeiras";

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

    const { extent, yMin, yMax } = sankeyLayoutExtent();

    const layoutGraph = {
      nodes: graph.nodes.map((n) => ({ name: n.name })),
      links: graph.links.map((l) => ({
        source: l.source as number,
        target: l.target as number,
        value: Math.max(0, l.value),
      })),
    };

    const layout = sankey<LayoutNode, LayoutLink>()
      .nodeWidth(SANKEY_NODE_WIDTH)
      .nodePadding(30)
      .nodeAlign(sankeyJustify)
      .extent(extent);

    const { nodes, links } = layout(layoutGraph);
    const flowPath = (d: LayoutLink) =>
      sankeyFlowPath(d.source as LayoutNode, d.target as LayoutNode);
    const activeLinks = links.filter((l) => l.value > 0);
    const activeNodes = nodes.filter((n) => (n.value ?? 0) > 0);

    const innerG = this.chartG.append("g").attr("class", "sankey-inner");
    const dragContainer = innerG.node()!;

    const linkSelection = innerG
      .append("g")
      .attr("class", "sankey-links")
      .style("pointer-events", "none")
      .selectAll<SVGPathElement, LayoutLink>("path")
      .data(activeLinks)
      .join("path")
      .attr("class", (d) => (d.value ? "link" : "link zero"))
      .attr("d", flowPath)
      .attr("stroke", "none")
      .style("fill", (d) =>
        orientacaoToColor(
          orientacaoFromSankeyNodeName((d.source as LayoutNode).name),
        ),
      )
      .style("fill-opacity", 0.45)
      .sort((a, b) => {
        const aH =
          ((a.target as LayoutNode).y1 ?? 0) -
          ((a.target as LayoutNode).y0 ?? 0);
        const bH =
          ((b.target as LayoutNode).y1 ?? 0) -
          ((b.target as LayoutNode).y0 ?? 0);
        return bH - aH;
      });

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
        const y = clampSankeyNodeY(event.y, nodeHeight, yMin, yMax);
        d.y0 = y;
        d.y1 = y + nodeHeight;
        select(this.parentNode as SVGGElement).attr(
          "transform",
          `translate(${d.x0 ?? 0},${y})`,
        );
        linkSelection.attr("d", flowPath);
      });

    nodeSelection.selectAll<SVGRectElement, LayoutNode>("rect").call(nodeDrag);

    this.chartG
      .append("text")
      .attr("class", "chartTitle2")
      .attr("transform", `translate(${SANKEY_WIDTH / 2},22)`)
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
