import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SearchAutocomplete from './SearchAutocomplete';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

function Navbar({ onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [catDropdown, setCatDropdown] = useState(false);
  const [brandDropdown, setBrandDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const catRef = useRef();
  const brandRef = useRef();
  const userRef = useRef();
  const navigate = useNavigate();
  const { state, logout } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data || []);
      })
      .catch(error => {
        setCategories([]);
      });
    fetch(`${API_BASE}/brands`)
      .then(res => res.json())
      .then(data => {
        setBrands(data || []);
      })
      .catch(error => {
        setBrands([]);
      });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setCatDropdown(false);
      if (brandRef.current && !brandRef.current.contains(event.target)) setBrandDropdown(false);
      if (userRef.current && !userRef.current.contains(event.target)) setUserDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    setMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const UserMenu = ({ isMobile = false }) => {
    if (state.isAuthenticated) {
      return (
        <div className={`relative ${isMobile ? '' : ''}`} ref={userRef}>
          <button
            className={`text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg ${isMobile ? 'text-lg w-full text-left mt-2' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setUserDropdown(!userDropdown);
              setCatDropdown(false);
              setBrandDropdown(false);
            }}
          >
            {state.user?.username || 'My Profile'}
            <svg className={`inline ml-1 w-4 h-4 ${isMobile ? 'float-right' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {userDropdown && (
            <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded shadow-lg z-50`}>
              <Link
                to="/profile"
                className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                onClick={() => {
                  setUserDropdown(false);
                  if (isMobile) setMenuOpen(false);
                }}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <>
          <Link 
            to="/login" 
            className={`text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg ${isMobile ? 'text-lg' : ''}`}
            onClick={() => isMobile && setMenuOpen(false)}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className={`text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg ${isMobile ? 'text-lg' : ''}`}
            onClick={() => isMobile && setMenuOpen(false)}
          >
            Register
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="w-full flex justify-center py-2 px-2">
      <div className="w-full max-w-6xl bg-gradient-to-r from-indigo-950 to-indigo-700 md:rounded-xl shadow-[0_4px_24px_0_rgba(83,151,221,0.25)] border-b-2 border-sky-800 px-3 py-2 flex flex-col gap-y-2 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Main row: mobile/tablet/desktop */}
        <div className="w-full flex items-center justify-between lg:justify-start lg:gap-4">
          {/* Logo */}
          <div className="font-montserrat text-base font-bold text-white whitespace-nowrap lg:text-lg lg:mr-4">
            <Link to="/">Dr. Shopper</Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search bar */}
            <SearchAutocomplete
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Search products..."
              className="w-96 px-4 py-2 rounded-lg text-mariner-900 placeholder-mariner-500 focus:outline-none focus:ring-2 focus:ring-mariner-300"
            />
          </div>

          {/* Mobile search */}
          <div className="flex-1 max-w-xs mx-2 lg:hidden">
            <SearchAutocomplete
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Search..."
              className="w-full px-3 py-1.5 rounded-lg text-mariner-900 placeholder-mariner-500 focus:outline-none focus:ring-2 focus:ring-mariner-300 text-sm"
            />
          </div>

          {/* Desktop user menu, categories, brands y cart */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setCatDropdown(!catDropdown);
                  setBrandDropdown(false);
                  setUserDropdown(false);
                }}
              >
                Categories
                <svg className={`w-4 h-4 transition-transform ${catDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${encodeURIComponent(category.name)}`}
                      className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                      onClick={() => setCatDropdown(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Brands dropdown */}
            <div className="relative" ref={brandRef}>
              <button
                className="text-white hover:text-mariner-200 transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setBrandDropdown(!brandDropdown);
                  setCatDropdown(false);
                  setUserDropdown(false);
                }}
              >
                Brands
                <svg className={`w-4 h-4 transition-transform ${brandDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {brandDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                  {brands.map((brand) => (
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
            <UserMenu />
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
          
          {/* Mobile: cart and burger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onCartClick}
              className="flex items-center gap-1 bg-mariner-400 hover:bg-mariner-300 text-white px-2 py-1 rounded transition-transform transition-shadow duration-200 hover:scale-105 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
              </svg>
            </button>
            <button
              className="text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu: links and search */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end lg:hidden" onClick={() => setMenuOpen(false)}>
            <div className="w-64 h-full bg-gradient-to-b from-mariner-700 to-mariner-300 p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <button className="self-end text-2xl text-white" onClick={() => setMenuOpen(false)}>&times;</button>

              {/* Mobile categories */}
              <div className="relative" ref={catRef}>
                <button
                  className="text-white hover:text-mariner-200 text-lg w-full text-left flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCatDropdown(!catDropdown);
                    setBrandDropdown(false);
                  }}
                >
                  Categories
                  <svg className={`w-4 h-4 transition-transform ${catDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {catDropdown && (
                  <div className="mt-2 bg-white rounded shadow-lg max-h-48 overflow-y-auto">
                                         {categories.map((category) => (
                       <Link
                         key={category.id}
                         to={`/category/${encodeURIComponent(category.name)}`}
                         className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                         onClick={() => {
                           setCatDropdown(false);
                           setMenuOpen(false);
                         }}
                       >
                         {category.name}
                       </Link>
                     ))}
                  </div>
                )}
              </div>

              {/* Mobile brands */}
              <div className="relative" ref={brandRef}>
                <button
                  className="text-white hover:text-mariner-200 text-lg w-full text-left flex items-center justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBrandDropdown(!brandDropdown);
                    setCatDropdown(false);
                  }}
                >
                  Brands
                  <svg className={`w-4 h-4 transition-transform ${brandDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {brandDropdown && (
                  <div className="mt-2 bg-white rounded shadow-lg max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        to={`/brand/${encodeURIComponent(brand.name)}`}
                        className="block px-4 py-2 text-mariner-900 hover:bg-mariner-100 hover:text-blue-700"
                        onClick={() => {
                          setBrandDropdown(false);
                          setMenuOpen(false);
                        }}
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <UserMenu isMobile={true} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 