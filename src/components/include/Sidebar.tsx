import React, { useState } from "react";
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
  // Nouveaux icons pour les filtres
  AdjustmentsHorizontalIcon,
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

// Données des filtres WASCAL
const filterData = {
  dataset:[
    {id: "", label: "", metrics: []},
    {id: "", label: "", metrics: []},
    {id: "", label: "Landsat8", metrics: []},
    {id: "", label: "Landsat9", metrics: []},
    {id: "", label: "Copernicus", metrics: []},
    {id: "", label: "ERA5", metrics: []},
    {id: "", label: "CHIRPS", metrics: []},
    {id: "NASA/GPM_L3/IMERG_V07", label: "", metrics: []},
    {id: "MERIT/DEM/v1_0_3", label: "", metrics: []},
    {id: "NOAA/GOES/16/MCMIPF", label: "", metrics: []},
  ],
  categories: [
    { id: 'climat', label: 'Climat', icon: '🌡️', subItems: ['Température', 'Précipitations', 'Humidité', 'Vent'] },
    { id: 'vegetation', label: 'Végétation', icon: '🌱', subItems: ['NDVI', 'NDWI', 'EVI', 'Couverture forestière'] },
    { id: 'sol', label: 'Sol', icon: '🌍', subItems: ['Humidité du sol', 'Température du sol', 'Érosion'] }
  ],
  pays: [
    { id: 'benin', label: 'Bénin', capital: 'Porto-Novo' },
    { id: 'burkina-faso', label: 'Burkina Faso', capital: 'Ouagadougou' },
    { id: 'cote-ivoire', label: 'Côte d\'Ivoire', capital: 'Yamoussoukro' },
    { id: 'gambie', label: 'Gambie', capital: 'Banjul' },
    { id: 'ghana', label: 'Ghana', capital: 'Accra' },
    { id: 'mali', label: 'Mali', capital: 'Bamako' },
    { id: 'niger', label: 'Niger', capital: 'Niamey' },
    { id: 'nigeria', label: 'Nigeria', capital: 'Abuja' },
    { id: 'togo', label: 'Togo', capital: 'Lomé' },
    { id: 'cap-vert', label: 'Cap-Vert', capital: 'Praia' },
    { id: 'senegal', label: 'Sénégal', capital: 'Dakar' },
    { id: 'mauritanie', label: 'Mauritanie', capital: 'Nouakchott' }
  ],
  regions: [
    { id: 'centre', label: 'Centre', pays: 'Burkina Faso' },
    { id: 'boucle-mouhoun', label: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'cascades', label: 'Cascades', pays: 'Burkina Faso' },
    { id: 'centre-est', label: 'Centre-Est', pays: 'Burkina Faso' },
    { id: 'centre-nord', label: 'Centre-Nord', pays: 'Burkina Faso' },
    { id: 'centre-ouest', label: 'Centre-Ouest', pays: 'Burkina Faso' },
    { id: 'centre-sud', label: 'Centre-Sud', pays: 'Burkina Faso' },
    { id: 'est', label: 'Est', pays: 'Burkina Faso' },
    { id: 'hauts-bassins', label: 'Hauts-Bassins', pays: 'Burkina Faso' },
    { id: 'nord', label: 'Nord', pays: 'Burkina Faso' },
    { id: 'plateau-central', label: 'Plateau Central', pays: 'Burkina Faso' },
    { id: 'sahel', label: 'Sahel', pays: 'Burkina Faso' },
    { id: 'sud-ouest', label: 'Sud-Ouest', pays: 'Burkina Faso' },
    { id: 'ashanti', label: 'Ashanti', pays: 'Ghana' },
    { id: 'greater-accra', label: 'Greater Accra', pays: 'Ghana' },
    { id: 'northern', label: 'Northern', pays: 'Ghana' },
    { id: 'western', label: 'Western', pays: 'Ghana' },
    { id: 'central', label: 'Central', pays: 'Ghana' },
    { id: 'volta', label: 'Volta', pays: 'Ghana' },
    { id: 'lagos', label: 'Lagos', pays: 'Nigeria' },
    { id: 'kano', label: 'Kano', pays: 'Nigeria' },
    { id: 'abuja', label: 'Abuja FCT', pays: 'Nigeria' },
    { id: 'rivers', label: 'Rivers', pays: 'Nigeria' },
    { id: 'kaduna', label: 'Kaduna', pays: 'Nigeria' },
    { id: 'ogun', label: 'Ogun', pays: 'Nigeria' },
    { id: 'dakar', label: 'Dakar', pays: 'Sénégal' },
    { id: 'thies', label: 'Thiès', pays: 'Sénégal' },
    { id: 'kaolack', label: 'Kaolack', pays: 'Sénégal' },
    { id: 'maritime', label: 'Maritime', pays: 'Togo' },
    { id: 'plateaux', label: 'Plateaux', pays: 'Togo' },
    { id: 'centrale', label: 'Centrale', pays: 'Togo' },
    { id: 'atlantique', label: 'Atlantique', pays: 'Bénin' },
    { id: 'littoral', label: 'Littoral', pays: 'Bénin' },
    { id: 'oueme', label: 'Ouémé', pays: 'Bénin' },
    { id: 'bamako', label: 'Bamako', pays: 'Mali' },
    { id: 'kayes', label: 'Kayes', pays: 'Mali' },
    { id: 'koulikoro', label: 'Koulikoro', pays: 'Mali' },
    { id: 'niamey', label: 'Niamey', pays: 'Niger' },
    { id: 'dosso', label: 'Dosso', pays: 'Niger' },
    { id: 'maradi', label: 'Maradi', pays: 'Niger' }
  ],
  provinces: [
    { id: 'kadiogo', label: 'Kadiogo', region: 'Centre', pays: 'Burkina Faso' },
    { id: 'bale', label: 'Balé', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'banwa', label: 'Banwa', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'kossi', label: 'Kossi', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'mouhoun', label: 'Mouhoun', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'nayala', label: 'Nayala', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'sourou', label: 'Sourou', region: 'Boucle du Mouhoun', pays: 'Burkina Faso' },
    { id: 'comoe', label: 'Comoé', region: 'Cascades', pays: 'Burkina Faso' },
    { id: 'leraba', label: 'Léraba', region: 'Cascades', pays: 'Burkina Faso' },
    { id: 'boulgou', label: 'Boulgou', region: 'Centre-Est', pays: 'Burkina Faso' },
    { id: 'koulpelogo', label: 'Koulpélogo', region: 'Centre-Est', pays: 'Burkina Faso' },
    { id: 'kouritenga', label: 'Kouritenga', region: 'Centre-Est', pays: 'Burkina Faso' },
    { id: 'bam', label: 'Bam', region: 'Centre-Nord', pays: 'Burkina Faso' },
    { id: 'namentenga', label: 'Namentenga', region: 'Centre-Nord', pays: 'Burkina Faso' },
    { id: 'sanmatenga', label: 'Sanmatenga', region: 'Centre-Nord', pays: 'Burkina Faso' },
    { id: 'boulkiemde', label: 'Boulkiemdé', region: 'Centre-Ouest', pays: 'Burkina Faso' },
    { id: 'sanguie', label: 'Sanguié', region: 'Centre-Ouest', pays: 'Burkina Faso' },
    { id: 'sissili', label: 'Sissili', region: 'Centre-Ouest', pays: 'Burkina Faso' },
    { id: 'ziro', label: 'Ziro', region: 'Centre-Ouest', pays: 'Burkina Faso' }
  ]
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations();
  const { user, getCurrentUser, isLoading, error } = useAuthStore();

  // États pour l'expansion des sections
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    dataLayers: true,
    tools: true,
    management: true,
    filters: true,
    categories: false,
    pays: false,
    regions: false,
    provinces: false
  });

  // États pour les filtres sélectionnés
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    pays: [],
    regions: [],
    provinces: []
  });

  // États pour la recherche dans les filtres
  const [searchTerms, setSearchTerms] = useState({
    categories: '',
    pays: '',
    regions: '',
    provinces: ''
  });

  // États pour "Montrer plus/moins"
  const [showAll, setShowAll] = useState({
    categories: false,
    pays: false,
    regions: false,
    provinces: false
  });

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFilter = (section, filterId) => {
    setSelectedFilters(prev => ({
      ...prev,
      [section]: prev[section].includes(filterId)
        ? prev[section].filter(id => id !== filterId)
        : [...prev[section], filterId]
    }));
  };

  const handleSearch = (section, term) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: term
    }));
  };

  const toggleShowAll = (section) => {
    setShowAll(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFilteredItems = (section) => {
    const items = filterData[section];
    const searchTerm = searchTerms[section].toLowerCase();
    
    let filtered = items.filter(item => 
      item.label.toLowerCase().includes(searchTerm)
    );

    const maxVisible = 5;
    if (!showAll[section] && filtered.length > maxVisible) {
      filtered = filtered.slice(0, maxVisible);
    }

    return filtered;
  };

  const shouldShowToggle = (section) => {
    const items = filterData[section];
    const searchTerm = searchTerms[section].toLowerCase();
    const filteredCount = items.filter(item => 
      item.label.toLowerCase().includes(searchTerm)
    ).length;
    
    return filteredCount > 5;
  };

  // Icônes pour les sections de filtres
  const filterSectionIcons = {
    categories: Squares2X2Icon,
    pays: GlobeAmericasIcon,
    regions: BuildingOfficeIcon,
    provinces: HomeModernIcon
  };

  const renderFilterSection = (section, title, hasSearch = false) => {
    const SectionIcon = filterSectionIcons[section];
    const isExpanded = expandedSections[section];
    const filteredItems = getFilteredItems(section);

    return (
      <div key={section} className="mb-3">
        {/* En-tête de section */}
        <div 
          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          onClick={() => toggleSection(section)}
        >
          <div className="flex items-center space-x-2">
            <SectionIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{title}</span>
          </div>
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
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
                  placeholder={`Rechercher ${title.toLowerCase()}...`}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  value={searchTerms[section]}
                  onChange={(e) => handleSearch(section, e.target.value)}
                />
              </div>
            )}

            {/* Liste des éléments */}
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <label key={item.id} className="flex items-start space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 mt-0.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 bg-white dark:bg-gray-800"
                    checked={selectedFilters[section].includes(item.id)}
                    onChange={() => toggleFilter(section, item.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {/* {item.icon && <span className="mr-1">{item.icon}</span>} */}
                      {item.label}
                    </div>
                    {(item.capital || item.pays || item.region) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.capital && `Capital: ${item.capital}`}
                        {item.pays && `Pays: ${item.pays}`}
                        {item.region && `Région: ${item.region}`}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Bouton Montrer plus/moins */}
            {shouldShowToggle(section) && (
              <button
                onClick={() => toggleShowAll(section)}
                className="text-green-600 dark:text-green-400 text-xs font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                {showAll[section] ? 'Montrer moins' : 'Montrer plus'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const SidebarSection = ({
    title,
    items,
    sectionKey
  }: {
    title: string;
    items: typeof menuItems;
    sectionKey: string;
  }) => (
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
      )}
    </div>
  );

  const getInitials = (user: User | null) => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
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
    return 'U';
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      pays: [],
      regions: [],
      provinces: []
    });
  };

  const getTotalSelectedFilters = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
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
              <SidebarSection title="Principal" items={menuItems} sectionKey="main" />
              <SidebarSection title={t.dataLayers} items={dataItems} sectionKey="dataLayers" />
              <SidebarSection title={t.tools} items={toolItems} sectionKey="tools" />
              <SidebarSection title="Gestion" items={otherItems} sectionKey="management" />

              {/* Section Filtres WASCAL */}
              <div className="mb-6">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-3"
                  onClick={() => toggleSection('filters')}
                >
                  <div className="flex items-center space-x-2">
                    {/* <AdjustmentsHorizontalIcon className="w-4 h-4 text-green-600 dark:text-green-400" /> */}
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Filtres
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
                    {renderFilterSection('categories', 'Catégories')}
                    {renderFilterSection('pays', 'Pays WASCAL', true)}
                    {renderFilterSection('regions', 'Régions', true)}
                    {renderFilterSection('provinces', 'Provinces', true)}
                  </div>
                )}
              </div>
              <SidebarSection title="Réglages & Aide" items={bottomItems} sectionKey="settings" />

            </div>
          </div>

          {/* Footer avec résumé des filtres */}
          {getTotalSelectedFilters() > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">Filtres Actifs</h4>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {getTotalSelectedFilters()} sélectionné{getTotalSelectedFilters() > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(selectedFilters).map(([section, items]) => (
                    items.length > 0 && (
                      <div key={section} className="flex justify-between text-xs">
                        <span className="capitalize text-gray-600 dark:text-gray-400">{section}:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{items.length}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium py-2 px-3 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Effacer
                </button>
                <button className="flex-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium py-2 px-3 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  Appliquer
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
                      {`${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim()}
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














// import React from "react";
// import { useLanguage } from "../../hooks/useLanguage";
// import {
//   HomeIcon,
//   MapIcon,
//   ChartBarIcon,
//   CloudIcon,
//   BeakerIcon,
//   BellIcon,
//   CogIcon,
//   DocumentTextIcon,
//   QuestionMarkCircleIcon,
//   SparklesIcon,
//   CalendarIcon,
//   FolderIcon,
//   GlobeAltIcon,
//   EyeIcon,
// } from "@heroicons/react/24/outline";
// import { useTranslations } from "../../hooks/useTranslations";
// import { useAuthStore } from "../../stores/useAuthStore";
// import type { User } from "../../types/auth";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ isOpen, onClose }: SidebarProps) {
//   const t = useTranslations();
//   const { user, getCurrentUser, isLoading, error } = useAuthStore();

//   const menuItems = [
//     { icon: HomeIcon, label: t.dashboard, href: "/dashboard", active: true },
//     { icon: MapIcon, label: t.map, href: "/map" },
//     { icon: ChartBarIcon, label: t.analytics, href: "/analytics" },
//     { icon: EyeIcon, label: t.monitoring, href: "/monitoring" },
//   ];

//   const dataItems = [
//     { icon: CloudIcon, label: t.climate, href: "/data/climate" },
//     { icon: GlobeAltIcon, label: t.vegetation, href: "/data/vegetation" },
//     { icon: BeakerIcon, label: t.temperature, href: "/data/temperature" },
//     { icon: CloudIcon, label: t.precipitation, href: "/data/precipitation" },
//   ];

//   const toolItems = [
//     { icon: SparklesIcon, label: t.predictions, href: "/predictions" },
//     { icon: BellIcon, label: t.alerts, href: "/alerts" },
//     { icon: SparklesIcon, label: t.aiAssistant, href: "/ai-assistant" },
//     { icon: DocumentTextIcon, label: t.export, href: "/export" },
//   ];

//   const otherItems = [
//     { icon: FolderIcon, label: t.projects, href: "/projects" },
//     { icon: CalendarIcon, label: t.calendar, href: "/calendar" },
//     { icon: DocumentTextIcon, label: t.reports, href: "/reports" },
//     { icon: DocumentTextIcon, label: t.history, href: "/history" },
//   ];

//   const bottomItems = [
//     { icon: CogIcon, label: t.settings, href: "/settings" },
//     { icon: QuestionMarkCircleIcon, label: t.help, href: "/help" },
//   ];

//   const SidebarSection = ({
//     title,
//     items,
//   }: {
//     title: string;
//     items: typeof menuItems;
//   }) => (
//     <div className="mb-6">
//       <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
//         {title}
//       </h3>
//       <ul className="space-y-1">
//         {items.map((item) => (
//           <li key={item.href}>
//             <a
//               href={item.href}
//               className={`flex items-center p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
//                 item.active
//                   ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
//                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
//               }`}
//             >
//               <item.icon className="w-5 h-5 mr-3" />
//               {item.label}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );

//   const getInitials = (user: User | null) => {
//     if (user?.firstname && user?.lastname) {
//       return `${user.firstname.charAt(0)}${user.lastname.charAt(
//         0
//       )}`.toUpperCase();
//     }
//     if (user?.firstname) {
//       return user.firstname.charAt(0).toUpperCase();
//     }
//     if (user?.lastname) {
//       return user.lastname.charAt(0).toUpperCase();
//     }
//     if (user?.email) {
//       return user.email.charAt(0).toUpperCase();
//     }
//   };

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0`}
//       >
//         <div className="h-full px-3 py-4 overflow-y-auto">
//           <div className="space-y-2">
//             <SidebarSection title="Principal" items={menuItems} />
//             <SidebarSection title={t.dataLayers} items={dataItems} />
//             <SidebarSection title={t.tools} items={toolItems} />
//             <SidebarSection title="Gestion" items={otherItems} />
//             <SidebarSection title="" items={bottomItems} />
//           </div>

//           {/* User info at bottom */}
//           <div className="absolute bottom-4 left-3 right-3">
//             <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//               <div className="flex items-center">
//                 <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
//                   <span className="text-white text-sm font-medium">
//                     {getInitials(user)}
//                   </span>
//                 </div>
//                 <div className="ml-3 space-y-0.5">
//                   {(user?.firstname || user?.lastname) && (
//                     <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
//                       {`${user?.firstname ?? ""} ${
//                         user?.lastname ?? ""
//                       }`.trim()}
//                     </p>
//                   )}
//                   {user?.email && (
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
//                       {user.email}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }
