
import { Droplets, Bath, Home, Camera, Car, Fan, Bed, Sofa, Clock, DoorClosed, FileText, ClipboardCheck, Send, FileSearch, Users } from 'lucide-react';

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
  Users
};

export type AllowedIconName = keyof typeof AllowedIcons;

export const getIcon = (iconName: AllowedIconName) => {
  return AllowedIcons[iconName];
};

// Ajouter des constantes pour les icônes manquantes (Building, Building2)
export const Building = Home;  // Utiliser Home comme substitut pour Building
export const Building2 = Home; // Utiliser Home comme substitut pour Building2
