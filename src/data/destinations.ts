/**
 * Curated destination catalog for Discover + trip planning templates.
 * Images are remote Unsplash URLs (demo); no API key required.
 */
import type {GeoPoint, StepType} from '../models';

export type TripStyle = 'vacation' | 'work' | 'adventure' | 'culture' | 'food';
export type BudgetLevel = 'low' | 'mid' | 'high';

export interface DestinationTemplateStop {
  dayOffset: number;
  title: string;
  type: StepType;
  startHour: number;
  durationHours: number;
  notes: string;
  location: GeoPoint;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  description: string;
  nights: number;
  rating: number;
  priceFrom: number;
  imageUri: string;
  thumbUri: string;
  center: GeoPoint;
  styles: TripStyle[];
  template: DestinationTemplateStop[];
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    tagline: 'Light, cafés, and long walks',
    description:
      'Plan a classic Paris weekend: museums by day, riverside evenings, and enough buffer to get lost on purpose. When you go, Atlas journals the path for you.',
    nights: 3,
    rating: 4.8,
    priceFrom: 420,
    imageUri:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    thumbUri:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=60',
    center: {latitude: 48.8566, longitude: 2.3522},
    styles: ['culture', 'food', 'vacation'],
    template: [
      {
        dayOffset: 0,
        title: 'Arrive · Latin Quarter stroll',
        type: 'visit',
        startHour: 15,
        durationHours: 3,
        notes: 'Settle in, walk the river, find your first café.',
        location: {latitude: 48.8498, longitude: 2.3488},
      },
      {
        dayOffset: 1,
        title: 'Louvre morning',
        type: 'visit',
        startHour: 9,
        durationHours: 3,
        notes: 'Book a timed entry; keep the afternoon open.',
        location: {latitude: 48.8606, longitude: 2.3376},
      },
      {
        dayOffset: 1,
        title: 'Eiffel Tower at golden hour',
        type: 'visit',
        startHour: 17,
        durationHours: 2,
        notes: 'Arrive early for the light; picnic on the Champ de Mars.',
        location: {latitude: 48.8584, longitude: 2.2945},
      },
      {
        dayOffset: 2,
        title: 'Montmartre & Sacré-Cœur',
        type: 'visit',
        startHour: 10,
        durationHours: 3,
        notes: 'Climb early, stay for street artists and a long lunch.',
        location: {latitude: 48.8867, longitude: 2.3431},
      },
      {
        dayOffset: 2,
        title: 'Seine dinner cruise',
        type: 'dining',
        startHour: 19,
        durationHours: 2,
        notes: 'Optional treat — or replace with a neighborhood bistro.',
        location: {latitude: 48.858, longitude: 2.348},
      },
      {
        dayOffset: 3,
        title: 'Departure buffer',
        type: 'transit',
        startHour: 10,
        durationHours: 2,
        notes: 'Leave room for one last bakery stop.',
        location: {latitude: 48.8566, longitude: 2.3522},
      },
    ],
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'Africa',
    tagline: 'Souks, courtyards, desert edge',
    description:
      'A sensory city break with a Sahara-ready day trip. Plan the rhythm now; Atlas will capture the nights and alleys when you travel.',
    nights: 4,
    rating: 4.6,
    priceFrom: 299,
    imageUri:
      'https://images.unsplash.com/photo-1517824805567-7bd3905ac1c6?w=1200&q=80',
    thumbUri:
      'https://images.unsplash.com/photo-1517824805567-7bd3905ac1c6?w=200&q=60',
    center: {latitude: 31.6295, longitude: -7.9811},
    styles: ['adventure', 'culture', 'vacation'],
    template: [
      {
        dayOffset: 0,
        title: 'Jemaa el-Fnaa dusk',
        type: 'visit',
        startHour: 17,
        durationHours: 3,
        notes: 'Arrive into the square as the stalls wake up.',
        location: {latitude: 31.6258, longitude: -7.9891},
      },
      {
        dayOffset: 1,
        title: 'Medina & souks',
        type: 'visit',
        startHour: 9,
        durationHours: 4,
        notes: 'Hire a guide or wander with a meeting point pinned.',
        location: {latitude: 31.631, longitude: -7.99},
      },
      {
        dayOffset: 2,
        title: 'Sahara day trip',
        type: 'visit',
        startHour: 6,
        durationHours: 12,
        notes: 'Long day — pack water, scarf, and a soft bag.',
        location: {latitude: 31.1, longitude: -4.0},
      },
      {
        dayOffset: 3,
        title: 'Hassan II Mosque day trip',
        type: 'visit',
        startHour: 8,
        durationHours: 10,
        notes: 'Casablanca coast alternative if desert is too far.',
        location: {latitude: 33.6086, longitude: -7.6328},
      },
      {
        dayOffset: 4,
        title: 'Riads & slow morning',
        type: 'stay',
        startHour: 9,
        durationHours: 3,
        notes: 'Leave space to rest before departure.',
        location: {latitude: 31.6295, longitude: -7.9811},
      },
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    tagline: 'Bridges, neighborhoods, weather be damned',
    description:
      'Build a flexible London plan around neighborhoods instead of checklists. Atlas will stitch the walks into a journal when you are there.',
    nights: 4,
    rating: 4.7,
    priceFrom: 480,
    imageUri:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    thumbUri:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&q=60',
    center: {latitude: 51.5074, longitude: -0.1278},
    styles: ['culture', 'work', 'food'],
    template: [
      {
        dayOffset: 0,
        title: 'Arrive · South Bank walk',
        type: 'visit',
        startHour: 16,
        durationHours: 2,
        notes: 'Shake off the flight along the Thames.',
        location: {latitude: 51.508, longitude: -0.1},
      },
      {
        dayOffset: 1,
        title: 'Tower Bridge & City',
        type: 'visit',
        startHour: 10,
        durationHours: 3,
        notes: 'Classic skyline morning; lunch near Borough Market.',
        location: {latitude: 51.5055, longitude: -0.0754},
      },
      {
        dayOffset: 2,
        title: 'West End evening',
        type: 'dining',
        startHour: 18,
        durationHours: 3,
        notes: 'Show + late dinner, or swap for a neighborhood pub.',
        location: {latitude: 51.513, longitude: -0.13},
      },
      {
        dayOffset: 3,
        title: 'Museums or parks day',
        type: 'visit',
        startHour: 11,
        durationHours: 4,
        notes: 'Pick one deep visit instead of three shallow ones.',
        location: {latitude: 51.4967, longitude: -0.1764},
      },
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    tagline: 'Neon nights, quiet shrines',
    description:
      'A balanced Tokyo sketch: neighborhoods, trains, and food stops you can reshuffle. Start planning here; live it later with Atlas tracking.',
    nights: 5,
    rating: 4.9,
    priceFrom: 650,
    imageUri:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    thumbUri:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=60',
    center: {latitude: 35.6762, longitude: 139.6503},
    styles: ['food', 'culture', 'adventure'],
    template: [
      {
        dayOffset: 0,
        title: 'Shinjuku arrival',
        type: 'stay',
        startHour: 16,
        durationHours: 3,
        notes: 'Drop bags, walk the neon grid, early sleep.',
        location: {latitude: 35.6938, longitude: 139.7034},
      },
      {
        dayOffset: 1,
        title: 'Asakusa & Senso-ji',
        type: 'visit',
        startHour: 9,
        durationHours: 3,
        notes: 'Go early before the crowds.',
        location: {latitude: 35.7148, longitude: 139.7967},
      },
      {
        dayOffset: 2,
        title: 'Shibuya & Harajuku',
        type: 'visit',
        startHour: 11,
        durationHours: 5,
        notes: 'Crosswalk, parks, and one great ramen stop.',
        location: {latitude: 35.6595, longitude: 139.7004},
      },
      {
        dayOffset: 3,
        title: 'Day trip · Nikko or Kamakura',
        type: 'transit',
        startHour: 8,
        durationHours: 10,
        notes: 'Pick one — both reward a full day.',
        location: {latitude: 35.6762, longitude: 139.6503},
      },
      {
        dayOffset: 4,
        title: 'TeamLab or museum block',
        type: 'visit',
        startHour: 13,
        durationHours: 3,
        notes: 'Book tickets ahead; keep dinner flexible.',
        location: {latitude: 35.65, longitude: 139.79},
      },
    ],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    tagline: 'Skyline, desert, soft landings',
    description:
      'Mix city icons with a desert evening. Plan the big beats; Atlas captures the rest when you travel.',
    nights: 3,
    rating: 4.5,
    priceFrom: 520,
    imageUri:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    thumbUri:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=60',
    center: {latitude: 25.2048, longitude: 55.2708},
    styles: ['vacation', 'adventure', 'work'],
    template: [
      {
        dayOffset: 0,
        title: 'Marina evening',
        type: 'visit',
        startHour: 18,
        durationHours: 2,
        notes: 'Waterfront walk and jet-lag dinner.',
        location: {latitude: 25.08, longitude: 55.14},
      },
      {
        dayOffset: 1,
        title: 'Old Dubai & Creek',
        type: 'visit',
        startHour: 9,
        durationHours: 4,
        notes: 'Souks, abra ride, museum if energy allows.',
        location: {latitude: 25.265, longitude: 55.297},
      },
      {
        dayOffset: 2,
        title: 'Desert evening',
        type: 'visit',
        startHour: 15,
        durationHours: 5,
        notes: 'Book a reputable operator; sunset is the point.',
        location: {latitude: 24.9, longitude: 55.6},
      },
    ],
  },
];

export const REGIONS = ['All', 'Europe', 'Africa', 'Asia', 'Middle East'] as const;

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}

export function searchDestinations(query: string): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return DESTINATIONS;
  return DESTINATIONS.filter(
    d =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.styles.some(s => s.includes(q)),
  );
}

/** Lightweight NL parse for "Ask Atlas…" — days + destination name. */
export function parseAskAtlas(query: string): {
  destination?: Destination;
  nights?: number;
  raw: string;
} {
  const raw = query.trim();
  const lower = raw.toLowerCase();
  const nightsMatch = lower.match(/(\d+)\s*[- ]?\s*(day|days|night|nights)/);
  const nights = nightsMatch ? Math.max(1, parseInt(nightsMatch[1], 10)) : undefined;
  const destination = DESTINATIONS.find(
    d =>
      lower.includes(d.name.toLowerCase()) ||
      lower.includes(d.country.toLowerCase()) ||
      lower.includes(d.id),
  );
  return {destination, nights, raw};
}
