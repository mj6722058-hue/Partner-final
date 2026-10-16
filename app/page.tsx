'use client'
import { useState } from 'react'

export default function Home() {
  const [showSignup, setShowSignup] = useState(false)
  return (
    <div className="min-h-screen bg-[#fafafb]">
      <header className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <span className="font-bold text-xl">Patner</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-600">
          <span>For Drivers</span>
          <span>For Passengers</span>
          <span>Admin Control</span>
        </nav>
        <button onClick={()=>setShowSignup(true)} className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm">Get Started</button>
      </header>

      {!showSignup? (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold mb-2">For Drivers</h3>
              <p className="text-sm text-gray-500">Earn more with flexible rides. Manage your trips, track earnings.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold mb-2">For Passengers</h3>
              <p className="text-sm text-gray-500">Book a ride in seconds. Track your driver live.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold mb-2">Admin Control</h3>
              <p className="text-sm text-gray-500">Complete control over users, drivers, OTP logs and live tracking.</p>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Get Started Today</h2>
            <p className="text-gray-500 text-sm mb-6">Join thousands on Patner</p>
            <button onClick={()=>setShowSignup(true)} className="bg-blue-600 text-white px-8 py-3 rounded-full">Create Your Account</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white p-8 rounded-2xl shadow-sm border w-[380px]">
            <h1 className="text-blue-600 font-bold text-2xl text-center">Patner</h1>
            <p className="text-center text-sm text-gray-500 mt-1 mb-6">Sign in or Create Account</p>
            <label className="text-xs font-medium">Full Name</label>
            <input placeholder="Enter your full name" className="w-full border rounded-lg px-3 py-2.5 text-sm mt-1 mb-4" />
            <label className="text-xs font-medium">Phone Number</label>
            <div className="flex items-center border rounded-lg px-3 py-2.5 mt-1 mb-6">
              <span className="text-sm mr-2">🇵🇰 +92</span>
              <input placeholder="300 1234567" className="flex-1 outline-none text-sm" />
            </div>
            <button className="w-full bg-[#1a1d29] text-white py-3 rounded-lg text-sm">Create Profile</button>
            <button onClick={()=>setShowSignup(false)} className="w-full text-center text-xs text-blue-600 mt-4">Back to Home</button>
          </div>
        </div>
      )}
    </div>
  )
}
