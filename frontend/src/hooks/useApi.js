import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useApi = () => {
  const { state, refreshToken, logout } = useContext(AuthContext);

  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    // Add default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers: defaultHeaders,
    };

    try {
      let response = await fetch(url, config);

      // If token expired, try to refresh it
      if (response.status === 401 && token) {
        const refreshSuccess = await refreshToken();
        
        if (refreshSuccess) {
          // Retry request with new token
          const newToken = localStorage.getItem('access_token');
          config.headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, config);
        } else {
          // If token cannot be refreshed, logout
          logout();
          throw new Error('Session expired. Please sign in again.');
        }
      }

      return response;
    } catch (error) {
      if (error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Connection error. Please try again.');
    }
  };

  const get = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  };

  const post = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const put = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const del = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  };

  return {
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}; 