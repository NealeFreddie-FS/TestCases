"use client";

import { useEffect } from "react";

/**
 * Hook to debug routing issues by tracking page loads and path changes
 * @param {string} pageName - The name of the page/component using this hook
 */
export function useRoutingDebug(pageName) {
  useEffect(() => {
    console.log(
      `[${pageName}] Component mounted at path: ${window.location.pathname}`
    );

    // Log page visibility changes
    const handleVisibilityChange = () => {
      console.log(
        `[${pageName}] Document visibility changed to: ${document.visibilityState}`
      );
    };

    // Log before unload
    const handleBeforeUnload = () => {
      console.log(
        `[${pageName}] Component about to unmount from: ${window.location.pathname}`
      );
    };

    // Log navigation events
    const logNavigation = (event) => {
      console.log(
        `[${pageName}] Navigation event: ${event.type}, destination: ${document.location.pathname}`
      );
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", logNavigation);

    // Clean up event listeners on unmount
    return () => {
      console.log(
        `[${pageName}] Component unmounted from: ${window.location.pathname}`
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", logNavigation);
    };
  }, [pageName]);
}
