import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPwaCacheManager } from './lib/pwaCacheManager';

// Initialize PWA cache and background refresh guards
initPwaCacheManager();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

