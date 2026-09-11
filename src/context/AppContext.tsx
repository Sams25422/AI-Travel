/**
 * AppContext — global trip / planning / onboarding state
 */
import {Platform} from 'react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  Trip,
  Step,
  AppPermissions,
  UserSettings,
  ItineraryItem,
  BudgetLevel,
  TripStyle,
} from '../models';
import {settingsStorage} from '../utils/storage';
import {LOCAL_USER_ID} from '../utils/constants';
import {log, logError} from '../utils/helpers';
import {
  PermissionService,
  TrackerService,
  TripService,
  PlanService,
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
  createPlan: (input: {
    destinationId?: string;
    name?: string;
    nights?: number;
    startDate?: string;
    budgetLevel?: BudgetLevel;
    tripStyle?: TripStyle;
    planNotes?: string;
  }) => Promise<Trip>;
  getItinerary: (tripId: string) => Promise<ItineraryItem[]>;
  addItineraryItem: (input: {
    tripId: string;
    title: string;
    dayIndex: number;
    notes?: string;
  }) => Promise<ItineraryItem>;
  removeItineraryItem: (id: string) => Promise<void>;
  updateItineraryItem: (
    id: string,
    updates: Partial<Pick<ItineraryItem, 'title' | 'notes' | 'dayIndex' | 'type' | 'isConfirmed'>>,
  ) => Promise<ItineraryItem>;
  startPlannedTrip: (tripId: string) => Promise<Trip>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<UserSettings>;
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
  // Live GPS on device; Paris simulator stays default on web.
  demoMode: Platform.OS === 'web',
};

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
          const effectiveDemo = Platform.OS === 'web' ? true : saved.demoMode;
          if (effectiveDemo !== saved.demoMode) {
            const fixed = {...saved, demoMode: effectiveDemo};
            await settingsStorage.saveSettings(fixed);
            setSettings(fixed);
            TrackerService.setDemoMode(true);
          } else {
            TrackerService.setDemoMode(saved.demoMode);
          }
        } else {
          const initial = {...defaultSettings, demoMode: Platform.OS === 'web'};
          await settingsStorage.saveSettings(initial);
          setSettings(initial);
          TrackerService.setDemoMode(initial.demoMode);
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

  const createPlan = useCallback(
    async (input: {
      destinationId?: string;
      name?: string;
      nights?: number;
      startDate?: string;
      budgetLevel?: BudgetLevel;
      tripStyle?: TripStyle;
      planNotes?: string;
    }) => {
      const trip = await PlanService.createPlan(input);
      await refreshTrips();
      return trip;
    },
    [refreshTrips],
  );

  const getItinerary = useCallback(
    async (tripId: string) => PlanService.getItinerary(tripId),
    [],
  );

  const addItineraryItem = useCallback(
    async (input: {
      tripId: string;
      title: string;
      dayIndex: number;
      notes?: string;
    }) => PlanService.addItem(input),
    [],
  );

  const removeItineraryItem = useCallback(async (id: string) => {
    await PlanService.removeItem(id);
  }, []);

  const updateItineraryItem = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<ItineraryItem, 'title' | 'notes' | 'dayIndex' | 'type' | 'isConfirmed'>
      >,
    ) => PlanService.updateItem(id, updates),
    [],
  );

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    const next: UserSettings = {
      ...settings,
      ...patch,
      // Web keeps the Paris simulator; device users can toggle freely.
      demoMode: Platform.OS === 'web' ? true : (patch.demoMode ?? settings.demoMode),
    };
    await settingsStorage.saveSettings(next);
    setSettings(next);
    TrackerService.setDemoMode(next.demoMode);
    return next;
  }, [settings]);

  const startPlannedTrip = useCallback(
    async (tripId: string) => {
      const trip = await PlanService.startPlannedTrip(tripId);
      await refreshTrips();
      return trip;
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
      createPlan,
      getItinerary,
      addItineraryItem,
      removeItineraryItem,
      updateItineraryItem,
      startPlannedTrip,
      updateSettings,
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
      createPlan,
      getItinerary,
      addItineraryItem,
      removeItineraryItem,
      updateItineraryItem,
      startPlannedTrip,
      updateSettings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
