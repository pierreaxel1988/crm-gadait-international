
// Minimal data fetching -- to be expanded later
import { supabase } from "@/integrations/supabase/client";

export async function getOwners() {
  const { data } = await supabase.from("owners").select("*").order("created_at", { ascending: false });
  return data || [];
}
