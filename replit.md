# SeaBoo - React + Express Full-Stack Application

## Overview
SeaBoo is a full-stack web application built with React frontend and Express backend, originally designed for iOS deployment using Capacitor. This project has been successfully imported and configured to run in the Replit environment.

## Project Structure
- **client/**: React frontend application with TypeScript and Tailwind CSS
- **server/**: Express backend server with TypeScript
- **shared/**: Shared types and utilities between frontend and backend
- **attached_assets/**: Static assets and media files

## Development Setup
- **Frontend**: Vite dev server running on port 5000 (0.0.0.0)
- **Backend**: Express server (when needed) on port 3001
- **Build System**: Vite for frontend, esbuild for backend
- **Styling**: Tailwind CSS with Radix UI components

## Key Configuration
- Vite configured with `allowedHosts: ["all"]` for Replit proxy support
- Host set to `0.0.0.0:5000` for frontend visibility in Replit
- Full TypeScript support across the stack
- Drizzle ORM for database integration

## Available Scripts
- `npm run dev:frontend`: Start Vite development server (port 5000)
- `npm run dev`: Start Express backend server (port 3001)
- `npm run build`: Build for production
- `npm run start`: Start production server

## Deployment
Configured for autoscale deployment with:
- Build command: `npm run build`
- Start command: `npm start`

## Recent Changes
- **2025-09-24**: Initial project import and setup
- Created missing project structure (client/, server/, shared/)
- Configured Vite for Replit environment compatibility
- Set up frontend workflow on port 5000
- Added deployment configuration for production

## Dependencies
The project includes comprehensive dependencies for:
- React 18 with TypeScript
- Express server with session management
- Database integration (Drizzle ORM + Neon)
- Payment processing (Stripe)
- UI components (Radix UI)
- Styling (Tailwind CSS)
- iOS support (Capacitor)

## Architecture
This is a monorepo structure where the client and server are part of the same project, with shared TypeScript types and utilities. The build process creates a production bundle that serves the React app through the Express server.