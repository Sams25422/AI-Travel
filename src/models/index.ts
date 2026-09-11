/**
 * Core data models for Atlas
 */

export interface User {
  id: string;
  email?: string;
  name: string;
  createdAt: string;
}

export type TripStatus = 'active' | 'completed' | 'paused';

export interface Trip {
  id: string;
  ownerUid: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: TripStatus;
  coverPhotoUri?: string;
  countries: string[];
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
}

export type StepType = 'flight' | 'visit' | 'transit' | 'stay' | 'dining';

export type ActivityType =
  | 'stationary'
  | 'walking'
  | 'driving'
  | 'flying'
  | 'train'
  | 'cycling';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Photo {
  nativeId: string;
  uri?: string;
  qualityScore: number;
  isFeatured: boolean;
  timestamp: string;
  location?: GeoPoint;
  isJunk?: boolean;
}

export interface Step {
  id: string;
  tripId: string;
  type: StepType;
  name: string;
  address?: string;
  startTime: string;
  endTime?: string;
  notes: string;
  location: GeoPoint;
  photos: Photo[];
  isManuallyAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawLocation {
  id: string;
  ownerUid: string;
  tripId: string;
  location: GeoPoint;
  timestamp: string;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  activity: ActivityType;
  batteryLevel?: number;
  isProcessed: boolean;
}

export interface PhotoMetadata {
  nativeId: string;
  uri?: string;
  timestamp: string;
  location?: GeoPoint;
  isJunk: boolean;
  qualityScore: number;
  width: number;
  height: number;
  fileName?: string;
  mediaType?: string;
}

export interface PhotoCluster {
  id: string;
  tripId: string;
  photos: PhotoMetadata[];
  centerLocation: GeoPoint;
  startTime: string;
  endTime: string;
  assignedStepId?: string;
}

export type BookType = 'hardcover' | 'softcover';
export type BookSize = '8x10' | '11x14';
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BookOrder {
  id: string;
  tripId: string;
  ownerUid: string;
  bookType: BookType;
  bookSize: BookSize;
  pageCount: number;
  price: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  pdfUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppPermissions {
  locationAlways: boolean;
  locationWhenInUse: boolean;
  photoLibrary: boolean;
  notifications: boolean;
}

export interface UserSettings {
  userId: string;
  autoStartTrips: boolean;
  batteryOptimizationEnabled: boolean;
  privacyMode: boolean;
  preferredUnits: 'metric' | 'imperial';
  language: string;
  demoMode: boolean;
}

export interface TrackerConfig {
  isActive: boolean;
  currentTripId?: string;
  updateInterval: number;
  distanceFilter: number;
  stationaryRadius: number;
  stopTimeout: number;
}

export interface TripMetrics {
  tripId: string;
  totalSteps: number;
  manualSteps: number;
  autoSteps: number;
  totalPhotos: number;
  featuredPhotos: number;
  distanceTraveled: number;
  durationDays: number;
  manualInterventionRate: number;
}
