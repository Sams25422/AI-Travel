/**
 * Curated “trending now” activities — social-feed style inspiration.
 * Local data only (no partner keys). Deep-links open external search.
 */
export interface TrendingActivity {
  id: string;
  destinationId: string;
  title: string;
  category: 'food' | 'culture' | 'outdoors' | 'nightlife' | 'hidden';
  blurb: string;
  heat: number; // 0–100 social heat score
  imageUri: string;
  neighborhood?: string;
  bestTime?: string;
}

export const TRENDING_ACTIVITIES: TrendingActivity[] = [
  {
    id: 'paris-seine-sunset',
    destinationId: 'paris',
    title: 'Seine golden-hour picnic',
    category: 'outdoors',
    blurb: 'Locals are claiming river steps with baguette + wine before dusk.',
    heat: 92,
    neighborhood: 'Pont des Arts',
    bestTime: 'Sunset',
    imageUri:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  },
  {
    id: 'paris-marais-natural-wine',
    destinationId: 'paris',
    title: 'Marais natural-wine crawl',
    category: 'food',
    blurb: 'Small-producer lists are the move — book the counter, not the terrace.',
    heat: 88,
    neighborhood: 'Le Marais',
    bestTime: 'Evening',
    imageUri:
      'https://images.unsplash.com/photo-1510817742019-9e8ad6a7c5e2?w=800&q=80',
  },
  {
    id: 'paris-atelier-des-lumieres',
    destinationId: 'paris',
    title: 'Immersive art after dark',
    category: 'culture',
    blurb: 'Timed entries fill fast on rainy evenings — perfect plan-B culture.',
    heat: 81,
    neighborhood: '11th',
    bestTime: 'Night',
    imageUri:
      'https://images.unsplash.com/photo-1499781350541-7783f73ce6a1?w=800&q=80',
  },
  {
    id: 'marrakech-rooftop-breakfast',
    destinationId: 'marrakech',
    title: 'Rooftop breakfast before the medina',
    category: 'food',
    blurb: 'Beat the heat — mint tea and breads with Atlas Mountains views.',
    heat: 90,
    neighborhood: 'Medina',
    bestTime: 'Morning',
    imageUri:
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80',
  },
  {
    id: 'marrakech-Jardin-secret',
    destinationId: 'marrakech',
    title: 'Le Jardin Secret cool-down',
    category: 'hidden',
    blurb: 'Quiet courtyards when the souks peak — shade + citrus scent.',
    heat: 84,
    neighborhood: 'Mouassine',
    bestTime: 'Midday',
    imageUri:
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
  },
  {
    id: 'london-borough-market',
    destinationId: 'london',
    title: 'Borough Market lunch circuit',
    category: 'food',
    blurb: 'Still the city’s loudest lunch — cheese, oysters, then river walk.',
    heat: 87,
    neighborhood: 'Southwark',
    bestTime: 'Lunch',
    imageUri:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  },
  {
    id: 'london-sky-garden',
    destinationId: 'london',
    title: 'Sky Garden free views',
    category: 'culture',
    blurb: 'Book timed free tickets — golden hour slots go first.',
    heat: 79,
    neighborhood: 'City',
    bestTime: 'Golden hour',
    imageUri:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  },
  {
    id: 'tokyo-teamLab',
    destinationId: 'tokyo',
    title: 'teamLab night tickets',
    category: 'culture',
    blurb: 'Late slots feel calmer — still book ahead on weekends.',
    heat: 94,
    neighborhood: 'Toyosu',
    bestTime: 'Night',
    imageUri:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  },
  {
    id: 'tokyo-shimokitazawa',
    destinationId: 'tokyo',
    title: 'Shimokitazawa vinyl + coffee',
    category: 'nightlife',
    blurb: 'Indie streets after dark — record shops, kissaten, late ramen.',
    heat: 86,
    neighborhood: 'Shimokitazawa',
    bestTime: 'Evening',
    imageUri:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  },
  {
    id: 'dubai-al-fahidi',
    destinationId: 'dubai',
    title: 'Al Fahidi evening walk',
    category: 'culture',
    blurb: 'Creek breeze + galleries after the heat drops.',
    heat: 82,
    neighborhood: 'Bur Dubai',
    bestTime: 'Evening',
    imageUri:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  },
  {
    id: 'dubai-desert-sunrise',
    destinationId: 'dubai',
    title: 'Desert sunrise safari',
    category: 'outdoors',
    blurb: 'Skip midday dunes — dawn slots are cooler and quieter.',
    heat: 89,
    neighborhood: 'Desert Conservation Reserve',
    bestTime: 'Sunrise',
    imageUri:
      'https://images.unsplash.com/photo-1451337516015-6b6e9a96a6b5?w=800&q=80',
  },
];

export function getTrendingForDestination(destinationId: string): TrendingActivity[] {
  return TRENDING_ACTIVITIES.filter(a => a.destinationId === destinationId).sort(
    (a, b) => b.heat - a.heat,
  );
}

export function getGlobalTrending(limit = 8): TrendingActivity[] {
  return [...TRENDING_ACTIVITIES].sort((a, b) => b.heat - a.heat).slice(0, limit);
}
