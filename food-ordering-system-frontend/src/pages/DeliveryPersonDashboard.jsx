import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Package, Truck, CheckCircle, ChevronRight, Clock, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DeliveryPersonDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ready');

    const fetchAssignedOrders = async () => {
        try {
            console.log(`[DeliveryPersonDashboard] Fetching orders for user ID: ${user?.id}`);
            const res = await api.get(`/orders/delivery-person/${user?.id}`);
            console.log(`[DeliveryPersonDashboard] Received ${res.data?.length || 0} orders:`, res.data);
            setOrders(res.data || []);
        } catch (err) {
            console.error('[DeliveryPersonDashboard] Failed to fetch orders:', err);
            console.error('[DeliveryPersonDashboard] Error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchAssignedOrders();
            const interval = setInterval(fetchAssignedOrders, 5000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const getStatusColor = (status) => {
        const colors = {
            ready: 'bg-purple-50 border-purple-200 text-purple-700',
            picked: 'bg-orange-50 border-orange-200 text-orange-700',
            delivering: 'bg-cyan-50 border-cyan-200 text-cyan-700',
            delivered: 'bg-green-50 border-green-200 text-green-700'
        };
        return colors[status] || colors.ready;
    };

    const getNextStatus = (currentStatus) => {
        const progression = {
            ready: 'picked',
            picked: 'delivering',
            delivering: 'delivered'
        };
        return progression[currentStatus];
    };

    const handleStatusUpdate = async (orderId, currentStatus) => {
        const nextStatus = getNextStatus(currentStatus);
        if (!nextStatus) return;

        setUpdating(orderId);
        try {
            const res = await api.put(`/orders/${orderId}/status`, {
                orderStatus: nextStatus,
                deliveryPersonId: user?.id
            });
            if (res.data?.order) {
                setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
                alert(`Order status updated to ${nextStatus}`);
            }
        } catch (err) {
            console.error('Failed to update order:', err);
            const errorMessage = err.response?.data?.error || 'Failed to update order';
            alert(errorMessage);

            // Immediately refresh orders to show current state (e.g., if another delivery person picked it up)
            console.log('[DeliveryPersonDashboard] Refreshing orders after error...');
            fetchAssignedOrders();
        } finally {
            setUpdating(null);
        }
    };

    const getProgressPercentage = (status) => {
        const stages = { ready: 25, picked: 50, delivering: 75, delivered: 100 };
        return stages[status] || 0;
    };

    const filteredOrders = orders.filter(o => o.orderStatus === statusFilter);

    // Calculate stats
    const stats = {
        total: orders.length,
        ready: orders.filter(o => o.orderStatus === 'ready').length,
        picked: orders.filter(o => o.orderStatus === 'picked').length,
        delivering: orders.filter(o => o.orderStatus === 'delivering').length,
        delivered: orders.filter(o => o.orderStatus === 'delivered').length,
        totalEarnings: orders.filter(o => o.orderStatus === 'delivered').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading your deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Delivery Dashboard</h1>
                        <p className="text-slate-600 mt-1">Manage your deliveries efficiently</p>
                    </div>

                </div>
            </div>

            <div className="p-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Total Orders</p>
                                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl text-white shadow-lg">
                                <Package className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Ready for Pickup</p>
                                <p className="text-3xl font-black text-slate-900">{stats.ready}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">In Transit</p>
                                <p className="text-3xl font-black text-slate-900">{stats.delivering}</p>
                            </div>
                            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-3 rounded-2xl text-white shadow-lg">
                                <Truck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">Today's Earnings</p>
                                <p className="text-3xl font-black text-slate-900">${stats.totalEarnings.toFixed(2)}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-2xl text-white shadow-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Order Status</h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { key: 'ready', label: 'Ready for Pickup', emoji: '🎯', count: stats.ready },
                            { key: 'picked', label: 'Picked Up', emoji: '📦', count: stats.picked },
                            { key: 'delivering', label: 'In Transit', emoji: '🚗', count: stats.delivering },
                            { key: 'delivered', label: 'Delivered', emoji: '✅', count: stats.delivered }
                        ].map(status => (
                            <button
                                key={status.key}
                                onClick={() => setStatusFilter(status.key)}
                                className={`flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-200 ${statusFilter === status.key
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-sm'
                                    }`}
                            >
                                <span className="mr-3">{status.emoji}</span>
                                {status.label}
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-bold ${statusFilter === status.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {status.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                            <p className="text-slate-600 mb-6">You don't have any orders in the "{statusFilter}" status right now.</p>
                            <p className="text-slate-500 text-sm">New orders will appear here automatically.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div
                                key={order._id}
                                className={`bg-white rounded-3xl shadow-sm border-2 p-8 transition-all hover:shadow-lg ${getStatusColor(
                                    order.orderStatus
                                )}`}
                            >
                                {/* Header with Order ID and Status */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-slate-100 px-4 py-2 rounded-full">
                                            <span className="text-sm font-mono font-bold text-slate-700">#{order._id.slice(-6)}</span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-bold ${order.orderStatus === 'ready' ? 'bg-purple-100 text-purple-700' :
                                                order.orderStatus === 'picked' ? 'bg-orange-100 text-orange-700' :
                                                    order.orderStatus === 'delivering' ? 'bg-cyan-100 text-cyan-700' :
                                                        'bg-green-100 text-green-700'
                                            }`}>
                                            {order.orderStatus === 'ready' ? 'Ready for Pickup' :
                                                order.orderStatus === 'picked' ? 'Picked Up' :
                                                    order.orderStatus === 'delivering' ? 'In Transit' : 'Delivered'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                                        <p className="text-sm text-slate-500">{order.items?.length || 0} items</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-sm font-semibold text-slate-600">Delivery Progress</p>
                                        <span className="text-sm font-bold text-slate-700">{getProgressPercentage(order.orderStatus)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                            style={{ width: `${getProgressPercentage(order.orderStatus)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Delivery Details */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Delivery Address */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary-100 p-3 rounded-xl">
                                                <MapPin className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-600 uppercase mb-2">Delivery Address</p>
                                                <p className="font-semibold text-slate-900 mb-2">{order.location || 'Not specified'}</p>
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Est. {order.estimatedDeliveryTime || 30} min delivery
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-primary-100 p-3 rounded-xl">
                                                <ShoppingBag className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-600 uppercase mb-3">Order Items</p>
                                                <div className="space-y-2">
                                                    {order.items?.slice(0, 3).map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-700">{item.name}</span>
                                                            <span className="text-sm font-semibold text-slate-900">×{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                    {order.items?.length > 3 && (
                                                        <p className="text-sm text-slate-500">+{order.items.length - 3} more items</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Ordered {new Date(order.createdAt).toLocaleString()}
                                    </div>

                                    {order.orderStatus !== 'delivered' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, order.orderStatus)}
                                            disabled={updating === order._id}
                                            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                                        >
                                            {updating === order._id ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    {order.orderStatus === 'ready' && (
                                                        <>
                                                            <Package className="w-5 h-5" />
                                                            Pick Up Order
                                                        </>
                                                    )}
                                                    {order.orderStatus === 'picked' && (
                                                        <>
                                                            <Truck className="w-5 h-5" />
                                                            Start Delivery
                                                        </>
                                                    )}
                                                    {order.orderStatus === 'delivering' && (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" />
                                                            Mark Delivered
                                                        </>
                                                    )}
                                                    <ChevronRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {order.orderStatus === 'delivered' && (
                                        <div className="flex items-center gap-3 text-green-700 font-bold bg-green-50 px-6 py-4 rounded-2xl">
                                            <CheckCircle className="w-6 h-6" />
                                            Successfully Delivered
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryPersonDashboard;
