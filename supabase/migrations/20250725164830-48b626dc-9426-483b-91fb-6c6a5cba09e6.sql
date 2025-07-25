-- Add slug column to gadait_properties table
ALTER TABLE gadait_properties 
ADD COLUMN slug text UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_gadait_properties_slug ON gadait_properties(slug);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title_text text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace special characters
  base_slug := lower(title_text);
  
  -- Replace accents and special characters
  base_slug := translate(base_slug, 
    'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ', 
    'aaaaaaeceeeeiiiinooooooouuuuyy');
  
  -- Replace spaces and special chars with hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length to 100 characters
  base_slug := substring(base_slug from 1 for 100);
  
  -- Check for uniqueness and add counter if needed
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM gadait_properties WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing properties
UPDATE gadait_properties 
SET slug = generate_slug(title) 
WHERE slug IS NULL AND title IS NOT NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
  BEFORE INSERT OR UPDATE OF title ON gadait_properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();