import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/public/service-worker.js')
    .then(registration => {
      console.log('Service Worker registrado com sucesso:', registration);
    })
    .catch(error => {
      console.log('Erro ao registrar o Service Worker:', error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
