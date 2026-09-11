/**
 * PlanService — pre-trip planning + itinerary management
 */
import type {
  Trip,
  ItineraryItem,
  ItineraryItemType,
  BudgetLevel,
  TripStyle,
  GeoPoint,
} from '../models';
import {itineraryStorage, tripStorage} from '../utils/storage';
import {generateUUID, nowISO, log} from '../utils/helpers';
import {LOCAL_USER_ID} from '../utils/constants';
import {getDestination, type Destination} from '../data/destinations';
import TripService from './TripService';

export interface CreatePlanInput {
  destinationId?: string;
  name?: string;
  nights?: number;
  startDate?: string;
  budgetLevel?: BudgetLevel;
  tripStyle?: TripStyle;
  planNotes?: string;
  seedTemplate?: boolean;
}

function atLocalHour(baseISO: string, dayOffset: number, hour: number): string {
  const d = new Date(baseISO);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

class PlanService {
  async createPlan(input: CreatePlanInput): Promise<Trip> {
    const destination = input.destinationId
      ? getDestination(input.destinationId)
      : undefined;
    const nights = input.nights ?? destination?.nights ?? 3;
    const start = input.startDate ? new Date(input.startDate) : new Date();
    start.setHours(12, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);

    const trip: Trip = {
      id: generateUUID(),
      ownerUid: LOCAL_USER_ID,
      name:
        input.name ||
        (destination ? `Trip to ${destination.name}` : 'Untitled trip'),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'planned',
      countries: destination ? [destination.country] : [],
      totalSteps: 0,
      destinationId: destination?.id,
      destinationName: destination?.name,
      plannedNights: nights,
      budgetLevel: input.budgetLevel ?? 'mid',
      tripStyle: (input.tripStyle ??
        destination?.styles.find(s =>
          ['vacation', 'work', 'adventure', 'culture', 'food'].includes(s),
       ) ??
        'vacation') as TripStyle,
      planNotes: input.planNotes,
      coverPhotoUri: destination?.imageUri,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    await tripStorage.save(trip);

    if (input.seedTemplate !== false && destination) {
      await this.seedFromDestination(trip.id, destination, start.toISOString(), nights);
    }

    log('PlanService: created plan', trip.id);
    return trip;
  }

  async seedFromDestination(
    tripId: string,
    destination: Destination,
    startISO: string,
    nights: number,
  ): Promise<ItineraryItem[]> {
    const items: ItineraryItem[] = destination.template
      .filter(t => t.dayOffset <= nights)
      .map((t, index) => {
        const startTime = atLocalHour(startISO, t.dayOffset, t.startHour);
        const end = new Date(startTime);
        end.setHours(end.getHours() + t.durationHours);
        return {
          id: generateUUID(),
          tripId,
          dayIndex: t.dayOffset,
          title: t.title,
          type: t.type as ItineraryItemType,
          startTime,
          endTime: end.toISOString(),
          notes: t.notes,
          location: t.location,
          placeName: t.title,
          isConfirmed: false,
          sortOrder: index,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
      });
    await itineraryStorage.replaceForTrip(tripId, items);
    return items;
  }

  async getItinerary(tripId: string): Promise<ItineraryItem[]> {
    return itineraryStorage.getForTrip(tripId);
  }

  async addItem(input: {
    tripId: string;
    title: string;
    dayIndex: number;
    type?: ItineraryItemType;
    startHour?: number;
    durationHours?: number;
    notes?: string;
    location?: GeoPoint;
  }): Promise<ItineraryItem> {
    const trip = await tripStorage.get(input.tripId);
    if (!trip) throw new Error('Trip not found');
    const existing = await itineraryStorage.getForTrip(input.tripId);
    const startTime = atLocalHour(
      trip.startDate,
      input.dayIndex,
      input.startHour ?? 10,
    );
    const end = new Date(startTime);
    end.setHours(end.getHours() + (input.durationHours ?? 2));
    const item: ItineraryItem = {
      id: generateUUID(),
      tripId: input.tripId,
      dayIndex: input.dayIndex,
      title: input.title,
      type: input.type ?? 'visit',
      startTime,
      endTime: end.toISOString(),
      notes: input.notes ?? '',
      location: input.location,
      placeName: input.title,
      isConfirmed: false,
      sortOrder: existing.length,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await itineraryStorage.save(item);
    return item;
  }

  async updateItem(
    id: string,
    updates: Partial<
      Pick<
        ItineraryItem,
        | 'title'
        | 'notes'
        | 'type'
        | 'dayIndex'
        | 'startTime'
        | 'endTime'
        | 'isConfirmed'
        | 'location'
        | 'placeName'
      >
    >,
  ): Promise<ItineraryItem> {
    const item = await itineraryStorage.get(id);
    if (!item) throw new Error('Itinerary item not found');
    const updated: ItineraryItem = {
      ...item,
      ...updates,
      id: item.id,
      updatedAt: nowISO(),
    };
    await itineraryStorage.save(updated);
    return updated;
  }

  async removeItem(id: string): Promise<void> {
    await itineraryStorage.remove(id);
  }

  /** Planned → active tracking. Keeps itinerary for reference. */
  async startPlannedTrip(tripId: string): Promise<Trip> {
    const trip = await tripStorage.get(tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'planned' && trip.status !== 'paused') {
      throw new Error('Only planned or paused trips can be started');
    }
    await TripService.startTrip(tripId);
    const updated = await tripStorage.get(tripId);
    if (!updated) throw new Error('Trip missing after start');
    return updated;
  }

  groupByDay(items: ItineraryItem[]): Record<number, ItineraryItem[]> {
    return items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
      (acc[item.dayIndex] ||= []).push(item);
      return acc;
    }, {});
  }
}

export default new PlanService();
