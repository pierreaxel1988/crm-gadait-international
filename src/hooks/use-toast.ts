
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"

import {
  useToast as useToastShadcn,
} from "@/components/ui/use-toast"

export type { ToastProps, ToastActionElement }

export const useToast = useToastShadcn;

export const toast = useToastShadcn().toast;
