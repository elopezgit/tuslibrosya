import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/admin/KanbanBoard';
import CatalogManager from '../components/admin/CatalogManager';
import BannerManager from '../components/admin/BannerManager';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import POSHome from './POSHome';
import ErrorBoundary from '../components/ErrorBoundary';
import { LayoutDashboard, ShoppingBag, Image as ImageIcon, Settings, LockKeyhole, LogOut, BarChart3, Store, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const { empresaSlug } = useParams<{ empresaSlug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'kanban' | 'catalog' | 'banners' | 'config' | 'pos'>('analytics');

  // Login States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'admin' | 'cocina' | 'operador' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem(`admin_role_${empresaSlug}`);
    if (savedRole === 'admin' || savedRole === 'cocina' || savedRole === 'operador') {
      setIsAuthenticated(true);
      setRole(savedRole);
      setDefaultTab(savedRole);
    }
  }, [empresaSlug]);

  const setDefaultTab = (userRole: 'admin' | 'cocina' | 'operador') => {
    if (userRole === 'admin') setActiveTab('analytics');
    else if (userRole === 'cocina') setActiveTab('kanban');
    else if (userRole === 'operador') setActiveTab('pos');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);
    
    // Bypass para roles internos (sin usuario real) y bypass de admin de prueba
    if ((username === 'cocina' && password === 'cocina') || (username === 'operador' && password === 'operador')) {
      const assignedRole = username as 'cocina' | 'operador';
      setIsAuthenticated(true);
      setRole(assignedRole);
      localStorage.setItem(`admin_role_${empresaSlug}`, assignedRole);
      setDefaultTab(assignedRole);
      setIsLoading(false);
      return;
    }

    if (username === 'admin' && password === '123456') {
      const assignedRole = 'admin';
      setIsAuthenticated(true);
      setRole(assignedRole);
      localStorage.setItem(`admin_role_${empresaSlug}`, assignedRole);
      setDefaultTab(assignedRole);
      setIsLoading(false);
      return;
    }

    // Login real por supabase multi-tenant (Aislamiento de empresas)
    // Cada empresa tendrá su propio usuario admin aislado basado en su slug
    let loginEmail = username;
    if (username === 'admin') {
      loginEmail = `${empresaSlug}@gmail.com`;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error || !data.user) {
        setLoginError(true);
      } else {
        const assignedRole = 'admin';
        setIsAuthenticated(true);
        setRole(assignedRole);
        localStorage.setItem(`admin_role_${empresaSlug}`, assignedRole);
        setDefaultTab(assignedRole);
      }
    } catch (err) {
      setLoginError(true);
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem(`admin_role_${empresaSlug}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
              <BookOpen size={40} />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-1">
              TusLibrosYa
            </h1>
            <h2 className="text-xl font-bold text-white mb-2">Panel de Control</h2>
            <p className="text-slate-400 text-sm mb-8">Ingresa tus credenciales para administrar {empresaSlug}</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Usuario" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-primary"
              />
            </div>
            
            {loginError && <p className="text-red-500 text-xs font-bold">Credenciales incorrectas</p>}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black font-black py-3 rounded-xl mt-4 active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {isLoading ? 'Verificando...' : 'Entrar al Panel'}
            </button>
          </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 p-6 flex flex-col shadow-2xl z-50">
        <h1 className="text-2xl font-bold mb-1 text-primary">{empresaSlug?.toUpperCase()}</h1>
        <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Rol: {role}
        </p>
        
        <nav className="flex-1 space-y-2">
          {role === 'admin' && (
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'analytics' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <BarChart3 size={20} />
              Resumen
            </button>
          )}

          {(role === 'admin' || role === 'operador') && (
            <button 
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'pos' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Store size={20} />
              Tomar Pedido
            </button>
          )}

          {(role === 'admin' || role === 'cocina') && (
            <button 
              onClick={() => setActiveTab('kanban')}
              className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'kanban' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={20} />
              Pedidos
            </button>
          )}

          {role === 'admin' && (
            <>
              <button 
                onClick={() => setActiveTab('catalog')}
                className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'catalog' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <ShoppingBag size={20} />
                Catálogo
              </button>
              <button 
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'banners' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <ImageIcon size={20} />
                Banners
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`w-full flex items-center gap-3 text-left p-3 rounded-lg font-medium transition-colors ${activeTab === 'config' ? 'bg-primary text-black shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <Settings size={20} />
                Configuración
              </button>
            </>
          )}
        </nav>
        
        <div className="mt-auto border-t border-slate-800 pt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 py-2 rounded-lg text-sm font-medium transition-colors mb-4"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
          <p className="text-xs text-slate-500 text-center">TusLibrosYa OS v1.1</p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        {activeTab === 'analytics' && <AnalyticsDashboard empresaSlug={empresaSlug!} />}
        {activeTab === 'kanban' && <KanbanBoard empresaSlug={empresaSlug!} role={role!} />}
        {activeTab === 'catalog' && <CatalogManager empresaSlug={empresaSlug!} />}
        {activeTab === 'banners' && <BannerManager empresaSlug={empresaSlug!} />}
        {activeTab === 'pos' && (
          <div className="h-screen overflow-hidden">
            <POSHome empresaSlug={empresaSlug!} />
          </div>
        )}
        {activeTab === 'config' && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Configuración</h2>
            <p className="text-slate-500 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              Aquí pondremos más adelante la configuración del logo, teléfono, redes sociales y links de mapas de {empresaSlug}.
            </p>
          </div>
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
}
