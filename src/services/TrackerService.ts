/**
 * TrackerService - Core Location Tracking Service
 *
 * This is the MOST CRITICAL service in Atlas.
 * Responsibilities:
 * - Background location tracking with battery optimization
 * - State-based tracking (stationary, walking, driving, flying)
 * - Store raw location data locally
 * - Batch sync to backend when connected
 *
 * NOTE: This is a stub. Native modules will be required for production.
 */

import {RawLocation, GeoPoint, ActivityType, TrackerConfig} from '@models';
import {locationStorage, settingsStorage} from '@utils/storage';
import {generateUUID, calculateSpeed, inferActivityFromSpeed, log, logError} from '@utils/helpers';
import {TRACKING_CONFIG} from '@utils/constants';

// ============================================================================
// Types
// ============================================================================

type TrackerState = 'stopped' | 'active' | 'paused';

interface LocationUpdate {
  location: GeoPoint;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

// ============================================================================
// TrackerService Class
// ============================================================================

class TrackerService {
  private state: TrackerState = 'stopped';
  private currentTripId: string | null = null;
  private lastLocation: LocationUpdate | null = null;
  private currentActivity: ActivityType = 'stationary';
  private config: TrackerConfig | null = null;

  // Timers & intervals
  private trackingInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the tracker service
   */
  async initialize(): Promise<void> {
    try {
      log('TrackerService: Initializing...');

      // Load saved config
      this.config = await settingsStorage.getTrackerConfig();

      if (!this.config) {
        // Create default config
        this.config = this.getDefaultConfig();
        await settingsStorage.saveTrackerConfig(this.config);
      }

      // If there was an active trip, restore it
      if (this.config.isActive && this.config.currentTripId) {
        log('TrackerService: Restoring active trip', this.config.currentTripId);
        // Note: Don't auto-start, let user manually resume
      }

      log('TrackerService: Initialized successfully');
    } catch (error) {
      logError(error as Error, {context: 'TrackerService.initialize'});
      throw error;
    }
  }

  /**
   * Start tracking for a trip
   */
  async startTracking(tripId: string): Promise<void> {
    try {
      log('TrackerService: Starting tracking for trip', tripId);

      // Check permissions first
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      this.currentTripId = tripId;
      this.state = 'active';
      this.currentActivity = 'stationary';

      // Update config
      if (this.config) {
        this.config.isActive = true;
        this.config.currentTripId = tripId;
        await settingsStorage.saveTrackerConfig(this.config);
      }

      // Start tracking loop
      this.startTrackingLoop();

      // Start periodic sync
      this.startSyncLoop();

      log('TrackerService: Tracking started');
    } catch (error) {
      logError(error as Error, {context: 'TrackerService.startTracking'});
      throw error;
    }
  }

  /**
   * Stop tracking
   */
  async stopTracking(): Promise<void> {
    try {
      log('TrackerService: Stopping tracking');

      this.state = 'stopped';
      this.currentTripId = null;

      // Clear intervals
      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }

      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      // Final sync
      await this.syncPendingLocations();

      // Update config
      if (this.config) {
        this.config.isActive = false;
        this.config.currentTripId = undefined;
        await settingsStorage.saveTrackerConfig(this.config);
      }

      log('TrackerService: Tracking stopped');
    } catch (error) {
      logError(error as Error, {context: 'TrackerService.stopTracking'});
    }
  }

