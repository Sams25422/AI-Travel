/**
 * CurationService — on-device heuristic photo curation
 */
import * as MediaLibrary from 'expo-media-library';
import {Platform} from 'react-native';
import type {PhotoMetadata, PhotoCluster, Photo, Step, Trip, GeoPoint} from '../models';
import {clusterStorage, stepStorage} from '../utils/storage';
import {generateUUID, log, logError, calculateDistance} from '../utils/helpers';
import {CURATION_CONFIG} from '../utils/constants';
import PermissionService from './PermissionService';
import JournalingService from './JournalingService';

const DEMO_PHOTOS = [
  {
    label: 'Louvre',
    location: {latitude: 48.8606, longitude: 2.3376} as GeoPoint,
    isJunk: false,
    qualityScore: 0.92,
    width: 3024,
    height: 4032,
    uri: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400',
  },
  {
    label: 'Eiffel',
    location: {latitude: 48.8584, longitude: 2.2945} as GeoPoint,
    isJunk: false,
    qualityScore: 0.95,
    width: 3024,
    height: 4032,
    uri: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400',
  },
  {
    label: 'Screenshot',
    location: undefined as GeoPoint | undefined,
    isJunk: true,
    qualityScore: 0.1,
    width: 1170,
    height: 2532,
    fileName: 'IMG_SCREENSHOT_001.png',
    uri: undefined as string | undefined,
  },
  {
    label: 'Sacré-Cœur',
    location: {latitude: 48.8867, longitude: 2.3431} as GeoPoint,
    isJunk: false,
    qualityScore: 0.88,
    width: 4032,
    height: 3024,
    uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
  },
  {
    label: 'Blurry',
    location: {latitude: 48.853, longitude: 2.3499} as GeoPoint,
    isJunk: true,
    qualityScore: 0.25,
    width: 800,
    height: 600,
    fileName: 'IMG_blur.jpg',
    uri: undefined as string | undefined,
  },
  {
    label: 'Seine',
    location: {latitude: 48.853, longitude: 2.3499} as GeoPoint,
    isJunk: false,
    qualityScore: 0.84,
    width: 4032,
    height: 3024,
    uri: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400',
  },
];

class CurationService {
  private running = false;

  async initialize(): Promise<void> {
    log('CurationService: Ready');
  }

  async curateTrip(trip: Trip): Promise<{
    processed: number;
    kept: number;
    filtered: number;
    clusters: number;
  }> {
    if (this.running) throw new Error('Curation already running');
    this.running = true;
    try {
      const perm = await PermissionService.requestPhotoLibrary();
      const useDemo = Platform.OS === 'web' || perm !== 'granted';
      const photos = useDemo
        ? this.buildDemoPhotos(trip)
        : await this.scanLibrary(new Date(trip.startDate));

      const analyzed = photos.map(p => this.score(p));
      const kept = analyzed.filter(
        p => !p.isJunk && p.qualityScore >= CURATION_CONFIG.MIN_QUALITY_SCORE,
      );
      const clusters = this.cluster(kept, trip.id);
      await clusterStorage.saveForTrip(trip.id, clusters);

      const steps = await stepStorage.getForTrip(trip.id);
      for (const step of steps) {
        const nearby = this.photosNearStep(kept, step);
        const featured = this.selectFeatured(
          nearby,
          CURATION_CONFIG.FEATURED_PHOTOS_PER_STEP,
        );
        if (featured.length) {
          await JournalingService.attachPhotos(
            step.id,
            featured.map((p, i) => this.toPhoto(p, i === 0)),
          );
        }
      }

      return {
        processed: analyzed.length,
        kept: kept.length,
        filtered: analyzed.length - kept.length,
        clusters: clusters.length,
      };
    } catch (error) {
      logError(error as Error, {context: 'CurationService.curateTrip'});
      throw error;
    } finally {
      this.running = false;
    }
  }

