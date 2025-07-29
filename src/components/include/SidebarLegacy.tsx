import React, { useState, useEffect } from "react";
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
  QuestionMarkCircleIcon,
  SparklesIcon,
  CalendarIcon,
  FolderIcon,
  GlobeAltIcon,
  EyeIcon,
  Squares2X2Icon,
  GlobeAmericasIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";
import { useAuthStore } from "../../stores/useAuthStore";
import type { User } from "../../types/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

interface FilterItem {
  id: string;
  label: string;
  capital?: string;
  pays?: string;
  region?: string;
  metrics?: string[];
}

interface ExpandedSections {
  main: boolean;
  dataLayers: boolean;
  tools: boolean;
  management: boolean;
  filters: boolean;
  datasets: boolean;
  categories: boolean;
  pays: boolean;
  regions: boolean;
  provinces: boolean;
}

interface SelectedFilters {
  datasets: string[];
  categories: string[];
  pays: string[];
  regions: string[];
  provinces: string[];
}

interface SearchTerms {
  datasets: string;
  categories: string;
  pays: string;
  regions: string;
  provinces: string;
}

interface ShowAll {
  datasets: boolean;
  categories: boolean;
  pays: boolean;
  regions: boolean;
  provinces: boolean;
}

// Données des filtres WASCAL (version complète pour legacy)
const filterData: Record<string, FilterItem[]> = {
  datasets: [
    { id: "COPERNICUS/S1_GRD", label: "Sentinel-1", metrics: [] },
    { id: "COPERNICUS/S2_SR_HARMONIZED", label: "Sentinel-2", metrics: [] },
    { id: "LANDSAT/LC08/C02/T1_L2", label: "Landsat 8", metrics: [] },
    { id: "LANDSAT/LC09/C02/T1_L2", label: "Landsat 9", metrics: [] },
    { id: "COPERNICUS/DEM/GLO30", label: "Copernicus DEM", metrics: [] },
    { id: "ECMWF/ERA5/DAILY", label: "ERA5 Daily", metrics: [] },
    { id: "UCSB-CHG/CHIRPS/DAILY", label: "CHIRPS", metrics: [] },
    { id: "NASA/GPM_L3/IMERG_V07", label: "IMERG Precipitation", metrics: [] },
    { id: "MERIT/DEM/v1_0_3", label: "MERIT DEM", metrics: [] },
    {
      id: "projects/soilgrids-isric/soilgrids",
      label: "SoilGrids",
      metrics: [],
    },
    { id: "MODIS/061/MOD13Q1", label: "MODIS Vegetation", metrics: [] },
  ],
  categories: [
    { id: "climat", label: "Climat" },
    { id: "vegetation", label: "Végétation" },
    { id: "sol", label: "Sol" },
  ],
  pays: [
    { id: "benin", label: "Bénin", capital: "Porto-Novo" },
    { id: "burkina-faso", label: "Burkina Faso", capital: "Ouagadougou" },
    { id: "cote-ivoire", label: "Côte d'Ivoire", capital: "Yamoussoukro" },
    { id: "gambie", label: "Gambie", capital: "Banjul" },
    { id: "ghana", label: "Ghana", capital: "Accra" },
    { id: "mali", label: "Mali", capital: "Bamako" },
    { id: "niger", label: "Niger", capital: "Niamey" },
    { id: "nigeria", label: "Nigeria", capital: "Abuja" },
    { id: "togo", label: "Togo", capital: "Lomé" },
    { id: "cap-vert", label: "Cap-Vert", capital: "Praia" },
    { id: "senegal", label: "Sénégal", capital: "Dakar" },
    { id: "mauritanie", label: "Mauritanie", capital: "Nouakchott" },
  ],
  regions: [
    { id: "centre", label: "Centre", pays: "Burkina Faso" },
    { id: "boucle-mouhoun", label: "Boucle du Mouhoun", pays: "Burkina Faso" },
    { id: "cascades", label: "Cascades", pays: "Burkina Faso" },
    { id: "centre-est", label: "Centre-Est", pays: "Burkina Faso" },
    { id: "centre-nord", label: "Centre-Nord", pays: "Burkina Faso" },
    { id: "centre-ouest", label: "Centre-Ouest", pays: "Burkina Faso" },
    { id: "centre-sud", label: "Centre-Sud", pays: "Burkina Faso" },
    { id: "est", label: "Est", pays: "Burkina Faso" },
    { id: "hauts-bassins", label: "Hauts-Bassins", pays: "Burkina Faso" },
    { id: "nord", label: "Nord", pays: "Burkina Faso" },
    { id: "plateau-central", label: "Plateau Central", pays: "Burkina Faso" },
    { id: "sahel", label: "Sahel", pays: "Burkina Faso" },
    { id: "sud-ouest", label: "Sud-Ouest", pays: "Burkina Faso" },
    { id: "ashanti", label: "Ashanti", pays: "Ghana" },
    { id: "greater-accra", label: "Greater Accra", pays: "Ghana" },
    { id: "northern", label: "Northern", pays: "Ghana" },
    { id: "western", label: "Western", pays: "Ghana" },
    { id: "central", label: "Central", pays: "Ghana" },
    { id: "volta", label: "Volta", pays: "Ghana" },
    { id: "lagos", label: "Lagos", pays: "Nigeria" },
    { id: "kano", label: "Kano", pays: "Nigeria" },
    { id: "abuja", label: "Abuja FCT", pays: "Nigeria" },
    { id: "rivers", label: "Rivers", pays: "Nigeria" },
    { id: "kaduna", label: "Kaduna", pays: "Nigeria" },
    { id: "ogun", label: "Ogun", pays: "Nigeria" },
    { id: "dakar", label: "Dakar", pays: "Sénégal" },
    { id: "thies", label: "Thiès", pays: "Sénégal" },
    { id: "kaolack", label: "Kaolack", pays: "Sénégal" },
    { id: "maritime", label: "Maritime", pays: "Togo" },
    { id: "plateaux", label: "Plateaux", pays: "Togo" },
    { id: "centrale", label: "Centrale", pays: "Togo" },
    { id: "atlantique", label: "Atlantique", pays: "Bénin" },
    { id: "littoral", label: "Littoral", pays: "Bénin" },
    { id: "oueme", label: "Ouémé", pays: "Bénin" },
    { id: "bamako", label: "Bamako", pays: "Mali" },
    { id: "kayes", label: "Kayes", pays: "Mali" },
    { id: "koulikoro", label: "Koulikoro", pays: "Mali" },
    { id: "niamey", label: "Niamey", pays: "Niger" },
    { id: "dosso", label: "Dosso", pays: "Niger" },
    { id: "maradi", label: "Maradi", pays: "Niger" },
  ],
  provinces: [
    { id: "kadiogo", label: "Kadiogo", region: "Centre", pays: "Burkina Faso" },
    {
      id: "bale",
      label: "Balé",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    {
      id: "banwa",
      label: "Banwa",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    {
      id: "kossi",
      label: "Kossi",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    {
      id: "mouhoun",
      label: "Mouhoun",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    {
      id: "nayala",
      label: "Nayala",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    {
      id: "sourou",
      label: "Sourou",
      region: "Boucle du Mouhoun",
      pays: "Burkina Faso",
    },
    { id: "comoe", label: "Comoé", region: "Cascades", pays: "Burkina Faso" },
    { id: "leraba", label: "Léraba", region: "Cascades", pays: "Burkina Faso" },
    {
      id: "boulgou",
      label: "Boulgou",
      region: "Centre-Est",
      pays: "Burkina Faso",
    },
    {
      id: "koulpelogo",
      label: "Koulpélogo",
      region: "Centre-Est",
      pays: "Burkina Faso",
    },
    {
      id: "kouritenga",
      label: "Kouritenga",
      region: "Centre-Est",
      pays: "Burkina Faso",
    },
    { id: "bam", label: "Bam", region: "Centre-Nord", pays: "Burkina Faso" },
    {
      id: "namentenga",
      label: "Namentenga",
      region: "Centre-Nord",
      pays: "Burkina Faso",
    },
    {
      id: "sanmatenga",
      label: "Sanmatenga",
      region: "Centre-Nord",
      pays: "Burkina Faso",
    },
    {
      id: "boulkiemde",
      label: "Boulkiemdé",
      region: "Centre-Ouest",
      pays: "Burkina Faso",
    },
    {
      id: "sanguie",
      label: "Sanguié",
      region: "Centre-Ouest",
      pays: "Burkina Faso",
    },
    {
      id: "sissili",
      label: "Sissili",
      region: "Centre-Ouest",
      pays: "Burkina Faso",
    },
    { id: "ziro", label: "Ziro", region: "Centre-Ouest", pays: "Burkina Faso" },
  ],
};

export default function SidebarLegacy({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const { user, getCurrentUser, isLoading, error } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // États pour l'expansion des sections
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    main: true,
    dataLayers: true,
    tools: true,
    management: true,
    filters: true,
    datasets: false,
    categories: false,
    pays: false,
    regions: false,
    provinces: false,
  });

  // États pour les filtres sélectionnés
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    datasets: [],
    categories: [],
    pays: [],
    regions: [],
    provinces: [],
  });

  // États pour la recherche dans les filtres
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    datasets: "",
    categories: "",
    pays: "",
    regions: "",
    provinces: "",
  });

  // États pour "Montrer plus/moins"
  const [showAll, setShowAll] = useState<ShowAll>({
    datasets: false,
    categories: false,
    pays: false,
    regions: false,
    provinces: false,
  });

  // Écouter les changements de route
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const isActiveRoute = (href: string): boolean => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const handleNavigation = (href: string) => {
    window.location.href = href;
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getLocalizedFilterData = (): Record<string, FilterItem[]> => ({
    ...filterData,
    categories: [
      { id: "climat", label: t.geography?.climate || "Climate" },
      { id: "vegetation", label: t.geography?.vegetation || "Vegetation" },
      { id: "sol", label: t.geography?.soil || "Soil" },
    ],
  });

  const menuItems: MenuItem[] = [
    {
      icon: HomeIcon,
      label: t.dashboard,
      href: "/dashboard",
      active: isActiveRoute("/dashboard"),
    },
    {
      icon: MapIcon,
      label: t.map,
      href: "/map",
      active: isActiveRoute("/map"),
    },
    {
      icon: ChartBarIcon,
      label: t.analytics,
      href: "/analytics",
      active: isActiveRoute("/analytics"),
    },
    {
      icon: EyeIcon,
      label: t.monitoring,
      href: "/monitoring",
      active: isActiveRoute("/monitoring"),
    },
  ];

  const dataItems: MenuItem[] = [
    {
      icon: CloudIcon,
      label: t.climate,
      href: "/data/climate",
      active: isActiveRoute("/data/climate"),
    },
    {
      icon: GlobeAltIcon,
      label: t.vegetation,
      href: "/data/vegetation",
      active: isActiveRoute("/data/vegetation"),
    },
    {
      icon: BeakerIcon,
      label: t.temperature,
      href: "/data/temperature",
      active: isActiveRoute("/data/temperature"),
    },
    {
      icon: CloudIcon,
      label: t.precipitation,
      href: "/data/precipitation",
      active: isActiveRoute("/data/precipitation"),
    },
  ];

  const toolItems: MenuItem[] = [
    {
      icon: SparklesIcon,
      label: t.predictions,
      href: "/predictions",
      active: isActiveRoute("/predictions"),
    },
    {
      icon: BellIcon,
      label: t.alerts,
      href: "/alerts",
      active: isActiveRoute("/alerts"),
    },
    {
      icon: SparklesIcon,
      label: t.aiAssistant,
      href: "/ai-assistant",
      active: isActiveRoute("/ai-assistant"),
    },
    {
      icon: DocumentTextIcon,
      label: t.export,
      href: "/export",
      active: isActiveRoute("/export"),
    },
  ];

  const otherItems: MenuItem[] = [
    {
      icon: FolderIcon,
      label: t.projects,
      href: "/projects",
      active: isActiveRoute("/projects"),
    },
    {
      icon: CalendarIcon,
      label: t.calendar,
      href: "/calendar",
      active: isActiveRoute("/calendar"),
    },
    {
      icon: DocumentTextIcon,
      label: t.reports,
      href: "/reports",
      active: isActiveRoute("/reports"),
    },
    {
      icon: DocumentTextIcon,
      label: t.history,
      href: "/history",
      active: isActiveRoute("/history"),
    },
  ];

  const bottomItems: MenuItem[] = [
    {
      icon: CogIcon,
      label: t.settings,
      href: "/settings",
      active: isActiveRoute("/settings"),
    },
    {
      icon: QuestionMarkCircleIcon,
      label: t.help,
      href: "/help",
      active: isActiveRoute("/help"),
    },
  ];

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (section: keyof SelectedFilters, filterId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [section]: prev[section].includes(filterId)
        ? prev[section].filter((id) => id !== filterId)
        : [...prev[section], filterId],
    }));
  };

  const handleSearch = (section: keyof SearchTerms, term: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [section]: term,
    }));
  };

  const toggleShowAll = (section: keyof ShowAll) => {
    setShowAll((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getFilteredItems = (section: keyof typeof filterData) => {
    const localizedData = getLocalizedFilterData();
    const items = localizedData[section];
    const searchTerm = searchTerms[section].toLowerCase();

    let filtered = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    );

    const maxVisible = 5;
    if (!showAll[section] && filtered.length > maxVisible) {
      filtered = filtered.slice(0, maxVisible);
    }

    return filtered;
  };

  const shouldShowToggle = (section: keyof typeof filterData) => {
    const localizedData = getLocalizedFilterData();
    const items = localizedData[section];
    const searchTerm = searchTerms[section].toLowerCase();
    const filteredCount = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    ).length;

    return filteredCount > 5;
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      datasets: [],
      categories: [],
      pays: [],
      regions: [],
      provinces: [],
    });
  };

  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce(
      (total, filters) => total + filters.length,
      0
    );
  };

  // Icônes pour les sections de filtres
  const filterSectionIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    datasets: FolderIcon,
    categories: Squares2X2Icon,
    pays: GlobeAmericasIcon,
    regions: BuildingOfficeIcon,
    provinces: HomeModernIcon,
  };

  const renderFilterSection = (
    section: keyof typeof filterData,
    title: string,
    hasSearch = false
  ) => {
    const SectionIcon = filterSectionIcons[section];
    const isExpanded = expandedSections[section as keyof ExpandedSections];
    const filteredItems = getFilteredItems(section);

    return (
      <div key={section} className="mb-3">
        {/* En-tête de section */}
        <div
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          onClick={() => toggleSection(section as keyof ExpandedSections)}
        >
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <SectionIcon className="w-5 h-5" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Contenu de la section */}
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-2">
            {/* Barre de recherche (optionnelle) */}
            {hasSearch && (
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
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  value={searchTerms[section as keyof SearchTerms]}
                  onChange={(e) =>
                    handleSearch(section as keyof SearchTerms, e.target.value)
                  }
                />
              </div>
            )}

            {/* Liste des éléments */}
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                    checked={selectedFilters[
                      section as keyof SelectedFilters
                    ].includes(item.id)}
                    onChange={() =>
                      toggleFilter(section as keyof SelectedFilters, item.id)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {item.label}
                    </div>
                    {(item.capital || item.pays || item.region) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.capital &&
                          `${t.sidebar?.capital || "Capital"}: ${item.capital}`}
                        {item.pays &&
                          `${t.sidebar?.country || "Country"}: ${item.pays}`}
                        {item.region &&
                          `${t.sidebar?.region || "Region"}: ${item.region}`}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Bouton Montrer plus/moins */}
            {shouldShowToggle(section) && (
              <button
                type="button"
                onClick={() => toggleShowAll(section as keyof ShowAll)}
                className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                {showAll[section as keyof ShowAll]
                  ? t.sidebar?.show_less || "Show less"
                  : t.sidebar?.show_more || "Show more"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const getInitials = (user: User | null) => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(
        0
      )}`.toUpperCase();
    }
    if (user?.firstname) {
      return user.firstname.charAt(0).toUpperCase();
    }
    if (user?.lastname) {
      return user.lastname.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const SidebarSection: React.FC<{
    title: string;
    items: MenuItem[];
    sectionKey: keyof ExpandedSections;
  }> = ({ title, items, sectionKey }) => (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => toggleSection(sectionKey)}
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
          {title}
        </h3>
        {expandedSections[sectionKey] ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {expandedSections[sectionKey] && (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.active
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

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
        className={`fixed top-0 left-0 z-40 w-80 h-screen pt-16 transition-transform bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Contenu principal - scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              <SidebarSection
                title={t.sidebar?.main || "Main"}
                items={menuItems}
                sectionKey="main"
              />
              <SidebarSection
                title={t.dataLayers}
                items={dataItems}
                sectionKey="dataLayers"
              />
              <SidebarSection
                title={t.tools}
                items={toolItems}
                sectionKey="tools"
              />
              <SidebarSection
                title={t.sidebar?.management || "Management"}
                items={otherItems}
                sectionKey="management"
              />
              <SidebarSection
                title={t.sidebar?.settings_help || "Settings & Help"}
                items={bottomItems}
                sectionKey="main"
              />

              {/* Section des filtres */}
              <div className="mb-6">
                <div
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection("filters")}
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    {/* <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-2" /> */}
                    {t.sidebar?.filters || "Filtres"}
                  </h3>
                  {expandedSections.filters ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {expandedSections.filters && (
                  <div className="space-y-2">
                    {renderFilterSection(
                      "datasets",
                      t.sidebar?.datasets || "Datasets",
                      true
                    )}
                    {renderFilterSection(
                      "categories",
                      t.sidebar?.categories || "Categories",
                      true
                    )}
                    {renderFilterSection(
                      "pays",
                      t.sidebar?.countries || "Pays",
                      true
                    )}
                    {renderFilterSection(
                      "regions",
                      t.sidebar?.regions || "Regions",
                      true
                    )}
                    {renderFilterSection(
                      "provinces",
                      t.sidebar?.provinces || "Provinces",
                      true
                    )}

                    {/* Résumé des filtres et actions */}
                    {getTotalSelectedFilters() > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {getTotalSelectedFilters()}{" "}
                            {t.sidebar?.selected_filters ||
                              "filtres sélectionnés"}
                          </span>
                          <div className="space-x-2">
                            <button
                              type="button"
                              onClick={clearAllFilters}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium transition-colors"
                            >
                              {t.sidebar?.clear_all || "Tout effacer"}
                            </button>
                            <button
                              type="button"
                              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            >
                              {t.sidebar?.apply_filters || "Appliquer"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User info at bottom */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user)}
                  </span>
                </div>
                <div className="ml-3 space-y-0.5">
                  {(user?.firstname || user?.lastname) && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                      {`${user?.firstname ?? ""} ${
                        user?.lastname ?? ""
                      }`.trim()}
                    </p>
                  )}
                  {user?.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
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
