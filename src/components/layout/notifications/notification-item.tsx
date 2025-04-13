'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  status?: 'read' | 'unread';
}

export function NotificationItem({
  icon,
  title,
  description,
  time,
  status = 'read'
}: NotificationItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
      status === 'unread' && "bg-muted/30"
    )}>
      <div className="mt-1 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm font-medium leading-none",
            status === 'unread' && "font-semibold"
          )}>
            {title}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
            {time}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      {status === 'unread' && (
        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </div>
  );
}
