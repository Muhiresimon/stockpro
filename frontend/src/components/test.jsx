import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Test(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("")
    const navigate = useNavigate()

    const handleSignup =async (e)=>{
        e.preventDefault()
        setError("")
        try{
            const res = await axios.post("http://localhost:3000/signup",{
                name:name,
                email:email,
                password:password
            })
            if(res.status === 201){
                alert("User created sucessfull")
                navigate("/login")
            }
        } catch(err){
            if(err.response.status === 409){
                setError("Email already used ")
            }else{
                setError("Internal server error")
            }
        }
        
    } 
    return(
        <div className="bg-white border rounded-xl shadow-lg p-4 w-96">
            <h2 className="text-green-700 text-center p-6 font-bold ">Sign Up</h2>
            {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4  text-center font-medium  border-red-200 ">{error}</div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
                <input type="text"
                className="w-full border rounded shadow p-2"
                placeholder="Full Name"
                onChange={e=>setName(e.target.value)}
                value={name}
                required
                 />
                 <input type="text"
                 className="w-full border rounded shadow p-2"
                 placeholder="Email"
                 onChange={e=>setEmail(e.target.value)}
                 value={email}
                 required
                  />

                  <input type="text"
                  className="w-full border rounded shadow p-2"
                  placeholder="Password"
                  onChange={e=>setPassword(e.target.value)}
                  required
                   />
                   <button className="w-full bg-green-400 hover:bg-green-700 p-2 text-white rounded border">Sign Up</button>
                   <button onClick={()=>navigate("/login")} className="text-green font-medium">Arleady have ann account? Login</button>
            </form>

        </div>
    )
}