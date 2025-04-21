
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OwnerFormProps {
  onComplete?: () => void;
}

const DEFAULT = {
  full_name: "",
  email: "",
  phone: "",
  nationality: "",
  tax_residence: "",
  preferred_language: "",
  contact_source: "",
  relationship_status: "Nouveau contact",
  mandate_type: "",
};

const OwnerForm: React.FC<OwnerFormProps> = ({ onComplete }) => {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("owners").insert([form]);
    setLoading(false);
    setForm(DEFAULT);
    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-xs">
      <Input name="full_name" placeholder="Nom complet" value={form.full_name} onChange={handleChange} className="col-span-2" required />
      <Input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
      <Input name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
      <Input name="nationality" placeholder="Nationalité" value={form.nationality} onChange={handleChange} />
      <Input name="tax_residence" placeholder="Résidence fiscale" value={form.tax_residence} onChange={handleChange} />
      <Input name="preferred_language" placeholder="Langue préférée" value={form.preferred_language} onChange={handleChange} />
      <Input name="contact_source" placeholder="Source du contact" value={form.contact_source} onChange={handleChange} />
      <Input name="mandate_type" placeholder="Type de mandat" value={form.mandate_type} onChange={handleChange} />
      <Button type="submit" loading={loading} className="col-span-2 w-full">Créer</Button>
    </form>
  );
};

export default OwnerForm;
