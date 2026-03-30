import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [updating, setUpdating] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            alert('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            preparing: 'bg-blue-50 border-blue-200 text-blue-700',
            ready: 'bg-purple-50 border-purple-200 text-purple-700',
            picked: 'bg-orange-50 border-orange-200 text-orange-700',
            delivering: 'bg-cyan-50 border-cyan-200 text-cyan-700',
            delivered: 'bg-green-50 border-green-200 text-green-700',
            cancelled: 'bg-red-50 border-red-200 text-red-700'
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            preparing: <Clock className="w-4 h-4" />,
            ready: <AlertCircle className="w-4 h-4" />,
            picked: <CheckCircle className="w-4 h-4" />,
            delivering: <CheckCircle className="w-4 h-4" />,
            delivered: <CheckCircle className="w-4 h-4" />,
            cancelled: <AlertCircle className="w-4 h-4" />
        };
        return icons[status] || icons.pending;
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            if (newStatus === 'ready') {
                // Mark as ready and auto-assign delivery person
                const res = await api.put(`/orders/${orderId}/ready`);
                if (res.data?.order) {
                    setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
                    alert(res.data.message);
                }
            } else {
                // Simple status update
                const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
                if (res.data?.order) {
                    setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
                    alert('Order status updated');
                }
            }
        } catch (err) {
            console.error('Failed to update order:', err);
            alert(err.response?.data?.error || 'Failed to update order status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = orders
        .filter(o => !['picked', 'delivering', 'delivered'].includes(o.orderStatus))
        .filter(o => o.orderStatus === statusFilter);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Order Management</h1>
                <div className="text-sm text-gray-600">
                    Total Orders: <span className="font-bold text-primary-600">{orders.length}</span>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                {['pending', 'preparing', 'ready', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.orderStatus === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                                statusFilter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <div className="text-gray-400 mb-2">
                            <Clock className="w-12 h-12 mx-auto opacity-50 mb-4" />
                        </div>
                        <p className="text-gray-600 font-medium">No orders in {statusFilter} status</p>
                        <p className="text-gray-400 text-sm mt-2">Delivery persons manage orders in transit</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div
                            key={order._id}
                            className={`bg-white rounded-xl border-2 p-6 transition-all hover:shadow-md ${getStatusColor(
                                order.orderStatus
                            )}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Order Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        {getStatusIcon(order.orderStatus)}
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                                            <p className="font-mono font-bold text-gray-900">...{order._id.slice(-6)}</p>
                                        </div>
                                    </div>

                                    {/* Order Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Address</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {order.location || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Amount</p>
                                            <p className="text-sm font-bold text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                                            <p className="text-sm font-bold text-gray-900 capitalize">{order.orderStatus}</p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Items</p>
                                        <div className="space-y-1">
                                            {order.items?.map((item, idx) => (
                                                <p key={idx} className="text-sm text-gray-700">
                                                    {item.quantity}x {item.name} <span className="text-gray-500">${item.price?.toFixed(2)}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Person Information */}
                                    {order.deliveryPersonName && (
                                        <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Assigned Delivery Person</p>
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-900">{order.deliveryPersonName}</p>
                                                <p className="text-sm text-gray-700">{order.deliveryPersonPhone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time */}
                                    <p className="text-xs text-gray-500">
                                        📅 {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="ml-4 flex flex-col gap-2 min-w-fit">
                                    {order.orderStatus === 'pending' && (
                                        <button
                                            onClick={() => handleStatusChange(order._id, 'preparing')}
                                            disabled={updating === order._id}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {updating === order._id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    Start Preparing
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {order.orderStatus === 'preparing' && (
                                        <button
                                            onClick={() => handleStatusChange(order._id, 'ready')}
                                            disabled={updating === order._id}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {updating === order._id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Assigning...
                                                </>
                                            ) : (
                                                <>
                                                    Mark Ready
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {['pending', 'preparing', 'ready'].includes(order.orderStatus) && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to cancel this order?')) {
                                                    handleStatusChange(order._id, 'cancelled');
                                                }
                                            }}
                                            disabled={updating === order._id}
                                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
