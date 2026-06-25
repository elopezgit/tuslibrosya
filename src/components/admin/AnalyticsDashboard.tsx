import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Users, Calendar, Activity, Receipt, LayoutList, Trophy, ArrowDownToLine } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface ClientStats {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
}

export default function AnalyticsDashboard({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prevOrders, setPrevOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState<'shift' | 'week' | 'month' | 'all' | 'custom'>('shift');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from('empresas').select('id').eq('slug', empresaSlug).maybeSingle();
      if (data) {
        setEmpresaId(data.id);
        fetchData(data.id, timeFilter);
      }
    }
    init();
  }, [empresaSlug]);

  useEffect(() => {
    if (empresaId) {
      if (timeFilter === 'custom' && (!customStartDate || !customEndDate)) return;
      fetchData(empresaId, timeFilter);
    }
  }, [timeFilter, customStartDate, customEndDate]);

  const fetchData = async (eid: string, filter: string) => {
    setIsLoading(true);
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    let hasPrevPeriod = filter !== 'all';

    if (filter === 'shift') {
      if (now.getHours() < 6) startDate.setDate(now.getDate() - 1);
      startDate.setHours(6, 0, 0, 0);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
    } else if (filter === 'week') {
      startDate.setDate(now.getDate() - 7);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
    } else if (filter === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    } else if (filter === 'custom') {
      startDate = new Date(customStartDate + 'T00:00:00');
      let endDate = new Date(customEndDate + 'T23:59:59');
      
      let query = supabase.from('orders').select('*').eq('empresa_id', eid).order('created_at', { ascending: false });
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      
      const { data: currentData } = await query;
      if (currentData) setOrders(currentData);
      
      setPrevOrders([]);
      setIsLoading(false);
      return;
    }

    // Fetch Current Period
    let query = supabase.from('orders').select('*').eq('empresa_id', eid).order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.gte('created_at', startDate.toISOString());
    }
    const { data: currentData } = await query;
    if (currentData) setOrders(currentData);

    // Fetch Previous Period
    if (hasPrevPeriod) {
      const { data: previousData } = await supabase.from('orders')
        .select('*')
        .eq('empresa_id', eid)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', prevEndDate.toISOString());
      if (previousData) setPrevOrders(previousData);
    } else {
      setPrevOrders([]);
    }

    setIsLoading(false);
  };

  // KPIs Current
  const validOrders = orders.filter(o => o.status !== 'cancelado');
  const totalRevenue = orders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'entregado').length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const prepOrders = orders.filter(o => o.status === 'en_preparacion').length;
  const avgTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // KPIs Previous
  const prevRevenue = prevOrders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.total, 0);
  const prevCompletedOrders = prevOrders.filter(o => o.status === 'entregado').length;
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revenueGrowth = calculateGrowth(totalRevenue, prevRevenue);
  const ordersGrowth = calculateGrowth(completedOrders, prevCompletedOrders);

  // Growth Badge Component
  const GrowthBadge = ({ value }: { value: number }) => {
    if (timeFilter === 'all') return null;
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mt-2 w-max ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{value}% vs Anterior
      </div>
    );
  };

  // Top Clients
  const clientsMap: Record<string, ClientStats> = {};
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

  validOrders.forEach(o => {
    // Clients
    if (!clientsMap[o.customer_phone]) {
      clientsMap[o.customer_phone] = { phone: o.customer_phone, name: o.customer_name, orderCount: 0, totalSpent: 0 };
    }
    clientsMap[o.customer_phone].orderCount += 1;
    clientsMap[o.customer_phone].totalSpent += o.total;
    clientsMap[o.customer_phone].name = o.customer_name;

    // Products
    o.items.forEach(item => {
      if (!productStats[item.name]) {
        productStats[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productStats[item.name].quantity += item.quantity;
      productStats[item.name].revenue += (item.quantity * item.price);
    });
  });

  const topClients = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  
  const allProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
  const topProducts = allProducts.slice(0, 5);
  // Least products (filter out things with 0 maybe? they are all > 0 if they are in orders)
  const bottomProducts = [...allProducts].reverse().slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente': return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md border border-red-200">Pendiente</span>;
      case 'en_preparacion': return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-200">En Cocina</span>;
      case 'entregado': return <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-md border border-slate-300">Entregado</span>;
      case 'cancelado': return <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-md border border-slate-700">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analíticas Avanzadas</h2>
          <p className="text-slate-500 mt-1">Métricas, comparativas y movimientos de {empresaSlug.toUpperCase()}</p>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <Calendar size={18} className="text-slate-400 ml-3" />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="p-2 bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="shift">Turno Actual (vs Ayer)</option>
              <option value="week">Últimos 7 días (vs Semana Anterior)</option>
              <option value="month">Este Mes (vs Mes Anterior)</option>
              <option value="all">Histórico Completo</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>
          
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-sm">
              <input 
                type="date" 
                value={customStartDate} 
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium outline-none"
              />
              <span className="text-slate-400">hasta</span>
              <input 
                type="date" 
                value={customEndDate} 
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium outline-none"
              />
            </div>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ingresos Brutos</p>
              <h3 className="text-2xl font-black text-slate-800">${totalRevenue.toLocaleString('es-AR')}</h3>
            </div>
          </div>
          <GrowthBadge value={revenueGrowth} />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ticket Promedio</p>
              <h3 className="text-2xl font-black text-slate-800">${Math.round(avgTicket).toLocaleString('es-AR')}</h3>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Gasto promedio por cliente</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Pendientes</p>
              <h3 className="text-2xl font-black text-slate-800">{pendingOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">En Preparación</p>
              <h3 className="text-2xl font-black text-slate-800">{prepOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Finalizados</p>
              <h3 className="text-2xl font-black text-slate-800">{completedOrders}</h3>
            </div>
          </div>
          <GrowthBadge value={ordersGrowth} />
        </div>
      </div>

      {/* Rankings Grid (Clients, Top Products, Bottom Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-primary" /> Mejores Clientes
            </h3>
          </div>
          {topClients.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {topClients.map((client, idx) => (
                    <tr key={client.phone} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{idx+1}.</span>
                          <span className="truncate max-w-[100px]">{client.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-green-600 text-xs">${client.totalSpent.toLocaleString('es-AR')}</p>
                        <p className="text-[10px] text-slate-400">{client.orderCount} pedidos</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" /> Más Vendidos
            </h3>
          </div>
          {topProducts.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{idx+1}.</span>
                          <span className="truncate max-w-[120px]">{prod.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-slate-800 text-xs">{prod.quantity} un.</p>
                        <p className="text-[10px] text-green-600 font-bold">${prod.revenue.toLocaleString('es-AR')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>

        {/* Least Sold Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ArrowDownToLine size={16} className="text-red-500" /> Menos Vendidos
            </h3>
          </div>
          {bottomProducts.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {bottomProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono w-4">{allProducts.length - idx}.</span>
                          <span className="truncate max-w-[120px]">{prod.name}</span>
                        </p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-black text-slate-800 text-xs">{prod.quantity} un.</p>
                        <p className="text-[10px] text-slate-400">${prod.revenue.toLocaleString('es-AR')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs flex-1 flex items-center justify-center">Sin datos.</div>
          )}
        </div>
      </div>

      {/* DETAILED MOVEMENTS GRID */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <LayoutList size={20} className="text-primary" /> Grilla Detallada de Movimientos
          </h3>
          <span className="bg-primary/20 text-primary-hover font-bold px-3 py-1 rounded-full text-xs border border-primary/30">
            {orders.length} pedidos encontrados
          </span>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando movimientos...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold w-32">Fecha y Hora</th>
                  <th className="p-4 font-bold w-48">Cliente</th>
                  <th className="p-4 font-bold min-w-[300px]">Detalle de Artículos</th>
                  <th className="p-4 font-bold w-32 text-center">Estado</th>
                  <th className="p-4 font-bold w-32 text-right">Monto Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {new Date(order.created_at).toLocaleDateString('es-AR')} <br/>
                      <span className="font-bold text-slate-700">{new Date(order.created_at).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.customer_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.customer_phone}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto hide-scrollbar">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-600">
                            <span className="font-bold text-slate-800">{item.quantity}x</span>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right font-black text-slate-800">
                      ${order.total.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="font-bold">No hay movimientos en este periodo.</p>
          </div>
        )}
      </div>

    </div>
  );
}
