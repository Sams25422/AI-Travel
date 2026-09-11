/**
 * PermissionService — Expo location + media library
 */
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import {Linking, Platform} from 'react-native';
import type {AppPermissions} from '../models';
import {settingsStorage} from '../utils/storage';
import {log, logError} from '../utils/helpers';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

class PermissionService {
  async checkAll(): Promise<AppPermissions> {
    try {
      const [fg, bg, photos] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Location.getBackgroundPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(),
      ]);

      const permissions: AppPermissions = {
        locationWhenInUse: fg.status === Location.PermissionStatus.GRANTED,
        locationAlways:
          bg.status === Location.PermissionStatus.GRANTED ||
          (Platform.OS === 'web' && fg.status === Location.PermissionStatus.GRANTED),
        photoLibrary:
          photos.granted ||
          photos.accessPrivileges === 'all' ||
          photos.accessPrivileges === 'limited' ||
          Platform.OS === 'web',
        notifications: false,
      };

      await settingsStorage.savePermissions(permissions);
      return permissions;
    } catch (error) {
      logError(error as Error, {context: 'PermissionService.checkAll'});
      return {
        locationAlways: false,
        locationWhenInUse: false,
        photoLibrary: Platform.OS === 'web',
        notifications: false,
      };
    }
  }

  async requestLocationWhenInUse(): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        await this.checkAll();
        return 'granted';
      }
      const {status} = await Location.requestForegroundPermissionsAsync();
      await this.checkAll();
      return this.map(status);
    } catch (error) {
      logError(error as Error, {context: 'requestLocationWhenInUse'});
      return Platform.OS === 'web' ? 'granted' : 'denied';
    }
  }

  async requestLocationAlways(): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        await this.checkAll();
        return 'granted';
      }
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== Location.PermissionStatus.GRANTED) return this.map(fg.status);
      const bg = await Location.requestBackgroundPermissionsAsync();
      await this.checkAll();
      return this.map(bg.status);
    } catch (error) {
      logError(error as Error, {context: 'requestLocationAlways'});
      return Platform.OS === 'web' ? 'granted' : 'denied';
    }
  }

  async requestPhotoLibrary(): Promise<PermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        await this.checkAll();
        return 'granted';
      }
      const result = await MediaLibrary.requestPermissionsAsync();
      await this.checkAll();
      if (
        result.granted ||
        result.accessPrivileges === 'all' ||
        result.accessPrivileges === 'limited'
      ) {
        return 'granted';
      }
      return result.canAskAgain ? 'undetermined' : 'denied';
    } catch (error) {
      logError(error as Error, {context: 'requestPhotoLibrary'});
      return Platform.OS === 'web' ? 'granted' : 'denied';
    }
  }

  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      logError(error as Error, {context: 'openSettings'});
    }
  }

  async hasCritical(): Promise<boolean> {
    const p = await this.checkAll();
    return (p.locationAlways || p.locationWhenInUse) && p.photoLibrary;
  }

  private map(status: Location.PermissionStatus): PermissionStatus {
    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED) return 'denied';
    return 'undetermined';
  }
}

export default new PermissionService();
