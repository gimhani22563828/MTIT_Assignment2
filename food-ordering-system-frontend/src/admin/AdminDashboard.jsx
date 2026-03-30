import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Store, UtensilsCrossed, FileText, BarChart3, Users, TrendingUp, Package } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const location = useLocation();
  const isMainDashboard = location.pathname === '/admin';

  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-5 h-5 mr-3" />, end: true },
    { name: 'Restaurants', path: '/admin/restaurants', icon: <Store className="w-5 h-5 mr-3" /> },
    { name: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed className="w-5 h-5 mr-3" /> },
    { name: 'Orders', path: '/admin/orders', icon: <FileText className="w-5 h-5 mr-3" /> },
  ];

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch restaurants count
      const restaurantsRes = await api.get('/restaurants');
      const totalRestaurants = restaurantsRes.data?.length || 0;

      // Fetch orders count and calculate active orders and revenue
      const ordersRes = await api.get('/orders');
      const allOrders = ordersRes.data || [];
      const activeOrders = allOrders.filter(order =>
        ['ready', 'picked', 'delivering'].includes(order.orderStatus)
      ).length;
      const totalRevenue = allOrders
        .filter(order => order.orderStatus === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // For now, set total users to a placeholder since we don't have a users endpoint
      // In a real app, you'd have an admin endpoint for this
      const totalUsers = 0; // Placeholder

      setStats({
        totalRestaurants,
        activeOrders,
        totalUsers,
        totalRevenue
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Restaurants',
      value: stats.totalRestaurants,
      icon: <Store className="w-8 h-6" />,
      color: 'from-blue-500 to-blue-600',
      loading: loading
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: <Package className="w-8 h-6" />,
      color: 'from-green-500 to-green-600',
      loading: loading
    },

    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <TrendingUp className="w-8 h-6" />,
      color: 'from-orange-500 to-orange-600',
      loading: loading
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your food ordering platform</p>
          </div>

        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8">
        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex-shrink-0">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Admin Panel</h2>
            <p className="text-sm text-slate-500">Manage your platform</p>
          </div>

          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Stats Cards - Only show on main dashboard */}
          {isMainDashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-black text-slate-900">
                        {stat.loading ? (
                          <div className="animate-pulse bg-slate-200 h-8 w-16 rounded"></div>
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                  {!stat.loading && (
                    <div className="mt-4">
                      <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-semibold">Live data</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
