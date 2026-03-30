import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Payment from './pages/Payment';
import Delivery from './pages/Delivery';
import DeliveryPersonDashboard from './pages/DeliveryPersonDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './admin/AdminDashboard';
import AdminRestaurants from './admin/AdminRestaurants';
import AdminMenu from './admin/AdminMenu';
import OrderManagement from './admin/OrderManagement';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-grow mt-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/delivery/:orderId" element={<Delivery />} />
          </Route>

          <Route element={<ProtectedRoute role="deliveryPerson" />}>
            <Route path="/delivery-dashboard" element={<DeliveryPersonDashboard />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
