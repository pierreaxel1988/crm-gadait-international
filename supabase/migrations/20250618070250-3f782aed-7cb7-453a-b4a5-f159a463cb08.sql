
-- Ajouter les nouveaux champs pour l'optimisation du pipeline propriétaires
ALTER TABLE owners 
ADD COLUMN IF NOT EXISTS mandate_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS mandate_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS mandate_conditions text,
ADD COLUMN IF NOT EXISTS is_furniture_relevant boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS price_validation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_price_update timestamp with time zone;

-- Créer un index pour optimiser les requêtes sur les statuts
CREATE INDEX IF NOT EXISTS idx_owners_status ON owners(status);
CREATE INDEX IF NOT EXISTS idx_owners_assigned_to ON owners(assigned_to);
CREATE INDEX IF NOT EXISTS idx_owners_mandate_type ON owners(mandate_type);

-- Ajouter des contraintes pour la validation des prix
ALTER TABLE owners 
ADD CONSTRAINT check_desired_price_positive 
CHECK (desired_price IS NULL OR desired_price::numeric > 0);

-- Optimiser les performances avec un index sur les champs de recherche
CREATE INDEX IF NOT EXISTS idx_owners_search ON owners(full_name, email, phone);
