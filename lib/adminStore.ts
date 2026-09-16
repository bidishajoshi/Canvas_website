// Central store for tracking deleted items in local dev & placeholder database modes
const deletedIdsSet = new Set<string>();

export function markIdAsDeleted(id: string) {
  if (id) {
    deletedIdsSet.add(id);
  }
}

export function isIdDeleted(id: string): boolean {
  return deletedIdsSet.has(id);
}

export function filterDeleted<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item) => item && !deletedIdsSet.has(item.id));
}

export interface CanvasCategoryStoreItem {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  description?: string | null;
}

const customCanvasCategories: CanvasCategoryStoreItem[] = [];

export function addCustomCanvasCategory(cat: CanvasCategoryStoreItem) {
  customCanvasCategories.push(cat);
}

export function getCustomCanvasCategories(): CanvasCategoryStoreItem[] {
  return filterDeleted(customCanvasCategories);
}
