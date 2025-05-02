import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;