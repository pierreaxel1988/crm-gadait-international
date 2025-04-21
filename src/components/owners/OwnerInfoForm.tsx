
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import TeamMemberSelect from "@/components/leads/TeamMemberSelect";
import { useAuth } from "@/hooks/useAuth";

interface OwnerInfoFormProps {
  owner?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  isNew?: boolean;
}

const OwnerInfoForm: React.FC<OwnerInfoFormProps> = ({ 
  owner, 
  onSubmit, 
  isSubmitting = false,
  isNew = false
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: owner || {
      full_name: "",
      email: "",
      phone: "",
      nationality: "",
      tax_residence: "",
      preferred_language: "Français",
    }
  });
  
  const assignedToValue = watch("assigned_to");
  const { isAdmin } = useAuth();
  
  const handleAssignedToChange = (value: string) => {
    setValue("assigned_to", value);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            placeholder="Nom et prénom"
            {...register("full_name", { required: true })}
            error={errors.full_name ? true : false}
          />
          {errors.full_name && <p className="text-xs text-red-500">Ce champ est requis</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            {...register("email")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            placeholder="+33 6 12 34 56 78"
            {...register("phone")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationalité</Label>
          <Input
            id="nationality"
            placeholder="Nationalité"
            {...register("nationality")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax_residence">Résidence fiscale</Label>
          <Input
            id="tax_residence"
            placeholder="Pays de résidence fiscale"
            {...register("tax_residence")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferred_language">Langue préférée</Label>
          <Select 
            onValueChange={(value) => setValue("preferred_language", value)}
            defaultValue={owner?.preferred_language || "Français"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Français">Français</SelectItem>
              <SelectItem value="Anglais">Anglais</SelectItem>
              <SelectItem value="Espagnol">Espagnol</SelectItem>
              <SelectItem value="Italien">Italien</SelectItem>
              <SelectItem value="Allemand">Allemand</SelectItem>
              <SelectItem value="Arabe">Arabe</SelectItem>
              <SelectItem value="Chinois">Chinois</SelectItem>
              <SelectItem value="Russe">Russe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_source">Source du contact</Label>
          <Input
            id="contact_source"
            placeholder="Comment ce propriétaire vous a-t-il contacté?"
            {...register("contact_source")}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Commercial assigné</Label>
          <TeamMemberSelect
            selectedId={assignedToValue}
            onAgentChange={handleAssignedToChange}
            label=""
            className="w-full"
          />
        </div>
      </div>

      {isAdmin && !isNew && (
        <div className="space-y-2">
          <Label htmlFor="mandate_type">Type de mandat</Label>
          <Select 
            onValueChange={(value) => setValue("mandate_type", value)}
            defaultValue={owner?.mandate_type || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type de mandat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Simple">Simple</SelectItem>
              <SelectItem value="Exclusif">Exclusif</SelectItem>
              <SelectItem value="Semi-exclusif">Semi-exclusif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isNew ? "Création..." : "Enregistrement..."}
            </>
          ) : (
            isNew ? "Créer le propriétaire" : "Enregistrer les modifications"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OwnerInfoForm;
