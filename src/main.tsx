import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Предполагает, что App.tsx тоже в папке src

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL ERROR: Root element not found!");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
