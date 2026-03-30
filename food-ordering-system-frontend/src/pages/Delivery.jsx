import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, Clock, Phone, User, CheckCircle, AlertCircle, RefreshCw, Package } from 'lucide-react';

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Handle page visibility changes - stop polling when page is not visible
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!autoRefresh || !isVisible) return; // Don't fetch if auto-refresh is off or page is hidden
    
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 3000); // Refresh every 3 seconds for real-time tracking
    
    return () => clearInterval(interval);
  }, [orderId, autoRefresh, isVisible]);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get(`/orders/details/${orderId}`);
      const orderData = response.data;
      setOrder(orderData);
      setError(null);
      setLastUpdated(new Date());
      console.log('[DeliveryTracking] Order fetched:', orderData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order information');
      console.error('Error fetching order:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
      case 'preparing':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'ready':
        return <Package className="h-6 w-6 text-purple-500" />;
      case 'picked':
        return <User className="h-6 w-6 text-blue-500" />;
      case 'delivering':
        return <Truck className="h-6 w-6 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'picked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivering':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': 
        return 'Payment Pending';
      case 'preparing':
        return 'Preparing Your Order';
      case 'ready': 
        return 'Ready for Delivery';
      case 'picked':
        return 'Picked Up - On The Way';
      case 'delivering': 
        return 'Delivery in Progress';
      case 'delivered': 
        return 'Order Delivered Successfully';
      case 'cancelled': 
        return 'Order Cancelled';
      default: 
        return 'Status Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Unable to Load Order</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/orders')}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // Check if order is in a trackable state
  const isTrackable = ['ready', 'picked', 'delivering', 'delivered'].includes(order?.orderStatus);
  const isNotReadyYet = ['pending', 'preparing'].includes(order?.orderStatus);
  const isCancelled = order?.orderStatus === 'cancelled';

  if (isNotReadyYet) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-md w-full">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-800 mb-3">Order Not Ready Yet</h2>
            <p className="text-yellow-700 mb-6">
              {order?.orderStatus === 'pending' 
                ? "Your payment is still pending. Please complete the payment to start delivery."
                : "Your order is still being prepared in the restaurant. Tracking will be available once it's ready for delivery!"}
            </p>
            <div className="space-y-3">
              <Link 
                to="/orders"
                className="block w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition"
              >
                Back to Orders
              </Link>
              <button 
                onClick={() => fetchOrder()}
                className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-yellow-700 font-bold rounded-xl border-2 border-yellow-200 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-md w-full">
          <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Cancelled</h2>
            <p className="text-gray-700 mb-6">This order has been cancelled and cannot be tracked.</p>
            <Link 
              to="/orders"
              className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">This order doesn't exist or cannot be accessed.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Auto-Refresh Status */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Track Delivery</h1>
            <p className="text-gray-600 text-sm">Order #{orderId?.slice(-6).toUpperCase()}</p>
          </div>
          <div className="text-right">
            {autoRefresh && (
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                Live Updates
              </div>
            )}
            {lastUpdated && (
              <p className="text-xs text-gray-500">Updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </div>

        {/* Main Status Card - More Detailed */}
        <div className={`rounded-3xl shadow-xl p-8 mb-6 border-2 ${getStatusColor(order.orderStatus)} bg-white`}>
          <div className="flex items-center gap-4 mb-6">
            {getStatusIcon(order.orderStatus)}
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Current Status</p>
              <p className="text-2xl font-black text-gray-900">{getStatusText(order.orderStatus)}</p>
            </div>
            {order.orderStatus === 'delivered' && (
              <div className="text-green-600 font-bold text-sm">✅ Completed</div>
            )}
            {order.orderStatus === 'cancelled' && (
              <div className="text-red-600 font-bold text-sm">❌ Cancelled</div>
            )}
          </div>

          {/* Detailed Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            {/* Order Amount */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-bold uppercase">Order Total</p>
              <p className="text-2xl font-black text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>

            {/* Items Count */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-bold uppercase">Items</p>
              <p className="text-2xl font-black text-gray-900">{order.items?.length || 0} items</p>
              {order.items && order.items.map((item, idx) => (
                <p key={idx} className="text-xs text-gray-600 mt-2">
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>

            {/* Order Time */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-600 font-bold uppercase">Ordered At</p>
              <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            {/* Delivery Time (if delivered) */}
            {order.actualDeliveryTime && (
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-xs text-green-700 font-bold uppercase">Delivered At</p>
                <p className="text-sm font-semibold text-green-900">{new Date(order.actualDeliveryTime).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {['ready', 'picked', 'delivering'].includes(order.orderStatus) && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-600">Delivery Progress</span>
                <span className="text-xs font-bold text-gray-600">
                  {order.orderStatus === 'ready' && '25%'}
                  {order.orderStatus === 'picked' && '50%'}
                  {order.orderStatus === 'delivering' && '75%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    order.orderStatus === 'ready' ? 'bg-purple-600 w-1/4' :
                    order.orderStatus === 'picked' ? 'bg-blue-600 w-2/4' :
                    order.orderStatus === 'delivering' ? 'bg-indigo-600 w-3/4' :
                    'bg-green-600 w-full'
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Estimated Time */}
          {!['delivered', 'cancelled'].includes(order.orderStatus) && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200 rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-sm font-medium mb-1">⏱️ Estimated Arrival</p>
              <p className="text-3xl font-black text-primary-600">{order.estimatedDeliveryTime || 30} mins</p>
            </div>
          )}

          {order.orderStatus === 'delivered' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-bold">✅ Delivered Successfully!</p>
              {order.actualDeliveryTime && (
                <p className="text-green-600 text-sm mt-1">{new Date(order.actualDeliveryTime).toLocaleString()}</p>
              )}
            </div>
          )}
        </div>

        {/* Delivery Partner Card - Only show if assigned */}
        {order.deliveryPersonName && ['ready', 'picked', 'delivering'].includes(order.orderStatus) && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border-2 border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Your Delivery Partner
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {order.deliveryPersonName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{order.deliveryPersonName}</p>
                  {order.deliveryPersonPhone && (
                    <a 
                      href={`tel:${order.deliveryPersonPhone}`}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1 mt-1"
                    >
                      <Phone className="h-4 w-4" />
                      {order.deliveryPersonPhone}
                    </a>
                  )}
                </div>
              </div>
              {order.deliveryPersonPhone && (
                <a 
                  href={`tel:${order.deliveryPersonPhone}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition transform hover:scale-105"
                >
                  Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* Delivery Address Card - Complete Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border-2 border-red-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            Delivery Location
          </h3>
          
          {/* Primary Address */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border-2 border-red-100 mb-4">
            <p className="text-xs text-red-700 font-bold uppercase mb-2">📍 Delivery Address</p>
            <p className="text-gray-900 font-semibold text-base leading-relaxed">
              {order.location || 'Address not specified'}
            </p>
          </div>

          {/* Alternate Address (if exists) */}
          {order.deliveryAddress && order.deliveryAddress !== order.location && (
            <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
              <p className="text-xs text-blue-700 font-bold uppercase mb-2">📮 Additional Address</p>
              <p className="text-gray-900 font-semibold text-base leading-relaxed">
                {order.deliveryAddress}
              </p>
            </div>
          )}

          {/* Coordinates (if available) */}
          {(order.latitude || order.longitude) && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-xs text-gray-600 font-bold uppercase mb-2">📡 Location Coordinates</p>
              <p className="text-sm font-mono text-gray-900">
                Lat: {order.latitude?.toFixed(6)}, Lon: {order.longitude?.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => fetchOrder()}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md transform hover:-translate-y-1"
          >
            <RefreshCw className="h-5 w-5" />
            Update Now
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-xl cursor-pointer transition">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-5 h-5"
            />
            Auto-Update
          </label>
        </div>

        {/* Back Button */}
        <Link 
          to="/orders"
          className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition text-center"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default DeliveryTracking;
