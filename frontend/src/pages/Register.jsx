import React from 'react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-start justify-center bg-blue-950 py-4 px-2">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-mariner-900 mb-6">Create an account</h1>
        <form className="w-full flex flex-col gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="name" className="text-mariner-900 mb-1 font-semibold">Name</label>
            <input type="text" id="name" placeholder="Enter your name" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-accent" />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="email" className="text-mariner-900 mb-1 font-semibold">Email</label>
            <input type="email" id="email" placeholder="Enter your email" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-accent" />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="password" className="text-mariner-900 mb-1 font-semibold">Password</label>
            <input type="password" id="password" placeholder="Enter your password" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-accent" />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="confirmPassword" className="text-mariner-900 mb-1 font-semibold">Confirm password</label>
            <input type="password" id="confirmPassword" placeholder="Confirm your password" className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-accent" />
          </div>
          <button type="submit" className="bg-blue-950 text-white font-semibold py-2 rounded-md mt-2 hover:bg-blue-700 transition-colors">Register</button>
          <div className="flex flex-col items-center mt-4 gap-1">
            <a href="/login" className="text-blue-700 hover:underline text-sm">Already have an account? Sign in</a>
            <a href="/forgot-password" className="text-blue-700 hover:underline text-sm">Forgot your password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 