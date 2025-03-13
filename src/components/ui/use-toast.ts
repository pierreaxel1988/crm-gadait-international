
// Ce fichier exporte les fonctions du hook de toast
// pour maintenir la rétrocompatibilité avec l'ancienne structure
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Re-export des types nécessaires
export type {
  ToastProps,
  ToastActionElement
} from "@/components/ui/toast";
