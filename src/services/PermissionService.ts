/**
 * PermissionService - Centralized Permission Management
 *
 * Handles all app permissions:
 * - Location (Always, When In Use)
 * - Photo Library
 * - Notifications
 *
 * Critical for onboarding flow and app functionality.
 */

import {AppPermissions} from '@models';
import {log, logError} from '@utils/helpers';
import {storage, STORAGE_KEYS} from '@utils/storage';

// ============================================================================
// Types
// ============================================================================

export type PermissionStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

export type PermissionType = 'location' | 'locationAlways' | 'photos' | 'notifications';

// ============================================================================
// PermissionService Class
// ============================================================================

class PermissionService {
  /**
   * Check all permissions status
   */
  async checkAllPermissions(): Promise<AppPermissions> {
    try {
      const [locationAlways, locationWhenInUse, photoLibrary, notifications] = await Promise.all([
        this.checkLocationAlwaysPermission(),
        this.checkLocationWhenInUsePermission(),
        this.checkPhotoLibraryPermission(),
        this.checkNotificationPermission(),
      ]);

      const permissions: AppPermissions = {
        locationAlways: locationAlways === 'granted',
        locationWhenInUse: locationWhenInUse === 'granted',
        photoLibrary: photoLibrary === 'granted',
        notifications: notifications === 'granted',
      };

      // Cache permissions
      await storage.set(STORAGE_KEYS.PERMISSIONS, permissions);

      return permissions;
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.checkAllPermissions'});

      // Return default denied state
      return {
        locationAlways: false,
        locationWhenInUse: false,
        photoLibrary: false,
        notifications: false,
      };
    }
  }

  /**
   * Request location permission (Always)
   *
   * This is CRITICAL for Atlas. Without it, the app cannot function.
   */
  async requestLocationAlwaysPermission(): Promise<PermissionStatus> {
    try {
      log('PermissionService: Requesting Location (Always) permission');

      // TODO: Implement with native permission APIs
      // iOS: CLLocationManager requestAlwaysAuthorization
      // Android: ACCESS_FINE_LOCATION + ACCESS_BACKGROUND_LOCATION

      // Mock implementation
      const status: PermissionStatus = 'not-determined';

      log('PermissionService: Location (Always) permission status:', status);
      return status;
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.requestLocationAlwaysPermission'});
      return 'denied';
    }
  }

  /**
   * Request location permission (When In Use)
   * Fallback if user denies Always permission
   */
  async requestLocationWhenInUsePermission(): Promise<PermissionStatus> {
    try {
      log('PermissionService: Requesting Location (When In Use) permission');

      // TODO: Implement with native permission APIs
      // iOS: CLLocationManager requestWhenInUseAuthorization
      // Android: ACCESS_FINE_LOCATION

      // Mock implementation
      const status: PermissionStatus = 'not-determined';

      log('PermissionService: Location (When In Use) permission status:', status);
      return status;
    } catch (error) {
      logError(error as Error, {
        context: 'PermissionService.requestLocationWhenInUsePermission',
      });
      return 'denied';
    }
  }

  /**
   * Request photo library permission
   *
   * CRITICAL: Must request "Full Access" not "Limited Access"
   */
  async requestPhotoLibraryPermission(): Promise<PermissionStatus> {
    try {
      log('PermissionService: Requesting Photo Library permission');

      // TODO: Implement with native permission APIs
      // iOS: PHPhotoLibrary requestAuthorization
      // Android: READ_MEDIA_IMAGES (Android 13+) or READ_EXTERNAL_STORAGE

      // Mock implementation
      const status: PermissionStatus = 'not-determined';

      log('PermissionService: Photo Library permission status:', status);
      return status;
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.requestPhotoLibraryPermission'});
      return 'denied';
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<PermissionStatus> {
    try {
      log('PermissionService: Requesting Notification permission');

      // TODO: Implement with native permission APIs
      // iOS: UNUserNotificationCenter requestAuthorization
      // Android: POST_NOTIFICATIONS (Android 13+)

      // Mock implementation
      const status: PermissionStatus = 'not-determined';

      log('PermissionService: Notification permission status:', status);
      return status;
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.requestNotificationPermission'});
      return 'denied';
    }
  }

  /**
   * Check location (Always) permission status
   */
  async checkLocationAlwaysPermission(): Promise<PermissionStatus> {
    // TODO: Implement
    return 'not-determined';
  }

  /**
   * Check location (When In Use) permission status
   */
  async checkLocationWhenInUsePermission(): Promise<PermissionStatus> {
    // TODO: Implement
    return 'not-determined';
  }

  /**
   * Check photo library permission status
   */
  async checkPhotoLibraryPermission(): Promise<PermissionStatus> {
    // TODO: Implement
    return 'not-determined';
  }

  /**
   * Check notification permission status
   */
  async checkNotificationPermission(): Promise<PermissionStatus> {
    // TODO: Implement
    return 'not-determined';
  }

  /**
   * Open device settings
   * Used when permissions are denied and user needs to manually enable
   */
  async openSettings(): Promise<void> {
    try {
      log('PermissionService: Opening app settings');

      // TODO: Implement
      // iOS: Linking.openURL('app-settings:')
      // Android: Linking.openSettings()
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.openSettings'});
    }
  }

  /**
   * Check if critical permissions are granted
   * (Location Always + Photo Library)
   */
  async hasCriticalPermissions(): Promise<boolean> {
    const permissions = await this.checkAllPermissions();
    return permissions.locationAlways && permissions.photoLibrary;
  }

  /**
   * Get permission status as user-friendly message
   */
  getPermissionStatusMessage(type: PermissionType, status: PermissionStatus): string {
    const messages = {
      location: {
        granted: 'Location access granted',
        denied: 'Location access denied. Please enable in Settings.',
        'not-determined': 'Location permission not yet requested',
        restricted: 'Location access restricted by device policy',
      },
      locationAlways: {
        granted: 'Always-on location access granted',
        denied: 'Always-on location denied. Atlas needs this to track your journey.',
        'not-determined': 'Always-on location permission not yet requested',
        restricted: 'Location access restricted by device policy',
      },
      photos: {
        granted: 'Photo library access granted',
        denied: 'Photo library access denied. Please enable in Settings.',
        'not-determined': 'Photo library permission not yet requested',
        restricted: 'Photo library access restricted',
      },
      notifications: {
        granted: 'Notification access granted',
        denied: 'Notifications disabled',
        'not-determined': 'Notification permission not yet requested',
        restricted: 'Notifications restricted',
      },
    };

    return messages[type][status];
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export default new PermissionService();
