/**
 * TripService — trip lifecycle orchestration
 */
import type {Trip, TripStatus, Step, TripMetrics} from '../models';
import {tripStorage, stepStorage} from '../utils/storage';
import {
  generateUUID,
  nowISO,
  log,
  logError,
  calculateDuration,
  countryFromCoords,
} from '../utils/helpers';
import {LOCAL_USER_ID} from '../utils/constants';
import TrackerService from './TrackerService';
import JournalingService from './JournalingService';
import CurationService from './CurationService';

class TripService {
  async createTrip(name: string, startNow = true): Promise<Trip> {
    const trip: Trip = {
      id: generateUUID(),
      ownerUid: LOCAL_USER_ID,
      name,
      startDate: nowISO(),
      status: startNow ? 'active' : 'planned',
      countries: [],
      totalSteps: 0,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await tripStorage.save(trip);
    if (startNow) await this.startTrip(trip.id);
    log('TripService: created', trip.id);
    return trip;
  }

  async getAllTrips(): Promise<Trip[]> {
    const trips = await tripStorage.getAll();
    return trips.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    return tripStorage.get(tripId);
  }

  async getActiveTrip(): Promise<Trip | null> {
    const id = await tripStorage.getActiveTripId();
    return id ? tripStorage.get(id) : null;
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    const trip = await tripStorage.get(tripId);
    if (!trip) throw new Error(`Trip ${tripId} not found`);
    const updated: Trip = {...trip, ...updates, id: trip.id, updatedAt: nowISO()};
    await tripStorage.save(updated);
    return updated;
  }

  async startTrip(tripId: string): Promise<void> {
    await this.updateTrip(tripId, {status: 'active'});
    await tripStorage.setActiveTripId(tripId);
    await TrackerService.startTracking(tripId);
  }

  async pauseTrip(tripId: string): Promise<Trip> {
    await TrackerService.pauseTracking();
    return this.updateTrip(tripId, {status: 'paused'});
  }

  async resumeTrip(tripId: string): Promise<Trip> {
    await TrackerService.resumeTracking();
    return this.updateTrip(tripId, {status: 'active'});
  }

  async completeTrip(tripId: string): Promise<Trip> {
    await TrackerService.stopTracking();
    await JournalingService.processTrip(tripId);
    const trip = await tripStorage.get(tripId);
    if (trip) {
      try {
        await CurationService.curateTrip(trip);
      } catch (e) {
        logError(e as Error, {context: 'completeTrip.curate'});
      }
    }
    const steps = await stepStorage.getForTrip(tripId);
    const countries = Array.from(
      new Set(steps.map(s => countryFromCoords(s.location.latitude, s.location.longitude))),
    );
    const completed = await this.updateTrip(tripId, {
      status: 'completed',
      endDate: nowISO(),
      totalSteps: steps.length,
      countries,
      coverPhotoUri: steps.find(s => s.photos[0]?.uri)?.photos[0]?.uri,
    });
    await tripStorage.setActiveTripId(null);
    return completed;
  }

  /** One-tap demo: Paris path → journal → curated photos */
  async runDemoTrip(name = 'Paris Weekend'): Promise<Trip> {
    TrackerService.setDemoMode(true);
    const trip = await this.createTrip(name, true);
    await TrackerService.simulateDayTrip(trip.id);
    await JournalingService.processTrip(trip.id);
    await CurationService.curateTrip(trip);
    const steps = await stepStorage.getForTrip(trip.id);
    const countries = Array.from(
      new Set(steps.map(s => countryFromCoords(s.location.latitude, s.location.longitude))),
    );
    return this.updateTrip(trip.id, {
      totalSteps: steps.length,
      countries,
      coverPhotoUri: steps.find(s => s.photos[0]?.uri)?.photos[0]?.uri,
    });
  }

  async deleteTrip(tripId: string): Promise<void> {
    const active = await tripStorage.getActiveTripId();
    if (active === tripId) {
      await TrackerService.stopTracking();
      await tripStorage.setActiveTripId(null);
    }
    await tripStorage.remove(tripId);
  }

  async getSteps(tripId: string): Promise<Step[]> {
    return stepStorage.getForTrip(tripId);
  }

  async getTripsByStatus(status: TripStatus): Promise<Trip[]> {
    return (await this.getAllTrips()).filter(t => t.status === status);
  }

  async calculateMetrics(tripId: string): Promise<TripMetrics> {
    const steps = await stepStorage.getForTrip(tripId);
    const trip = await tripStorage.get(tripId);
    const manualSteps = steps.filter(s => s.isManuallyAdded).length;
    const totalPhotos = steps.reduce((n, s) => n + s.photos.length, 0);
    const featuredPhotos = steps.reduce(
      (n, s) => n + s.photos.filter(p => p.isFeatured).length,
      0,
    );
    let durationDays = 0;
    if (trip?.endDate) {
      durationDays = calculateDuration(trip.startDate, trip.endDate).days;
    }
    return {
      tripId,
      totalSteps: steps.length,
      manualSteps,
      autoSteps: steps.length - manualSteps,
      totalPhotos,
      featuredPhotos,
      distanceTraveled: 0,
      durationDays,
      manualInterventionRate: steps.length ? manualSteps / steps.length : 0,
    };
  }
}

export default new TripService();
