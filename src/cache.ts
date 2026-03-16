import { Redis } from "ioredis";
import { ForecastResponse, IWeatherCache } from "./types";
import { REDIS_EXPIRE_MOD } from "./config";

export class WeatherCache implements IWeatherCache {
  constructor(private readonly client: Redis) {}

  async get(key: string): Promise<ForecastResponse | null> {
    try {
      const cached = await this.client.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as ForecastResponse;
    } catch (error) {
      console.warn("Cache read failed, falling through to API:", error);
      return null;
    }
  }

  async set(key: string, value: ForecastResponse, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), REDIS_EXPIRE_MOD, ttlSeconds);
    } catch (error) {
      console.warn("Cache write failed:", error);
    }
  }
}
