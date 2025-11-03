/**
 * Core Data Models for Atlas
 * Based on the Technical Blueprint
 */

// ============================================================================
// User Models
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// ============================================================================
// Trip Models
// ============================================================================

export type TripStatus = 'active' | 'completed' | 'paused';

export interface Trip {
  id: string;
  ownerUid: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: TripStatus;
  coverPhotoUrl?: string;
  countries?: string[];
  totalSteps?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Step Models
// ============================================================================

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
  nativeId: string;        // Local device photo ID (iOS: PHAsset, Android: MediaStore)
  qualityScore: number;    // 0.0 - 1.0
  isFeatured: boolean;     // Is this a "hero" photo for the step?
  timestamp: Date;
  location?: GeoPoint;
  isJunk?: boolean;        // Marked as screenshot/receipt/blurry
}

export interface Step {
  id: string;
  tripId: string;
  type: StepType;
  name: string;
  address?: string;
  startTime: Date;
  endTime?: Date;
  notes: string;           // User's journal entry
  location: GeoPoint;
  photos: Photo[];
  isManuallyAdded: boolean;  // Did user add this manually?
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Location Tracking Models
// ============================================================================

export interface RawLocation {
  id: string;
  ownerUid: string;
  tripId: string;
  location: GeoPoint;
  timestamp: Date;
  accuracy?: number;       // meters
  altitude?: number;       // meters
  speed?: number;          // m/s
  heading?: number;        // degrees
  activity: ActivityType;
  batteryLevel?: number;   // 0.0 - 1.0
  isProcessed: boolean;    // Has this been turned into a Step?
}

// ============================================================================
// Photo Analysis Models
// ============================================================================

export interface PhotoMetadata {
  nativeId: string;
  timestamp: Date;
  location?: GeoPoint;
  isJunk: boolean;
  qualityScore: number;
  width: number;
  height: number;
  fileName?: string;
}

export interface PhotoCluster {
  id: string;
  tripId: string;
  photos: PhotoMetadata[];
  centerLocation: GeoPoint;
  startTime: Date;
  endTime: Date;
  assignedStepId?: string;
}

// ============================================================================
// Book Order Models
// ============================================================================

export type BookType = 'hardcover' | 'softcover';
export type BookSize = '8x10' | '11x14';
export type OrderStatus =
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
  price: number;           // in cents
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  pdfUrl?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// App State / Settings Models
// ============================================================================

export interface AppPermissions {
  locationAlways: boolean;
  locationWhenInUse: boolean;
  photoLibrary: boolean;
  notifications: boolean;
}

export interface UserSettings {
  userId: string;
  autoStartTrips: boolean;          // Auto-detect when a trip starts?
  batteryOptimizationEnabled: boolean;
  privacyMode: boolean;              // Extra privacy features
  preferredUnits: 'metric' | 'imperial';
  language: string;
}

// ============================================================================
// Service Configuration Models
// ============================================================================

export interface TrackerConfig {
  isActive: boolean;
  currentTripId?: string;
  updateInterval: number;            // milliseconds
  distanceFilter: number;            // meters
  stationaryRadius: number;          // meters
  stopTimeout: number;               // milliseconds
}

export interface CurationConfig {
  minQualityScore: number;           // 0.0 - 1.0
  maxPhotosPerStep: number;
  junkThreshold: number;             // 0.0 - 1.0
  autoSelectFeatured: boolean;
}

// ============================================================================
// Analytics / Metrics Models (for KPI tracking)
// ============================================================================

export interface TripMetrics {
  tripId: string;
  totalSteps: number;
  manualSteps: number;
  autoSteps: number;
  totalPhotos: number;
  featuredPhotos: number;
  distanceTraveled: number;          // meters
  durationDays: number;
  manualInterventionRate: number;    // manualSteps / totalSteps
}

// ============================================================================
// Helper Types
// ============================================================================

export type UUID = string;
export type Timestamp = Date;
export type ErrorType = 'network' | 'permission' | 'storage' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}
