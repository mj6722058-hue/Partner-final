'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://vwvhtrpapsbysmpemdle.supabase.co','sb_publishable_haGuloU4LJ7WsBorphXldw_f4yxRex_')

function EyeIcon({open}:{open:boolean}){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{open?(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>):(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)}</svg>)}

export default function Page(){
const [isLogin,setIsLogin]=useState(false)
const [checked,setChecked]=useState(false)
const [role,setRole]=useState('')
const [busy,setBusy]=useState(false)
const [showLogin,setShowLogin]=useState(false)
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
const [modal,setModal]=useState<null|'create'|'edit'>(null)
const [editing,setEditing]=useState('')
const [fUser,setFUser]=useState('')
const [fPass,setFPass]=useState('')
const [fConf,setFConf]=useState('')
const [showP,setShowP]=useState(false)
const [showC,setShowC]=useState(false)
const [formErr,setFormErr]=useState('')
const [shown,setShown]=useState<Record<string,string>>({})
const [accounts,setAccounts]=useState<{username:string,created_at:string,blocked:boolean}[]>([])
const api=async(url:string,method='GET',body?:any)=>{
 const r=await fetch(url,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})
 const d=await r.json().catch(()=>({}))
 if(r.status===401) setIsLogin(false)
 return {ok:r.ok,data:d}
}
const loadAccounts=async()=>{const r=await api('/api/admin/accounts'); if(r.ok) setAccounts(r.data.accounts||[])}
useEffect(()=>{if(isLogin&&role==='root') loadAccounts()},[isLogin,role])
const resetForm=(u:string)=>{setFUser(u); setFPass(''); setFConf(''); setShowP(false); setShowC(false); setFormErr('')}
const openCreate=()=>{resetForm(''); setEditing(''); setModal('create')}
const openEdit=(a:any)=>{resetForm(a.username); setEditing(a.username); setModal('edit')}
const submitForm=async()=>{
 const u=fUser.trim()
 if(!u){setFormErr('Username likho'); return}
 if(modal==='create'&&(!fPass||!fConf)){setFormErr('Sab fields bharo'); return}
 if(fPass!==fConf){setFormErr('Password aur Confirm Password match nahi karte'); return}
 if(fPass&&fPass.length<8){setFormErr('Password kam az kam 8 characters ka ho'); return}
 setBusy(true)
 const r=modal==='create'
  ? await api('/api/admin/accounts','POST',{username:u,password:fPass})
  : await api('/api/admin/accounts','PATCH',{username:editing,newUsername:u,newPassword:fPass||undefined})
 setBusy(false)
 if(!r.ok){setFormErr(r.data.error||'Kuch masla aaya'); return}
 setShown({}); setModal(null); loadAccounts()
}
const deleteAccount=async(username:string)=>{
 if(!confirm('"'+username+'" ID delete karni hai?')) return
 const r=await api('/api/admin/accounts','DELETE',{username})
 if(!r.ok) alert(r.data.error||'Delete nahi hui')
 setShown({}); loadAccounts()
}
const toggleAccount=async(a:any)=>{
 const r=await api('/api/admin/accounts','PATCH',{username:a.username,blocked:!a.blocked})
 if(!r.ok) alert(r.data.error||'Update nahi hua')
 loadAccounts()
}
const toggleShow=async(username:string)=>{
 if(shown[username]!==undefined){const n={...shown}; delete n[username]; setShown(n); return}
 const r=await api('/api/admin/accounts?reveal='+encodeURIComponent(username))
 if(r.ok) setShown({...shown,[username]:r.data.password||''})
}

useEffect(()=>{fetch('/api/admin/me').then(r=>r.ok?r.json():null).then(d=>{if(d){setRole(d.role); setIsLogin(true)}}).catch(()=>{}).finally(()=>setChecked(true))},[])
const load=async()=>{
 const {data:u}=await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(300)
 const {data:o}=await supabase.from('otp_logs').select('*').order('created_at',{ascending:false}).limit(100)
 const {data:r}=await supabase.from('rides').select('*').order('created_at',{ascending:false}).limit(200)
 if(u) setUsers(u); if(o) setOtps(o); if(r) setRides(r)
}
useEffect(()=>{if(isLogin){load(); const i=setInterval(load,6000); return()=>clearInterval(i)}},[isLogin])

