import type { Business } from '../business';
import type { Category, CategoryGroup, City } from '../directory-data';

export type SeedDataModule = {
  businesses: Business[];
  cities: City[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
};

let seedDataPromise: Promise<SeedDataModule> | null = null;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function loadSeedDataFromJson(): Promise<SeedDataModule> {
  if (!seedDataPromise) {
    seedDataPromise = fetch('/seed-data.json')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Seed data request failed: ${response.status}`);
        }
        const payload = (await response.json()) as Partial<SeedDataModule>;
        return {
          cities: asArray<City>(payload.cities),
          categoryGroups: asArray<CategoryGroup>(payload.categoryGroups),
          categories: asArray<Category>(payload.categories),
          businesses: asArray<Business>(payload.businesses),
        };
      })
      .catch((error: unknown) => {
        seedDataPromise = null;
        throw error;
      });
  }

  return seedDataPromise;
}
