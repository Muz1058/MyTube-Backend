import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Camera,
  Edit2,
  Trash2,
  ThumbsUp,
  Image,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getChannelProfile, toggleSubscription } from '../api';
import { updateAvatar, updateCoverImage } from '../api/auth.api';
import { getAllVideos } from '../api/video.api';
import { getUserPlaylists } from '../api/playlist.api';
import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
} from '../api/tweet.api';
import { toggleTweetLike } from '../api/like.api';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Textarea from '../components/ui/Textarea';
import VideoCard from '../components/video/VideoCard';
import { formatViews, formatRelativeTime } from '../utils/helpers';

const ChannelPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.username === username;

  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);

  // Stats locally updated
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'playlists' | 'tweets' | 'about'
  const [tabLoading, setTabLoading] = useState(false);

  // Tab content storage
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);

  // Local tweet creation
  const [tweetText, setTweetText] = useState('');
  const [postingTweet, setPostingTweet] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState(null);
  const [editTweetText, setEditTweetText] = useState('');
  const [likedTweets, setLikedTweets] = useState(new Set());

  // Image input refs
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fetchProfile = async () => {
    setLoadingChannel(true);
    try {
      const profile = await getChannelProfile(username);
      setChannel(profile);
      setSubscribersCount(profile.subscribersCount || 0);
      setIsSubscribed(profile.isSubscribed || false);
      // Reset tab data
      setVideos([]);
      setPlaylists([]);
      setTweets([]);
      // Load first tab
      fetchTabData('videos', profile._id);
    } catch (err) {
      console.error('Failed to fetch channel profile:', err);
      toast.error('Channel not found');
      navigate('/');
    } finally {
      setLoadingChannel(false);
    }
  };

  const fetchTabData = async (tab, channelId) => {
    const id = channelId || channel?._id;
    if (!id) return;

    setTabLoading(true);
    try {
      if (tab === 'videos') {
        const list = await getAllVideos({ userId: id, limit: 30 });
        setVideos(list || []);
      } else if (tab === 'playlists') {
        const list = await getUserPlaylists(id);
        setPlaylists(list || []);
      } else if (tab === 'tweets') {
        const list = await getUserTweets(id);
        setTweets(list || []);
      }
    } catch (err) {
      console.error(`Failed to load ${tab} data:`, err);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchTabData(tab);
  };

  const handleSubscribeToggle = async () => {
    if (!channel?._id) return;
    try {
      await toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch (err) {
      console.error('Subscription toggle failed:', err);
      toast.error('Failed to change subscription');
    }
  };

  // Avatar Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const response = await updateAvatar(formData);
      setChannel((prev) => ({ ...prev, avatar: response.avatar }));
      toast.success('Avatar updated successfully!');
      // Update global context/localStorage user details
      window.location.reload(); // Reload to refresh avatar everywhere
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      toast.error('Failed to update avatar image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cover Image Upload
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    setUploadingCover(true);
    try {
      const response = await updateCoverImage(formData);
      setChannel((prev) => ({ ...prev, coverImage: response.coverImage }));
      toast.success('Cover banner updated successfully!');
    } catch (err) {
      console.error('Failed to upload cover:', err);
      toast.error('Failed to update cover banner');
    } finally {
      setUploadingCover(false);
    }
  };

  // Tweet/Community Post submission
  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    if (!tweetText.trim()) return;

    setPostingTweet(true);
    try {
      const newTweet = await createTweet(tweetText.trim());
      // Populate local user details on tweet
      const tweetWithUser = {
        ...newTweet,
        owner: {
          _id: currentUser._id,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatar: currentUser.avatar,
        },
      };
      setTweets((prev) => [tweetWithUser, ...prev]);
      setTweetText('');
      toast.success('Community post created!');
    } catch (err) {
      console.error('Create tweet failed:', err);
      toast.error('Failed to create post');
    } finally {
      setPostingTweet(false);
    }
  };

  // Delete Tweet
  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm('Delete this community post?')) return;
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error('Delete tweet failed:', err);
      toast.error('Failed to delete post');
    }
  };

  // Save Edit Tweet
  const handleSaveEditTweet = async (tweetId) => {
    if (!editTweetText.trim()) return;
    try {
      await updateTweet(tweetId, editTweetText.trim());
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, content: editTweetText.trim() } : t))
      );
      setEditingTweetId(null);
      setEditTweetText('');
      toast.success('Post updated successfully');
    } catch (err) {
      console.error('Update tweet failed:', err);
      toast.error('Failed to update post');
    }
  };

  // Toggle Like on Tweet
  const handleTweetLikeToggle = async (tweetId) => {
    try {
      await toggleTweetLike(tweetId);
      setLikedTweets((prev) => {
        const next = new Set(prev);
        if (next.has(tweetId)) {
          next.delete(tweetId);
        } else {
          next.add(tweetId);
        }
        return next;
      });
    } catch (err) {
      console.error('Tweet like failed:', err);
    }
  };

  if (loadingChannel) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cover Image banner */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-bg-tertiary sm:h-52 md:h-64 border border-border/60 group">
        {channel?.coverImage ? (
          <img src={channel.coverImage} alt="Channel banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-bg-secondary to-bg-hover flex items-center justify-center">
            <Image className="h-10 w-10 text-text-muted" />
          </div>
        )}

        {isOwner && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black/80 px-4 py-2 text-xs font-bold text-white transition-all backdrop-blur-sm cursor-pointer shadow-lg"
          >
            {uploadingCover ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              <>
                <Camera size={14} />
                <span>Upload Banner</span>
              </>
            )}
          </button>
        )}
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Profile summary header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 border-b border-border/40 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar Container with hover camera overlay if owner */}
          <div className="relative rounded-full overflow-hidden group/avatar cursor-pointer">
            <Avatar
              src={channel?.avatar}
              alt={channel?.fullName || 'Avatar'}
              size="lg"
              className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-border/50"
            />
            {isOwner && (
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 gap-1"
              >
                {uploadingAvatar ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <>
                    <Camera size={20} />
                    <span className="text-[10px] font-bold">Update</span>
                  </>
                )}
              </div>
            )}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col min-w-0 md:justify-center h-full sm:pt-2">
            <h1 className="text-2xl font-black text-text-primary leading-tight">
              {channel?.fullName}
            </h1>
            <p className="text-sm font-semibold text-text-secondary mt-1">@{channel?.username}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-text-muted font-bold">
              <span>{subscribersCount} Subscriber{subscribersCount === 1 ? '' : 's'}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted/65"></span>
              <span>{channel?.channelsSubscribedToCount || 0} Subscribed</span>
            </div>
          </div>
        </div>

        {/* Subscribe / Edit actions */}
        <div className="flex justify-center shrink-0">
          {isOwner ? (
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="font-bold rounded-full text-xs shadow-md border border-border bg-bg-tertiary text-text-primary hover:bg-bg-hover flex items-center gap-1.5"
            >
              <span>Manage Videos</span>
            </Button>
          ) : (
            <Button
              variant={isSubscribed ? 'secondary' : 'accent'}
              onClick={handleSubscribeToggle}
              className={`font-bold rounded-full text-xs px-6 py-2 shadow-md transition-all active:scale-[0.98] ${
                isSubscribed ? 'border border-border bg-bg-tertiary text-text-primary hover:bg-bg-hover' : ''
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-border/80">
        {['videos', 'playlists', 'tweets', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-3 text-xs font-black tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[30vh]">
        {tabLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : (
          <div>
            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div>
                {videos.length === 0 ? (
                  <p className="text-center py-12 text-sm text-text-muted">No videos uploaded by this channel</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {videos.map((vid) => (
                      <VideoCard key={vid._id} video={vid} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <div>
                {playlists.length === 0 ? (
                  <p className="text-center py-12 text-sm text-text-muted">No playlists created by this channel</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playlists.map((playlist) => (
                      <Link
                        key={playlist._id}
                        to={`/playlist/${playlist._id}`}
                        className="group flex flex-col gap-2 rounded-xl bg-bg-secondary/40 border border-border/40 p-4 hover:bg-bg-secondary hover:border-border transition-all duration-300"
                      >
                        <div className="aspect-video w-full rounded-lg bg-bg-tertiary border border-border/50 relative overflow-hidden flex flex-col items-center justify-center gap-1 hover:shadow-inner">
                          {/* Folder Overlay aesthetic */}
                          <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white border-l border-border/60">
                            <span className="text-lg font-black">{playlist.video?.length || 0}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Videos</span>
                          </div>
                          <span className="text-sm font-black text-text-muted group-hover:text-text-primary transition-colors">Playlist</span>
                        </div>
                        <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors truncate mt-1">
                          {playlist.name}
                        </h3>
                        <p className="text-xs text-text-secondary truncate leading-tight">
                          {playlist.description || 'No description provided.'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tweets (Community posts) Tab */}
            {activeTab === 'tweets' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* New Tweet form (Only for owner) */}
                {isOwner && (
                  <form
                    onSubmit={handleTweetSubmit}
                    className="bg-bg-secondary/40 border border-border/40 rounded-xl p-4 space-y-3"
                  >
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">Community Post</h3>
                    <Textarea
                      placeholder="Share a text update with your subscribers..."
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      required
                      className="w-full bg-bg-primary text-sm min-h-[4rem]"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="accent"
                        size="sm"
                        disabled={!tweetText.trim() || postingTweet}
                        className="rounded-full text-xs font-bold px-5 py-1.5"
                      >
                        {postingTweet ? 'Posting...' : 'Post update'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Tweets list */}
                {tweets.length === 0 ? (
                  <p className="text-center py-12 text-sm text-text-muted">No community updates from this channel yet</p>
                ) : (
                  <div className="space-y-4">
                    {tweets.map((tweet) => {
                      const isTweetOwner = currentUser?._id === tweet.owner?._id;
                      const isEditing = editingTweetId === tweet._id;
                      const hasLiked = likedTweets.has(tweet._id);

                      return (
                        <div
                          key={tweet._id}
                          className="bg-bg-secondary/35 border border-border/30 rounded-xl p-4 flex gap-3 group/tweet"
                        >
                          <Avatar
                            src={tweet.owner?.avatar}
                            alt={tweet.owner?.username}
                            size="sm"
                            className="h-9 w-9 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            {/* Tweet Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-text-primary">
                                  {tweet.owner?.fullName || `@${tweet.owner?.username}`}
                                </span>
                                <span className="text-[10px] text-text-muted">{formatRelativeTime(tweet.createdAt)}</span>
                              </div>

                              {/* Tweet Owner actions */}
                              {isTweetOwner && !isEditing && (
                                <div className="flex items-center gap-2 opacity-0 group-hover/tweet:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingTweetId(tweet._id);
                                      setEditTweetText(tweet.content);
                                    }}
                                    className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-tertiary transition-all cursor-pointer"
                                    title="Edit post"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTweet(tweet._id)}
                                    className="text-red-500/70 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                                    title="Delete post"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Tweet Body / Edit Box */}
                            {isEditing ? (
                              <div className="mt-3 space-y-2">
                                <Textarea
                                  value={editTweetText}
                                  onChange={(e) => setEditTweetText(e.target.value)}
                                  className="w-full bg-bg-primary text-sm rounded-lg p-2"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    variant="accent"
                                    size="sm"
                                    onClick={() => handleSaveEditTweet(tweet._id)}
                                    className="text-xs px-3 py-1"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setEditingTweetId(null);
                                      setEditTweetText('');
                                    }}
                                    className="text-xs px-3 py-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
                                {tweet.content}
                              </p>
                            )}

                            {/* Tweet Action likes */}
                            {!isEditing && (
                              <div className="mt-3 flex items-center">
                                <button
                                  onClick={() => handleTweetLikeToggle(tweet._id)}
                                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                                    hasLiked ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                                  }`}
                                >
                                  <ThumbsUp size={12} className={hasLiked ? 'fill-accent text-accent' : ''} />
                                  <span>Like</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="max-w-xl bg-bg-secondary/25 border border-border/30 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1.5">Description</h3>
                  <p className="text-sm text-text-secondary leading-relaxed break-words">
                    {channel?.description || 'No channel description provided by the author.'}
                  </p>
                </div>
                <div className="border-t border-border/40 pt-4 grid grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-text-muted block">Email details</span>
                    <span className="text-text-secondary text-sm">{channel?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Joined MyTube</span>
                    <span className="text-text-secondary text-sm">
                      {channel?.createdAt ? new Date(channel.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
