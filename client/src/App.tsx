import React from 'react'
import { Router } from 'wouter'
import Home from './components/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Home />
      </div>
    </Router>
  )
}

export default App