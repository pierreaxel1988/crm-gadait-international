
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  id: string;
}

const CodeBlock = ({ code, id }: CodeBlockProps) => {
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(blockId);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">{code}</pre>
      <button 
        className="absolute top-2 right-2 p-2 rounded-md hover:bg-background transition-colors"
        onClick={() => copyToClipboard(code, id)}
      >
        {copied === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default CodeBlock;
