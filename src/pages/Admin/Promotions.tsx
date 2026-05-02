import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Percent, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PromotionService } from '../../services/storeService';
import type { Promotion } from '../../types';
import AdminAccessNotice from '../../components/AdminAccessNotice';
import AdminShell from '../../components/AdminShell';

const emptyPromo: Omit<Promotion, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  applicableCategories: [],
};

const AdminPromotions = () => {
  const { canAccessPromotions } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPromo, setNewPromo] = useState<Omit<Promotion, 'id' | 'createdAt'>>(emptyPromo);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PromotionService.getAllPromotions();
      setPromotions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load campaign planning right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleAddPromotion = async () => {
    setSaving(true);
    setError('');
    try {
      await PromotionService.addPromotion(newPromo);
      setNewPromo(emptyPromo);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to launch the promotion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await PromotionService.deletePromotion(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove the promotion.');
    } finally {
      setSaving(false);
    }
  };

  if (!canAccessPromotions) return <AdminAccessNotice />;
  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic">Reviewing the offer board...</div>;

  return (
    <AdminShell
      title={<><span>Offers & </span><span className="italic">Festive Sales</span></>}
      subtitle="Launch polished campaigns for bridal drops, seasonal edits, and private client incentives"
    >
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
        <section className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-45">Campaign Builder</p>
            <h2 className="text-2xl font-serif mt-2">Create a new promotion</h2>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Offer Title</span>
            <input value={newPromo.title} onChange={(e) => setNewPromo((current) => ({ ...current, title: e.target.value }))} className="w-full border border-black/10 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          </label>
          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Description</span>
            <textarea value={newPromo.description} onChange={(e) => setNewPromo((current) => ({ ...current, description: e.target.value }))} className="w-full min-h-[120px] border border-black/10 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Discount Type</span>
              <select value={newPromo.discountType} onChange={(e) => setNewPromo((current) => ({ ...current, discountType: e.target.value as Promotion['discountType'] }))} className="w-full border border-black/10 px-4 py-3 bg-white outline-none focus:border-[#D4AF37]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (INR)</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Discount Value</span>
              <input type="number" value={newPromo.discountValue} onChange={(e) => setNewPromo((current) => ({ ...current, discountValue: Number(e.target.value) }))} className="w-full border border-black/10 px-4 py-3 outline-none focus:border-[#D4AF37]" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">Start Date</span>
              <input type="date" value={newPromo.startDate as string} onChange={(e) => setNewPromo((current) => ({ ...current, startDate: e.target.value }))} className="w-full border border-black/10 px-4 py-3 outline-none focus:border-[#D4AF37]" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-50">End Date</span>
              <input type="date" value={newPromo.endDate as string} onChange={(e) => setNewPromo((current) => ({ ...current, endDate: e.target.value }))} className="w-full border border-black/10 px-4 py-3 outline-none focus:border-[#D4AF37]" />
            </label>
          </div>

          <button type="button" onClick={() => void handleAddPromotion()} disabled={saving || !newPromo.title} className="w-full bg-black text-white py-4 uppercase text-[10px] tracking-[0.35em] font-bold disabled:opacity-50">
            Launch Promotion
          </button>
        </section>

        <section className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-45">Live Campaigns</p>
            <h2 className="text-2xl font-serif mt-2">Current offer stack</h2>
          </div>

          <div className="space-y-4">
            {promotions.map((promo) => (
              <article key={promo.id} className="border border-black/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl">{promo.title}</h3>
                    <p className="text-sm opacity-60 mt-2">{promo.description}</p>
                  </div>
                  <button type="button" onClick={() => void handleDeletePromotion(promo.id)} className="border border-red-200 text-red-600 p-3 rounded-xl hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] uppercase tracking-[0.25em] font-bold">
                    <Percent size={12} />
                    {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' INR'} off
                  </span>
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] opacity-55">
                    <Calendar size={12} />
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Start'} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'End'}
                  </span>
                  {promo.isActive && (
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold text-[#D4AF37]">
                      <CheckCircle2 size={12} />
                      Active Now
                    </span>
                  )}
                </div>
              </article>
            ))}

            {promotions.length === 0 && <div className="py-24 text-center opacity-35 italic font-serif">No promotions are active yet.</div>}
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminPromotions;
