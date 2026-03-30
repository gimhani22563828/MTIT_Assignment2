import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null);
  
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
  
    useEffect(() => { fetchOrders(); }, []);

    const markOrderReady = async (id) => {
        setMarking(id);
        try {
            await api.put(`/orders/${id}/ready`, {});
            fetchOrders();
            alert('Order marked as ready');
        } catch (err) { alert(err.response?.data?.error || 'Failed to mark order ready'); }
        finally { setMarking(null); }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-red-100 text-red-800',
            preparing: 'bg-yellow-100 text-yellow-800',
            ready: 'bg-purple-100 text-purple-800',
            picked: 'bg-orange-100 text-orange-800',
            delivering: 'bg-cyan-100 text-cyan-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        if (status === 'delivered') return <CheckCircle className="w-4 h-4 mr-1" />;
        if (status === 'ready') return <Clock className="w-4 h-4 mr-1" />;
        if (status === 'cancelled') return <AlertCircle className="w-4 h-4 mr-1" />;
        return null;
    };

    // Filter out orders in picked, delivering, or delivered status (managed by delivery persons)
    const adminOrders = orders.filter(order => 
        !['picked', 'delivering', 'delivered'].includes(order.orderStatus)
    );

    if(loading) return <div className="text-center py-20 animate-pulse text-gray-500 font-bold">Loading orders...</div>;
  
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Manage Orders</h1>
        
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Location/Address</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {adminOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">...{order._id.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={order.location}>{order.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(order.orderStatus === 'pending' || order.orderStatus === 'preparing') ? (
                        <button 
                          onClick={() => markOrderReady(order._id)}
                          disabled={marking === order._id}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {marking === order._id ? 'Marking...' : 'Mark Ready'}
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adminOrders.length === 0 && <div className="p-10 text-center text-gray-500 font-medium">No orders found. Delivery persons are managing in-transit orders.</div>}
        </div>
      </div>
    );
  };
  
export default AdminOrders;
