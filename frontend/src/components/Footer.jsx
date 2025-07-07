import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-2 md:mb-0 text-center md:text-left">
          &copy; {new Date().getFullYear()} Dr Shopper. All rights reserved.
        </div>
        <div className="flex gap-4 justify-center">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
