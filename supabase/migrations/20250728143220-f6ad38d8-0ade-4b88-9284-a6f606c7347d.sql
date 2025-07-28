-- Corriger le problème de sécurité function search path
ALTER FUNCTION public.update_chart_data_entries_updated_at() 
SET search_path = public, pg_temp;