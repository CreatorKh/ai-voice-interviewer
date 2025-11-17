
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// StrictMode temporarily disabled to avoid double API calls in dev mode
// Re-enable when moving to production if needed
root.render(
  <App />
);