const handleUserLogin=async()=>{
 if(!adminUser||!adminPass){alert('Username aur password likho'); return}
 setBusy(true)
 try{
  const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:adminUser,password:adminPass})})
  const d=await r.json().catch(()=>({}))
  if(r.ok){setRole(d.role); setIsLogin(true); setAdminPass('')} else alert(d.error||'Login nahi hua')
 }catch(e){alert('Network masla, dobara try karein')}
 setBusy(false)
}
const handleLogout=async()=>{await fetch('/api/admin/logout',{method:'POST'}); setIsLogin(false); setRole(''); setAccounts([]); setShown({}); setTab('dashboard')}
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

const tabList=[['dashboard','📊 Dashboard'],['drivers','🚗 Drivers'],['passengers','👤 Passengers'],['live','🗺️ Live Map'],['otp','🔑 OTP Logs'],['docs','📄 Documents'],['settings','⚙️ Settings']]
if(!checked) return <div className="min-h-screen bg-[#f2f3f8]"/>
if(!isLogin){
return(
<div className="min-h-screen bg-[#f2f3f8] flex items-center justify-center p-4">
<div className="flex items-center gap-4 flex-wrap justify-center">
 <div className="bg-white w-[340px] rounded-[24px] border-2 border-black p-8">
  <div className="space-y-4">
   <div className="border-2 border-black rounded-full px-6 py-3 text-center"><p className="font-bold text-sm">Admin login</p></div>
   <div className="border-2 border-black rounded-full px-6 py-4"><input value={adminUser} onChange={e=>setAdminUser(e.target.value)} placeholder="User name" className="w-full outline-none text-sm font-medium bg-transparent"/></div>
   <div className="border-2 border-black rounded-full pl-6 pr-5 py-4 flex items-center"><input type={showLogin?'text':'password'} value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleUserLogin()}} placeholder="Password" className="flex-1 min-w-0 outline-none text-sm font-medium bg-transparent"/><button type="button" onClick={()=>setShowLogin(!showLogin)} aria-label="Password dikhao ya chhupao" className="ml-3 shrink-0 text-gray-500 hover:text-black"><EyeIcon open={showLogin}/></button></div>
   <div className="flex justify-center pt-2"><button onClick={handleUserLogin} disabled={busy} className="border-2 border-black rounded-full px-8 py-2.5 font-bold text-sm disabled:opacity-50">{busy?'Please wait...':'Login'}</button></div>
  </div>
 </div>
</div>
</div>
)
}

