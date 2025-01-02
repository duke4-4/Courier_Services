import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './src/App.jsx'
import './src/assets/main.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
