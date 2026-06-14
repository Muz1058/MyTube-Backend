import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import store from './store/store.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import VideoPage from './pages/VideoPage.jsx';
import ChannelPage from './pages/ChannelPage.jsx';
import PlaylistPage from './pages/PlaylistPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import LikedVideosPage from './pages/LikedVideosPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'register', element: <RegisterPage /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'video/:videoId', element: <VideoPage /> },
              { path: 'channel/:username', element: <ChannelPage /> },
              { path: 'playlist/:playlistId', element: <PlaylistPage /> },
              { path: 'history', element: <HistoryPage /> },
              { path: 'liked-videos', element: <LikedVideosPage /> },
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'upload', element: <UploadPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