return(
<div className="min-h-screen bg-[#f5f6fb] flex">
<div className="w-[240px] bg-[#0f1220] text-white p-4 hidden md:flex flex-col fixed h-full z-20">
 <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">📍</div><b className="text-xl">Patner</b></div>
 {tabList.map(([k,l])=>(
  <button key={k} onClick={()=>setTab(k)} className={`text-left px-4 py-3 rounded-xl mb-1 text-sm ${tab===k?'bg-[#2d5bff]':'text-gray-400 hover:text-white'}`}>{l}</button>
 ))}
 <div className="mt-auto pt-6 border-t border-white/10 text-xs"><p>Admin</p><button onClick={handleLogout} className="text-red-400 mt-2">Logout</button></div>
</div>
<div className="flex-1 md:ml-[240px]">
<div className="bg-white border-b sticky top-0 z-10">
<div className="px-6 py-4 flex justify-between items-center"><h1 className="font-bold text-xl">Dashboard Overview</h1><button onClick={handleLogout} className="md:hidden text-xs font-bold text-red-500 border border-red-200 rounded-full px-3 py-1">Logout</button></div>
<div className="md:hidden flex gap-2 overflow-x-auto px-4 pb-3">{tabList.map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-xs font-medium ${tab===k?'bg-[#2d5bff] text-white':'bg-gray-100 text-gray-600'}`}>{l}</button>))}</div>
</div>
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
{tab==='drivers'&&(<div className="bg-white rounded-2xl border p-4 overflow-x-auto"><div className="flex justify-between mb-4"><h2 className="font-bold">All Drivers - Click for route map</h2><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border rounded-full px-4 py-1.5 text-sm"/></div><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Driver</th><th>Rides</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.filter((u:any)=>u.is_driver).map((u:any)=><tr key={u.id} className="border-t hover:bg-gray-50"><td className="p-3 cursor-pointer" onClick={()=>openDetails(u,'driver')}><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.phone}</p></td><td className="p-3 text-center text-xs">{getUserRides(u).length} ⭐ {u.rating||'4.8'}</td><td className="p-3 text-center"><span className="px-2 py-1 rounded-full text-xs bg-green-100">{u.status}</span></td><td className="p-3 text-center"><button onClick={()=>toggle(u)} className="px-3 py-1 rounded-lg text-xs border">Block</button></td></tr>)}</tbody></table></div>)}
{tab==='passengers'&&(
<div className="bg-white rounded-2xl border p-4 overflow-x-auto">
<h2 className="font-bold mb-4">All Passengers - Click for selfie, ID, location, route - Total: {filtered.filter((u:any)=>!u.is_driver).length || filtered.length}</h2>
<table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Passenger</th><th>Location</th><th>Rides</th><th>Current Ride</th><th>Action</th></tr></thead><tbody>
{(filtered.filter((u:any)=>!u.is_driver).length>0? filtered.filter((u:any)=>!u.is_driver) : filtered).map((u:any)=><tr key={u.id} className="border-t hover:bg-gray-50"><td className="p-3 cursor-pointer" onClick={()=>openDetails(u,'passenger')}><div className="flex gap-2 items-center"><div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">{u.selfie? <img src={u.selfie} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}</div><div><p className="font-medium">{u.name||'Passenger'}</p><p className="text-xs text-gray-500">{u.phone}</p></div></div></td><td className="p-3 text-xs text-center">{u.current_lat?Number(u.current_lat).toFixed(4):'No loc'}</td><td className="p-3 text-center text-xs">{getUserRides(u).length} rides</td><td className="p-3 text-xs text-center">{getActiveRide(u)? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px]">{getActiveRide(u).from_location} → {getActiveRide(u).to_location}</span> : <span className="text-gray-400">No ride</span>}</td><td className="p-3 text-center"><button onClick={()=>openDetails(u,'passenger')} className="text-blue-600 text-xs underline">View</button></td></tr>)}
</tbody></table>
</div>
)}
{tab==='live'&&(<div className="bg-white rounded-2xl border p-4 h-[75vh]"><h2 className="font-bold mb-3">Live Map - Route: Driver→A blue, A→B red</h2><iframe className="w-full h-full rounded-xl border" src="https://www.openstreetmap.org/export/embed.html?bbox=71.2%2C33.8%2C71.8%2C34.2&layer=mapnik"></iframe></div>)}
{tab==='otp'&&(<div className="bg-white rounded-2xl border p-4 overflow-x-auto"><h2 className="font-bold mb-4">OTP Logs</h2><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Phone</th><th>OTP</th><th>Time</th></tr></thead><tbody>{otps.map((o:any)=><tr key={o.id} className="border-t"><td className="p-2 font-mono">{o.phone}</td><td className="p-2 font-bold">{o.otp}</td><td className="p-2 text-xs">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>)}
{tab==='settings'&&(
<div className="bg-white rounded-2xl border p-6 max-w-4xl">
<h2 className="font-bold text-xl">⚙️ Settings</h2>
<div className="grid md:grid-cols-2 gap-6 mt-6">
<div className="border-2 border-black rounded-2xl p-5">
<h3 className="font-bold mb-2">Create New ID</h3>
<p className="text-xs text-gray-500 mb-5">Nayi user ID banane ke liye neeche button dabayen. Username, password aur confirm password dena hoga.</p>
{role==='root'?<button onClick={openCreate} className="w-full bg-black text-white py-3 rounded-full text-sm font-bold">＋ Create New ID</button>:<p className="text-xs text-red-500 font-bold">Sirf main admin nayi ID bana sakta hai</p>}
</div>
<div className="border rounded-2xl p-5 bg-gray-50"><h3 className="font-bold">App Settings</h3><p className="text-sm mt-2">Driver ID = Passenger ID: Enabled ✅</p><p className="text-sm">City: Peshawar</p><p className="text-sm">Version: Final 2.0</p></div>
</div>
{role==='root'&&(<>
<div className="mt-6 border rounded-2xl p-5">
<div className="flex justify-between items-center mb-4 flex-wrap gap-2">
<h3 className="font-bold">Created User IDs</h3>
<div className="flex gap-2 text-xs"><span className="px-3 py-1 rounded-full bg-gray-100 font-bold">Total: {accounts.length}</span><span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold">Active: {accounts.filter(a=>!a.blocked).length}</span><span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold">Blocked: {accounts.filter(a=>a.blocked).length}</span></div>
</div>
{accounts.length===0?(<p className="text-sm text-gray-400">Abhi koi user ID nahi banai</p>):(
<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">#</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Password</th><th className="p-3 text-left">Created</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Action</th></tr></thead><tbody>
{accounts.map((a,i)=><tr key={a.username} className="border-t"><td className="p-3 text-xs text-gray-500">{i+1}</td><td className="p-3 font-medium">{a.username}</td><td className="p-3"><div className="flex items-center gap-2"><span className="font-mono text-sm">{shown[a.username]!==undefined?shown[a.username]:'******'}</span><button onClick={()=>toggleShow(a.username)} className="text-gray-500 hover:text-black" title={shown[a.username]!==undefined?'Hide':'Show'}><EyeIcon open={shown[a.username]!==undefined}/></button></div></td><td className="p-3 text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</td><td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${a.blocked?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{a.blocked?'Blocked':'Active'}</span></td><td className="p-3"><div className="flex gap-2 justify-center"><button onClick={()=>openEdit(a)} className="px-3 py-1 rounded-lg text-xs font-bold border">Edit</button><button onClick={()=>toggleAccount(a)} className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${a.blocked?'bg-blue-600':'bg-red-600'}`}>{a.blocked?'Unblock':'Block'}</button><button onClick={()=>deleteAccount(a.username)} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-900 text-white">Delete</button></div></td></tr>)}
</tbody></table></div>)}
</div>
{modal && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950/70 via-slate-900/60 to-fuchsia-950/60 backdrop-blur-md" onClick={()=>setModal(null)}>
 <div className="absolute w-72 h-72 bg-blue-500/40 rounded-full blur-3xl -translate-x-32 -translate-y-24 pointer-events-none"></div>
 <div className="absolute w-72 h-72 bg-fuchsia-500/30 rounded-full blur-3xl translate-x-32 translate-y-28 pointer-events-none"></div>
 <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/15 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-7 text-white">
  <div className="flex justify-between items-start">
   <div><h3 className="text-xl font-bold">{modal==='create'?'Create New ID':'Edit ID'}</h3><p className="text-xs text-white/60 mt-1">{modal==='create'?'Nayi user ID ki details likho':'Username ya password badlo'}</p></div>
   <button onClick={()=>setModal(null)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-sm">✕</button>
  </div>
  <label className="text-xs font-semibold mt-6 block text-white/80">Username</label>
  <input value={fUser} onChange={e=>setFUser(e.target.value)} placeholder="Username" className="w-full bg-white/10 border border-white/30 focus:border-white/70 focus:bg-white/20 rounded-full px-5 py-3 mt-1.5 text-sm text-white placeholder-white/40 outline-none"/>
  <label className="text-xs font-semibold mt-4 block text-white/80">Password</label>
  <div className="flex items-center mt-1.5 bg-white/10 border border-white/30 focus-within:border-white/70 focus-within:bg-white/20 rounded-full pl-5 pr-4 py-3"><input value={fPass} onChange={e=>setFPass(e.target.value)} type={showP?'text':'password'} autoComplete="new-password" placeholder={modal==='edit'?'Naya password (khali = purana)':'Password'} className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/40 outline-none"/><button type="button" onClick={()=>setShowP(!showP)} aria-label="Password dikhao ya chhupao" className="ml-3 shrink-0 text-white/70 hover:text-white"><EyeIcon open={showP}/></button></div>
  <label className="text-xs font-semibold mt-4 block text-white/80">Confirm Password</label>
  <div className="flex items-center mt-1.5 bg-white/10 border border-white/30 focus-within:border-white/70 focus-within:bg-white/20 rounded-full pl-5 pr-4 py-3"><input value={fConf} onChange={e=>setFConf(e.target.value)} type={showC?'text':'password'} autoComplete="new-password" placeholder="Confirm password" className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/40 outline-none"/><button type="button" onClick={()=>setShowC(!showC)} aria-label="Confirm password dikhao ya chhupao" className="ml-3 shrink-0 text-white/70 hover:text-white"><EyeIcon open={showC}/></button></div>
  {formErr && <p className="text-xs text-red-300 bg-red-500/20 border border-red-300/30 rounded-xl px-3 py-2 mt-4">{formErr}</p>}
  <div className="flex gap-3 mt-6">
   <button onClick={()=>setModal(null)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/30">Cancel</button>
   <button onClick={submitForm} disabled={busy} className="flex-1 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500 hover:opacity-90 shadow-lg disabled:opacity-50">{busy?'Please wait...':modal==='create'?'Create ID':'Save Changes'}</button>
  </div>
 </div>
</div>
)}
</>)}
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
