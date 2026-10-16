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
useEffect(()=>{const s=localStorage.getItem('patner_admin'); if(s)setIsLogin(true)},[])
const load=async()=>{
 const {data:u}=await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(200)
 const {data:o}=await supabase.from('otp_logs').select('*').order('created_at',{ascending:false}).limit(100)
 const {data:r}=await supabase.from('rides').select('*').order('created_at',{ascending:false}).limit(100)
 if(u)setUsers(u); if(o)setOtps(o); if(r)setRides(r)
}
useEffect(()=>{if(isLogin){load(); const i=setInterval(load,8000); return()=>clearInterval(i)}},[isLogin])

const handleSendOtp=async()=>{
 if(!phone){alert('Phone likho'); return}
 const otp=Math.floor(100000+Math.random()*900000).toString()
 setGeneratedOtp(otp)
 // Local me save karo - backup
 localStorage.setItem('patner_last_otp', otp)
 localStorage.setItem('patner_last_phone', phone)
 try{
   await supabase.from('otp_logs').insert({phone,otp,device_id:'ADMIN-WEB-LOGIN'})
 }catch(e){
   console.log('Supabase error but OTP saved locally', e)
 }
 setStep(2)
}
 

const handleVerify=()=>{
 const savedOtp = localStorage.getItem('patner_last_otp') || generatedOtp
 if(otpInput===savedOtp || otpInput===generatedOtp){
   localStorage.setItem('patner_admin','true'); setIsLogin(true)
 } else {alert('Ghalat OTP - OTP Logs me check karo')}
}

 
const totalDrivers=users.filter((x:any)=>x.is_driver).length
const online=users.filter((x:any)=>x.status==='online').length
const offline=users.filter((x:any)=>x.status!=='online'&&!x.is_blocked).length
const blocked=users.filter((x:any)=>x.is_blocked).length
const pending=users.filter((x:any)=>x.is_driver &&!x.is_verified).length
const toggle=async(u:any)=>{await supabase.from('users').update({is_blocked:!u.is_blocked,status:!u.is_blocked?'blocked':'offline'}).eq('id',u.id); load()}
const verifyDriver=async(u:any)=>{await supabase.from('users').update({is_verified:true,status:'online'}).eq('id',u.id); load(); setShowModal(false)}
const openDetails=(u:any)=>{setSelected(u); setShowModal(true)}
const filtered=users.filter((u:any)=>(u.name||'').toLowerCase().includes(q.toLowerCase())||(u.phone||'').includes(q))
if(!isLogin){
return(
<div className="min-h-screen bg-[#f5f6fb] flex items-center justify-center p-4">
 <div className="bg-white w-[400px] rounded-[24px] border shadow-sm p-8">
  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div><span className="font-bold">Patner Admin</span></div>
  <h1 className="text-2xl font-bold mt-6">Admin Login</h1>

<p className="text-[11px] text-gray-400 mt-3 text-center">OTP Logs ya WhatsApp pe OTP dekho</p>
  
  {step===1?(
   <>
    <label className="text-xs font-medium mt-6 block">Phone Number</label>
    <div className="flex items-center border rounded-xl px-3 py-3 mt-2"><span className="text-sm mr-2">🇵🇰 +92</span><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="300 1234567" className="flex-1 outline-none text-sm"/></div>
    <button onClick={handleSendOtp} className="w-full bg-[#0f1220] text-white py-3 rounded-xl mt-6 text-sm">Send OTP</button>
    <p className="text-[11px] text-gray-400 mt-3 text-center">Test: 123456</p>
   </>
  ):(
   <>
    <label className="text-xs font-medium mt-6 block">Enter OTP - {phone}</label>
    <input value={otpInput} onChange={e=>setOtpInput(e.target.value)} placeholder="6 digit" className="w-full border rounded-xl px-3 py-3 mt-2 tracking-[0.5em] text-center text-lg outline-none"/>
    <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 text-sm">Verify & Login</button>
    <button onClick={()=>setStep(1)} className="w-full text-xs text-blue-600 mt-3">Change Number</button>
   </>
  )}
 </div>
</div>
)
}
return(
<div className="min-h-screen bg-[#f5f6fb] flex">
<div className="w-[240px] bg-[#0f1220] text-white p-4 hidden md:flex flex-col fixed h-full">
 <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">📍</div><b className="text-xl">Patner</b></div>
 {[
  ['dashboard','📊 Dashboard'],['drivers','🚗 Drivers'],['passengers','👤 Passengers'],['live','🗺️ Live Map'],['otp','🔑 OTP Logs'],['docs','📄 Documents'],['settings','⚙️ Settings']
 ].map(([k,l])=>(
  <button key={k} onClick={()=>setTab(k)} className={`text-left px-4 py-3 rounded-xl mb-1 text-sm ${tab===k?'bg-[#2d5bff]':'text-gray-400 hover:text-white'}`}>{l}</button>
 ))}
 <div className="mt-auto pt-6 border-t border-white/10 text-xs"><p>Alex Morgan - Admin</p><button onClick={()=>{localStorage.removeItem('patner_admin'); setIsLogin(false)}} className="text-red-400 mt-2">Logout</button></div>
</div>
<div className="flex-1 md:ml-[240px]">
<div className="bg-white border-b px-6 py-4 flex justify-between items-center"><h1 className="font-bold text-xl">Dashboard Overview</h1><div className="flex gap-3 items-center text-sm"><span>Oct 16, 2024</span><button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg">Export Report</button></div></div>
<div className="p-6">
{tab==='dashboard'&&(
<>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Total Drivers</p><p className="text-3xl font-bold mt-2">{totalDrivers}</p><p className="text-[11px] text-gray-400 mt-1">{pending} pending</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Online</p><p className="text-3xl font-bold mt-2 text-green-600">{online}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Offline</p><p className="text-3xl font-bold mt-2 text-orange-500">{offline}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Blocked</p><p className="text-3xl font-bold mt-2 text-red-600">{blocked}</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Pending Verify</p><p className="text-3xl font-bold mt-2 text-yellow-600">{pending}</p></div>
</div>
<div className="grid md:grid-cols-2 gap-4">
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Live Map</h3><div className="bg-[#eef2ff] h-[320px] rounded-xl overflow-hidden"><iframe className="w-full h-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=71.3%2C33.9%2C71.7%2C34.1&layer=mapnik&marker=34.0151%2C71.5249"></iframe></div></div>
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Recent Drivers - Click for docs</h3><div className="space-y-3">{filtered.filter((u:any)=>u.is_driver).slice(0,5).map((u:any)=><div key={u.id} onClick={()=>openDetails(u)} className="flex justify-between items-center border-b pb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.phone} • {u.is_verified?'✅ Verified':'⏳ Pending'}</p></div><span className="text-[10px] px-2 py-1 rounded-full bg-gray-100">{u.status||'offline'}</span></div>)}</div></div>
</div>
</>
)}
{tab==='drivers'&&(<div className="bg-white rounded-2xl border p-4"><div className="flex justify-between mb-4"><h2 className="font-bold">All Drivers - Click for full details</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border rounded-full px-4 py-1.5 text-sm"/></div><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Driver</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.filter((u:any)=>u.is_driver).map((u:any)=><tr key={u.id} className="border-t hover:bg-gray-50 cursor-pointer"><td className="p-3" onClick={()=>openDetails(u)}><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.phone} {u.is_verified?'✅':'⏳'}</p></td><td className="p-3 text-xs text-center">{u.current_lat?Number(u.current_lat).toFixed(4):'No loc'}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${u.is_blocked?'bg-red-100 text-red-600':u.is_verified?'bg-green-100 text-green-600':'bg-yellow-100 text-yellow-700'}`}>{u.is_blocked?'Blocked':!u.is_verified?'Pending':u.status}</span></td><td className="p-3 text-center"><button onClick={()=>toggle(u)} className={`px-3 py-1 rounded-lg text-xs ${u.is_blocked?'bg-blue-600 text-white':'border border-red-300 text-red-600'}`}>{u.is_blocked?'Unblock':'Block'}</button></td></tr>)}</tbody></table></div>)}
{tab==='passengers'&&(<div className="bg-white rounded-2xl border p-4"><h2 className="font-bold mb-4">All Passengers - Click for selfie, rides, location</h2>{filtered.filter((u:any)=>!u.is_driver).length===0?<div className="p-10 text-center text-gray-400 text-sm">No passengers yet</div>:<table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Passenger</th><th>Rides</th><th>Location</th><th>Action</th></tr></thead><tbody>{filtered.filter((u:any)=>!u.is_driver).map((u:any)=><tr key={u.id} className="border-t"><td className="p-3" onClick={()=>openDetails(u)}><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.phone}</p></td><td className="p-3 text-center">{rides.filter((r:any)=>r.passenger_phone===u.phone).length}</td><td className="p-3 text-xs text-center">{u.current_lat?Number(u.current_lat).toFixed(4):'No loc'}</td><td className="p-3 text-center"><button onClick={()=>openDetails(u)} className="text-blue-600 text-xs underline">View</button></td></tr>)}</tbody></table>}</div>)}
{tab==='live'&&(<div className="bg-white rounded-2xl border p-4 h-[75vh]"><h2 className="font-bold mb-3">Live Map</h2><iframe className="w-full h-full rounded-xl border" src="https://www.openstreetmap.org/export/embed.html?bbox=71.2%2C33.8%2C71.8%2C34.2&layer=mapnik"></iframe></div>)}
{tab==='otp'&&(<div className="bg-white rounded-2xl border p-4"><h2 className="font-bold mb-4">OTP Logs</h2><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Phone</th><th>OTP</th><th>Device</th><th>Time</th></tr></thead><tbody>{otps.map((o:any)=><tr key={o.id} className="border-t"><td className="p-2 font-mono">{o.phone}</td><td className="p-2 font-bold">{o.otp}</td><td className="p-2 text-xs">{o.device_id}</td><td className="p-2 text-xs">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>)}
{tab==='docs'&&(<div className="bg-white rounded-2xl border p-6"><h2 className="font-bold mb-2">Documents - Pending: {pending}</h2><div className="grid md:grid-cols-2 gap-3 mt-4">{users.filter((u:any)=>u.is_driver &&!u.is_verified).map((u:any)=><div key={u.id} className="border p-3 rounded-xl text-sm cursor-pointer hover:bg-gray-50" onClick={()=>openDetails(u)}><p className="font-bold">{u.name} - {u.phone}</p><p className="text-xs text-yellow-600">⏳ Click to view ID, License, Car pics</p></div>)}</div></div>)}
</div>
{showModal && selected && (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
<div className="bg-white w-full max-w-4xl rounded-[20px] p-6 max-h-[90vh] overflow-auto">
<div className="flex justify-between"><div><h2 className="text-xl font-bold">{selected.name}</h2><p className="text-sm text-gray-500">{selected.phone} • {selected.is_driver?'Driver':'Passenger'}</p></div><button onClick={()=>setShowModal(false)} className="bg-gray-100 w-8 h-8 rounded-full">✕</button></div>
<div className="grid md:grid-cols-2 gap-6 mt-6">
<div>
<h3 className="font-bold text-sm mb-3">📄 Documents</h3>
<div className="space-y-3">
<div className="border rounded-xl p-3"><p className="text-xs font-bold">ID Card (CNIC) Front/Back</p><p className="text-xs text-gray-400 mt-1">APK se upload hoga</p></div>
<div className="border rounded-xl p-3"><p className="text-xs font-bold">Driving License</p><p className="text-xs text-gray-400 mt-1">{selected.license_front?'✅':'Not uploaded'}</p></div>
<div className="border rounded-xl p-3"><p className="text-xs font-bold">Selfie with ID</p><p className="text-xs text-gray-400 mt-1">{selected.selfie?'✅':'Not uploaded'}</p></div>
<div className="grid grid-cols-2 gap-3"><div className="border rounded-xl p-3"><p className="text-xs font-bold">Car Front</p><p className="text-xs text-gray-400">{selected.car_front?'✅':'No'}</p></div><div className="border rounded-xl p-3"><p className="text-xs font-bold">Car Back</p><p className="text-xs text-gray-400">{selected.car_back?'✅':'No'}</p></div></div>
</div>
</div>
<div>
<h3 className="font-bold text-sm mb-3">📍 Location & Ride Details</h3>
<div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
<p><b>Phone:</b> {selected.phone}</p>
<p><b>Verified:</b> {selected.is_verified?'✅ Yes':'⏳ Pending'}</p>
<p><b>Role:</b> {selected.is_driver?'Driver ID = Passenger bhi':'Passenger'}</p>
<p><b>Location:</b> {selected.current_lat?`${selected.current_lat},${selected.current_lng}`:'No'}</p>
</div>
<div className="mt-4 rounded-xl overflow-hidden border h-[200px]"><iframe className="w-full h-full" src={`https://www.openstreetmap.org/export/embed.html?bbox=71.45%2C33.96%2C71.55%2C34.06&layer=mapnik&marker=${selected.current_lat||34.0151}%2C${selected.current_lng||71.5249}`}></iframe></div>
{!selected.is_driver && (<div className="mt-4 border rounded-xl p-4"><h4 className="font-bold text-sm">Passenger Details</h4><p className="text-xs text-gray-500">Selfie, Number, Map location, Total Rides: {rides.filter((r:any)=>r.passenger_phone===selected.phone).length}</p><div className="mt-2 space-y-1">{rides.filter((r:any)=>r.passenger_phone===selected.phone).map((r:any)=><div key={r.id} className="text-xs border p-2 rounded-lg"><p>{r.from_location} → {r.to_location} - Rs.{r.fare}</p></div>)}</div></div>)}
<div className="mt-4 flex gap-2">
{!selected.is_verified && selected.is_driver && <button onClick={()=>verifyDriver(selected)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm">✅ Approve</button>}
<button onClick={()=>toggle(selected)} className={`px-5 py-2.5 rounded-xl text-sm ${selected.is_blocked?'bg-blue-600 text-white':'bg-red-600 text-white'}`}>{selected.is_blocked?'Unblock':'Block'}</button>
</div>
</div>
</div>
</div>
</div>
)}
</div>
</div>
)
}
