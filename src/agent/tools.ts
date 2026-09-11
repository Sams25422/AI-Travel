/**
 * Atlas agent tools — shared by local router + Anthropic tool loop.
 * Keep this module free of react-native imports (Node server must import it).
 */
import {DESTINATIONS, getDestination} from '../data/destinations';
import {
  getGlobalTrending,
  getTrendingForDestination,
  type TrendingActivity,
} from '../data/trending';
import type {ItineraryItem} from '../models';
import WeatherService, {type WeatherSnapshot} from '../services/WeatherService';
import {
  buildActivityLinks,
  buildFlightLinks,
  buildHotelLinks,
  type TravelLink,
} from '../services/travelLinkBuilders';

export interface AgentToolContext {
  destinationId?: string;
  destinationName?: string;
  tripId?: string;
  tripName?: string;
  nights?: number;
  originCity?: string;
  itinerary?: ItineraryItem[];
}

export interface AgentArtifacts {
  links: TravelLink[];
  activities: TrendingActivity[];
  weather?: WeatherSnapshot;
  suggestions: string[];
}

export const ANTHROPIC_TOOLS = [
  {
    name: 'get_weather',
    description:
      'Get a weather forecast for a destination (Open-Meteo). Use before advising packing or outdoor plans.',
    input_schema: {
      type: 'object',
      properties: {
        destination_id: {
          type: 'string',
          description: 'Atlas destination id such as paris, tokyo, marrakech',
        },
        destination_name: {
          type: 'string',
          description: 'City name if id unknown',
        },
        days: {
          type: 'number',
          description: 'Forecast days 1–7',
        },
      },
      required: [] as string[],
    },
  },
  {
    name: 'get_trending',
    description: 'List curated trending activities for a destination.',
    input_schema: {
      type: 'object',
      properties: {
        destination_id: {type: 'string'},
        destination_name: {type: 'string'},
        limit: {type: 'number'},
      },
      required: [] as string[],
    },
  },
  {
    name: 'search_flights',
    description:
      'Build partner deep-links for flight search (Google Flights, Kayak, Skyscanner). Does not book.',
    input_schema: {
      type: 'object',
      properties: {
        origin: {type: 'string', description: 'Origin city or airport code'},
        destination: {type: 'string'},
        depart_date: {type: 'string', description: 'YYYY-MM-DD'},
        return_date: {type: 'string', description: 'YYYY-MM-DD'},
      },
      required: ['destination'],
    },
  },
  {
    name: 'search_hotels',
    description:
      'Build partner deep-links for hotel search. Does not book inside Atlas.',
    input_schema: {
      type: 'object',
      properties: {
        city: {type: 'string'},
        check_in: {type: 'string'},
        check_out: {type: 'string'},
      },
      required: ['city'],
    },
  },
  {
    name: 'search_activities',
    description: 'Build deep-links for tours and activities.',
    input_schema: {
      type: 'object',
      properties: {
        city: {type: 'string'},
        query: {type: 'string'},
      },
      required: ['city'],
    },
  },
  {
    name: 'get_destination_brief',
    description:
      'Catalog brief for an Atlas destination: tagline, nights, styles, sample first stop.',
    input_schema: {
      type: 'object',
      properties: {
        destination_id: {type: 'string'},
        destination_name: {type: 'string'},
      },
      required: [] as string[],
    },
  },
  {
    name: 'get_itinerary_summary',
    description: 'Summarize the user trip itinerary currently in context.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [] as string[],
    },
  },
] as const;

function resolveDestination(
  ctx: AgentToolContext,
  destinationId?: string,
  destinationName?: string,
) {
  if (destinationId) {
    const byId = getDestination(destinationId);
    if (byId) return byId;
  }
  if (ctx.destinationId) {
    const byCtx = getDestination(ctx.destinationId);
    if (byCtx) return byCtx;
  }
  const name = (destinationName || ctx.destinationName || '').toLowerCase();
  if (name) {
    const found = DESTINATIONS.find(
      d =>
        d.name.toLowerCase() === name ||
        d.id === name ||
        d.country.toLowerCase() === name ||
        name.includes(d.name.toLowerCase()),
    );
    if (found) return found;
  }
  return DESTINATIONS[0];
}

export function emptyArtifacts(): AgentArtifacts {
  return {links: [], activities: [], suggestions: []};
}

export function mergeArtifacts(
  into: AgentArtifacts,
  patch: Partial<AgentArtifacts>,
): AgentArtifacts {
  return {
    links: [...into.links, ...(patch.links || [])],
    activities: [...into.activities, ...(patch.activities || [])],
    weather: patch.weather || into.weather,
    suggestions: patch.suggestions?.length
      ? patch.suggestions
      : into.suggestions,
  };
}

