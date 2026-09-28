import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, RefreshCw, BookOpen, Search, DollarSign, Tag, CheckCircle, EyeOff, Loader2 } from 'lucide-react';

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
  icon?: string;
}

export default function CatalogManager({ empresaSlug }: { empresaSlug: string }) {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    code: '',
    is_active: true
  });

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    init();
  }, [empresaSlug]);

  async function init() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Búsqueda resiliente de la empresa por slug exacto o ilike
      let { data: empData, error } = await supabase
        .from('empresas')
        .select('id, name, slug')
        .or(`slug.eq.${empresaSlug},slug.ilike.${empresaSlug}`)
        .maybeSingle();

      if (!empData) {
        // Segundo intento: buscar por nombre si el slug contiene 'libro'
        const { data: fallbackEmp } = await supabase
          .from('empresas')
          .select('id, name, slug')
          .ilike('name', '%libro%')
          .maybeSingle();
        empData = fallbackEmp;
      }

      if (error || !empData) {
        throw new Error(`No se encontró la empresa asociada al slug "${empresaSlug}".`);
      }

      setEmpresaId(empData.id);
      await fetchData(empData.id);
    } catch (err: any) {
      console.error("Error cargando gestor de catálogo:", err);
      setErrorMsg(err.message || 'Error al conectar con la base de datos.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchData = async (id: string) => {
    const [catsRes, prodsRes] = await Promise.all([
      supabase.from('categories').select('*').eq('empresa_id', id).order('name'),
      supabase.from('products').select('*').eq('empresa_id', id).order('name').range(0, 999)
    ]);
    
    if (catsRes.data) setCategories(catsRes.data);
    if (prodsRes.data) setProducts(prodsRes.data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;

    setIsSaving(true);
    const parsedPrice = parseFloat(formData.price) || 0;

    const payload = {
      empresa_id: empresaId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parsedPrice,
      category_id: formData.category_id || null,
      image_url: formData.image_url?.trim() || null,
      code: formData.code?.trim() || null,
      is_active: formData.is_active
    };

    try {
      let error;
      if (formData.id) {
        // UPDATE
        const res = await supabase.from('products').update(payload).eq('id', formData.id).eq('empresa_id', empresaId);
        error = res.error;
      } else {
        // INSERT
        const res = await supabase.from('products').insert(payload);
        error = res.error;
      }

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', code: '', is_active: true });
      await fetchData(empresaId);
    } catch (err: any) {
      alert("Error al guardar producto: " + err.message);
    } finally {
      setIsSaving(false);
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el libro "${name}" del catálogo?`)) return;
    if (!empresaId) return;

    const { error } = await supabase.from('products').delete().eq('id', id).eq('empresa_id', empresaId);
    if (!error) {
      await fetchData(empresaId);
    } else {
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleToggleActive = async (p: Product) => {
    if (!empresaId) return;
    const { error } = await supabase
      .from('products')
      .update({ is_active: !p.is_active })
      .eq('id', p.id)
      .eq('empresa_id', empresaId);

    if (!error) {
      setProducts(products.map(prod => prod.id === p.id ? { ...prod, is_active: !prod.is_active } : prod));
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="text-amber-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Cargando catálogo de libros...</h3>
        <p className="text-slate-500 text-sm mt-1">Conectando con la base de datos de Tus Libros Ya</p>
      </div>
    );
  }

  // Error State
  if (errorMsg || !empresaId) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white rounded-2xl shadow-sm border border-red-200">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">⚠️</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No se pudo cargar el gestor</h3>
        <p className="text-slate-600 text-sm mb-6">{errorMsg || 'La empresa no fue encontrada.'}</p>
        <button 
          onClick={init} 
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 mx-auto transition-colors shadow-sm"
        >
          <RefreshCw size={18} /> Reintentar
        </button>
      </div>
    );
  }

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

  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header & KPI Metrics */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-1">
            <BookOpen size={18} /> Tus Libros Ya
          </div>
          <h2 className="text-3xl font-black text-slate-900">Gestión de Catálogo de Libros</h2>
          <p className="text-slate-500 text-sm mt-0.5">Control de inventario, precios, portadas oficiales y sinopsis literarias.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setFormData({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', code: '', is_active: true });
              setIsModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2.5 rounded-xl shadow-sm font-black transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            Nuevo Libro
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Libros</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Libros Activos</span>
          <p className="text-2xl font-black text-green-600 mt-1">{products.filter(p => p.is_active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categorías / Géneros</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio Unitario Base</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ${products.length > 0 ? (products[0].price || 0).toLocaleString('es-AR') : '0'}
          </p>
        </div>
      </div>
      
      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por título, autor, sinopsis o código..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white min-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          >
            <option value="">Todos los Géneros ({categories.length})</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon || ''} {c.name}</option>)}
          </select>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          >
            <option value="name_asc">Título (A-Z)</option>
            <option value="price_asc">Precio (Menor a Mayor)</option>
            <option value="price_desc">Precio (Mayor a Menor)</option>
          </select>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Portada & Libro</th>
                <th className="p-4">Género / Categoría</th>
                <th className="p-4">Precio (ARS)</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const cat = categories.find(c => c.id === product.category_id);
                return (
                  <tr key={product.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-4 flex items-center gap-3.5">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-12 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-sm" 
                        />
                      ) : (
                        <div className="w-12 h-14 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300">
                          Sin foto
                        </div>
                      )}
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                          {product.code && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {product.code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {product.description?.replace(/\n/g, ' ') || 'Sin descripción'}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {cat ? `${cat.icon || '📖'} ${cat.name}` : 'Sin categoría'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-black text-slate-900 text-sm">
                        ${product.price.toLocaleString('es-AR')}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          product.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Haz clic para alternar visibilidad"
                      >
                        {product.is_active ? <CheckCircle size={12} /> : <EyeOff size={12} />}
                        {product.is_active ? 'Activo' : 'Oculto'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Editar libro y precio"
                        >
                          <Edit size={17} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                    No se encontraron libros que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <h3 className="text-2xl font-black mb-4 text-slate-900">
              {formData.id ? 'Editar Libro' : 'Agregar Nuevo Libro'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Título del Libro</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    placeholder="Ej: El Principito"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Código / SKU</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    placeholder="Ej: LBR-101" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Sinopsis & Ficha Literaria</label>
                <textarea 
                  rows={4}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                  placeholder="👤 Autor: ...&#10;🏷️ Género: ...&#10;&#10;📖 Sinopsis: ...&#10;&#10;🎯 Recomendado para: ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Precio (ARS $)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      required 
                      type="number" 
                      min="0" 
                      step="100"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Categoría / Género</label>
                  <select 
                    required 
                    value={formData.category_id} 
                    onChange={e => setFormData({...formData, category_id: e.target.value})} 
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon || ''} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">URL de Portada (CDN)</label>
                <input 
                  type="url" 
                  placeholder="https://th.bing.com/th?q=..." 
                  value={formData.image_url} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" 
                />
                {formData.image_url && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={formData.image_url} alt="Vista previa de portada" className="h-16 w-12 rounded-md object-cover border border-slate-300" />
                    <span className="text-xs text-slate-500">Vista previa de la portada</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 accent-amber-500" 
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Libro Activo (Visible para clientes en la tienda)
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-black text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
