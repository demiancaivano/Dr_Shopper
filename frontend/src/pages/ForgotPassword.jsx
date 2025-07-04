import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Aquí se haría la petición al backend para enviar el email
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-blue-950 py-4 px-2">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-mariner-900 mb-6">Forgot your password?</h1>
        {submitted ? (
          <div className="text-green-700 text-center">
            If an account with that email exists, you will receive a password reset link shortly.
          </div>
        ) : (
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full">
              <label htmlFor="email" className="text-mariner-900 mb-1 font-semibold">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-accent"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button type="submit" className="bg-blue-950 text-white font-semibold py-2 rounded-md mt-2 hover:bg-blue-700 transition-colors">Send reset link</button>
          </form>
        )}
        <div className="flex flex-col items-center mt-4">
          <a href="/login" className="text-blue-700 hover:underline text-sm">Back to login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 