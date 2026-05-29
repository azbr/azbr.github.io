import { interpolateRgb } from "d3";
import { scaleLinear } from "d3";

const orientationScale = scaleLinear<string>()
  .domain([1, 6])
  .range(["#d73027", "#4575b4"])
  .interpolate(interpolateRgb);

export function orientacaoToColor(orientacao: number): string {
  const clamped = Math.max(1, Math.min(6, orientacao));
  return orientationScale(clamped) ?? "#ccc";
}

export function orientacaoFromSankeyNodeName(name: string): number {
  const digit = name.charAt(6);
  const value = Number(digit);
  return Number.isFinite(value) ? value : 4;
}
