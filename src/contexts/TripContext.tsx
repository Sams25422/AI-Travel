/**
 * TripContext - Trip State Management
 * Manages active trip, trip list, and trip operations
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Trip} from '@models';
import {TripService} from '@services';

interface TripContextType {
  // Trips
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;

  // Operations
  loadTrips: () => Promise<void>;
  createTrip: (name: string, startNow?: boolean) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  startTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;
  pauseTrip: (tripId: string) => Promise<void>;
  resumeTrip: (tripId: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({children}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      const allTrips = await TripService.getAllTrips();
      setTrips(allTrips);

      const active = await TripService.getActiveTrip();
      setActiveTrip(active);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTrip = async (name: string, startNow: boolean = true): Promise<Trip> => {
    const trip = await TripService.createTrip(name, startNow);
    await loadTrips();
    return trip;
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<void> => {
    await TripService.updateTrip(tripId, updates);
    await loadTrips();
  };

  const deleteTrip = async (tripId: string): Promise<void> => {
    await TripService.deleteTrip(tripId);
    await loadTrips();
  };

  const startTrip = async (tripId: string): Promise<void> => {
    await TripService.startTrip(tripId);
    await loadTrips();
  };

  const completeTrip = async (tripId: string): Promise<void> => {
    await TripService.completeTrip(tripId);
    await loadTrips();
  };

  const pauseTrip = async (tripId: string): Promise<void> => {
    await TripService.pauseTrip(tripId);
    await loadTrips();
  };

  const resumeTrip = async (tripId: string): Promise<void> => {
    await TripService.resumeTrip(tripId);
    await loadTrips();
  };

  const value: TripContextType = {
    trips,
    activeTrip,
    isLoading,
    loadTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    startTrip,
    completeTrip,
    pauseTrip,
    resumeTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrips = (): TripContextType => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
