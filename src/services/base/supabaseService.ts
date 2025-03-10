
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export { supabase, toast };

// Common fetch error handler
export const handleFetchError = (message: string): never => {
  toast({
    variant: "destructive",
    title: "Erreur",
    description: message
  });
  return [] as never;
};
