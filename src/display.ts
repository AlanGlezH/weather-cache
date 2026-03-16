import { ForecastPeriod } from "./types";

export function displayForecast(city: string, state: string, periods: ForecastPeriod[]): void {
  console.log(`\n${city}, ${state}\n`);

  for (const period of periods) {
    console.log(`${period.number}. ${period.name}`);
    console.log(`   ${period.temperature}°${period.temperatureUnit} — ${period.shortForecast}`);
    console.log(`   Detailed Forecast: ${period.detailedForecast}`);
  }
}
