import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { state: authState, logout } = useContext(AuthContext);
  
  // Estados para el perfil
  const [profile, setProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Estados para direcciones
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    extra_info: '',
    is_default: false
  });
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Cargar perfil del usuario
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchProfile();
      fetchAddresses();
    }
  }, [authState.isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setProfileForm({
          username: data.user.username,
          email: data.user.email
        });
      } else {
        setProfileError('Error loading profile');
      }
    } catch (error) {
      setProfileError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await fetch(`${API_BASE}/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else {
        setAddressError('Error loading addresses');
      }
    } catch (error) {
      setAddressError('Error loading addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setProfileSuccess('Profile updated successfully');
        setIsEditingProfile(false);
      } else {
        setProfileError(data.error || 'Error updating profile');
      }
    } catch (error) {
      setProfileError('Error updating profile');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');

    const url = isEditingAddress 
      ? `${API_BASE}/addresses/${editingAddressId}`
      : `${API_BASE}/addresses`;
    
    const method = isEditingAddress ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(addressForm)
      });

      const data = await response.json();

      if (response.ok) {
        setAddressSuccess(isEditingAddress ? 'Address updated successfully' : 'Address added successfully');
        setIsAddingAddress(false);
        setIsEditingAddress(false);
        setEditingAddressId(null);
        resetAddressForm();
        fetchAddresses(); // Recargar direcciones
      } else {
        setAddressError(data.message || 'Error saving address');
      }
    } catch (error) {
      setAddressError('Error saving address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setIsEditingAddress(true);
    setAddressForm({
      street: address.street,
      city: address.city,
      state: address.state || '',
      zip_code: address.zip_code || '',
      country: address.country,
      extra_info: address.extra_info || '',
      is_default: address.is_default
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setAddressSuccess('Address deleted successfully');
        fetchAddresses();
      } else {
        const data = await response.json();
        setAddressError(data.message || 'Error deleting address');
      }
    } catch (error) {
      setAddressError('Error deleting address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`${API_BASE}/addresses/default/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setAddressSuccess('Default address updated successfully');
        fetchAddresses();
      } else {
        const data = await response.json();
        setAddressError(data.message || 'Error setting default address');
      }
    } catch (error) {
      setAddressError('Error setting default address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      extra_info: '',
      is_default: false
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-950">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-blue-200">Manage your account information and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-blue-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                    className="w-full px-3 py-2 bg-blue-800 border border-blue-700 rounded focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-blue-800 border border-blue-700 rounded focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                {profileError && (
                  <div className="text-red-400 text-sm">{profileError}</div>
                )}
                {profileSuccess && (
                  <div className="text-green-400 text-sm">{profileSuccess}</div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        username: profile.username,
                        email: profile.email
                      });
                      setProfileError('');
                      setProfileSuccess('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Username</label>
                  <p className="text-white">{profile?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Email</label>
                  <p className="text-white">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Member since</label>
                  <p className="text-white">
                    {profile?.creation_date ? new Date(profile.creation_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-blue-700">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors w-full"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="bg-blue-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Addresses</h2>
              {!isAddingAddress && !isEditingAddress && (
                <button
                  onClick={() => {
                    setIsAddingAddress(true);
                    resetAddressForm();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Add Address
                </button>
              )}
            </div>

            {/* Address Form */}
            {(isAddingAddress || isEditingAddress) && (
              <form onSubmit={handleAddressSubmit} className="mb-6 bg-blue-800 rounded p-4 space-y-4">
                <h3 className="font-semibold">
                  {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP/Postal Code</label>
                    <input
                      type="text"
                      value={addressForm.zip_code}
                      onChange={(e) => setAddressForm({...addressForm, zip_code: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Additional Info</label>
                    <input
                      type="text"
                      value={addressForm.extra_info}
                      onChange={(e) => setAddressForm({...addressForm, extra_info: e.target.value})}
                      className="w-full px-3 py-2 bg-blue-700 border border-blue-600 rounded focus:outline-none focus:border-blue-500 text-white"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_default" className="text-sm">
                    Set as default address
                  </label>
                </div>

                {addressError && (
                  <div className="text-red-400 text-sm">{addressError}</div>
                )}
                {addressSuccess && (
                  <div className="text-green-400 text-sm">{addressSuccess}</div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                  >
                    {isEditingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setIsEditingAddress(false);
                      setEditingAddressId(null);
                      resetAddressForm();
                      setAddressError('');
                      setAddressSuccess('');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Addresses List */}
            <div className="space-y-4">
              {loadingAddresses ? (
                <div className="text-center py-4">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-blue-200">
                  <p>No addresses found.</p>
                  <p className="text-sm mt-2">Add your first address to get started.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="bg-blue-800 rounded p-4 border border-blue-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{address.street}</h4>
                          {address.is_default && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-blue-200 text-sm">
                          {address.city}{address.state && `, ${address.state}`}{address.zip_code && ` ${address.zip_code}`}
                        </p>
                        <p className="text-blue-200 text-sm">{address.country}</p>
                        {address.extra_info && (
                          <p className="text-blue-300 text-sm mt-1">{address.extra_info}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                            title="Set as default"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
                          title="Edit address"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                          title="Delete address"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 