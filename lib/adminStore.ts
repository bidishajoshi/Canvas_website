import type { Category, Product, GalleryItem } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, DEFAULT_GALLERY_ITEMS } from './defaultProducts';

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

// In-memory category store
const categoriesStore: Category[] = [...DEFAULT_CATEGORIES];

export function getCategoriesStore(): Category[] {
  return filterDeleted(categoriesStore);
}

export function saveCategoryToStore(category: Category): Category {
  const existingIdx = categoriesStore.findIndex((c) => c.id === category.id);
  if (existingIdx >= 0) {
    categoriesStore[existingIdx] = { ...categoriesStore[existingIdx], ...category };
  } else {
    categoriesStore.unshift(category);
  }
  return category;
}

// In-memory product store
const productsStore: Product[] = [...DEFAULT_PRODUCTS];

export function getProductsStore(): Product[] {
  return filterDeleted(productsStore);
}

export function saveProductToStore(product: Product): Product {
  const existingIdx = productsStore.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    productsStore[existingIdx] = { ...productsStore[existingIdx], ...product };
  } else {
    productsStore.unshift(product);
  }
  return product;
}

// In-memory gallery items store
const galleryStore: GalleryItem[] = [...DEFAULT_GALLERY_ITEMS];

export function getGalleryStore(): GalleryItem[] {
  return filterDeleted(galleryStore);
}

export function saveGalleryItemToStore(item: GalleryItem): GalleryItem {
  const existingIdx = galleryStore.findIndex((g) => g.id === item.id);
  if (existingIdx >= 0) {
    galleryStore[existingIdx] = { ...galleryStore[existingIdx], ...item };
  } else {
    galleryStore.unshift(item);
  }
  return item;
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
