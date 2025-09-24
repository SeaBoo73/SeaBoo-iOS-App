import React from 'react'
import { Router, Route } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './components/header'
import { Footer } from './components/footer'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// Homepage component
function HomePage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Benvenuto su SeaBoo</h1>
          <p className="text-xl opacity-90">La piattaforma leader per noleggio barche in Italia</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🛥️ Esplora</h3>
            <p className="text-gray-600">Scopri yacht, catamarani e gommoni disponibili</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">✨ Esperienze</h3>
            <p className="text-gray-600">Vivi esperienze uniche in mare</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">⚓ Ormeggio</h3>
            <p className="text-gray-600">Trova il posto barca perfetto</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Route path="/" component={HomePage} />
            <Route path="/esperienze">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Esperienze</h1>
                <p className="mt-4">Sezione esperienze in arrivo...</p>
              </div>
            </Route>
            <Route path="/ormeggio">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Ormeggio</h1>
                <p className="mt-4">Sezione ormeggio in arrivo...</p>
              </div>
            </Route>
            <Route path="/ia">
              <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Assistente AI</h1>
                <p className="mt-4">Assistente AI in arrivo...</p>
              </div>
            </Route>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App