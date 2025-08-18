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
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";
import { useAuthStore } from "../../stores/useAuthStore";
import { useGeographicStore } from "../../stores/useGeographicStore";
import {
  geographicService,
  type Country,
  type Region,
  type Province,
  type Department,
} from "../../services/geographic.service";
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

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
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
  const [expandedCountries, setExpandedCountries] = useState<ExpandedCountries>(
    {}
  );
  const [expandedRegions, setExpandedRegions] = useState<ExpandedRegions>({});
  const [searchResults, setSearchResults] = useState<{
    countries: Country[];
    regionsWithCountry: (Region & { country_name?: string })[];
    provincesWithHierarchy: (Province & {
      region_name?: string;
      country_name?: string;
    })[];
    departmentsWithHierarchy: (Department & {
      province_name?: string;
      region_name?: string;
      country_name?: string;
    })[];
  } | null>(null);

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

  // Load geographic data on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Handle geographic search with optimized debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchTerms.geographic.length >= 2) {
        try {
          setLoadingGeographic(true);
          console.log(`🔍 Starting search for: "${searchTerms.geographic}"`);
          const startTime = performance.now();

          const results = await geographicService.searchGeographic(
            searchTerms.geographic
          );

          const endTime = performance.now();
          console.log(
            `⚡ Search completed in ${Math.round(endTime - startTime)}ms`
          );

          setSearchResults(results);
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
  }, [searchTerms.geographic]);

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

  // const toggleFilter = (section: keyof SelectedFilters, filterId: string) => {
  //   setSelectedFilters((prev) => ({
  //     ...prev,
  //     [section]: prev[section].includes(filterId)
  //       ? prev[section].filter((id) => id !== filterId)
  //       : [...prev[section], filterId],
  //   }));
  // };

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
                      handleFilterToggle(
                        section as keyof SelectedFilters,
                        item.id
                      )
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
    const items = temporalData[section];
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

    const SectionIcon = section === 'years' ? CalendarIcon 
      : section === 'months' ? CalendarIcon
      : section === 'days' ? CalendarIcon
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
            {/* Contrôles "Select all" / "At least one selection must be made" */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    className="w-3 h-3 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                    checked={selectedItems.length === items.length}
                    onChange={() => {
                      if (selectedItems.length === items.length) {
                        // Désélectionner tout
                        setSelectedFilters(prev => ({
                          ...prev,
                          [section]: []
                        }));
                      } else {
                        // Sélectionner tout
                        setSelectedFilters(prev => ({
                          ...prev,
                          [section]: items.map(item => item.id)
                        }));
                      }
                    }}
                  />
                  <span>Select all</span>
                </label>
              </div>
              {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                At least one selection must be made
              </div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                {title}
              </div> */}
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerms(prev => ({
                    ...prev,
                    [section]: e.target.value
                  }))
                }
              />
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
                        setSelectedFilters(prev => ({
                          ...prev,
                          [section]: prev[section as keyof SelectedFilters].filter(id => id !== item.id)
                        }));
                      } else {
                        setSelectedFilters(prev => ({
                          ...prev,
                          [section]: [...prev[section as keyof SelectedFilters], item.id]
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
                onClick={() => setShowAll(prev => ({
                  ...prev,
                  [section]: !prev[section as keyof ShowAll]
                }))}
                className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                {showAll[section as keyof ShowAll]
                  ? "Show less"
                  : "Show more"}
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
            {renderTemporalFilterSection("years", "Year")}
            {renderTemporalFilterSection("months", "Month")}
            {renderTemporalFilterSection("days", "Day")}
            {renderTemporalFilterSection("times", "Time")}
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

  // const clearAllFilters = () => {
  //   setSelectedFilters({
  //     datasets: [],
  //     categories: [],
  //     countries: [],
  //     regions: [],
  //     provinces: [],
  //   });
  // };

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
          const country = countries.find((c) => c.id.toString() === itemId);
          entityName = country?.shape_name || "";
        } else if (section === "regions") {
          for (const country of countries) {
            const region = country.regions?.find(
              (r) => r.id.toString() === itemId
            );
            if (region) {
              entityName = region.shape_name;
              break;
            }
          }
        } else if (section === "provinces") {
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
        } else if (section === "departments") {
          // For departments, we need to search through the hierarchy or use search results
          if (searchResults?.departmentsWithHierarchy) {
            const department = searchResults.departmentsWithHierarchy.find(
              (d) => d.id.toString() === itemId
            );
            if (department) {
              entityName = department.shape_name;
            }
          }
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

  // const getTotalSelectedFilters = () => {
  //   return Object.values(selectedFilters).reduce(
  //     (total, filters) => total + filters.length,
  //     0
  //   );
  // };

  // New function to render hierarchical geographic data
  const renderGeographicHierarchy = () => {
    const hasSearchTerm = searchTerms.geographic.length >= 2;
    const displayCountries =
      hasSearchTerm && searchResults
        ? searchResults.countries
        : countries.filter((country) =>
            country.shape_name
              .toLowerCase()
              .includes(searchTerms.geographic.toLowerCase())
          );

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
              // Render search results
              <div className="space-y-2">
                {/* Results summary */}
                <div className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded">
                  {searchResults.countries.length +
                    searchResults.regionsWithCountry.length +
                    searchResults.provincesWithHierarchy.length +
                    searchResults.departmentsWithHierarchy.length}
                  result(s) for "{searchTerms.geographic}"
                </div>
                {/* Countries in search results */}
                {searchResults.countries.map((country) => (
                  <div
                    key={`search-country-${country.id}`}
                    className="space-y-1"
                  >
                    <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.countries.includes(
                          country.id.toString()
                        )}
                        onChange={() =>
                          handleFilterToggle("countries", country.id.toString())
                        }
                        className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          🌍 {country.shape_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {country.shape_iso || country.shape_iso_2}
                          {country.shape_city &&
                            ` • Capital: ${country.shape_city}`}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {/* Regions in search results */}
                {searchResults.regionsWithCountry.map((region) => (
                  <div key={`search-region-${region.id}`} className="space-y-1">
                    <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.regions.includes(
                          region.id.toString()
                        )}
                        onChange={() =>
                          handleFilterToggle("regions", region.id.toString())
                        }
                        className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          📍 {region.shape_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Region in {region.country_name}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {/* Provinces in search results */}
                {searchResults.provincesWithHierarchy.map((province) => (
                  <div
                    key={`search-province-${province.id}`}
                    className="space-y-1"
                  >
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
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          🏛️ {province.shape_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Province in {province.region_name},{" "}
                          {province.country_name}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {/* Departments in search results */}
                {searchResults.departmentsWithHierarchy.map((department) => (
                  <div
                    key={`search-department-${department.id}`}
                    className="space-y-1"
                  >
                    <label className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFilters.departments.includes(
                          department.id.toString()
                        )}
                        onChange={() =>
                          handleFilterToggle(
                            "departments",
                            department.id.toString()
                          )
                        }
                        className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          📌 {department.shape_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Department in {department.province_name},{" "}
                          {department.region_name}, {department.country_name}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {/* No results message */}
                {searchResults.countries.length === 0 &&
                  searchResults.regionsWithCountry.length === 0 &&
                  searchResults.provincesWithHierarchy.length === 0 &&
                  searchResults.departmentsWithHierarchy.length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 py-2 text-center">
                      No results found for "{searchTerms.geographic}"
                    </div>
                  )}
              </div>
            ) : (
              // Render hierarchical tree view when no search
              <div className="space-y-1">
                {displayCountries.map((country) => {
                  // Find corresponding country in the hierarchy data
                  const hierarchyCountry = countries.find(
                    (c) => c.id === country.id
                  ) as CountryWithRegions | undefined;
                  return (
                    <div key={country.id} className="space-y-1">
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
                                {country.shape_name}
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
                            {hierarchyCountry.regions.map(
                              (region: RegionWithProvinces) => (
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
                                      {region.provinces.map(
                                        (province: Province) => (
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
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ); // Fermeture du map pour displayCountries
                })}
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

          {/* Footer avec résumé des filtres */}
          {/* {getTotalSelectedFilters() > 0 && (
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
              </div> */}

          {/* Actions */}
          {/* <div className="flex space-x-2">
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
            </div> */}

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
