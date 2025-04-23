
import { 
  Droplets, Bath, Home, Camera, Car, Fan, Bed, Sofa, 
  Clock, DoorClosed, FileText, ClipboardCheck, Send, 
  FileSearch, Users, Building, Star, Compass, Settings,
  MapPin, Search, Navigation, Map, LocateIcon
} from 'lucide-react';

export const AllowedIcons = {
  Droplets,
  Bath,
  Home,
  Camera,
  Car,
  Fan,
  Bed,
  Sofa,
  Clock,
  DoorClosed,
  FileText,
  ClipboardCheck,
  Send,
  FileSearch,
  Users,
  Building,
  Star,
  Compass,
  Settings,
  MapPin,
  Search,
  Navigation,
  Map,
  Location: LocateIcon  // Use LocateIcon instead of the non-existent Location
};

export type AllowedIconName = keyof typeof AllowedIcons;

export const getIcon = (iconName: AllowedIconName) => {
  return AllowedIcons[iconName];
};

