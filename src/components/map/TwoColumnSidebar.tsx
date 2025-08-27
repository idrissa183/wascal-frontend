import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";

interface TwoColumnSidebarProps {
  children: React.ReactNode;
  rightColumnContent?: React.ReactNode;
  isRightColumnVisible?: boolean;
  onRightColumnToggle?: (visible: boolean) => void;
  className?: string;
}

export const TwoColumnSidebar: React.FC<TwoColumnSidebarProps> = ({
  children,
  rightColumnContent,
  isRightColumnVisible = false,
  onRightColumnToggle,
  className = "",
}) => {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const t = useTranslations();
  
  const handleLeftToggle = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
  };
  
  const handleRightToggle = () => {
    if (isRightCollapsed) {
      setIsRightCollapsed(false);
    } else {
      if (onRightColumnToggle) {
        onRightColumnToggle(!isRightColumnVisible);
      }
    }
  };
  
  const handleRightCollapse = () => {
    setIsRightCollapsed(!isRightCollapsed);
  };
  
  // Calculate widths based on state
  const getLeftWidth = () => {
    if (isLeftCollapsed) return "w-12";
    if (isRightColumnVisible && !isRightCollapsed) return "w-full sm:w-80";
    return "w-full sm:w-96";
  };
  
  const getRightWidth = () => {
    if (!isRightColumnVisible) return "w-0";
    if (isRightCollapsed) return "w-12";
    return "w-full sm:w-80";
  };
  
  return (
    <div className={`flex h-full ${className}`}>
      {/* Left Column */}
      <div
        className={`${getLeftWidth()} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col relative z-10`}
      >
        {/* Left Column Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          {!isLeftCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.twoColumnSidebar?.controles}
            </h2>
          )}
          <button
            type="button"
            onClick={handleLeftToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title={
              isLeftCollapsed
                ? t.twoColumnSidebar?.expand
                : t.twoColumnSidebar?.collapse
            }
          >
            {isLeftCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Left Column Content */}
        <div className="flex-1 overflow-hidden">
          {isLeftCollapsed ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 transform -rotate-90 origin-center whitespace-nowrap mt-8">
                {t.twoColumnSidebar?.controles}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">{children}</div>
          )}
        </div>

        {/* Right Column Toggle Button */}
        {!isLeftCollapsed && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleRightToggle}
              className={`w-full flex items-center justify-center space-x-2 p-2 rounded-md transition-colors ${
                isRightColumnVisible
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-sm font-medium">
                {isRightColumnVisible
                  ? t.twoColumnSidebar?.close_editor
                  : t.twoColumnSidebar?.open_editor}
              </span>
              {isRightColumnVisible ? (
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              ) : (
                <ChevronDoubleRightIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Column */}
      {isRightColumnVisible && (
        <div
          className={`${getRightWidth()} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col relative z-10`}
        >
          {/* Right Column Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            {!isRightCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.twoColumnSidebar?.field_editor}
              </h2>
            )}
            <button
              type="button"
              onClick={handleRightCollapse}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={
                isRightCollapsed
                  ? t.twoColumnSidebar?.expand
                  : t.twoColumnSidebar?.collapse
              }
            >
              {isRightCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right Column Content */}
          <div className="flex-1 overflow-hidden">
            {isRightCollapsed ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 transform -rotate-90 origin-center whitespace-nowrap mt-8">
                  {t.twoColumnSidebar?.editor}
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">{rightColumnContent}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
