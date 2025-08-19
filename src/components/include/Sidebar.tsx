import React, { useState, useEffect } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import {
  HomeIcon,
  MapIcon,
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
  ChevronRightIcon,
  XMarkIcon,
  CalendarDateRangeIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";
import { useAuthStore } from "../../stores/useAuthStore";
import { useGeographicStore } from "../../stores/useGeographicStore";
import {
  geographicService,
  type Country,
  type Region,
  type Province,
  type HierarchyCountry,
  type HierarchyRegion,
  type HierarchyProvince,
} from "../../services/geographic.service";
import type { User } from "../../types/auth";
import { getCountryName } from "../../utils/geophaphic";
import { CalendarClock, CalendarDaysIcon, CalendarRange } from "lucide-react";

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
  periodicity: boolean;

  geographic: boolean;
}

interface SelectedFilters {
  datasets: string[];
  categories: string[];
  periodicity: string[];
  years: string[];
  months: string[];
  days: string[];
  times: string[];

  countries: string[];
  regions: string[];
  provinces: string[];
  departments: string[];
}

interface SearchTerms {
  datasets: string;
  categories: string;
  periodicity: string;
  years: string;
  months: string;
  days: string;
  times: string;

  geographic: string;
}

interface ShowAll {
  datasets: boolean;
  categories: boolean;
  periodicity: boolean;
  years: boolean;
  months: boolean;
  days: boolean;
  times: boolean;
  countries: boolean;
  regions: Record<string, boolean>;
  provinces: Record<string, boolean>;
}

interface ExpandedCountries {
  [countryId: string]: boolean;
}

interface ExpandedRegions {
  [regionId: string]: boolean;
}

interface CountryWithRegions extends Country {
  regions?: RegionWithProvinces[];
  isExpanded?: boolean;
}

interface RegionWithProvinces extends Region {
  provinces?: Province[];
  isExpanded?: boolean;
}

type HierarchyProvinceNode = HierarchyProvince;

type HierarchyRegionNode = HierarchyRegion & {
  isExpanded?: boolean;
};

type HierarchyCountryNode = Omit<HierarchyCountry, "regions"> & {
  isExpanded?: boolean;
  regions: HierarchyRegionNode[];
};

// Données des filtres WASCAL
const filterData: Record<string, FilterItem[]> = {
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
    {
      id: "NASA/GPM_L3/IMERG_FINAL_V07",
      label: "GPM",
      metrics: [],
      categories: ["climat", "eau"],
    },
    {
      id: "NASA/GIMPS",
      label: "GIMPS",
      metrics: [],
      categories: ["climat", "sol", "eau"],
    },
  ],
  categories: [
    { id: "climat", label: "Climat" },
    { id: "eau", label: "Eau" },
    { id: "vegetation", label: "Végétation" },
    { id: "sol", label: "Sol" },
  ],
  periodicity: [
    { id: "time", label: "Heure" },
    { id: "day", label: "Jour" },
    { id: "month", label: "Mois" },
    { id: "year", label: "Année" },
  ],
};

