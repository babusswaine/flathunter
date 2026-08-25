import data from "./city-landmarks.json";

export interface CityLandmark {
  image: string;
  attribution: string | null;
}

const landmarks: Record<string, CityLandmark> = data;

export function getCityLandmark(city: string): CityLandmark | null {
  return landmarks[city] ?? null;
}
