import data from "./platform-marks.json";
import type { Platform } from "./types";

export interface PlatformMarkAsset {
  image: string;
  width: number;
  height: number;
}

const marks: Partial<Record<Platform, PlatformMarkAsset>> = data;

export function getPlatformMark(platform: Platform): PlatformMarkAsset | null {
  return marks[platform] ?? null;
}
