import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './components/App/App';
import { BrowserRouter as Router } from 'react-router-dom';

import './i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  //<React.StrictMode>
  <Router>
    <App />
  </Router>
  //</React.StrictMode>
);
