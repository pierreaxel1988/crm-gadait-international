
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Ajouter les classes CSS nécessaires à l'élément racine
const rootElement = document.getElementById("root")!;
rootElement.classList.add('h-full');
document.documentElement.classList.add('h-full');
document.body.classList.add('h-full', 'bg-[#0A2540]');

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
