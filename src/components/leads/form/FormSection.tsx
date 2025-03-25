
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">{title}</h2>
      {children}
    </div>
  );
};

export default FormSection;
