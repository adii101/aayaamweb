# Vibrant Culture Site

This repository contains a React frontend and a Node/Express backend for a comic-style cultural festival website. The backend uses MongoDB Atlas for data storage.

## Features

- User-facing event browsing, rulebook and participation links
- Admin panel for managing events and rulebook URLs
- Upload a poster image for each event and display it on the public site
- OTP-based login (phone) and password-based admin login
- In-memory OTP store with optional pepper
- Full Docker support for containerized builds

## Getting Started

### Prerequisites

- Node.js (16+)
- npm or yarn
- Supabase account and project
- **new:** `multer` is used for poster uploads; it is included in `package.json`, but if you reinstall dependencies make sure the package is present (`npm install multer`).

### Configuration

The server serves any files you upload under `/uploads` (a directory is
created automatically next to the compiled server code).  You can reference
poster paths returned by the API directly in the frontend.


1. Copy `.env.example` to `.env` and fill in the values. **Critical:**
   the `SUPABASE_KEY` **must be the service‑role key**, not the anon/publishable
   key you would use in client‑side code. Without a service key the server will
   be unable to perform inserts/updates (it will keep returning "fetch failed"
   or permission errors). You can find the service key under *Settings → API →
   Service Key* in your Supabase project; keep it secret.

   ```dotenv
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-service-role-key
   ADMIN_PHONE=70007799744
   ADMIN_PASSWORD=admin
   SESSION_SECRET=your-secret-key-change-in-production
   # OTP_SECRET=optional-otp-pepper
   ```
   For development you can use the anon key, but in production inserts/updates
   will fail if your RLS policies don’t allow them. If events are not appearing
   after you create them, double‑check that the server is using a proper service
   key and that the `events` table allows writes from that key.

2. Install dependencies:
   ```bash
   npm install
   # or yarn
   ```

### Development

- Run in dev mode (client + server with hot reload):
  ```bash
  npm run dev
  ```

> **Note:** the server defaults to port `5000`. If you get an `EADDRINUSE`
> error (`address already in use`), either stop the other process using that
> port or start the app on a different one:
>
> ```bash
> PORT=6000 npm run dev
> ```
> 
> On Windows PowerShell you can also kill the process with a utility like
> `npx kill-port 5000` or use Task Manager to free the port.

- The frontend lives under `client/` and is built with Vite.  Changes to React will refresh automatically.

### Building for Production

- To bundle client and server:
  ```bash
  npm run build
  ```

- Start server after building:
  ```bash
  npm start
  ```

### Docker

A multi-stage `Dockerfile` is provided.  To build and run containerized:

```bash
# from project root
docker build -t vibrant-culture-site .
docker run -e MONGODB_URI=... -e ADMIN_PHONE=... -e ADMIN_PASSWORD=... -e SESSION_SECRET=... -p 3000:3000 vibrant-culture-site
```

### MongoDB Collections

- The server uses MongoDB for data storage with the following collections:
  - `users` - Stores user profiles (phone, name, college, etc.)
  - `events` - Stores event details (name, date, description, rules, etc.)
  - `registrations` - Stores user event registrations with QR codes

Collections are automatically created with proper indexes when the server starts.

## Deployment

Deploy the built `dist/` directory wherever you normally host Node apps.  Typical setups include
- Docker as shown above
- Heroku/Render/Cloud Run using the `npm run build && npm start` commands

Ensure environment variables are set appropriately in the hosting environment.

## Development Notes

- Frontend routing uses `wouter`
- Styling is handled by Tailwind CSS with custom comic-themed components
- Admin protection via session cookie and passport-local

Enjoy building and customizing the festival site!
