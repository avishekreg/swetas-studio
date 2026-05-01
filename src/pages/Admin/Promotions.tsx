import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { PromotionService } from '../../services/storeService';
import { Promotion } from '../../types';
import { Plus, Trash2, Calendar, Tag, Percent, CheckCircle2 } from 'lucide-react';

const AdminPromotions = () => {
  const { isAdmin } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromo, setNewPromo] = useState<Omit<Promotion, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableCategories: []
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const data = await PromotionService.getAllPromotions();
    if (data) setPromotions(data);
    setLoading(false);
  };

  const handleAddPromotion = async () => {
    setLoading(true);
    await PromotionService.addPromotion(newPromo);
    setNewPromo({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      applicableCategories: []
    });
    fetchPromotions();
  };

  const handleDeletePromotion = async (id: string) => {
    if (confirm('Delete this promotion?')) {
      setLoading(true);
      await PromotionService.deletePromotion(id);
      fetchPromotions();
    }
  };

  if (!isAdmin) return <div className="p-24 text-center">Restricted Access</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 space-y-16"
    >
      <div className="flex items-end justify-between border-b border-black/10 pb-8">
        <div>
          <h1 className="text-4xl font-serif">Offers & <span className="italic">Festive Sales</span></h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-2">Manage seasonal promotions and discounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Create Promotion */}
        <section className="space-y-8 bg-white/40 p-8 rounded-2xl backdrop-blur-sm shadow-xl border border-white/20">
          <h2 className="text-xl font-serif flex items-center gap-2">
            <Tag size={20} className="text-[#D4AF37]" />
            New Campaign
          </h2>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Offer Title</label>
              <input 
                type="text" 
                value={newPromo.title}
                onChange={e => setNewPromo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="E.g. Diwali Splendor Sale"
                className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Description</label>
              <textarea 
                value={newPromo.description}
                onChange={e => setNewPromo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="E.g. Celebrate with 20% off on all bridal wear."
                className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Discount Type</label>
                <select 
                  value={newPromo.discountType}
                  onChange={e => setNewPromo(prev => ({ ...prev, discountType: e.target.value as any }))}
                  className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (INR)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Value</label>
                <input 
                  type="number" 
                  value={newPromo.discountValue}
                  onChange={e => setNewPromo(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-emerald-600 flex items-center gap-1">
                  <Calendar size={12} /> Start Date
                </label>
                <input 
                  type="date" 
                  value={newPromo.startDate}
                  onChange={e => setNewPromo(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-red-600 flex items-center gap-1">
                  <Calendar size={12} /> End Date
                </label>
                <input 
                  type="date" 
                  value={newPromo.endDate}
                  onChange={e => setNewPromo(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleAddPromotion}
              disabled={loading || !newPromo.title}
              className="w-full bg-[#1a1a1a] text-white py-5 text-[10px] tracking-widest uppercase font-bold hover:bg-black disabled:opacity-50 transition-all shadow-lg"
            >
              Launch Promotion
            </button>
          </div>
        </section>

        {/* Right: Active Promotions */}
        <section className="space-y-8">
          <h2 className="text-xl font-serif">Active Campaigns</h2>
          <div className="space-y-6">
            {promotions.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-black/5 rounded-2xl opacity-40">
                <Percent size={32} className="mx-auto mb-4" />
                <p className="text-xs uppercase tracking-widest">No promotions active</p>
              </div>
            ) : (
              promotions.map(promo => (
                <div key={promo.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex flex-col gap-4 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg text-[#1a1a1a]">{promo.title}</h3>
                      <p className="text-xs opacity-60 mt-1 line-clamp-2">{promo.description}</p>
                    </div>
                    <button 
                      onClick={() => handleDeletePromotion(promo.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                      <Percent size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' INR'} OFF
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-40 uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                    {promo.isActive && (
                      <div className="ml-auto flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[#D4AF37]">
                        <CheckCircle2 size={10} /> Active Now
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminPromotions;
