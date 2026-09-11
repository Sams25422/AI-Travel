/**
 * AsyncStorage wrappers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Trip,
  Step,
  RawLocation,
  UserSettings,
  TrackerConfig,
  BookOrder,
  PhotoCluster,
  AppPermissions,
  ItineraryItem,
} from '../models';

export const STORAGE_KEYS = {
  USER_SETTINGS: '@atlas/user_settings',
  ONBOARDING_COMPLETED: '@atlas/onboarding_completed',
  ACTIVE_TRIP_ID: '@atlas/active_trip_id',
  TRACKER_CONFIG: '@atlas/tracker_config',
  TRIPS: '@atlas/trips',
  STEPS: '@atlas/steps',
  ITINERARY: '@atlas/itinerary',
  PENDING_LOCATIONS: '@atlas/pending_locations',
  PHOTO_CLUSTERS: '@atlas/photo_clusters',
  ORDERS: '@atlas/orders',
  PERMISSIONS: '@atlas/permissions',
} as const;

export const storage = {
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : null;
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

export const tripStorage = {
  async save(trip: Trip): Promise<void> {
    const trips = await this.getAll();
    const i = trips.findIndex(t => t.id === trip.id);
    if (i >= 0) trips[i] = trip;
    else trips.push(trip);
    await storage.set(STORAGE_KEYS.TRIPS, trips);
  },
  async getAll(): Promise<Trip[]> {
    return (await storage.get<Trip[]>(STORAGE_KEYS.TRIPS)) || [];
  },
  async get(tripId: string): Promise<Trip | null> {
    return (await this.getAll()).find(t => t.id === tripId) || null;
  },
  async remove(tripId: string): Promise<void> {
    await storage.set(
      STORAGE_KEYS.TRIPS,
      (await this.getAll()).filter(t => t.id !== tripId),
    );
    await storage.set(
      STORAGE_KEYS.STEPS,
      (await stepStorage.getAll()).filter(s => s.tripId !== tripId),
    );
    await storage.set(
      STORAGE_KEYS.ITINERARY,
      (await itineraryStorage.getAll()).filter(i => i.tripId !== tripId),
    );
  },
  async getActiveTripId(): Promise<string | null> {
    return storage.get<string>(STORAGE_KEYS.ACTIVE_TRIP_ID);
  },
  async setActiveTripId(tripId: string | null): Promise<void> {
    if (tripId) await storage.set(STORAGE_KEYS.ACTIVE_TRIP_ID, tripId);
    else await storage.remove(STORAGE_KEYS.ACTIVE_TRIP_ID);
  },
};

export const itineraryStorage = {
  async getAll(): Promise<ItineraryItem[]> {
    return (await storage.get<ItineraryItem[]>(STORAGE_KEYS.ITINERARY)) || [];
  },
  async getForTrip(tripId: string): Promise<ItineraryItem[]> {
    return (await this.getAll())
      .filter(i => i.tripId === tripId)
      .sort((a, b) => a.dayIndex - b.dayIndex || a.sortOrder - b.sortOrder || +new Date(a.startTime) - +new Date(b.startTime));
  },
  async get(id: string): Promise<ItineraryItem | null> {
    return (await this.getAll()).find(i => i.id === id) || null;
  },
  async save(item: ItineraryItem): Promise<void> {
    const items = await this.getAll();
    const i = items.findIndex(x => x.id === item.id);
    if (i >= 0) items[i] = item;
    else items.push(item);
    await storage.set(STORAGE_KEYS.ITINERARY, items);
  },
  async replaceForTrip(tripId: string, items: ItineraryItem[]): Promise<void> {
    const others = (await this.getAll()).filter(i => i.tripId !== tripId);
    await storage.set(STORAGE_KEYS.ITINERARY, [...others, ...items]);
  },
  async remove(id: string): Promise<void> {
    await storage.set(
      STORAGE_KEYS.ITINERARY,
      (await this.getAll()).filter(i => i.id !== id),
    );
  },
};

export const stepStorage = {
  async getAll(): Promise<Step[]> {
    return (await storage.get<Step[]>(STORAGE_KEYS.STEPS)) || [];
  },
  async getForTrip(tripId: string): Promise<Step[]> {
    return (await this.getAll())
      .filter(s => s.tripId === tripId)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  },
  async get(stepId: string): Promise<Step | null> {
    return (await this.getAll()).find(s => s.id === stepId) || null;
  },
  async save(step: Step): Promise<void> {
    const steps = await this.getAll();
    const i = steps.findIndex(s => s.id === step.id);
    if (i >= 0) steps[i] = step;
    else steps.push(step);
    await storage.set(STORAGE_KEYS.STEPS, steps);
  },
  async remove(stepId: string): Promise<void> {
    await storage.set(
      STORAGE_KEYS.STEPS,
      (await this.getAll()).filter(s => s.id !== stepId),
    );
  },
  async replaceForTrip(tripId: string, newSteps: Step[]): Promise<void> {
    const others = (await this.getAll()).filter(s => s.tripId !== tripId);
    await storage.set(STORAGE_KEYS.STEPS, [...others, ...newSteps]);
  },
};

export const locationStorage = {
  async savePending(location: RawLocation): Promise<void> {
    const pending = await this.getPending();
    pending.push(location);
    await storage.set(STORAGE_KEYS.PENDING_LOCATIONS, pending);
  },
  async getPending(): Promise<RawLocation[]> {
    return (await storage.get<RawLocation[]>(STORAGE_KEYS.PENDING_LOCATIONS)) || [];
  },
  async getForTrip(tripId: string): Promise<RawLocation[]> {
    return (await this.getPending())
      .filter(l => l.tripId === tripId)
      .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  },
  async clearPending(): Promise<void> {
    await storage.set(STORAGE_KEYS.PENDING_LOCATIONS, []);
  },
  async markProcessed(ids: string[]): Promise<void> {
    const set = new Set(ids);
    await storage.set(
      STORAGE_KEYS.PENDING_LOCATIONS,
      (await this.getPending()).map(l => (set.has(l.id) ? {...l, isProcessed: true} : l)),
    );
  },
};

export const clusterStorage = {
  async getAll(): Promise<PhotoCluster[]> {
    return (await storage.get<PhotoCluster[]>(STORAGE_KEYS.PHOTO_CLUSTERS)) || [];
  },
  async saveForTrip(tripId: string, clusters: PhotoCluster[]): Promise<void> {
    const others = (await this.getAll()).filter(c => c.tripId !== tripId);
    await storage.set(STORAGE_KEYS.PHOTO_CLUSTERS, [...others, ...clusters]);
  },
  async getForTrip(tripId: string): Promise<PhotoCluster[]> {
    return (await this.getAll()).filter(c => c.tripId === tripId);
  },
};

export const orderStorage = {
  async getAll(): Promise<BookOrder[]> {
    return (await storage.get<BookOrder[]>(STORAGE_KEYS.ORDERS)) || [];
  },
  async save(order: BookOrder): Promise<void> {
    const orders = await this.getAll();
    const i = orders.findIndex(o => o.id === order.id);
    if (i >= 0) orders[i] = order;
    else orders.push(order);
    await storage.set(STORAGE_KEYS.ORDERS, orders);
  },
  async get(orderId: string): Promise<BookOrder | null> {
    return (await this.getAll()).find(o => o.id === orderId) || null;
  },
};

export const settingsStorage = {
  async saveSettings(settings: UserSettings): Promise<void> {
    await storage.set(STORAGE_KEYS.USER_SETTINGS, settings);
  },
  async getSettings(): Promise<UserSettings | null> {
    return storage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
  },
  async getTrackerConfig(): Promise<TrackerConfig | null> {
    return storage.get<TrackerConfig>(STORAGE_KEYS.TRACKER_CONFIG);
  },
  async saveTrackerConfig(config: TrackerConfig): Promise<void> {
    await storage.set(STORAGE_KEYS.TRACKER_CONFIG, config);
  },
  async isOnboardingCompleted(): Promise<boolean> {
    return (await storage.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED)) || false;
  },
  async completeOnboarding(): Promise<void> {
    await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  },
  async savePermissions(permissions: AppPermissions): Promise<void> {
    await storage.set(STORAGE_KEYS.PERMISSIONS, permissions);
  },
  async getPermissions(): Promise<AppPermissions | null> {
    return storage.get<AppPermissions>(STORAGE_KEYS.PERMISSIONS);
  },
};
