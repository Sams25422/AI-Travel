/**
 * TrackerService — GPS via expo-location; Paris demo simulator on web
 */
import {Platform} from 'react-native';
import * as Location from 'expo-location';
import type {RawLocation, TrackerConfig, GeoPoint, ActivityType} from '../models';
import {locationStorage, settingsStorage} from '../utils/storage';
import {
  generateUUID,
  log,
  logError,
  calculateSpeed,
  inferActivityFromSpeed,
} from '../utils/helpers';
import {TRACKING_CONFIG, LOCAL_USER_ID} from '../utils/constants';
import PermissionService from './PermissionService';

type TrackerState = 'stopped' | 'active' | 'paused';

const DEMO_PATH: GeoPoint[] = [
  {latitude: 48.8606, longitude: 2.3376},
  {latitude: 48.8584, longitude: 2.2945},
  {latitude: 48.8738, longitude: 2.295},
  {latitude: 48.8867, longitude: 2.3431},
  {latitude: 48.853, longitude: 2.3499},
  {latitude: 48.8606, longitude: 2.3522},
  {latitude: 48.849, longitude: 2.345},
];

class TrackerService {
  private state: TrackerState = 'stopped';
  private currentTripId: string | null = null;
  private lastFix: {point: GeoPoint; at: Date} | null = null;
  private currentActivity: ActivityType = 'stationary';
  private config: TrackerConfig | null = null;
  private watchSub: Location.LocationSubscription | null = null;
  private demoTimer: ReturnType<typeof setInterval> | null = null;
  private demoIndex = 0;
  private demoMode = Platform.OS === 'web';
  private listeners: Array<(loc: RawLocation) => void> = [];

  async initialize(): Promise<void> {
    log('TrackerService: Initializing');
    this.config = (await settingsStorage.getTrackerConfig()) || this.defaultConfig();
    await settingsStorage.saveTrackerConfig(this.config);
    const settings = await settingsStorage.getSettings();
    if (settings) this.demoMode = settings.demoMode || Platform.OS === 'web';
    if (this.config.isActive && this.config.currentTripId) {
      this.currentTripId = this.config.currentTripId;
    }
  }

  onLocation(listener: (loc: RawLocation) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  setDemoMode(enabled: boolean): void {
    this.demoMode = enabled;
  }

  isDemoMode(): boolean {
    return this.demoMode;
  }

  getState(): TrackerState {
    return this.state;
  }

  getCurrentTripId(): string | null {
    return this.currentTripId;
  }

  async startTracking(tripId: string): Promise<void> {
    log('TrackerService: start', tripId);
    if (!this.demoMode) {
      const status = await PermissionService.requestLocationWhenInUse();
      if (status !== 'granted') {
        throw new Error('Location permission is required to track your trip.');
      }
    }

    this.currentTripId = tripId;
    this.state = 'active';
    this.demoIndex = 0;

    if (this.config) {
      this.config.isActive = true;
      this.config.currentTripId = tripId;
      await settingsStorage.saveTrackerConfig(this.config);
    }

    if (this.demoMode) this.startDemoLoop();
    else await this.startNativeWatch();
  }

  async stopTracking(): Promise<void> {
    this.state = 'stopped';
    this.currentTripId = null;
    await this.clearWatchers();
    if (this.config) {
      this.config.isActive = false;
      this.config.currentTripId = undefined;
      await settingsStorage.saveTrackerConfig(this.config);
    }
  }

  async pauseTracking(): Promise<void> {
    this.state = 'paused';
    await this.clearWatchers();
  }

  async resumeTracking(): Promise<void> {
    if (!this.currentTripId) throw new Error('No trip to resume');
    this.state = 'active';
    if (this.demoMode) this.startDemoLoop();
    else await this.startNativeWatch();
  }

  async simulateDayTrip(tripId: string): Promise<number> {
    this.currentTripId = tripId;
    let count = 0;
    const base = Date.now() - DEMO_PATH.length * 25 * 60 * 1000;
    for (let i = 0; i < DEMO_PATH.length; i++) {
      const point = DEMO_PATH[i];
      for (let d = 0; d < 3; d++) {
        const ts = new Date(base + i * 25 * 60 * 1000 + d * 8 * 60 * 1000);
        await this.persist(point, ts, d === 0 && i > 0 ? 3.5 : 0.15);
        count++;
      }
    }
    return count;
  }

  private async startNativeWatch(): Promise<void> {
    await this.clearWatchers();
    this.watchSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: TRACKING_CONFIG.ACTIVE_INTERVAL,
        distanceInterval: TRACKING_CONFIG.MIN_DISPLACEMENT,
      },
      loc => {
        if (this.state !== 'active') return;
        void this.persist(
          {latitude: loc.coords.latitude, longitude: loc.coords.longitude},
          new Date(loc.timestamp),
          loc.coords.speed ?? undefined,
          loc.coords.accuracy ?? undefined,
          loc.coords.altitude ?? undefined,
          loc.coords.heading ?? undefined,
        );
      },
    );
  }

  private startDemoLoop(): void {
    void this.clearWatchers();
    void this.emitDemoPoint();
    this.demoTimer = setInterval(() => {
      if (this.state === 'active') void this.emitDemoPoint();
    }, 4000);
  }

  private async emitDemoPoint(): Promise<void> {
    const point = DEMO_PATH[this.demoIndex % DEMO_PATH.length];
    this.demoIndex += 1;
    await this.persist(point, new Date(), 1.1);
  }

  private async persist(
    point: GeoPoint,
    timestamp: Date,
    speedHint?: number,
    accuracy?: number,
    altitude?: number,
    heading?: number,
  ): Promise<void> {
    if (!this.currentTripId) return;

    let speed = speedHint;
    if ((speed == null || Number.isNaN(speed)) && this.lastFix) {
      speed = calculateSpeed(this.lastFix.point, point, this.lastFix.at, timestamp);
    }
    this.currentActivity = inferActivityFromSpeed(speed ?? 0);

    const raw: RawLocation = {
      id: generateUUID(),
      ownerUid: LOCAL_USER_ID,
      tripId: this.currentTripId,
      location: point,
      timestamp: timestamp.toISOString(),
      accuracy,
      altitude,
      speed: speed ?? undefined,
      heading,
      activity: this.currentActivity,
      isProcessed: false,
    };

    await locationStorage.savePending(raw);
    this.lastFix = {point, at: timestamp};
    this.listeners.forEach(l => l(raw));
  }

  private async clearWatchers(): Promise<void> {
    if (this.watchSub) {
      this.watchSub.remove();
      this.watchSub = null;
    }
    if (this.demoTimer) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
  }

  private defaultConfig(): TrackerConfig {
    return {
      isActive: false,
      updateInterval: TRACKING_CONFIG.ACTIVE_INTERVAL,
      distanceFilter: TRACKING_CONFIG.MIN_DISPLACEMENT,
      stationaryRadius: TRACKING_CONFIG.STATIONARY_RADIUS,
      stopTimeout: TRACKING_CONFIG.MIN_DWELL_TIME,
    };
  }
}

export default new TrackerService();