export async function executeAgentTool(
  name: string,
  input: Record<string, unknown>,
  ctx: AgentToolContext,
  artifacts: AgentArtifacts,
): Promise<{result: unknown; artifacts: AgentArtifacts}> {
  switch (name) {
    case 'get_weather': {
      const dest = resolveDestination(
        ctx,
        input.destination_id as string | undefined,
        input.destination_name as string | undefined,
      );
      const days = Math.min(
        7,
        Math.max(1, Number(input.days) || ctx.nights || 5),
      );
      const weather = await WeatherService.getForecast(
        dest.center,
        dest.name,
        days,
      );
      const tip = weather.daily[0]
        ? WeatherService.adviceForDay(weather.daily[0])
        : '';
      return {
        result: {...weather, tip},
        artifacts: mergeArtifacts(artifacts, {
          weather,
          suggestions: [
            `Hotels in ${dest.name}`,
            `What's trending in ${dest.name}?`,
            'Indoor ideas if it rains',
          ],
        }),
      };
    }
    case 'get_trending': {
      const dest = resolveDestination(
        ctx,
        input.destination_id as string | undefined,
        input.destination_name as string | undefined,
      );
      const limit = Math.min(6, Math.max(1, Number(input.limit) || 4));
      const local = getTrendingForDestination(dest.id);
      const activities = (
        local.length ? local : getGlobalTrending(limit)
      ).slice(0, limit);
      const links = buildActivityLinks({
        city: dest.name,
        query: activities[0]?.title,
      });
      return {
        result: {destination: dest.name, activities},
        artifacts: mergeArtifacts(artifacts, {
          activities,
          links,
          suggestions: [
            `Weather in ${dest.name}`,
            'Help me plan the first day',
            `Hotels in ${dest.name}`,
          ],
        }),
      };
    }
    case 'search_flights': {
      const destination =
        (input.destination as string) || resolveDestination(ctx).name;
      const links = buildFlightLinks({
        origin: (input.origin as string) || ctx.originCity || 'NYC',
        destination,
        departDate: input.depart_date as string | undefined,
        returnDate: input.return_date as string | undefined,
      });
      return {
        result: {destination, links},
        artifacts: mergeArtifacts(artifacts, {
          links,
          suggestions: [
            `Hotels in ${destination}`,
            `Weather in ${destination}`,
            'Help me plan the first day',
          ],
        }),
      };
    }
    case 'search_hotels': {
      const city = (input.city as string) || resolveDestination(ctx).name;
      const links = buildHotelLinks({
        city,
        checkIn: input.check_in as string | undefined,
        checkOut: input.check_out as string | undefined,
      });
      return {
        result: {city, links},
        artifacts: mergeArtifacts(artifacts, {
          links,
          suggestions: [
            `What's trending in ${city}?`,
            `Flights to ${city}`,
            'Suggest a 3-night rhythm',
          ],
        }),
      };
    }
    case 'search_activities': {
      const city = (input.city as string) || resolveDestination(ctx).name;
      const links = buildActivityLinks({
        city,
        query: input.query as string | undefined,
      });
      return {
        result: {city, links},
        artifacts: mergeArtifacts(artifacts, {
          links,
          suggestions: [
            `Weather in ${city}`,
            `Hotels in ${city}`,
            "What's trending now?",
          ],
        }),
      };
    }
    case 'get_destination_brief': {
      const dest = resolveDestination(
        ctx,
        input.destination_id as string | undefined,
        input.destination_name as string | undefined,
      );
      const sample = dest.template[0];
      return {
        result: {
          id: dest.id,
          name: dest.name,
          country: dest.country,
          tagline: dest.tagline,
          nights: dest.nights,
          styles: dest.styles,
          firstStop: sample
            ? {title: sample.title, notes: sample.notes}
            : null,
        },
        artifacts: mergeArtifacts(artifacts, {
          suggestions: [
            `Weather in ${dest.name}`,
            `Flights to ${dest.name}`,
            `Hotels in ${dest.name}`,
            `What's trending in ${dest.name}?`,
          ],
        }),
      };
    }
    case 'get_itinerary_summary': {
      const items = ctx.itinerary || [];
      const confirmed = items.filter(i => i.isConfirmed).length;
      return {
        result: {
          tripId: ctx.tripId || null,
          tripName: ctx.tripName || null,
          stopCount: items.length,
          confirmed,
          stops: items.slice(0, 12).map(i => ({
            title: i.title,
            dayIndex: i.dayIndex,
            confirmed: i.isConfirmed,
            notes: i.notes,
          })),
        },
        artifacts,
      };
    }
    default:
      return {
        result: {error: `Unknown tool: ${name}`},
        artifacts,
      };
  }
}

export function buildSystemPrompt(ctx: AgentToolContext): string {
  const dest = resolveDestination(ctx);
  return [
    'You are Atlas, a practical travel agent inside the Atlas app.',
    'Help the user plan trips: weather-aware advice, trending activities, flights/hotels/activities via partner deep-links.',
    'Never invent live prices or claim you completed a booking. Atlas does not take booking fees or OTA checkout.',
    'Prefer calling tools for weather, trending, and search links instead of guessing.',
    'Keep replies concise (2–4 short paragraphs). End with a clear next question when useful.',
    'Tone: warm, competent, forest-trail calm — not corporate, not emoji-heavy.',
    `Default destination context: ${dest.name} (${dest.id}), ${dest.nights} nights, “${dest.tagline}”.`,
    ctx.tripName ? `Active trip: ${ctx.tripName}.` : '',
    ctx.originCity
      ? `Home/origin hint: ${ctx.originCity}.`
      : 'Default flight origin: NYC unless user says otherwise.',
  ]
    .filter(Boolean)
    .join('\n');
}
