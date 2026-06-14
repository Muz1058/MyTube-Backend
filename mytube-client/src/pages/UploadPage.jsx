import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, Video, Image, FileVideo, ArrowLeft } from 'lucide-react';
import { uploadVideo } from '../api/video.api';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

const UploadPage = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isPublished, setIsPublished] = useState(true);

  // Uploading states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !videoFile || !thumbnailFile) {
      toast.error('Please fill in all fields and select files');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnailFile);
    formData.append('isPublished', isPublished);

    setUploading(true);
    setProgress(0);
    setStatusText('Uploading files to server...');

    try {
      await uploadVideo(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          if (percentCompleted === 100) {
            setStatusText('Processing files & uploading to Cloudinary (this may take a minute)...');
          }
        },
      });
      toast.success('Video uploaded and published successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload video. Please check file sizes & format.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button and page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <PageHeader title="Upload Video" description="Share your latest content with your audience." />
      </div>

      {uploading ? (
        /* Progress loader UI */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-bg-secondary/40 p-12 text-center shadow-xl space-y-6 animate-pulse">
          <div className="relative flex items-center justify-center">
            {/* Outer ring */}
            <div className="h-24 w-24 rounded-full border-4 border-border border-t-accent animate-spin"></div>
            {/* Percentage text */}
            <span className="absolute text-sm font-extrabold text-text-primary">{progress}%</span>
          </div>

          <div className="space-y-2 w-full max-w-md">
            <h3 className="text-base font-bold text-text-primary">Uploading your video</h3>
            {/* Progress Bar background */}
            <div className="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-text-secondary font-medium tracking-wide mt-2">{statusText}</p>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="bg-bg-secondary/30 border border-border/60 rounded-2xl p-6 space-y-5 shadow-lg">
          {/* Video Selection Dropzone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Video File</label>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
              videoFile ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-text-secondary/50 hover:bg-bg-tertiary/30'
            }`}>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <FileVideo size={36} className={`mb-2 ${videoFile ? 'text-accent' : 'text-text-muted'}`} />
              {videoFile ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary truncate max-w-xs">{videoFile.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary">Select Video File</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Supports MP4, WebM, MKV up to 100MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Thumbnail Selection Dropzone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Thumbnail Image</label>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
              thumbnailFile ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-text-secondary/50 hover:bg-bg-tertiary/30'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
              <Image size={28} className={`mb-2 ${thumbnailFile ? 'text-accent' : 'text-text-muted'}`} />
              {thumbnailFile ? (
                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary truncate max-w-xs">{thumbnailFile.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{(thumbnailFile.size / 1024).toFixed(1)} KB • Click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary">Select Cover Thumbnail</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Supports PNG, JPG, JPEG</p>
                </div>
              )}
            </label>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Title</label>
            <Input
              id="title"
              type="text"
              placeholder="Give your video a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-bg-primary text-sm rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Description</label>
            <Textarea
              id="description"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-bg-primary text-sm rounded-xl min-h-[5rem]"
            />
          </div>

          {/* Visibility Checkbox */}
          <label className="flex items-center gap-3 bg-bg-primary/50 border border-border/40 rounded-xl p-3 cursor-pointer select-none hover:bg-bg-primary transition-colors">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent bg-bg-primary cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary">Publish immediately</span>
              <span className="text-[10px] text-text-muted mt-0.5">Make this video publicly available immediately after uploading.</span>
            </div>
          </label>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="rounded-full text-xs font-bold px-5 py-2.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="rounded-full text-xs font-bold px-6 py-2.5 shadow-md hover:shadow-lg active:scale-[0.98] transition-transform"
            >
              Publish Video
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadPage;
