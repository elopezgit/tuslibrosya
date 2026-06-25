-- ⚠️ SCRIPT PARA DESBLOQUEAR LA BASE DE DATOS ⚠️
-- Supabase tiene activada por defecto la Seguridad a Nivel de Fila (RLS)
-- que está bloqueando que nuestra aplicación pueda leer y escribir datos.
-- Ejecuta esto para permitir el acceso público mientras desarrollamos.

-- Deshabilitar RLS temporalmente en todas las tablas para permitir el desarrollo
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Por si acaso RLS sigue activo y forzado, agregamos políticas que permiten TODO a usuarios anónimos (público)
DROP POLICY IF EXISTS "Public Access" ON public.empresas;
DROP POLICY IF EXISTS "Public Access" ON public.categories;
DROP POLICY IF EXISTS "Public Access" ON public.products;
DROP POLICY IF EXISTS "Public Access" ON public.banners;
DROP POLICY IF EXISTS "Public Access" ON public.orders;

CREATE POLICY "Public Access" ON public.empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON public.banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
