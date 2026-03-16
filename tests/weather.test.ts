import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPointData, getForecast } from "../src/nws-service";
import { PointResponse, ForecastResponse } from "../src/types";

const mockPointResponse: PointResponse = {
  properties: {
    forecast: "https://api.weather.gov/gridpoints/TOP/31,80/forecast",
    relativeLocation: {
      properties: {
        city: "Austin",
        state: "TX",
      },
    },
  },
};

const mockForecastResponse: ForecastResponse = {
  properties: {
    periods: [
      {
        number: 1,
        name: "Tonight",
        temperature: 72,
        temperatureUnit: "F",
        shortForecast: "Mostly Clear",
        detailedForecast: "Mostly clear tonight",
      },
    ],
  },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getPointData", () => {
  it("returns parsed point data for valid coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockPointResponse,
      })
    );

    const result = await getPointData("30.2672", "-97.7431");

    expect(result).toEqual(mockPointResponse);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.weather.gov/points/30.2672,-97.7431",
      expect.objectContaining({ headers: expect.objectContaining({ "User-Agent": expect.any(String) }) })
    );
  });
});

describe("getForecast", () => {
  it("returns parsed forecast for a valid forecast URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockForecastResponse,
      })
    );

    const result = await getForecast("https://api.weather.gov/gridpoints/TOP/31,80/forecast");

    expect(result).toEqual(mockForecastResponse);
  });
});
