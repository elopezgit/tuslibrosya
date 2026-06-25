import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ExternalLink } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  comment: string;
  total: number;
  status: string;
  items: any[];
  created_at: string;
}

const COLUMNS = [
  { id: 'pendiente', title: 'Pendiente' },
  { id: 'en_preparacion', title: 'En Preparación' },
  { id: 'entregado', title: 'Entregado' },
  { id: 'cancelado', title: 'Cancelado' }
];

export default function KanbanBoard({ empresaSlug, role }: { empresaSlug: string, role?: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function init() {
      const { data: empData } = await supabase.from('empresas').select('id').eq('slug', empresaSlug).maybeSingle();
      if (empData) {
        setEmpresaId(empData.id);
        fetchOrders(empData.id);
      }
    }
    init();
  }, [empresaSlug]);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    if (!empresaId) return;
    
    const interval = setInterval(() => {
      fetchOrders(empresaId);
    }, 120000);

    return () => clearInterval(interval);
  }, [empresaId]);

  const fetchOrders = async (id: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('empresa_id', id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setSelectedOrder(null);
      } else {
        alert('Error al eliminar el pedido.');
      }
    }
  };

  const updateOrderData = async (orderId: string, updatedData: any) => {
    const { error } = await supabase.from('orders').update(updatedData).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedData } : o));
      setSelectedOrder(prev => prev ? { ...prev, ...updatedData } : null);
    } else {
      alert('Error al actualizar el pedido.');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !empresaId) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Optimistic UI Update
      setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: destination.droppableId } : o));

      // Update in Supabase
      await supabase
        .from('orders')
        .update({ status: destination.droppableId })
        .eq('id', draggableId);
    }
  };

  if (!empresaId) return <div className="p-8">Cargando tablero...</div>;

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Tablero de Pedidos</h2>
          <p className="text-slate-500 mt-1">Arrastra las tarjetas para cambiar su estado.</p>
        </div>
        <button onClick={() => fetchOrders(empresaId)} className="text-sm bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded font-medium transition-colors">
          🔄 Refrescar
        </button>
      </header>
      
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start min-w-max">
            {COLUMNS.map(col => {
              const columnOrders = orders.filter(o => o.status === col.id);
              return (
                <div key={col.id} className="w-80 bg-slate-200/50 rounded-xl p-4 flex flex-col max-h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">{col.title}</h3>
                    <span className="bg-slate-300 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{columnOrders.length}</span>
                  </div>
                  
                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto space-y-3 min-h-[150px]"
                      >
                        {columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:border-primary transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'border-slate-200'}`}
                                onClick={() => setSelectedOrder(order)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-mono text-slate-400">#{order.id.split('-')[0].toUpperCase()}</span>
                                  <span className="font-bold text-primary">${order.total}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">{order.customer_name}</h4>
                                <p className="text-sm text-slate-600">📞 {order.customer_phone}</p>
                                {order.delivery_address && (
                                  <p className="text-sm text-slate-600 mt-1">📍 {order.delivery_address}</p>
                                )}
                                
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Detalle:</p>
                                  <ul className="text-sm text-slate-700 space-y-1">
                                    {order.items.map((item: any, i: number) => (
                                      <li key={i}>• {item.quantity}x {item.name}</li>
                                    ))}
                                  </ul>
                                </div>

                                {order.comment && (
                                  <div className="mt-3 bg-yellow-50 text-yellow-800 p-2 rounded text-sm border border-yellow-200">
                                    <span className="font-bold block text-xs mb-1">Comentario:</span>
                                    {order.comment}
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                  <a 
                                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=Hola%20${order.customer_name},%20te%20escribimos%20por%20tu%20pedido%20(Orden%20%23${order.id.split('-')[0].toUpperCase()})`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md font-medium transition-colors"
                                  >
                                    Contactar WhatsApp
                                  </a>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onDelete={role === 'admin' ? () => deleteOrder(selectedOrder.id) : undefined}
          onUpdate={role === 'admin' ? (updatedData) => updateOrderData(selectedOrder.id, updatedData) : undefined}
        />
      )}
    </div>
  );
}
