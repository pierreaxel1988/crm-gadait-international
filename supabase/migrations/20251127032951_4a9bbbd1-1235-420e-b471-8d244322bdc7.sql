-- Désactiver toutes les campagnes d'emails automatiques
UPDATE automated_email_campaigns 
SET is_active = false 
WHERE is_active = true;

-- Arrêter toutes les séquences actives
UPDATE lead_email_sequences 
SET is_active = false,
    stopped_at = now(),
    stopped_reason = 'manual',
    stopped_by = NULL
WHERE is_active = true;