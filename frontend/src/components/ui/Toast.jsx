import React from 'react';
import { toast as hotToast, Toaster as HotToaster } from 'react-hot-toast';

export const toast = {
  success: (message, options = {}) => {
    hotToast.success(message, {
      style: {
        background: '#111827',
        color: '#F9FAFB',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#111827',
      },
      ...options,
    });
  },
  error: (message, options = {}) => {
    hotToast.error(message, {
      style: {
        background: '#111827',
        color: '#F9FAFB',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#111827',
      },
      ...options,
    });
  },
  info: (message, options = {}) => {
    hotToast(message, {
      icon: 'ℹ️',
      style: {
        background: '#111827',
        color: '#F9FAFB',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      ...options,
    });
  },
};

export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
      }}
    />
  );
};

export default toast;
