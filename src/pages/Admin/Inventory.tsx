import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { ItemService } from '../../services/storeService';
import { analyzeFabric, simulateVirtualTryOn } from '../../services/geminiService';
import { FashionItem } from '../../types';
import { Upload, Wand2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminInventory = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // New Item Form
  const [newItem, setNewItem] = useState<Omit<FashionItem, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Suit',
    fabricImageUrl: '',
    renderedImageUrl: '',
    stock: 1,
    isOneOfOne: false,
    styles: []
  });

  const [aiResult, setAiResult] = useState<any>(null);

  // Derive unique categories from existing items
  const existingCategories = Array.from(new Set([
    'Suit', 'Lehenga', 'Saree', 'Ghangra', 'Indo-Western',
    ...items.map(item => item.category)
  ]));

  React.useEffect(() => {
    const fetchItems = async () => {
      const data = await ItemService.getAllItems();
      if (data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, fabricImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async () => {
    if (!newItem.fabricImageUrl) return;
    setUploading(true);
    try {
      const base64Data = newItem.fabricImageUrl.split(',')[1];
      const result = await analyzeFabric(base64Data);
      setAiResult(result);
      setNewItem(prev => ({
        ...prev,
        description: result.description,
        styles: result.suggestedStyles
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleVirtualTryOn = async (style: string) => {
    if (!newItem.fabricImageUrl) return;
    setUploading(true);
    try {
      const base64Data = newItem.fabricImageUrl.split(',')[1];
      const result = await simulateVirtualTryOn(base64Data, style);
      // In this demo, we'll use a placeholder for the "rendered" image, 
      // but in real app we'd trigger an Imagen call.
      setNewItem(prev => ({
        ...prev,
        renderedImageUrl: "https://images.unsplash.com/photo-1594463750939-ebb6d2a40fb?auto=format&fit=crop&q=80&w=1200", // Sample mockup
        description: `${prev.description}\n\nAI Preview: ${result.detailedDescription}`
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const saveItem = async () => {
    setLoading(true);
    const id = await ItemService.addItem(newItem);
    if (id) {
       const updated = await ItemService.getAllItems();
       if (updated) setItems(updated);
       setNewItem({
         name: '', description: '', price: 0, category: 'Suit', fabricImageUrl: '', renderedImageUrl: '', stock: 1, isOneOfOne: false, styles: []
       });
       setAiResult(null);
    }
    setLoading(false);
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
          <h1 className="text-4xl font-serif">Inventory & <span className="italic">AI Studio</span></h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-2">Manage your boutique collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Add New Item */}
        <section className="space-y-8 bg-white/40 p-8 rounded-2xl backdrop-blur-sm shadow-xl border border-white/20">
          <h2 className="text-xl font-serif flex items-center gap-2">
            <Plus size={20} className="text-[#D4AF37]" />
            New Design Concept
          </h2>

          <div className="space-y-6">
             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Design Name</label>
                  <input 
                    type="text" 
                    value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="E.g. Emerald Silk Anarkali"
                    className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Price (INR)</label>
                    <input 
                      type="number" 
                      value={newItem.price}
                      onChange={e => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Stock Qty</label>
                    <input 
                      type="number" 
                      value={newItem.stock}
                      onChange={e => setNewItem(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Category</label>
                    <div className="flex gap-2">
                       <select 
                        value={newItem.category}
                        onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                        className="flex-1 bg-white px-4 py-3 text-sm border-b border-black/10 outline-none focus:border-[#D4AF37] transition-all"
                      >
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input 
                        type="text"
                        placeholder="Add New..."
                        onBlur={e => {
                          if (e.target.value) {
                            setNewItem(prev => ({ ...prev, category: e.target.value }));
                            e.target.value = '';
                          }
                        }}
                        className="w-24 bg-white px-2 py-3 text-[10px] border-b border-black/10 outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer py-3">
                       <input 
                        type="checkbox"
                        checked={newItem.isOneOfOne}
                        onChange={e => setNewItem(prev => ({ ...prev, isOneOfOne: e.target.checked }))}
                        className="w-4 h-4 accent-[#D4AF37]"
                       />
                       <span className="text-[10px] uppercase tracking-widest font-bold opacity-80 italic">1-of-1 Exclusive Piece</span>
                    </label>
                  </div>
                </div>
             </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-60 block">Fabric Material</label>
                <div className={cn(
                  "border-2 border-dashed border-black/10 rounded-xl p-8 text-center transition-all cursor-pointer hover:border-[#D4AF37]",
                  newItem.fabricImageUrl ? "bg-white" : "bg-white/20"
                )}>
                  {newItem.fabricImageUrl ? (
                    <div className="relative group">
                      <img src={newItem.fabricImageUrl} alt="Uploaded" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <button onClick={() => setNewItem(prev => ({ ...prev, fabricImageUrl: '' }))} className="text-white"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <Upload size={32} className="opacity-20" />
                      <div className="flex gap-4">
                        <label className="flex flex-col items-center cursor-pointer group">
                          <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                             <Plus size={20} />
                          </div>
                          <span className="text-[8px] uppercase tracking-widest mt-2 font-bold opacity-50">Gallery</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        
                        <label className="flex flex-col items-center cursor-pointer group">
                          <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                             <Upload size={20} className="rotate-0 group-hover:scale-110 transition-transform" />
                          </div>
                          <span className="text-[8px] uppercase tracking-widest mt-2 font-bold opacity-50">Camera</span>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <p className="text-[8px] opacity-40 uppercase tracking-[0.2em]">Select from gallery or capture from studio</p>
                    </div>
                  )}
                </div>
             </div>

             {newItem.fabricImageUrl && !aiResult && (
               <button 
                 onClick={runAiAnalysis}
                 disabled={uploading}
                 className="w-full bg-[#1a1a1a] text-white py-4 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest font-bold disabled:opacity-50"
               >
                 <Wand2 size={16} />
                 {uploading ? "Analyzing Fabric..." : "Run AI Design Analysis"}
               </button>
             )}

             {aiResult && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="space-y-6 pt-4 border-t border-black/5"
               >
                 <div className="space-y-2">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">AI Suggestions</h4>
                   <div className="flex flex-wrap gap-2">
                     {aiResult.suggestedStyles.map((style: string) => (
                       <button 
                         key={style}
                         onClick={() => handleVirtualTryOn(style)}
                         className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] uppercase font-bold tracking-widest border border-[#D4AF37]/20 rounded-full hover:bg-[#D4AF37] hover:text-white transition-colors"
                       >
                         Try as {style}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Description</label>
                    <textarea 
                      value={newItem.description}
                      onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white px-4 py-3 text-xs leading-relaxed border-b border-black/10 outline-none focus:border-[#D4AF37] min-h-[100px]"
                    />
                 </div>

                 {newItem.renderedImageUrl && (
                   <div className="space-y-2">
                     <h4 className="text-[10px] uppercase tracking-widest font-bold text-green-600 flex items-center gap-2">
                       <CheckCircle2 size={14} /> AI Preview Generated
                     </h4>
                     <img src={newItem.renderedImageUrl} className="rounded-xl shadow-lg border-2 border-green-600/20" alt="Rendering" />
                   </div>
                 )}

                 <button 
                    onClick={saveItem}
                    className="w-full bg-black text-white py-5 text-[10px] tracking-widest uppercase font-bold hover:bg-[#1a1a1a]"
                 >
                    Publish to Gallery
                 </button>
               </motion.div>
             )}
          </div>
        </section>

        {/* Right: Existing Inventory */}
        <section className="space-y-8">
          <h2 className="text-xl font-serif">Current Collection</h2>
          <div className="grid grid-cols-2 gap-4">
             {items.map(item => (
               <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-black/5 flex gap-4">
                  <img src={item.fabricImageUrl} className="w-20 h-24 object-cover rounded-lg" alt="" />
                   <div className="flex flex-col justify-between flex-1">
                      <div>
                         <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold leading-tight line-clamp-1">{item.name}</h4>
                            <button 
                              onClick={async () => {
                                if (confirm('Delete this design?')) {
                                  await ItemService.deleteItem(item.id);
                                  const updated = await ItemService.getAllItems();
                                  if (updated) setItems(updated);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                         </div>
                         <p className="text-[8px] uppercase tracking-widest opacity-50 mt-1">{item.category}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] px-1.5 py-0.5 bg-black/5 rounded text-black/60">Stock: {item.stock}</span>
                            {item.isOneOfOne && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-[#D4AF37]/10 rounded text-[#D4AF37] font-bold">1:1 EXCLUSIVE</span>
                            )}
                         </div>
                      </div>
                      <p className="text-xs font-serif text-[#D4AF37]">₹{item.price}</p>
                   </div>
               </div>
             ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdminInventory;
