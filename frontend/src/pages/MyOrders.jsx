import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const MyOrders = () => {
  const navigate = useNavigate();
  const { state: authState } = useContext(AuthContext);
  
  // Cambiar el título de la página
  usePageTitle('My Orders');
  
  // Main states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed, shipped
  
  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load user orders
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchOrders();
    }
  }, [authState.isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Error loading orders');
      }
    } catch (error) {
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'pending':
        return order.status === 'pending';
      case 'shipped':
        return order.status === 'shipped';
      case 'completed':
        return order.status === 'completed';
      default:
        return true;
    }
  });

  // Function to open review modal
  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setReviewForm({
      rating: 5,
      title: '',
      comment: ''
    });
    setShowReviewModal(true);
  };

  // Function to submit review
  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const response = await fetch(`${API_BASE}/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment
        })
      });

      if (response.ok) {
        setShowReviewModal(false);
        setSelectedProduct(null);
        // Optional: show success message
      } else {
        const data = await response.json();
        setError(data.message || 'Error submitting review');
      }
    } catch (error) {
      setError('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to translate status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'shipped':
        return 'Shipped';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-950">
        <div className="text-white text-xl">Loading orders...</div>
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
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-blue-200">Manage your orders and rate your products</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'all' 
                  ? 'bg-mariner-500 text-white' 
                  : 'bg-mariner-700 text-mariner-200 hover:bg-mariner-600'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-700 text-yellow-200 hover:bg-yellow-600'
              }`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'shipped' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-700 text-blue-200 hover:bg-blue-600'
              }`}
            >
              Shipped ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-700 text-green-200 hover:bg-green-600'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders</h3>
            <p className="text-blue-200">
              {activeTab === 'all' 
                ? 'You haven\'t made any purchases yet'
                : `You don't have ${activeTab === 'pending' ? 'pending' : activeTab === 'shipped' ? 'shipped' : 'completed'} orders`
              }
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-mariner-500 hover:bg-mariner-400 rounded-lg transition-colors"
            >
              Go to store
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-mariner-800 rounded-lg p-6 shadow-lg">
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b border-mariner-700">
                  <div>
                    <h3 className="text-lg font-semibold">Orden #{order.id}</h3>
                    <p className="text-blue-200 text-sm">
                      {formatDate(order.creation_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-lg font-bold">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-mariner-700 rounded-lg">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                                             <div className="flex-1">
                         <h4 className="font-semibold">{item.product?.name}</h4>
                         <p className="text-blue-200 text-sm">
                           Quantity: {item.quantity} × ${item.price.toFixed(2)}
                         </p>
                         <p className="text-blue-200 text-sm">
                           Subtotal: ${(item.quantity * item.price).toFixed(2)}
                         </p>
                       </div>
                       {order.status === 'completed' && (
                         <button
                           onClick={() => openReviewModal(item.product)}
                           className="px-4 py-2 bg-mariner-500 hover:bg-mariner-400 rounded-lg transition-colors text-sm"
                         >
                           Rate
                         </button>
                       )}
                    </div>
                  ))}
                </div>

                                 {/* Shipping address */}
                 {order.address && (
                   <div className="mt-4 p-4 bg-mariner-700 rounded-lg">
                     <h4 className="font-semibold mb-2">Shipping address:</h4>
                     <p className="text-blue-200 text-sm">
                       {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip_code}
                     </p>
                     {order.address.extra_info && (
                       <p className="text-blue-200 text-sm mt-1">
                         {order.address.extra_info}
                       </p>
                     )}
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                         <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Rate product</h3>
               <button
                 onClick={() => setShowReviewModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </button>
             </div>

            {selectedProduct && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedProduct.images?.[0] && (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-gray-600 text-sm">{selectedProduct.brand?.name}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={submitReview}>
                             {/* Rating */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Rating
                 </label>
                 <div className="flex gap-1">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                       className={`text-2xl ${
                         star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                       }`}
                     >
                       ★
                     </button>
                   ))}
                 </div>
               </div>

               {/* Title */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Title (optional)
                 </label>
                 <input
                   type="text"
                   value={reviewForm.title}
                   onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mariner-500"
                   placeholder="Summary of your experience"
                 />
               </div>

               {/* Comment */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Comment (optional)
                 </label>
                 <textarea
                   value={reviewForm.comment}
                   onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mariner-500"
                   placeholder="Share your experience with this product..."
                 />
               </div>

               {/* Buttons */}
               <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => setShowReviewModal(false)}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={submittingReview}
                   className="flex-1 px-4 py-2 bg-mariner-500 text-white rounded-lg hover:bg-mariner-400 transition-colors disabled:opacity-50"
                 >
                   {submittingReview ? 'Submitting...' : 'Submit Review'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders; 