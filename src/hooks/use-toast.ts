
// Import the useToast hook from the UI component
import { useToast as useToastShadcn, toast as toastShadcn } from "@/components/ui/use-toast";
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";

// Export types
export type { ToastProps, ToastActionElement, Toast };

// Export the hook and the toast function
export const useToast = useToastShadcn;
export const toast = toastShadcn;
