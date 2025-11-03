/**
 * App-wide Constants
 */

// ============================================================================
// Tracking Configuration
// ============================================================================

export const TRACKING_CONFIG = {
  // GPS accuracy settings (meters)
  HIGH_ACCURACY: 10,
  MEDIUM_ACCURACY: 100,
  LOW_ACCURACY: 1000,

  // Update intervals (milliseconds)
  ACTIVE_INTERVAL: 30000,      // 30 seconds when actively moving
  IDLE_INTERVAL: 300000,       // 5 minutes when idle
  STATIONARY_INTERVAL: 600000, // 10 minutes when stationary

  // Distance filters (meters)
  MIN_DISPLACEMENT: 10,        // Minimum movement to trigger update
  STATIONARY_RADIUS: 50,       // Radius to consider "stationary"

  // Speed thresholds (m/s)
  WALKING_SPEED: 2.0,          // ~7 km/h
  DRIVING_SPEED: 20.0,         // ~72 km/h
  FLYING_SPEED: 55.0,          // ~200 km/h

  // Dwell time (milliseconds)
  MIN_DWELL_TIME: 1800000,     // 30 minutes to count as a "visit"
  SHORT_STOP_TIME: 300000,     // 5 minutes for quick stops

  // Battery optimization
  BATTERY_SAVER_THRESHOLD: 0.2, // Switch to low-power mode at 20%
} as const;

// ============================================================================
// Photo Curation Configuration
// ============================================================================

export const CURATION_CONFIG = {
  // Quality thresholds (0.0 - 1.0)
  MIN_QUALITY_SCORE: 0.5,
  FEATURED_QUALITY_THRESHOLD: 0.8,
  JUNK_THRESHOLD: 0.7,

  // Photo limits
  MAX_PHOTOS_PER_STEP: 10,
  FEATURED_PHOTOS_PER_STEP: 3,

  // Clustering
  TIME_CLUSTER_WINDOW: 3600000,  // 1 hour
  LOCATION_CLUSTER_RADIUS: 200,  // 200 meters

  // Supported formats
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'heic', 'heif'],
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const SCREEN_NAMES = {
  // Onboarding
  SPLASH: 'Splash',
  ONBOARDING_WELCOME: 'OnboardingWelcome',
  ONBOARDING_LOCATION: 'OnboardingLocation',
  ONBOARDING_PHOTOS: 'OnboardingPhotos',
  ONBOARDING_COMPLETE: 'OnboardingComplete',

  // Main App
  HOME: 'Home',
  TRIP_LIST: 'TripList',
  TRIP_TIMELINE: 'TripTimeline',
  STEP_DETAIL: 'StepDetail',
  STEP_EDIT: 'StepEdit',
  PHOTO_GALLERY: 'PhotoGallery',

  // Book Ordering
  BOOK_PREVIEW: 'BookPreview',
  BOOK_CONFIG: 'BookConfig',
  CHECKOUT: 'Checkout',
  ORDER_CONFIRMATION: 'OrderConfirmation',

  // Settings
  SETTINGS: 'Settings',
  ACCOUNT: 'Account',
  PRIVACY: 'Privacy',
  PERMISSIONS: 'Permissions',
  HELP: 'Help',
} as const;

export const COLORS = {
  // Primary palette
  primary: '#2563EB',        // Blue
  primaryDark: '#1E40AF',
  primaryLight: '#60A5FA',

  // Secondary
  secondary: '#10B981',      // Green
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#D1D5DB',
  textInverse: '#FFFFFF',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================================================
// Business Logic Constants
// ============================================================================

export const BOOK_PRICING = {
  hardcover: {
    '8x10': 7999,    // $79.99 in cents
    '11x14': 9999,   // $99.99
  },
  softcover: {
    '8x10': 4999,    // $49.99
    '11x14': 6999,   // $69.99
  },
} as const;

export const BOOK_SPECS = {
  MIN_PAGES: 20,
  MAX_PAGES: 200,
  PAGES_PER_STEP: 1,  // Estimate for pricing
} as const;

// ============================================================================
// API & Integration Constants
// ============================================================================

export const API_CONFIG = {
  TIMEOUT: 30000,              // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,           // 1 second
  BATCH_SIZE: 50,              // For batch operations
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  LOCATION_PERMISSION_DENIED: 'Location permission is required to track your journey.',
  PHOTO_PERMISSION_DENIED: 'Photo library access is needed to create your journal.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  STORAGE_ERROR: 'Failed to save data. Please check your device storage.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const;

// ============================================================================
// Analytics Event Names
// ============================================================================

export const ANALYTICS_EVENTS = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_DENIED: 'permission_denied',

  // Trip Actions
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
  STEP_ADDED_MANUALLY: 'step_added_manually',
  STEP_EDITED: 'step_edited',
  STEP_DELETED: 'step_deleted',

  // Book Actions
  BOOK_PREVIEW_VIEWED: 'book_preview_viewed',
  BOOK_ORDER_STARTED: 'book_order_started',
  BOOK_ORDER_COMPLETED: 'book_order_completed',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
} as const;

// ============================================================================
// Feature Flags (for MVP development)
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: true,
  ENABLE_MANUAL_STEP_EDITING: true,
  ENABLE_PHOTO_CLUSTERING: true,
  ENABLE_BOOK_ORDERING: false,  // Not ready yet
  ENABLE_ANALYTICS: false,      // Not connected yet
  DEBUG_MODE: __DEV__,
} as const;
