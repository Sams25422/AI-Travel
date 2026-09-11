/**
 * WeatherService — forecast via Open-Meteo (no API key).
 */
import type {GeoPoint} from '../models';
import {log, logError} from '../utils/helpers';

export interface DailyForecast {
  date: string;
  weatherCode: number;
  label: string;
  tempMaxC: number;
  tempMinC: number;
  precipMm: number;
  windKph: number;
}

export interface WeatherSnapshot {
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currentTempC: number;
  currentLabel: string;
  daily: DailyForecast[];
  fetchedAt: string;
  source: 'open-meteo' | 'fallback';
}

const WEATHER_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm + hail',
  99: 'Severe storm',
};

function labelForCode(code: number): string {
  return WEATHER_LABELS[code] || 'Mixed conditions';
}

function fallbackSnapshot(locationName: string, point: GeoPoint): WeatherSnapshot {
  const today = new Date();
  const daily: DailyForecast[] = Array.from({length: 5}, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      weatherCode: i % 2 === 0 ? 1 : 2,
      label: i % 2 === 0 ? 'Mostly clear' : 'Partly cloudy',
      tempMaxC: 22 - i,
      tempMinC: 14 - i,
      precipMm: i === 2 ? 2.4 : 0,
      windKph: 12 + i,
    };
  });
  return {
    locationName,
    latitude: point.latitude,
    longitude: point.longitude,
    timezone: 'local',
    currentTempC: 18,
    currentLabel: 'Partly cloudy',
    daily,
    fetchedAt: new Date().toISOString(),
    source: 'fallback',
  };
}

class WeatherService {
  async getForecast(
    point: GeoPoint,
    locationName = 'Destination',
    days = 5,
  ): Promise<WeatherSnapshot> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${point.latitude}` +
      `&longitude=${point.longitude}` +
      `&current=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
      `&timezone=auto&forecast_days=${Math.min(7, Math.max(1, days))}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
      const data = await res.json();
      const daily: DailyForecast[] = (data.daily?.time || []).map(
        (date: string, i: number) => ({
          date,
          weatherCode: data.daily.weather_code[i],
          label: labelForCode(data.daily.weather_code[i]),
          tempMaxC: Math.round(data.daily.temperature_2m_max[i]),
          tempMinC: Math.round(data.daily.temperature_2m_min[i]),
          precipMm: Number(data.daily.precipitation_sum[i] ?? 0),
          windKph: Math.round(data.daily.wind_speed_10m_max[i] ?? 0),
        }),
      );
      const snapshot: WeatherSnapshot = {
        locationName,
        latitude: point.latitude,
        longitude: point.longitude,
        timezone: data.timezone || 'auto',
        currentTempC: Math.round(
          data.current?.temperature_2m ?? daily[0]?.tempMaxC ?? 18,
        ),
        currentLabel: labelForCode(
          data.current?.weather_code ?? daily[0]?.weatherCode ?? 2,
        ),
        daily,
        fetchedAt: new Date().toISOString(),
        source: 'open-meteo',
      };
      log('WeatherService: forecast', locationName, snapshot.currentLabel);
      return snapshot;
    } catch (error) {
      logError(error as Error, {context: 'WeatherService.getForecast'});
      return fallbackSnapshot(locationName, point);
    }
  }

  adviceForDay(day: DailyForecast): string {
    if (day.precipMm >= 5 || day.weatherCode >= 61) {
      return 'Pack a light rain layer and keep outdoor stops flexible.';
    }
    if (day.tempMaxC >= 30) {
      return 'Hot day — plan museums or shade for midday.';
    }
    if (day.tempMaxC <= 8) {
      return 'Chilly — warm layers for evening walks.';
    }
    if (day.weatherCode <= 1) {
      return 'Great outdoor day — golden-hour walks will shine.';
    }
    return 'Mild conditions — mix indoor and outdoor freely.';
  }
}

export default new WeatherService();
