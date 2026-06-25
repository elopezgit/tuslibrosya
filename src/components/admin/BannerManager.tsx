import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Plus, Edit2 } from 'lucide-react';

interface Banner {
  id: string;
  image_url: string;
  link?: string;
  is_active: boolean;
  sort_order?: number;
}

export default function BannerManager({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [formData, setFormData] = useState({ image_url: '', link: '', sort_order: 0 });

  useEffect(() => {
    async function init() {
      const { data: empData } = await supabase.from('empresas').select('id').eq('slug', empresaSlug).maybeSingle();
      if (empData) {
        setEmpresaId(empData.id);
        fetchBanners(empData.id);
      }
    }
    init();
  }, [empresaSlug]);

  const fetchBanners = async (id: string) => {
    // Intentar ordenar por sort_order, y si falla (columna inexistente), caer en created_at
    const { data, error } = await supabase.from('banners').select('*').eq('empresa_id', id).order('sort_order', { ascending: true, nullsFirst: false });
    
    if (error && error.message.includes('sort_order')) {
      const fallback = await supabase.from('banners').select('*').eq('empresa_id', id).order('created_at');
      if (fallback.data) setBanners(fallback.data);
    } else if (data) {
      setBanners(data);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;

    let error;
    const payload = {
        image_url: formData.image_url,
        link: formData.link || null,
        sort_order: formData.sort_order
    };

    if (editingBanner) {
      const { error: updateError } = await supabase.from('banners').update(payload).eq('id', editingBanner);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('banners').insert({
        empresa_id: empresaId,
        is_active: true,
        ...payload
      });
      error = insertError;
    }

    if (!error) {
      setIsModalOpen(false);
      setEditingBanner(null);
      setFormData({ image_url: '', link: '', sort_order: 0 });
      fetchBanners(empresaId);
    } else {
      if (error.message.includes('sort_order')) {
         alert("Error: Tu base de datos no tiene la columna 'sort_order' en la tabla 'banners'. Por favor créala en Supabase (tipo int4) u omite usarla por ahora.");
      } else {
         alert("Error al guardar: " + error.message);
      }
    }
  };

  const openNewModal = () => {
    setEditingBanner(null);
    setFormData({ image_url: '', link: '', sort_order: banners.length });
    setIsModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner.id);
    setFormData({ image_url: banner.image_url, link: banner.link || '', sort_order: banner.sort_order || 0 });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error && empresaId) fetchBanners(empresaId);
  };

  if (!empresaId) return <div className="p-8">Cargando gestor de banners...</div>;

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Banners</h2>
          <p className="text-slate-500 mt-1">Administra los banners promocionales de tu catálogo.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Banner
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => {
          const isFixed = banner.image_url.includes('bannertupedido.png');
          return (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 relative">
                <img src={banner.image_url} alt="Banner" className={`w-full h-full ${isFixed ? 'object-contain bg-black' : 'object-cover'}`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=Error+de+Imagen'; }} />
              </div>
              <div className="p-4 flex justify-between items-center bg-slate-50 border-t border-slate-100">
                <div className="text-sm text-slate-500 truncate mr-4">
                  {banner.link ? `Link: ${banner.link}` : 'Sin enlace'}
                </div>
                {!isFixed && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(banner)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                {isFixed && (
                  <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">Fijo</span>
                )}
              </div>
            </div>
          );
        })}
        {banners.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            No tienes banners configurados. Añade uno nuevo para destacarlo en tu catálogo.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingBanner ? 'Editar Banner' : 'Agregar Banner'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de la Imagen</label>
                <input required type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-primary" />
                <p className="text-xs text-slate-500 mt-1">Debe ser un link directo a una imagen (jpg, png, webp).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Destino (Opcional)</label>
                <input type="url" placeholder="https://..." value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-primary" />
                <p className="text-xs text-slate-500 mt-1">A dónde irá el cliente si hace clic en el banner.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Orden de Aparición</label>
                <input type="number" min="0" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-primary" />
                <p className="text-xs text-slate-500 mt-1">Un número menor (0, 1, 2) aparece primero en el carrusel.</p>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors">Guardar Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
