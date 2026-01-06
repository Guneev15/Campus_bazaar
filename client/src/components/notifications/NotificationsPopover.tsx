"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  create_at: string;
  link?: string;
}

export function NotificationsPopover() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
        fetchNotifications();
        // Poll every minute (or replace with socket event later)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
        console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id: string) => {
      try {
          await api.put(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
          console.error("Failed to mark read");
      }
  };

  const markAllRead = async () => {
      try {
          await api.put(`/notifications/read-all`);
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          setUnreadCount(0);
      } catch (err) {
          console.error("Failed to mark all read");
      }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={popoverRef}>
        <Button 
            variant="ghost" 
            size="icon" 
            className="relative rounded-full"
            onClick={() => setIsOpen(!isOpen)}
        >
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
        </Button>

        {isOpen && (
            <Card className="absolute right-0 mt-2 w-80 md:w-96 max-h-[80vh] overflow-hidden shadow-xl z-50 border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto py-1 text-xs text-primary" onClick={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="overflow-y-auto max-h-[60vh]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                                        !n.is_read ? "bg-primary/5" : ""
                                    )}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !n.is_read && "text-primary")}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        )}
    </div>
  );
}
