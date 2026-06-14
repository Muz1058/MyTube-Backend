import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Play, ListMusic, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPlaylistById, removeVideoFromPlaylist } from '../api/playlist.api';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { formatViews, formatDuration, formatRelativeTime } from '../utils/helpers';

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistDetails = async () => {
    setLoading(true);
    try {
      const data = await getPlaylistById(playlistId);
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to fetch playlist details:', err);
      toast.error('Failed to load playlist');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  const handleRemoveVideo = async (e, videoId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this video from the playlist?')) return;

    try {
      await removeVideoFromPlaylist(videoId, playlistId);
      setPlaylist((prev) => ({
        ...prev,
        video: prev.video.filter((v) => v._id !== videoId),
      }));
      toast.success('Video removed from playlist');
    } catch (err) {
      console.error('Failed to remove video:', err);
      toast.error('Failed to remove video');
    }
  };

  const handlePlayAll = () => {
    if (playlist?.video?.length > 0) {
      navigate(`/video/${playlist.video[0]._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-text-primary">Playlist not found</h3>
        <p className="mt-2 text-text-secondary">This playlist may have been deleted or set to private.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?._id === playlist.owner?._id;
  const firstVideo = playlist.video?.[0];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:gap-8 max-w-7xl mx-auto">
      {/* Left Column: Playlist details card */}
      <div className="md:col-span-1">
        <div className="sticky top-20 flex flex-col rounded-2xl bg-gradient-to-b from-bg-secondary to-bg-secondary/40 border border-border/50 p-5 shadow-xl">
          {/* Playlist Thumbnail Cover representation */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-bg-tertiary border border-border/40 shadow-md">
            {firstVideo?.thumbnail ? (
              <>
                <img src={firstVideo.thumbnail} alt={playlist.name} className="h-full w-full object-cover blur-[1px] opacity-75" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <ListMusic size={40} className="text-white drop-shadow-md" />
                </div>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ListMusic size={40} className="text-text-muted" />
              </div>
            )}
          </div>

          {/* Details */}
          <h1 className="mt-4 text-xl font-extrabold text-text-primary leading-snug break-words">
            {playlist.name}
          </h1>

          <div className="mt-2 flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            <div className="flex items-center gap-1.5 text-text-primary hover:text-accent font-bold">
              <User size={12} />
              <Link to={`/channel/${playlist.owner?.username}`}>
                {playlist.owner?.fullName || `@${playlist.owner?.username}`}
              </Link>
            </div>
            <p className="mt-1">
              {playlist.video?.length || 0} video{playlist.video?.length === 1 ? '' : 's'} • Last updated{' '}
              {formatRelativeTime(playlist.updatedAt)}
            </p>
          </div>

          {playlist.video?.length > 0 && (
            <Button
              onClick={handlePlayAll}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-full py-2.5 font-bold shadow-md active:scale-[0.98] transition-transform"
            >
              <Play size={16} className="fill-current" />
              <span>Play All</span>
            </Button>
          )}
        </div>
      </div>

      <div className="md:col-span-2 space-y-3">
        {playlist.video?.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-secondary/10 p-8 text-center">
            <ListMusic size={32} className="text-text-muted mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-text-primary">This playlist is empty</h4>
            <p className="text-xs text-text-secondary mt-0.5">Explore videos and save them to this playlist.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {playlist.video.map((vid, idx) => (
              <div
                key={vid._id}
                onClick={() => navigate(`/video/${vid._id}`)}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/20 bg-bg-secondary/20 hover:bg-bg-secondary hover:border-border/60 transition-all cursor-pointer group"
              >
                {/* Index marker */}
                <span className="text-xs font-black text-text-muted w-5 text-center shrink-0">{idx + 1}</span>

                {/* Video small Thumbnail */}
                <div className="relative aspect-video w-28 sm:w-36 shrink-0 overflow-hidden rounded-lg bg-bg-tertiary shadow-sm">
                  <img src={vid.thumbnail} alt={vid.title} className="h-full w-full object-cover" />
                  {vid.duration && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white">
                      {formatDuration(vid.duration)}
                    </span>
                  )}
                </div>

                {/* Text Metadata */}
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-text-primary group-hover:text-accent transition-colors leading-tight">
                    {vid.title}
                  </h3>
                  <span className="text-[10px] sm:text-xs text-text-secondary mt-1 block font-medium">
                    {playlist.owner?.fullName || `@${playlist.owner?.username}`}
                  </span>
                  <div className="mt-0.5 text-[9px] sm:text-[10px] text-text-muted font-semibold flex items-center gap-1.5">
                    <span>{formatViews(vid.views || 0)} views</span>
                    <span className="h-1 w-1 rounded-full bg-text-muted/40"></span>
                    <span>{formatRelativeTime(vid.createdAt)}</span>
                  </div>
                </div>

                {/* Remove from Playlist Button */}
                {isOwner && (
                  <button
                    onClick={(e) => handleRemoveVideo(e, vid._id)}
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors shrink-0"
                    title="Remove from playlist"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
