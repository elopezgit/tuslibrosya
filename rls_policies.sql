-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Políticas para EMPRESAS
-- ----------------------------------------------------
-- Lectura pública (Cualquiera puede ver la información de la empresa)
CREATE POLICY "Lectura publica empresas" ON empresas FOR SELECT USING (true);

-- Update solo admin (El slug debe coincidir con la parte inicial del email del usuario)
CREATE POLICY "Update admin empresa" ON empresas FOR UPDATE TO authenticated USING (
  slug = split_part(auth.jwt() ->> 'email', '@', 1)
);

-- ----------------------------------------------------
-- Políticas para CATEGORIES, PRODUCTS, BANNERS
-- ----------------------------------------------------
-- Lectura pública (Cualquiera puede ver el catálogo)
CREATE POLICY "Lectura publica categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "Lectura publica productos" ON products FOR SELECT USING (true);
CREATE POLICY "Lectura publica banners" ON banners FOR SELECT USING (true);

-- Manejo (CRUD) estricto solo para el admin de la empresa
CREATE POLICY "Admin categorias" ON categories FOR ALL TO authenticated USING (
  empresa_id IN (SELECT id FROM empresas WHERE slug = split_part(auth.jwt() ->> 'email', '@', 1))
);
CREATE POLICY "Admin productos" ON products FOR ALL TO authenticated USING (
  empresa_id IN (SELECT id FROM empresas WHERE slug = split_part(auth.jwt() ->> 'email', '@', 1))
);
CREATE POLICY "Admin banners" ON banners FOR ALL TO authenticated USING (
  empresa_id IN (SELECT id FROM empresas WHERE slug = split_part(auth.jwt() ->> 'email', '@', 1))
);

-- ----------------------------------------------------
-- Políticas para ORDERS (Pedidos Sensibles)
-- ----------------------------------------------------
-- Inserción pública (Para que los clientes sin cuenta puedan enviar sus pedidos)
CREATE POLICY "Insert publico ordenes" ON orders FOR INSERT WITH CHECK (true);

-- Lectura/Edición solo para admin (El admin solo puede ver y editar pedidos de su local)
CREATE POLICY "Admin ordenes" ON orders FOR ALL TO authenticated USING (
  empresa_id IN (SELECT id FROM empresas WHERE slug = split_part(auth.jwt() ->> 'email', '@', 1))
);

-- ----------------------------------------------------
-- Función Segura de Tracker (RPC)
-- ----------------------------------------------------
-- Permite a los clientes consultar el estado de su pedido si conocen el ID,
-- sin exponer el listado completo de pedidos a lectura pública.
CREATE OR REPLACE FUNCTION get_order_status(p_order_id uuid)
RETURNS TABLE(status text, total numeric)
LANGUAGE sql
SECURITY DEFINER -- Ejecuta con privilegios de creador para saltar RLS
AS $$
  SELECT status, total FROM orders WHERE id = p_order_id;
$$;
