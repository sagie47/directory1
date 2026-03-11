import { createContext, startTransition, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { Business } from './business';
import {
  businesses as localBusinesses,
  categories as localCategories,
  categoryGroups as localCategoryGroups,
  cities as localCities,
} from './data';
import { isSupabaseConfigured, supabase } from './lib/supabase';

export type City = {
  id: string;
  name: string;
  description?: string;
};

export type CategoryGroup = {
  id: string;
  name: string;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
  groupId?: string | null;
};

type DirectoryData = {
  cities: City[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  businesses: Business[];
};

type DirectoryDataState = DirectoryData & {
  isLoading: boolean;
  source: 'database' | 'seed';
  error?: string;
};

type DirectoryDataContextValue = DirectoryDataState & {
  refresh: () => Promise<void>;
};

type BusinessRow = {
  id: string;
  name: string;
  city_id: string;
  category_id: string;
  description: string | null;
  rating: number | null;
  review_count: number | null;
  service_areas: unknown;
  category_tags: unknown;
  specialties: unknown;
  photos: unknown;
  reviews: unknown;
  hours: unknown;
  coordinates: unknown;
  contact: unknown;
  source: unknown;
};

type BusinessOverrideRow = {
  business_id: string;
  description: string | null;
  contact: unknown;
  service_areas: unknown;
  hours: unknown;
  photos: unknown;
};

function isMissingOverridesTable(error: { code?: string; message?: string } | null | undefined) {
  if (!error) {
    return false;
  }

  return error.code === '42P01'
    || error.code === 'PGRST205'
    || error.message?.includes("Could not find the table 'public.business_overrides'") === true;
}

const seedCities: City[] = localCities;

const seedCategoryGroups: CategoryGroup[] = localCategoryGroups;

const seedCategories: Category[] = localCategories;

const seedData: DirectoryData = {
  cities: seedCities,
  categoryGroups: seedCategoryGroups,
  categories: seedCategories,
  businesses: localBusinesses,
};

const DirectoryDataContext = createContext<DirectoryDataContextValue>({
  ...seedData,
  isLoading: false,
  source: 'seed',
  refresh: async () => {},
});

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asReviews(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.author !== 'string' || typeof candidate.text !== 'string' || typeof candidate.rating !== 'number') {
      return [];
    }

    return [{
      author: candidate.author,
      text: candidate.text,
      rating: candidate.rating,
    }];
  });
}

function asCoordinates(value: unknown) {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const coordinates = value as Record<string, unknown>;
  return typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
    ? { lat: coordinates.lat, lng: coordinates.lng }
    : undefined;
}

function mapBusinessRow(row: BusinessRow): Business {
  const contact = asRecord(row.contact);
  const source = asRecord(row.source);

  return {
    id: row.id,
    name: row.name,
    cityId: row.city_id,
    categoryId: row.category_id,
    description: row.description ?? undefined,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    reviewCount: typeof row.review_count === 'number' ? row.review_count : undefined,
    serviceAreas: asStringArray(row.service_areas),
    categoryTags: asStringArray(row.category_tags),
    specialties: asStringArray(row.specialties),
    photos: asStringArray(row.photos),
    reviews: asReviews(row.reviews),
    hours: asRecord(row.hours) as Record<string, string>,
    coordinates: asCoordinates(row.coordinates),
    contact: {
      phone: typeof contact.phone === 'string' ? contact.phone : undefined,
      website: typeof contact.website === 'string' ? contact.website : undefined,
      address: typeof contact.address === 'string' ? contact.address : undefined,
      email: typeof contact.email === 'string' ? contact.email : undefined,
    },
    source: {
      provider: typeof source.provider === 'string' ? source.provider : undefined,
      cid: typeof source.cid === 'string' ? source.cid : undefined,
      placeId: typeof source.placeId === 'string' ? source.placeId : undefined,
      category: typeof source.category === 'string' ? source.category : undefined,
      mapsUrl: typeof source.mapsUrl === 'string' ? source.mapsUrl : undefined,
    },
  };
}

