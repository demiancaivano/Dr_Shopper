import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Cambiar el título de la página
  usePageTitle('Forgot Password');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.trim()) {
      setError('Please enter your email.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Error sending recovery email');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-blue-950 py-4 px-2">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-black mb-6">Forgot your password?</h1>
        
        {submitted ? (
          <div className="text-center">
            <div className="text-green-700 mb-4">
              If an account with that email exists, you will receive a password reset link shortly.
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Check your inbox and also the spam folder.
            </div>
            <Link 
              to="/login" 
              className="text-blue-700 hover:underline text-sm"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col w-full">
                <label htmlFor="email" className="text-black mb-1 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-950 text-white font-semibold py-2 rounded-md mt-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send recovery link'
                )}
              </button>
            </form>
            
            <div className="flex flex-col items-center mt-4 gap-1">
              <Link to="/login" className="text-blue-700 hover:underline text-sm">
                Back to sign in
              </Link>
              <Link to="/register" className="text-blue-700 hover:underline text-sm">
                Don't have an account? Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 