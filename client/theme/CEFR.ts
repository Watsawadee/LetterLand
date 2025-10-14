import { Color } from "@/theme/Color";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LEVEL_TO_COLOR: Record<CEFRLevel, string> = {
  A1: Color.A1,
  A2: Color.A2,
  B1: Color.B1,
  B2: Color.B2,
  C1: Color.C1,
  C2: Color.C2,
};

export function getCEFRColor(level: CEFRLevel): string {
  return LEVEL_TO_COLOR[level];
}