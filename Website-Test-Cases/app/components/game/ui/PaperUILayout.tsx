import React, { ReactNode } from "react";
import "./PaperUI.css";

interface PaperUILayoutProps {
  children: ReactNode;
}

/**
 * A layout container for Paper UI elements
 * Imports the Paper UI CSS and provides a container for UI elements
 */
export default function PaperUILayout({ children }: PaperUILayoutProps) {
  return <div className="paper-ui-container">{children}</div>;
}
