import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService } from '../../services/storeService';
import { Order, OrderStatus } from '../../types';
import { Package, Truck, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await OrderService.getAllOrders();
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    let tracking = "";
    if (status === 'shipped') {
      tracking = `ST-${Math.floor(Math.random() * 1000000)}`;
    }
    await OrderService.updateOrderStatus(orderId, status, tracking);
    const data = await OrderService.getAllOrders();
    if (data) setOrders(data);
  };

  if (!isAdmin) return <div className="p-24 text-center">Unauthorized</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 space-y-12"
    >
      <div className="border-b border-black/10 pb-8">
        <h1 className="text-4xl font-serif">Order <span className="italic">Fulfillment</span></h1>
        <p className="text-[10px] uppercase tracking-widest opacity-50 mt-2">Manage customer assemblies and shipments</p>
      </div>

      <div className="space-y-6">
        {orders.length > 0 ? orders.map((order) => (
          <div key={order.id} className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                   <h3 className="text-sm font-bold uppercase tracking-widest">Order #{order.id.slice(-6)}</h3>
                   <span className={cn(
                     "px-3 py-0.5 text-[8px] uppercase tracking-widest font-bold rounded-full",
                     order.status === 'pending' ? "bg-orange-100 text-orange-600" :
                     order.status === 'processing' ? "bg-blue-100 text-blue-600" :
                     order.status === 'shipped' ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"
                   )}>
                     {order.status}
                   </span>
                </div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest leading-none">Placed by {order.userId}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={() => updateStatus(order.id, 'processing')}
                  className="px-4 py-2 border border-black/10 text-[8px] uppercase font-bold tracking-widest hover:border-black transition-all"
                 >
                   Mark Processing
                 </button>
                 <button 
                  onClick={() => updateStatus(order.id, 'shipped')}
                  className="px-4 py-2 border border-black/10 text-[8px] uppercase font-bold tracking-widest hover:border-black transition-all"
                 >
                   Ship Package
                 </button>
                 <button 
                  onClick={() => updateStatus(order.id, 'delivered')}
                  className="px-4 py-2 bg-black text-white text-[8px] uppercase font-bold tracking-widest hover:bg-[#1a1a1a] transition-all"
                 >
                   Confirm Delivery
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-black/5">
               <div className="space-y-4">
                  <h4 className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-40">Items Summary</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#f5f2ed]/40 p-4 rounded-lg">
                        <div>
                          <p className="text-xs font-bold uppercase">{item.type} Material</p>
                          <p className="text-[8px] opacity-50 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                        </div>
                        {item.measurements && (
                           <div className="text-[8px] bg-white px-2 py-1 rounded border border-black/5">
                              Custom Stitching Requested
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-40">Logistics Detail</h4>
                  <div className="bg-white p-6 border border-black/5 rounded-xl space-y-4">
                     <div className="flex items-center justify-between text-xs font-serif italic">
                        <span>Assembly Valuation</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                     </div>
                     {order.trackingNumber && (
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold bg-purple-50 text-purple-600 p-3 rounded-lg">
                           <Truck size={14} />
                           <span>Tracking ID: {order.trackingNumber}</span>
                        </div>
                     )}
                     <div className="flex items-center gap-3 text-[10px] uppercase font-bold opacity-40 p-3">
                        <Clock size={14} />
                        <span>Last Update: {new Date(order.createdAt?.seconds * 1000).toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )) : (
          <div className="py-24 text-center opacity-30 italic font-serif">The studio registry is currently clear.</div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminOrders;
