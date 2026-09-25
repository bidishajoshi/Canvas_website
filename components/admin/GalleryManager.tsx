'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GalleryItem, Category } from '@/lib/types';
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/app/admin/gallery/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

interface GalleryManagerProps {
  items: GalleryItem[];
  categories: Category[];
}

export function GalleryManager({ items, categories }: GalleryManagerProps) {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const filteredItems = selectedCategoryFilter === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategoryFilter);

  const categoryNames = Array.from(
    new Set([
      ...categories.map((c) => c.name),
      'Single Canvas Prints',
      'Multi-Panel & Splits',
      'Aesthetic & Vastu Wall Art',
      'Customized T-Shirts & Apparel',
      'Personal & Family Photo Portraits',
      'Framed Art & Wall Decor',
    ])
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Photo Gallery Management</h1>
          <p className="text-sm text-muted">
            Add photos with respective categories, edit photo captions, and feature gallery showcases.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            selectedCategoryFilter === 'all'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'bg-surface text-muted hover:text-text'
          }`}
        >
          All Photos ({items.length})
        </button>
        {categoryNames.map((catName) => {
          const count = items.filter((i) => i.category === catName).length;
          return (
            <button
              key={catName}
              onClick={() => setSelectedCategoryFilter(catName)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                selectedCategoryFilter === catName
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-surface text-muted hover:text-text'
              }`}
            >
              {catName} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-amber-500 hover:shadow-md"
          >
            <div>
              {/* Photo Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={item.image_url}
                  alt={item.caption || 'Gallery Photo'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
                {item.is_featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-black shadow-md">
                    ★ Featured Showcase
                  </span>
                )}
                <span
                  className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                    item.status === 'published'
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-neutral-600/80 text-white'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Caption & Category */}
              <div className="p-4">
                <span className="inline-block rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 mb-1">
                  {item.category || 'Uncategorized'}
                </span>
                <p className="font-semibold text-sm text-text line-clamp-2">
                  {item.caption || 'Untitled Photo'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border/60 p-3 bg-bg/50 text-xs font-semibold">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setEditImageUrl(item.image_url);
                }}
                className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
              >
                ✏️ Edit Photo
              </button>
              <form action={deleteGalleryItem.bind(null, item.id)}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No photos found in this category filter. Add a photo below.
          </div>
        )}
      </div>

      {/* Edit Photo Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-bg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold">Edit Gallery Photo</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-muted hover:text-text font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateGalleryItem(editingItem.id, formData);
                setEditingItem(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted">Photo Image URL *</label>
                <input
                  name="image_url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {editImageUrl && (
                  <div className="relative mt-2 h-40 w-full overflow-hidden rounded-xl border border-border bg-neutral-900">
                    <Image
                      src={editImageUrl}
                      alt="Photo Preview"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted">Respective Category *</label>
                <select
                  name="category"
                  defaultValue={editingItem.category || ''}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">— Select Category —</option>
                  {categoryNames.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted">Photo Caption / Title</label>
                <input
                  name="caption"
                  defaultValue={editingItem.caption || ''}
                  placeholder="Describe this photo..."
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted">Sort Order</label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={editingItem.sort_order}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Status</label>
                  <select
                    name="status"
                    defaultValue={editingItem.status}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={editingItem.is_featured}
                  className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
                />
                Feature in Homepage Showcase
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-md"
                >
                  Save Photo Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Gallery Photo Form */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-text mb-4">Add Photo to Gallery with Category</h2>
        <form action={createGalleryItem} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted">Photo Image URL *</label>
            <input
              name="image_url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              required
              placeholder="https://images.unsplash.com/photo-..."
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {newImageUrl && (
              <div className="relative mt-2 h-40 w-full max-w-sm overflow-hidden rounded-xl border border-border bg-neutral-900">
                <Image
                  src={newImageUrl}
                  alt="New Photo Preview"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted">Respective Category *</label>
              <select
                name="category"
                required
                className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">— Select Respective Category —</option>
                {categoryNames.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted">Photo Caption / Title</label>
              <input
                name="caption"
                placeholder="e.g. 7 Running Horses Vastu Living Room Split"
                className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text">
              <input
                type="checkbox"
                name="is_featured"
                className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
              />
              Mark as Featured Photo Showcase
            </label>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 shadow-md transition-all"
            >
              + Add Photo with Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
