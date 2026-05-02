import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import { startSettingsClock } from './stores/settingsStore'

if (import.meta.env.DEV) {
  import('./testMock.ts');
}

useAuthStore.getState().hydrate();
startSettingsClock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
