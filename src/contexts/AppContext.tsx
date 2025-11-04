/**
 * AppContext - Global App State Management
 * Manages permissions, onboarding state, and app-wide settings
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {AppPermissions} from '@models';
import {PermissionService} from '@services';
import {settingsStorage} from '@utils/storage';

interface AppContextType {
  // Onboarding
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;

  // Permissions
  permissions: AppPermissions;
  refreshPermissions: () => Promise<void>;

  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [permissions, setPermissions] = useState<AppPermissions>({
    locationAlways: false,
    locationWhenInUse: false,
    photoLibrary: false,
    notifications: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Check onboarding status
      const onboardingComplete = await settingsStorage.isOnboardingCompleted();
      setIsOnboardingComplete(onboardingComplete);

      // Check permissions
      const currentPermissions = await PermissionService.checkAllPermissions();
      setPermissions(currentPermissions);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    await settingsStorage.completeOnboarding();
    setIsOnboardingComplete(true);
  };

  const refreshPermissions = async () => {
    const currentPermissions = await PermissionService.checkAllPermissions();
    setPermissions(currentPermissions);
  };

  const value: AppContextType = {
    isOnboardingComplete,
    completeOnboarding,
    permissions,
    refreshPermissions,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
