import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouterContext } from "../../hooks/useRouterContext";

const NavigationTest: React.FC = () => {
  const isInRouterContext = useRouterContext();

  if (!isInRouterContext) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md">
        <h3 className="font-bold text-yellow-800">No Router Context</h3>
        <p className="text-yellow-700">
          This component is not in React Router context
        </p>
      </div>
    );
  }

  const location = useLocation();
  const navigate = useNavigate();

  const testRoutes = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/map", label: "Map" },
    { path: "/analytics", label: "Analytics" },
    { path: "/monitoring", label: "Monitoring" },
  ];

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded-md">
      <h3 className="font-bold text-green-800 mb-4">Navigation Test</h3>
      <p className="text-green-700 mb-4">
        Current path: <code>{location.pathname}</code>
      </p>

      <div className="space-x-2">
        {testRoutes.map((route) => (
          <button
            key={route.path}
            onClick={() => navigate(route.path)}
            className={`px-3 py-1 rounded text-sm ${
              location.pathname === route.path
                ? "bg-green-500 text-white"
                : "bg-white text-green-700 border border-green-300 hover:bg-green-50"
            }`}
          >
            {route.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTest;
