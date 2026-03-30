import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, Package, Truck, AlertCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const targetUserId = localStorage.getItem('userId') || user?.id;
      if (!targetUserId) return;
      
      console.log(`[Frontend] Fetching orders for userId: ${targetUserId}`);
      
      try {
        const response = await api.get(`/orders/${targetUserId}`);
        const sorted = response.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        // For each order, check if a successful payment exists and mark it
        const withPaymentFlags = await Promise.all(sorted.map(async (ord) => {
          try {
            const payRes = await api.get(`/payments/${ord._id}`);
            const payments = payRes.data || [];
            const paid = payments.some(p => p.status && p.status.toLowerCase() === 'success');
            return { ...ord, paid };
          } catch (err) {
            // If payments endpoint fails, assume unpaid to avoid hiding UI incorrectly
            return { ...ord, paid: false };
          }
        }));
        setOrders(withPaymentFlags);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
        case 'pending': return 'bg-red-100 text-red-800';
        case 'preparing': return 'bg-yellow-100 text-yellow-800';
        case 'ready': return 'bg-purple-100 text-purple-800';
        case 'cancelled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'ready': return <Clock className="h-4 w-4 mr-1.5" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 mr-1.5" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Payment Pending',
      preparing: 'Preparing Your Order',
      ready: 'Ready for Delivery',
      picked: 'Picked Up',
      delivering: 'On The Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const isTrackable = (status) => {
    return ['ready', 'picked', 'delivering'].includes(status);
  };

  const getDeliveryStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'assigned': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'in-transit': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'delivered': return 'bg-green-50 border-green-200 text-green-800';
      case 'cancelled': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDeliveryStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Waiting for Partner';
      case 'assigned': return 'Partner Assigned';
      case 'in-transit': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse text-xl">Loading your history...</div>;

  if (orders.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <Package className="h-24 w-24 text-gray-200" />
            <h2 className="text-3xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-500">You haven't placed any orders. Discover great food now!</p>
            <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition">
                Start Browsing
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Order History</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform transition hover:shadow-md">
            <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
                <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </div>
                    <div className="flex items-center text-sm font-semibold text-gray-700">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                <div className={`mt-3 md:mt-0 px-4 py-1.5 rounded-full text-sm font-bold flex items-center ${getStatusColor(order.orderStatus)}`}>
                    {getStatusIcon(order.orderStatus)}
                    {getStatusText(order.orderStatus)}
                </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center text-gray-800">
                    <span className="font-medium flex items-center">
                        <span className="bg-gray-100 text-gray-600 text-xs rounded px-2 py-1 mr-3 font-bold">{item.quantity}x</span> 
                        {item.name}
                    </span>
                    <span className="font-semibold text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium">Total Price</span>
                <span className="text-2xl font-black text-gray-900">${order.totalAmount.toFixed(2)}</span>
              </div>

              {/* Delivery Information - Show based on status */}
              {order.orderStatus === 'pending' && !order.paid && (
                <div className="mt-6 pt-6 border-t-2 border-red-200 bg-red-50 rounded-xl p-4">
                  <p className="text-red-700 font-bold text-center">⏳ Payment Pending - Complete payment to start delivery</p>
                </div>
              )}

              {order.orderStatus === 'preparing' && (
                <div className="mt-6 pt-6 border-t-2 border-yellow-200 bg-yellow-50 rounded-xl p-4">
                  <p className="text-yellow-700 font-bold text-center">👨‍🍳 Your order is being prepared - We'll notify you when it's ready!</p>
                </div>
              )}

              {isTrackable(order.orderStatus) && (
                <div className="mt-6 pt-6 border-t-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-gray-900">Delivery Details</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Current Status</p>
                        <p className="text-lg font-bold text-gray-900">
                          {order.orderStatus === 'ready' && '🎯 Ready for Pickup'}
                          {order.orderStatus === 'picked' && '📦 Picked Up & On Route'}
                          {order.orderStatus === 'delivering' && '🚗 Delivery in Progress'}
                        </p>
                      </div>
                      <Link 
                        to={`/delivery/${order._id}`}
                        className="text-base font-bold bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition transform hover:shadow-lg"
                      >
                        📍 Track Now
                      </Link>
                    </div>
                  </div>

                  {/* Delivery Person Info */}
                  {order.deliveryPersonName && (
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {order.deliveryPersonName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivery Partner</p>
                          <p className="font-bold text-gray-900">{order.deliveryPersonName}</p>
                        </div>
                      </div>
                      
                      {order.deliveryPersonPhone && (
                        <div className="flex items-center gap-3 ml-13">
                          <Phone className="h-4 w-4 text-green-600" />
                          <a 
                            href={`tel:${order.deliveryPersonPhone}`}
                            className="font-semibold text-green-600 hover:text-green-700"
                          >
                            {order.deliveryPersonPhone}
                          </a>
                        </div>
                      )}

                      <p className="text-sm text-gray-600">⏱️ Est. delivery: {order.estimatedDeliveryTime || 30} mins</p>
                    </div>
                  )}
                </div>
              )}

              {order.orderStatus === 'delivered' && (
                <div className="mt-6 pt-6 border-t-2 border-green-200 bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-green-700 font-bold">✅ Delivery Complete!</p>
                      <p className="text-green-600 text-sm">Thank you for your order. Enjoy your meal!</p>
                    </div>
                  </div>
                </div>
              )}

              {order.orderStatus === 'cancelled' && (
                <div className="mt-6 pt-6 border-t-2 border-gray-300 bg-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="text-gray-700 font-bold">❌ Order Cancelled</p>
                      <p className="text-gray-600 text-sm">This order has been cancelled.</p>
                    </div>
                  </div>
                </div>
              )}
              
                {order.orderStatus === 'pending' && !order.paid && (
                  <div className="mt-4 flex justify-end">
                    <Link to={`/payment/${order._id}`} className="text-primary-600 hover:text-primary-700 font-bold bg-primary-50 px-4 py-2 rounded-lg transition">
                      Complete Payment
                    </Link>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
