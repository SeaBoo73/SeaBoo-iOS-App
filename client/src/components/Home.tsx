import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to SeaBoo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your iOS app is running in development mode
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-700">
            This is the SeaBoo application frontend. The app includes:
          </p>
          <ul className="list-disc list-inside mt-4 text-left max-w-md mx-auto text-gray-700">
            <li>React frontend with TypeScript</li>
            <li>Express backend server</li>
            <li>Database integration with Drizzle ORM</li>
            <li>Stripe payment integration</li>
            <li>iOS Capacitor support</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home