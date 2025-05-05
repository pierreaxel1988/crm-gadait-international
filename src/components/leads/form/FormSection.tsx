
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode; // Added action prop for optional button/action elements
}

const FormSection = ({ title, children, action }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-futura uppercase tracking-wider text-gray-800 pb-2 border-b">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export default FormSection;
