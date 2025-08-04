import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL + '/api/products';
const CATEGORY_API = API_BASE + '/categories';
const BRAND_API = API_BASE + '/brands';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    images: '', // comma separated
    category_id: '',
    brand_id: '',
    discount_percentage: '',
    is_active: true
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [message, setMessage] = useState(null);

  // Filtros y paginación
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products, categories, brands
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch(CATEGORY_API),
        fetch(BRAND_API)
      ]);
      if (!catRes.ok || !brandRes.ok) throw new Error('Failed to fetch data');
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      setCategories(catData);
      setBrands(brandData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch products con filtros
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', 10);
      if (search) params.append('search', search);
      if (filterCategory) params.append('category_id', filterCategory);
      if (filterBrand) params.append('brand_id', filterBrand);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortOrder) params.append('sort_order', sortOrder);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [search, filterCategory, filterBrand, sortBy, sortOrder, page]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for create
  const openCreateModal = () => {
    setModalMode('create');
    setForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      images: '',
      category_id: '',
      brand_id: '',
      discount_percentage: '',
      is_active: true
    });
    setShowModal(true);
    setCurrentProduct(null);
  };

  // Open modal for edit
  const openEditModal = (product) => {
    setModalMode('edit');
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      image_url: product.image_url || '',
      images: (product.images || []).join(', '),
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      discount_percentage: product.discount_percentage || '',
      is_active: product.is_active
    });
    setShowModal(true);
    setCurrentProduct(product);
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
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        discount_percentage: form.discount_percentage ? parseFloat(form.discount_percentage) : 0,
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        category_id: form.category_id ? parseInt(form.category_id) : null,
        brand_id: form.brand_id ? parseInt(form.brand_id) : null,
      };
      const res = await fetch(
        modalMode === 'create' ? API_BASE : `${API_BASE}/${currentProduct.id}`,
        {
          method: modalMode === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setShowModal(false);
      setMessage(modalMode === 'create' ? 'Product created!' : 'Product updated!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (product) => {
    setDeleteProduct(product);
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
      const res = await fetch(`${API_BASE}/${deleteProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      setShowDelete(false);
      setMessage('Product deleted!');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handlers para filtros y búsqueda
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setPage(1);
  };
  const handleBrandChange = (e) => {
    setFilterBrand(e.target.value);
    setPage(1);
  };
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  // Paginación
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-white">Manage Products</h1>
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1 text-grey-200">Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or description"
            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1 text-grey-200">Category</label>
          <select
            value={filterCategory}
            onChange={handleCategoryChange}
            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1 text-grey-200">Brand</label>
          <select
            value={filterBrand}
            onChange={handleBrandChange}
            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
          >
            <option value="">All brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1 text-grey-200">Sort by</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
            >
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
            >
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>
        </div>
      </div>
      <button
        className="mb-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
        onClick={openCreateModal}
      >
        Add Product
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
                  <th className="px-4 py-2 text-left text-blue-900">Category</th>
                  <th className="px-4 py-2 text-left text-blue-900">Brand</th>
                  <th className="px-4 py-2 text-left text-blue-900">Price</th>
                  <th className="px-4 py-2 text-left text-blue-900">Stock</th>
                  <th className="px-4 py-2 text-left text-blue-900">Rating</th>
                  <th className="px-4 py-2 text-left text-blue-900">Active</th>
                  <th className="px-4 py-2 text-left text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-4 text-center text-blue-900">No products found.</td></tr>
                ) : (
                  products.map(prod => (
                    <tr key={prod.id} className="border-t">
                      <td className="px-4 py-2 font-semibold text-blue-900">{prod.name}</td>
                      <td className="px-4 py-2 text-blue-900">{prod.category}</td>
                      <td className="px-4 py-2 text-blue-900">{prod.brand}</td>
                      <td className="px-4 py-2 text-blue-900">€{prod.price}</td>
                      <td className="px-4 py-2 text-blue-900">{prod.stock}</td>
                      <td className="px-4 py-2 text-blue-900">{prod.rating?.average?.toFixed(2) ?? '0.00'}</td>
                      <td className="px-4 py-2 text-blue-900">{prod.is_active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          onClick={() => openEditModal(prod)}
                        >Edit</button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          onClick={() => openDeleteModal(prod)}
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
            {products.length === 0 ? (
              <div className="bg-white rounded shadow p-4 text-blue-900 text-center">No products found.</div>
            ) : (
              products.map(prod => (
                <div key={prod.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
                  <div className="font-bold text-blue-900 text-lg">{prod.name}</div>
                  <div className="text-blue-900 text-sm">Category: {prod.category}</div>
                  <div className="text-blue-900 text-sm">Brand: {prod.brand}</div>
                  <div className="text-blue-900 text-sm">Price: €{prod.price}</div>
                  <div className="text-blue-900 text-sm">Stock: {prod.stock}</div>
                  <div className="text-blue-900 text-sm">Rating: {prod.rating?.average?.toFixed(2) ?? '0.00'}</div>
                  <div className="text-blue-900 text-sm">Active: {prod.is_active ? 'Yes' : 'No'}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      onClick={() => openEditModal(prod)}
                    >Edit</button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      onClick={() => openDeleteModal(prod)}
                    >Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >Previous</button>
            <span className="text-blue-900 font-semibold">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 bg-blue-700 text-white rounded disabled:opacity-50"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >Next</button>
          </div>
        </>
      )}

      {/* Modal for create/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative mx-2 md:mx-0">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
            >&times;</button>
            <h2 className="text-xl font-bold mb-4 text-blue-900">{modalMode === 'create' ? 'Add Product' : 'Edit Product'}</h2>
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
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-blue-900">Price (€)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-blue-900">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-900">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-900">Images (comma separated URLs)</label>
                <input
                  type="text"
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-blue-900">Category</label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-blue-900">Brand</label>
                  <select
                    name="brand_id"
                    value={form.brand_id}
                    onChange={handleChange}
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  >
                    <option value="">Select brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-blue-900">Discount (%)</label>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={form.discount_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-700 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <label className="text-blue-900 text-sm">Active</label>
                </div>
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
            <h2 className="text-xl font-bold mb-4 text-blue-900">Delete Product</h2>
            <p className="mb-6 text-blue-900">Are you sure you want to delete <span className="font-semibold">{deleteProduct?.name}</span>?</p>
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

export default ManageProducts; 