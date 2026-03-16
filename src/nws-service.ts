import { NWS_BASE_URL, USER_AGENT } from "./config";
import { ForecastResponse, PointResponse } from "./types";

const headers = { "User-Agent": USER_AGENT };

async function nwsApiCall<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers });

  if (response.status === 429) {
    throw new Error("NWS API rate limit exceeded. Please wait a few seconds and try again.");
  }

  if (!response.ok) {
    throw new Error(`NWS API request failed: ${response.status} ${response.statusText} — ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function getPointData(lat: string, lon: string): Promise<PointResponse> {
  return nwsApiCall<PointResponse>(`${NWS_BASE_URL}/points/${lat},${lon}`);
}

export async function getForecast(forecastUrl: string): Promise<ForecastResponse> {
  return nwsApiCall<ForecastResponse>(forecastUrl);
}
