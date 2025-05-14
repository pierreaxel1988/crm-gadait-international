
// Re-export the toast hooks and types from the central location
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Re-export des types nécessaires
export type {
  ToastProps,
  ToastActionElement
} from "@/components/ui/toast";
