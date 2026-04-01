import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store/store';

// Polyfill for performance API if needed
if (typeof window !== 'undefined' && !window.performance) {
  window.performance = {};
}
if (typeof window !== 'undefined' && window.performance && !window.performance.clearMarks) {
  window.performance.clearMarks = function() {};
  window.performance.clearMeasures = function() {};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

