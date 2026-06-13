# MyTube Backend

A comprehensive video sharing platform backend built with Node.js, Express, and MongoDB. This project provides a complete API for video uploading, user management, social features, and content organization similar to YouTube.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with access/refresh tokens
- **Video Management** - Upload, view, update, delete videos with thumbnail support
- **Social Features** - Comments, likes, subscriptions, and tweets
- **Playlist Management** - Create and manage video playlists
- **Dashboard Analytics** - Channel statistics and video metrics
- **File Storage** - Cloudinary integration for media files

### API Endpoints

#### User Management
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token
- `GET /api/v1/users/current-user` - Get current user details
- `PATCH /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/avatar` - Update user avatar
- `PATCH /api/v1/users/cover-image` - Update cover image
- `GET /api/v1/users/c/:username` - Get user channel profile
- `GET /api/v1/users/history` - Get watch history

#### Video Management
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload new video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete video
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle publish status

#### Comments
- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/comments/:videoId` - Add comment to video
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

#### Likes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `POST /api/v1/likes/toggle/t/:tweetId` - Toggle tweet like
- `GET /api/v1/likes/videos` - Get liked videos

#### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/c/:channelId` - Get channel subscribers
- `GET /api/v1/subscriptions/u/:subscriberId` - Get subscribed channels

#### Playlists
- `POST /api/v1/playlist` - Create playlist
- `GET /api/v1/playlist/:playlistId` - Get playlist by ID
- `PATCH /api/v1/playlist/:playlistId` - Update playlist
- `DELETE /api/v1/playlist/:playlistId` - Delete playlist
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlist/remove/:videoId/:playlistId` - Remove video from playlist
- `GET /api/v1/playlist/user/:userId` - Get user playlists

#### Tweets
- `POST /api/v1/tweets` - Create tweet
- `GET /api/v1/tweets/user/:userId` - Get user tweets
- `PATCH /api/v1/tweets/:tweetId` - Update tweet
- `DELETE /api/v1/tweets/:tweetId` - Delete tweet

#### Dashboard
- `GET /api/v1/dashboard/stats` - Get channel statistics
- `GET /api/v1/dashboard/videos` - Get channel videos

#### Health Check
- `GET /api/v1/healthcheck` - API health status

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Password Hashing**: bcrypt
- **Environment Variables**: dotenv

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account for media storage

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mytube-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=
   MONGODB_URI=
   CORS_ORIGIN=*
   
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will run on `http://localhost:8000`

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── tweet.controller.js
│   ├── dashboard.controller.js
│   └── healthcheck.controller.js
├── models/              # Database schemas
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweet.model.js
├── routes/              # API routes
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── tweet.routes.js
│   ├── dashboard.routes.js
│   └── healthcheck.routes.js
├── middlewares/         # Custom middleware
│   ├── auth.middleware.js
│   └── multer.middleware.js
├── utils/              # Utility functions
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
├── db/                 # Database connection
│   └── index.js
├── app.js              # Express app configuration
├── index.js            # Server entry point
└── constants.js        # Application constants
```

## 🔐 Authentication

The application uses JWT-based authentication with:
- **Access Tokens**: Short-lived tokens for API requests (1 day)
- **Refresh Tokens**: Long-lived tokens for token renewal (10 days)
- **Secure Cookies**: HTTPOnly cookies for token storage

## 📊 Database Models

### User
- Authentication credentials
- Profile information (avatar, cover image)
- Watch history
- Subscription relationships

### Video
- Video file and thumbnail URLs
- Metadata (title, description, duration)
- View counts and publish status
- Owner relationship

### Comment
- Comment content
- Video and user relationships
- Timestamps

### Like
- Polymorphic likes (videos, comments, tweets)
- User relationships

### Playlist
- Playlist metadata
- Video collections
- Owner relationship

### Subscription
- Subscriber-channel relationships
- Timestamps

### Tweet
- Tweet content
- User relationship

##  Key Features Implementation

### File Upload
- Uses Multer for handling multipart/form-data
- Temporary local storage before Cloudinary upload
- Automatic cleanup of local files

### Cloud Storage
- Cloudinary integration for video and image storage
- Automatic asset deletion when content is removed
- Optimized media delivery

### Error Handling
- Custom ApiError class for consistent error responses
- Async error handling with asyncHandler wrapper
- Comprehensive validation

### Security
- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization

##  Development

### Running in Development Mode
```bash
npm run dev
```

### API Testing
Use tools like Postman or Thunder Client to test the API endpoints. Make sure to:
1. Register a user first
2. Login to get authentication tokens
3. Include Authorization header for protected routes

### Database Setup
Ensure MongoDB is running locally or provide a MongoDB Atlas connection string in the environment variables.

##  API Response Format

All API responses follow a consistent format:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (defaults to 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | Yes |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Yes |
| `ACCESS_TOKEN_EXPIRY` | Access token expiration | Yes |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Yes |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiration | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Some aggregation pipelines may need optimization for large datasets

## 🔮 Future Enhancements

- Video streaming capabilities
- Real-time notifications
- Advanced search and filtering
- Content recommendation system
- Video transcoding and multiple quality options
- Analytics dashboard
- Admin panel
- Rate limiting and API throttling

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Happy Coding! 
