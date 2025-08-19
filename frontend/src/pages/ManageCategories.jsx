import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE = import.meta.env.VITE_API_URL + '/api/products/categories';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [message, setMessage] = useState(null);

  // Cambiar el título de la página
  usePageTitle('Manage Categories');

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open modal for create
  const openCreateModal = () => {
    setModalMode('create');
    setForm({ name: '', description: '' });
    setShowModal(true);
    setCurrentCategory(null);
  };

  // Open modal for edit
  const openEditModal = (category) => {
    setModalMode('edit');
    setForm({ name: category.name, description: category.description || '' });
    setShowModal(true);
    setCurrentCategory(category);
  };

  // Submit create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Not authenticated');
      return;
    }
    try {
      const res = await fetch(
        modalMode === 'create' ? API_BASE : `${API_BASE}/${currentCategory.id}`,
        {
          method: modalMode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setShowModal(false);
      setMessage(modalMode === 'create' ? 'Category created!' : 'Category updated!');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (category) => {
    setDeleteCategory(category);
    setShowDelete(true);
  };

  // Confirm delete
  const handleDelete = async () => {
    setError(null);
    setMessage(null);
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Not authenticated');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/${deleteCategory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setShowDelete(false);
      setMessage('Category deleted!');
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-white">Manage Categories</h1>
      <button
        className="mb-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
        onClick={openCreateModal}
      >
        Add Category
      </button>
      {message && <div className="mb-4 text-green-400 font-semibold">{message}</div>}
      {error && <div className="mb-4 text-red-400 font-semibold">{error}</div>}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <>
          {/* Tabla solo en md+ */}
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-blue-900">Name</th>
                  <th className="px-4 py-2 text-left text-blue-900">Description</th>
                  <th className="px-4 py-2 text-left text-blue-900">Created</th>
                  <th className="px-4 py-2 text-left text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-blue-900">No categories found.</td></tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="border-t">
                      <td className="px-4 py-2 font-semibold text-blue-900">
                        <Link 
                          to={`/category/${encodeURIComponent(cat.name)}`}
                          className="text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-blue-900">{cat.description}</td>
                      <td className="px-4 py-2 text-sm text-blue-900">{new Date(cat.creation_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          onClick={() => openEditModal(cat)}
                        >Edit</button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          onClick={() => openDeleteModal(cat)}
                        >Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Cards solo en mobile */}
          <div className="flex flex-col gap-4 md:hidden">
            {categories.length === 0 ? (
              <div className="bg-white rounded shadow p-4 text-blue-900 text-center">No categories found.</div>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
                  <div className="font-bold text-blue-900 text-lg">
                    <Link 
                      to={`/category/${encodeURIComponent(cat.name)}`}
                      className="text-blue-700 hover:text-blue-900 hover:underline transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </div>
                  {cat.description && <div className="text-blue-900 text-sm">{cat.description}</div>}
                  <div className="text-xs text-blue-900">Created: {new Date(cat.creation_date).toLocaleDateString()}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      onClick={() => openEditModal(cat)}
                    >Edit</button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      onClick={() => openDeleteModal(cat)}
                    >Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal for create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative mx-2 md:mx-0">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
            >&times;</button>
            <h2 className="text-xl font-bold mb-4 text-blue-900">{modalMode === 'create' ? 'Add Category' : 'Edit Category'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-900">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-900">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 font-semibold"
              >
                {modalMode === 'create' ? 'Create' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative mx-2 md:mx-0">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowDelete(false)}
            >&times;</button>
            <h2 className="text-xl font-bold mb-4 text-blue-900">Delete Category</h2>
            <p className="mb-6 text-blue-900">Are you sure you want to delete <span className="font-semibold">{deleteCategory?.name}</span>?</p>
            <div className="flex gap-4">
              <button
                className="bg-gray-200 text-blue-900 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowDelete(false)}
              >Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                onClick={handleDelete}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories; 