-- ============================================
-- SQL completo para o MVP de Marketplace de Locação de Carros
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1) Tabela de perfis de usuário
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  phone text not null default '',
  role text not null check (role in ('owner', 'renter')) default 'renter',
  created_at timestamptz not null default now()
);

-- 2) Tabela de carros
create table if not exists cars (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  city text not null,
  price_per_day numeric(10,2) not null,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) Tabela de reservas
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) on delete cascade not null,
  renter_id uuid references profiles(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- Índices para buscas frequentes
-- ============================================
create index if not exists idx_cars_city on cars(city);
create index if not exists idx_cars_owner on cars(owner_id);
create index if not exists idx_bookings_car on bookings(car_id);
create index if not exists idx_bookings_renter on bookings(renter_id);

-- ============================================
-- RLS (Row Level Security) - Políticas de acesso
-- ============================================

-- Habilitar RLS em todas as tabelas
alter table profiles enable row level security;
alter table cars enable row level security;
alter table bookings enable row level security;

-- === PROFILES ===

-- Qualquer usuário autenticado pode ver perfis (necessário para exibir nomes)
create policy "Perfis são visíveis para usuários autenticados"
  on profiles for select
  to authenticated
  using (true);

-- Usuário só pode editar seu próprio perfil
create policy "Usuário pode editar próprio perfil"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Usuário pode criar seu próprio perfil
create policy "Usuário pode criar próprio perfil"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- === CARS ===

-- Qualquer pessoa (incluindo não autenticados) pode ver carros ativos
create policy "Carros ativos são públicos"
  on cars for select
  using (active = true);

-- Dono pode ver todos os seus carros (ativos e inativos)
create policy "Dono pode ver todos seus carros"
  on cars for select
  to authenticated
  using (auth.uid() = owner_id);

-- Dono pode criar carros
create policy "Dono pode criar carros"
  on cars for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Dono pode editar seus próprios carros
create policy "Dono pode editar seus carros"
  on cars for update
  to authenticated
  using (auth.uid() = owner_id);

-- Dono pode deletar seus próprios carros
create policy "Dono pode deletar seus carros"
  on cars for delete
  to authenticated
  using (auth.uid() = owner_id);

-- === BOOKINGS ===

-- Locatário pode ver suas próprias reservas
create policy "Locatário pode ver suas reservas"
  on bookings for select
  to authenticated
  using (auth.uid() = renter_id);

-- Dono pode ver reservas dos seus carros
create policy "Dono pode ver reservas dos seus carros"
  on bookings for select
  to authenticated
  using (
    exists (
      select 1 from cars
      where cars.id = bookings.car_id
      and cars.owner_id = auth.uid()
    )
  );

-- Locatário pode criar reservas
create policy "Locatário pode criar reservas"
  on bookings for insert
  to authenticated
  with check (auth.uid() = renter_id);

-- Dono pode atualizar status das reservas dos seus carros (aprovar/rejeitar)
create policy "Dono pode atualizar reservas dos seus carros"
  on bookings for update
  to authenticated
  using (
    exists (
      select 1 from cars
      where cars.id = bookings.car_id
      and cars.owner_id = auth.uid()
    )
  );

-- ============================================
-- Trigger para criar perfil automaticamente ao registrar
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (new.id, '', '', 'renter');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que executa após novo usuário ser criado
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
