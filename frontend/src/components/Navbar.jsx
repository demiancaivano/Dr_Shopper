import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Simulación de estado de login
const isLoggedIn = true; // Cambia a true para probar "Mi Perfil"
const isAdmin = false; // Cambia a true para probar el botón Admin

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

function Navbar({ onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [catDropdown, setCatDropdown] = useState(false);
  const [brandDropdown, setBrandDropdown] = useState(false);
  const catRef = useRef();
  const brandRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data || []));
    fetch(`${API_BASE}/brands`)
      .then(res => res.json())
      .then(data => setBrands(data || []));
  }, []);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setCatDropdown(false);
      if (brandRef.current && !brandRef.current.contains(event.target)) setBrandDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="w-full flex justify-center py-2 px-2">
      <div className="w-full max-w-6xl bg-gradient-to-r from-indigo-950 to-indigo-700 md:rounded-xl shadow-[0_4px_24px_0_rgba(83,151,221,0.25)] border-b-2 border-sky-800 px-3 py-2 flex flex-col gap-y-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Fila principal: mobile/tablet/desktop */}
        <div className="w-full flex items-center justify-between lg:justify-start lg:gap-4">
          {/* Logo */}
          <div className="font-montserrat text-lg font-bold text-white whitespace-nowrap lg:mr-4">
            <Link to="/">Dr. Shopper</Link>
          </div>
          {/* lg: search input y botón */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg ml-2 mr-2">
            <input
              type="text"
              placeholder="Search"
              className="flex-1 min-w-0 px-3 py-1 rounded-full bg-mariner-100 text-mariner-900 border-2 border-transparent focus:outline-none focus:border-mariner-500 focus:ring-2 focus:ring-blue-400/60 focus:shadow-2xl transition-all duration-200"
            />
            <button className="px-4 py-1 rounded-full bg-mariner-400 text-white hover:bg-mariner-300 transition-shadow duration-200 hover:scale-105 hover:shadow-lg ml-2">
              Search
            </button>
          </div>
          {/* lg: links y cart en orden, alineados a la derecha */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <Link to="/" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Home</Link>
            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
                onClick={e => { e.stopPropagation(); setCatDropdown((open) => !open); setBrandDropdown(false); }}
              >
                Categories
              </button>
              {catDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${encodeURIComponent(cat.name)}`}
                      className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                      onClick={() => setCatDropdown(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Brands Dropdown */}
            <div className="relative" ref={brandRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
                onClick={e => { e.stopPropagation(); setBrandDropdown((open) => !open); setCatDropdown(false); }}
              >
                Brands
              </button>
              {brandDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                  {brands.map(brand => (
                    <Link
                      key={brand.id}
                      to={`/brand/${encodeURIComponent(brand.name)}`}
                      className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                      onClick={() => setBrandDropdown(false)}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <Link to="/profile" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">My Profile</Link>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Login</Link>
                <Link to="/register" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Register</Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 bg-mariner-400 hover:bg-mariner-300 text-white px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg font-semibold"
              >
                Admin
              </Link>
            )}
            <button
              onClick={onCartClick}
              className="flex items-center gap-1 bg-mariner-400 hover:bg-mariner-300 text-white px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
          {/* md: links y cart */}
          <div className="hidden md:flex lg:hidden items-center gap-4 ml-auto">
            <Link to="/" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Home</Link>
            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
                onClick={() => { setCatDropdown((open) => !open); setBrandDropdown(false); }}
              >
                Categories
              </button>
              {catDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${encodeURIComponent(cat.name)}`}
                      className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                      onClick={() => setCatDropdown(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Brands Dropdown */}
            <div className="relative" ref={brandRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
                onClick={() => { setBrandDropdown((open) => !open); setCatDropdown(false); }}
              >
                Brands  
              </button>
              {brandDropdown && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                  {brands.map(brand => (
                    <Link
                      key={brand.id}
                      to={`/brand/${encodeURIComponent(brand.name)}`}
                      className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                      onClick={() => setBrandDropdown(false)}
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isLoggedIn ? (
              <Link to="/profile" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">My Profile</Link>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Login</Link>
                <Link to="/register" className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg">Register</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg font-semibold">Admin</Link>
            )}
            <button
              onClick={onCartClick}
              className="flex items-center gap-1 bg-mariner-400 hover:bg-mariner-300 text-white px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
          {/* Mobile: cart y burger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onCartClick}
              className="flex items-center gap-1 bg-mariner-400 hover:bg-mariner-300 text-white px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
              </svg>
            </button>
            <button
              className="text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open Menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Search: mobile y md (abajo, centrado) */}
        <div className="flex w-full items-center mt-2 sm:justify-center md:justify-center lg:hidden">
          <input
            type="text"
            placeholder="Search"
            className="flex-1 min-w-0 max-w-md px-3 py-1 rounded-full bg-mariner-100 text-mariner-900 border-2 border-transparent focus:outline-none focus:border-mariner-500 focus:ring-2 focus:ring-blue-400/60 focus:shadow-2xl transition-all duration-200"
          />
          <button className="px-4 py-1 rounded-full bg-mariner-400 text-white hover:bg-mariner-300 transition-shadow duration-200 hover:scale-105 hover:shadow-lg ml-2">
            Search
          </button>
        </div>
        {/* Menú móvil: links y search */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end" onClick={() => setMenuOpen(false)}>
            <div className="w-64 h-full bg-gradient-to-b from-mariner-700 to-mariner-300 p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <button className="self-end text-2xl text-white" onClick={() => setMenuOpen(false)}>&times;</button>
              <Link to="/" className="text-white hover:text-mariner-200 text-lg transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Home</Link>
              {/* Categories Dropdown Mobile */}
              <div className="relative">
                <button
                  className="text-white hover:text-mariner-200 text-lg w-full text-left mt-2"
                  onClick={() => setCatDropdown((open) => !open)}
                >
                  Categories
                </button>
                {catDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700 cursor-pointer"
                        onClick={() => {
                          setCatDropdown(false);
                          setMenuOpen(false);
                          navigate(`/category/${encodeURIComponent(cat.name)}`);
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Brands Dropdown Mobile */}
              <div className="relative">
                <button
                  className="text-white hover:text-mariner-200 text-lg w-full text-left mt-2"
                  onClick={() => setBrandDropdown((open) => !open)}
                >
                  Brands
                </button>
                {brandDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                    {brands.map(brand => (
                      <div
                        key={brand.id}
                        className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700 cursor-pointer"
                        onClick={() => {
                          setBrandDropdown(false);
                          setMenuOpen(false);
                          navigate(`/brand/${encodeURIComponent(brand.name)}`);
                        }}
                      >
                        {brand.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/brands" className="text-white hover:text-mariner-200 text-lg transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Brands</Link>
              {isLoggedIn ? (
                <Link to="/profile" className="text-white hover:text-mariner-200 text-lg transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setMenuOpen(false)}>My Profile</Link>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:text-mariner-200 text-lg transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="text-white hover:text-mariner-200 text-lg transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg font-semibold" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 