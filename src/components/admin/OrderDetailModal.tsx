import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, MapPin, Phone, User, MessageSquare, Utensils, CheckCircle, X, Printer, Edit, Trash2, Save, Plus, Minus } from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
  onDelete?: () => void;
  onUpdate?: (updatedData: any) => void;
}

export default function OrderDetailModal({ order, onClose, onStatusChange, onDelete, onUpdate }: OrderDetailModalProps) {
  if (!order) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address,
    comment: order.comment
  });
  const [editedItems, setEditedItems] = useState(order.items || []);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isEditing && products.length === 0 && order.empresa_id) {
      supabase.from('products').select('*').eq('empresa_id', order.empresa_id).eq('is_active', true)
        .then(({ data }) => {
          if (data) setProducts(data);
        });
    }
  }, [isEditing, order.empresa_id, products.length]);

  const isPOS = order.customer_name === 'Pedido en Caja';

  const handleUpdateItemQty = (index: number, delta: number) => {
    const newItems = [...editedItems];
    newItems[index].quantity += delta;
    if (newItems[index].quantity <= 0) {
      newItems.splice(index, 1);
    }
    setEditedItems(newItems);
  };

  const handleUpdateItemNote = (index: number, note: string) => {
    const newItems = [...editedItems];
    newItems[index].notes = note;
    setEditedItems(newItems);
  };

  const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setEditedItems([...editedItems, { ...prod, quantity: 1, notes: '' }]);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    if (onUpdate) {
      const newTotal = editedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      onUpdate({ ...editedData, items: editedItems, total: newTotal });
      setIsEditing(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
      onStatusChange(order.id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      const itemsHtml = order.items.map((item: any) => `
        <div style="margin-bottom: 8px;">
          <div style="font-size: 16px; font-weight: bold;">${item.quantity}x ${item.name}</div>
          ${item.notes ? `<div style="margin-left: 15px; font-size: 14px; font-weight: bold;">* ${item.notes}</div>` : ''}
        </div>
      `).join('');

      const generalNoteHtml = order.comment ? `
        <div style="border-top: 1px dashed black; margin: 10px 0;"></div>
        <div style="font-weight: bold;">NOTAS GENERALES:</div>
        <div style="font-weight: bold; font-size: 14px;">${order.comment}</div>
      ` : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda #${order.id.slice(0,4).toUpperCase()}</title>
            <style>
              body { 
                font-family: monospace; 
                padding: 10px; 
                margin: 0; 
                width: 80mm; 
                color: black; 
              }
            </style>
          </head>
          <body>
            <h2 style="text-align: center; margin: 0 0 10px 0; font-size: 24px;">COMANDA</h2>
            <div style="font-size: 18px; font-weight: bold; text-align: center; border: 2px solid black; padding: 5px; margin-bottom: 10px;">
              #${order.id.slice(0, 4).toUpperCase()}
            </div>
            <div style="font-size: 14px; margin-bottom: 5px;"><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-AR')}</div>
            <div style="font-size: 14px; margin-bottom: 5px;"><strong>Cliente:</strong> ${order.customer_name}</div>
            <div style="font-size: 14px; margin-bottom: 10px;"><strong>Tipo:</strong> ${isPOS ? 'Pedido en Local' : (order.delivery_address ? 'Delivery' : 'Retira por local')}</div>
            
            <div style="border-top: 1px dashed black; margin: 10px 0;"></div>
            
            ${itemsHtml}
            ${generalNoteHtml}
            
            <div style="border-top: 1px dashed black; margin: 15px 0;"></div>
            <div style="text-align: center; font-size: 12px; margin-top: 20px;">
              - FIN DE COMANDA -
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
              <span className="bg-primary text-black px-3 py-1 rounded-lg text-lg">
                #{order.id.slice(0, 4).toUpperCase()}
              </span>
              {isPOS ? 'Pedido de Caja (Local)' : 'Pedido Delivery/Retiro'}
            </h2>
            <p className="text-slate-400 font-bold flex items-center gap-2">
              <Clock size={16} /> 
              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing && onUpdate && (
              <button onClick={() => setIsEditing(true)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 hover:text-primary transition-colors text-slate-300" title="Editar Pedido">
                <Edit size={24} />
              </button>
            )}
            {!isEditing && onDelete && (
              <button onClick={onDelete} className="bg-slate-800 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-slate-300" title="Eliminar Pedido">
                <Trash2 size={24} />
              </button>
            )}
            <button onClick={handlePrint} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 hover:text-primary transition-colors text-slate-300" title="Imprimir Comanda">
              <Printer size={24} />
            </button>
            <button onClick={onClose} className="bg-slate-800 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-slate-300" title="Cerrar">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {/* Customer Info (only if not POS) */}
          {!isPOS && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cliente</span>
                {isEditing ? (
                  <input type="text" value={editedData.customer_name} onChange={e => setEditedData({...editedData, customer_name: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><User size={16} className="text-slate-400" /> {order.customer_name}</div>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</span>
                {isEditing ? (
                  <input type="text" value={editedData.customer_phone} onChange={e => setEditedData({...editedData, customer_phone: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {order.customer_phone}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Dirección</span>
                {isEditing ? (
                  <input type="text" value={editedData.delivery_address || ''} onChange={e => setEditedData({...editedData, delivery_address: e.target.value})} className="w-full border border-slate-300 rounded p-1 outline-none focus:border-primary" />
                ) : (
                  <div className="font-bold text-slate-800 flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {order.delivery_address || 'Retira por el local'}</div>
                )}
              </div>
            </div>
          )}

          {/* General Comments */}
          {(order.comment || isEditing) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
              <h3 className="font-black text-yellow-800 mb-2 flex items-center gap-2"><MessageSquare size={18} /> Aclaraciones Generales</h3>
              {isEditing ? (
                <textarea value={editedData.comment || ''} onChange={e => setEditedData({...editedData, comment: e.target.value})} className="w-full border border-yellow-300 bg-white rounded p-2 text-yellow-900 outline-none focus:border-yellow-500" rows={2} />
              ) : (
                <p className="text-yellow-900 font-bold text-lg leading-relaxed">{order.comment}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils size={18} className="text-slate-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-wide">Productos a Preparar</h3>
              </div>
              {isEditing && products.length > 0 && (
                <select onChange={handleAddItem} className="border border-slate-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-primary font-bold text-slate-700">
                  <option value="">+ Añadir producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              )}
            </div>
            <ul className="divide-y divide-slate-100">
              {(isEditing ? editedItems : order.items).map((item: any, idx: number) => (
                <li key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner">
                        <button onClick={() => handleUpdateItemQty(idx, 1)} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Plus size={16} /></button>
                        <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleUpdateItemQty(idx, -1)} className="p-1 hover:bg-slate-200 rounded text-slate-600"><Minus size={16} /></button>
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                        {item.quantity}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-black text-slate-800 mb-1 leading-none">{item.name}</h4>
                        {isEditing && (
                           <button onClick={() => {
                             const newItems = [...editedItems];
                             newItems.splice(idx, 1);
                             setEditedItems(newItems);
                           }} className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded">
                             <Trash2 size={18} />
                           </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={item.notes || ''} 
                          onChange={(e) => handleUpdateItemNote(idx, e.target.value)} 
                          placeholder="Nota para cocina (opcional)" 
                          className="w-full mt-2 border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-red-400"
                        />
                      ) : (
                        item.notes && (
                          <div className="inline-block mt-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm">
                            <span className="font-bold text-xs uppercase tracking-wider text-red-500 block mb-0.5">Nota para cocina:</span>
                            <span className="font-black text-lg leading-tight block">{item.notes}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {isEditing && editedItems.length === 0 && (
                <li className="p-4 text-center text-slate-500 font-bold">No hay productos en el pedido.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200">
          {isEditing ? (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-4 rounded-xl text-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2"><Save size={24} /> Guardar Cambios</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {order.status === 'pendiente' && (
                <button 
                  onClick={() => handleUpdateStatus('en_preparacion')}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black py-4 rounded-xl text-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Comenzar a Preparar
                </button>
              )}
              
              {order.status === 'en_preparacion' && (
                <button 
                  onClick={() => handleUpdateStatus('entregado')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl text-lg shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} /> Marcar como Listo
                </button>
              )}

              {order.status === 'entregado' && (
                <div className="flex-1 text-center font-black text-green-600 bg-green-50 py-4 rounded-xl border border-green-200">
                  ¡Pedido Terminado y Entregado!
                </div>
              )}

              {order.status === 'cancelado' && (
                <div className="flex-1 text-center font-black text-red-600 bg-red-50 py-4 rounded-xl border border-red-200">
                  Pedido Cancelado
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
