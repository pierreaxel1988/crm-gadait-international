
import React from 'react';

interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormField;
