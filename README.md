## Weather Cache CLI

A small TypeScript CLI that fetches weather forecasts from the National Weather Service (NWS) API, caches the forecast in Redis, and prints a human‑readable summary to stdout.

### Stack

- **Language**: TypeScript (run via `ts-node`)
- **Runtime**: Node.js 18+ (for built‑in `fetch`)
- **Cache**: Redis via `ioredis`
- **HTTP**: Native `fetch` against `api.weather.gov`
- **Tests**: `vitest`

### Project structure

```text
src/
  index.ts        # Entry point — orchestrates flow, handles top-level errors
  nws-service.ts  # NWS API client (points + forecast)
  cache.ts        # Redis read/write wrapper (WeatherCache class)
  types.ts        # TypeScript interfaces for NWS API responses
  config.ts       # Env-driven config and constants
  display.ts      # Formatting and printing of forecast data
tests/
  weather.test.ts # NWS client tests (mocked fetch)
  cache.test.ts   # Cache hit/miss + TTL behavior (mocked Redis)
docker-compose.yml  # Local Redis via Docker Compose
```

### Prerequisites

- Node.js **18+**
- Docker and Docker Compose (for Redis)

### Running Redis

From the project root:

```bash
docker compose up -d
```

This starts a Redis container on `localhost:6379` with a simple health check. To stop it:

```bash
docker compose down
```

> The Redis container must be running before executing the CLI.

### Configuration

Configuration is driven by environment variables with sensible defaults:

- `REDIS_HOST` — Redis host (default: `localhost`)
- `REDIS_PORT` — Redis port (default: `6379`)
- `LAT` — default latitude if not passed as a CLI arg
- `LON` — default longitude if not passed as a CLI arg

`src/config.ts` reads these via `process.env`. There is deliberately no `dotenv` dependency; you can export them from your shell or set them inline when running:

```bash
export LAT=30.2672
export LON=-97.7431
```

or:

```bash
LAT=30.2672 LON=-97.7431 npm start
```

### Installing dependencies

```bash
npm install
```

### Running the CLI

You can provide coordinates either via CLI arguments or environment variables.

- **Via CLI args** (lat, lon):

```bash
npm start -- 30.2672 -97.7431
```

- **Via env vars** (falls back to `LAT` / `LON` when args are omitted):

```bash
export LAT=30.2672
export LON=-97.7431
npm start
```

The CLI will:

1. Look up the NWS **points** endpoint for the given coordinates.
2. Extract the `properties.forecast` URL and relative location (city/state).
3. Check Redis for a cached forecast under that URL.
4. On **cache hit**: deserialize and display the cached forecast.
5. On **cache miss**: fetch the forecast from NWS, cache it with a 30‑minute TTL, and display it.

Output includes the city/state and each forecast period’s number, name, temperature + unit, and short forecast.

### Caching behavior

- Only the **forecast response** is cached.
- Cache key: the NWS `properties.forecast` URL.
- TTL: 30 minutes (configured via `CACHE_TTL_SECONDS` in `config.ts`).
- Cache read/write errors are logged as **warnings** and do **not** crash the CLI; it will fall back to hitting the API directly.

### NWS API and rate limiting

All NWS requests:

- Use the base URL `https://api.weather.gov`.
- Include a required `User-Agent` header defined in `config.ts`.

If the API returns **429 (rate limited)**, the client throws a descriptive error such as:

> NWS API rate limit exceeded. Please wait a few seconds and try again.

Other non‑OK responses result in an error that includes the HTTP status code and URL; this is caught once at the `index.ts` boundary and printed to stderr.

### Running tests

Tests are written with `vitest` and use mocked dependencies (no real network or Redis calls):

```bash
npm test
```

- `tests/cache.test.ts` covers:
  - Cache hit: Redis returns JSON string → parsed `ForecastResponse`.
  - Cache miss: Redis returns `null` → `null` result.
  - Correct `set` behavior: serialized JSON, `"EX"` mode, and TTL.
- `tests/weather.test.ts` (or `tests/nws-service` depending on file name) covers the NWS client using mocked `fetch`.

### Design notes

- Each module has a single responsibility and is small enough to reason about in isolation.
- The Redis client is created once in `index.ts` and passed into `WeatherCache` (no global Redis instances).
- Async/await is used throughout; there are no raw Promise chains.
- Error handling follows the pattern: **fail softly inside modules, fail loudly at the CLI boundary**.  

