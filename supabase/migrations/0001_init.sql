-- 0001_init.sql — fondations Phase 0 : comptes clients, sessions, commandes
-- Sara Pizzeraya Kebap
--
-- ⚠️ Action manuelle requise : coller ce script dans Supabase → SQL Editor
-- et l'exécuter une fois le projet Supabase créé. Rien n'est appliqué
-- automatiquement par le code.

create table public.users (
  id text primary key,                          -- hex 32 car., généré app-side (crypto.randomBytes)
  email text not null unique,
  password_hash text not null,                   -- format "salt:hash" (PBKDF2-SHA512, 100k itérations)
  prenom text not null,
  nom text not null,
  phone text not null default '',
  address text not null default '',
  newsletter boolean not null default false,
  loyalty_count integer not null default 0,
  favorites text[] not null default '{}',
  email_verified boolean not null default false,
  email_verif_token text,
  created_at timestamptz not null default now()
);

create table public.sessions (
  token text primary key,                         -- hex 64 car., cookie HttpOnly côté client
  user_id text not null references public.users(id) on delete cascade,
  expires_at timestamptz not null
);
create index sessions_user_id_idx on public.sessions(user_id);

create table public.orders (
  id text primary key,                            -- hex 32 car. : sert aussi de secret implicite
  user_id text references public.users(id) on delete set null,  -- null = checkout invité
  items jsonb not null,                           -- [{ name, quantity, price, desc? }]
  total numeric(10,2) not null,
  order_type text not null check (order_type in ('emporter', 'livraison')),
  address text not null default '',
  phone text not null default '',
  status text not null default 'pending'
    check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  created_at timestamptz not null default now()
  -- eta_minutes, eta_ready_at, cancelled_by_client, payment_intent : ajoutés
  -- dans des migrations dédiées en Phase 3/4, quand le suivi de commande et
  -- Stripe entrent en jeu (même discipline que Flash Pizzas : une colonne
  -- n'arrive qu'avec la fonctionnalité qui en a besoin).
);
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

-- RLS activé, aucune policy : le backend passe exclusivement par la clé
-- service_role (bypass RLS). Ça bloque tout accès direct depuis une future
-- clé anon/authenticated qui serait exposée côté client par erreur.
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.orders enable row level security;
