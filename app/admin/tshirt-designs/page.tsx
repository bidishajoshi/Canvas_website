import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { addTShirtDesign, deleteTShirtDesign } from './actions';

export default async function AdminTShirtDesignsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: dbDesigns } = await supabase
    .from('tshirt_designs')
    .select('*')
    .order('created_at', { ascending: false });

  const defaultDesigns = [
    {
      id: 'des-1',
      name: 'Kathmandu Vintage Graphic',
      theme: 'Nepal Culture',
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
      price_paisa: 120000,
    },
    {
      id: 'des-2',
      name: 'Minimalist Line Art Face',
      theme: 'Aesthetic Art',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      price_paisa: 95000,
    },
    {
      id: 'des-3',
      name: 'Cyberpunk Neon Tiger',
      theme: 'Streetwear',
      image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
      price_paisa: 110000,
    },
    {
      id: 'des-4',
      name: 'King & Queen Matching Emblem',
      theme: 'Couple',
      image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
      price_paisa: 130000,
    },
  ];

  const designs = dbDesigns && dbDesigns.length > 0 ? dbDesigns : defaultDesigns;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Ready-Made T-Shirt Designs</h1>
        <p className="text-xs text-muted mt-1">
          Manage ready-made print designs, logos, and artworks available for customers to apply onto custom T-shirts.
        </p>
      </div>

      {/* Add New Design Form */}
      <form action={addTShirtDesign} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Ready-Made Design</h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Design Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Kathmandu Heritage Emblem"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Theme / Category</label>
            <input
              type="text"
              name="theme"
              placeholder="e.g. Nepal Culture, Couple, Typography"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Image URL *</label>
            <input
              type="url"
              name="image_url"
              required
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Price Addon (Rs.)</label>
            <input
              type="number"
              name="price_rs"
              defaultValue={0}
              min={0}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          + Add Ready-Made Design
        </button>
      </form>

      {/* Designs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {designs.map((des) => (
          <div
            key={des.id}
            className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-square w-full bg-neutral-900">
                <Image src={des.image_url} alt={des.name} fill className="object-cover" />
                {des.theme && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {des.theme}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-bold text-text text-sm line-clamp-1">{des.name}</h4>
                <p className="text-xs font-semibold text-amber-600">
                  {des.price_paisa ? `+ Rs. ${Math.round(des.price_paisa / 100)}` : 'Included Free'}
                </p>
              </div>
            </div>

            <div className="p-3 pt-0 flex justify-end">
              <form action={deleteTShirtDesign.bind(null, des.id)}>
                <button type="submit" className="text-xs text-rose-600 font-bold hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
