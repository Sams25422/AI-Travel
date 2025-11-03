/**
 * TripService - Trip Management Service
 *
 * Responsibilities:
 * - Create, read, update, delete trips
 * - Manage trip lifecycle (active, completed, paused)
 * - Generate trip statistics
 */

import {Trip, Step, TripStatus, TripMetrics, StepType} from '@models';
import {tripStorage} from '@utils/storage';
import {generateUUID, log, logError, calculateDuration} from '@utils/helpers';
import TrackerService from './TrackerService';

// ============================================================================
// TripService Class
// ============================================================================

class TripService {
  /**
   * Create a new trip
   */
  async createTrip(name: string, startNow: boolean = true): Promise<Trip> {
    try {
      log('TripService: Creating new trip', {name, startNow});

      const trip: Trip = {
        id: generateUUID(),
        ownerUid: 'local_user', // TODO: Get from auth
        name,
        startDate: new Date(),
        endDate: undefined,
        status: startNow ? 'active' : 'completed',
        coverPhotoUrl: undefined,
        countries: [],
        totalSteps: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to local storage
      await tripStorage.saveTrip(trip);

      // If starting now, activate tracking
      if (startNow) {
        await this.startTrip(trip.id);
      }

      log('TripService: Trip created', trip.id);
      return trip;
    } catch (error) {
      logError(error as Error, {context: 'TripService.createTrip'});
      throw error;
    }
  }

  /**
   * Get all trips
   */
  async getAllTrips(): Promise<Trip[]> {
    try {
      const trips = await tripStorage.getAllTrips();
      return trips.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    } catch (error) {
      logError(error as Error, {context: 'TripService.getAllTrips'});
      return [];
    }
  }

  /**
   * Get a specific trip by ID
   */
  async getTrip(tripId: string): Promise<Trip | null> {
    try {
      return await tripStorage.getTrip(tripId);
    } catch (error) {
      logError(error as Error, {context: 'TripService.getTrip'});
      return null;
    }
  }

  /**
   * Get active trip
   */
  async getActiveTrip(): Promise<Trip | null> {
    try {
      const activeTripId = await tripStorage.getActiveTripId();
      if (!activeTripId) {
        return null;
      }
      return await tripStorage.getTrip(activeTripId);
    } catch (error) {
      logError(error as Error, {context: 'TripService.getActiveTrip'});
      return null;
    }
  }

  /**
   * Update a trip
   */
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    try {
      const trip = await tripStorage.getTrip(tripId);
      if (!trip) {
        throw new Error(`Trip ${tripId} not found`);
      }

      const updatedTrip: Trip = {
        ...trip,
        ...updates,
        updatedAt: new Date(),
      };

      await tripStorage.saveTrip(updatedTrip);

      log('TripService: Trip updated', tripId);
      return updatedTrip;
    } catch (error) {
      logError(error as Error, {context: 'TripService.updateTrip'});
      throw error;
    }
  }

  /**
   * Start tracking for a trip
   */
  async startTrip(tripId: string): Promise<void> {
    try {
      log('TripService: Starting trip', tripId);

      // Update trip status
      await this.updateTrip(tripId, {status: 'active'});

      // Set as active trip
      await tripStorage.setActiveTripId(tripId);

      // Start tracker
      await TrackerService.startTracking(tripId);

      log('TripService: Trip started', tripId);
    } catch (error) {
      logError(error as Error, {context: 'TripService.startTrip'});
      throw error;
    }
  }

  /**
   * Complete a trip
   */
  async completeTrip(tripId: string): Promise<Trip> {
    try {
      log('TripService: Completing trip', tripId);

      // Stop tracker
      await TrackerService.stopTracking();

      // Update trip status
      const trip = await this.updateTrip(tripId, {
        status: 'completed',
        endDate: new Date(),
      });

      // Clear active trip
      await tripStorage.setActiveTripId(null);

      log('TripService: Trip completed', tripId);
      return trip;
    } catch (error) {
      logError(error as Error, {context: 'TripService.completeTrip'});
      throw error;
    }
  }

  /**
   * Pause a trip
   */
  async pauseTrip(tripId: string): Promise<Trip> {
    try {
      log('TripService: Pausing trip', tripId);

      // Pause tracker
      await TrackerService.pauseTracking();

      // Update trip status
      const trip = await this.updateTrip(tripId, {
        status: 'paused',
      });

      log('TripService: Trip paused', tripId);
      return trip;
    } catch (error) {
      logError(error as Error, {context: 'TripService.pauseTrip'});
      throw error;
    }
  }

  /**
   * Resume a paused trip
   */
  async resumeTrip(tripId: string): Promise<Trip> {
    try {
      log('TripService: Resuming trip', tripId);

      // Resume tracker
      await TrackerService.resumeTracking();

      // Update trip status
      const trip = await this.updateTrip(tripId, {
        status: 'active',
      });

      log('TripService: Trip resumed', tripId);
      return trip;
    } catch (error) {
      logError(error as Error, {context: 'TripService.resumeTrip'});
      throw error;
    }
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    try {
      log('TripService: Deleting trip', tripId);

      // If this is the active trip, stop tracking
      const activeTripId = await tripStorage.getActiveTripId();
      if (activeTripId === tripId) {
        await TrackerService.stopTracking();
        await tripStorage.setActiveTripId(null);
      }

      // Delete trip
      await tripStorage.deleteTrip(tripId);

      // TODO: Delete associated steps and photos

      log('TripService: Trip deleted', tripId);
    } catch (error) {
      logError(error as Error, {context: 'TripService.deleteTrip'});
      throw error;
    }
  }

  /**
   * Calculate trip metrics for KPI tracking
   */
  async calculateTripMetrics(tripId: string, steps: Step[]): Promise<TripMetrics> {
    const manualSteps = steps.filter(s => s.isManuallyAdded).length;
    const autoSteps = steps.length - manualSteps;

    const totalPhotos = steps.reduce((sum, step) => sum + step.photos.length, 0);
    const featuredPhotos = steps.reduce(
      (sum, step) => sum + step.photos.filter(p => p.isFeatured).length,
      0,
    );

    // Calculate distance traveled (simplified)
    // TODO: Implement proper distance calculation from location data
    const distanceTraveled = 0;

    // Calculate duration
    const trip = await this.getTrip(tripId);
    let durationDays = 0;
    if (trip && trip.endDate) {
      const duration = calculateDuration(trip.startDate, trip.endDate);
      durationDays = duration.days;
    }

    const manualInterventionRate = steps.length > 0 ? manualSteps / steps.length : 0;

    return {
      tripId,
      totalSteps: steps.length,
      manualSteps,
      autoSteps,
      totalPhotos,
      featuredPhotos,
      distanceTraveled,
      durationDays,
      manualInterventionRate,
    };
  }

  /**
   * Get trips by status
   */
  async getTripsByStatus(status: TripStatus): Promise<Trip[]> {
    try {
      const allTrips = await this.getAllTrips();
      return allTrips.filter(trip => trip.status === status);
    } catch (error) {
      logError(error as Error, {context: 'TripService.getTripsByStatus'});
      return [];
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export default new TripService();
