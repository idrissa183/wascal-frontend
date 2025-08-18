import React, { useState, useEffect } from "react";
import Navbar from "../include/Navbar";
import Sidebar from "../include/Sidebar";
import Footer from "../include/Footer";
import { useRouterContext } from "../../hooks/useRouterContext";

interface BaseProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function Base({ children, showFooter = true }: BaseProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isInRouterContext = useRouterContext();

  // Responsive sidebar management
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on mobile when resizing to desktop
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector("aside");
      const navbarToggle = document.querySelector("[data-sidebar-toggle]");

      if (
        sidebarOpen &&
        window.innerWidth < 1024 &&
        sidebar &&
        !sidebar.contains(target) &&
        !navbarToggle?.contains(target)
      ) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-x-hidden">
      <Navbar
        data-sidebar-toggle
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-80 flex flex-col flex-1 min-w-0">
        <main className="pt-16 flex-1 flex flex-col min-h-0">
          <div
            className={`${
              showFooter ? "flex-1" : "flex-1 min-h-0"
            } px-4 sm:px-6 lg:px-8 py-4 sm:py-6`}
          >
            {children}
          </div>
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
}
