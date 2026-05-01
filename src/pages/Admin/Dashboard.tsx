import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService, ItemService } from '../../services/storeService';
import { Order, FashionItem } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingCart, Package, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminAccessNotice from '../../components/AdminAccessNotice';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const o = await OrderService.getAllOrders();
      const i = await ItemService.getAllItems();
      if (o) setOrders(o);
      if (i) setItems(i);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (!isAdmin) return <AdminAccessNotice />;
  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic">Analyzing Business Data...</div>;

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalSales = orders.length;
  const totalProducts = items.length;

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-[10px] uppercase font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{title}</p>
        <h3 className="text-3xl font-serif mt-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 space-y-12"
    >
      <div className="flex justify-between items-end border-b border-black/10 pb-8">
        <div>
          <h1 className="text-4xl font-serif">Executive <span className="italic">Overview</span></h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 space-x-4 mt-2">
            <span>Sweta's Studio</span>
            <span className="opacity-20">|</span>
            <span>May 2026 Analytics</span>
          </p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={async () => {
              const seedData = [
                {
                  name: "Emerald Silk Anarkali",
                  description: "A luxurious deep green silk anarkali with intricate gold zardosi work and hand-carved buttons.",
                  price: 18500,
                  category: "Suit",
                  fabricImageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=1200",
                  renderedImageUrl: "https://images.unsplash.com/photo-1594463750939-ebb6d2a40fb?auto=format&fit=crop&q=80&w=1200",
                  stock: 5,
                  styles: ["Anarkali", "Long Suit"]
                },
                {
                  name: "Midnight Velvet Lehenga",
                  description: "Rich velvet lehenga in royal blue featuring hand-embroidered floral motifs and a sheer organza dupatta.",
                  price: 45000,
                  category: "Lehenga",
                  fabricImageUrl: "https://images.unsplash.com/photo-1589243023531-1e969d7a224f?auto=format&fit=crop&q=80&w=1200",
                  renderedImageUrl: "https://images.unsplash.com/photo-1585487000160-0672e811c009?auto=format&fit=crop&q=80&w=1200",
                  stock: 3,
                  styles: ["Heavy Lehenga"]
                },
                {
                  name: "Teal Banarasi Saree",
                  description: "Traditional hand-woven Banarasi silk in teal with antique gold borders. A timeless masterpiece.",
                  price: 22000,
                  category: "Saree",
                  fabricImageUrl: "https://images.unsplash.com/photo-1610030469915-9a88e4708761?auto=format&fit=crop&q=80&w=1200",
                  renderedImageUrl: "https://images.unsplash.com/photo-1610030469915-9a88e4708761?auto=format&fit=crop&q=80&w=1200",
                  stock: 2,
                  styles: ["Traditional", "Banarasi"]
                },
                {
                  name: "Indo-Western Fusion Gown",
                  description: "A modern silhouette meets traditional Chikankari. Soft ivory georgette with delicate thread work.",
                  price: 15500,
                  category: "Indo-Western",
                  fabricImageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200",
                  renderedImageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200",
                  stock: 4,
                  styles: ["Fusion", "Gown"]
                }
              ];
              try {
                for (const item of seedData) {
                  await ItemService.addItem(item as any);
                }
                alert("Studio seeded successfully with luxury collection.");
                window.location.reload();
              } catch (err) {
                console.error(err);
                alert("Error seeding data. Please check console for details.");
              }
            }}
            className="text-[8px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-opacity"
          >
            Seed Sample Designs
          </button>
          <Link to="/admin/inventory" className="text-[10px] uppercase tracking-widest font-bold border border-black px-6 py-3 hover:bg-black hover:text-white transition-all">Manage Inventory</Link>
          <Link to="/admin/promotions" className="text-[10px] uppercase tracking-widest font-bold border border-[#D4AF37] text-[#D4AF37] px-6 py-3 hover:bg-[#D4AF37] hover:text-white transition-all">Sales & Offers</Link>
          <Link to="/admin/orders" className="text-[10px] uppercase tracking-widest font-bold bg-black text-white px-6 py-3">Process Orders</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} trend={12.5} color="bg-black" />
        <StatCard title="Total Orders" value={totalSales} icon={ShoppingCart} trend={5.2} color="bg-[#D4AF37]" />
        <StatCard title="Active Designs" value={totalProducts} icon={Package} trend={-2.1} color="bg-[#5A5A40]" />
        <StatCard title="Growth Rate" value="18.4%" icon={TrendingUp} trend={8.1} color="bg-[#D4AF37]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-8">
           <h3 className="text-sm uppercase tracking-widest font-bold opacity-60">Sales Performance</h3>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="sales" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-8">
           <h3 className="text-sm uppercase tracking-widest font-bold opacity-60">Recent Orders</h3>
           <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f5f2ed] rounded-full flex items-center justify-center font-bold text-xs">
                        {order.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold">Order #{order.id.slice(-6)}</p>
                        <p className="text-[8px] opacity-50 uppercase tracking-widest">{order.items.length} Items</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold font-serif">₹{order.totalAmount}</p>
                      <p className={`text-[8px] uppercase tracking-widest font-bold ${order.status === 'pending' ? 'text-orange-500' : 'text-green-500'}`}>{order.status}</p>
                   </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-12 opacity-30 text-xs italic">No orders yet.</p>}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
