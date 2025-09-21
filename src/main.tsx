
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Load migration scripts in development
if (import.meta.env.DEV) {
  import('./scripts/migrateLocationData');
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

// Temporarily disable StrictMode in development to prevent auth conflicts
const isDevelopment = import.meta.env.DEV;

root.render(
  isDevelopment ? <App /> : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
