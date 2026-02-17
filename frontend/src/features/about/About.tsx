import React from 'react';  


// About Page Component
export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">Daily Verse</h1>
        <p className="text-xl">Your daily dose of inspiration from the Bible</p>
      </section>

      {/* Mission Statement Section */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p>
          At Daily Verse, our mission is to provide a simple and beautiful way for people to connect with the Bible every day. We believe that everyone can find comfort, guidance, and inspiration in the scriptures, and we want to make it easy for you to access that wisdom no matter where you are. Whether you're looking for a moment of reflection, a source of encouragement, or a way to deepen your faith, Daily Verse is here to support you on your spiritual journey.
        </p>
      </section>

      {/* Features Overview Section */}
      <section className="bg-white dark:bg-gray-800 py-12 px-4">
        <h2 className="text-2xl font-semibold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Daily Verse</h3>
            <p>Receive a new Bible verse every day to inspire and uplift you.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Favorites</h3>
            <p>Save your favorite verses and access them anytime.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Verse History</h3>
            <p>Browse through past verses to find inspiration from previous days.</p>
          </div>
        </div>
      </section>

      {/* Dedication Section */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4">In Loving Memory of Clairemena Jean-Pierre</h2>
        <p>
          This app is dedicated to the memory of Clairemena Jean-Pierre, whose unwavering faith and love for the scriptures inspired us to create Daily Verse. Clairemena's spirit lives on in every verse we share, and we hope that this app brings comfort and inspiration to others just as she did for us.
        </p>
      </section>

      {/* Contact Form Section */}
      <section className="bg-white dark:bg-gray-800 py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Get in Touch</h2>
        <p className="text-center mb-8">We'd love to hear from you! Whether you have feedback, questions, or just want to say hello, please fill out the form below.</p>
        {/* ContactForm component will be integrated here */}
      </section>

      {/* Alternative Contact Methods Section */}
      <section className="max-w-3xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4">Other Ways to Contact Us</h2>
        <p>You can also reach us via email at <a href="mailto: wordsofpraise.app" className="text-blue-500 underline">wordsofpraise.app</a> or submit an issue on our <a href="/github" className="text-blue-500 underline">GitHub repository</a>. We aim to respond to all inquiries within 48 hours.</p>
      </section>

      {/* Technology/Credits Section (Optional) */}
      <section className="bg-gray-100 dark:bg-gray-700 py-12 px-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Built With</h2>
        <p className="text-center">Daily Verse is built using React, TypeScript, Tailwind CSS, and Node.js. We are grateful to the open-source community for providing the tools and libraries that made this project possible.</p>
      </section>
    </div>
  );
};

