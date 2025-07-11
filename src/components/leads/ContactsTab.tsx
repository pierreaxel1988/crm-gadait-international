
import React from 'react';

interface ContactsTabProps {
  leadId: string;
}

const ContactsTab: React.FC<ContactsTabProps> = ({ leadId }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-xl font-normal mb-4">Contacts</h2>
      <p className="text-gray-500">Aucun contact disponible pour le moment.</p>
    </div>
  );
};

export default ContactsTab;
