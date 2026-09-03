import { useState } from "react";

export function NotificationBell({ notifications = [], unreadCount = 0, onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false);

  // Formateador seguro para evitar "Invalid Date"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -5,
            right: -5,
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "0.75rem",
            fontWeight: "bold"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "100%",
          width: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          zIndex: 1000,
          color: "#000"
        }}>
          <div style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold" }}>
            Notificaciones
          </div>
          
          {notifications.length === 0 ? (
            <div style={{ padding: "15px", textAlign: "center", color: "#666" }}>
              No hay notificaciones
            </div>
          ) : (
            notifications.map((n) => {
              // Mapeo seguro con prioridad para campos de Spring Boot
              const isRead = n.leida ?? n.isRead ?? false;
              const text = n.mensaje || n.message || "Nueva notificación";
              const formattedDate = formatDate(n.fechaCreacion || n.fecha || n.createdAt);

              return (
                <div
                  key={n.id}
                  onClick={() => !isRead && onMarkAsRead(n.id)}
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #eee",
                    backgroundColor: isRead ? "#fff" : "#eef6ff",
                    cursor: isRead ? "default" : "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  <p style={{ margin: 0, fontWeight: isRead ? "normal" : "bold" }}>
                    {text}
                  </p>
                  {formattedDate && (
                    <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
                      {formattedDate}
                    </small>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}