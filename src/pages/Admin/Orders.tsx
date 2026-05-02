import React, { useEffect, useState } from 'react';
import { Clock, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService } from '../../services/storeService';
import type { Order, OrderStatus } from '../../types';
import AdminAccessNotice from '../../components/AdminAccessNotice';
import AdminShell from '../../components/AdminShell';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
};

const AdminOrders = () => {
  const { canAccessOrders, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await OrderService.getAllOrders();
      setOrders(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the order board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setSaving(true);
    setError('');
    try {
      const tracking = status === 'shipped' ? `ST-${Math.floor(Math.random() * 1000000)}` : undefined;
      await OrderService.updateOrderStatus(orderId, status, tracking);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the order.');
    } finally {
      setSaving(false);
    }
  };

  if (!canAccessOrders) return <AdminAccessNotice />;
  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic">Loading the fulfilment board...</div>;

  return (
    <AdminShell
      title={<><span>Order </span><span className="italic">Fulfillment</span></>}
      subtitle={`${role?.replace('_', ' ') ?? 'Operations'} lane · manage tailoring, shipping, and customer status updates`}
    >
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">{error}</div>}

      <div className="space-y-6">
        {orders.map((order) => (
          <section key={order.id} className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-sm uppercase tracking-[0.35em] font-bold">Order #{order.id.slice(-6)}</h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm opacity-60">Customer UID: {order.userId}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void updateStatus(order.id, 'processing')} disabled={saving} className="border border-black/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:border-black disabled:opacity-50">Mark Processing</button>
                <button type="button" onClick={() => void updateStatus(order.id, 'shipped')} disabled={saving} className="border border-black/10 px-4 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:border-black disabled:opacity-50">Ship Package</button>
                <button type="button" onClick={() => void updateStatus(order.id, 'delivered')} disabled={saving} className="bg-black text-white px-4 py-3 text-[10px] uppercase tracking-[0.3em] font-bold disabled:opacity-50">Confirm Delivery</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-black/5">
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-45">Items Summary</h3>
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="bg-[#f8f4ea] rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] font-bold">{item.type} material</p>
                      <p className="text-sm opacity-60 mt-2">Quantity: {item.quantity}</p>
                    </div>
                    {item.measurements && <span className="text-[10px] uppercase tracking-[0.25em] font-bold border border-black/10 px-3 py-2 bg-white">Custom Stitching</span>}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-45">Logistics Detail</h3>
                <div className="bg-white border border-black/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-60">Assembly valuation</span>
                    <span className="font-serif text-lg">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-violet-700 bg-violet-50 p-3 rounded-2xl">
                      <Truck size={14} />
                      Tracking ID: {order.trackingNumber}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] opacity-55">
                    <Clock size={14} />
                    Last update: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Recently'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {orders.length === 0 && <div className="py-24 text-center opacity-35 italic font-serif">The fulfilment board is clear right now.</div>}
      </div>
    </AdminShell>
  );
};

export default AdminOrders;
