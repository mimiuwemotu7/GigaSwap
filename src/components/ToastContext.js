import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', opts = {}) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const toast = { id, message, type, ...opts };
    setToasts((s) => [...s, toast]);
    if (!opts.sticky) {
      const timeout = opts.duration || 4000;
      setTimeout(() => {
        setToasts((s) => s.filter((t) => t.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => setToasts((s) => s.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div key={t.id} role="status" style={{ marginBottom: 8, minWidth: 220 }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
              background: t.type === 'error' ? '#6b0f0f' : t.type === 'success' ? '#064e3b' : '#111827',
              color: 'white',
              fontSize: 13
            }}>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
