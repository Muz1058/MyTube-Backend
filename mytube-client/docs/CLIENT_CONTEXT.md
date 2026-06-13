# MyTube Client Context

Architecture and configuration reference for the MyTube React frontend.

## Tech Stack

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Styling (YouTube-like dark theme) |
| Redux Toolkit | Global state |
| React Router v7 | Client routing |
| Axios | HTTP client |
| react-hot-toast | Notifications |
| react-hook-form + zod | Form validation (ready to use) |
| lucide-react | Icons |

## Environment

```env
VITE_API_BASE_URL=http://localhost:5000
```

Copy `.env.example` to `.env` and adjust the port if your backend differs.

## Project Structure

```
src/
├── api/                  # Axios instance + API call functions
│   ├── axiosInstance.js  # Interceptors, base URL, credentials
│   ├── authApi.js
│   ├── videoApi.js
│   ├── commentApi.js
│   ├── likeApi.js
│   ├── subscriptionApi.js
│   ├── playlistApi.js
│   ├── tweetApi.js
│   ├── dashboardApi.js
│   └── index.js
├── components/           # Reusable UI components
│   ├── ProtectedRoute.jsx
│   ├── GuestRoute.jsx
│   └── PageHeader.jsx
├── pages/                # Route-level page components
│   ├── HomePage.jsx
│   ├── VideoPage.jsx
│   ├── ChannelPage.jsx
│   ├── PlaylistPage.jsx
│   ├── HistoryPage.jsx
│   ├── LikedVideosPage.jsx
│   ├── DashboardPage.jsx
│   ├── UploadPage.jsx
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── store/                # Redux Toolkit
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── videoSlice.js
│       └── uiSlice.js
├── hooks/
│   └── useAuth.js        # Login, register, logout, fetchCurrentUser
├── utils/
│   └── helpers.js        # formatViews, formatDuration, getErrorMessage, cn
├── layouts/
│   ├── MainLayout.jsx    # Sidebar + header for authenticated pages
│   └── AuthLayout.jsx    # Centered card for login/register
├── App.jsx               # Toaster + Outlet
├── main.jsx              # Redux Provider + RouterProvider
└── index.css             # Tailwind v4 + dark theme tokens
```

## Theme (Tailwind v4)

Defined in `src/index.css` via `@theme`:

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#0f0f0f` | Page background |
| `bg-secondary` | `#1a1a1a` | Sidebar, cards |
| `bg-tertiary` | `#212121` | Inputs, elevated surfaces |
| `bg-hover` | `#272727` | Hover states |
| `border` | `#303030` | Borders |
| `text-primary` | `#f1f1f1` | Primary text |
| `text-secondary` | `#aaaaaa` | Secondary text |
| `accent` | `#ff0000` | YouTube-red accent |

## Authentication

### Token storage

- **Access token**: `localStorage` key `accessToken` + `Authorization: Bearer` header
- **Refresh token**: httpOnly cookie (set by backend on login)

### Axios interceptors (`src/api/axiosInstance.js`)

1. **Request**: Attach `accessToken` from localStorage to `Authorization` header
2. **Response (401)**:
   - POST `/api/v1/users/refresh-token` with `withCredentials: true`
   - On success: update localStorage, retry original request
   - On failure: clear token, redirect to `/login`
   - Queues concurrent 401 requests during refresh

### Redux auth state

```js
{
  user: null,
  accessToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

Actions: `setCredentials`, `setUser`, `setLoading`, `logout`

## Redux Slices

### videoSlice

```js
{
  videos: [],
  currentVideo: null,
  isLoading: false,
  pagination: { page, limit, totalPages, totalDocs, hasNextPage, hasPrevPage }
}
```

### uiSlice

```js
{
  sidebarOpen: true,
  theme: 'dark'
}
```

## Routes

| Path | Access | Layout | Page |
|------|--------|--------|------|
| `/login` | Public (guest only) | AuthLayout | LoginPage |
| `/register` | Public (guest only) | AuthLayout | RegisterPage |
| `/` | Protected | MainLayout | HomePage |
| `/video/:videoId` | Protected | MainLayout | VideoPage |
| `/channel/:username` | Protected | MainLayout | ChannelPage |
| `/playlist/:playlistId` | Protected | MainLayout | PlaylistPage |
| `/history` | Protected | MainLayout | HistoryPage |
| `/liked-videos` | Protected | MainLayout | LikedVideosPage |
| `/dashboard` | Protected | MainLayout | DashboardPage |
| `/upload` | Protected | MainLayout | UploadPage |

Route guards:
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `GuestRoute` — redirects authenticated users away from login/register

## Toast Notifications

Configured in `App.jsx` with dark theme matching the UI palette.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Backend CORS

Ensure the backend `.env` has `CORS_ORIGIN` set to your Vite dev URL (e.g. `http://localhost:5173`) with `credentials: true` enabled in `MyTube-API/src/app.js`.
