import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientHome from './pages/ClientHome';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './lib/CartContext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir la raíz a un default si es necesario, o mostrar un portal de selección de empresas */}
        <Route path="/" element={<Navigate to="/tuslibrosya" replace />} />
        
        {/* Rutas Multi-Tenant (segmentadas por empresa) */}
        <Route path="/:empresaSlug" element={
          <CartProvider>
            <ClientHome />
          </CartProvider>
        } />
        <Route path="/admin/:empresaSlug" element={
          <CartProvider>
            <AdminDashboard />
          </CartProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
