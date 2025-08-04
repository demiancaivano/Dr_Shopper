import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const ShippingAddressSelector = () => {
  const { state: authState } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({
    street: '', city: '', state: '', zip_code: '', country: '', extra_info: '',
    save: false, makeDefault: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/addresses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data);
          if (data.length > 0) {
            // Buscar default
            const def = data.find(addr => addr.is_default) || data[0];
            setDefaultAddress(def);
            setSelectedId(def.id);
          }
        } else {
          setAddresses([]);
        }
      } catch {
        setAddresses([]);
        setError('Could not load addresses.');
      }
      setLoading(false);
    };
    if (authState.isAuthenticated) fetchAddresses();
  }, [authState.isAuthenticated]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setShowNewForm(false);
  };

  const handleShowNew = () => {
    setShowNewForm(true);
    setSelectedId(null);
  };

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/addresses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          street: form.street,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
          country: form.country,
          extra_info: form.extra_info,
          is_default: form.makeDefault,
        })
      });
      if (res.ok) {
        if (form.save) {
          // Refrescar lista
          const data = await res.json();
          setAddresses(a => [...a, data.address]);
          setSelectedId(data.address.id);
          setShowNewForm(false);
        } else {
          // No guardar, solo usar para este pedido
          setSelectedId('temp');
          setShowNewForm(false);
        }
        setForm({ street: '', city: '', state: '', zip_code: '', country: '', extra_info: '', save: false, makeDefault: false });
      } else {
        setError('Could not save address.');
      }
    } catch {
      setError('Could not save address.');
    }
  };

  // Render
  if (loading) return <div className="mb-4">Loading addresses...</div>;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Shipping Address</h3>
      {addresses.length === 0 && !showNewForm && (
        <div>
          <div className="mb-2 text-gray-700">No saved addresses found.</div>
          <button className="bg-blue-700 text-white px-3 py-1 rounded" onClick={handleShowNew}>Add shipping address</button>
        </div>
      )}
      {addresses.length > 0 && !showNewForm && (
        <div className="space-y-2 mb-2">
          <div className="mb-1 text-gray-700">Select a shipping address:</div>
          {addresses.map(addr => (
            <label key={addr.id} className="block border rounded p-2 cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="shipping_address"
                checked={selectedId === addr.id}
                onChange={() => handleSelect(addr.id)}
                className="mr-2"
              />
              {addr.street}, {addr.city}, {addr.state} {addr.zip_code}, {addr.country}
              {addr.is_default && <span className="ml-2 text-xs text-blue-700">(Default)</span>}
            </label>
          ))}
          <button className="mt-2 text-blue-700 underline" onClick={handleShowNew}>Ship to another address</button>
        </div>
      )}
      {showNewForm && (
        <form className="space-y-2 border rounded p-3 bg-gray-50" onSubmit={handleSaveNew}>
          <div className="font-semibold mb-1">Enter a new shipping address:</div>
          <input className="w-full border rounded px-2 py-1" name="street" placeholder="Street" value={form.street} onChange={handleFormChange} required />
          <input className="w-full border rounded px-2 py-1" name="city" placeholder="City" value={form.city} onChange={handleFormChange} required />
          <input className="w-full border rounded px-2 py-1" name="state" placeholder="State" value={form.state} onChange={handleFormChange} />
          <input className="w-full border rounded px-2 py-1" name="zip_code" placeholder="ZIP Code" value={form.zip_code} onChange={handleFormChange} />
          <input className="w-full border rounded px-2 py-1" name="country" placeholder="Country" value={form.country} onChange={handleFormChange} required />
          <input className="w-full border rounded px-2 py-1" name="extra_info" placeholder="Extra info (optional)" value={form.extra_info} onChange={handleFormChange} />
          <div className="flex items-center gap-2">
            <input type="checkbox" name="save" checked={form.save} onChange={handleFormChange} id="save" />
            <label htmlFor="save">Save this address to my address book</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="makeDefault" checked={form.makeDefault} onChange={handleFormChange} id="makeDefault" />
            <label htmlFor="makeDefault">Set as default address</label>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-blue-700 text-white px-4 py-1 rounded">Save</button>
            <button type="button" className="bg-gray-200 px-4 py-1 rounded" onClick={() => setShowNewForm(false)}>Cancel</button>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ShippingAddressSelector; 