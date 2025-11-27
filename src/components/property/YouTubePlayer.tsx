
import React from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

// Fonction pour extraire l'ID YouTube depuis différents formats d'URL
const extractYouTubeId = (url: string): string | null => {
  // Ensure url is a valid string
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ url, title, className = '' }) => {
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">URL YouTube invalide</p>
        </div>
      </div>
    );
  }
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  
  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        title={title || 'Vidéo de la propriété'}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubePlayer;
