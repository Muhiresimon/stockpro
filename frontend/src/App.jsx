// LINE 1: Import Route tools
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 

// LINE 2: Import our pages
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Test from './components/test';

// LINE 3: Main App function
function App() {
  return (
    <BrowserRouter>
      
      {/* FIXED LINE 5: 
          We removed 'flex', 'items-center', and 'justify-center'.
          Now the Dashboard can stretch to full width! 
      */}
      <div className="min-h-screen bg-gray-100 w-full">
        
        <Routes>
          {/* Login and Signup will now handle their own centering internally */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard will now be able to use the full screen width */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path='/test' element={<Test/>}/>
          <Route path="/" element={<Signup />} /> 
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;