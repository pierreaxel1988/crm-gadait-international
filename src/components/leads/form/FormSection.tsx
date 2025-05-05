
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode; // Added action prop for optional button/action elements
}

const FormSection = ({ title, children, action }: FormSectionProps) => {
  return (
    <div className="space-y-4 bg-white rounded-xl shadow-sm border border-loro-pearl/20 p-5">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-futura uppercase tracking-wider text-loro-hazel pb-2 border-b border-loro-pearl/30">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export default FormSection;
