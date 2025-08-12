import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { geographicService } from "../../services/geographic.service";
import type { User } from "../../types/auth";
import type { Country, Region, Province, Department } from "../../types/map";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (filters: GeographicFilters) => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

interface FilterItem {
  id: string | number;
  label: string;
  capital?: string;
  pays?: string;
  region?: string;
  province?: string;
  metrics?: string[];
  country_id?: number;
  region_id?: number;
  province_id?: number;
  categories?: string[];
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
  departments: boolean;
}

interface GeographicFilters {
  datasets: string[];
  categories: string[];
  pays: number[];
  regions: number[];
  provinces: number[];
  departments: number[];
}

interface SearchTerms {
  datasets: string;
  categories: string;
  pays: string;
  regions: string;
  provinces: string;
  departments: string;
}

interface ShowAll {
  datasets: boolean;
  categories: boolean;
  pays: boolean;
  regions: boolean;
  provinces: boolean;
  departments: boolean;
}

interface GeographicData {
  countries: Country[];
  regions: Region[];
  provinces: Province[];
  departments: Department[];
  loading: boolean;
  error: string | null;
}

// Données statiques des filtres
const staticFilterData: Record<string, FilterItem[]> = {
  datasets: [
    {
      id: "COPERNICUS/S1_GRD",
      label: "Sentinel-1",
      metrics: [],
      categories: ["eau", "sol"],
    },
    {
      id: "COPERNICUS/S2_SR_HARMONIZED",
      label: "Sentinel-2",
      metrics: [],
      categories: ["vegetation", "sol"],
    },
    {
      id: "LANDSAT/LC08/C02/T1_L2",
      label: "Landsat 8",
      metrics: [],
      categories: ["vegetation", "sol"],
    },
    {
      id: "LANDSAT/LC09/C02/T1_L2",
      label: "Landsat 9",
      metrics: [],
      categories: ["vegetation", "sol"],
    },
    {
      id: "COPERNICUS/DEM/GLO30",
      label: "Copernicus DEM",
      metrics: [],
      categories: ["sol"],
    },
    {
      id: "ECMWF/ERA5/DAILY",
      label: "ERA5 Daily",
      metrics: [],
      categories: ["climat"],
    },
    {
      id: "UCSB-CHG/CHIRPS/DAILY",
      label: "CHIRPS",
      metrics: [],
      categories: ["climat", "eau"],
    },
    {
      id: "NASA/GPM_L3/IMERG_V07",
      label: "IMERG Precipitation",
      metrics: [],
      categories: ["climat", "eau"],
    },
    {
      id: "MERIT/DEM/v1_0_3",
      label: "MERIT DEM",
      metrics: [],
      categories: ["sol"],
    },
    {
      id: "projects/soilgrids-isric/soilgrids",
      label: "SoilGrids",
      metrics: [],
      categories: ["sol"],
    },
    {
      id: "MODIS/061/MOD13Q1",
      label: "MODIS Vegetation",
      metrics: [],
      categories: ["vegetation"],
    },
  ],
  categories: [
    { id: "climat", label: "Climat" },
    { id: "eau", label: "Eau" },
    { id: "vegetation", label: "Végétation" },
    { id: "sol", label: "Sol" },
  ],
};

