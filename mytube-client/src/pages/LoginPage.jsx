import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Mail, User, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';
import { loginUserThunk } from '../store/slices/authSlice';

// Zod validation schemas
const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const usernameSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isLoading } = useSelector((state) => state.auth);
  const [loginType, setLoginType] = useState('email'); // 'email' | 'username'
  const [showPassword, setShowPassword] = useState(false);

  const activeSchema = loginType === 'email' ? emailSchema : usernameSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
    },
  });

  

  const handleToggle = (type) => {
    setLoginType(type);
    reset({
      email: '',
      username: '',
      password: '',
    });
  };

  const onSubmit = async (data) => {
    try {
      const credentials = loginType === 'email'
        ? { email: data.email, password: data.password }
        : { username: data.username, password: data.password };

      const resultAction = await dispatch(loginUserThunk(credentials));

      if (loginUserThunk.fulfilled.match(resultAction)) {
        toast.success('Signed in successfully!');
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      }
    } catch {
      // API error toaster handled by apiRequest handler
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mb-3 animate-pulse">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Access your MyTube account dashboard
        </p>
      </div>

      {/* Login Type Toggle Tabs */}
      <div className="flex rounded-lg bg-bg-tertiary p-1 border border-border">
        <button
          type="button"
          onClick={() => handleToggle('email')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
            loginType === 'email'
              ? 'bg-bg-secondary text-text-primary shadow-sm border border-border'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Mail size={14} />
          Email
        </button>
        <button
          type="button"
          onClick={() => handleToggle('username')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
            loginType === 'username'
              ? 'bg-bg-secondary text-text-primary shadow-sm border border-border'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User size={14} />
          Username
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {loginType === 'email' ? (
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
        ) : (
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
        )}

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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full rounded-lg border bg-bg-tertiary py-2.5 pl-10 pr-12 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-accent ${
                errors.password ? 'border-red-500 focus:border-red-500' : 'border-border'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 mt-4 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign in
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-accent hover:underline">
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
