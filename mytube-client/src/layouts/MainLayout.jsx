import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const MainLayout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      {/* Fixed Navbar at top */}
      <Navbar />

      <div className="flex">
        {/* Fixed/Collapsible Sidebar on left */}
        <Sidebar />

        {/* Main Content Pane */}
        <main
          className={`flex-1 min-h-[calc(100vh-3.5rem)] pt-14 transition-all duration-200 ${
            sidebarOpen ? 'pl-64' : 'pl-20'
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
