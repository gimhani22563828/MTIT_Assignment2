import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import logo from '../assets/Screenshot_2026-03-30_022526-removebg-preview.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-4' : 'bg-white/90 backdrop-blur-sm py-6 shadow-sm'}`}>
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-3 rounded-2xl shadow-lg group-hover:scale-105 transition-transform border border-slate-200">
              <img src={logo} alt="Epicura Logo" className="h-8 w-8" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
              Epicura
            </span>
          </Link>

          <div className="flex items-center space-x-10">
            {user?.role === 'user' && (
              <Link to="/cart" className="relative group flex items-center">
                <div className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-primary-600 transition-colors" />
                </div>
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-md shadow-primary-500/40 border-2 border-white transform scale-100 animate-fade-in-up">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-8">
                {user.role === 'admin' && (
                  <Link to="/admin/restaurants" className="flex items-center text-sm font-bold text-slate-700 hover:text-primary-600 bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-full hover:shadow-md transition-all">
                    <LayoutDashboard className="w-5 h-5 mr-3 text-primary-500" />
                    Admin Panel
                  </Link>
                )}
                
                {user.role === 'deliveryPerson' && (
                  <Link to="/delivery-dashboard" className="flex items-center text-sm font-bold text-slate-700 hover:text-primary-600 bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-full hover:shadow-md transition-all">
                    <LayoutDashboard className="w-5 h-5 mr-3 text-primary-500" />
                    My Deliveries
                  </Link>
                )}
                
                {user.role === 'user' && (
                  <Link to="/orders" className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${isActive('/orders') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'}`}>
                    My Orders
                  </Link>
                )}
                
                <div className="h-8 w-px bg-slate-200"></div>

                <div className="group relative cursor-pointer flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  
                  <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="p-5 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-3">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
