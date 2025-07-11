import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';

// CSS Imports
import './index.css'; // 요청하신 index.css 파일
import '@mantine/core/styles.css'; // Mantine UI 라이브러리 스타일

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
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