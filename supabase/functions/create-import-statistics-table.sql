
-- Create a table to store import statistics
CREATE TABLE IF NOT EXISTS public.import_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  total_count INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  updated_count INTEGER NOT NULL,
  error_count INTEGER NOT NULL,
  duplicates_count INTEGER NOT NULL DEFAULT 0,
  import_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.import_statistics IS 'Stores statistics about lead imports';
