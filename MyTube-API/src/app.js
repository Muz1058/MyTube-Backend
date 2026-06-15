import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//      credentials: true
//  }))
// app.use(cors({
//     origin: [
//         'http://localhost:5173',
//         'http://localhost:5174',
//         '*'
//     ]
// }));
app.use(cors({
  origin: function(origin, callback) {
    const allowed = process.env.CORS_ORIGIN?.split(',') || []
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.get('/api/v1', (req, res) => {
  res.json({ message: 'Backend working!' });
});


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

// FIX 4: Global error handler middleware
// Must be defined AFTER all routes
// Catches any error thrown via next(err) or throw inside asyncHandler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
 
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    // Only expose stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app }