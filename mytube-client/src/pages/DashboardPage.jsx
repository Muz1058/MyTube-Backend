import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  Users,
  Video,
  ThumbsUp,
  Trash2,
  Edit,
  ExternalLink,
  Upload,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { getChannelStats, getChannelVideos } from '../api/dashboard.api';
import { deleteVideo, togglePublish, updateVideo } from '../api/video.api';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { formatViews, formatRelativeTime } from '../utils/helpers';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Dashboard state
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingVideo, setEditingVideo] = useState(null); // video object
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editThumbnail, setEditThumbnail] = useState(null);
  const [savingVideo, setSavingVideo] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await getChannelStats();
      const videosList = await getChannelVideos();
      setStats(statsData);
      setVideos(videosList || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle delete video
  const handleDeleteVideoClick = async (videoId) => {
    if (!window.confirm('Are you sure you want to permanently delete this video? This action cannot be undone.')) return;
    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      // Refresh stats
      const statsData = await getChannelStats();
      setStats(statsData);
      toast.success('Video deleted successfully!');
    } catch (err) {
      console.error('Delete video failed:', err);
      toast.error('Failed to delete video');
    }
  };

  // Handle toggle publish
  const handleTogglePublishClick = async (videoId) => {
    try {
      const response = await togglePublish(videoId);
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: !v.isPublished } : v))
      );
      toast.success(
        response?.isPublished || !videos.find((v) => v._id === videoId)?.isPublished
          ? 'Video published!'
          : 'Video set to private.'
      );
    } catch (err) {
      console.error('Toggle publish failed:', err);
      toast.error('Failed to update status');
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title || '');
    setEditDesc(video.description || '');
    setEditThumbnail(null);
    setEditModalOpen(true);
  };

  // Handle Save Edit Video
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) return;

    setSavingVideo(true);
    const formData = new FormData();
    formData.append('title', editTitle.trim());
    formData.append('description', editDesc.trim());
    if (editThumbnail) {
      formData.append('thumbnail', editThumbnail);
    }

    try {
      const updated = await updateVideo(editingVideo._id, formData);
      setVideos((prev) =>
        prev.map((v) => (v._id === editingVideo._id ? { ...v, ...updated } : v))
      );
      setEditModalOpen(false);
      setEditingVideo(null);
      toast.success('Video details updated successfully!');
      fetchDashboardData(); // Refreshes to sync thumbnail
    } catch (err) {
      console.error('Failed to update video details:', err);
      toast.error('Failed to update video. Check files & input details.');
    } finally {
      setSavingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <Button onClick={fetchDashboardData} className="flex items-center gap-2">
          <RefreshCw size={16} />
          Retry loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Channel dashboard</h1>
          <p className="text-xs text-text-secondary mt-0.5">Track your metrics, uploads, and video settings.</p>
        </div>
        <Button onClick={() => navigate('/upload')} className="flex items-center gap-1.5 self-start rounded-full font-bold">
          <Upload size={14} />
          <span>Upload Video</span>
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Views Card */}
        <div className="bg-bg-secondary/45 border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Views</span>
            <h3 className="text-2xl font-black text-text-primary">{formatViews(stats?.totalViews || 0).replace(' views', '')}</h3>
          </div>
          <div className="rounded-full bg-accent/10 text-accent p-3">
            <Eye size={22} />
          </div>
        </div>

        {/* Total Subscribers Card */}
        <div className="bg-bg-secondary/45 border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subscribers</span>
            <h3 className="text-2xl font-black text-text-primary">{stats?.totalSubscribers || 0}</h3>
          </div>
          <div className="rounded-full bg-accent/10 text-accent p-3">
            <Users size={22} />
          </div>
        </div>

        {/* Total Videos Card */}
        <div className="bg-bg-secondary/45 border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Videos</span>
            <h3 className="text-2xl font-black text-text-primary">{stats?.totalVideos || 0}</h3>
          </div>
          <div className="rounded-full bg-accent/10 text-accent p-3">
            <Video size={22} />
          </div>
        </div>

        {/* Total Likes Card */}
        <div className="bg-bg-secondary/45 border border-border/50 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Likes Count</span>
            <h3 className="text-2xl font-black text-text-primary">{stats?.totalLikes || 0}</h3>
          </div>
          <div className="rounded-full bg-accent/10 text-accent p-3">
            <ThumbsUp size={22} />
          </div>
        </div>
      </div>

      {/* Videos List table container */}
      <div className="bg-bg-secondary/25 border border-border/50 rounded-xl overflow-hidden shadow-md">
        <div className="border-b border-border/60 p-4 bg-bg-secondary/45">
          <h2 className="text-sm font-bold text-text-primary">Uploaded Content</h2>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Video size={36} className="text-text-muted mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-text-primary">No uploads found</h4>
            <p className="text-xs text-text-secondary mt-0.5 mb-4">You have not uploaded any videos yet.</p>
            <Button onClick={() => navigate('/upload')} size="sm" className="rounded-full">
              Upload first video
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50 text-text-secondary font-bold bg-bg-secondary/15">
                  <th className="p-4 font-bold">Video</th>
                  <th className="p-4 font-bold">Visibility</th>
                  <th className="p-4 font-bold">Views</th>
                  <th className="p-4 font-bold">Date Uploaded</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {videos.map((vid) => (
                  <tr key={vid._id} className="hover:bg-bg-secondary/35 transition-colors">
                    {/* Video Title and thumbnail */}
                    <td className="p-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-bg-tertiary border border-border/50">
                          <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-text-primary line-clamp-2 leading-snug">
                          {vid.title}
                        </span>
                      </div>
                    </td>

                    {/* Visibility status */}
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublishClick(vid._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase cursor-pointer border ${
                          vid.isPublished
                            ? 'bg-green-500/10 border-green-500/35 text-green-500 hover:bg-green-500/20'
                            : 'bg-yellow-500/10 border-yellow-500/35 text-yellow-500 hover:bg-yellow-500/20'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${vid.isPublished ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                        <span>{vid.isPublished ? 'Published' : 'Private'}</span>
                      </button>
                    </td>

                    {/* Views */}
                    <td className="p-4 font-semibold text-text-secondary">
                      {vid.views || 0} views
                    </td>

                    {/* Date */}
                    <td className="p-4 font-semibold text-text-muted">
                      {new Date(vid.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Play link */}
                        <button
                          onClick={() => navigate(`/video/${vid._id}`)}
                          className="p-2 text-text-secondary hover:text-accent rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                          title="View on site"
                        >
                          <ExternalLink size={15} />
                        </button>
                        {/* Edit details */}
                        <button
                          onClick={() => handleOpenEditModal(vid)}
                          className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer"
                          title="Edit details"
                        >
                          <Edit size={15} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteVideoClick(vid._id)}
                          className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete video"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video details modal */}
      {editModalOpen && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Video details">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-secondary">Title</label>
              <Input
                type="text"
                placeholder="Video title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-secondary">Description</label>
              <Textarea
                placeholder="Video description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
                className="w-full text-xs min-h-[5rem]"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-text-secondary">Thumbnail image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setEditThumbnail(e.target.files?.[0] || null)}
                className="w-full text-xs file:mr-4 file:rounded-md file:border-0 file:bg-bg-tertiary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-bg-hover cursor-pointer"
              />
              <p className="text-[10px] text-text-muted">Upload a new image file to replace the current thumbnail.</p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(false)}
                className="rounded-full text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={savingVideo}
                className="rounded-full text-xs font-bold px-4"
              >
                {savingVideo ? 'Saving...' : 'Save details'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
