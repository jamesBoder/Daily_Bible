import React from 'react';
import { useNavigate } from 'react-router-dom';


// About Page Component
export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all font-medium"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Hero Section */}
      <section className="text-center py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 opacity-50"></div>
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
            Words of Praise
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light">
            Daily Inspiration Through God's Word
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="text-4xl mr-3">🙏</span>
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Words of Praise was created to provide a simple, accessible way to experience daily inspiration through Bible verses. We believe that God's Word has the power to transform lives, and we want to make it easy for everyone to connect with Scripture every day. Whether you're looking for a moment of reflection, a source of encouragement, or a way to deepen your faith, Words of Praise is here to support you on your spiritual journey.
          </p>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📖</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Daily Verse</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Receive a new inspirational Bible verse every day at midnight
            </p>
          </div>
          
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">⭐</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Favorites</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Save and organize your favorite verses for easy access
            </p>
          </div>
          
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📜</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">History</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Track your spiritual journey with automatic reading history
            </p>
          </div>
          
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Personal Notes</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Add your own reflections and comments to verses
            </p>
          </div>
          
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🌙</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Dark Mode</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Comfortable reading experience day or night
            </p>
          </div>
          
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📱</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Mobile Friendly</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Beautiful and responsive on all devices
            </p>
          </div>
        </div>
      </section>

      {/* Get in Touch Section */}
      <section id="contact" className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/30 dark:to-purple-900/30 rounded-2xl shadow-xl p-10 border-2 border-primary-200 dark:border-primary-800">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white flex items-center justify-center">
            <span className="text-4xl mr-3">✉️</span>
            Get in Touch
          </h2>
          <p className="text-center mb-6 text-lg text-gray-700 dark:text-gray-300">
            We'd love to hear from you! Whether you've found a bug, have a suggestion, or just want to share your thoughts, please reach out.
          </p>
          <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Email us at:</p>
            <a
              href="mailto:wordsofpraiseapp@gmail.com"
              className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors inline-block hover:scale-105 transform"
            >
              wordsofpraiseapp@gmail.com
            </a>
            <p className="text-sm mt-4 text-gray-500 dark:text-gray-500">
              ⏱️ We typically respond within 24-48 hours
            </p>
          </div>
        </div>
      </section>

      {/* Dedication Section */}
      <section className="max-w-4xl mx-auto py-16 px-6 mb-8">
        <div className="bg-gradient-to-br from-white to-primary-50 dark:from-gray-800 dark:to-primary-900/20 rounded-2xl shadow-2xl p-10 md:p-12 border-l-8 border-primary-600 dark:border-primary-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              In Loving Memory
            </h2>
            
            <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Clairemena Jean-Pierre
            </p>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 italic">
              A devoted child of God
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
