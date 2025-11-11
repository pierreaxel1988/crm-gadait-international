import { supabase } from '@/integrations/supabase/client';

/**
 * Utilitaire pour tester la synchronisation DatoCMS manuellement
 * Utilisé pour le débogage et les tests
 */
export async function testDatoCmsSync() {
  console.log('🚀 Démarrage du test de synchronisation DatoCMS...');
  
  try {
    const { data, error } = await supabase.functions.invoke('sync-datocms-properties', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return { success: false, error };
    }
    
    console.log('✅ Synchronisation réussie:', data);
    
    // Vérifier les données dans la base
    const { data: properties, error: dbError } = await supabase
      .from('gadait_properties')
      .select('id, title, title_en, title_fr, slug, slug_en, slug_fr, external_id')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (dbError) {
      console.error('❌ Erreur lors de la lecture des propriétés:', dbError);
      return { success: true, syncData: data, dbError };
    }
    
    console.log('📊 Propriétés dans la base (5 plus récentes):', properties);
    
    // Vérifier si les champs multilingues sont remplis
    const hasMultilingual = properties?.some(p => p.title_en || p.title_fr || p.slug_en || p.slug_fr);
    console.log(`${hasMultilingual ? '✅' : '⚠️'} Champs multilingues ${hasMultilingual ? 'présents' : 'absents'}`);
    
    return { 
      success: true, 
      syncData: data, 
      properties,
      hasMultilingual
    };
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
    return { success: false, error: err };
  }
}

// Exposer globalement pour les tests dans la console
if (typeof window !== 'undefined') {
  (window as any).testDatoCmsSync = testDatoCmsSync;
}
