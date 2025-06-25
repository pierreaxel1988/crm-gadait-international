
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  Home, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ZoomIn
} from 'lucide-react';

interface PropertyGalleryProps {
  title: string;
  images: string[];
  mainImage?: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ 
  title, 
  images, 
  mainImage 
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Combine main image with other images, filter out empty values
  const allImages = mainImage 
    ? [mainImage, ...images].filter(Boolean)
    : images.filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (allImages.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video bg-gradient-to-br from-loro-pearl to-loro-white flex items-center justify-center">
            <Home className="h-16 w-16 text-loro-navy/30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Image principale avec overlay */}
          <div className="relative group">
            <div className="aspect-video overflow-hidden">
              <img
                src={allImages[0]}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                onClick={() => openLightbox(0)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Overlay avec bouton zoom */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-white/90 hover:bg-white text-loro-navy"
                onClick={() => openLightbox(0)}
              >
                <ZoomIn className="h-5 w-5 mr-2" />
                Voir toutes les photos
              </Button>
            </div>
            
            {/* Badge nombre de photos */}
            {allImages.length > 1 && (
              <Badge 
                className="absolute top-4 right-4 bg-black/70 text-white hover:bg-black/80"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                {allImages.length} photos
              </Badge>
            )}
          </div>
          
          {/* Miniatures carousel */}
          {allImages.length > 1 && (
            <div className="p-4">
              <Carousel
                opts={{
                  align: "start",
                  slidesToScroll: 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {allImages.slice(0, 8).map((image, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/6 md:basis-1/8">
                      <button
                        onClick={() => openLightbox(index)}
                        className="w-full aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-loro-sand transition-all duration-200 group"
                      >
                        <img
                          src={image}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              {allImages.length > 8 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  +{allImages.length - 8} photos supplémentaires
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Zone de clic gauche pour navigation précédente */}
            {allImages.length > 1 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-start pl-4"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8 text-white/50 opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </div>
            )}
            
            {/* Zone de clic droite pour navigation suivante */}
            {allImages.length > 1 && (
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/4 z-40 cursor-pointer flex items-center justify-end pr-4"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8 text-white/50 opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </div>
            )}
            
            {/* Navigation précédent (bouton visible) */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
            
            {/* Image principale */}
            <div className="relative max-w-full max-h-full flex items-center justify-center p-8">
              <img
                src={allImages[lightboxIndex]}
                alt={`${title} - Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Navigation suivant (bouton visible) */}
            {allImages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
            
            {/* Indicateur de position */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {lightboxIndex + 1} / {allImages.length}
                </Badge>
              </div>
            )}
            
            {/* Miniatures en bas */}
            {allImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-md">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setLightboxIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                        index === lightboxIndex 
                          ? 'border-loro-sand scale-110' 
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyGallery;
