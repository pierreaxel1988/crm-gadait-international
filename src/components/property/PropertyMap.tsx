import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

// Fix pour les icônes Leaflet dans le build
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  location?: string;
  country?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  latitude?: number;
  longitude?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ location, country, coordinates, latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  // Use coordinates from props (either as array or separate lat/lng), fallback to default
  const defaultCoords: [number, number] = [45.4000, 6.5667]; // Méribel, France [lat, lng] for Leaflet
  let mapCoords: [number, number];
  
  if (coordinates) {
    mapCoords = [coordinates[1], coordinates[0]]; // Convert [lng, lat] to [lat, lng] for Leaflet
  } else if (latitude && longitude) {
    mapCoords = [latitude, longitude]; // Leaflet uses [lat, lng] format
  } else {
    mapCoords = defaultCoords;
  }

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: false,
      touchZoom: false
    }).setView(mapCoords, 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add marker
    const marker = L.marker(mapCoords).addTo(map.current);
    
    // Add popup with location info
    if (location || country) {
      marker.bindPopup(`
        <div style="padding: 8px; font-size: 14px; color: #374151;">
          ${location ? `${location}, ` : ''}${country || 'Location'}
        </div>
      `).openPopup();
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapCoords, location, country]);

  return (
    <Card className="mb-8">
      <CardContent className="p-0 relative">
        <div 
          ref={mapContainer} 
          className="h-80 w-full rounded-lg relative overflow-hidden"
          style={{ minHeight: '320px' }}
        />
        {location && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-loro-navy">
              {location}, {country}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyMap;