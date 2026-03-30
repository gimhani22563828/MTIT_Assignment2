import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trash2, Image as ImageIcon } from 'lucide-react';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', restaurantId: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [menuRes, restRes] = await Promise.all([
        api.get('/menu'), api.get('/restaurants')
      ]);
      setMenuItems(menuRes.data);
      setRestaurants(restRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      await api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData({ name: '', description: '', price: '', restaurantId: '' });
      setImage(null);
      fetchData();
    } catch (err) { alert('Failed to add menu item'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchData();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Manage Menu Items</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-800">Add New Food Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required name="name" type="text" placeholder="Food Name" value={formData.name} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-gray-200" />
          <input required name="price" type="number" placeholder="Price ($)" value={formData.price} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-gray-200" />
          
          <select required name="restaurantId" value={formData.restaurantId} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="" disabled>Select Restaurant</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          
          <input name="description" type="text" placeholder="Description" value={formData.description} onChange={handleInputChange} className="w-full p-3 rounded-lg border border-gray-200 md:col-span-2" />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Food Image</label>
            <div className="flex items-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-primary-200 border-dashed hover:bg-primary-50 hover:border-primary-300 transition rounded-xl cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-7">
                  <ImageIcon className="w-8 h-8 text-primary-400 group-hover:text-primary-600 mb-2" />
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{image ? image.name : 'Select an image file'}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
        <button disabled={loading} type="submit" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 w-full md:w-auto shadow-md">Add Menu Item</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <div key={item._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
            <div className="h-48 relative overflow-hidden group">
              {item.image ? (
                <img 
                  src={`http://localhost:3000/uploads/${item.image}`} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=2070&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-xl text-gray-900 line-clamp-1">{item.name}</h4>
                <span className="text-primary-600 font-black">${item.price.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-500 truncate mb-4">📍 {item.restaurantId?.name}</div>
              <button 
                onClick={() => handleDelete(item._id)} 
                className="w-full flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg font-bold transition"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Remove Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMenu;