  /**
   * Pause tracking (user still on trip but temporarily stop)
   */
  async pauseTracking(): Promise<void> {
    log('TrackerService: Pausing tracking');
    this.state = 'paused';

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Resume tracking
   */
  async resumeTracking(): Promise<void> {
    if (!this.currentTripId) {
      throw new Error('No active trip to resume');
    }

    log('TrackerService: Resuming tracking');
    this.state = 'active';
    this.startTrackingLoop();
  }

  /**
   * Get current tracking state
   */
  getState(): TrackerState {
    return this.state;
  }

  /**
   * Get current trip ID
   */
  getCurrentTripId(): string | null {
    return this.currentTripId;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Main tracking loop
   */
  private startTrackingLoop(): void {
    // Clear existing interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    // Determine update interval based on activity
    const interval = this.getUpdateInterval();

    this.trackingInterval = setInterval(async () => {
      if (this.state === 'active') {
        await this.captureLocation();
      }
    }, interval);

    // Capture first location immediately
    this.captureLocation();
  }

  /**
   * Capture current location
   *
   * NOTE: This is a stub. In production, this would use:
   * - iOS: CLLocationManager
   * - Android: FusedLocationProviderClient
   */
  private async captureLocation(): Promise<void> {
    try {
      // TODO: Replace with actual native location API
      // For now, using a mock implementation
      const locationUpdate = await this.getCurrentLocation();

      if (!locationUpdate) {
        log('TrackerService: Unable to get location');
        return;
      }

      // Update activity based on speed
      if (this.lastLocation) {
        const speed = calculateSpeed(
          this.lastLocation.location,
          locationUpdate.location,
          this.lastLocation.timestamp,
          locationUpdate.timestamp,
        );
        this.currentActivity = inferActivityFromSpeed(speed);
      }

      // Create raw location record
      const rawLocation: RawLocation = {
        id: generateUUID(),
        ownerUid: 'local_user', // TODO: Get from auth
        tripId: this.currentTripId!,
        location: locationUpdate.location,
        timestamp: locationUpdate.timestamp,
        accuracy: locationUpdate.accuracy,
        altitude: locationUpdate.altitude,
        speed: locationUpdate.speed,
        heading: locationUpdate.heading,
        activity: this.currentActivity,
        isProcessed: false,
      };

      // Save to local storage
      await locationStorage.savePendingLocation(rawLocation);

      // Update last location
      this.lastLocation = locationUpdate;

      log('TrackerService: Location captured', {
        lat: locationUpdate.location.latitude,
        lng: locationUpdate.location.longitude,
        activity: this.currentActivity,
      });
    } catch (error) {
      logError(error as Error, {context: 'TrackerService.captureLocation'});
    }
  }

  /**
   * Get current location from device
   *
   * TODO: Implement with native modules
   */
  private async getCurrentLocation(): Promise<LocationUpdate | null> {
    // Mock implementation
    // In production, this would call native location APIs
    return null;
  }

  /**
   * Sync pending locations to backend
   */
  private async syncPendingLocations(): Promise<void> {
    try {
      const pending = await locationStorage.getPendingLocations();

      if (pending.length === 0) {
        return;
      }

      log('TrackerService: Syncing locations', {count: pending.length});

      // TODO: Implement backend sync
      // For now, just log
      // In production:
      // 1. Batch upload to Firestore
      // 2. Mark as processed
      // 3. Remove from local storage

      log('TrackerService: Locations synced (mock)');
    } catch (error) {
      logError(error as Error, {context: 'TrackerService.syncPendingLocations'});
    }
  }

  /**
   * Start periodic sync loop
   */
  private startSyncLoop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 5 minutes
    this.syncInterval = setInterval(async () => {
      await this.syncPendingLocations();
    }, 300000);
  }

  /**
   * Check if location permission is granted
   *
   * TODO: Implement with native permission APIs
   */
  private async checkLocationPermission(): Promise<boolean> {
    // Mock implementation
    // In production, check native permissions
    return true;
  }

  /**
   * Get update interval based on current activity
   */
  private getUpdateInterval(): number {
    switch (this.currentActivity) {
      case 'stationary':
        return TRACKING_CONFIG.STATIONARY_INTERVAL;
      case 'walking':
        return TRACKING_CONFIG.ACTIVE_INTERVAL;
      case 'driving':
      case 'flying':
      case 'train':
        return TRACKING_CONFIG.ACTIVE_INTERVAL;
      default:
        return TRACKING_CONFIG.IDLE_INTERVAL;
    }
  }

  /**
   * Get default tracker configuration
   */
  private getDefaultConfig(): TrackerConfig {
    return {
      isActive: false,
      updateInterval: TRACKING_CONFIG.ACTIVE_INTERVAL,
      distanceFilter: TRACKING_CONFIG.MIN_DISPLACEMENT,
      stationaryRadius: TRACKING_CONFIG.STATIONARY_RADIUS,
      stopTimeout: TRACKING_CONFIG.MIN_DWELL_TIME,
    };
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export default new TrackerService();
