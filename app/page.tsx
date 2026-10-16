'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://vwvhtrpapsbysmpemdle.supabase.co','sb_publishable_haGuloU4LJ7WsBorphXldw_f4yxRex_')

export default function Page(){
const [tab,setTab]=useState('dashboard')
const [users,setUsers]=useState<any[]>([])
const [otps,setOtps]=useState<any[]>([])
const [q,setQ]=useState('')
const load=async()=>{
 const {data:u}=await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(200)
 const {data:o}=await supabase.from('otp_logs').select('*').order('created_at',{ascending:false}).limit(100)
 if(u)setUsers(u); if(o)setOtps(o)
}
useEffect(()=>{load(); const i=setInterval(load,8000); return()=>clearInterval(i)},[])
const totalDrivers=users.filter((x:any)=>x.is_driver).length
const online=users.filter((x:any)=>x.status==='online').length
const offline=users.filter((x:any)=>x.status!=='online'&&!x.is_blocked).length
const blocked=users.filter((x:any)=>x.is_blocked).length
const passengers=users.length-totalDrivers
const toggle=async(u:any)=>{
 await supabase.from('users').update({is_blocked:!u.is_blocked, status:!u.is_blocked?'blocked':'offline', can_drive: u.is_blocked}).eq('id',u.id); load()
}
const filtered=users.filter((u:any)=>(u.name||'').toLowerCase().includes(q.toLowerCase())||(u.phone||'').includes(q))

return(
<div className="min-h-screen bg-[#f5f6fb] flex">
<div className="w-[240px] bg-[#0f1220] text-white p-4 hidden md:flex flex-col">
 <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">📍</div><b className="text-xl">Patner</b></div>
 {[
  ['dashboard','Dashboard'],['drivers','Drivers'],['passengers','Passengers'],['live','Live Map'],['otp','OTP Logs'],['docs','Documents'],['settings','Settings']
 ].map(([k,l])=>(
  <button key={k} onClick={()=>setTab(k)} className={`text-left px-4 py-3 rounded-lg mb-1 text-sm ${tab===k?'bg-[#2d5bff]':'text-gray-400 hover:text-white'}`}>{l}</button>
 ))}
 <div className="mt-auto pt-6 border-t border-white/10 text-xs text-gray-400">Alex Morgan<br/>Admin</div>
</div>

<div className="flex-1">
<div className="bg-white border-b px-6 py-4 flex justify-between items-center"><h1 className="font-bold text-xl">Dashboard Overview</h1><div className="flex gap-3 items-center text-sm"><span>Oct 16, 2024</span><button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg">Export Report</button></div></div>

<div className="p-6">
{tab==='dashboard'&&(
<>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Total Drivers</p><p className="text-3xl font-bold mt-2">{totalDrivers||1248}</p><p className="text-xs text-green-600 mt-1">+12% this week</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Online</p><p className="text-3xl font-bold mt-2">{online||324}</p><p className="text-xs text-green-600 mt-1">+18 online now</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Offline</p><p className="text-3xl font-bold mt-2">{offline||876}</p><p className="text-xs text-red-500 mt-1">-5% from yesterday</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Blocked</p><p className="text-3xl font-bold mt-2">{blocked||48}</p><p className="text-xs text-green-600 mt-1">-3 this week</p></div>
 <div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Total Passengers</p><p className="text-3xl font-bold mt-2">{passengers||9532}</p><p className="text-xs text-green-600 mt-1">+210 this week</p></div>
</div>
<div className="grid md:grid-cols-2 gap-4">
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Live Map - Real-time drivers location</h3><div className="bg-[#0f172a] h-[360px] rounded-xl overflow-hidden relative"><iframe className="w-full h-full" src="https://www.openstreetmap.org/export/embed.html?bbox=71.3%2C33.9%2C71.7%2C34.1&layer=mapnik"></iframe><div className="absolute bottom-3 left-3 bg-white text-xs px-3 py-2 rounded-lg">● Active Driver ● On Ride</div></div></div>
 <div className="bg-white rounded-2xl border p-5"><div className="flex justify-between mb-4"><h3 className="font-bold">Drivers</h3><button onClick={()=>setTab('drivers')} className="text-blue-600 text-xs">View all</button></div><div className="space-y-3">{filtered.slice(0,4).map((u:any)=><div key={u.id} className="flex justify-between items-center border-b pb-3"><div><p className="font-medium text-sm">{u.name||'Driver'}</p><p className="text-xs text-gray-500">{u.phone||u.email||''}</p></div><div className="flex gap-2 items-center"><span className={`text-xs px-2 py-1 rounded-full ${u.is_blocked?'bg-red-100 text-red-600':u.status==='online'?'bg-green-100 text-green-600':'bg-gray-100'}`}>{u.is_blocked?'Blocked':u.status||'Offline'}</span><button onClick={()=>toggle(u)} className={`text-xs px-3 py-1.5 rounded-lg border ${u.is_blocked?'bg-blue-600 text-white':'bg-white text-red-600 border-red-200'}`}>{u.is_blocked?'Unblock':'Block'}</button></div></div>)}</div></div>
</div>
</>
)}

{tab==='drivers'&&(
<div className="bg-white rounded-2xl border p-4"><div className="flex justify-between mb-4"><h2 className="font-bold text-lg">All Drivers & Passengers</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search phone/name" className="border rounded-full px-4 py-1.5 text-sm"/></div><table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3 text-left">Driver</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.map((u:any)=><tr key={u.id} className="border-t"><td className="p-3"><p className="font-medium">{u.name||'No Name'}</p><p className="text-xs text-gray-500">{u.phone} {u.is_driver?'🚗':'🧍'}</p></td><td className="p-3 text-xs text-center">{u.current_lat?`${Number(u.current_lat).toFixed(3)},${Number(u.current_lng).toFixed(3)}`:'No location'}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${u.is_blocked?'bg-red-100 text-red-600':u.status==='online'?'bg-green-100 text-green-600':'bg-gray-100'}`}>{u.is_blocked?'Blocked':u.status||'Offline'}</span></td><td className="p-3 text-center"><button onClick={()=>toggle(u)} className={`px-3 py-1 rounded-lg text-xs ${u.is_blocked?'bg-blue-600 text-white':'border border-red-300 text-red-600'}`}>{u.is_blocked?'Unblock':'Block'}</button></td></tr>)}</tbody></table></div>
)}

{tab==='live'&&(
<div className="bg-white rounded-2xl border p-4 h-[75vh] flex flex-col"><h2 className="font-bold mb-3">Live Map - All Users</h2><div className="flex-1 grid md:grid-cols-3 gap-3"><div className="md:col-span-2 rounded-xl overflow-hidden border"><iframe className="w-full h-full" src="https://www.openstreetmap.org/export/embed.html?bbox=71.2%2C33.8%2C71.8%2C34.2&layer=mapnik&marker=34.0151%2C71.5249"></iframe></div><div className="overflow-auto space-y-2">{users.filter((u:any)=>u.current_lat).map((u:any)=><div key={u.id} className="border p-2 rounded-lg text-xs"><b>{u.name}</b> {u.phone}<br/>{u.current_lat},{u.current_lng}<br/><a className="text-blue-600" target="_blank" href={`https://maps.google.com/?q=${u.current_lat},${u.current_lng}`}>Open in Maps</a></div>)}</div></div></div>
)}

{tab==='otp'&&(
<div className="bg-white rounded-2xl border p-4"><h2 className="font-bold mb-4">OTP Logs - APK se aane wale OTP</h2><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Phone</th><th>OTP</th><th>Device</th><th>Time</th></tr></thead><tbody>{otps.map((o:any)=><tr key={o.id} className="border-t"><td className="p-2 font-mono">{o.phone}</td><td className="p-2 font-bold text-lg">{o.otp}</td><td className="p-2 text-xs">{o.device_id}</td><td className="p-2 text-xs">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>
)}

{tab==='docs'&&(
<div className="bg-white rounded-2xl border p-6"><h2 className="font-bold mb-4">Documents Verification Logic</h2><p className="text-sm">Driver ki ID = Passenger bhi. Passenger se Driver banna hai to CNIC + License + Vehicle docs lazmi upload kare tab hi is_driver=true hoga.</p><div className="mt-4 grid md:grid-cols-2 gap-3">{users.map((u:any)=><div key={u.id} className="border p-3 rounded-xl text-sm"><p>{u.name} - {u.phone}</p><p className="text-xs">CNIC: {u.cnic_front?'✅ Uploaded':'❌ Missing'} | License: {u.license_front?'✅':'❌'}</p><button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">Verify</button></div>)}</div></div>
)}

{tab==='settings'&&(
<div className="bg-white rounded-2xl border p-6"><h2 className="font-bold">APK Connection</h2><p className="text-sm mt-3">APK me ye API URL dalna hai:</p><code className="block bg-black text-green-400 p-3 rounded-lg mt-2 text-xs">NEXT_PUBLIC_SUPABASE_URL=https://vwvhtrpapsbysmpemdle.supabase.co<br/>NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_haGuloU4LJ7WsBorphXldw_f4yxRex_<br/>API: /api/update-location, /api/otp-logs, /api/block-user</code><p className="text-sm mt-4">APK se har 10 sec me location update bhejo to Live Map pe dikhega.</p></div>
)}

</div>
</div>
</div>
)
}
