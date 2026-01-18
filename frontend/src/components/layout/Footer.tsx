import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} Words of Praise. All rights reserved.
          </p>
          <p className="mt-2">
            Bringing you daily inspiration through God's Word
          </p>
        </div>
      </div>
    </footer>
  );
};
