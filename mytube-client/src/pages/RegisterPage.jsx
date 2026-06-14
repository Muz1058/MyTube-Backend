import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Upload, Camera, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginUserThunk } from '../store/slices/authSlice';

// Zod schema for text validation
const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9]+$/, 'Username must be lowercase and alphanumeric (no spaces or special chars)'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register: registerApi, isLoading } = useAuth();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [coverImageError, setCoverImageError] = useState('');

  const [uploadProgress, setUploadProgress] = useState(null);

  const avatarInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    };
  }, [avatarPreview, coverImagePreview]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarError('');
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setCoverImageError('');
    }
  };

  const onSubmit = async (data) => {
    let hasError = false;

    if (!avatarFile) {
      setAvatarError('Avatar image is required');
      hasError = true;
    }
    if (!coverImageFile) {
      setCoverImageError('Cover image is required');
      hasError = true;
    }

    if (hasError) return;

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('username', data.username.toLowerCase());
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('avatar', avatarFile);
    formData.append('coverImage', coverImageFile);

    try {
      setUploadProgress(0);
      
      // Call register API via useAuth with custom progress handler
      await registerApi(formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      toast.success('Account registered successfully! Logging in...');

      // Auto-login
      const loginResult = await dispatch(
        loginUserThunk({
          email: data.email,
          password: data.password,
        })
      );

      if (loginUserThunk.fulfilled.match(loginResult)) {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch {
      // API error toaster handled by apiRequest
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Create account
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Join MyTube and start sharing your videos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Banner + Avatar Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text-secondary">
            Channel Branding (Images)
          </label>
          
          {/* Cover Image Banner */}
          <div
            onClick={() => coverImageInputRef.current?.click()}
            className="group relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg-tertiary transition-all hover:border-accent"
          >
            {coverImagePreview ? (
              <img
                src={coverImagePreview}
                alt="Cover Preview"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-text-muted">
                <Upload size={18} />
                <span className="text-[10px] font-semibold">Upload Cover Image (Banner)</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="text-white" size={20} />
            </div>
            
            {/* Hidden Input */}
            <input
              type="file"
              ref={coverImageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageChange}
            />
          </div>
          {coverImageError && (
            <p className="text-xs font-medium text-red-500">{coverImageError}</p>
          )}

          {/* Avatar circle (overlaps banner slightly) */}
          <div className="flex items-center gap-4 mt-2">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="group relative h-16 w-16 cursor-pointer overflow-hidden rounded-full border-2 border-border bg-bg-tertiary transition-all hover:border-accent"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <User size={24} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="text-white" size={14} />
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Avatar Profile Photo</h4>
              <p className="text-[10px] text-text-secondary">Click circle photo to select image</p>
              {avatarError && (
                <p className="text-xs font-medium text-red-500 mt-0.5">{avatarError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Text Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-xs font-medium text-text-secondary">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <FileText size={16} />
              </span>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...register('fullName')}
                className={`w-full rounded-lg border bg-bg-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
                  errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="username" className="block text-xs font-medium text-text-secondary">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                placeholder="username"
                {...register('username')}
                className={`w-full rounded-lg border bg-bg-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
                  errors.username ? 'border-red-500 focus:border-red-500' : 'border-border'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-medium text-text-secondary">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full rounded-lg border bg-bg-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-border'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-xs font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Lock size={16} />
            </span>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...register('password')}
              className={`w-full rounded-lg border bg-bg-tertiary py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
                errors.password ? 'border-red-500 focus:border-red-500' : 'border-border'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Uploading Media...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-bg-tertiary overflow-hidden border border-border">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || uploadProgress !== null}
          className="w-full flex items-center justify-center gap-2 mt-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading || uploadProgress !== null ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {uploadProgress !== null ? 'Uploading Assets...' : 'Creating account...'}
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
