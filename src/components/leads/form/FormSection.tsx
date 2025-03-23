
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-louisvuitton border-b pb-2">{title}</h2>
      {children}
    </div>
  );
};

export default FormSection;
