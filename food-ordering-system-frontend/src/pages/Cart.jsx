import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Trash2, ArrowRight, ShoppingBag, MapPin, Loader } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (data && data.display_name) {
                    setLocation(data.display_name);
                } else {
                    setLocation(`${latitude}, ${longitude}`);
                }
            } catch (err) {
                setLocation(`${latitude}, ${longitude}`);
            } finally {
                setLocationLoading(false);
            }
        },
        () => {
            setError("Unable to retrieve your location. Please ensure permissions are granted.");
            setLocationLoading(false);
        }
    );
  };

  const handleOrder = async () => {
    if (!user) {
      if(window.confirm("You need to login to place an order. Redirect to login?")) {
        navigate('/login');
      }
      return;
    }
    if(!location.trim()) {
        setError("Location is required to successfully process delivery.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const orderPayload = {
        userId: user.id || "manual-decoded-user",
        restaurantId: cart.restaurantId,
        items: cart.items.map(i => ({ menuId: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount: totalAmount,
        location: location
      };

      const response = await api.post('/orders', orderPayload);
      clearCart();
      navigate(`/payment/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 px-4">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-8">
          <ShoppingBag className="h-16 w-16" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Your cart is empty</h1>
        <p className="text-slate-600 max-w-md mb-8 font-medium">Looks like you haven't added any delicious food to your cart yet. Let's change that!</p>
        <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Your Order</h1>
          <p className="text-slate-600 font-medium">Review your items and complete your order</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8 text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* Cart Items */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item._id} className="flex justify-between items-center pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                    <div className="text-slate-500 font-medium text-sm">
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-right">
                    <span className="font-black text-slate-900 text-xl">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="bg-slate-100 rounded-lg px-3 py-1">
                      <span className="font-bold text-slate-700">{item.quantity}x</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-8 border-t border-slate-200">
          <div className="space-y-6">
            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Delivery Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your delivery address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-4 pr-14 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-700 font-medium placeholder-slate-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 bg-primary-50 hover:bg-primary-100 p-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm"
                  title="Use current location"
                >
                  {locationLoading ? <Loader className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Order Summary & Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-slate-200">
              <div className="text-left">
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Amount</span>
                <div className="text-4xl font-black text-slate-900 mt-1">${totalAmount.toFixed(2)}</div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading || !location.trim()}
                className={`w-full md:w-auto flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  loading || !location.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
