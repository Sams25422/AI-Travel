/**
 * JournalingService — on-device location → Step generation
 */
import * as Location from 'expo-location';
import {Platform} from 'react-native';
import type {RawLocation, Step, StepType, Photo, GeoPoint} from '../models';
import {locationStorage, stepStorage} from '../utils/storage';
import {
  generateUUID,
  nowISO,
  log,
  logError,
  calculateDistance,
  countryFromCoords,
} from '../utils/helpers';
import {TRACKING_CONFIG} from '../utils/constants';

interface VisitCluster {
  center: GeoPoint;
  start: Date;
  end: Date;
  durationMs: number;
  avgSpeed: number;
}

class JournalingService {
  async processTrip(tripId: string): Promise<Step[]> {
    try {
      log('JournalingService: Processing', tripId);
      const locations = await locationStorage.getForTrip(tripId);
      const unprocessed = locations.filter(l => !l.isProcessed);
      if (unprocessed.length === 0) {
        return stepStorage.getForTrip(tripId);
      }

      const visits = this.detectVisits(unprocessed);
      const autoSteps: Step[] = [];

      for (const visit of visits) {
        const type = this.inferType(visit.avgSpeed, visit.durationMs);
        const name = await this.resolveName(visit.center, visit.avgSpeed);
        autoSteps.push({
          id: generateUUID(),
          tripId,
          type,
          name,
          address: `${visit.center.latitude.toFixed(4)}, ${visit.center.longitude.toFixed(4)}`,
          startTime: visit.start.toISOString(),
          endTime: visit.end.toISOString(),
          notes: '',
          location: visit.center,
          photos: [],
          isManuallyAdded: false,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        });
      }

      const existing = await stepStorage.getForTrip(tripId);
      const manuals = existing.filter(s => s.isManuallyAdded);
      const merged = [...autoSteps, ...manuals].sort(
        (a, b) => +new Date(a.startTime) - +new Date(b.startTime),
      );

      await stepStorage.replaceForTrip(tripId, merged);
      await locationStorage.markProcessed(unprocessed.map(l => l.id));
      log('JournalingService: created steps', merged.length);
      return merged;
    } catch (error) {
      logError(error as Error, {context: 'JournalingService.processTrip'});
      throw error;
    }
  }

  async createManualStep(input: {
    tripId: string;
    name: string;
    type: StepType;
    location: GeoPoint;
    notes?: string;
    startTime?: string;
  }): Promise<Step> {
    const step: Step = {
      id: generateUUID(),
      tripId: input.tripId,
      type: input.type,
      name: input.name,
      startTime: input.startTime || nowISO(),
      notes: input.notes || '',
      location: input.location,
      photos: [],
      isManuallyAdded: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await stepStorage.save(step);
    return step;
  }

  async updateStep(stepId: string, updates: Partial<Step>): Promise<Step> {
    const step = await stepStorage.get(stepId);
    if (!step) throw new Error('Step not found');
    const updated: Step = {...step, ...updates, id: step.id, updatedAt: nowISO()};
    await stepStorage.save(updated);
    return updated;
  }

  async deleteStep(stepId: string): Promise<void> {
    await stepStorage.remove(stepId);
  }

  async attachPhotos(stepId: string, photos: Photo[]): Promise<Step> {
    const step = await stepStorage.get(stepId);
    if (!step) throw new Error('Step not found');
    const merged = [...step.photos];
    for (const p of photos) {
      if (!merged.find(m => m.nativeId === p.nativeId)) merged.push(p);
    }
    return this.updateStep(stepId, {photos: merged});
  }

  private detectVisits(locations: RawLocation[]): VisitCluster[] {
    if (locations.length === 0) return [];
    const sorted = [...locations].sort(
      (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp),
    );
    const visits: VisitCluster[] = [];
    let cluster: RawLocation[] = [sorted[0]];

    const flush = () => {
      if (!cluster.length) return;
      const start = new Date(cluster[0].timestamp);
      const end = new Date(cluster[cluster.length - 1].timestamp);
      const durationMs = end.getTime() - start.getTime();
      const center: GeoPoint = {
        latitude: cluster.reduce((s, p) => s + p.location.latitude, 0) / cluster.length,
        longitude: cluster.reduce((s, p) => s + p.location.longitude, 0) / cluster.length,
      };
      const avgSpeed =
        cluster.reduce((s, p) => s + (p.speed ?? 0), 0) / Math.max(cluster.length, 1);
      if (
        durationMs >= TRACKING_CONFIG.MIN_DWELL_TIME ||
        cluster.length >= 2 ||
        avgSpeed > 10
      ) {
        visits.push({center, start, end, durationMs, avgSpeed});
      }
    };

    for (let i = 1; i < sorted.length; i++) {
      const prev = cluster[cluster.length - 1];
      const curr = sorted[i];
      if (calculateDistance(prev.location, curr.location) <= TRACKING_CONFIG.STATIONARY_RADIUS) {
        cluster.push(curr);
      } else {
        flush();
        cluster = [curr];
      }
    }
    flush();
    return visits;
  }

  private inferType(avgSpeed: number, durationMs: number): StepType {
    if (avgSpeed >= TRACKING_CONFIG.FLYING_SPEED) return 'flight';
    if (avgSpeed >= TRACKING_CONFIG.DRIVING_SPEED) return 'transit';
    if (durationMs >= 4 * 60 * 60 * 1000) return 'stay';
    return 'visit';
  }

  private async resolveName(point: GeoPoint, avgSpeed: number): Promise<string> {
    if (avgSpeed >= TRACKING_CONFIG.FLYING_SPEED) return 'Flight';
    if (avgSpeed >= TRACKING_CONFIG.DRIVING_SPEED) return 'On the move';

    // Nearest landmark within 600m — avoids overlapping bounding boxes
    const landmarks: Array<{name: string; location: GeoPoint}> = [
      {name: 'Louvre Museum', location: {latitude: 48.8606, longitude: 2.3376}},
      {name: 'Eiffel Tower', location: {latitude: 48.8584, longitude: 2.2945}},
      {name: 'Arc de Triomphe', location: {latitude: 48.8738, longitude: 2.295}},
      {name: 'Sacré-Cœur', location: {latitude: 48.8867, longitude: 2.3431}},
      {name: 'Notre-Dame', location: {latitude: 48.853, longitude: 2.3499}},
      {name: 'Centre Pompidou', location: {latitude: 48.8606, longitude: 2.3522}},
      {name: 'Latin Quarter', location: {latitude: 48.849, longitude: 2.345}},
    ];
    let best: {name: string; meters: number} | null = null;
    for (const landmark of landmarks) {
      const meters = calculateDistance(point, landmark.location);
      if (meters <= 600 && (!best || meters < best.meters)) {
        best = {name: landmark.name, meters};
      }
    }
    if (best) return best.name;

    try {
      if (Platform.OS !== 'web') {
        const results = await Location.reverseGeocodeAsync(point);
        if (results[0]) {
          const r = results[0];
          return r.name || r.street || r.city || countryFromCoords(point.latitude, point.longitude);
        }
      }
    } catch {
      // ignore
    }

    return countryFromCoords(point.latitude, point.longitude);
  }
}

export default new JournalingService();
