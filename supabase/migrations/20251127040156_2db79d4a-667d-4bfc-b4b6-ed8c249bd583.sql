-- Supprimer temporairement la vue qui dépend de desired_location
DROP VIEW IF EXISTS v_no_response_candidates CASCADE;

-- Modifier le champ desired_location pour supporter plusieurs localisations
ALTER TABLE leads 
ALTER COLUMN desired_location TYPE text[] USING 
  CASE 
    WHEN desired_location IS NULL OR desired_location = '' THEN '{}'::text[]
    ELSE ARRAY[desired_location]
  END;

-- Recréer la vue avec la nouvelle structure
CREATE VIEW v_no_response_candidates AS
SELECT 
  l.id,
  l.name,
  l.email,
  l.phone,
  l.country,
  l.desired_location,
  l.budget,
  l.status,
  l.tags,
  l.created_at,
  l.last_contacted_at,
  l.assigned_to,
  l.pipeline_type
FROM leads l
WHERE l.deleted_at IS NULL
  AND l.status IN ('nouveau', 'qualifié', 'en_cours')
  AND (
    l.last_contacted_at IS NULL 
    OR l.last_contacted_at < NOW() - INTERVAL '14 days'
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM lead_email_sequences les
    WHERE les.lead_id = l.id 
      AND les.is_active = true
  );