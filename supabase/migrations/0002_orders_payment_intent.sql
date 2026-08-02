-- 0002_orders_payment_intent.sql — Phase 3 : paiement carte (Stripe)
--
-- ⚠️ Action manuelle requise : coller ce script dans Supabase → SQL Editor
-- et l'exécuter (après 0001_init.sql).

alter table public.orders add column payment_intent text;
create index orders_payment_intent_idx on public.orders(payment_intent);
