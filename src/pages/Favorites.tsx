import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { ItemService } from '../services/storeService';
import { FashionItem } from '../types';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Heart } from 'lucide-react';

const Favorites = () => {
  const { profile, user } = useAuth();
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (profile?.favorites?.length) {
        const all = await ItemService.getAllItems();
        if (all) {
          setItems(all.filter(i => profile.favorites.includes(i.id)));
        }
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [profile]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-lg uppercase tracking-widest">Gathering your desires...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 lg:py-24 space-y-16"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif">Aspirational <span className="italic">Gallery</span></h1>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-50">Saved designs awaiting your move</p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <Link to={`/product/${item.id}`} className="block overflow-hidden bg-white aspect-[3/4.5] relative">
                <img 
                  src={item.renderedImageUrl || item.fabricImageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mx-auto"
                />
              </Link>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-start">
                  <Link to={`/product/${item.id}`} className="text-sm font-medium tracking-tight hover:underline">{item.name}</Link>
                  <span className="text-xs font-serif italic text-[#D4AF37]">₹{item.price.toLocaleString()}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest opacity-40">{item.category}</p>
                <Link 
                  to={`/product/${item.id}`} 
                  className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-bold pt-4 hover:text-[#D4AF37] transition-colors"
                >
                  Configure Measurement <ChevronRight size={10} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-[40vh] flex flex-col items-center justify-center space-y-8 text-center opacity-40">
           <Heart size={40} className="opacity-10" />
           <div className="space-y-2">
              <p className="font-serif italic text-2xl">Your gallery is currently empty.</p>
              <p className="text-[10px] uppercase tracking-widest">Find pieces that resonate with your soul</p>
           </div>
           <Link to="/collections" className="border border-black px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all">Explore Collections</Link>
        </div>
      )}
    </motion.div>
  );
};

export default Favorites;
