'use client';

import { toast as sonnerToast } from 'sonner';

// Tipos de toast para tipagem forte
type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
};

// Função de wrapper para o toast
export function toast({
  title,
  description,
  duration = 3000,
}: ToastProps) {
  return sonnerToast(title, {
    description,
    duration,
  });
}

// Outros tipos de toast para casos específicos
toast.success = ({ title, description, duration }: ToastProps) => {
  return sonnerToast.success(title, { description, duration });
};

toast.error = ({ title, description, duration }: ToastProps) => {
  return sonnerToast.error(title, { description, duration });
};

toast.warning = ({ title, description, duration }: ToastProps) => {
  return sonnerToast.warning(title, { description, duration });
};

toast.info = ({ title, description, duration }: ToastProps) => {
  return sonnerToast.info(title, { description, duration });
};

// Hook para usar o toast
export function useToast() {
  return { toast };
}
