import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart, ExternalLink, Send } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaGoogle } from 'react-icons/fa';
import logo from '../assets/Screenshot_2026-03-30_022526-removebg-preview.png';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-xl">
                <img src={logo} alt="Epicura Logo" className="h-8 w-8" />
              </div>
              <span className="font-extrabold text-2xl text-white">Epicura</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              The food you love, delivered instantly. Discover extraordinary flavors from the finest restaurants in your city.
            </p>
            <div className="flex items-center space-x-5">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-all duration-300 shadow-lg transform hover:-translate-y-1">
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:-translate-y-1">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-all duration-300 shadow-lg transform hover:-translate-y-1">
                <FaGoogle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-slate-300 hover:text-white transition-colors text-sm">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">123 Food Street, Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">+94 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">hello@epicura.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">Stay Updated</h3>
            <p className="text-slate-300 text-sm">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2026 Epicura. All rights reserved.
          </p>
          <p className="text-slate-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;