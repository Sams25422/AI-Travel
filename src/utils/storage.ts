/**
 * Local Storage Utilities
 * Wraps AsyncStorage for type-safe local data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Trip, Step, RawLocation, UserSettings, TrackerConfig} from '@models';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  // User & Settings
  USER_SETTINGS: '@atlas/user_settings',
  ONBOARDING_COMPLETED: '@atlas/onboarding_completed',

  // Active Trip
  ACTIVE_TRIP_ID: '@atlas/active_trip_id',
  TRACKER_CONFIG: '@atlas/tracker_config',

  // Offline Data Cache
  TRIPS: '@atlas/trips',
  PENDING_LOCATIONS: '@atlas/pending_locations',

  // App State
  PERMISSIONS: '@atlas/permissions',
  LAST_SYNC: '@atlas/last_sync',
} as const;

// ============================================================================
// Generic Storage Functions
// ============================================================================

export const storage = {
  /**
   * Save data to AsyncStorage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get data from AsyncStorage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove data from AsyncStorage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all AsyncStorage data (use with caution!)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  /**
   * Get multiple keys at once
   */
  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      pairs.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  },
};

// ============================================================================
// Domain-Specific Storage Functions
// ============================================================================

export const tripStorage = {
  /**
   * Save a trip to local storage
   */
  async saveTrip(trip: Trip): Promise<void> {
    const trips = await this.getAllTrips();
    const index = trips.findIndex(t => t.id === trip.id);

    if (index >= 0) {
      trips[index] = trip;
    } else {
      trips.push(trip);
    }

    await storage.set(STORAGE_KEYS.TRIPS, trips);
  },

  /**
   * Get all trips from local storage
   */
  async getAllTrips(): Promise<Trip[]> {
    const trips = await storage.get<Trip[]>(STORAGE_KEYS.TRIPS);
    return trips || [];
  },

  /**
   * Get a specific trip by ID
   */
  async getTrip(tripId: string): Promise<Trip | null> {
    const trips = await this.getAllTrips();
    return trips.find(t => t.id === tripId) || null;
  },

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    const trips = await this.getAllTrips();
    const filtered = trips.filter(t => t.id !== tripId);
    await storage.set(STORAGE_KEYS.TRIPS, filtered);
  },

  /**
   * Get the currently active trip ID
   */
  async getActiveTripId(): Promise<string | null> {
    return storage.get<string>(STORAGE_KEYS.ACTIVE_TRIP_ID);
  },

  /**
   * Set the active trip ID
   */
  async setActiveTripId(tripId: string | null): Promise<void> {
    if (tripId) {
      await storage.set(STORAGE_KEYS.ACTIVE_TRIP_ID, tripId);
    } else {
      await storage.remove(STORAGE_KEYS.ACTIVE_TRIP_ID);
    }
  },
};

export const locationStorage = {
  /**
   * Store raw location points that haven't been synced yet
   */
  async savePendingLocation(location: RawLocation): Promise<void> {
    const pending = await this.getPendingLocations();
    pending.push(location);
    await storage.set(STORAGE_KEYS.PENDING_LOCATIONS, pending);
  },

  /**
   * Get all pending locations
   */
  async getPendingLocations(): Promise<RawLocation[]> {
    const locations = await storage.get<RawLocation[]>(STORAGE_KEYS.PENDING_LOCATIONS);
    return locations || [];
  },

  /**
   * Clear pending locations (after successful sync)
   */
  async clearPendingLocations(): Promise<void> {
    await storage.set(STORAGE_KEYS.PENDING_LOCATIONS, []);
  },

  /**
   * Remove specific locations after sync
   */
  async removeSyncedLocations(locationIds: string[]): Promise<void> {
    const pending = await this.getPendingLocations();
    const remaining = pending.filter(loc => !locationIds.includes(loc.id));
    await storage.set(STORAGE_KEYS.PENDING_LOCATIONS, remaining);
  },
};

export const settingsStorage = {
  /**
   * Save user settings
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    await storage.set(STORAGE_KEYS.USER_SETTINGS, settings);
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings | null> {
    return storage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
  },

  /**
   * Get tracker configuration
   */
  async getTrackerConfig(): Promise<TrackerConfig | null> {
    return storage.get<TrackerConfig>(STORAGE_KEYS.TRACKER_CONFIG);
  },

  /**
   * Save tracker configuration
   */
  async saveTrackerConfig(config: TrackerConfig): Promise<void> {
    await storage.set(STORAGE_KEYS.TRACKER_CONFIG, config);
  },

  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const completed = await storage.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed || false;
  },

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  },
};

// ============================================================================
// Export all storage keys for reference
// ============================================================================

export {STORAGE_KEYS};
