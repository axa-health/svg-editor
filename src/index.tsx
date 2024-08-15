import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<App />);
} else {
  alert('#root not found'); // eslint-disable-line
}
