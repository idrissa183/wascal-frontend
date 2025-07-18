import React, { useState, useEffect } from "react";
import Navbar from "../include/Navbar";
import Sidebar from "../include/Sidebar";
import Footer from "../include/Footer";

interface BaseProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function Base({ children, showFooter = true }: BaseProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <main className="pt-16 min-h-screen">
          <div className="p-4">{children}</div>
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
}
