'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function PageContainer({ 
  children, 
  className,
  title,
  subtitle
}: PageContainerProps) {
  return (
    <div className={cn("px-4 py-4 w-full max-w-full", className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <motion.h1 
              className="text-3xl font-bold text-foreground tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p 
              className="text-muted-foreground mt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
