import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SaraSite from './SaraSite.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SaraSite />
  </StrictMode>
);
