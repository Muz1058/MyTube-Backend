import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, Upload, User, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateAccountDetails, updateAvatar, updateCoverImage } from '../api/auth.api';
import { setUser } from '../store/slices/authSlice';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please enter your full name and email');
      return;
    }
    setUpdatingDetails(true);
    try {
      const updatedUser = await updateAccountDetails({ fullName: fullName.trim(), email: email.trim() });
      dispatch(setUser(updatedUser));
      toast.success('Account settings saved');
      navigate('/dashboard');
    } catch (err) {
      console.error('Update details failed:', err);
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const updatedUser = await updateAvatar(formData);
      dispatch(setUser(updatedUser));
      toast.success('Avatar updated successfully');
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      const updatedUser = await updateCoverImage(formData);
      dispatch(setUser(updatedUser));
      toast.success('Cover image updated successfully');
    } catch (err) {
      console.error('Cover upload failed:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader title="Settings" description="Update your channel identity, avatar, and account details." />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-3xl border border-border/50 bg-bg-secondary/60 p-5 shadow-lg">
          <div className="mb-5">
            <div className="relative overflow-hidden rounded-3xl bg-bg-tertiary">
              {user?.coverImage ? (
                <img src={user.coverImage} alt="Channel cover" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-text-muted">Cover image</div>
              )}
              <label className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-black/60 px-3 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-black/80">
                <Camera size={14} />
                <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative inline-flex overflow-hidden rounded-full border border-border bg-bg-tertiary">
              <Avatar src={user?.avatar} alt={user?.fullName || user?.username} size="xl" className="h-28 w-28" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={18} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{user?.fullName}</p>
              <p className="text-xs text-text-secondary">@{user?.username}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-bg-secondary/60 p-6 shadow-lg">
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Channel Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="mt-2 bg-bg-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 bg-bg-primary"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" variant="accent" disabled={updatingDetails} className="w-full rounded-full">
                {updatingDetails ? 'Saving...' : 'Save Account'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')} className="w-full rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
