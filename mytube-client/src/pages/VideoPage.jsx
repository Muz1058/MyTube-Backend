import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ThumbsUp,
  FolderPlus,
  Share2,
  Trash2,
  Edit2,
  MessageSquare,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getVideoById,
  getAllVideos,
  getChannelProfile,
  toggleSubscription,
  toggleVideoLike,
  toggleCommentLike,
  getUserPlaylists,
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from '../api';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { formatViews, formatRelativeTime, formatDuration } from '../utils/helpers';

const VideoPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Primary video state
  const [video, setVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);

  // Channel details state (for subscription info)
  const [channelProfile, setChannelProfile] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Video Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Description toggle state
  const [descExpanded, setDescExpanded] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  // Playlist modal state
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creatingPlaylistState, setCreatingPlaylistState] = useState(false);

  // Comments Liked local cache to keep track of toggles in current session
  const [likedComments, setLikedComments] = useState(new Set());

  // Fetch video and dependent details
  const fetchVideoDetails = async () => {
    setLoadingVideo(true);
    try {
      const videoData = await getVideoById(videoId);
      setVideo(videoData);
      setIsLiked(videoData.isLiked || false);
      setLikesCount(videoData.likesCount || 0);

      // Fetch channel details for subscription count & status
      if (videoData.owner?.username) {
        const profile = await getChannelProfile(videoData.owner.username);
        setChannelProfile(profile);
        setIsSubscribed(profile.isSubscribed || false);
        setSubscribersCount(profile.subscribersCount || 0);
      }

      // Fetch related recommendations
      const recs = await getAllVideos({ limit: 10 });
      setRecommendations(recs.filter((r) => r._id !== videoId));
    } catch (err) {
      console.error('Error fetching video page details:', err);
      toast.error('Failed to load video details');
    } finally {
      setLoadingVideo(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getVideoComments(videoId, { page: 1, limit: 100 });
      setComments(response || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
      fetchComments();
    }
  }, [videoId]);

  // Handle subscribe toggle
  const handleSubscribeToggle = async () => {
    if (!video?.owner?._id) return;
    try {
      await toggleSubscription(video.owner._id);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
      toast.success(isSubscribed ? 'Unsubscribed channel' : 'Subscribed to channel!');
    } catch (err) {
      console.error('Subscription toggle failed:', err);
      toast.error('Failed to change subscription');
    }
  };

  // Handle video like toggle
  const handleLikeToggle = async () => {
    try {
      await toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error('Like toggle failed:', err);
      toast.error('Failed to save like');
    }
  };

  // Handle Add comment
  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await addComment(videoId, commentText.trim());
      // Populate owner locally
      const commentWithUserInfo = {
        ...newComment,
        owner: {
          _id: currentUser._id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
        },
      };
      setComments((prev) => [commentWithUserInfo, ...prev]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      console.error('Add comment failed:', err);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle delete comment
  const handleDeleteCommentClick = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      console.error('Delete comment failed:', err);
      toast.error('Failed to delete comment');
    }
  };

  // Handle edit comment save
  const handleEditCommentSave = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await updateComment(commentId, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: editText.trim() } : c))
      );
      setEditingCommentId(null);
      setEditText('');
      toast.success('Comment updated');
    } catch (err) {
      console.error('Update comment failed:', err);
      toast.error('Failed to update comment');
    }
  };

  // Handle comment like toggle
  const handleCommentLikeToggle = async (commentId) => {
    try {
      await toggleCommentLike(commentId);
      setLikedComments((prev) => {
        const next = new Set(prev);
        if (next.has(commentId)) {
          next.delete(commentId);
        } else {
          next.add(commentId);
        }
        return next;
      });
    } catch (err) {
      console.error('Comment like failed:', err);
    }
  };

  // Playlists management
  const handleOpenPlaylistsModal = async () => {
    setPlaylistModalOpen(true);
    setLoadingPlaylists(true);
    try {
      const data = await getUserPlaylists(currentUser._id);
      setPlaylists(data || []);
    } catch (err) {
      console.error('Failed to load playlists:', err);
      toast.error('Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  // Handle playlist checkbox toggle
  const handlePlaylistCheckboxChange = async (playlist, isChecked) => {
    try {
      if (isChecked) {
        await addVideoToPlaylist(videoId, playlist._id);
        toast.success(`Added to ${playlist.name}`);
      } else {
        await removeVideoFromPlaylist(videoId, playlist._id);
        toast.success(`Removed from ${playlist.name}`);
      }
      // Update local state
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p._id === playlist._id) {
            const updatedVideos = isChecked
              ? [...p.videos, videoId]
              : p.videos.filter((id) => id !== videoId);
            return { ...p, videos: updatedVideos };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Playlist update failed:', err);
      toast.error('Failed to update playlist');
    }
  };

  // Handle create playlist from modal
  const handleCreatePlaylistSubmit = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreatingPlaylistState(true);
    try {
      const created = await createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
      });
      // Automatically add video to this new playlist
      await addVideoToPlaylist(videoId, created._id);
      toast.success(`Created playlist "${created.name}" and added video!`);

      // Update state
      setPlaylists((prev) => [...prev, { ...created, video: [videoId] }]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
    } catch (err) {
      console.error('Failed to create playlist:', err);
      toast.error('Failed to create playlist');
    } finally {
      setCreatingPlaylistState(false);
    }
  };

  if (loadingVideo) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-text-primary">Video not found</h3>
        <p className="mt-2 text-text-secondary">This video may have been removed or set to private.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8 max-w-7xl mx-auto">
      {/* Left Column: Player and Info */}
      <div className="lg:col-span-2 space-y-4">
        {/* HTML5 Video Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-border/80 shadow-2xl">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="h-full w-full object-contain"
            poster={video.thumbnail}
          />
        </div>

        {/* Video Title */}
        <h1 className="text-xl font-bold text-text-primary leading-snug">{video.title}</h1>

        {/* Action Bar (Channel Profile info + Subscribe + Like & Save) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.owner?.username}`}>
              <Avatar
                src={video.owner?.avatar}
                alt={video.owner?.fullName || 'Avatar'}
                size="md"
                className="h-10 w-10 border border-border/60 hover:ring-2 hover:ring-accent transition-all duration-200"
              />
            </Link>
            <div className="flex flex-col min-w-0">
              <Link
                to={`/channel/${video.owner?.username}`}
                className="text-sm font-bold text-text-primary hover:text-accent transition-colors truncate"
              >
                {video.owner?.fullName || `@${video.owner?.username}`}
              </Link>
              <span className="text-xs text-text-secondary">
                {subscribersCount} subscriber{subscribersCount === 1 ? '' : 's'}
              </span>
            </div>

            {/* Subscribe Button */}
            {currentUser?._id !== video.owner?._id && (
              <Button
                variant={isSubscribed ? 'secondary' : 'accent'}
                size="sm"
                onClick={handleSubscribeToggle}
                className={`ml-4 px-4 font-bold rounded-full text-xs shadow-md transition-all active:scale-[0.98] ${
                  isSubscribed ? 'border border-border bg-bg-tertiary text-text-primary hover:bg-bg-hover' : ''
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
            )}
          </div>

          {/* Social Action buttons (Like, Save, Share) */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 rounded-full px-4 text-xs font-semibold ${
                isLiked ? 'bg-accent/15 text-accent hover:bg-accent/20 border border-accent/30' : 'bg-bg-tertiary border border-border/50 hover:bg-bg-hover'
              }`}
            >
              <ThumbsUp size={14} className={isLiked ? 'fill-accent text-accent' : ''} />
              <span>{likesCount}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenPlaylistsModal}
              className="flex items-center gap-2 bg-bg-tertiary border border-border/50 hover:bg-bg-hover rounded-full px-4 text-xs font-semibold text-text-primary"
            >
              <FolderPlus size={14} />
              <span>Save</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 bg-bg-tertiary border border-border/50 hover:bg-bg-hover rounded-full px-4 text-xs font-semibold text-text-primary"
            >
              <Share2 size={14} />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Video Description Box */}
        <div className="rounded-xl bg-bg-secondary/40 border border-border/40 p-4 hover:bg-bg-secondary/60 transition-colors">
          <div className="flex items-center gap-3 text-xs font-bold text-text-primary mb-2">
            <span>{formatViews(video.views || 0)}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted"></span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
          <p
            className={`text-sm text-text-secondary whitespace-pre-line leading-relaxed break-words ${
              descExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {video.description}
          </p>
          {video.description?.length > 150 && (
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="mt-2 text-xs font-bold text-text-primary hover:text-accent transition-colors cursor-pointer"
            >
              {descExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-base font-bold text-text-primary">
            <MessageSquare size={18} />
            <h2>
              Comments <span className="text-sm font-medium text-text-secondary">({comments.length})</span>
            </h2>
          </div>

          {/* New Comment Form */}
          <form onSubmit={handleAddCommentSubmit} className="flex gap-3">
            <Avatar src={currentUser?.avatar} alt={currentUser?.username} size="sm" className="h-9 w-9 shrink-0" />
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a public comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-bg-primary border border-border/70 focus:border-accent text-sm rounded-xl py-2 px-3 min-h-[4rem]"
              />
              <div className="flex justify-end gap-2">
                {commentText.trim() && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCommentText('')}
                    className="rounded-full text-xs font-bold px-3 py-1.5"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={!commentText.trim() || submittingComment}
                  className="rounded-full text-xs font-bold px-4 py-1.5"
                >
                  {submittingComment ? 'Posting...' : 'Comment'}
                </Button>
              </div>
            </div>
          </form>

          {/* List of comments */}
          {loadingComments ? (
            <div className="flex justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center py-6 text-sm text-text-muted">No comments yet. Be the first to reply!</p>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => {
                const isOwnComment = currentUser?._id === comment.owner?._id;
                const isEditing = editingCommentId === comment._id;
                const hasLiked = likedComments.has(comment._id);

                return (
                  <div key={comment._id} className="flex gap-3 text-sm group">
                    <Link to={`/channel/${comment.owner?.username}`}>
                      <Avatar
                        src={comment.owner?.avatar}
                        alt={comment.owner?.username}
                        size="sm"
                        className="h-9 w-9 shrink-0"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* Comment Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/channel/${comment.owner?.username}`}
                          className="font-bold text-text-primary text-xs hover:text-accent transition-colors"
                        >
                          {comment.owner?.fullName || `@${comment.owner?.username}`}
                        </Link>
                        <span className="text-[10px] text-text-muted">{formatRelativeTime(comment.createdAt)}</span>
                      </div>

                      {/* Comment Body / Edit form */}
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-bg-primary border border-accent text-sm rounded-lg p-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleEditCommentSave(comment._id)}
                              className="text-xs px-3 py-1"
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditText('');
                              }}
                              className="text-xs px-3 py-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}

                      {/* Comment Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => handleCommentLikeToggle(comment._id)}
                            className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                              hasLiked ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                            }`}
                          >
                            <ThumbsUp size={11} className={hasLiked ? 'fill-accent text-accent' : ''} />
                            <span>Like</span>
                          </button>

                          {isOwnComment && (
                            <div className="flex items-center gap-3 ml-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditText(comment.content);
                                }}
                                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                title="Edit comment"
                              >
                                <Edit2 size={11} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCommentClick(comment._id)}
                                className="flex items-center gap-1 text-[11px] text-red-500/80 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete comment"
                              >
                                <Trash2 size={11} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Recommendations Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-sm font-bold text-text-primary tracking-wider uppercase border-b border-border pb-2">
          Recommended Videos
        </h2>

        {recommendations.length === 0 ? (
          <p className="text-xs text-text-muted py-2">No other recommendations available</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((recVideo) => (
              <div
                key={recVideo._id}
                onClick={() => navigate(`/video/${recVideo._id}`)}
                className="flex gap-3 group cursor-pointer p-1.5 rounded-lg hover:bg-bg-secondary/50 transition-colors"
              >
                {/* Small Thumbnail */}
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                  <img src={recVideo.thumbnail} alt={recVideo.title} className="h-full w-full object-cover" />
                  {recVideo.duration && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-bold text-white">
                      {formatDuration(recVideo.duration)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 justify-center">
                  <h3 className="line-clamp-2 text-xs font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors duration-150">
                    {recVideo.title}
                  </h3>
                  <Link
                    to={`/channel/${recVideo.owner?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 text-[10px] text-text-secondary hover:text-text-primary truncate"
                  >
                    {recVideo.owner?.fullName || recVideo.owner?.username}
                  </Link>
                  <span className="text-[10px] text-text-muted mt-0.5">
                    {formatViews(recVideo.views || 0)} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save to Playlist Modal */}
      {playlistModalOpen && (
        <Modal isOpen={playlistModalOpen} onClose={() => setPlaylistModalOpen(false)} title="Save to playlist">
          <div className="space-y-4">
            {/* Playlist checkboxes */}
            {loadingPlaylists ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : playlists.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-2">You don't have any playlists yet.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
                {playlists.map((playlist) => {
                  const isChecked = playlist.video?.some((id) => id === videoId);
                  return (
                    <label
                      key={playlist._id}
                      className="flex items-center gap-3 rounded-lg border border-border/40 p-2 text-sm text-text-primary hover:bg-bg-tertiary hover:border-border cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handlePlaylistCheckboxChange(playlist, e.target.checked)}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent bg-bg-primary cursor-pointer"
                      />
                      <span className="font-medium truncate flex-1">{playlist.name}</span>
                      <span className="text-[10px] text-text-muted font-bold px-1.5 py-0.5 rounded bg-bg-primary border border-border/40">
                        {playlist.video?.length || 0}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Create new playlist form */}
            <form onSubmit={handleCreatePlaylistSubmit} className="border-t border-border pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Create new playlist</h4>
              <Input
                type="text"
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                required
                className="w-full text-xs bg-bg-primary"
              />
              <Input
                type="text"
                placeholder="Enter playlist description (optional)..."
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                className="w-full text-xs bg-bg-primary"
              />
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={!newPlaylistName.trim() || creatingPlaylistState}
                  className="flex items-center gap-1 text-xs rounded-full font-bold px-4 py-1.5"
                >
                  {creatingPlaylistState ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus size={12} />
                      Create Playlist
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideoPage;
