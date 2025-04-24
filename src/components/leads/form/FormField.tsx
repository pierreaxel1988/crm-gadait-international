
import React from 'react';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  label: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fieldName?: string;
  children?: React.ReactNode;
  type?: string;
}

const FormField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  fieldName,
  children,
  type = "text"
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
      </label>
      {children || (
        <Input
          type={type}
          name={fieldName}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full"
        />
      )}
    </div>
  );
};

export default FormField;
