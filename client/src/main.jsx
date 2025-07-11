import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="835633006030-ie1vu2c7jgmkuqejmgt3gqf3dhekq03m.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
