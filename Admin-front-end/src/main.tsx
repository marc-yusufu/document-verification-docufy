import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import App from './App';
import './index.css';
import "@radix-ui/themes/styles.css";
import { UserProvider } from "../src/context/UserContext";


import DashboardPage from './screens/DashboardPage';
import AppNav from './AppNav';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Theme>
        <UserProvider>
          <App />
        </UserProvider>
      </Theme>

    </BrowserRouter>
  </React.StrictMode>
);
