import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, ArrowRight, Utensils, Star, LocateFixed, Loader, X, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, restaurantId: null, restaurantName: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const filteredRestaurants = restaurants.filter(restaurant => {
    if(!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
        restaurant.name?.toLowerCase().includes(query) || 
        restaurant.address?.toLowerCase().includes(query) ||
        restaurant.cuisineType?.toLowerCase().includes(query)
    );
  });

  const handleSearch = () => {
      setSearchQuery(location);
      document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
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
            alert("Unable to retrieve your location. Please ensure tracking permissions are granted.");
            setLocationLoading(false);
        }
    );
  };

  const handleOpenRating = (e, restaurant) => {
      e.preventDefault();
      e.stopPropagation();
      
      const userId = localStorage.getItem('userId');
      if(!userId) {
          alert('Please sign in to rate restaurants.');
          return;
      }
      
      setRatingModal({ isOpen: true, restaurantId: restaurant._id, restaurantName: restaurant.name });
  };

  const submitRating = async (score) => {
      const userId = localStorage.getItem('userId');
      try {
          const res = await api.post(`/restaurants/${ratingModal.restaurantId}/rate`, { userId, score });
          setRestaurants(prev => prev.map(r => r._id === ratingModal.restaurantId ? { ...r, averageRating: res.data.averageRating } : r));
          setRatingModal({ isOpen: false, restaurantId: null, restaurantName: '' });
      } catch (err) {
          console.error(err);
          alert('Failed to submit your rating.');
      }
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants');
        setRestaurants(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-25"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 animate-fade-in-up stagger-1 shadow-lg">
            Welcome to Epicura
          </span>
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight animate-fade-in-up stagger-2 drop-shadow-2xl">
            The food you love, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300 drop-shadow-lg">delivered instantly.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-white max-w-3xl mx-auto mb-6 animate-fade-in-up stagger-3 font-medium leading-relaxed drop-shadow-lg">
            Discover extraordinary flavors from the finest restaurants in your city. Fast, fresh, and unforgettable dining experiences.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-2 animate-fade-in-up stagger-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <LocateFixed className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${locationLoading ? 'text-primary-400' : 'text-primary-500'}`} />
                <input
                  type="text"
                  placeholder="Enter your delivery address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-transparent text-slate-700 placeholder-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-500 bg-primary-50 hover:bg-primary-100 p-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm"
                  title="Use current location"
                >
                  {locationLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Find Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div id="restaurants-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Featured Restaurants</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Explore our curated selection of top-rated restaurants offering exceptional dining experiences</p>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No restaurants found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search criteria or explore all restaurants</p>
              <button
                onClick={() => { setLocation(''); setSearchQuery(''); }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant, index) => (
                <Link
                  key={restaurant._id}
                  to={`/menu/${restaurant._id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    {restaurant.image ? (
                      <img
                        src={`http://localhost:3000/uploads/${restaurant.image}`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <button
                      onClick={(e) => handleOpenRating(e, restaurant)}
                      title="Click to rate this restaurant"
                      className="absolute top-4 right-4 bg-white/95 hover:bg-white backdrop-blur shadow-xl px-3 py-1.5 rounded-full flex items-center z-10 hover:scale-105 transition-all cursor-pointer border border-white/20"
                    >
                      <Star className={`w-4 h-4 ${restaurant.averageRating > 0 ? 'text-orange-400 fill-current mr-1.5' : 'text-slate-300 mr-1.5'}`} />
                      <span className="text-sm font-bold text-slate-800">
                        {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : 'NEW'}
                      </span>
                    </button>

                    {restaurant.cuisineType && (
                      <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10">
                        {restaurant.cuisineType}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center text-slate-500 mb-4">
                      <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                      <span className="text-sm font-medium truncate">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className={`w-7 h-7 rounded-full border-2 border-white bg-slate-${i+1}00 flex items-center justify-center text-xs font-bold text-slate-600`}>
                            {String.fromCharCode(64+i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-primary-600 flex items-center">
                        View Menu <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal Overlay */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative transform transition-all">
            <button
              onClick={() => setRatingModal({isOpen: false, restaurantId: null, restaurantName: ''})}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Star className="w-10 h-10 text-orange-400 fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Rate your experience</h3>
              <p className="text-slate-600 font-medium">How was your meal at <span className="text-slate-900 font-semibold">{ratingModal.restaurantName}</span>?</p>
            </div>

            <div className="flex justify-center space-x-2 mb-6 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => submitRating(star)}
                  className="transition-transform hover:scale-110 hover:-translate-y-1 focus:outline-none p-2 cursor-pointer"
                >
                  <Star className={`w-10 h-10 transition-colors ${star <= hoveredStar ? 'text-orange-400 fill-current' : 'text-slate-200 hover:text-orange-200'}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider">Tap a star to submit your rating</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
