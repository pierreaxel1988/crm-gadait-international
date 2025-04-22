
import { Droplets, Bath } from 'lucide-react';

export const AllowedIcons = {
  Droplets,
  Bath
};

export type AllowedIconName = keyof typeof AllowedIcons;

export const getIcon = (iconName: AllowedIconName) => {
  return AllowedIcons[iconName];
};
