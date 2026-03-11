export const cityAliases: Record<string, string[]> = {
  kelowna: ['kelowna'],
  vernon: ['vernon'],
  penticton: ['penticton'],
  'west-kelowna': ['west kelowna', 'westbank'],
  'lake-country': ['lake country', 'winfield', 'oyama'],
  summerland: ['summerland'],
};

export type CityMatch = {
  matchedCityId: string | null;
  matchedBy: 'exact' | 'alias' | 'unknown';
};

export function matchCityFromAddress(address: string | undefined) {
  if (!address) {
    return {matchedCityId: null, matchedBy: 'unknown'} satisfies CityMatch;
  }

  const normalized = address.toLowerCase();
  const orderedMatches = Object.entries(cityAliases).sort(
    ([, leftAliases], [, rightAliases]) =>
      Math.max(...rightAliases.map((alias) => alias.length)) - Math.max(...leftAliases.map((alias) => alias.length)),
  );

  for (const [cityId, aliases] of orderedMatches) {
    for (const alias of aliases) {
      if (!normalized.includes(alias)) {
        continue;
      }

      return {
        matchedCityId: cityId,
        matchedBy: alias === cityId.replace(/-/g, ' ') ? 'exact' : 'alias',
      } satisfies CityMatch;
    }
  }

  return {matchedCityId: null, matchedBy: 'unknown'} satisfies CityMatch;
}
