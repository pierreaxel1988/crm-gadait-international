-- Ajouter les nouveaux templates pour le test pilote

-- Template J+3 (Segment A uniquement - Ultra-Premium)
INSERT INTO email_templates (campaign_id, day_number, template_name, subject_template, content_template, is_active)
VALUES (
  '890dfd46-7439-41bb-a7f0-a83fa7b6b1d9',
  3,
  'Rappel Prioritaire Ultra-Premium',
  '[URGENT] {{nom}}, votre projet {{location}} - Opportunité exclusive',
  '<p>Votre recherche {{location}} mérite une attention particulière.</p>
   <p>Nous avons identifié une opportunité exceptionnelle qui correspond exactement à vos critères.</p>
   <p><strong>Disponible pour un échange téléphonique dans les 48h ?</strong></p>',
  true
);

-- Template J+60 (Segment D - Désengagement Élégant)
INSERT INTO email_templates (campaign_id, day_number, template_name, subject_template, content_template, is_active)
VALUES (
  '890dfd46-7439-41bb-a7f0-a83fa7b6b1d9',
  60,
  'Dernière Communication',
  '{{nom}}, restons en contact pour {{location}}',
  '<p>Nous comprenons que le timing n''est peut-être pas idéal actuellement.</p>
   <p>Souhaitez-vous que nous restions en contact de manière plus espacée ?</p>
   <p>Répondez simplement "OUI" ou "PAUSE" selon votre préférence.</p>',
  true
);

-- Améliorer le template J+7 existant
UPDATE email_templates 
SET content_template = '<p>Nous avons le plaisir de vous présenter une sélection de biens d''exception.</p>
<p>Chaque propriété a été soigneusement choisie selon vos critères spécifiques.</p>'
WHERE day_number = 7 AND campaign_id = '890dfd46-7439-41bb-a7f0-a83fa7b6b1d9';