export default function SidebarNew({
  isOpen,
  onClose,
  onFiltersChange,
}: SidebarProps) {
  const t = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // États pour les données géographiques
  const [geographicData, setGeographicData] = useState<GeographicData>({
    countries: [],
    regions: [],
    provinces: [],
    departments: [],
    loading: false,
    error: null,
  });

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
    departments: false,
  });

  // États pour les filtres sélectionnés
  const [selectedFilters, setSelectedFilters] = useState<GeographicFilters>({
    datasets: [],
    categories: [],
    pays: [],
    regions: [],
    provinces: [],
    departments: [],
  });

  // États pour la recherche dans les filtres
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    datasets: "",
    categories: "",
    pays: "",
    regions: "",
    provinces: "",
    departments: "",
  });

  // États pour "Montrer plus/moins"
  const [showAll, setShowAll] = useState<ShowAll>({
    datasets: false,
    categories: false,
    pays: false,
    regions: false,
    provinces: false,
    departments: false,
  });

  // Charger les données géographiques au montage du composant
  useEffect(() => {
    loadGeographicData();
  }, []);

  // Notifier les changements de filtres
  useEffect(() => {
    onFiltersChange?.(selectedFilters);
  }, [selectedFilters, onFiltersChange]);

  const loadGeographicData = async () => {
    setGeographicData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [countries, regions, provinces, departments] = await Promise.all([
        geographicService.getCountries(),
        geographicService.getRegions(),
        geographicService.getProvinces(),
        geographicService.getDepartments(),
      ]);

      setGeographicData({
        countries,
        regions,
        provinces,
        departments,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données géographiques:",
        error
      );
      setGeographicData((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur lors du chargement des données géographiques",
      }));
    }
  };

  const getCurrentLanguage = () => {
    // Vous pouvez utiliser votre hook useLanguage ici
    return "fr";
  };

  const getFilteredRegions = (): FilterItem[] => {
    if (selectedFilters.pays.length === 0) {
      return geographicData.regions.map((region) => {
        const country = geographicData.countries.find(
          (c) => c.id === region.country_id
        );
        return {
          id: region.id,
          label: region.shape_name,
          pays: country?.shape_name || "",
          country_id: region.country_id,
        };
      });
    }

    return geographicData.regions
      .filter((region) => selectedFilters.pays.includes(region.country_id))
      .map((region) => {
        const country = geographicData.countries.find(
          (c) => c.id === region.country_id
        );
        return {
          id: region.id,
          label: region.shape_name,
          pays: country?.shape_name || "",
          country_id: region.country_id,
        };
      });
  };

  const getFilteredProvinces = (): FilterItem[] => {
    if (selectedFilters.regions.length === 0) {
      return geographicData.provinces.map((province) => {
        const region = geographicData.regions.find(
          (r) => r.id === province.region_id
        );
        return {
          id: province.id,
          label: province.shape_name,
          region: region?.shape_name || "",
          region_id: province.region_id,
        };
      });
    }

    return geographicData.provinces
      .filter((province) =>
        selectedFilters.regions.includes(province.region_id)
      )
      .map((province) => {
        const region = geographicData.regions.find(
          (r) => r.id === province.region_id
        );
        return {
          id: province.id,
          label: province.shape_name,
          region: region?.shape_name || "",
          region_id: province.region_id,
        };
      });
  };

  const getFilteredDepartments = (): FilterItem[] => {
    if (selectedFilters.provinces.length === 0) {
      return geographicData.departments.map((dept) => {
        const province = geographicData.provinces.find(
          (p) => p.id === dept.province_id
        );
        return {
          id: dept.id,
          label: dept.shape_name,
          province: province?.shape_name || "",
          province_id: dept.province_id,
        };
      });
    }

    return geographicData.departments
      .filter((dept) => selectedFilters.provinces.includes(dept.province_id))
      .map((dept) => {
        const province = geographicData.provinces.find(
          (p) => p.id === dept.province_id
        );
        return {
          id: dept.id,
          label: dept.shape_name,
          province: province?.shape_name || "",
          province_id: dept.province_id,
        };
      });
  };

  const getLocalizedFilterData = (): Record<string, FilterItem[]> => ({
    ...staticFilterData,
    categories: [
      { id: "climat", label: t.geography?.climate || "Climate" },
      { id: "eau", label: t.geography?.water || "Water" },
      { id: "vegetation", label: t.geography?.vegetation || "Vegetation" },
      { id: "sol", label: t.geography?.soil || "Soil" },
    ],
    pays: geographicData.countries.map((country) => ({
      id: country.id,
      label:
        getCurrentLanguage() === "fr" && country.shape_name_fr
          ? country.shape_name_fr
          : country.shape_name_en || country.shape_name,
      capital: country.shape_city,
    })),
    regions: getFilteredRegions(),
    provinces: getFilteredProvinces(),
    departments: getFilteredDepartments(),
  });

  const isActiveRoute = (href: string): boolean => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (
    section: keyof GeographicFilters,
    filterId: string | number
  ) => {
    setSelectedFilters((prev) => {
      const currentFilters = prev[section] as (string | number)[];
      const newFilters = currentFilters.includes(filterId)
        ? currentFilters.filter((id) => id !== filterId)
        : [...currentFilters, filterId];

      const newState = {
        ...prev,
        [section]: newFilters,
      };

      // Nettoyer les sélections hiérarchiques
      if (section === "pays") {
        // Si on désélectionne un pays, supprimer ses régions/provinces/départements
        if (!newFilters.includes(filterId)) {
          const regionIdsToRemove = geographicData.regions
            .filter((r) => r.country_id === filterId)
            .map((r) => r.id);
          const provinceIdsToRemove = geographicData.provinces
            .filter((p) => regionIdsToRemove.includes(p.region_id))
            .map((p) => p.id);
          const departmentIdsToRemove = geographicData.departments
            .filter((d) => provinceIdsToRemove.includes(d.province_id))
            .map((d) => d.id);

          newState.regions = prev.regions.filter(
            (id) => !regionIdsToRemove.includes(id)
          );
          newState.provinces = prev.provinces.filter(
            (id) => !provinceIdsToRemove.includes(id)
          );
          newState.departments = prev.departments.filter(
            (id) => !departmentIdsToRemove.includes(id)
          );
        }
      } else if (section === "regions") {
        // Si on désélectionne une région, supprimer ses provinces/départements
        if (!newFilters.includes(filterId)) {
          const provinceIdsToRemove = geographicData.provinces
            .filter((p) => p.region_id === filterId)
            .map((p) => p.id);
          const departmentIdsToRemove = geographicData.departments
            .filter((d) => provinceIdsToRemove.includes(d.province_id))
            .map((d) => d.id);

          newState.provinces = prev.provinces.filter(
            (id) => !provinceIdsToRemove.includes(id)
          );
          newState.departments = prev.departments.filter(
            (id) => !departmentIdsToRemove.includes(id)
          );
        }
      } else if (section === "provinces") {
        // Si on désélectionne une province, supprimer ses départements
        if (!newFilters.includes(filterId)) {
          const departmentIdsToRemove = geographicData.departments
            .filter((d) => d.province_id === filterId)
            .map((d) => d.id);

          newState.departments = prev.departments.filter(
            (id) => !departmentIdsToRemove.includes(id)
          );
        }
      }

      return newState;
    });
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

  const getFilteredItems = (
    section:
      | keyof typeof staticFilterData
      | "pays"
      | "regions"
      | "provinces"
      | "departments"
  ) => {
    const localizedData = getLocalizedFilterData();
    let items = localizedData[section] || [];
    const searchTerm =
      searchTerms[section as keyof SearchTerms]?.toLowerCase() || "";

    if (section === "datasets" && selectedFilters.categories.length > 0) {
      items = items.filter((item) =>
        item.categories?.some((cat) => selectedFilters.categories.includes(cat))
      );
    }

    let filtered = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    );

    const maxVisible = 5;
    if (!showAll[section as keyof ShowAll] && filtered.length > maxVisible) {
      filtered = filtered.slice(0, maxVisible);
    }

    return filtered;
  };

  const isFilterSelected = (
    section: keyof GeographicFilters,
    filterId: string | number
  ): boolean => {
    const currentFilters = selectedFilters[section] as (string | number)[];
    return currentFilters.includes(filterId);
  };

  const shouldShowToggle = (
    section:
      | keyof typeof staticFilterData
      | "pays"
      | "regions"
      | "provinces"
      | "departments"
  ) => {
    const localizedData = getLocalizedFilterData();
    const items = localizedData[section] || [];
    const searchTerm =
      searchTerms[section as keyof SearchTerms]?.toLowerCase() || "";
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
      departments: [],
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
    departments: HomeIcon,
  };

  const renderFilterSection = (
    section:
      | keyof typeof staticFilterData
      | "pays"
      | "regions"
      | "provinces"
      | "departments",
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
                    checked={isFilterSelected(
                      section as keyof GeographicFilters,
                      item.id
                    )}
                    onChange={() =>
                      toggleFilter(section as keyof GeographicFilters, item.id)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {item.label}
                    </div>
                    {(item.capital ||
                      item.pays ||
                      item.region ||
                      item.province) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.capital &&
                          `${t.sidebar?.capital || "Capital"}: ${item.capital}`}
                        {item.pays &&
                          `${t.sidebar?.country || "Country"}: ${item.pays}`}
                        {item.region &&
                          `${t.sidebar?.region || "Region"}: ${item.region}`}
                        {item.province && `Province: ${item.province}`}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Bouton Montrer plus/moins */}
            {shouldShowToggle(section) && (
              <button
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

              {/* Section Filtres WASCAL */}
              <div className="mb-6">
                <div
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection("filters")}
                >
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      {t.sidebar?.filters || "Filters"}
                    </h3>
                    {getTotalSelectedFilters() > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {getTotalSelectedFilters()}
                      </span>
                    )}
                  </div>
                  {expandedSections.filters ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {expandedSections.filters && (
                  <div className="space-y-1">
                    {geographicData.loading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">
                          Chargement...
                        </p>
                      </div>
                    )}
                    {geographicData.error && (
                      <div className="text-center py-4">
                        <p className="text-xs text-red-500">
                          {geographicData.error}
                        </p>
                        <button
                          onClick={loadGeographicData}
                          className="text-xs text-green-600 underline mt-1"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                    {!geographicData.loading && !geographicData.error && (
                      <>
                        {renderFilterSection("datasets", t.datasets, true)}
                        {renderFilterSection(
                          "categories",
                          t.sidebar?.categories || "Categories"
                        )}
                        {renderFilterSection(
                          "pays",
                          t.sidebar?.countries || "WASCAL Countries",
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
                        {renderFilterSection(
                          "departments",
                          t.sidebar?.departments || "Departments",
                          true
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <SidebarSection
                title={t.sidebar?.settings_help || "Settings & Help"}
                items={bottomItems}
                sectionKey="main"
              />
            </div>
          </div>

          {/* Footer avec résumé des filtres */}
          {getTotalSelectedFilters() > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {t.sidebar?.active_filters || "Active Filters"}
                  </h4>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {getTotalSelectedFilters()}{" "}
                    {getTotalSelectedFilters() > 1
                      ? t.sidebar?.selected_plural || "selected"
                      : t.sidebar?.selected || "selected"}
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(selectedFilters).map(
                    ([section, items]) =>
                      items.length > 0 && (
                        <div
                          key={section}
                          className="flex justify-between text-xs"
                        >
                          <span className="capitalize text-gray-600 dark:text-gray-400">
                            {section}:
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {items.length}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {t.sidebar?.clear || "Clear"}
                </button>
                <button
                  type="button"
                  className="flex-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium py-2 px-3 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  {t.sidebar?.apply || "Apply"}
                </button>
              </div>
            </div>
          )}

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
