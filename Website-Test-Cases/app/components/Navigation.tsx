"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-indigo-950 text-amber-100 sticky top-0 z-50 shadow-lg border-b border-amber-300/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-serif font-bold text-amber-300">
                Realm of Feedback
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/")
                    ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400"
                    : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                Home Kingdom
              </Link>

              <Link
                href="/form"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/form")
                    ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400"
                    : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                Questionnaire Scroll
              </Link>

              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/admin")
                    ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400"
                    : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                Council Chambers
              </Link>

              <Link
                href="/test-results"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  isActive("/test-results")
                    ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400"
                    : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                Enchanted Tests
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <button
              className="p-2 text-amber-200 hover:bg-amber-500/10 rounded-md transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden ${
          isMenuOpen ? "block" : "hidden"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner bg-slate-900/80 backdrop-blur-sm border-t border-amber-300/20">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              isActive("/")
                ? "bg-amber-500/20 text-amber-300 border-l-2 border-amber-400"
                : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home Kingdom
          </Link>

          <Link
            href="/form"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              isActive("/form")
                ? "bg-amber-500/20 text-amber-300 border-l-2 border-amber-400"
                : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Questionnaire Scroll
          </Link>

          <Link
            href="/admin"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              isActive("/admin")
                ? "bg-amber-500/20 text-amber-300 border-l-2 border-amber-400"
                : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Council Chambers
          </Link>

          <Link
            href="/test-results"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
              isActive("/test-results")
                ? "bg-amber-500/20 text-amber-300 border-l-2 border-amber-400"
                : "text-amber-100 hover:text-amber-300 hover:bg-amber-500/10"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Enchanted Tests
          </Link>
        </div>
      </div>
    </nav>
  );
}
