-- 0003_orders_tracking.sql — Phase 4 : suivi de commande (accepter/refuser,
-- ETA dérivé, annulation client)
--
-- ⚠️ Action manuelle requise : coller ce script dans Supabase → SQL Editor
-- et l'exécuter (après 0001_init.sql et 0002_orders_payment_intent.sql).

alter table public.orders add column eta_minutes integer;
alter table public.orders add column eta_ready_at timestamptz;
alter table public.orders add column cancelled_by_client boolean not null default false;
