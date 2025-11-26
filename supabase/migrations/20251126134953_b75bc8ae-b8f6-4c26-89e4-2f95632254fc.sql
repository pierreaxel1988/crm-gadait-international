-- Add Cal.com booking link to team members
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS cal_booking_link TEXT;

COMMENT ON COLUMN public.team_members.cal_booking_link IS 'Cal.com booking link for this team member (e.g., https://cal.com/jean-marc/30min)';

-- Add validation status to email templates
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.team_members(id);

COMMENT ON COLUMN public.email_templates.is_validated IS 'Whether the template has been validated by an admin and is ready to use';
COMMENT ON COLUMN public.email_templates.validated_at IS 'When the template was validated';
COMMENT ON COLUMN public.email_templates.validated_by IS 'Which team member validated the template';