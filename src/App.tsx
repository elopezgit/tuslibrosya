import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CartProvider } from './lib/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

const ClientHome = lazy(() => import('./pages/ClientHome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center text-slate-500">Cargando…</div>}>
        <Routes>
          {/* Redirigir la raíz a un default si es necesario, o mostrar un portal de selección de empresas */}
          <Route path="/" element={<Navigate to="/tuslibrosya" replace />} />

          {/* Rutas Multi-Tenant (segmentadas por empresa) */}
          <Route path="/:empresaSlug" element={
            <CartProvider>
              <ErrorBoundary>
                <ClientHome />
              </ErrorBoundary>
            </CartProvider>
          } />
          <Route path="/admin/:empresaSlug" element={
            <CartProvider>
              <AdminDashboard />
            </CartProvider>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;