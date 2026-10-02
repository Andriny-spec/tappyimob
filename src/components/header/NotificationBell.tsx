"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiNotification3Line,
  RiCheckDoubleLine,
  RiHome4Line,
  RiUser3Line,
  RiFileList3Line,
  RiCalendarLine,
  RiAlarmWarningLine,
  RiTimeLine,
} from "react-icons/ri";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; bgClass: string; textClass: string }> = {
  task_reminder: { icon: RiCalendarLine, bgClass: "bg-amber-100 dark:bg-amber-500/20", textClass: "text-amber-600 dark:text-amber-400" },
  new_property: { icon: RiHome4Line, bgClass: "bg-green-100 dark:bg-green-500/20", textClass: "text-green-600 dark:text-green-400" },
  suspension_expired: { icon: RiAlarmWarningLine, bgClass: "bg-red-100 dark:bg-red-500/20", textClass: "text-red-600 dark:text-red-400" },
  lead_assigned: { icon: RiUser3Line, bgClass: "bg-blue-100 dark:bg-blue-500/20", textClass: "text-blue-600 dark:text-blue-400" },
  lead_queue: { icon: RiUser3Line, bgClass: "bg-purple-100 dark:bg-purple-500/20", textClass: "text-purple-600 dark:text-purple-400" },
  new_lead: { icon: RiUser3Line, bgClass: "bg-orange-100 dark:bg-orange-500/20", textClass: "text-orange-600 dark:text-orange-400" },
  new_proposal: { icon: RiFileList3Line, bgClass: "bg-emerald-100 dark:bg-emerald-500/20", textClass: "text-emerald-600 dark:text-emerald-400" },
  lead_followup: { icon: RiUser3Line, bgClass: "bg-amber-100 dark:bg-amber-500/20", textClass: "text-amber-600 dark:text-amber-400" },
  system: { icon: RiFileList3Line, bgClass: "bg-neutral-100 dark:bg-neutral-500/20", textClass: "text-neutral-600 dark:text-neutral-400" },
};

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      // Silent fail
    }
  };

  const handleClickNotification = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch("/api/admin/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Notificações"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RiNotification3Line className="w-5 h-5" />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.7, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <RiCheckDoubleLine className="w-4 h-4" />
                    <span>Marcar todas como lidas</span>
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <RiNotification3Line className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
                    <p className="text-sm text-neutral-500">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map((notification, i) => {
                    const config = typeConfig[notification.type] || typeConfig.system;
                    const Icon = config.icon;
                    return (
                      <motion.button
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleClickNotification(notification)}
                        className={`flex gap-3 w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                          !notification.read ? "bg-orange-50/50 dark:bg-orange-500/5" : ""
                        }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgClass}`}>
                          <Icon className={`w-5 h-5 ${config.textClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-neutral-900 dark:text-white">
                              {notification.title}
                            </p>
                            <span className="flex-shrink-0 text-xs text-neutral-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-2" />
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = "/admin/notificacoes";
                    }}
                    className="w-full py-2 text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
