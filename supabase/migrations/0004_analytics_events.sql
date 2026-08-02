-- 0004_analytics_events.sql — Phase 5 : analytics maison (visiteurs/paniers)
-- pour les stats du dashboard patron.
--
-- ⚠️ Action manuelle requise : coller ce script dans Supabase → SQL Editor
-- et l'exécuter (après 0001/0002/0003). Sans cette table, le dashboard
-- fonctionne quand même (CA/commandes) mais visiteurs/paniers restent à 0.

create table public.analytics_events (
  visitor_id text not null,
  type text not null check (type in ('visit', 'cart')),
  day text not null, -- "YYYY-MM-DD", fuseau Europe/Zurich (voir zurichDayStr dans db.ts)
  primary key (visitor_id, type, day)
);
create index analytics_events_day_type_idx on public.analytics_events(day, type);

alter table public.analytics_events enable row level security;
