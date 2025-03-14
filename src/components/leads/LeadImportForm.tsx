
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import CustomButton from '@/components/ui/CustomButton';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Schema for the lead import form
const LeadImportSchema = z.object({
  message: z.string().min(1, { message: 'Le contenu de l\'email est requis' }),
});

type LeadImportForm = z.infer<typeof LeadImportSchema>;

const LeadImportForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeadImportForm>({
    resolver: zodResolver(LeadImportSchema),
    defaultValues: {
      message: '',
    },
  });

  // Function to handle form submission
  const onSubmit = async (data: LeadImportForm) => {
    try {
      setIsLoading(true);
      
      // Show loading toast
      toast({
        title: "Importation en cours...",
        description: "Analyse et importation des leads...",
      });
      
      // Call the Supabase edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('import-lead', {
        body: {
          message: data.message,
          integration_source: 'Manual Import',
        },
      });
      
      if (functionError) {
        console.error('Error importing lead:', functionError);
        toast({
          variant: "destructive",
          title: "Erreur d'importation",
          description: `Une erreur est survenue: ${functionError.message || 'Erreur inconnue'}`,
        });
        return;
      }
      
      if (!functionData?.success) {
        toast({
          variant: "destructive",
          title: "Échec de l'importation",
          description: functionData?.error || "Impossible d'importer le lead. Vérifiez le format de l'email.",
        });
        return;
      }
      
      // Success, clear the form
      form.reset();
      
      // Display success message
      toast({
        title: functionData.isNew ? "Nouveau lead créé!" : "Lead mis à jour!",
        description: `Le lead ${functionData.data?.name || ''} a été ${functionData.isNew ? 'créé' : 'mis à jour'} avec succès.`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error('Error in lead import:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: `Une erreur est survenue: ${error.message || 'Erreur inconnue'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">Importer des leads par email</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Collez le contenu d'un email de portail immobilier (Le Figaro, Property Cloud, etc.) pour extraire automatiquement les informations du lead.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contenu de l'email</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Collez le contenu complet de l'email ici..." 
                    className="min-h-[200px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <CustomButton
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Importer le lead
            </CustomButton>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LeadImportForm;
