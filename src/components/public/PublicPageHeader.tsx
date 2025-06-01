
import React from 'react';
import { Shield } from 'lucide-react';

const PublicPageHeader = () => {
  return (
    <header className="bg-loro-navy text-white shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-center">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-3 text-white" />
            <span className="font-futura tracking-tight uppercase text-white text-xl font-medium">
              GADAIT.
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicPageHeader;
