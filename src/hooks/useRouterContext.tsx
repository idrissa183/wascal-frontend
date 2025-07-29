import { useLocation } from "react-router-dom";

/**
 * Hook to detect if we're in a React Router context
 * Returns true if React Router is available, false otherwise
 */
export function useRouterContext(): boolean {
  try {
    useLocation();
    return true;
  } catch (error) {
    return false;
  }
}

export default useRouterContext;
