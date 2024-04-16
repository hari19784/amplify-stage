import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify} from 'aws-amplify';
import  config from './aws-export'; 

Amplify.configure(config); 
reportWebVitals();
 
const container = document.getElementById('root');
const root = createRoot(container);
 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

