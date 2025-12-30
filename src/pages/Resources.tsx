import React from 'react';
import { FolderOpen, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';

interface ResourceFolder {
  language: string;
  url: string;
}

interface CountryResources {
  country: string;
  flag: string;
  folders: ResourceFolder[];
}

const resources: CountryResources[] = [
  {
    country: 'Mauritius',
    flag: '🇲🇺',
    folders: [
      { 
        language: 'Français', 
        url: 'https://drive.google.com/drive/folders/126GMebJhVk5REDHNN_9KTk4Eo7hdfzA1' 
      },
      { 
        language: 'English', 
        url: 'https://drive.google.com/drive/folders/1c6NYfiSRZ3ivj_aYqwk_nASS7vnCwvKF' 
      }
    ]
  }
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-loro-50">
      <Navbar />
      <SubNavigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="h-6 w-6 text-loro-terracotta" />
          <h1 className="text-2xl font-semibold text-loro-navy">Resources</h1>
        </div>

        <div className="space-y-8">
          {resources.map((countryResource) => (
            <div key={countryResource.country}>
              <h2 className="text-lg font-medium text-loro-navy mb-4 flex items-center gap-2">
                <span className="text-2xl">{countryResource.flag}</span>
                {countryResource.country}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {countryResource.folders.map((folder) => (
                  <a
                    key={folder.language}
                    href={folder.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-loro-pearl bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-loro-sand/30 rounded-lg">
                          <FolderOpen className="h-6 w-6 text-loro-terracotta" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-loro-navy">{folder.language}</p>
                          <p className="text-sm text-loro-navy/60">Documents</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-loro-navy/40" />
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
