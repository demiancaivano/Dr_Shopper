import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-2 md:mb-0 text-center md:text-left">
          &copy; {new Date().getFullYear()} Dr Shopper. All rights reserved.
          <div className="text-xs text-gray-300 mt-1">
            Products and images are for demonstration purposes only, not for commercial use. Images sourced from unsplash.com
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
