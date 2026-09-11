/**
 * Pure travel deep-link builders (no React Native imports — safe for Node agent server).
 */
export interface TravelLink {
  id: string;
  label: string;
  subtitle: string;
  url: string;
  kind: 'flight' | 'hotel' | 'activity' | 'maps';
}

function encode(value: string): string {
  return encodeURIComponent(value);
}

function ymd(date = new Date(), offsetDays = 0): string {
  const d = new Date(date);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function buildFlightLinks(input: {
  origin?: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
}): TravelLink[] {
  const origin = input.origin || 'NYC';
  const dest = input.destination;
  const depart = input.departDate || ymd(new Date(), 21);
  const ret = input.returnDate || ymd(new Date(), 28);
  return [
    {
      id: 'google-flights',
      label: 'Google Flights',
      subtitle: `${origin} → ${dest}`,
      kind: 'flight',
      url: `https://www.google.com/travel/flights?q=Flights%20to%20${encode(dest)}%20from%20${encode(origin)}%20on%20${depart}%20through%20${ret}`,
    },
    {
      id: 'kayak-flights',
      label: 'Kayak',
      subtitle: 'Compare fares',
      kind: 'flight',
      url: `https://www.kayak.com/flights/${encode(origin)}-${encode(dest)}/${depart}/${ret}?sort=bestflight_a`,
    },
    {
      id: 'skyscanner',
      label: 'Skyscanner',
      subtitle: 'Everywhere search',
      kind: 'flight',
      url: `https://www.skyscanner.com/transport/flights/${encode(origin.toLowerCase())}/${encode(dest.toLowerCase())}/${depart.replace(/-/g, '')}/${ret.replace(/-/g, '')}/`,
    },
  ];
}

export function buildHotelLinks(input: {
  city: string;
  checkIn?: string;
  checkOut?: string;
}): TravelLink[] {
  const city = input.city;
  const checkIn = input.checkIn || ymd(new Date(), 21);
  const checkOut = input.checkOut || ymd(new Date(), 24);
  return [
    {
      id: 'booking',
      label: 'Booking.com',
      subtitle: `${city} · ${checkIn} → ${checkOut}`,
      kind: 'hotel',
      url: `https://www.booking.com/searchresults.html?ss=${encode(city)}&checkin=${checkIn}&checkout=${checkOut}`,
    },
    {
      id: 'hotels',
      label: 'Hotels.com',
      subtitle: 'Maps + guest scores',
      kind: 'hotel',
      url: `https://www.hotels.com/Hotel-Search?destination=${encode(city)}&startDate=${checkIn}&endDate=${checkOut}`,
    },
    {
      id: 'maps-hotels',
      label: 'Google Maps stays',
      subtitle: 'Browse the neighborhood',
      kind: 'hotel',
      url: `https://www.google.com/maps/search/hotels+in+${encode(city)}`,
    },
  ];
}

export function buildActivityLinks(input: {
  city: string;
  query?: string;
}): TravelLink[] {
  const q = input.query ? `${input.query} ${input.city}` : `things to do ${input.city}`;
  return [
    {
      id: 'getyourguide',
      label: 'GetYourGuide',
      subtitle: input.query || 'Top experiences',
      kind: 'activity',
      url: `https://www.getyourguide.com/s/?q=${encode(q)}`,
    },
    {
      id: 'viator',
      label: 'Viator',
      subtitle: 'Tours & tickets',
      kind: 'activity',
      url: `https://www.viator.com/searchResults/all?text=${encode(q)}`,
    },
    {
      id: 'maps-activity',
      label: 'Google Maps',
      subtitle: 'Open nearby places',
      kind: 'maps',
      url: `https://www.google.com/maps/search/${encode(q)}`,
    },
  ];
}
