import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import {
  HomeIcon,
  MapIcon,
  ChartBarIcon,
  CloudIcon,
  BeakerIcon,
  BellIcon,
  CogIcon,
  DocumentTextIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  CalendarIcon,
  FolderIcon,
  GlobeAltIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User } from "../../types/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const { user, getCurrentUser, isLoading, error } = useAuthStore();

  const menuItems = [
    { icon: HomeIcon, label: t.dashboard, href: "/dashboard", active: true },
    { icon: MapIcon, label: t.map, href: "/map" },
    { icon: ChartBarIcon, label: t.analytics, href: "/analytics" },
    { icon: EyeIcon, label: t.monitoring, href: "/monitoring" },
  ];

  const dataItems = [
    { icon: CloudIcon, label: t.climate, href: "/data/climate" },
    { icon: GlobeAltIcon, label: t.vegetation, href: "/data/vegetation" },
    { icon: BeakerIcon, label: t.temperature, href: "/data/temperature" },
    { icon: CloudIcon, label: t.precipitation, href: "/data/precipitation" },
  ];

  const toolItems = [
    { icon: SparklesIcon, label: t.predictions, href: "/predictions" },
    { icon: BellIcon, label: t.alerts, href: "/alerts" },
    { icon: SparklesIcon, label: t.aiAssistant, href: "/ai-assistant" },
    { icon: DocumentTextIcon, label: t.export, href: "/export" },
  ];

  const otherItems = [
    { icon: FolderIcon, label: t.projects, href: "/projects" },
    { icon: CalendarIcon, label: t.calendar, href: "/calendar" },
    { icon: DocumentTextIcon, label: t.reports, href: "/reports" },
    { icon: DocumentTextIcon, label: t.history, href: "/history" },
  ];

  const bottomItems = [
    { icon: CogIcon, label: t.settings, href: "/settings" },
    { icon: QuestionMarkCircleIcon, label: t.help, href: "/help" },
  ];

  const SidebarSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof menuItems;
  }) => (
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`flex items-center p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                item.active
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const getInitials = (user: User | null) => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="space-y-2">
            <SidebarSection title="Principal" items={menuItems} />
            <SidebarSection title={t.dataLayers} items={dataItems} />
            <SidebarSection title={t.tools} items={toolItems} />
            <SidebarSection title="Gestion" items={otherItems} />
            <SidebarSection title="" items={bottomItems} />
          </div>

          {/* User info at bottom */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{getInitials(user)}</span>
                </div>
                <div className="ml-3">
                  {user?.firstname && user?.lastname && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstname} {user.lastname}
                    </p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
