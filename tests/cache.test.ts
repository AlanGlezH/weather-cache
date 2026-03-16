import { describe, it, expect, vi, beforeEach } from "vitest";
import { WeatherCache } from "../src/cache";
import { ForecastResponse } from "../src/types";
import Redis from "ioredis";

const mockForecastResponse: ForecastResponse = {
  properties: {
    periods: [
      {
        number: 1,
        name: "Tonight",
        temperature: 55,
        temperatureUnit: "F",
        shortForecast: "Partly Cloudy",
        detailedForecast: "Partly cloudy tonight",
      },
    ],
  },
};

const mockClient = {
  get: vi.fn<[string], Promise<string | null>>(),
  set: vi.fn<[string, string, string, number], Promise<"OK">>(),
};

let cache: WeatherCache;

beforeEach(() => {
  vi.clearAllMocks();
  cache = new WeatherCache(mockClient as unknown as Redis);
});

describe("WeatherCache.get", () => {
  it("returns parsed forecast on cache HIT", async () => {
    mockClient.get.mockResolvedValue(JSON.stringify(mockForecastResponse));

    const result = await cache.get("https://api.weather.gov/forecast/ABC/1,2/hourly");

    expect(result).toEqual(mockForecastResponse);
    expect(mockClient.get).toHaveBeenCalledWith("https://api.weather.gov/forecast/ABC/1,2/hourly");
  });

  it("returns null on cache MISS", async () => {
    mockClient.get.mockResolvedValue(null);

    const result = await cache.get("missing-key");

    expect(result).toBeNull();
    expect(mockClient.get).toHaveBeenCalledWith("missing-key");
  });
});

describe("WeatherCache.set", () => {
  it("serializes and saves value with TTL", async () => {
    mockClient.set.mockResolvedValue("OK");

    await cache.set("forecast-key", mockForecastResponse, 1800);

    expect(mockClient.set).toHaveBeenCalledWith(
      "forecast-key",
      JSON.stringify(mockForecastResponse),
      "EX",
      1800,
    );
  });
});

