import Redis from "ioredis";
import { CACHE_TTL_SECONDS, LAT, LON, REDIS_HOST, REDIS_PORT } from "./config";
import { WeatherCache } from "./cache";
import { getPointData, getForecast } from "./nws-service";
import { displayForecast } from "./display";

async function main(): Promise<void> {
  const lat = process.argv[2] ?? LAT;
  const lon = process.argv[3] ?? LON;

  if (!lat || !lon) {
    throw new Error("Latitude and longitude are required. Pass them as CLI args or set LAT and LON env vars.");
  }

  const client = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
  const cache = new WeatherCache(client);

  try {
    const pointData = await getPointData(lat, lon);
    const { forecast: forecastUrl, relativeLocation } = pointData.properties;
    const { city, state } = relativeLocation.properties;

    const cached = await cache.get(forecastUrl);
    if (cached) {
      displayForecast(city, state, cached.properties.periods);
      return;
    }

    const forecastData = await getForecast(forecastUrl);
    await cache.set(forecastUrl, forecastData, CACHE_TTL_SECONDS);
    displayForecast(city, state, forecastData.properties.periods);
  } finally {
    await client.quit();
  }
}

main().catch((error) => {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
