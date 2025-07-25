import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  location?: string;
  country?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  latitude?: number;
  longitude?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ location, country, coordinates, latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapReady, setMapReady] = useState(false);

  // Use coordinates from props (either as array or separate lat/lng), fallback to default
  const defaultCoords: [number, number] = [6.5667, 45.4000]; // Méribel, France
  let mapCoords: [number, number];
  
  if (coordinates) {
    mapCoords = coordinates;
  } else if (latitude && longitude) {
    mapCoords = [longitude, latitude]; // Mapbox uses [lng, lat] format
  } else {
    mapCoords = defaultCoords;
  }

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: mapCoords,
        zoom: 12,
        scrollZoom: false,
        dragPan: true,
        dragRotate: false,
        doubleClickZoom: false,
        touchZoomRotate: false
      });

      // Add marker
      new mapboxgl.Marker({
        color: '#2563eb'
      })
        .setLngLat(mapCoords)
        .addTo(map.current);

      // Add popup with location info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      })
        .setLngLat(mapCoords)
        .setHTML(`
          <div style="padding: 8px; font-size: 14px; color: #374151;">
            ${location ? `${location}, ` : ''}${country || 'Location'}
          </div>
        `)
        .addTo(map.current);

      map.current.on('load', () => {
        setMapReady(true);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!mapboxToken.trim()) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-loro-navy/30 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-loro-navy mb-2">
                Configure Mapbox to view location
              </h3>
              <p className="text-sm text-loro-navy/60 mb-4">
                Enter your Mapbox public token to display the property location on a map.
                Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <Input
                  type="text"
                  placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIs..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="text-sm"
                />
                <Button 
                  onClick={initializeMap}
                  disabled={!mapboxToken.trim()}
                  className="w-full"
                >
                  Load Map
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-0">
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