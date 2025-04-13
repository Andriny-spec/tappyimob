'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme="light"
      toastOptions={{
        classNames: {
          toast: 'group py-2 pe-2 flex items-center gap-1 w-full overflow-hidden shadow-md',
          success: 'bg-green-50 border-l-4 border-green-600 text-green-700',
          error: 'bg-red-50 border-l-4 border-red-600 text-red-700',
          warning: 'bg-amber-50 border-l-4 border-amber-600 text-amber-700',
          info: 'bg-blue-50 border-l-4 border-blue-600 text-blue-700',
        },
      }}
    />
  );
}
