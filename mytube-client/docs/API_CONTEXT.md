# MyTube API Context

Reference for the MyTube backend API consumed by the React client.

## Base Configuration

| Setting | Value |
|---------|-------|
| Base URL | `http://localhost:5000` |
| API prefix | `/api/v1/` |
| Auth | JWT access token (Bearer header) + httpOnly cookies |
| CORS | `credentials: true` required on client |

## Response Format

All successful responses follow this shape:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": []
}
```

## Authentication Flow

1. **Register** — `POST /api/v1/users/register` (multipart: avatar, coverImage required)
2. **Login** — `POST /api/v1/users/login` → returns `{ user, accessToken, refreshToken }` + sets httpOnly cookies
3. **Protected routes** — send `Authorization: Bearer <accessToken>` header
4. **Refresh** — `POST /api/v1/users/refresh-token` (uses refreshToken cookie) → returns new `accessToken`
5. **Logout** — `POST /api/v1/users/logout` (requires auth)

### Login Body

```json
{
  "email": "user@example.com",
  "username": "optional-if-email-provided",
  "password": "password"
}
```

Either `email` or `username` is required with `password`.

---

## Endpoints

### Users — `/api/v1/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register new user (multipart) |
| POST | `/login` | No | Login user |
| POST | `/logout` | Yes | Logout user |
| POST | `/refresh-token` | Cookie | Refresh access token |
| POST | `/change-password` | Yes | Change password |
| GET | `/current-user` | Yes | Get logged-in user |
| PATCH | `/update-account` | Yes | Update account details |
| PATCH | `/avatar` | Yes | Update avatar (multipart) |
| PATCH | `/cover-image` | Yes | Update cover image (multipart) |
| GET | `/c/:username` | Yes | Get channel profile |
| GET | `/history` | Yes | Get watch history |

### Videos — `/api/v1/videos`

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get all videos (paginated) |
| POST | `/` | Upload video (multipart: videoFile, thumbnail) |
| GET | `/:videoId` | Get video by ID |
| PATCH | `/:videoId` | Update video (optional thumbnail) |
| DELETE | `/:videoId` | Delete video |
| PATCH | `/toggle/publish/:videoId` | Toggle publish status |

### Comments — `/api/v1/comments`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:videoId` | Get video comments |
| POST | `/:videoId` | Add comment |
| PATCH | `/c/:commentId` | Update comment |
| DELETE | `/c/:commentId` | Delete comment |

### Likes — `/api/v1/likes`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/toggle/v/:videoId` | Toggle video like |
| POST | `/toggle/c/:commentId` | Toggle comment like |
| POST | `/toggle/t/:tweetId` | Toggle tweet like |
| GET | `/videos` | Get liked videos |

### Subscriptions — `/api/v1/subscriptions`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/c/:channelId` | Toggle subscription |
| GET | `/c/:channelId` | Get channel subscribers |
| GET | `/u/:subscriberId` | Get subscribed channels |

### Playlists — `/api/v1/playlist`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create playlist |
| GET | `/:playlistId` | Get playlist by ID |
| PATCH | `/:playlistId` | Update playlist |
| DELETE | `/:playlistId` | Delete playlist |
| PATCH | `/add/:videoId/:playlistId` | Add video to playlist |
| PATCH | `/remove/:videoId/:playlistId` | Remove video from playlist |
| GET | `/user/:userId` | Get user playlists |

### Tweets — `/api/v1/tweets`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create tweet |
| GET | `/user/:userId` | Get user tweets |
| PATCH | `/:tweetId` | Update tweet |
| DELETE | `/:tweetId` | Delete tweet |

### Dashboard — `/api/v1/dashboard`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Channel statistics |
| GET | `/videos` | Channel videos |

### Health — `/api/v1/healthcheck`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API health status |

---

## Client API Module Mapping

| Backend area | Client file |
|--------------|-------------|
| Users / Auth | `src/api/authApi.js` |
| Videos | `src/api/videoApi.js` |
| Comments | `src/api/commentApi.js` |
| Likes | `src/api/likeApi.js` |
| Subscriptions | `src/api/subscriptionApi.js` |
| Playlists | `src/api/playlistApi.js` |
| Tweets | `src/api/tweetApi.js` |
| Dashboard | `src/api/dashboardApi.js` |
| Axios config | `src/api/axiosInstance.js` |

All modules are re-exported from `src/api/index.js`.
