import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_active: boolean;
  image_url?: string;
  code?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CatalogManager({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', code: '', is_active: true });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    async function init() {
      const { data: empData } = await supabase.from('empresas').select('id').eq('slug', empresaSlug).maybeSingle();
      if (empData) {
        setEmpresaId(empData.id);
        fetchData(empData.id);
      }
    }
    init();
  }, [empresaSlug]);

  const fetchData = async (id: string) => {
    const [cats, prods] = await Promise.all([
      supabase.from('categories').select('*').eq('empresa_id', id).order('name'),
      supabase.from('products').select('*').eq('empresa_id', id).order('name')
    ]);
    
    if (cats.data) setCategories(cats.data);
    if (prods.data) setProducts(prods.data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;

    const payload = {
      empresa_id: empresaId,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      code: formData.code || null,
      is_active: formData.is_active
    };

    let error;
    if (formData.id) {
      // UPDATE
      const res = await supabase.from('products').update(payload).eq('id', formData.id);
      error = res.error;
    } else {
      // INSERT
      const res = await supabase.from('products').insert(payload);
      error = res.error;
    }

    if (!error) {
      setIsModalOpen(false);
      setFormData({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', code: '', is_active: true });
      fetchData(empresaId);
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const handleEdit = (p: Product) => {
    setFormData({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price.toString(),
      category_id: p.category_id || '',
      image_url: p.image_url || '',
      code: p.code || '',
      is_active: p.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error && empresaId) {
      fetchData(empresaId);
    }
  };

  if (!empresaId) return <div className="p-8">Cargando gestor...</div>;

  // Filter and Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory ? p.category_id === filterCategory : true;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestión de Catálogo</h2>
          <p className="text-slate-500 mt-1">Administra tus productos y categorías.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', code: '', is_active: true });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </header>
      
      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary"
        />
        <select 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg text-slate-800 bg-white min-w-[200px]"
        >
          <option value="">Todas las Categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg text-slate-800 bg-white"
        >
          <option value="name_asc">Nombre (A-Z)</option>
          <option value="price_asc">Precio (Menor a Mayor)</option>
          <option value="price_desc">Precio (Mayor a Menor)</option>
        </select>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(product => {
              const cat = categories.find(c => c.id === product.category_id);
              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-slate-400 text-xs">Sin foto</div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">{product.name} {product.code && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">Cod: {product.code}</span>}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{product.description}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{cat ? cat.name : '-'}</td>
                  <td className="p-4 font-bold text-slate-800">${product.price.toLocaleString('es-AR')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {product.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-2">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No hay productos que coincidan con la búsqueda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-slate-800">{formData.id ? 'Editar Producto' : 'Agregar Producto'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código (Opcional)</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary" placeholder="Ej: 101, P01..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg h-20 resize-none text-slate-800 focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-primary">
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen</label>
                <input type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary text-sm" />
                {formData.image_url && <img src={formData.image_url} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-slate-200" />}
              </div>
              
              <div className="flex items-center gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary" />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Producto Activo (Visible en el catálogo)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-black rounded-lg font-bold transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
