import { Link, Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-bold text-text-primary">
            MyTube
          </Link>
          <p className="mt-2 text-sm text-text-secondary">
            Watch, share, and connect
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-secondary p-6 shadow-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
