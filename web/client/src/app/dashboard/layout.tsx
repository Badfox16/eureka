"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "next-themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fechar a sidebar quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ThemeProvider attribute="class">
      <div className="flex h-screen w-full flex-col">
        <div className="md:hidden">
          <Header openSidebar={() => setIsSidebarOpen(true)} />
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar para desktop */}
          <div className="hidden h-full md:block">
            <Sidebar />
          </div>
          
          {/* Sidebar móvel */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsSidebarOpen(false)}
              ></div>
              <div className="fixed inset-y-0 left-0 z-40 h-full w-[250px]">
                <Sidebar />
              </div>
            </div>
          )}
          
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="hidden md:block">
              <Header />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}