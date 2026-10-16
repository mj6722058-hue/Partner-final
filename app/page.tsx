'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://vwvhtrpapsbysmpemdle.supabase.co','sb_publishable_haGuloU4LJ7WsBorphXldw_f4yxRex_')

export default function Page(){
const [isLogin,setIsLogin]=useState(false)
const [phone,setPhone]=useState('')
const [otpInput,setOtpInput]=useState('')
const [generatedOtp,setGeneratedOtp]=useState('')
const [step,setStep]=useState(1)
const [tab,setTab]=useState('dashboard')
const [users,setUsers]=useState<any[]>([])
const [otps,setOtps]=useState<any[]>([])
const [rides,setRides]=useState<any[]>([])
const [q,setQ]=useState('')
const [selected,setSelected]=useState<any>(null)
const [showModal,setShowModal]=useState(false)
const [modalType,setModalType]=useState<'driver'|'passenger'>('driver')
const [adminUser,setAdminUser]=useState('')
const [adminPass,setAdminPass]=useState('')
const [newUser,setNewUser]=useState('')
const [newPass,setNewPass]=useState('')

useEffect(()=>{const s=localStorage.getItem('patner_admin'); if(s) setIsLogin(true)},[])
const load=async()=>{
 const {data:u}=await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(300)
 const {data:o}=await supabase.from('otp_logs').select('*').order('created_at',{ascending:false}).limit(100)
 const {data:r}=await supabase.from('rides').select('*').order('created_at',{ascending:false}).limit(200)
 if(u) setUsers(u); if(o) setOtps(o); if(r) setRides(r)
}
useEffect(()=>{if(isLogin){load(); const i=setInterval(load,6000); return()=>clearInterval(i)}},[isLogin])

const handleSendOtp=async()=>{
 if(!phone){alert('Phone likho'); return}
 const otp=Math.floor(100000+Math.random()*900000).toString()
 setGeneratedOtp(otp)
 localStorage.setItem('patner_last_otp',otp)
 try{await supabase.from('otp_logs').insert({phone,otp,device_id:'ADMIN-WEB-LOGIN'})}catch(e){}
 setStep(2)
}
const handleVerify=()=>{
 const saved=localStorage.getItem('patner_last_otp')||generatedOtp
 if(otpInput===saved || otpInput===generatedOtp || otpInput==='123456'){
   localStorage.setItem('patner_admin','true'); setIsLogin(true)
 } else alert('Ghalat OTP')
}
const handleUserLogin=()=>{
 const savedU=localStorage.getItem('patner_admin_user')||'patner'
 const savedP=localStorage.getItem('patner_admin_pass')||'admin123'
 if((adminUser===savedU && adminPass===savedP) || (adminUser==='patner'&&adminPass==='admin123')){
   localStorage.setItem('patner_admin','true'); setIsLogin(true)
 } else alert('Ghalat')
}
const totalDrivers=users.filter((x:any)=>x.is_driver).length
const totalPassengers=users.filter((x:any)=>!x.is_driver).length
const online=users.filter((x:any)=>x.status==='online').length
const offline=users.filter((x:any)=>x.status!=='online'&&!x.is_blocked).length
const blocked=users.filter((x:any)=>x.is_blocked).length
const pending=users.filter((x:any)=>x.is_driver &&!x.is_verified).length
const toggle=async(u:any)=>{await supabase.from('users').update({is_blocked:!u.is_blocked,status:!u.is_blocked?'blocked':'offline'}).eq('id',u.id); load()}
const verifyDriver=async(u:any)=>{await supabase.from('users').update({is_verified:true,status:'online'}).eq('id',u.id); load(); setShowModal(false)}
const openDetails=(u:any,type:'driver'|'passenger')=>{setSelected(u); setModalType(type); setShowModal(true)}
const filtered=users.filter((u:any)=>(u.name||'').toLowerCase().includes(q.toLowerCase())||(u.phone||'').includes(q))
const getActiveRide=(user:any)=> rides.find((r:any)=>(r.passenger_phone===user.phone || r.driver_phone===user.phone) && r.status!=='completed' && r.status!=='cancelled') || null
const getUserRides=(user:any)=> rides.filter((r:any)=>r.passenger_phone===user.phone || r.driver_phone===user.phone)

if(!isLogin){
return(
<div className="min-h-screen bg-[#f2f3f8] flex items-center justify-center p-4">
<div className="flex items-center gap-4 flex-wrap justify-center">
 <div className="bg-white w-[360px] rounded-[24px] border shadow-sm p-8">
  <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div><span className="font-bold text-sm">Patner Admin</span></div>
  <h1 className="text-[22px] font-bold mt-6">Admin Login</h1>
  <p className="text-[11px] text-gray-400 mt-1 text-center">OTP Logs ya WhatsApp pe OTP dekho</p>
  {step===1?(
  <>
   <label className="text-[11px] font-bold mt-6 block">Phone Number</label>
   <div className="flex items-center border rounded-full px-4 py-3 mt-2 bg-white"><span className="text-xs mr-2 font-medium">PK +92</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="300 1234567" className="flex-1 outline-none text-sm"/></div>
   <button onClick={handleSendOtp} className="w-full bg-[#0f1220] text-white py-3.5 rounded-full mt-6 text-sm font-medium">Send OTP</button>
   <p className="text-[10px] text-gray-400 mt-3 text-center">Test: 123456</p>
  </>
  ):(
  <>
   <label className="text-[11px] font-bold mt-6 block">Enter OTP - {phone}</label>
   {generatedOtp && (<div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3 text-center"><p className="text-[10px] text-green-600">OTP Website ke andar:</p><p className="text-2xl font-bold text-green-700 tracking-widest">{generatedOtp}</p></div>)}
   <input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="6 digit" className="w-full border rounded-full px-4 py-3 mt-3 text-center tracking-[0.3em] outline-none"/>
   <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-3.5 rounded-full mt-4 text-sm font-medium">Verify & Login</button>
   <button onClick={()=>setStep(1)} className="w-full text-xs text-blue-600 mt-3">Change Number</button>
  </>
  )}
 </div>
 <div className="text-3xl font-light hidden md:block">+</div>
 <div className="bg-white w-[340px] rounded-[24px] border-2 border-black p-8">
  <div className="space-y-4">
   <div className="border-2 border-black rounded-full px-6 py-3 text-center"><p className="font-bold text-sm">Admin login</p></div>
   <div className="border-2 border-black rounded-full px-6 py-4"><input value={adminUser} onChange={e=>setAdminUser(e.target.value)} placeholder="User name" className="w-full outline-none text-sm font-medium bg-transparent"/></div>
   <div className="border-2 border-black rounded-full px-6 py-4"><input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password" className="w-full outline-none text-sm font-medium bg-transparent"/></div>
   <div className="flex justify-center pt-2"><button onClick={handleUserLogin} className="border-2 border-black rounded-full px-8 py-2.5 font-bold text-sm">Login</button></div>
  </div>
  <p className="text-[10px] text-gray-400 mt-6 text-center">Default: patner / admin123</p>
 </div>
</div>
</div>
)
}

return(
<div className="min-h-screen bg-[#f5f6fb] flex">
<div className="w-[240px] bg-[#0f1220] text-white p-4 hidden md:flex flex-col fixed h-full z-20">
 <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">📍</div><b className="text-xl">Patner</b></div>
 {[
  ['dashboard','📊 Dashboard'],['drivers','🚗 Drivers'],['passengers','👤 Passengers'],['live','🗺️ Live Map'],['otp','🔑 OTP Logs'],['docs','📄 Documents'],['settings','⚙️ Settings']
 ].map(([k,l])=>(
  <button key={k} onClick={()=>setTab(k)} className={`text-left px-4 py-3 rounded-xl mb-1 text-sm ${tab===k?'bg-[#2d5bff]':'text-gray-400 hover:text-white'}`}>{l}</button>
 ))}
 <div className="mt-auto pt-6 border-t border-white/10 text-xs"><p>Admin</p><button onClick={()=>{localStorage.removeItem('patner_admin'); setIsLogin(false)}} className="text-red-400 mt-2">Logout</button></div>
</div>
<div className="flex-1 md:ml-[240px]">
<div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10"><h1 className="font-bold text-xl">Dashboard Overview</h1></div>
<div className="p-4 md:p-6">
{tab==='dashboard'&&(
<>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Total Drivers</p><p className="text-3xl font-bold mt-2">{totalDrivers}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Passengers</p><p className="text-3xl font-bold mt-2">{totalPassengers || totalDrivers}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Online</p><p className="text-3xl font-bold mt-2 text-green-600">{online}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Blocked</p><p className="text-3xl font-bold mt-2 text-red-600">{blocked}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Pending</p><p className="text-3xl font-bold mt-2 text-yellow-600">{pending}</p></div>
</div>
<div className="grid md:grid-cols-2 gap-4">
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Live Map</h3><div className="bg-[#eef2ff] h-[320px] rounded-xl overflow-hidden"><iframe className="w-full h-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=71.3%2C33.9%2C71.7%2C34.1&layer=mapnik&marker=34.0151%2C71.5249"></iframe></div></div>
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Recent Drivers - Click for route</h3><div className="space-y-3">{filtered.filter((u:any)=>u.is_driver).slice(0,6).map((u:any)=><div key={u.id} onClick={()=>openDetails(u,'driver')} className="flex justify-between items-center border-b pb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.phone} • {getUserRides(u).length} rides</p></div><span className="text-[10px] px-2 py-1 rounded-full bg-gray-100">{u.status}</span></div>)}</div></div>
</div>
</>
)}
{tab==='drivers'&&(<div className="bg-white rounded-2xl border p-4"><div className="flex justify-between mb-4"><h2 className="font-bold">All Drivers - Click for route map</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border rounded-full px-4 py-1.5 text-sm"/></div><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Driver</th><th>Rides</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.filter((u:any)=>u.is_driver).map((u:any)=><tr key={u.id} className="border-t hover:bg-gray-50"><td className="p-3 cursor-pointer" onClick={()=>openDetails(u,'driver')}><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.phone}</p></td><td className="p-3 text-center text-xs">{getUserRides(u).length} ⭐ {u.rating||'4.8'}</td><td className="p-3 text-center"><span className="px-2 py-1 rounded-full text-xs bg-green-100">{u.status}</span></td><td className="p-3 text-center"><button onClick={()=>toggle(u)} className="px-3 py-1 rounded-lg text-xs border">Block</button></td></tr>)}</tbody></table></div>)}
{tab==='passengers'&&(
<div className="bg-white rounded-2xl border p-4">
<h2 className="font-bold mb-4">All Passengers - Click for selfie, ID, location, route - Total: {filtered.filter((u:any)=>!u.is_driver).length || filtered.length}</h2>
<table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Passenger</th><th>Location</th><th>Rides</th><th>Current Ride</th><th>Action</th></tr></thead><tbody>
{(filtered.filter((u:any)=>!u.is_driver).length>0? filtered.filter((u:any)=>!u.is_driver) : filtered).map((u:any)=><tr key={u.id} className="border-t hover:bg-gray-50"><td className="p-3 cursor-pointer" onClick={()=>openDetails(u,'passenger')}><div className="flex gap-2 items-center"><div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">{u.selfie? <img src={u.selfie} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}</div><div><p className="font-medium">{u.name||'Passenger'}</p><p className="text-xs text-gray-500">{u.phone}</p></div></div></td><td className="p-3 text-xs text-center">{u.current_lat?Number(u.current_lat).toFixed(4):'No loc'}</td><td className="p-3 text-center text-xs">{getUserRides(u).length} rides</td><td className="p-3 text-xs text-center">{getActiveRide(u)? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px]">{getActiveRide(u).from_location} → {getActiveRide(u).to_location}</span> : <span className="text-gray-400">No ride</span>}</td><td className="p-3 text-center"><button onClick={()=>openDetails(u,'passenger')} className="text-blue-600 text-xs underline">View</button></td></tr>)}
</tbody></table>
</div>
)}
{tab==='live'&&(<div className="bg-white rounded-2xl border p-4 h-[75vh]"><h2 className="font-bold mb-3">Live Map - Route: Driver→A blue, A→B red</h2><iframe className="w-full h-full rounded-xl border" src="https://www.openstreetmap.org/export/embed.html?bbox=71.2%2C33.8%2C71.8%2C34.2&layer=mapnik"></iframe></div>)}
{tab==='otp'&&(<div className="bg-white rounded-2xl border p-4"><h2 className="font-bold mb-4">OTP Logs</h2><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Phone</th><th>OTP</th><th>Time</th></tr></thead><tbody>{otps.map((o:any)=><tr key={o.id} className="border-t"><td className="p-2 font-mono">{o.phone}</td><td className="p-2 font-bold">{o.otp}</td><td className="p-2 text-xs">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>)}
{tab==='settings'&&(
<div className="bg-white rounded-2xl border p-6 max-w-4xl">
<h2 className="font-bold text-xl">⚙️ Settings</h2>
<div className="grid md:grid-cols-2 gap-6 mt-6">
<div className="border-2 border-black rounded-2xl p-5">
<h3 className="font-bold mb-4">Change Username / Password</h3>
<p className="text-xs text-gray-500 mb-3">Current: {typeof window!=='undefined'?(localStorage.getItem('patner_admin_user')||'patner'):'patner'}</p>
<label className="text-xs font-bold">New Username</label>
<input value={newUser} onChange={e=>setNewUser(e.target.value)} placeholder="New username" className="w-full border-2 border-black rounded-full px-4 py-2.5 mt-1 text-sm"/>
<label className="text-xs font-bold mt-3 block">New Password</label>
<input value={newPass} onChange={e=>setNewPass(e.target.value)} type="password" placeholder="New password" className="w-full border-2 border-black rounded-full px-4 py-2.5 mt-1 text-sm"/>
<button onClick={()=>{ if(!newUser||!newPass){alert('Dono likho'); return} localStorage.setItem('patner_admin_user',newUser); localStorage.setItem('patner_admin_pass',newPass); alert('Save ho gaya!'); setNewUser(''); setNewPass('')}} className="w-full bg-black text-white py-3 rounded-full mt-4 text-sm font-bold">Save Credentials</button>
</div>
<div className="border rounded-2xl p-5 bg-gray-50"><h3 className="font-bold">App Settings</h3><p className="text-sm mt-2">Driver ID = Passenger ID: Enabled ✅</p><p className="text-sm">City: Peshawar</p><p className="text-sm">Version: Final 2.0</p></div>
</div>
</div>
)}
</div>

{showModal && selected && (
<div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-auto">
<div className="bg-white w-full max-w-6xl rounded-[20px] p-6 max-h-[92vh] overflow-auto">
<div className="flex justify-between"><div><h2 className="text-xl font-bold">{selected.name} - {modalType}</h2><p className="text-sm text-gray-500">{selected.phone} • {getUserRides(selected).length} rides • ⭐ {selected.rating||'4.8'}</p></div><button onClick={()=>setShowModal(false)} className="bg-gray-100 w-9 h-9 rounded-full">✕</button></div>
<div className="grid lg:grid-cols-2 gap-6 mt-6">
<div className="space-y-4">
<h3 className="font-bold text-sm">📄 Documents</h3>
<div className="grid grid-cols-2 gap-3">
<div className="border rounded-xl p-3"><p className="text-xs font-bold">ID Card Front/Back</p><div className="mt-2 h-20 bg-gray-100 rounded-lg flex items-center justify-center">{selected.cnic_front? <img src={selected.cnic_front} className="w-full h-full object-cover"/> : <span className="text-[10px]">Not uploaded</span>}</div></div>
<div className="border rounded-xl p-3"><p className="text-xs font-bold">License</p><div className="mt-2 h-20 bg-gray-100 rounded-lg flex items-center justify-center">{selected.license_front? <img src={selected.license_front} className="w-full h-full object-cover"/> : <span className="text-[10px]">Not uploaded</span>}</div></div>
<div className="border rounded-xl p-3"><p className="text-xs font-bold">Selfie</p><div className="mt-2 h-20 bg-gray-100 rounded-lg flex items-center justify-center">{selected.selfie? <img src={selected.selfie} className="w-full h-full object-cover"/> : <span className="text-[10px]">No selfie</span>}</div><p className="text-[10px] mt-1">Passenger ki pic</p></div>
<div className="border rounded-xl p-3"><p className="text-xs font-bold">Car Front/Back</p><div className="grid grid-cols-2 gap-2 mt-2"><div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">{selected.car_front? <img src={selected.car_front} className="w-full h-full object-cover"/> : <span className="text-[9px]">No Front</span>}</div><div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">{selected.car_back? <img src={selected.car_back} className="w-full h-full object-cover"/> : <span className="text-[9px]">No Back</span>}</div></div></div>
</div>
<div className="border rounded-xl p-4 bg-gray-50"><h4 className="font-bold text-sm">Full Info</h4><p className="text-sm mt-2"><b>Total Rides:</b> {getUserRides(selected).length} | <b>Rating:</b> ⭐ {selected.rating||'4.8'}</p><p className="text-sm"><b>Verified:</b> {selected.is_verified?'✅':'⏳'} | <b>Blocked:</b> {selected.is_blocked?'Yes':'No'}</p></div>
</div>
<div className="space-y-4">
<h3 className="font-bold text-sm">📍 Live Ride - Route Map (Driver→A blue, A→B red)</h3>
{(() => {
 const activeRide = getActiveRide(selected)
 const driverLat = selected.current_lat || 34.0151
 const driverLng = selected.current_lng || 71.5249
 return (
 <>
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
 {activeRide? (
  <>
   <p className="font-bold text-blue-800">🚗 Active: {activeRide.from_location||'A'} → {activeRide.to_location||'B'}</p>
   <p className="text-xs mt-1">Driver at {driverLat.toFixed(4)} → A Point tak aa raha hai</p>
   <div className="mt-2 flex gap-2 text-[10px]"><span className="bg-blue-600 text-white px-2 py-1 rounded-full">Driver → A blue</span><span className="bg-red-600 text-white px-2 py-1 rounded-full">A → B red</span></div>
  </>
 ) : (
  <p className="font-bold">No active ride - APK se ride book hogi to route lines ayengi</p>
 )}
 </div>
 <div className="rounded-xl overflow-hidden border h-[340px] relative bg-[#eef2ff]">
  <iframe className="w-full h-full border-0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${driverLng-0.05}%2C${driverLat-0.05}%2C${driverLng+0.05}%2C${driverLat+0.05}&layer=mapnik&marker=${driverLat}%2C${driverLng}`}></iframe>
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
   {activeRide && (<><line x1="50" y1="50" x2="35" y2="40" stroke="#2563eb" strokeWidth="0.8" strokeDasharray="2 2"/><circle cx="50" cy="50" r="2" fill="#2563eb"/><circle cx="35" cy="40" r="2" fill="#2563eb"/><line x1="35" y1="40" x2="70" y2="30" stroke="#dc2626" strokeWidth="0.8"/><circle cx="70" cy="30" r="2" fill="#dc2626"/></>)}
  </svg>
 </div>
 <div className="border rounded-xl p-3"><h4 className="font-bold text-xs">Ride History</h4><div className="mt-2 space-y-2 max-h-[140px] overflow-auto">{getUserRides(selected).map((r:any)=><div key={r.id} className="text-xs border p-2 rounded-lg flex justify-between"><div><p>{r.from_location||'A'} → {r.to_location||'B'}</p><p className="text-gray-500 text-[10px]">{r.status} • Rs.{r.fare||'--'}</p></div><div>⭐ {r.rating||'5.0'}</div></div>)}{getUserRides(selected).length===0 && <p className="text-xs text-gray-400">No rides yet</p>}</div></div>
 <div className="flex gap-2">
  {modalType==='driver' &&!selected.is_verified && <button onClick={()=>verifyDriver(selected)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm">✅ Approve</button>}
  <button onClick={()=>toggle(selected)} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${selected.is_blocked?'bg-blue-600 text-white':'bg-red-600 text-white'}`}>{selected.is_blocked?'Unblock':'Block'}</button>
 </div>
 </>
 )
})()}
</div>
</div>
</div>
</div>
)}

</div>
</div>
)
}
