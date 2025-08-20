import React from "react";

interface AreaDisplayProps {
  area: number;
  unit?: string;
  className?: string;
}

export const AreaDisplay: React.FC<AreaDisplayProps> = ({
  area,
  unit = "km²",
  className = "",
}) => {
  const formatArea = (area: number) => {
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(2)} km²`;
    } else if (area >= 10000) {
      return `${(area / 10000).toFixed(2)} ha`;
    } else {
      return `${area.toFixed(0)} m²`;
    }
  };

  return (
    <div
      className={`px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg border border-blue-700 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"
          />
        </svg>
        <span className="text-sm font-medium">{formatArea(area)}</span>
      </div>
    </div>
  );
};