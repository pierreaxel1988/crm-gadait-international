
import React, { useState } from 'react';
import { LeadDetailed } from '@/types/lead';
import { LeadTag } from '@/components/common/TagBadge';
import GeneralInformationFields from './form/GeneralInformationFields';
import SearchCriteriaFields from './form/SearchCriteriaFields';
import StatusFields from './form/StatusFields';
import FormActions from './form/FormActions';

type LeadFormProps = {
  lead?: LeadDetailed;
  onSubmit: (data: LeadDetailed) => void;
  onCancel: () => void;
  activeTab?: string;
};

const LeadForm = ({ lead, onSubmit, onCancel, activeTab = 'informations' }: LeadFormProps) => {
  const [formData, setFormData] = useState<LeadDetailed>(
    lead || {
      id: '',
      name: '',
      email: '',
      status: 'New',
      tags: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  const handleTagToggle = (tag: LeadTag) => {
    setFormData(prev => {
      const tags = prev.tags || [];
      return {
        ...prev,
        tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
      };
    });
  };

  const handleMultiSelectToggle = <T extends string>(name: keyof LeadDetailed, value: T) => {
    setFormData(prev => {
      const currentValues = prev[name] as T[] || [];
      return {
        ...prev,
        [name]: currentValues.includes(value) 
          ? currentValues.filter(v => v !== value) 
          : [...currentValues, value]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        {activeTab === 'informations' && (
          <GeneralInformationFields
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
        
        {activeTab === 'criteres' && (
          <SearchCriteriaFields
            formData={formData}
            handleInputChange={handleInputChange}
            handleNumberChange={handleNumberChange}
            handleMultiSelectToggle={handleMultiSelectToggle}
            setFormData={setFormData}
          />
        )}
        
        {activeTab === 'statut' && (
          <StatusFields
            formData={formData}
            handleInputChange={handleInputChange}
            handleTagToggle={handleTagToggle}
          />
        )}
      </div>

      <FormActions onCancel={onCancel} />
    </form>
  );
};

export default LeadForm;
