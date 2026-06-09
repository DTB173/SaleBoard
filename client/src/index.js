import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing REACT_APP_CLERK_PUBLISHABLE_KEY in .env");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        layout: { socialButtonsVariant: "iconButton" }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

reportWebVitals();