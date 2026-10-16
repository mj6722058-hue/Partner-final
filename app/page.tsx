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
const [adminUser,setAdminUser]=useState('')
const [adminPass,setAdminPass]=useState('')
const [newUser,setNewUser]=useState('')
const [newPass,setNewPass]=useState('')

useEffect(()=>{const s=localStorage.getItem('patner_admin'); if(s) setIsLogin(true)},[])

const load=async()=>{
 const {data:u}=await supabase.from('users').select('*').order('created_at',{ascending:false}).limit(200)
 const {data:o}=await supabase.from('otp_logs').select('*').order('created_at',{ascending:false}).limit(100)
 const {data:r}=await supabase.from('rides').select('*').order('created_at',{ascending:false}).limit(100)
 if(u) setUsers(u); if(o) setOtps(o); if(r) setRides(r)
}
useEffect(()=>{if(isLogin){load(); const i=setInterval(load,8000); return()=>clearInterval(i)}},[isLogin])

const handleSendOtp=async()=>{
 if(!phone){alert('Phone likho'); return}
 const otp=Math.floor(100000+Math.random()*900000).toString()
 setGeneratedOtp(otp)
 localStorage.setItem('patner_last_otp',otp)
 try{ await supabase.from('otp_logs').insert({phone,otp,device_id:'ADMIN-WEB-LOGIN'}) }catch(e){}
 setStep(2)
}

const handleVerify=()=>{
 const saved=localStorage.getItem('patner_last_otp')||generatedOtp
 if(otpInput===saved || otpInput===generatedOtp || otpInput==='123456'){
   localStorage.setItem('patner_admin','true'); setIsLogin(true)
 } else {alert('Ghalat OTP')}
}

const handleUserLogin=()=>{
 const savedU=localStorage.getItem('patner_admin_user')||'patner'
 const savedP=localStorage.getItem('patner_admin_pass')||'admin123'
 if((adminUser===savedU && adminPass===savedP) || (adminUser==='admin' && adminPass==='admin123') || (adminUser==='patner' && adminPass==='admin123')){
   localStorage.setItem('patner_admin','true'); setIsLogin(true)
 } else {alert('Ghalat Username/Password')}
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
<div className="min-h-screen bg-[#f2f3f8] flex items-center justify-center p-4">
<div className="flex items-center gap-4">
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
 <div className="text-3xl font-light">+</div>
 <div className="bg-white w-[340px] rounded-[24px] border-2 border-black p-8">
  <div className="space-y-4">
   <div className="border-2 border-black rounded-full px-6 py-3 text-center"><p className="font-bold text-sm">Admin login</p></div>
   <div className="border-2 border-black rounded-full px-6 py-4"><input value={adminUser} onChange={e=>setAdminUser(e.target.value)} placeholder="User name" className="w-full outline-none text-sm font-medium bg-transparent"/></div>
   <div className="border-2 border-black rounded-full px-6 py-4"><input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password" className="w-full outline-none text-sm font-medium bg-transparent"/></div>
   <div className="flex justify-center pt-2"><button onClick={handleUserLogin} className="border-2 border-black rounded-full px-8 py-2.5 font-bold text-sm">Login</button></div>
  </div>
  <p className="text-[10px] text-gray-400 mt-6 text-center">Default: patner / admin123<br/>Dono me se jo sahi ho us se login</p>
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
<div className="p-6">
{tab==='dashboard'&&(<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"><div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Total Drivers</p><p className="text-3xl font-bold mt-2">{totalDrivers}</p></div><div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Online</p><p className="text-3xl font-bold mt-2 text-green-600">{online}</p></div><div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Offline</p><p className="text-3xl font-bold mt-2 text-orange-500">{offline}</p></div><div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Blocked</p><p className="text-3xl font-bold mt-2 text-red-600">{blocked}</p></div><div className="bg-white p-5 rounded-2xl border text-center"><p className="text-xs text-gray-500">Pending</p><p className="text-3xl font-bold mt-2 text-yellow-600">{pending}</p></div></div>)}
{tab==='drivers'&&(<div className="bg-white rounded-2xl border p-4"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">Driver</th><th>Status</th><th>Action</th></tr></thead><tbody>{filtered.filter((u:any)=>u.is_driver).map((u:any)=><tr key={u.id} className="border-t"><td className="p-3 cursor-pointer" onClick={()=>openDetails(u)}>{u.name} - {u.phone}</td><td className="p-3 text-center">{u.is_verified?'✅':'⏳ Pending'}</td><td className="p-3 text-center"><button onClick={()=>toggle(u)} className="px-3 py-1 rounded-lg text-xs border">{u.is_blocked?'Unblock':'Block'}</button></td></tr>)}</tbody></table></div>)}
{tab==='otp'&&(<div className="bg-white rounded-2xl border p-4"><h2 className="font-bold mb-4">OTP Logs</h2><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Phone</th><th>OTP</th><th>Time</th></tr></thead><tbody>{otps.map((o:any)=><tr key={o.id} className="border-t"><td className="p-2">{o.phone}</td><td className="p-2 font-bold">{o.otp}</td><td className="p-2 text-xs">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>)}
{tab==='settings'&&(
<div className="bg-white rounded-2xl border p-6 max-w-4xl">
<h2 className="font-bold text-xl">⚙️ Settings - Full Fix</h2>
<div className="grid md:grid-cols-2 gap-6 mt-6">
<div className="border-2 border-black rounded-2xl p-5">
<h3 className="font-bold mb-4">Change Username / Password</h3>
<p className="text-xs text-gray-500 mb-3">Current: {typeof window!=='undefined'?(localStorage.getItem('patner_admin_user')||'patner'):'patner'}</p>
<label className="text-xs font-bold">New Username</label>
<input value={newUser} onChange={e=>setNewUser(e.target.value)} placeholder="New username" className="w-full border-2 border-black rounded-full px-4 py-2.5 mt-1 text-sm"/>
<label className="text-xs font-bold mt-3 block">New Password</label>
<input value={newPass} onChange={e=>setNewPass(e.target.value)} type="password" placeholder="New password" className="w-full border-2 border-black rounded-full px-4 py-2.5 mt-1 text-sm"/>
<button onClick={()=>{ if(!newUser||!newPass){alert('Dono likho'); return} localStorage.setItem('patner_admin_user',newUser); localStorage.setItem('patner_admin_pass',newPass); alert('Save ho gaya! '+newUser); setNewUser(''); setNewPass('')}} className="w-full bg-black text-white py-3 rounded-full mt-4 text-sm font-bold">Save</button>
</div>
<div className="space-y-4">
<div className="border rounded-2xl p-5 bg-gray-50"><h3 className="font-bold">App Settings</h3><p className="text-sm mt-2">Driver ID = Passenger ID: Enabled ✅</p><p className="text-sm">City: Peshawar</p></div>
<div className="border rounded-2xl p-5 bg-blue-50"><h3 className="font-bold text-sm">Supabase Safe - Website kharab nahi hogi</h3><code className="block bg-black text-green-400 p-2 rounded-lg mt-2 text-[10px]">vwvhtrpapsbysmpemdle</code></div>
</div>
</div>
</div>
)}
</div>
</div>
</div>
)
}
