import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { PdfProvider } from './Context/PdfContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>   
      <PdfProvider>
        <App />
      </PdfProvider>
    </BrowserRouter>
  </React.StrictMode>
);
