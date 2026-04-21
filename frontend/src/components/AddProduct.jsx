
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const token = localStorage.getItem("token");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products", {
        headers: { "authorization": token }
      });
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  // Filter products based on search
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  useEffect(() => { fetchProducts(); }, []);

  // 1. ADD NEW PRODUCT
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/products", 
        { name: productName, quantity }, 
        { headers: { "authorization": token } }
      );
      setShowForm(false);
      setProductName("");
      setQuantity("");
      fetchProducts();
    } catch (err) { alert("Failed to add product"); }
  };

  // 2. DELETE PRODUCT
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:3000/products/${id}`, {
          headers: { "authorization": token }
        });
        fetchProducts();
      } catch (err) { alert("Delete failed"); }
    }
  };

  // 3. UPDATE PRODUCT (Rename/Edit)
  const handleEdit = async (item) => {
    const newName = prompt("Enter new product name:", item.name);
    if (!newName) return;
    
    try {
      await axios.put(`http://localhost:3000/products/${item.id}`, 
        { name: newName, quantity: item.quantity }, 
        { headers: { "authorization": token } }
      );
      fetchProducts();
    } catch (err) { alert("Update failed"); }
  };

  // 4. STOCK OUT (Substract with Logging)
  const handleStockOut = async (item) => {
    const amount = prompt(`How many ${item.name} are you taking out? (Current: ${item.quantity})`);
    
    // Validate input
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      return alert("Please enter a valid number");
    }

    if (parseInt(amount) > item.quantity) {
      return alert("Error: Not enough stock available!");
    }

    try {
      await axios.post("http://localhost:3000/products/stock-out", 
        { productId: item.id, amountToRemove: parseInt(amount) },
        { headers: { "authorization": token } }
      );
      fetchProducts(); // Refresh list to see new quantity
    } catch (err) {
      alert(err.response?.data?.error || "Stock out failed");
    }
  };

  // 5. STOCK IN (Simple addition)
  const handleStockIn = async (item) => {
    const amount = prompt(`How many ${item.name} are you adding?`);
    if (!amount || isNaN(amount)) return;

    const newQty = parseInt(item.quantity) + parseInt(amount);
    
    try {
      await axios.put(`http://localhost:3000/products/${item.id}`, 
        { name: item.name, quantity: newQty }, 
        { headers: { "authorization": token } }
      );
      fetchProducts();
    } catch (err) { alert("Stock in failed"); }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Inventory Control</h2>
          <p className="text-gray-500 font-medium">Manage your stock movements and levels</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? 'bg-gray-400' : 'bg-green-600'} text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95`}
        >
          {showForm ? "✕ Close" : "+ New Product"}
        </button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-3xl shadow-xl mb-8 flex gap-6 items-end border border-gray-100 animate-in fade-in duration-300">
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Product Name</label>
            <input 
              className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-green-500 transition" 
              placeholder="Enter name..."
              value={productName}
              onChange={e => setProductName(e.target.value)} 
              required 
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">Initial Qty</label>
            <input 
              type="number" 
              className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-green-500 transition" 
              placeholder="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)} 
              required 
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-black shadow-md transition">SAVE TO DATABASE</button>
        </form>
      )}

      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder=" Search products by name..."
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 shadow-lg transition-all duration-300 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {searchTerm ? `(${filteredProducts.length})` : ''}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-200 sticky top-0">
            <tr>
              <th className="p-6 text-gray-500 font-black uppercase text-xs tracking-widest">Product Info</th>
              <th className="p-6 text-gray-500 font-black uppercase text-xs tracking-widest text-center">Stock Status</th>
              <th className="p-6 text-gray-500 font-black uppercase text-xs tracking-widest text-center">Quick Actions</th>
              <th className="p-6 text-gray-500 font-black uppercase text-xs tracking-widest text-right">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
{filteredProducts.map(item => {
              // Color logic for badges
              let statusColor = 'bg-green-100 text-green-800';
              let statusIcon = '';
              let statusText = '';
              if (item.quantity === 0) {
                statusColor = 'bg-red-100 text-red-800';
                statusIcon = '⚠️';
                statusText = 'Out of Stock';
              } else if (item.quantity <= 3) {
                statusColor = 'bg-orange-100 text-orange-800';
                statusIcon = '🟡';
                statusText = 'Low Stock';
              }

              return (
                <tr key={item.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 border-b-2 border-gray-50">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{item.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-xl">{item.name}</p>
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">SKU-{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className={`text-4xl font-black mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${item.quantity <= 3 ? 'bg-red-50 text-red-600' : item.quantity <= 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                      {item.quantity}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-2 ${statusColor}`}>
                      {statusIcon} {statusText}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <button 
                        onClick={() => handleStockIn(item)} 
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                      >
                        + Stock In
                      </button>
                      <button 
                        onClick={() => handleStockOut(item)} 
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                      >
                        − Stock Out
                      </button>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-4">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* SUMMARY ROW */}
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <td className="p-6 font-black text-xl">TOTAL</td>
              <td className="p-6 text-center font-black text-2xl">{filteredProducts.reduce((sum, p) => sum + p.quantity, 0)}</td>
              <td colSpan={2} className="p-6 text-right">
                <span className="text-indigo-100 font-bold">{filteredProducts.length} Products • {searchTerm ? `${filteredProducts.length} matching "${searchTerm}"` : 'All items'}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManager;