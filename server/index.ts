import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist', 'public')))

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SeaBoo server is running!' })
})

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'public', 'index.html'))
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app