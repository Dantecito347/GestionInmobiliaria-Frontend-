import { z } from "zod";

export const notificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string()
});

const API_URL = "http://localhost:8080/api/notificaciones";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchNotifications = async (idUsuario) => {
  const userId = idUsuario || localStorage.getItem("userId") || 1;

  const response = await fetch(`${API_URL}/usuario/${userId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Error al obtener notificaciones");
  return await response.json();
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_URL}/${id}/leer`, {
    method: "PUT",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Error al marcar la notificación como leída");
  return await response.json();
};

export const markAllNotificationsAsRead = async (idUsuario) => {
  const userId = idUsuario || localStorage.getItem("userId") || 1;

  const response = await fetch(`${API_URL}/usuario/${userId}/leer-todas`, {
    method: "PUT",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Error al marcar todas las notificaciones como leídas");
  return await response.json();
};