import React from 'react';
import { Link } from 'react-router-dom';

// Admin management dashboard
const Manage = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
      <p className="mb-8 text-lg text-gray-200">Welcome! Here you can manage brands, categories, and products.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/manage/brands" className="block bg-white rounded-lg shadow hover:shadow-lg p-6 text-center border border-blue-200 hover:bg-blue-50 transition">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Brands</h2>
          <p className="text-gray-600">Create, edit, and delete brands.</p>
        </Link>
        <Link to="/manage/categories" className="block bg-white rounded-lg shadow hover:shadow-lg p-6 text-center border border-blue-200 hover:bg-blue-50 transition">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Categories</h2>
          <p className="text-gray-600">Create, edit, and delete categories.</p>
        </Link>
        <Link to="/manage/products" className="block bg-white rounded-lg shadow hover:shadow-lg p-6 text-center border border-blue-200 hover:bg-blue-50 transition">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Products</h2>
          <p className="text-gray-600">Create, edit, and delete products.</p>
        </Link>
      </div>
    </div>
  );
};

export default Manage; 