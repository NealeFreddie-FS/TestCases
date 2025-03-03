import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

// Define a custom render function that includes providers if needed
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // Add any custom options here, such as initial state for providers
  initialState?: Record<string, any>;
  route?: string;
}

/**
 * Custom render function that wraps components with necessary providers
 * @param ui - The React component to render
 * @param options - Custom render options
 * @returns The rendered component with additional testing utilities
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { initialState, route, ...renderOptions } = options;

  // Mock window.location if route is provided
  if (route) {
    Object.defineProperty(window, "location", {
      value: {
        pathname: route,
        search: "",
        hash: "",
        href: `http://localhost${route}`,
        origin: "http://localhost",
      },
      writable: true,
    });
  }

  // Create a wrapper component that includes all providers
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for a specified amount of time
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
const waitFor = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock the window.location object
 * @param url - The URL to set
 */
const mockWindowLocation = (url: string): void => {
  const urlObj = new URL(
    url.startsWith("http") ? url : `http://localhost${url}`
  );

  Object.defineProperty(window, "location", {
    value: {
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      href: urlObj.href,
      origin: urlObj.origin,
      host: urlObj.host,
      hostname: urlObj.hostname,
      protocol: urlObj.protocol,
      port: urlObj.port,
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    writable: true,
  });
};

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override the render method and export custom utilities
export { customRender as render, waitFor, mockWindowLocation };
