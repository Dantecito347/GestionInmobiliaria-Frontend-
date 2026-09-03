import React, { createContext, useContext, useState, useEffect } from 'react';
// Importamos directamente las funciones nombradas del servicio
import { fetchNotifications, markNotificationAsRead } from '../services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Consulta periódica cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Adaptado a la propiedad 'isRead' que definiste en tu esquema de Zod
  const unreadCount = notifications.filter((n) => !n.isRead && !n.leida).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, leida: true } : n))
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const clearToast = () => setToast(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead: handleMarkAsRead,
        toast,
        clearToast,
        showToast,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext debe usarse dentro de NotificationProvider');
  }
  return context;
};