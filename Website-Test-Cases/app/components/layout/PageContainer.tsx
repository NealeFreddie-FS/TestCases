"use client";

import React, { ReactNode } from "react";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
  bgColor?: string;
  title?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

/**
 * A container component for page content with customizable width, padding, and centering
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  maxWidth = "lg",
  padding = "md",
  centered = true,
  bgColor,
  title,
  headerContent,
  footerContent,
}) => {
  // Max width classes
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  // Padding classes
  const paddingClasses = {
    none: "p-0",
    sm: "p-2 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  // Combine classes
  const containerClasses = [
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    centered ? "mx-auto" : "",
    className,
  ].join(" ");

  // Update document title if provided
  React.useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <div
      className={containerClasses}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      data-testid="page-container"
    >
      {headerContent && <header className="mb-6">{headerContent}</header>}

      <main>{children}</main>

      {footerContent && <footer className="mt-6">{footerContent}</footer>}
    </div>
  );
};

export default PageContainer;
