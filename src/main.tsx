import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from './context/ModalContext.tsx';
import { TransactionsProvider } from './context/TransactionsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TransactionsProvider>
          <ModalProvider>
            <App />
            <Toaster
              position="bottom-center"
              toastOptions={{
                className: 'dark:bg-dark-secondary dark:text-white bg-light-secondary text-light-text',
              }}
            />
          </ModalProvider>
        </TransactionsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
