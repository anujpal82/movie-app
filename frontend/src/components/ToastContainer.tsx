import React, { useState, useCallback } from "react";
import Toast from "./Toast";
import { AlertState } from "../types/auth";

interface ToastContainerProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  position = "top-right",
}) => {
  const [toasts, setToasts] = useState<AlertState[]>([]);

  const addToast = useCallback((toast: Omit<AlertState, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast method globally
  React.useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, [addToast]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 80}px)`,
          }}
        >
          <Toast toast={toast} onRemove={removeToast} position={position} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
