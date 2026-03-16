export const NWS_BASE_URL = "https://api.weather.gov";
export const USER_AGENT = "weather-cache-cli, contact@example.com";
export const CACHE_TTL_SECONDS = 1800;

export const REDIS_HOST = process.env.REDIS_HOST ?? "localhost";
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

export const LAT = process.env.LAT ?? "";
export const LON = process.env.LON ?? "";

export const REDIS_EXPIRE_MOD = "EX" 