
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour la gestion des redirections
export function getRedirectPath(location: Location, defaultPath: string = '/pipeline'): string {
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirectTo');
  return redirectTo ? decodeURIComponent(redirectTo) : defaultPath;
}
