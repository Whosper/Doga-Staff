-- =====================================================================
--  Schéma Supabase pour le QG de l'Équipage
--  À coller dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

-- Table qui contient l'état complet du QG (un seul document JSON).
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes.
alter table public.app_state enable row level security;

-- Politique simple : lecture + écriture ouvertes via la clé "anon".
-- (Suffisant pour un usage privé entre staff. Pour verrouiller
--  davantage, voir la section "Aller plus loin" du README.)
drop policy if exists "staff_read"  on public.app_state;
drop policy if exists "staff_write" on public.app_state;

create policy "staff_read"  on public.app_state for select using (true);
create policy "staff_write" on public.app_state for all    using (true) with check (true);

-- Active la diffusion temps réel des changements de cette table.
alter publication supabase_realtime add table public.app_state;
