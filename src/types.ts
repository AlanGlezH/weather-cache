export interface PointProperties {
  forecast: string;
  relativeLocation: {
    properties: {
      city: string;
      state: string;
    };
  };
}

export interface PointResponse {
  properties: PointProperties;
}

export interface ForecastPeriod {
  number: number;
  name: string;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface ForecastProperties {
  periods: ForecastPeriod[];
}

export interface ForecastResponse {
  properties: ForecastProperties;
}

export interface IWeatherCache {
  get(key: string): Promise<ForecastResponse | null>;
  set(key: string, value: ForecastResponse, ttlSeconds: number): Promise<void>;
}