  selectFeatured(photos: PhotoMetadata[], count = 3): PhotoMetadata[] {
    return [...photos].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, count);
  }

  private buildDemoPhotos(trip: Trip): PhotoMetadata[] {
    const start = +new Date(trip.startDate);
    return DEMO_PHOTOS.map((p, i) => ({
      nativeId: `demo_${i}`,
      uri: p.uri,
      timestamp: new Date(start + i * 35 * 60 * 1000).toISOString(),
      location: p.location,
      isJunk: p.isJunk,
      qualityScore: p.qualityScore,
      width: p.width,
      height: p.height,
      fileName: (p as {fileName?: string}).fileName || `${p.label}.jpg`,
      mediaType: 'photo',
    }));
  }

  private async scanLibrary(since: Date): Promise<PhotoMetadata[]> {
    const page = await MediaLibrary.getAssetsAsync({
      first: 100,
      mediaType: MediaLibrary.MediaType.photo,
      createdAfter: since.getTime(),
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    return page.assets.map(asset => ({
      nativeId: asset.id,
      uri: asset.uri,
      timestamp: new Date(asset.creationTime).toISOString(),
      // Location requires getAssetInfoAsync; demo/heuristic path works without it.
      location: undefined,
      isJunk: false,
      qualityScore: 0.7,
      width: asset.width,
      height: asset.height,
      fileName: asset.filename,
      mediaType: 'photo',
    }));
  }

  private score(photo: PhotoMetadata): PhotoMetadata {
    let junkScore = 0;
    const name = (photo.fileName || '').toLowerCase();
    if (name.includes('screenshot') || name.includes('screen_shot')) junkScore += 0.9;
    if (name.includes('receipt') || name.includes('blur')) junkScore += 0.8;
    if (photo.width < 640 || photo.height < 640) junkScore += 0.35;
    const aspect = photo.width / Math.max(photo.height, 1);
    if (aspect > 2.2 || aspect < 0.35) junkScore += 0.25;

    let quality = photo.qualityScore || 0.7;
    const mp = (photo.width * photo.height) / 1_000_000;
    if (mp >= 8) quality += 0.1;
    if (mp < 1) quality -= 0.25;
    if (photo.location) quality += 0.05;
    quality = Math.max(0, Math.min(1, quality));

    const isJunk = junkScore >= CURATION_CONFIG.JUNK_THRESHOLD || photo.isJunk;
    return {...photo, isJunk, qualityScore: isJunk ? Math.min(quality, 0.3) : quality};
  }

  private cluster(photos: PhotoMetadata[], tripId: string): PhotoCluster[] {
    if (!photos.length) return [];
    const sorted = [...photos].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    const clusters: PhotoCluster[] = [];
    let bucket: PhotoMetadata[] = [sorted[0]];

    const flush = () => {
      if (!bucket.length) return;
      const withLoc = bucket.filter(p => p.location);
      const centerLocation: GeoPoint = withLoc.length
        ? {
            latitude: withLoc.reduce((s, p) => s + p.location!.latitude, 0) / withLoc.length,
            longitude: withLoc.reduce((s, p) => s + p.location!.longitude, 0) / withLoc.length,
          }
        : {latitude: 0, longitude: 0};
      clusters.push({
        id: generateUUID(),
        tripId,
        photos: [...bucket],
        centerLocation,
        startTime: bucket[0].timestamp,
        endTime: bucket[bucket.length - 1].timestamp,
      });
    };

    for (let i = 1; i < sorted.length; i++) {
      const prev = bucket[bucket.length - 1];
      const curr = sorted[i];
      const dt = +new Date(curr.timestamp) - +new Date(prev.timestamp);
      let near = true;
      if (prev.location && curr.location) {
        near =
          calculateDistance(prev.location, curr.location) <=
          CURATION_CONFIG.LOCATION_CLUSTER_RADIUS;
      }
      if (dt <= CURATION_CONFIG.TIME_CLUSTER_WINDOW && near) bucket.push(curr);
      else {
        flush();
        bucket = [curr];
      }
    }
    flush();
    return clusters;
  }

  private photosNearStep(photos: PhotoMetadata[], step: Step): PhotoMetadata[] {
    const start = +new Date(step.startTime) - 45 * 60 * 1000;
    const end = +new Date(step.endTime || step.startTime) + 45 * 60 * 1000;
    return photos.filter(p => {
      const t = +new Date(p.timestamp);
      if (t >= start && t <= end) {
        if (!p.location) return true;
        return calculateDistance(p.location, step.location) <= 500;
      }
      if (p.location && calculateDistance(p.location, step.location) <= 400) return true;
      return false;
    });
  }

  private toPhoto(meta: PhotoMetadata, featured: boolean): Photo {
    return {
      nativeId: meta.nativeId,
      uri: meta.uri,
      qualityScore: meta.qualityScore,
      isFeatured: featured && meta.qualityScore >= CURATION_CONFIG.FEATURED_QUALITY_THRESHOLD,
      timestamp: meta.timestamp,
      location: meta.location,
      isJunk: meta.isJunk,
    };
  }
}

export default new CurationService();
