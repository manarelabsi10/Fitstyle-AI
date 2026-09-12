// Canonical body-shape taxonomy used by the models (FitVerse sizing + FitStyle_v16 recommendation):
//   "pear" | "hourglass" | "apple" | "rectangle" | "inverted_triangle"
//
// The frontend's BodyShapeType (src/types.ts) displays these as Title Case with spaces:
//   "Pear" | "Hourglass" | "Apple" | "Rectangle" | "Inverted Triangle"
//
// Use these two helpers at the boundary (API responses <-> UI) instead of hardcoding
// the conversion in multiple components.

import { BodyShapeType } from "../types";

const CANONICAL_TO_DISPLAY: Record<string, BodyShapeType> = {
  pear: "Pear",
  hourglass: "Hourglass",
  apple: "Apple",
  rectangle: "Rectangle",
  inverted_triangle: "Inverted Triangle",
};

const DISPLAY_TO_CANONICAL: Record<BodyShapeType, string> = {
  Pear: "pear",
  Hourglass: "hourglass",
  Apple: "apple",
  Rectangle: "rectangle",
  "Inverted Triangle": "inverted_triangle",
};

/** Model/API canonical value ("pear") -> UI display value ("Pear") */
export function toDisplayBodyShape(canonical: string): BodyShapeType {
  return CANONICAL_TO_DISPLAY[canonical] ?? "Rectangle";
}

/** UI display value ("Pear") -> model/API canonical value ("pear") */
export function toCanonicalBodyShape(display: BodyShapeType): string {
  return DISPLAY_TO_CANONICAL[display] ?? "rectangle";
}
