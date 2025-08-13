import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";

export interface FilterListItem {
  id: string;
  label: string;
  capital?: string;
  pays?: string;
  region?: string;
  country_name?: string;
  region_name?: string;
  province_name?: string;
  shape_iso?: string;
  shape_iso_2?: string;
  shape_city?: string;
  [extra: string]: any;
}

interface FilterListProps {
  title: string;
  items: FilterListItem[];
  selected: string[];
  onToggle: (id: string) => void;
  threshold?: number;
}

export default function FilterList({
  title,
  items,
  selected,
  onToggle,
  threshold = 10,
}: FilterListProps) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.label.toLowerCase().includes(term) ||
      item.capital?.toLowerCase().includes(term) ||
      item.pays?.toLowerCase().includes(term) ||
      item.region?.toLowerCase().includes(term) ||
      item.country_name?.toLowerCase().includes(term) ||
      item.region_name?.toLowerCase().includes(term) ||
      item.province_name?.toLowerCase().includes(term) ||
      item.shape_iso?.toLowerCase().includes(term) ||
      item.shape_iso_2?.toLowerCase().includes(term) ||
      item.shape_city?.toLowerCase().includes(term)
    );
  });
  const visibleItems = showAll
    ? filteredItems
    : filteredItems.slice(0, threshold);
  const shouldShowToggle = filteredItems.length > threshold;

  return (
    <div className="mb-3">
      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
        {title}
      </h4>
      <div className="ml-2 mt-2 space-y-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder={
              t.sidebar?.search_placeholder?.replace(
                "{0}",
                title.toLowerCase()
              ) || `Search ${title.toLowerCase()}...`
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="space-y-1">
          {visibleItems.map((item) => (
            <label
              key={item.id}
              className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {item.label}
                </div>
                {(item.capital || item.pays || item.region || item.country_name || item.region_name || item.province_name || item.shape_iso || item.shape_iso_2 || item.shape_city) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.capital && `${t.sidebar?.capital || "Capital"}: ${item.capital}`}
                    {item.pays && `${t.sidebar?.country || "Country"}: ${item.pays}`}
                    {item.region && `${t.sidebar?.region || "Region"}: ${item.region}`}
                    {item.country_name && `${t.sidebar?.country || "Country"}: ${item.country_name}`}
                    {item.region_name && `${t.sidebar?.region || "Region"}: ${item.region_name}`}
                    {item.province_name && `Province: ${item.province_name}`}
                    {(item.shape_iso || item.shape_iso_2) && ` • ${item.shape_iso || item.shape_iso_2}`}
                    {item.shape_city && ` • Capital: ${item.shape_city}`}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {shouldShowToggle && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            {showAll
              ? t.sidebar?.show_less || "Show less"
              : t.sidebar?.show_more || "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}
