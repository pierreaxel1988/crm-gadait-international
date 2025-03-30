
import React from 'react';
import LeadTag from './LeadTag';

/**
 * LeadTagExamples - Examples of using the LeadTag component
 * with the Loro Piana color palette
 */
const LeadTagExamples = () => {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <LeadTag 
        label="New" 
        bgColor="bg-[#F5F3EE]" 
        textColor="text-[#7A6C5D]" 
      />
      
      <LeadTag 
        label="Call" 
        bgColor="bg-[#EBD5CE]" 
        textColor="text-[#96493D]" 
      />
      
      <LeadTag 
        label="Hot" 
        bgColor="bg-[#F3E9D6]" 
        textColor="text-[#B58C59]" 
      />
      
      <LeadTag 
        label="Contacted" 
        bgColor="bg-[#DCE4E3]" 
        textColor="text-[#4C5C59]" 
      />
      
      <LeadTag 
        label="VIP" 
        bgColor="bg-[#EFEAE4]" 
        textColor="text-[#3F3C3B]" 
      />
      
      {/* Example with direct hex colors without Tailwind classes */}
      <LeadTag 
        label="Custom" 
        bgColor="#E0D8C3" 
        textColor="#5A4F3F" 
      />
      
      {/* Example with additional className */}
      <LeadTag 
        label="With Shadow" 
        bgColor="bg-[#F5F3EE]" 
        textColor="text-[#7A6C5D]" 
        className="shadow-sm"
      />
    </div>
  );
};

export default LeadTagExamples;
