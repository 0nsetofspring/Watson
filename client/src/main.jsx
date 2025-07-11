// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. BrowserRouter를 여기서 불러옵니다.
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core'; // 2. MantineProvider를 여기서 불러옵니다.
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <MantineProvider>
            <GoogleOAuthProvider clientId="835633006030-ie1vu2c7jgmkuqejmgt3gqf3dhekq03m.apps.googleusercontent.com">
            <AuthProvider>
                <BrowserRouter>
                <App />
                </BrowserRouter>
            </AuthProvider>
            </GoogleOAuthProvider>
        </MantineProvider>
  </React.StrictMode>
);