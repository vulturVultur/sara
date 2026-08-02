import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SaraSite from './SaraSite.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SaraSite />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
