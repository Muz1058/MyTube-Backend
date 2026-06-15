# MyTube Client

A modern video-sharing frontend built with React and Vite. MyTube provides video
discovery and playback, creator channels, subscriptions, comments, likes,
playlists, community posts, uploads, and a creator dashboard in a responsive
dark-themed interface.

## Live Demo

[Open MyTube](https://mytubepk.vercel.app)

## Features

- User registration, login, logout, and automatic token refresh
- Video browsing, search, playback, likes, comments, and sharing
- Channel pages with videos, subscriber counts, and community posts
- Subscribe and unsubscribe from creators
- Create playlists and add or remove videos
- Watch history and liked-video collections
- Video uploads with thumbnails and progress feedback
- Creator dashboard with channel statistics and video management
- Account, avatar, and cover-image settings
- Protected routes and persistent authentication
- Responsive YouTube-inspired dark interface

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 | User interface |
| Vite 8 | Development server and production builds |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | Global authentication, video, and UI state |
| React Router 7 | Client-side routing |
| Axios | API requests and authentication interceptors |
| React Hook Form and Zod | Form handling and validation |
| React Hot Toast | User notifications |
| Lucide React and React Icons | Icons |

## Getting Started

### Prerequisites

- Node.js
- npm
- A running MyTube API server

### Installation

1. Clone the repository and enter the client directory:

   ```bash
   git clone <repository-url>
   cd mytube-client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Set the backend URL in `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The app is served by Vite, typically at `http://localhost:5173`.

## API Configuration

The browser sends requests to same-origin `/api` paths. During development,
Vite proxies those requests to `VITE_API_BASE_URL`.

The backend must:

- Expose its API under `/api/v1`
- Allow the frontend origin through CORS
- Enable credentials for refresh-token cookies
- Support JWT access tokens in the `Authorization` header

Access tokens are stored in `localStorage`. Refresh tokens are expected to be
provided through an HTTP-only cookie. Axios automatically attempts one token
refresh after an unauthorized response and retries the original request.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Application Routes

| Route | Description |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account |
| `/` | Browse and search videos |
| `/video/:videoId` | Watch a video and interact with it |
| `/channel/:username` | View a creator channel |
| `/playlist/:playlistId` | View a playlist |
| `/history` | View watch history |
| `/liked-videos` | View liked videos |
| `/dashboard` | Manage channel videos and view statistics |
| `/upload` | Upload a video |
| `/settings` | Update account and channel images |

All routes except `/login` and `/register` require authentication.

## Project Structure

```text
src/
|-- api/          Axios instance and API modules
|-- components/   Shared layout, navigation, video, and UI components
|-- hooks/        Reusable React hooks
|-- layouts/      Authentication and main application layouts
|-- pages/        Route-level page components
|-- store/        Redux store and state slices
|-- utils/        Formatting and error helpers
|-- App.jsx       Application shell and global notifications
|-- main.jsx      Router and Redux provider setup
`-- index.css     Tailwind setup and theme styles
```

API modules are grouped by domain:

- Authentication and user profiles
- Videos and uploads
- Comments and likes
- Subscriptions
- Playlists
- Community posts
- Creator dashboard

## Production Deployment

Build the client with:

```bash
npm run build
```

The included `vercel.json`:

- Proxies `/api/*` requests to the deployed MyTube API
- Rewrites all other paths to `index.html` for React Router

Update the API destination in `vercel.json` when deploying against a different
backend.

## Additional Documentation

- [`docs/CLIENT_CONTEXT.md`](docs/CLIENT_CONTEXT.md) - frontend architecture
- [`docs/API_CONTEXT.md`](docs/API_CONTEXT.md) - expected backend API contract

## License

No license has been specified for this project.
