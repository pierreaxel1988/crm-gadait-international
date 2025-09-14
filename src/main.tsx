
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ajouter les classes CSS nécessaires à l'élément racine
const rootElement = document.getElementById("root")!;
rootElement.classList.add('h-full');
document.documentElement.classList.add('h-full');
document.body.classList.add('h-full');

createRoot(rootElement).render(<App />);
