import vocabulary from "./amenity-vocabulary.json";

export const AMENITY_VOCABULARY: readonly string[] = vocabulary;

export function amenityLabel(tag: string): string {
  return tag.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
