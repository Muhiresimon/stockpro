import React, { useState } from 'react'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 

function Signup() {
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSignup = async (e) => {
    e.preventDefault(); 
    setError('');
    try {
      const res = await axios.post("http://localhost:3000/signup", { 
        name, email, password 
      });

      if (res.status === 201) { 
        alert("Account Created! Please Login."); 
        navigate("/login"); 
      }
    } catch (err) {
      if (err.response?.status === 409) setError("Email already exists!"); 
      else setError("Registration failed, try again later.");
    }
  };

  return (
    /* STEP 1: The Centering Wrapper */
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      
      {/* STEP 2: The Signup Card */}
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-200"> 
        
        <h2 className="text-3xl font-bold text-center mb-8 text-green-600">Create Account</h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-center font-medium border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" 
              placeholder="John Doe" 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" 
              placeholder="name@company.com" 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" 
              type="password" 
              placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
            Register Now
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate("/login")} 
            className="text-green-600 hover:underline text-sm font-semibold"
          >
            Already have an account? Login
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default Signup;