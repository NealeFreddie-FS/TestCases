"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "../Navigation";
import AdminPanel from "../AdminPanel";

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

const LayoutClientWrapper: React.FC<LayoutClientWrapperProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const isGameRoute = pathname === "/game" || pathname?.startsWith("/game/");

  useEffect(() => {
    // When on game routes, set body styles to ensure full immersion
    if (isGameRoute) {
      document.body.classList.add("game-mode");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("game-mode");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("game-mode");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isGameRoute]);

  // For game routes, render only the children without any wrapper
  if (isGameRoute) {
    return <>{children}</>;
  }

  // For non-game routes, render the full layout
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(to bottom right, #3730a3, #7e22ce)",
      }}
    >
      <Navigation />
      <AdminPanel />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-900 text-amber-200 py-6 text-center">
        <p className="mb-1">Crafted with ancient magic in the realm of code</p>
        <p className="text-sm">
          © {new Date().getFullYear()} The Fantasy Realm of Feedback
        </p>
      </footer>
    </div>
  );
};

export default LayoutClientWrapper;
