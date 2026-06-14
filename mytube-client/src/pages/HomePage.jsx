import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchCode, RefreshCw } from 'lucide-react';
import { getAllVideos } from '../api/video.api';
import VideoCard from '../components/video/VideoCard';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllVideos({ query, limit: 40 });
      setVideos(response || []);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError(err?.response?.data?.message || 'Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [query]);

  // Loading skeleton grid
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-xl bg-bg-secondary/20 p-3 border border-border/10">
          <div className="animate-pulse aspect-video w-full rounded-lg bg-bg-tertiary"></div>
          <div className="flex gap-3 px-1 pt-1">
            <div className="animate-pulse h-9 w-9 shrink-0 rounded-full bg-bg-tertiary"></div>
            <div className="flex-1 space-y-2">
              <div className="animate-pulse h-4 rounded bg-bg-tertiary w-5/6"></div>
              <div className="animate-pulse h-3 rounded bg-bg-tertiary w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={query ? `Search results for "${query}"` : 'Recommended'}
        description={
          query
            ? `Found ${videos.length} video${videos.length === 1 ? '' : 's'}`
            : 'Explore the latest community uploads and trending content.'
        }
      />

      {loading ? (
        renderSkeletons()
      ) : error ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border bg-bg-secondary/30 p-8 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchVideos} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Retry Connection
          </Button>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-border/50 bg-bg-secondary/20 p-12 text-center max-w-xl mx-auto">
          <div className="mb-4 rounded-full bg-bg-tertiary p-4 text-text-secondary animate-bounce">
            <SearchCode size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No videos found</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {query
              ? `We couldn't find anything matching "${query}". Try check spelling or search other keywords.`
              : 'The video library is empty! Start by uploading your first video.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
