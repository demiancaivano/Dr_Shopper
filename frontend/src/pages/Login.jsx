import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { state, login, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Cambiar el título de la página
  usePageTitle('Login');

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      // Redirect to the page they came from, or home if none
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    const result = await login(formData.username, formData.password);
    if (result.success) {
      // Redirect is handled in useEffect when state.isAuthenticated changes
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-blue-950 py-4 px-2">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-black mb-6">Sign in</h1>
        
        {state.error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {state.error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="username" className="text-black mb-1 font-semibold">
              Username or Email
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email" 
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" 
              required
            />
          </div>
          
          <div className="flex flex-col w-full">
            <label htmlFor="password" className="text-black mb-1 font-semibold">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password" 
                className="border border-gray-300 rounded-md px-3 py-2 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" 
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={state.loading}
            className="bg-blue-950 text-white font-semibold py-2 rounded-md mt-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {state.loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
          
          <div className="flex flex-col items-center mt-4 gap-1">
            <Link to="/register" className="text-blue-700 hover:underline text-sm">
              Don't have an account? Register
            </Link>
            <Link to="/forgot-password" className="text-blue-700 hover:underline text-sm">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 