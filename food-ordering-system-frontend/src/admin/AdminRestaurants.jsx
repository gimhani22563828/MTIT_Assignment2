import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, MapPin, Image as ImageIcon, Plus, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Default Colombo
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
      },
    });
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('cuisineType', cuisineType);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    if (image) formData.append('image', image);

    try {
      await api.post('/restaurants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setName(''); setAddress(''); setCuisineType(''); setImage(null);
      fetchRestaurants();
    } catch (err) { alert('Failed to add restaurant'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete restaurant?')) return;
    try {
      await api.delete(`/restaurants/${id}`);
      fetchRestaurants();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Restaurants</h1>
          <p className="text-slate-500 font-medium">Create and manage your restaurant outlets.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-primary-600 mb-2">
             <Plus className="w-5 h-5 font-bold" />
             <h3 className="font-black text-xl">Add New Outlet</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Restaurant Name</label>
              <input required type="text" placeholder="e.g. Italian Bistro" value={name} onChange={e => setName(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Cuisine Type</label>
                  <input type="text" placeholder="e.g. Italian" value={cuisineType} onChange={e => setCuisineType(e.target.value)} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Cover Image</label>
                  <label className="flex items-center justify-center w-full p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary-400 cursor-pointer transition-all">
                    <ImageIcon className="w-5 h-5 text-slate-400 mr-2" />
                    <span className="text-sm font-bold text-slate-500 truncate">{image ? image.name : 'Choose Image'}</span>
                    <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
                  </label>
               </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Address</label>
              <input required type="text" placeholder="Street, City, Postcode" value={address} onChange={e => setAddress(e.target.value)} 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1 flex items-center justify-between">
                <span>Pin Location on Map</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Click to Move Pin</span>
              </label>
              <div className="h-64 rounded-3xl overflow-hidden shadow-inner border border-slate-100">
                <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]} icon={customIcon} />
                  <MapEvents />
                </MapContainer>
              </div>
              <p className="mt-2 text-[10px] text-slate-400 font-bold px-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-primary-600 transition-all shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1 disabled:opacity-50">
            {loading ? 'Adding...' : 'Register Restaurant'}
          </button>
        </form>

        {/* List Section */}
        <div className="space-y-6">
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="font-black text-slate-800 text-lg">Existing Outlets</h3>
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{restaurants.length} Total</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto">
                {restaurants.map(rest => (
                  <div key={rest._id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                           {rest.image ? (
                               <img src={`http://localhost:3000/uploads/${rest.image}`} alt="" className="w-full h-full object-cover" />
                           ) : (
                               <ImageIcon className="w-6 h-6 text-slate-300" />
                           )}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">{rest.name}</h4>
                           <p className="text-xs text-slate-500 font-medium flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> {rest.address}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => handleDelete(rest._id)} className="p-3 text-red-100 group-hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                ))}
                {restaurants.length === 0 && (
                   <div className="p-20 text-center space-y-4">
                      <Info className="w-12 h-12 text-slate-100 mx-auto" />
                      <p className="text-slate-400 font-bold">No restaurants registered yet.</p>
                   </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;
