import { createRoot } from 'react-dom/client'
import "./index.css"
import App from './App.tsx'
import { HashRouter } from 'react-router'

// Telegram appends its init data to the hash (e.g. #/tgWebAppData=...).
// Strip it so React Router sees a clean path.
if (window.location.hash.includes('tgWebAppData')) {
  window.history.replaceState(null, '', window.location.pathname + '#/')
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
