/**
 * Hook to detect if we're in a router context
 * Since we're using Astro routing, this always returns false
 * as we don't need React Router in Astro pages
 */
export function useRouterContext(): boolean {
  // In Astro, we use native routing, not React Router
  return false;
}

export default useRouterContext;
