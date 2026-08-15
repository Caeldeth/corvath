import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { installRendererErrorForwarding } from './reportErrors'
import './assets/main.css'

// At module scope, OUTSIDE React: `<React.StrictMode>` double-invokes effects, so
// an install from inside a component would register two listeners and file every
// renderer error twice.
installRendererErrorForwarding()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Outside <App>, deliberately. A render error unmounts the themed tree, so a
        fallback mounted inside that tree would be rendered by the thing that just
        failed. This one renders on MUI's default theme and is reliably present. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
