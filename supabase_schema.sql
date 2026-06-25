-- SQL Schema Multitenant (Multi-Empresa)

-- 1. Create empresas table (Tenant)
create table empresas (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null, -- ej: 'topedebar', 'punto25', 'capelli'
  name text not null,
  phone text,
  instagram_url text,
  maps_url text,
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  name text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  code text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create banners table
create table banners (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  image_url text not null,
  link text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  comment text,
  total numeric not null,
  status text default 'pendiente', -- pendiente, en_preparacion, entregado, cancelado
  items jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar empresas de ejemplo
insert into empresas (id, slug, name, phone, instagram_url, maps_url) values 
('11111111-1111-1111-1111-111111111111', 'topedebar', 'TopeDeBar', '3815418571', 'https://www.instagram.com/topedebar', 'https://maps.app.goo.gl/ibArFjkEmtEhc14N7'),
('22222222-2222-2222-2222-222222222222', 'punto25', 'Punto 25', '123456789', null, null);

-- Insertar algunas categorías para TopeDeBar
insert into categories (empresa_id, name, icon) values 
('11111111-1111-1111-1111-111111111111', 'Pizzas', '🍕'),
('11111111-1111-1111-1111-111111111111', 'Hamburguesas', '🍔'),
('11111111-1111-1111-1111-111111111111', 'Sándwiches', '🥪'),
('11111111-1111-1111-1111-111111111111', 'Promociones', '⭐');
