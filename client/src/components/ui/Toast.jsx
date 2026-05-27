import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
        success: {
          iconTheme: {
            primary: '#4CAF50',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#E53935',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default Toast;