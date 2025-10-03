# SeaBoo - React + Express Full-Stack Application

## Overview
SeaBoo is a full-stack boat rental platform built with React frontend and Express backend. The application allows users to browse and book boats, while boat owners can list their vessels and manage bookings. Originally designed for iOS deployment using Capacitor, this project has been successfully imported and configured to run in the Replit environment.

## Project Structure
- **client/**: React frontend application with TypeScript and Tailwind CSS
- **server/**: Express backend server with TypeScript
- **shared/**: Shared Drizzle schema and types between frontend and backend
- **attached_assets/**: Static assets and media files (logos, images)

## Development Setup
- **Runtime**: Node.js 20
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Frontend**: Vite dev server running on port 5000 (0.0.0.0)
- **Backend**: Integrated with frontend server (same port)
- **Build System**: Vite for frontend, esbuild for backend
- **Styling**: Tailwind CSS with Radix UI components

## Key Configuration
- Vite configured with `allowedHosts: true` for Replit proxy support
- Host set to `0.0.0.0:5000` for frontend visibility in Replit
- CORS configured to allow all origins in development mode
- Full TypeScript support across the stack
- Drizzle ORM for database management with auto-generated schemas

## Database Schema
The application uses PostgreSQL with the following main tables:
- **users**: User accounts with authentication (passwords hashed with bcrypt)
- **boats**: Boat listings with details, images, and availability
- **bookings**: Booking records linking users to boats
- **reviews**: User reviews and ratings for boats
- **analytics**: Performance metrics for boats

## Available Scripts
- `npm run dev`: Start development server (Express + Vite on port 5000)
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes to PostgreSQL

## Deployment
Configured for autoscale deployment with:
- Build command: `npm run build`
- Start command: `npm start`
- Deployment type: Autoscale (stateless)

## Recent Changes
- **2025-10-03**: GitHub import and Replit setup
  - Created PostgreSQL database and provisioned environment variables
  - Converted TypeScript interfaces to Drizzle schema with Zod validation
  - Fixed Stripe API version compatibility (using latest 2025-08-27.basil)
  - Made Stripe initialization conditional to allow app to run without API keys
  - Fixed CORS configuration to work with Replit proxy in development
  - Fixed missing image references (updated to use seaboo-logo.png)
  - Successfully configured workflow to run on port 5000 with webview output
  - Pushed database schema and verified application is running

## Dependencies
The project includes comprehensive dependencies for:
- React 18 with TypeScript
- Express server with session management (PostgreSQL session store)
- Database integration (Drizzle ORM + Neon PostgreSQL)
- Payment processing (Stripe) - optional, gracefully handles missing keys
- Authentication (bcrypt password hashing, express-session)
- UI components (Radix UI, shadcn/ui)
- Styling (Tailwind CSS)
- iOS support (Capacitor) - for future mobile deployment

## Architecture
This is a monorepo structure where the client and server are part of the same project:
- Shared TypeScript types and Drizzle schema in `/shared`
- Backend routes in `/server/routes.ts` using the storage interface
- Database operations abstracted through `/server/storage.ts`
- Vite serves both development and production builds
- In development: Vite middleware handles HMR and serves the React app
- In production: Express serves static files from the build output

## Environment Variables
The application uses the following environment variables:
- `DATABASE_URL`: PostgreSQL connection string (auto-provisioned)
- `STRIPE_SECRET_KEY`: Stripe API key (optional)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (optional)
- `SESSION_SECRET`: Session encryption key (defaults to development key)
- `NODE_ENV`: Environment mode (development/production)

## Notes
- Stripe payment integration is optional - the app will run without API keys
- CORS is permissive in development but restricted to specific domains in production
- Sessions are stored in PostgreSQL for persistence across restarts
- All images should be placed in `/attached_assets` and imported with `@assets/` prefix
