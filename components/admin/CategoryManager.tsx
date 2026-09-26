'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Category } from '@/lib/types';
import { createCategory, updateCategory, deleteCategory } from '@/app/admin/categories/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';
import { DeleteButton } from '@/components/admin/DeleteButton';

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [publishedMsg, setPublishedMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateSubmit(formData: FormData) {
    setIsSubmitting(true);
    setPublishedMsg(false);
    try {
      await createCategory(formData);
      setPublishedMsg(true);
      setNewImageUrl('');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories & Photos</h1>
          <p className="text-sm text-muted">
            Manage product categories, update category cover photos, and control website listing.
          </p>
        </div>
      </div>

      {/* Category List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-amber-500 hover:shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Photo Preview */}
              <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-neutral-900">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-500/20">
                    🖼️ No Image
                  </div>
                )}
                <span
                  className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${
                    cat.status === 'published'
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-neutral-600/80 text-white'
                  }`}
                >
                  {cat.status}
                </span>
              </div>

              <h2 className="font-display text-lg font-bold text-text">{cat.name}</h2>
              <p className="mt-1 text-xs text-muted font-mono">{cat.slug}</p>
              {cat.description && (
                <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold">
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setEditImageUrl(cat.image_url || '');
                }}
                className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"
              >
                ✏️ Edit Photo &amp; Info
              </button>

              <DeleteButton action={deleteCategory.bind(null, cat.id)} itemName={cat.name} className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No categories found. Add your first category using the form below.
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-bg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold">Edit Category: {editingCategory.name}</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-muted hover:text-text font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateCategory(editingCategory.id, formData);
                setEditingCategory(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted">Category Name</label>
                <input
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingCategory.description || ''}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-bg">
                <label className="text-xs font-bold text-text uppercase tracking-wider block">
                  📷 Category Cover Photo
                </label>
                <OptimizedImageUploader
                  mode="admin"
                  preset="admin"
                  buttonText="📁 Upload Category Cover Photo"
                  currentImageUrl={editImageUrl}
                  onOptimized={(result) => setEditImageUrl(result.url)}
                />
                <div>
                  <label className="text-[11px] font-semibold text-muted block mb-1">Or Image URL</label>
                  <input
                    name="image_url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted">Sort Order</label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={editingCategory.sort_order}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted">Status</label>
                  <select
                    name="status"
                    defaultValue={editingCategory.status}
                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400 shadow-md"
                >
                  Save Photo &amp; Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Category Form */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-text mb-4">Add New Category</h2>
        <form action={handleCreateSubmit} className="space-y-4">
          {publishedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between shadow-sm">
              <span>✓ Published successfully! Category is live on the website.</span>
              <button type="button" onClick={() => setPublishedMsg(false)} className="text-xs font-extrabold hover:underline ml-2">✕</button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted">Category Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Canvas Wall Clocks"
                className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted">Sort Order</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={categories.length + 1}
                className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Description</label>
            <input
              name="description"
              placeholder="Short description of this product photo category..."
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2.5 p-4 rounded-xl border border-border bg-bg">
            <label className="text-xs font-bold text-text uppercase tracking-wider block">
              📷 Category Cover Photo
            </label>
            <OptimizedImageUploader
              name="image_url"
              mode="admin"
              preset="admin"
              buttonText="📁 Upload Cover Photo from Computer"
              currentImageUrl={newImageUrl}
              onOptimized={(result) => setNewImageUrl(result.url)}
            />
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1">Or Cover Image URL</label>
              <input
                name="image_url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-60 shadow-md transition-all"
            >
              {isSubmitting ? 'Publishing...' : '+ Add Category with Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
