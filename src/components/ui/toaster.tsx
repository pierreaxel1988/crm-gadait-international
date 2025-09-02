import { useToast } from "@/components/ui/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
  const {
    toasts
  } = useToast();

  // Use the actual toasts but set a shorter display duration
  return <ToastProvider>
      {toasts.map(function ({
      id,
      title,
      description,
      action,
      ...props
    }) {
      return;
    })}
      <ToastViewport />
    </ToastProvider>;
}