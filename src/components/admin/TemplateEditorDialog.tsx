import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailTemplate {
  id: string;
  campaign_id: string;
  day_number: number;
  template_name: string;
  subject_template: string;
  content_template: string;
  is_active: boolean;
  is_validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
}

interface TemplateEditorDialogProps {
  template: EmailTemplate | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TemplateEditorDialog({ template, open, onClose, onSave }: TemplateEditorDialogProps) {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState(template?.template_name || "");
  const [subjectTemplate, setSubjectTemplate] = useState(template?.subject_template || "");
  const [contentTemplate, setContentTemplate] = useState(template?.content_template || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!template) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("email_templates")
        .update({
          template_name: templateName,
          subject_template: subjectTemplate,
          content_template: contentTemplate,
        })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "Template mis à jour",
        description: "Les modifications ont été enregistrées avec succès",
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!template) return;

    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("email_templates")
        .update({
          template_name: templateName,
          subject_template: subjectTemplate,
          content_template: contentTemplate,
          is_validated: true,
          validated_at: new Date().toISOString(),
          validated_by: user?.id,
        })
        .eq("id", template.id);

      if (error) throw error;

      toast({
        title: "Template validé",
        description: "Le template est maintenant prêt à être utilisé pour les séquences automatiques",
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la validation du template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de valider le template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Éditer le template - J+{template.day_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nom du template</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Nom du template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet de l'email</Label>
            <Input
              id="subject"
              value={subjectTemplate}
              onChange={(e) => setSubjectTemplate(e.target.value)}
              placeholder="Sujet avec variables: {{nom}}, {{location}}, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu HTML de l'email</Label>
            <Textarea
              id="content"
              value={contentTemplate}
              onChange={(e) => setContentTemplate(e.target.value)}
              placeholder="Contenu HTML avec variables: {{nom}}, {{salutation}}, {{agent_name}}, {{cal_booking_link}}, etc."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium">Variables disponibles :</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><code>{'{{nom}}'}</code> - Nom du lead</div>
              <div><code>{'{{salutation}}'}</code> - M./Mme</div>
              <div><code>{'{{location}}'}</code> - Localisation recherchée</div>
              <div><code>{'{{budget}}'}</code> - Budget du lead</div>
              <div><code>{'{{agent_name}}'}</code> - Nom de l'agent assigné</div>
              <div><code>{'{{cal_booking_link}}'}</code> - Lien Cal.com de l'agent</div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Enregistrer
          </Button>
          <Button 
            onClick={handleValidate} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            Enregistrer et Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
