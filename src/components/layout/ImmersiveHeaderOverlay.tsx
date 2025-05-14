
import React from 'react';

const ImmersiveHeaderOverlay: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-20 z-10 bg-gradient-to-b from-background to-transparent pointer-events-none"></div>
  );
};

export default ImmersiveHeaderOverlay;
