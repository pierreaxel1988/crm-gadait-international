
import { Droplets, Bath, Home, Camera, Car, Fan, Building, Building2, Bed, Sofa, Clock, DoorClosed, FileText, ClipboardCheck, Send, FileSearch, Users } from 'lucide-react';

export const AllowedIcons = {
  Droplets,
  Bath,
  Home,
  Camera,
  Car,
  Fan,
  Building,
  Building2,
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
