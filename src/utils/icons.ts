
import { Droplets, Bath, Home, Camera, Car, Fan, Bed, Sofa, Clock, DoorClosed, FileText, ClipboardCheck, Send, FileSearch, Users, Building, Star, Compass, Settings } from 'lucide-react';

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
  Settings
};

export type AllowedIconName = keyof typeof AllowedIcons;

export const getIcon = (iconName: AllowedIconName) => {
  return AllowedIcons[iconName];
};
