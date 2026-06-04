import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PayPalScriptProvider options={{ 
      clientId: "AbGWxqETVsHJTa4NI2mm4Zb12XvXv1qtn6Lx6ojLTntbzG4KznD_PGxNkGH88P9VbJZ5GvhafFzWuD9K",
      vault: true,
      intent: "subscription"
    }}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
);
