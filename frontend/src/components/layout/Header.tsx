import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";

export const Header: React.FC = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 group-hover:brightness-125 group-hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.4)] dark:group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">
              Words of Praise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/daily"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
            >
              Daily Verse
            </Link>
            {/* Favorites & History hidden for guests */}
            {!isGuest && (
              <Link
                to="/favorites"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Favorites
              </Link>
            )}
            {!isGuest && (
              <Link
                to="/history"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                History
              </Link>
            )}
            <Link
              to="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/settings"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              {isGuest ? "Browsing as Guest" : `Welcome, ${user?.username}`}
            </span>
            {isGuest && (
              <Button
                onClick={() => navigate("/signup")}
                variant="primary"
                className="text-sm"
              >
                Sign Up
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="text-sm"
            >
              {isGuest ? "Exit Guest" : "Logout"}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/daily"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Daily Verse
              </Link>
              {/* Favorites & History hidden for guests */}
              {!isGuest && (
                <Link
                  to="/favorites"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favorites
                </Link>
              )}
              {!isGuest && (
                <Link
                  to="/history"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  History
                </Link>
              )}
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/settings"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {isGuest ? "Browsing as Guest" : `Welcome, ${user?.username}`}
                </p>
                {isGuest && (
                  <Button
                    onClick={() => { navigate("/signup"); setIsMenuOpen(false); }}
                    variant="primary"
                    className="w-full mb-2"
                  >
                    Sign Up
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="w-full"
                >
                  {isGuest ? "Exit Guest" : "Logout"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
