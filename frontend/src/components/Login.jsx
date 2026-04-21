import React, { useState } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 

function Login() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError('');
    try {
      const res = await axios.post("http://localhost:3000/login", { 
        email: email, 
        password: password 
      });

      if (res.status === 200) { 
        localStorage.setItem("token", res.data.token); 
        localStorage.setItem("username", res.data.user.name); 
        navigate("/dashboard"); 
      }
    } catch (err) {
      if (err.response?.status === 404) setError("User does not exist!"); 
      else if (err.response?.status === 401) setError("Wrong password!"); 
      else setError("Server error, try again later.");
    }
  };

  return (
    /* STEP 1: The Centering Wrapper */
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      
      {/* STEP 2: The Login Card */}
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-200"> 
        
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">Login</h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm text-center font-medium border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
              placeholder="name@company.com" 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
              type="password" 
              placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            Sign In
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/signup")} 
            className="text-blue-600 hover:underline text-sm font-semibold"
          >
            Don't have an account? Create one
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default Login;