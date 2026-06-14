import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { formatViews, formatDuration, formatRelativeTime } from '../../utils/helpers';

export const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  if (!video) return null;

  const handleCardClick = () => {
    navigate(`/video/${video._id}`);
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    navigate(`/channel/${video.owner?.username}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col gap-2 rounded-xl bg-bg-secondary/40 border border-border/30 hover:border-border/80 p-3 hover:bg-bg-secondary transition-all duration-300 hover:shadow-xl hover:shadow-black/25 cursor-pointer"
    >
      {/* Thumbnail Wrapper */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-bg-tertiary">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Video Details Row */}
      <div className="flex gap-3 px-1 pt-1">
        {/* Channel Avatar */}
        <div onClick={handleChannelClick} className="shrink-0 transition-transform active:scale-95">
          <Avatar
            src={video.owner?.avatar}
            alt={video.owner?.fullName || video.owner?.username || 'Channel avatar'}
            size="sm"
            className="h-9 w-9 border border-border/50"
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors duration-200">
            {video.title}
          </h3>
          <span
            onClick={handleChannelClick}
            className="mt-1 text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 truncate max-w-max font-medium"
          >
            {video.owner?.fullName || `@${video.owner?.username}`}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
            <span>{formatViews(video.views || 0)}</span>
            <span className="h-1 w-1 rounded-full bg-text-muted/50"></span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
