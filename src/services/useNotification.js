import { useState, useEffect, useCallback } from "react";
import { notificationSchema, fetchNotifications, markNotificationAsRead } from "./notificationService";

export function useNotifications(wsUrl) {
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setNotifications(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const newNotification = notificationSchema.parse(rawData);

        setNotifications((prev) => [newNotification, ...prev]);
        setToast(newNotification);
      } catch (error) {
        console.error("Estructura de notificación no válida:", error);
      }
    };

    return () => socket.close();
  }, [wsUrl]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    toast,
    clearToast: () => setToast(null)
  };
}