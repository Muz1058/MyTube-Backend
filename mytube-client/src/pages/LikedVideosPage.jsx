import React, { useEffect, useState } from 'react';
import { ThumbsUp, RefreshCw } from 'lucide-react';
import { getLikedVideos } from '../api/like.api';
import VideoCard from '../components/video/VideoCard';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const LikedVideosPage = () => {
  const [likedList, setLikedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLikes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLikedVideos();
      setLikedList(data || []);
    } catch (err) {
      console.error('Failed to fetch liked videos:', err);
      setError(err?.response?.data?.message || 'Failed to load liked videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Liked Videos"
        description="A private list of all the videos you have liked."
      />

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border bg-bg-secondary/35 p-8 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchLikes} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      ) : likedList.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border/50 bg-bg-secondary/20 p-12 text-center max-w-xl mx-auto">
          <div className="mb-4 rounded-full bg-bg-tertiary p-4 text-text-secondary">
            <ThumbsUp size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No liked videos</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Videos you like will show up here. Start exploring and click like on your favorite videos!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {likedList
            .filter((item) => item.video !== null && item.video !== undefined)
            .map((item) => (
              <VideoCard key={item._id} video={item.video} />
            ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideosPage;
