import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import DashboardPage from './screens/DashboardPage';
import AppNav from './AppNav';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppNav />
    </BrowserRouter>
  </React.StrictMode>
);
