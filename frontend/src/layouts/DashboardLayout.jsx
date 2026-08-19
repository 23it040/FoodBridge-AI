import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import NotificationsDropdown from '../components/layout/NotificationsDropdown';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const DashboardLayout = ({ brand = 'FoodBridge AI', sidebarItems = [], children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#1A312C] flex flex-col">
      <Navbar
        brand={brand}
        onMobileMenuToggle={() => setSidebarOpen(true)}
        actions={<NotificationsDropdown />}
      />

      <div className="flex flex-1">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
