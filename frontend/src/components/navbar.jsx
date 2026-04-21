import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ setView }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-full px-4 py-3">
      <nav className="bg-gray-400 px-8 py-3 flex justify-between items-center shadow-md rounded-xl border border-gray-200">
        
        {/* Brand Name */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => setView("dashboard")}
        >
      <div className='animate-pulse'>
          <h1 className="text-lg font-black tracking-tight text-gray-800 uppercase">
            Stock<span className="text-green-600 animate-pulse">Pro</span>
          </h1>
        </div>
</div>
        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => setView("dashboard")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setView("products")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          >
            Products
          </button>

          {/* REPLACED ORDERS WITH REPORT */}
          <button 
            onClick={() => setView("reports")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
          >
            Reports
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-6">
          <span className="text-sm text-gray-600 font-medium hidden sm:block border-r border-gray-300 pr-6">
            User logged in: <span className="text-gray-900 font-bold">{name || "Admin"}</span>
          </span>

          <button 
            onClick={handleLogout}
            className="bg-yellow-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 animate-pulse"
          >
            Logout
          </button>
        </div>

      </nav>
    </div>
  );
}

export default Navbar;