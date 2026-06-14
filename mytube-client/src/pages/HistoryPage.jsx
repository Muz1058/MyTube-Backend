import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { getWatchHistory } from '../api/auth.api';
import VideoCard from '../components/video/VideoCard';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWatchHistory();
      // Watch history aggregation returns the array in original order.
      // Reversing it will show the most recently watched videos first.
      const reversed = data ? [...data].reverse() : [];
      setHistoryList(reversed);
    } catch (err) {
      console.error('Failed to fetch watch history:', err);
      setError(err?.response?.data?.message || 'Failed to load watch history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Watch History"
        description="Review the videos you have watched recently on MyTube."
      />

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border bg-bg-secondary/35 p-8 text-center">
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchHistory} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      ) : historyList.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border/50 bg-bg-secondary/20 p-12 text-center max-w-xl mx-auto">
          <div className="mb-4 rounded-full bg-bg-tertiary p-4 text-text-secondary">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">No watch history</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Videos you watch will keep track here. Keep exploring and enjoying content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {historyList
            .filter((video) => video !== null && video !== undefined)
            .map((video, idx) => (
              <VideoCard key={`${video._id}-${idx}`} video={video} />
            ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
