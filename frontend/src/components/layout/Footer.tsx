import React from "react";

export const Footer: React.FC = () => {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not on about page, navigate there
      window.location.href = '/about#contact';
    }
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Links Section */}
        <div className="flex space-x-4 mb-4 md:mb-0">
          <a
            href="/about"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            About
          </a>
          <a
            href="/about#contact"
            onClick={scrollToContact}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Contact
          </a>
        </div>  
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Words of Praise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};


