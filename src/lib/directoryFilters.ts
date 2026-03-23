export const ACTIVE_CITY_IDS = new Set([
  'kelowna',
  'vernon',
  'penticton',
  'west-kelowna',
  'lake-country',
  'summerland',
  'kamloops',
  'salmon-arm',
  'oliver',
  'peachland',
  'osoyoos',
  'armstrong',
]);

export function isActiveCityId(cityId: string) {
  return ACTIVE_CITY_IDS.has(cityId);
}
