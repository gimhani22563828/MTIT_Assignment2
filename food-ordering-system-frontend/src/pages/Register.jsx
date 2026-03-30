import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Truck } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Register with role
      await api.post('/users/register', {
        name,
        email,
        password,
        phone: role === 'deliveryPerson' ? phone : undefined,
        role
      });
      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('user');
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Join Epicura</h1>
          <p className="text-slate-600 font-medium">Create your account and start your culinary journey</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary-500 to-orange-500"></div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">I want to join as</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex-1 py-4 px-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                      role === 'user'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <User className="w-5 h-5" /> Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('deliveryPerson')}
                    className={`flex-1 py-4 px-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                      role === 'deliveryPerson'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Delivery Partner
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    className="pl-12 w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-slate-700 font-medium placeholder-slate-400"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="pl-12 w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-slate-700 font-medium placeholder-slate-400"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone (for Delivery Persons) */}
              {role === 'deliveryPerson' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required={role === 'deliveryPerson'}
                      autoComplete="tel"
                      className="pl-12 w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-slate-700 font-medium placeholder-slate-400"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="pl-12 w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-slate-700 font-medium placeholder-slate-400"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-600 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
