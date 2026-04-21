import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import ProductManager from './AddProduct';

function Dashboard() {
  const [view, setView] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalStockIn: 0, totalStockOut: 0, recentActivity: [] });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { headers: { "authorization": token } };
    
    try {
      // Run both requests at the same time for speed
      const [prodRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3000/products", headers),
        axios.get("http://localhost:3000/dashboard-stats", headers)
      ]);
      
      setProducts(prodRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setReportLoading(true);
    const token = localStorage.getItem("token");
    const headers = { headers: { "authorization": token } };
    
    try {
      const [prodRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3000/products", headers),
        axios.get("http://localhost:3000/dashboard-stats", headers)
      ]);

      // Derived report metrics
      const totalProducts = prodRes.data.length;
      const totalStockValue = prodRes.data.reduce((sum, p) => sum + p.quantity, 0);
      const avgStockPerProduct = totalProducts > 0 ? (totalStockValue / totalProducts).toFixed(1) : 0;
      const lowStockProducts = prodRes.data.filter(p => p.quantity <= 3).length;

      setReportData({
        totalProducts,
        totalStockValue,
        avgStockPerProduct: parseFloat(avgStockPerProduct),
        lowStockProducts,
        ...statsRes.data
      });
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (view === "dashboard") {
      fetchData();
    } else if (view === "reports") {
      fetchReportData();
    }
  }, [view]);

  if (loading && view === "dashboard") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full font-sans">
      <Navbar setView={setView} />

      <main className="flex-1 p-6 md:p-12">
        {view === "dashboard" ? (
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-black text-gray-800">Inventory Overview</h1>
              <p className="text-gray-500">Real-time statistics of your school stores.</p>
            </div>

            {/* SIMPLE STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Available Stock</p>
                  <h2 className="text-5xl font-black text-green-600">{stats.totalStockIn}</h2>
                </div>
          
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Stock Out</p>
                  <h2 className="text-5xl font-black text-orange-500">{stats.totalStockOut}</h2>
                </div>
          
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* CURRENT INVENTORY GRID */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6  rounded-full"></span>
                  Active Products
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Item Name</p>
                      <h4 className="text-lg font-black text-gray-800">{item.name}</h4>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="text-3xl font-black text-gray-900">{item.quantity}</span>
                        <span className="text-[10px] font-bold text-gray-400 pb-1">UNITS LEFT</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIVITY CARD */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 self-start">
                <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tight">Recent Activity</h3>
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {stats.recentActivity.length > 0 ? stats.recentActivity.map(log => (
                    <div key={log.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-500 border-4 border-white"></div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-800 uppercase tracking-tight">
                           -{log.quantity_removed} {log.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(log.removed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.removed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-sm font-medium italic pl-4">No recent movements logged.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : view === "reports" ? (
          reportLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
            </div>
          ) : reportData ? (
            <div className="max-w-6xl mx-auto space-y-10">
              {/* Reports Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-800 tracking-tight">📊 Inventory Report</h1>
                  <p className="text-gray-500 font-medium mt-1">Generated on {new Date().toLocaleDateString()} for your school store</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.print()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
                  >
                    🖨️ Print / PDF
                  </button>
                  <button 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
                    onClick={() => {
                      const dataStr = JSON.stringify(reportData, null, 2);
                      const blob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `stockpro-report-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                  >
                    📥 Export JSON
                  </button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-3xl shadow-xl">
                  <p className="text-blue-100 font-bold uppercase text-sm tracking-wider">Total Products</p>
                  <h2 className="text-4xl font-black mt-2">{reportData.totalProducts}</h2>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-3xl shadow-xl">
                  <p className="text-green-100 font-bold uppercase text-sm tracking-wider">Total Stock</p>
                  <h2 className="text-4xl font-black mt-2">{reportData.totalStockIn.toLocaleString()}</h2>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-3xl shadow-xl">
                  <p className="text-orange-100 font-bold uppercase text-sm tracking-wider">Stock Removed</p>
                  <h2 className="text-4xl font-black mt-2">{reportData.totalStockOut.toLocaleString()}</h2>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl">
                  <p className="text-purple-100 font-bold uppercase text-sm tracking-wider">Low Stock Alerts</p>
                  <h2 className="text-4xl font-black mt-2">{reportData.lowStockProducts}</h2>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-800 mb-4">📈 Stock Analysis</h3>
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-black text-gray-900">{reportData.avgStockPerProduct}</p>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Avg per Product</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-gray-900">{reportData.totalStockValue}</p>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Units Value</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-800 mb-6">📋 Recent Stock Movements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 font-black text-gray-700 uppercase text-xs tracking-wider">Product</th>
                        <th className="p-4 font-black text-gray-700 uppercase text-xs tracking-wider text-center">Qty Removed</th>
                        <th className="p-4 font-black text-gray-700 uppercase text-xs tracking-wider text-center">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.recentActivity.slice(0, 10).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-semibold text-gray-900">{log.name}</td>
                          <td className="p-4 text-center text-xl font-black text-red-500">-{log.quantity_removed}</td>
                          <td className="p-4 text-center text-sm text-gray-500">
                            {new Date(log.removed_at).toLocaleString()}
                          </td>
                        </tr>
                      )) || <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">No activity recorded</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Failed to load report data. Please refresh.</p>
            </div>
          )
        ) : (
          <ProductManager />
        )}
      </main>
    </div>
  );
}

export default Dashboard;
