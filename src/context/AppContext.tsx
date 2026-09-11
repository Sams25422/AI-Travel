/**
 * AppContext — global trip / onboarding state
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {Trip, Step, AppPermissions, UserSettings} from '../models';
import {settingsStorage} from '../utils/storage';
import {LOCAL_USER_ID} from '../utils/constants';
import {log, logError} from '../utils/helpers';
import {
  PermissionService,
  TrackerService,
  TripService,
  JournalingService,
  CurationService,
} from '../services';

interface AppContextValue {
  ready: boolean;
  onboardingComplete: boolean;
  permissions: AppPermissions;
  settings: UserSettings;
  trips: Trip[];
  activeTrip: Trip | null;
  refreshTrips: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  requestLocation: () => Promise<boolean>;
  requestPhotos: () => Promise<boolean>;
  startTrip: (name: string) => Promise<Trip>;
  runDemoTrip: () => Promise<Trip>;
  completeTrip: (tripId: string) => Promise<Trip>;
  pauseTrip: (tripId: string) => Promise<void>;
  resumeTrip: (tripId: string) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  getSteps: (tripId: string) => Promise<Step[]>;
  addManualStep: (tripId: string, name: string, notes?: string) => Promise<Step>;
  refreshJournal: (tripId: string) => Promise<Step[]>;
}

const defaultPermissions: AppPermissions = {
  locationAlways: false,
  locationWhenInUse: false,
  photoLibrary: false,
  notifications: false,
};

const defaultSettings: UserSettings = {
  userId: LOCAL_USER_ID,
  autoStartTrips: true,
  batteryOptimizationEnabled: true,
  privacyMode: true,
  preferredUnits: 'metric',
  language: 'en',
  demoMode: true,
}; // matches UserSettings in models

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [permissions, setPermissions] = useState<AppPermissions>(defaultPermissions);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const refreshTrips = useCallback(async () => {
    const all = await TripService.getAllTrips();
    setTrips(all);
    setActiveTrip(await TripService.getActiveTrip());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await TrackerService.initialize();
        await CurationService.initialize();
        setOnboardingComplete(await settingsStorage.isOnboardingCompleted());
        const saved = await settingsStorage.getSettings();
        if (saved) {
          setSettings(saved);
          TrackerService.setDemoMode(saved.demoMode);
        } else {
          await settingsStorage.saveSettings(defaultSettings);
        }
        setPermissions(await PermissionService.checkAll());
        await refreshTrips();
      } catch (e) {
        logError(e as Error, {context: 'AppProvider.init'});
      } finally {
        setReady(true);
        log('App ready');
      }
    })();
  }, [refreshTrips]);

  const completeOnboarding = useCallback(async () => {
    await settingsStorage.completeOnboarding();
    setOnboardingComplete(true);
  }, []);

  const requestLocation = useCallback(async () => {
    const always = await PermissionService.requestLocationAlways();
    if (always !== 'granted') await PermissionService.requestLocationWhenInUse();
    const perms = await PermissionService.checkAll();
    setPermissions(perms);
    return perms.locationAlways || perms.locationWhenInUse;
  }, []);

  const requestPhotos = useCallback(async () => {
    await PermissionService.requestPhotoLibrary();
    const perms = await PermissionService.checkAll();
    setPermissions(perms);
    return perms.photoLibrary;
  }, []);

  const startTrip = useCallback(
    async (name: string) => {
      const trip = await TripService.createTrip(name, true);
      await refreshTrips();
      return trip;
    },
    [refreshTrips],
  );

  const runDemoTrip = useCallback(async () => {
    const trip = await TripService.runDemoTrip();
    await refreshTrips();
    return trip;
  }, [refreshTrips]);

  const completeTrip = useCallback(
    async (tripId: string) => {
      const trip = await TripService.completeTrip(tripId);
      await refreshTrips();
      return trip;
    },
    [refreshTrips],
  );

  const pauseTrip = useCallback(
    async (tripId: string) => {
      await TripService.pauseTrip(tripId);
      await refreshTrips();
    },
    [refreshTrips],
  );

  const resumeTrip = useCallback(
    async (tripId: string) => {
      await TripService.resumeTrip(tripId);
      await refreshTrips();
    },
    [refreshTrips],
  );

  const deleteTrip = useCallback(
    async (tripId: string) => {
      await TripService.deleteTrip(tripId);
      await refreshTrips();
    },
    [refreshTrips],
  );

  const getSteps = useCallback(async (tripId: string) => TripService.getSteps(tripId), []);

  const addManualStep = useCallback(async (tripId: string, name: string, notes?: string) => {
    const steps = await TripService.getSteps(tripId);
    const last = steps[steps.length - 1];
    const location = last?.location || {latitude: 48.8566, longitude: 2.3522};
    return JournalingService.createManualStep({
      tripId,
      name,
      type: 'visit',
      location,
      notes,
    });
  }, []);

  const refreshJournal = useCallback(
    async (tripId: string) => {
      await JournalingService.processTrip(tripId);
      const trip = await TripService.getTrip(tripId);
      if (trip) {
        try {
          await CurationService.curateTrip(trip);
        } catch {
          // optional
        }
      }
      await refreshTrips();
      return TripService.getSteps(tripId);
    },
    [refreshTrips],
  );

  const value = useMemo(
    () => ({
      ready,
      onboardingComplete,
      permissions,
      settings,
      trips,
      activeTrip,
      refreshTrips,
      completeOnboarding,
      requestLocation,
      requestPhotos,
      startTrip,
      runDemoTrip,
      completeTrip,
      pauseTrip,
      resumeTrip,
      deleteTrip,
      getSteps,
      addManualStep,
      refreshJournal,
    }),
    [
      ready,
      onboardingComplete,
      permissions,
      settings,
      trips,
      activeTrip,
      refreshTrips,
      completeOnboarding,
      requestLocation,
      requestPhotos,
      startTrip,
      runDemoTrip,
      completeTrip,
      pauseTrip,
      resumeTrip,
      deleteTrip,
      getSteps,
      addManualStep,
      refreshJournal,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
