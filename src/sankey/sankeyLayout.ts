import { SANKEY_HEIGHT, SANKEY_WIDTH } from "../config";

export const SANKEY_NODE_WIDTH = 50;
export const SANKEY_MARGIN = { top: 20, right: 10, bottom: 50, left: 10 };
export const SANKEY_TITLE_HEIGHT = 35;

export function sankeyInnerHeight(sankeyHeight = SANKEY_HEIGHT): number {
  return sankeyHeight - 100;
}

export interface SankeyLayoutExtent {
  innerHeight: number;
  extent: [[number, number], [number, number]];
  yMin: number;
  yMax: number;
}

export function sankeyLayoutExtent(
  sankeyWidth = SANKEY_WIDTH,
  sankeyHeight = SANKEY_HEIGHT,
  nodeWidth = SANKEY_NODE_WIDTH,
): SankeyLayoutExtent {
  const innerHeight = sankeyInnerHeight(sankeyHeight);
  const yMin = SANKEY_MARGIN.top + SANKEY_TITLE_HEIGHT;
  return {
    innerHeight,
    extent: [
      [SANKEY_MARGIN.left, yMin],
      [sankeyWidth - SANKEY_MARGIN.right - nodeWidth, innerHeight],
    ],
    yMin,
    yMax: innerHeight,
  };
}

export function clampSankeyNodeY(
  y: number,
  nodeHeight: number,
  yMin: number,
  yMax: number,
): number {
  return Math.max(yMin, Math.min(yMax - nodeHeight, y));
}