// Données temporelles
const temporalData = {
  years: Array.from({ length: 2025 - 1940 + 1 }, (_, i) => ({
    id: (1940 + i).toString(),
    label: (1940 + i).toString(),
  })),
  months: [
    { id: "01", label: "January" },
    { id: "02", label: "February" },
    { id: "03", label: "March" },
    { id: "04", label: "April" },
    { id: "05", label: "May" },
    { id: "06", label: "June" },
    { id: "07", label: "July" },
    { id: "08", label: "August" },
    { id: "09", label: "September" },
    { id: "10", label: "October" },
    { id: "11", label: "November" },
    { id: "12", label: "December" },
  ],
  days: Array.from({ length: 31 }, (_, i) => ({
    id: String(i + 1).padStart(2, "0"),
    label: String(i + 1).padStart(2, "0"),
  })),
  times: Array.from({ length: 24 }, (_, i) => ({
    id: `${i.toString().padStart(2, "0")}:00`,
    label: `${i.toString().padStart(2, "0")}:00`,
  })),
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const { user, getCurrentUser, isLoading, error } = useAuthStore();
  const { addSelection, removeSelection, selectedEntities } =
    useGeographicStore();

  // Get current location using window.location
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Navigation function
  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  // Geographic data states
  const [countries, setCountries] = useState<CountryWithRegions[]>([]);
  const [loadingGeographic, setLoadingGeographic] = useState(false);
  const [searchResults, setSearchResults] = useState<
    HierarchyCountryNode[] | null
  >(null);

  const getLocalizedFilterData = (): Record<string, FilterItem[]> => ({
    ...filterData,
    categories: [
      { id: "climat", label: t.geography?.climate || "Climate" },
      { id: "eau", label: t.geography?.water || "Water" },
      { id: "vegetation", label: t.geography?.vegetation || "Vegetation" },
      { id: "sol", label: t.geography?.soil || "Soil" },
    ],
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
    periodicity: false,
    geographic: false,
  });

  // États pour les filtres sélectionnés
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    datasets: [],
    categories: [],
    periodicity: [],
    years: [],
    months: [],
    days: [],
    times: [],
    countries: [],
    regions: [],
    provinces: [],
    departments: [],
  });

  const [availableDays, setAvailableDays] = useState<FilterItem[]>(
    temporalData.days
  );

  // Force re-render key when language changes
  const [languageRenderKey, setLanguageRenderKey] = useState(0);

  // États pour la recherche dans les filtres
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    datasets: "",
    categories: "",
    periodicity: "",
    years: "",
    months: "",
    days: "",
    times: "",
    geographic: "",
  });

  // États pour "Montrer plus/moins"
  const [showAll, setShowAll] = useState<ShowAll>({
    datasets: false,
    categories: false,
    periodicity: false,
    years: false,
    months: false,
    days: false,
    times: false,
    countries: false,
    regions: {},
    provinces: {},
  });

  const isActiveRoute = (href: string): boolean => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const handleNavigation = (href: string) => {
    navigateTo(href);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  useEffect(() => {
    const year = selectedFilters.years[0]
      ? parseInt(selectedFilters.years[0], 10)
      : undefined;
    const month = selectedFilters.months[0]
      ? parseInt(selectedFilters.months[0], 10)
      : undefined;
    const daysInMonth = year && month ? getDaysInMonth(year, month) : 31;

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => ({
      id: String(i + 1).padStart(2, "0"),
      label: String(i + 1).padStart(2, "0"),
    }));
    setAvailableDays(daysArray);
    setSelectedFilters((prev) => ({
      ...prev,
      days: prev.days.filter((day) => parseInt(day, 10) <= daysInMonth),
    }));
  }, [selectedFilters.months, selectedFilters.years]);

  // Load geographic data on component mount and when language changes
  useEffect(() => {
    // Clear cache when language changes to ensure fresh data
    geographicService.clearCache();
    loadCountries();
    // Force re-render of country names
    setLanguageRenderKey((prev) => prev + 1);
  }, [language]);

  // Force re-render when language changes by re-running search
  useEffect(() => {
    if (searchTerms.geographic.length >= 2) {
      // Re-run search with new language
      const searchAgain = async () => {
        try {
          setLoadingGeographic(true);
          const results = await geographicService.searchHierarchy(
            searchTerms.geographic,
            language
          );
          setSearchResults(
            results.map((c) => ({
              ...c,
              isExpanded: true,
              regions: c.regions.map((r) => ({ ...r, isExpanded: true })),
            }))
          );
        } catch (error) {
          console.error("Error re-searching after language change:", error);
          setSearchResults(null);
        } finally {
          setLoadingGeographic(false);
        }
      };
      searchAgain();
    }
  }, [language]); // This effect runs when language changes

  // Handle geographic search with optimized debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchTerms.geographic.length >= 2) {
        try {
          setLoadingGeographic(true);
          console.log(`🔍 Starting search for: "${searchTerms.geographic}"`);
          const startTime = performance.now();

          const results = await geographicService.searchHierarchy(
            searchTerms.geographic,
            language
          );

          const endTime = performance.now();
          console.log(
            `⚡ Search completed in ${Math.round(endTime - startTime)}ms`
          );

          setSearchResults(
            results.map((c) => ({
              ...c,
              isExpanded: true,
              regions: c.regions.map((r) => ({ ...r, isExpanded: true })),
            }))
          );
        } catch (error) {
          console.error("Error searching geographic entities:", error);
          setSearchResults(null);
        } finally {
          setLoadingGeographic(false);
        }
      } else {
        setSearchResults(null);
        setLoadingGeographic(false);
      }
    }, 200); // Réduit de 300ms à 200ms pour plus de réactivité

    // Indicateur de recherche immédiat
    if (searchTerms.geographic.length >= 2) {
      setLoadingGeographic(true);
    }

    return () => {
      clearTimeout(delayedSearch);
    };
  }, [searchTerms.geographic, language]);

  // Sync selected entities with local filter state on mount
  useEffect(() => {
    const countries = selectedEntities
      .filter((entity) => entity.type === "country")
      .map((entity) => entity.id);
    const regions = selectedEntities
      .filter((entity) => entity.type === "region")
      .map((entity) => entity.id);
    const provinces = selectedEntities
      .filter((entity) => entity.type === "province")
      .map((entity) => entity.id);
    const departments = selectedEntities
      .filter((entity) => entity.type === "department")
      .map((entity) => entity.id);

    setSelectedFilters((prev) => ({
      ...prev,
      countries,
      regions,
      provinces,
      departments,
    }));
  }, [selectedEntities]);

  const loadCountries = async () => {
    setLoadingGeographic(true);
    try {
      const countriesData = await geographicService.getCountries();
      setCountries(
        countriesData.map((country) => ({ ...country, isExpanded: false }))
      );
    } catch (error) {
      console.error("Error loading countries:", error);
    } finally {
      setLoadingGeographic(false);
    }
  };

  const toggleCountryExpansion = async (countryId: number) => {
    const country = countries.find((c) => c.id === countryId);
    if (!country) return;

    if (!country.regions) {
      // Load regions for this country
      try {
        const regions = await geographicService.getCountryRegions(countryId);
        setCountries((prev) =>
          prev.map((c) =>
            c.id === countryId
              ? {
                  ...c,
                  regions: regions.map((r) => ({ ...r, isExpanded: false })),
                  isExpanded: true,
                }
              : c
          )
        );
      } catch (error) {
        console.error(`Error loading regions for country ${countryId}:`, error);
      }
    } else {
      // Toggle expansion
      setCountries((prev) =>
        prev.map((c) =>
          c.id === countryId ? { ...c, isExpanded: !c.isExpanded } : c
        )
      );
    }
  };

  const toggleRegionExpansion = async (countryId: number, regionId: number) => {
    const country = countries.find((c) => c.id === countryId);
    const region = country?.regions?.find((r) => r.id === regionId);
    if (!country || !region) return;

    if (!region.provinces) {
      // Load provinces for this region
      try {
        const provinces = await geographicService.getRegionProvinces(regionId);
        setCountries((prev) =>
          prev.map((c) =>
            c.id === countryId
              ? {
                  ...c,
                  regions: c.regions?.map((r) =>
                    r.id === regionId
                      ? { ...r, provinces, isExpanded: true }
                      : r
                  ),
                }
              : c
          )
        );
      } catch (error) {
        console.error(`Error loading provinces for region ${regionId}:`, error);
      }
    } else {
      // Toggle expansion
      setCountries((prev) =>
        prev.map((c) =>
          c.id === countryId
            ? {
                ...c,
                regions: c.regions?.map((r) =>
                  r.id === regionId ? { ...r, isExpanded: !r.isExpanded } : r
                ),
              }
            : c
        )
      );
    }
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
    // {
    //   icon: ChartBarIcon,
    //   label: t.analytics,
    //   href: "/analytics",
    //   active: isActiveRoute("/analytics"),
    // },
    // {
    //   icon: EyeIcon,
    //   label: t.monitoring,
    //   href: "/monitoring",
    //   active: isActiveRoute("/monitoring"),
    // },
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
      icon: EyeIcon,
      label: t.overview,
      href: "/overview",
      active: isActiveRoute("/overview"),
    },
    {
      icon: FolderIcon,
      label: t.datasets,
      href: "/datasets",
      active: isActiveRoute("/datasets"),
    },
    {
      icon: CloudIcon,
      label: t.weather,
      href: "/weather",
      active: isActiveRoute("/weather"),
    },
    {
      icon: HomeIcon,
      label: t.users,
      href: "/users",
      active: isActiveRoute("/users"),
    },
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

  const handleSearch = (section: keyof SearchTerms, term: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [section]: term,
    }));
  };

  const toggleShowAll = (section: keyof ShowAll, id?: string) => {
    setShowAll((prev) => {
      if (section === "regions" || section === "provinces") {
        if (!id) return prev;
        return {
          ...prev,
          [section]: {
            ...(prev[section] as Record<string, boolean>),
            [id]: !(prev[section] as Record<string, boolean>)[id],
          },
        };
      }
      return {
        ...prev,
        [section]: !(prev[section] as boolean),
      };
    });
  };

  const getFilteredItems = (section: keyof typeof filterData) => {
    const localizedData = getLocalizedFilterData();
    let items = localizedData[section];
    const searchTerm = searchTerms[section as keyof SearchTerms].toLowerCase();

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

  const shouldShowToggle = (section: keyof typeof filterData) => {
    const localizedData = getLocalizedFilterData();
    const items = localizedData[section];
    const searchTerm = searchTerms[section as keyof SearchTerms].toLowerCase();
    const filteredCount = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm)
    ).length;

    return filteredCount > 5;
  };

  // Icônes pour les sections de filtres
  const filterSectionIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    datasets: FolderIcon,
    categories: Squares2X2Icon,
    periodicity: CalendarIcon,
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
    const key = section as keyof SelectedFilters;

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

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  className="w-3 h-3 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                  checked={
                    selectedFilters[key].length === filterData[section].length
                  }
                  onChange={() => {
                    if (
                      selectedFilters[key].length === filterData[section].length
                    ) {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [key]: [],
                      }));
                    } else {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [key]: filterData[section].map((item) => item.id),
                      }));
                    }
                  }}
                />
                <span>{t.sidebar?.select_all || "Select all"}</span>
              </label>
            </div>

            {/* Liste des éléments */}
            <div className={`space-y-1 max-h-60 overflow-y-auto`}>
              {filteredItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                    checked={selectedFilters[key].includes(item.id)}
                    onChange={() => handleFilterToggle(key, item.id)}
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

  // Fonction spécifique pour le rendu des filtres temporels
  const renderTemporalFilterSection = (
    section: keyof typeof temporalData,
    title: string
  ) => {
    const isExpanded = expandedSections[section as keyof ExpandedSections];
    const items = section === "days" ? availableDays : temporalData[section];
    const searchTerm = searchTerms[section as keyof SearchTerms];
    const selectedItems = selectedFilters[section as keyof SelectedFilters];

    // Filtrage des éléments selon le terme de recherche
    const filteredItems = items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limitation des éléments affichés (show more/less)
    const itemsToShow = showAll[section as keyof ShowAll]
      ? filteredItems
      : filteredItems.slice(0, 5);

    const SectionIcon =
      section === "years"
        ? CalendarRange
        : section === "months"
        ? CalendarDateRangeIcon
        : section === "days"
        ? CalendarDaysIcon
        : section === "times"
        ? CalendarClock
        : CalendarIcon; // icon par défaut

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
            {/* Barre de recherche */}
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
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    [section]: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  className="w-3 h-3 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                  checked={selectedItems.length === items.length}
                  onChange={() => {
                    if (selectedItems.length === items.length) {
                      // Désélectionner tout
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [section]: [],
                      }));
                    } else {
                      // Sélectionner tout
                      setSelectedFilters((prev) => ({
                        ...prev,
                        [section]: items.map((item) => item.id),
                      }));
                    }
                  }}
                />
                <span>{t.sidebar?.select_all || "Select all"}</span>
              </label>
            </div>

            {/* Liste des éléments */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {itemsToShow.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => {
                      const isSelected = selectedItems.includes(item.id);
                      if (isSelected) {
                        setSelectedFilters((prev) => ({
                          ...prev,
                          [section]: prev[
                            section as keyof SelectedFilters
                          ].filter((id) => id !== item.id),
                        }));
                      } else {
                        setSelectedFilters((prev) => ({
                          ...prev,
                          [section]: [
                            ...prev[section as keyof SelectedFilters],
                            item.id,
                          ],
                        }));
                      }
                    }}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Bouton Montrer plus/moins */}
            {filteredItems.length > 5 && (
              <button
                onClick={() =>
                  setShowAll((prev) => ({
                    ...prev,
                    [section]: !prev[section as keyof ShowAll],
                  }))
                }
                className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                {showAll[section as keyof ShowAll]
                  ? t.sidebar?.show_less || "Show less"
                  : t.sidebar?.show_more || "Show more"}{" "}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour rendre la section Periodicity avec ses sous-sections temporelles
  const renderPeriodicitySection = () => {
    const isExpanded = expandedSections.periodicity;

    return (
      <div className="mb-3">
        {/* En-tête de section Periodicity */}
        <div
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          onClick={() => toggleSection("periodicity")}
        >
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <CalendarIcon className="w-5 h-5" />
            <span className="font-medium text-sm">
              {t.sidebar?.periodicity || "Periodicity"}
            </span>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Contenu de la section Periodicity */}
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-3">
            {renderTemporalFilterSection("years", t.sidebar?.year || "Year")}
            {renderTemporalFilterSection("months", t.sidebar?.month || "Month")}
            {renderTemporalFilterSection("days", t.sidebar?.day || "Day")}
            {renderTemporalFilterSection("times", t.sidebar?.time || "Time")}
          </div>
        )}
      </div>
    );
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

  const findNodeInTree = (
    nodes: HierarchyCountryNode[] | null,
    type: "country" | "region" | "province",
    id: string
  ): { id: number; name: string } | null => {
    if (!nodes) return null;
    for (const country of nodes) {
      if (type === "country" && country.id.toString() === id) {
        return { id: country.id, name: country.name };
      }
      for (const region of country.regions || []) {
        if (type === "region" && region.id.toString() === id) {
          return { id: region.id, name: region.name };
        }
        for (const province of region.provinces || []) {
          if (type === "province" && province.id.toString() === id) {
            return { id: province.id, name: province.name };
          }
        }
      }
    }
    return null;
  };

  const handleFilterToggle = (
    section: keyof SelectedFilters,
    itemId: string
  ) => {
    const isSelected = selectedFilters[section].includes(itemId);

    // Handle geographic selections with map integration
    if (
      section === "countries" ||
      section === "regions" ||
      section === "provinces" ||
      section === "departments"
    ) {
      // Map section names to correct entity types
      const entityTypeMap = {
        countries: "country",
        regions: "region",
        provinces: "province",
        departments: "department",
      } as const;
      const entityType = entityTypeMap[section as keyof typeof entityTypeMap];

      if (isSelected) {
        // Remove from both local state and geographic store
        removeSelection(itemId, entityType);
      } else {
        // Add to geographic store with proper entity data
        let entityName = "";

        if (section === "countries") {
          const node = findNodeInTree(searchResults, "country", itemId);
          const country = countries.find((c) => c.id.toString() === itemId);
          entityName =
            node?.name || (country ? getCountryName(country, language) : "");
        } else if (section === "regions") {
          const node = findNodeInTree(searchResults, "region", itemId);
          if (node) {
            entityName = node.name;
          } else {
            for (const country of countries) {
              const region = country.regions?.find(
                (r) => r.id.toString() === itemId
              );
              if (region) {
                entityName = region.shape_name;
                break;
              }
            }
          }
        } else if (section === "provinces") {
          const node = findNodeInTree(searchResults, "province", itemId);
          if (node) {
            entityName = node.name;
          } else {
            for (const country of countries) {
              for (const region of country.regions || []) {
                const province = region.provinces?.find(
                  (p) => p.id.toString() === itemId
                );
                if (province) {
                  entityName = province.shape_name;
                  break;
                }
              }
            }
          }
        } else if (section === "departments") {
          // Departments not included in search results tree
        }

        addSelection({
          id: itemId,
          type: entityType,
          name: entityName,
        }).catch((error) => {
          console.error(
            `Failed to add selection for ${entityType} ${itemId}:`,
            error
          );
        });
      }
    }

    // Update local filter state
    setSelectedFilters((prev) => ({
      ...prev,
      [section]: isSelected
        ? prev[section].filter((id) => id !== itemId)
        : [...prev[section], itemId],
    }));
  };

  const handleSelectAll = (
    section: keyof SelectedFilters,
    itemIds: string[]
  ) => {
    const allSelected = itemIds.every((id) =>
      selectedFilters[section].includes(id)
    );

    itemIds.forEach((id) => {
      const isSelected = selectedFilters[section].includes(id);
      if (allSelected) {
        if (isSelected) {
          handleFilterToggle(section, id);
        }
      } else {
        if (!isSelected) {
          handleFilterToggle(section, id);
        }
      }
    });
  };

  // const buildSearchTree = (results: any): GeographicNode[] => {
  //   if (Array.isArray(results)) {
  //     return results as GeographicNode[];
  //   }

  //   const countryMap = new Map<number, GeographicNode>();
  //   const regionCountryMap = new Map<number, number>();

  //   results.countries.forEach((c: any) => {
  //     countryMap.set(c.id, {
  //       id: c.id,
  //       name: c.country_name || getCountryName(c, language),
  //       type: "country",
  //       children: [],
  //       isExpanded: true,
  //     });
  //   });

  //   results.regionsWithCountry.forEach((r: any) => {
  //     regionCountryMap.set(r.id, r.country_id);
  //     let countryNode = countryMap.get(r.country_id);
  //     if (!countryNode) {
  //       countryNode = {
  //         id: r.country_id,
  //         name: r.country_name || "Unknown Country",
  //         type: "country",
  //         children: [],
  //         isExpanded: true,
  //       };
  //       countryMap.set(r.country_id, countryNode);
  //     }
  //     countryNode.children?.push({
  //       id: r.id,
  //       name: r.shape_name,
  //       type: "region",
  //       children: [],
  //       isExpanded: true,
  //     });
  //   });

  //   results.provincesWithHierarchy.forEach((p: any) => {
  //     const countryId = regionCountryMap.get(p.region_id);
  //     if (countryId == null) return;
  //     let countryNode = countryMap.get(countryId);
  //     if (!countryNode) {
  //       countryNode = {
  //         id: countryId,
  //         name: p.country_name || "Unknown Country",
  //         type: "country",
  //         children: [],
  //         isExpanded: true,
  //       };
  //       countryMap.set(countryId, countryNode);
  //     }
  //     let regionNode = countryNode.children?.find(
  //       (c) => c.type === "region" && c.id === p.region_id
  //     );
  //     if (!regionNode) {
  //       regionNode = {
  //         id: p.region_id,
  //         name: p.region_name || "Unknown Region",
  //         type: "region",
  //         children: [],
  //         isExpanded: true,
  //       };
  //       countryNode.children?.push(regionNode);
  //     }
  //     regionNode.children = regionNode.children || [];
  //     regionNode.children.push({
  //       id: p.id,
  //       name: p.shape_name,
  //       type: "province",
  //     });
  //   });

  //   return Array.from(countryMap.values());
  // };

  const toggleSearchNodeExpansion = (
    type: "country" | "region",
    id: number
  ) => {
    setSearchResults((prev) =>
      prev
        ? prev.map((country) => {
            if (type === "country" && country.id === id) {
              return { ...country, isExpanded: !country.isExpanded };
            }
            if (type === "region") {
              return {
                ...country,
                regions: country.regions?.map((region) =>
                  region.id === id
                    ? { ...region, isExpanded: !region.isExpanded }
                    : region
                ),
              };
            }
            return country;
          })
        : prev
    );
  };

  const renderSearchNodes = (
    countries: HierarchyCountryNode[]
  ): React.ReactNode => {
    return countries.map((country) => {
      const countrySelected = selectedFilters.countries.includes(
        country.id.toString()
      );
      return (
        <div key={`country-${country.id}`} className="space-y-1">
          <div className="flex items-center space-x-1">
            {country.regions && country.regions.length > 0 && (
              <button
                onClick={() => toggleSearchNodeExpansion("country", country.id)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {country.isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                )}
              </button>
            )}
            <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={countrySelected}
                onChange={() =>
                  handleFilterToggle("countries", country.id.toString())
                }
                className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {country.name}
                </div>
              </div>
            </label>
          </div>
          {country.isExpanded &&
            country.regions &&
            country.regions.length > 0 && (
              <div className="ml-4 space-y-1">
                {country.regions.map((region) => {
                  const regionSelected = selectedFilters.regions.includes(
                    region.id.toString()
                  );
                  return (
                    <div key={`region-${region.id}`} className="space-y-1">
                      <div className="flex items-center space-x-1">
                        {region.provinces && region.provinces.length > 0 && (
                          <button
                            onClick={() =>
                              toggleSearchNodeExpansion("region", region.id)
                            }
                            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            {region.isExpanded ? (
                              <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        )}
                        <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={regionSelected}
                            onChange={() =>
                              handleFilterToggle(
                                "regions",
                                region.id.toString()
                              )
                            }
                            className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                              {region.name}
                            </div>
                          </div>
                        </label>
                      </div>
                      {region.isExpanded &&
                        region.provinces &&
                        region.provinces.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {region.provinces.map((province) => {
                              const provinceSelected =
                                selectedFilters.provinces.includes(
                                  province.id.toString()
                                );
                              return (
                                <div
                                  key={`province-${province.id}`}
                                  className="space-y-1"
                                >
                                  <div className="flex items-center space-x-1">
                                    <span className="w-3.5 h-3.5"></span>
                                    <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                                      <input
                                        type="checkbox"
                                        checked={provinceSelected}
                                        onChange={() =>
                                          handleFilterToggle(
                                            "provinces",
                                            province.id.toString()
                                          )
                                        }
                                        className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                          {province.name}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      );
    });
  };

  const countNodes = (countries: HierarchyCountryNode[]): number => {
    let count = 0;
    countries.forEach((country) => {
      count += 1;
      country.regions?.forEach((region) => {
        count += 1;
        region.provinces?.forEach(() => {
          count += 1;
        });
      });
    });
    return count;
  };

  // New function to render hierarchical geographic data
  const renderGeographicHierarchy = () => {
    const hasSearchTerm = searchTerms.geographic.length >= 2;
    const displayCountries = countries.filter((country) =>
      getCountryName(country, language)
        .toLowerCase()
        .includes(searchTerms.geographic.toLowerCase())
    );
    const countriesToShow = showAll.countries
      ? displayCountries
      : displayCountries.slice(0, 5);
    const showMoreCountries = displayCountries.length > 5;
    return (
      <div className="mb-3">
        <div
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          onClick={() => toggleSection("geographic")}
        >
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <GlobeAltIcon className="w-5 h-5" />
            <span className="font-medium text-sm">
              {t.sidebar?.geographic || "Geographic"}
            </span>
          </div>
          <div className="flex items-center">
            {expandedSections.geographic ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {expandedSections.geographic && (
          <div className="ml-6 mt-2 space-y-2">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ISO code, capital..."
                value={searchTerms.geographic}
                onChange={(e) =>
                  setSearchTerms((prev) => ({
                    ...prev,
                    geographic: e.target.value,
                  }))
                }
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {loadingGeographic ? (
              <div className="flex items-center space-x-2 py-3 px-2">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Searching "{searchTerms.geographic}"...
                </span>
              </div>
            ) : hasSearchTerm && searchResults ? (
              searchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                    {countNodes(searchResults)} result(s) for "
                    {searchTerms.geographic}"
                  </div>
                  {renderSearchNodes(searchResults)}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">
                  No results found for "{searchTerms.geographic}"
                </div>
              )
            ) : (
              // Render hierarchical tree view when no search
              <div className="space-y-1">
                {(() => {
                  const countryIds = displayCountries.map((c) =>
                    c.id.toString()
                  );
                  const allSelected = countryIds.every((id) =>
                    selectedFilters.countries.includes(id)
                  );
                  return (
                    <label className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() =>
                          handleSelectAll("countries", countryIds)
                        }
                        className="w-3.5 h-3.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {t.sidebar?.select_all || "Select all"}
                      </span>
                    </label>
                  );
                })()}
                {countriesToShow.map((country) => {
                  // Find corresponding country in the hierarchy data
                  const hierarchyCountry = countries.find(
                    (c) => c.id === country.id
                  ) as CountryWithRegions | undefined;
                  return (
                    <div
                      key={`${country.id}-${languageRenderKey}`}
                      className="space-y-1"
                    >
                      {/* Country Level */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleCountryExpansion(country.id)}
                          className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {hierarchyCountry?.isExpanded ? (
                            <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                        <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedFilters.countries.includes(
                              country.id.toString()
                            )}
                            onChange={() =>
                              handleFilterToggle(
                                "countries",
                                country.id.toString()
                              )
                            }
                            className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                {getCountryName(country, language)}
                              </div>
                              {selectedEntities.find(
                                (e) =>
                                  e.id === country.id.toString() &&
                                  e.type === "country"
                              )?.isLoading && (
                                <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            {country.shape_iso && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {country.shape_iso}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Regions Level */}
                      {hierarchyCountry?.isExpanded &&
                        hierarchyCountry?.regions && (
                          <div className="ml-4 space-y-1">
                            {(() => {
                              const regionIds = hierarchyCountry.regions.map(
                                (r) => r.id.toString()
                              );
                              const allRegionsSelected = regionIds.every((id) =>
                                selectedFilters.regions.includes(id)
                              );
                              return (
                                <label className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={allRegionsSelected}
                                    onChange={() =>
                                      handleSelectAll("regions", regionIds)
                                    }
                                    className="w-3.5 h-3.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                                  />
                                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    {t.sidebar?.select_all || "Select all"}
                                  </span>
                                </label>
                              );
                            })()}
                            {(showAll.regions[country.id.toString()]
                              ? hierarchyCountry.regions
                              : hierarchyCountry.regions.slice(0, 5)
                            ).map((region: RegionWithProvinces) => (
                              <div key={region.id} className="space-y-1">
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() =>
                                      toggleRegionExpansion(
                                        country.id,
                                        region.id
                                      )
                                    }
                                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                    {region.isExpanded ? (
                                      <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                                    ) : (
                                      <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>
                                  <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedFilters.regions.includes(
                                        region.id.toString()
                                      )}
                                      onChange={() =>
                                        handleFilterToggle(
                                          "regions",
                                          region.id.toString()
                                        )
                                      }
                                      className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                          {region.shape_name}
                                        </div>
                                        {selectedEntities.find(
                                          (e) =>
                                            e.id === region.id.toString() &&
                                            e.type === "region"
                                        )?.isLoading && (
                                          <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                </div>

                                {/* Provinces Level */}
                                {region.isExpanded && region.provinces && (
                                  <div className="ml-4 space-y-1">
                                    {(() => {
                                      const provinceIds = region.provinces.map(
                                        (p) => p.id.toString()
                                      );
                                      const allProvincesSelected =
                                        provinceIds.every((id) =>
                                          selectedFilters.provinces.includes(id)
                                        );
                                      return (
                                        <label className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={allProvincesSelected}
                                            onChange={() =>
                                              handleSelectAll(
                                                "provinces",
                                                provinceIds
                                              )
                                            }
                                            className="w-3.5 h-3.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                                          />
                                          <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                                            {t.sidebar?.select_all ||
                                              "Select all"}
                                          </span>
                                        </label>
                                      );
                                    })()}
                                    {(showAll.provinces[region.id.toString()]
                                      ? region.provinces
                                      : region.provinces.slice(0, 5)
                                    ).map((province: Province) => (
                                      <div
                                        key={province.id}
                                        className="flex items-center space-x-1"
                                      >
                                        <span className="w-3.5 h-3.5"></span>
                                        <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                                          <input
                                            type="checkbox"
                                            checked={selectedFilters.provinces.includes(
                                              province.id.toString()
                                            )}
                                            onChange={() =>
                                              handleFilterToggle(
                                                "provinces",
                                                province.id.toString()
                                              )
                                            }
                                            className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                              <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                                                {province.shape_name}
                                              </div>
                                              {selectedEntities.find(
                                                (e) =>
                                                  e.id ===
                                                    province.id.toString() &&
                                                  e.type === "province"
                                              )?.isLoading && (
                                                <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                              )}
                                            </div>
                                          </div>
                                        </label>
                                      </div>
                                    ))}
                                    {region.provinces.length > 5 && (
                                      <button
                                        onClick={() =>
                                          toggleShowAll(
                                            "provinces",
                                            region.id.toString()
                                          )
                                        }
                                        className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                      >
                                        {showAll.provinces[region.id.toString()]
                                          ? t.sidebar?.show_less || "Show less"
                                          : t.sidebar?.show_more || "Show more"}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {hierarchyCountry.regions.length > 5 && (
                              <button
                                onClick={() =>
                                  toggleShowAll(
                                    "regions",
                                    country.id.toString()
                                  )
                                }
                                className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
                              >
                                {showAll.regions[country.id.toString()]
                                  ? t.sidebar?.show_less || "Show less"
                                  : t.sidebar?.show_more || "Show more"}
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  ); // Fermeture du map pour displayCountries
                })}
                {showMoreCountries && (
                  <button
                    onClick={() => toggleShowAll("countries")}
                    className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    {showAll.countries
                      ? t.sidebar?.show_less || "Show less"
                      : t.sidebar?.show_more || "Show more"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
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
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Contenu principal - scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              <SidebarSection
                title={t.sidebar?.main || "Main"}
                items={menuItems}
                sectionKey="main"
              />
              {/* <SidebarSection
                title={t.dataLayers}
                items={dataItems}
                sectionKey="dataLayers"
              /> */}
              {/* <SidebarSection
                title={t.tools}
                items={toolItems}
                sectionKey="tools"
              /> */}
              {/* <SidebarSection
                title={t.sidebar?.management || "Management"}
                items={otherItems}
                sectionKey="management"
              /> */}

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
                    {/* {getTotalSelectedFilters() > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {getTotalSelectedFilters()}
                      </span>
                    )} */}
                  </div>
                  {expandedSections.filters ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {expandedSections.filters && (
                  <div className="space-y-1">
                    {renderFilterSection(
                      "categories",
                      t.sidebar?.categories || "Categories"
                    )}
                    {renderFilterSection("datasets", t.datasets, true)}
                    {renderPeriodicitySection()}
                    {renderGeographicHierarchy()}
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
