
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ApiHeaderProps {
  baseApiUrl: string;
}

const ApiHeader = ({ baseApiUrl }: ApiHeaderProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  
  // Format URL for better mobile display
  const displayUrl = isMobile 
    ? baseApiUrl.replace(/^(https:\/\/[^\/]+)(.*)$/, '$1\n$2')
    : baseApiUrl;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">URL de l'API</h3>
      <div className="flex items-stretch gap-2 mb-4">
        <code className={`bg-muted px-3 py-2 rounded-md text-sm flex-1 overflow-x-auto ${isMobile ? 'whitespace-pre-wrap break-all' : 'whitespace-nowrap'}`}>
          {displayUrl}
        </code>
        <button 
          className="p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          onClick={() => copyToClipboard(baseApiUrl, 'url')}
          aria-label="Copier l'URL"
        >
          {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default ApiHeader;
