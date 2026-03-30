import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingBag, ArrowLeft, Star, ChevronRight } from 'lucide-react';

const Menu = () => {
  const { restaurantId } = useParams();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get(`/menu/${restaurantId}`);
        setMenu(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMenu();
  }, [restaurantId]);

  const getItemQuantity = (id) => {
    const item = cart.items.find(i => i._id === id);
    return item ? item.quantity : 0;
  };

  const handleRateFood = async (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    const userId = localStorage.getItem('userId');
    if(!userId) return alert('Please login to rate');

    const score = window.prompt("Rate this food (1-5):");
    if(!score || score < 1 || score > 5) return;

    try {
        const res = await api.post(`/menu/${itemId}/rate`, { userId, score: parseInt(score) });
        setMenu(prev => prev.map(item => item._id === itemId ? { ...item, averageRating: res.data.averageRating } : item));
    } catch (err) { alert('Failed to rate'); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up pb-20 max-w-7xl mx-auto px-4">
      <div className="mb-6 mt-8">
         <button onClick={() => window.history.back()} className="flex items-center text-slate-500 hover:text-slate-900 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to spots
         </button>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 mb-16 shadow-2xl h-64 md:h-80 flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/60 to-primary-900 opacity-90"></div>
         <div className="relative text-center px-4">
             <h1 className="text-5xl md:text-7xl font-black text-white mb-4 animate-fade-in-up stagger-1 drop-shadow-2xl">Culinary Journey</h1>
             <p className="text-slate-300 text-lg md:text-xl font-medium animate-fade-in-up stagger-2">Curated selections for the discerning palate.</p>
         </div>
      </div>

      {menu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {menu.map((item, index) => (
            <div key={item._id} className={`bg-white rounded-[2rem] p-5 flex flex-col shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group animate-fade-in-up stagger-${(index % 6) + 1}`}>
                    <div className="relative h-60 w-full mb-6 rounded-[1.5rem] overflow-hidden">
                       {item.image ? (
                          <img 
                            src={`http://localhost:3000/uploads/${item.image}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            onError={(e) => {
                               e.target.onerror = null;
                               e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";
                            }}
                          />
                       ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-slate-200" /></div>
                       )}
                       <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-xl px-3 py-1.5 rounded-full flex items-center z-10 font-black text-slate-900">
                          ${item.price.toFixed(2)}
                       </div>
                    </div>

                    <div className="px-2 mb-6">
                      <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-primary-600 transition-colors">{item.name}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{item.description || 'Expertly prepared with the finest seasonal ingredients.'}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                       <div className="flex items-center space-x-3">
                          <button onClick={() => removeFromCart(item._id)} disabled={getItemQuantity(item._id) === 0} 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${getItemQuantity(item._id) === 0 ? 'text-slate-300' : 'bg-white shadow-sm text-slate-700 hover:text-red-500 hover:shadow-md'}`}>
                             <Minus className="w-5 h-5" />
                          </button>
                          <span className="w-8 text-center font-black text-slate-900 text-lg">{getItemQuantity(item._id)}</span>
                          <button onClick={() => addToCart(restaurantId, item)}
                            className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 hover:shadow-primary-500/30 transition-all transform active:scale-95">
                             <Plus className="w-5 h-5" />
                          </button>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 mr-1" />
                    </div>
                  </div>
                ))}
              </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
           <ShoppingBag className="w-20 h-20 text-slate-100 mx-auto mb-6" />
           <p className="text-slate-400 text-xl font-bold italic">This kitchen is currently preparing something special...</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
