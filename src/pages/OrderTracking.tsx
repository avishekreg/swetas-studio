import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { OrderService } from '../services/storeService';
import { Order } from '../types';
import { Clock, Truck, CheckCircle2, ChevronRight, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const data = await OrderService.getUserOrders(user.uid);
        if (data) setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic uppercase tracking-widest">Tracking your legacy...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-12 lg:py-24 space-y-16"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif">Purchase <span className="italic">History</span></h1>
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-50">Track your assemblies in real-time</p>
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => (
          <div key={order.id} className="bg-white border border-black/5 p-8 group hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest opacity-40 font-bold">Assembly Identifier</p>
                <h3 className="text-lg font-serif">Order #{order.id.slice(-6)}</h3>
                <p className="text-[10px] opacity-60 uppercase tracking-widest leading-none mt-2">Placed on {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">Status</p>
                    <p className="text-sm font-serif italic text-[#D4AF37] capitalize">{order.status}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] uppercase tracking-widest font-bold opacity-40">Valuation</p>
                    <p className="text-sm font-bold">₹{order.totalAmount.toLocaleString()}</p>
                 </div>
              </div>
            </div>

            <div className="mt-12 space-y-8">
               {/* Progress Bar */}
               <div className="relative flex justify-between">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/5 -translate-y-1/2 z-0" />
                  {[
                    { step: 'pending', icon: Clock },
                    { step: 'processing', icon: PackageCheck },
                    { step: 'shipped', icon: Truck },
                    { step: 'delivered', icon: CheckCircle2 }
                  ].map((s, idx) => {
                    const isActive = order.status === s.step || 
                      (order.status === 'processing' && idx < 1) ||
                      (order.status === 'shipped' && idx < 2) ||
                      (order.status === 'delivered');
                    
                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isActive ? "bg-black text-white" : "bg-[#f5f2ed] opacity-20"
                        )}>
                          <s.icon size={14} />
                        </div>
                        <span className={cn(
                          "text-[8px] uppercase tracking-widest font-bold",
                          isActive ? "opacity-100" : "opacity-0"
                        )}>{s.step}</span>
                      </div>
                    );
                  })}
               </div>

               {order.trackingNumber && (
                 <div className="bg-[#f5f2ed] p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Truck size={16} className="opacity-40" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Tracking ID: {order.trackingNumber}</span>
                   </div>
                   <button className="text-[10px] uppercase font-bold flex items-center gap-2 hover:underline">
                      Live Updates <ChevronRight size={12} />
                   </button>
                 </div>
               )}
            </div>
          </div>
        )) : (
          <div className="text-center py-24 space-y-8 bg-white/40 border border-dashed border-black/10">
            <p className="font-serif italic text-2xl opacity-40">No assemblies found in your legacy.</p>
            <Link to="/collections" className="inline-block border-b border-black text-[10px] uppercase tracking-widest pb-1 font-bold">Start Curating</Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderTracking;
