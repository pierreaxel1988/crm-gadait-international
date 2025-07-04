-- Insérer les données par défaut pour le système d'emails automatiques

-- Insérer une campagne par défaut
INSERT INTO public.automated_email_campaigns (name, description, trigger_days, target_segments, min_budget)
VALUES (
  'Séquence de Réactivation Premium',
  'Séquence automatique pour réactiver les leads premium sans réponse',
  '[7, 14, 21, 30]'::jsonb,
  '["no_response", "cold_leads"]'::jsonb,
  500000
);

-- Insérer les templates par défaut
INSERT INTO public.email_templates (campaign_id, day_number, template_name, subject_template, content_template)
SELECT 
  aec.id,
  7,
  'Premier Rappel Doux',
  'Votre projet immobilier {{location}} - Nouvelles opportunités',
  'template_day_7'
FROM public.automated_email_campaigns aec 
WHERE aec.name = 'Séquence de Réactivation Premium';

INSERT INTO public.email_templates (campaign_id, day_number, template_name, subject_template, content_template)
SELECT 
  aec.id,
  14,
  'Insights Marché Premium',
  'Tendances exclusives marché {{location}} - {{month}} {{year}}',
  'template_day_14'
FROM public.automated_email_campaigns aec 
WHERE aec.name = 'Séquence de Réactivation Premium';

INSERT INTO public.email_templates (campaign_id, day_number, template_name, subject_template, content_template)
SELECT 
  aec.id,
  21,
  'Opportunité Exclusive',
  'Opportunité exclusive correspondant à vos critères',
  'template_day_21'
FROM public.automated_email_campaigns aec 
WHERE aec.name = 'Séquence de Réactivation Premium';

INSERT INTO public.email_templates (campaign_id, day_number, template_name, subject_template, content_template)
SELECT 
  aec.id,
  30,
  'Récapitulatif Final',
  'Dernière sélection premium pour votre projet {{location}}',
  'template_day_30'
FROM public.automated_email_campaigns aec 
WHERE aec.name = 'Séquence de Réactivation Premium';