function mergeBusinessOverride(business: Business, override?: BusinessOverrideRow) {
  if (!override) {
    return business;
  }

  const contact = asRecord(override.contact);
  const overrideServiceAreas = asStringArray(override.service_areas);
  const overridePhotos = asStringArray(override.photos);
  const overrideHours = asRecord(override.hours) as Record<string, string>;

  return {
    ...business,
    description: typeof override.description === 'string' ? override.description : business.description,
    contact: {
      ...business.contact,
      phone: typeof contact.phone === 'string' ? contact.phone : business.contact.phone,
      website: typeof contact.website === 'string' ? contact.website : business.contact.website,
      email: typeof contact.email === 'string' ? contact.email : business.contact.email,
    },
    serviceAreas: overrideServiceAreas.length > 0 ? overrideServiceAreas : business.serviceAreas,
    hours: Object.keys(overrideHours).length > 0 ? overrideHours : business.hours,
    photos: overridePhotos.length > 0 ? overridePhotos : business.photos,
  };
}

async function fetchDirectoryData(): Promise<DirectoryData> {
  if (!supabase) {
    console.info('[directory-data] Supabase not configured. Using local seed data.', {
      cities: seedData.cities.length,
      categories: seedData.categories.length,
      businesses: seedData.businesses.length,
    });
    return seedData;
  }

  const [citiesResult, groupResult, categoriesResult, businessesResult, overridesResult] = await Promise.all([
    supabase.from('cities').select('id, name, description').order('name'),
    supabase.from('category_groups').select('id, name, description').order('name'),
    supabase.from('categories').select('id, name, icon, group_id').order('name'),
    supabase.from('businesses').select('id, name, city_id, category_id, description, rating, review_count, service_areas, category_tags, specialties, photos, reviews, hours, coordinates, contact, source').order('name'),
    supabase.from('business_overrides').select('business_id, description, contact, service_areas, hours, photos'),
  ]);

  const overridesError = isMissingOverridesTable(overridesResult.error) ? null : overridesResult.error;
  const firstError = citiesResult.error ?? groupResult.error ?? categoriesResult.error ?? businessesResult.error ?? overridesError;
  if (firstError) {
    throw new Error(firstError.message);
  }

  const overridesByBusinessId = new Map(
    ((overridesResult.data ?? []) as BusinessOverrideRow[]).map((override) => [override.business_id, override])
  );

  const data = {
    cities: citiesResult.data ?? seedData.cities,
    categoryGroups: (groupResult.data ?? []).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
    })),
    categories: (categoriesResult.data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon ?? undefined,
      groupId: category.group_id ?? undefined,
    })),
    businesses: ((businessesResult.data ?? []) as BusinessRow[]).map((row) =>
      mergeBusinessOverride(mapBusinessRow(row), overridesByBusinessId.get(row.id))
    ),
  };

  console.info('[directory-data] Supabase read completed.', {
    cities: data.cities.length,
    categoryGroups: data.categoryGroups.length,
    categories: data.categories.length,
    businesses: data.businesses.length,
    overrides: overridesByBusinessId.size,
  });

  if (data.businesses.length === 0) {
    throw new Error('Supabase read succeeded but returned zero businesses.');
  }

  return data;
}

export function DirectoryDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DirectoryDataState>({
    ...seedData,
    isLoading: isSupabaseConfigured(),
    source: 'seed',
  });

  const refresh = async () => {
    if (!isSupabaseConfigured()) {
      setState({
        ...seedData,
        isLoading: false,
        source: 'seed',
      });
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      error: undefined,
    }));

    try {
      const data = await fetchDirectoryData();
      startTransition(() => {
        setState({
          ...data,
          isLoading: false,
          source: 'database',
        });
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to load directory data.';
      console.error('[directory-data] Refresh failed. Falling back to local seed data.', error);
      setState((current) => ({
        ...seedData,
        isLoading: false,
        source: 'seed',
        error: message,
      }));
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    let isActive = true;

    fetchDirectoryData()
      .then((data) => {
        if (!isActive) {
          return;
        }

        startTransition(() => {
          setState({
            ...data,
            isLoading: false,
            source: 'database',
          });
        });
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load directory data.';
        console.error('[directory-data] Initial load failed. Falling back to local seed data.', error);
        setState(() => ({
          ...seedData,
          isLoading: false,
          source: 'seed',
          error: message,
        }));
      });

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo(() => ({
    ...state,
    refresh,
  }), [state]);

  return (
    <DirectoryDataContext.Provider value={value}>
      {children}
    </DirectoryDataContext.Provider>
  );
}

export function useDirectoryData() {
  return useContext(DirectoryDataContext);
}
