/**
 * Shared helpers — canonical exports used by all services
 */
import type {GeoPoint, ActivityType} from '../models';
import {TRACKING_CONFIG} from './constants';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDate(date: Date | string, style: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  if (style === 'short') {
    return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }
  return d.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function calculateDuration(start: Date | string, end: Date | string) {
  const diff = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}

export function formatDuration(start: Date | string, end: Date | string): string {
  const {days, hours, minutes} = calculateDuration(start, end);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function calculateDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371e3;
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const miles = meters * 0.000621371;
    return miles < 0.1 ? `${Math.round(meters * 3.28084)} ft` : `${miles.toFixed(1)} mi`;
  }
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function calculateSpeed(a: GeoPoint, b: GeoPoint, t1: Date | string, t2: Date | string): number {
  const dist = calculateDistance(a, b);
  const secs = (new Date(t2).getTime() - new Date(t1).getTime()) / 1000;
  return secs > 0 ? dist / secs : 0;
}

export function inferActivityFromSpeed(speedMs: number): ActivityType {
  if (speedMs < 0.5) return 'stationary';
  if (speedMs < TRACKING_CONFIG.WALKING_SPEED) return 'walking';
  if (speedMs < TRACKING_CONFIG.DRIVING_SPEED) return 'driving';
  if (speedMs < TRACKING_CONFIG.FLYING_SPEED) return 'train';
  return 'flying';
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function log(message: string, ...args: unknown[]): void {
  if (__DEV__) console.log(`[Atlas] ${message}`, ...args);
}

export function logError(error: Error, context?: Record<string, unknown>): void {
  if (__DEV__) console.error('[Atlas ERROR]', error.message, context);
}

export function countryFromCoords(lat: number, lng: number): string {
  if (lat > 36 && lat < 44 && lng > -10 && lng < 5) return 'France';
  if (lat > 41 && lat < 47 && lng > 6 && lng < 14) return 'Italy';
  if (lat > 48 && lat < 55 && lng > -6 && lng < 2) return 'United Kingdom';
  if (lat > 35 && lat < 46 && lng > 135 && lng < 146) return 'Japan';
  if (lat > 24 && lat < 50 && lng > -125 && lng < -66) return 'United States';
  if (lat > -45 && lat < -10 && lng > 112 && lng < 154) return 'Australia';
  return 'Somewhere beautiful';
}
