'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CAR_DATA, CAR_COMPANIES } from '@/lib/car-data'
import { COUNTRIES, flagEmoji } from '@/lib/country-codes'
const supabase = createClient('https://vwvhtrpapsbysmpemdle.supabase.co','sb_publishable_haGuloU4LJ7WsBorphXldw_f4yxRex_')

function EyeIcon({open}:{open:boolean}){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{open?(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>):(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)}</svg>)}

const fmt=(t?:string|null)=>t?new Date(t).toLocaleString([],{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'—'
const ago=(t?:string|null)=>{if(!t) return ''; const x=Math.max(0,Math.round((Date.now()-new Date(t).getTime())/1000)); return x<60?x+' sec pehle':x<3600?Math.round(x/60)+' min pehle':Math.round(x/3600)+' ghante pehle'}
const dur=(a?:string|null,b?:string|null)=>{if(!a||!b) return ''; const m=Math.max(0,Math.round((new Date(b).getTime()-new Date(a).getTime())/60000)); return m<60?m+' min':Math.floor(m/60)+' ghante '+(m%60)+' min'}
const place=(a:any)=>[a?.city,a?.region,a?.country].filter(Boolean).join(', ')||'Maloom nahi'
const devIcon=(t?:string)=>t==='Mobile'?'📱':t==='Tablet'?'📲':'💻'
const compress=(file:File):Promise<string>=>new Promise((resolve,reject)=>{
 const img=new Image(); const r=new FileReader()
 r.onerror=()=>reject(new Error('read failed'))
 r.onload=()=>{img.onerror=()=>reject(new Error('image failed')); img.onload=()=>{
  const max=1280; let w=img.width,h=img.height
  if(w>max||h>max){const r2=Math.min(max/w,max/h); w=Math.round(w*r2); h=Math.round(h*r2)}
  const c=document.createElement('canvas'); c.width=w; c.height=h
  const ctx=c.getContext('2d'); if(!ctx){reject(new Error('canvas failed')); return}
  ctx.drawImage(img,0,0,w,h); resolve(c.toDataURL('image/jpeg',0.82))
 }; img.src=r.result as string}
 r.readAsDataURL(file)
})
const coords=(s:any)=>s?.gps_lat!=null&&s?.gps_lon!=null?{lat:s.gps_lat as number,lon:s.gps_lon as number,gps:true}:s?.ip_lat!=null&&s?.ip_lon!=null?{lat:s.ip_lat as number,lon:s.ip_lon as number,gps:false}:null

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
// ---- drivers ----
const [drivers,setDrivers]=useState<any[]>([])
const [drvSearch,setDrvSearch]=useState('')
const [drvFilter,setDrvFilter]=useState<'all'|'active'|'blocked'>('all')
const [drvWiz,setDrvWiz]=useState(false)
const [drvStep,setDrvStep]=useState(1)
const [drvForm,setDrvForm]=useState(()=>({firstName:'',lastName:'',gender:'male',countryCode:'+92',phone:'',username:'',password:'',confirm:'',
 selfieUrl:'',idFrontUrl:'',idBackUrl:'',licFrontUrl:'',licBackUrl:'',carImages:[] as string[],
 carCompany:CAR_COMPANIES[0],carName:CAR_DATA[CAR_COMPANIES[0]][0],carModel:''}))
const [drvErr,setDrvErr]=useState('')
const [drvOtp,setDrvOtp]=useState('')
const [drvDevOtp,setDrvDevOtp]=useState('')
const [drvBusy,setDrvBusy]=useState(false)
const [drvEditId,setDrvEditId]=useState('')
const [drvShown,setDrvShown]=useState<Record<string,string>>({})
const [drvPreview,setDrvPreview]=useState<Record<string,string>>({})
const [drvDone,setDrvDone]=useState(false)
const [editing,setEditing]=useState('')
const [fUser,setFUser]=useState('')
const [fPass,setFPass]=useState('')
const [fConf,setFConf]=useState('')
const [showP,setShowP]=useState(false)
const [showC,setShowC]=useState(false)
const [formErr,setFormErr]=useState('')
const [shown,setShown]=useState<Record<string,string>>({})
const [accounts,setAccounts]=useState<{username:string,created_at:string,blocked:boolean,activity:any}[]>([])
const [tracking,setTracking]=useState(true)
const [main,setMain]=useState<{username:string,activity:any}|null>(null)
const [locState,setLocState]=useState<'idle'|'granted'|'denied'|'unavailable'>('idle')
const watchRef=useRef<number|null>(null)
const [hist,setHist]=useState<{username:string,rows:any[]|null}|null>(null)
const [live,setLive]=useState<{username:string,s:any}|null>(null)
const gpsRef=useRef<any>(null)
const actCell=(ac:any,name:string)=>(<td className="p-3 text-xs whitespace-nowrap">{ac?(<><span className={`inline-flex items-center gap-1 font-bold ${ac.online?'text-green-600':'text-gray-400'}`}><span className={`w-2 h-2 rounded-full ${ac.online?'bg-green-500':'bg-gray-300'}`}></span>{ac.online?'Online':'Offline'}</span><p className="text-gray-500 mt-1">Login: {fmt(ac.login_at)}</p><p className="text-gray-500">{ac.online?'Abhi active hai':ac.logout_at?'Logout: '+fmt(ac.logout_at):'Last seen: '+fmt(ac.last_seen)}</p><button onClick={()=>openHistory(name)} className="text-blue-600 underline mt-1">History</button></>):<span className="text-gray-400">Abhi tak login nahi kiya</span>}</td>)
const devCell=(ac:any)=>(<td className="p-3 text-xs whitespace-nowrap">{ac?(<><p className="font-bold">{devIcon(ac.device_type)} {ac.device_type}{ac.device_model?' · '+ac.device_model:''}</p><p className="text-gray-500">{ac.os} {ac.os_version}</p><p className="text-gray-500">{ac.browser} {ac.browser_version}</p></>):<span className="text-gray-400">—</span>}</td>)
const locCell=(ac:any,name:string)=>(<td className="p-3 text-xs whitespace-nowrap">{ac?(<><p className="font-medium">{place(ac)}</p><p className="text-gray-400">{ac.ip||''}</p><button onClick={()=>openLive(name)} className="mt-1 px-2 py-1 rounded-lg bg-blue-600 text-white font-bold">📍 Location</button></>):<span className="text-gray-400">—</span>}</td>)
const api=async(url:string,method='GET',body?:any)=>{
 const r=await fetch(url,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined})
 const d=await r.json().catch(()=>({}))
 if(r.status===401) setIsLogin(false)
 return {ok:r.ok,data:d}
}
const loadAccounts=async()=>{const r=await api('/api/admin/accounts'); if(r.ok){setAccounts(r.data.accounts||[]); setMain(r.data.main||null); setTracking(r.data.tracking!==false)}}
useEffect(()=>{if(isLogin&&role==='root'){loadAccounts(); if(tab==='settings'){const i=setInterval(loadAccounts,15000); return()=>clearInterval(i)}}},[isLogin,role,tab])
const openHistory=async(username:string)=>{setHist({username,rows:null}); const r=await api('/api/admin/sessions?username='+encodeURIComponent(username)+'&limit=20'); setHist({username,rows:r.ok?(r.data.sessions||[]):[]})}
const openLive=(username:string)=>setLive({username,s:null})
useEffect(()=>{
 if(!live) return
 const u=live.username
 const tick=async()=>{const r=await api('/api/admin/sessions?username='+encodeURIComponent(u)+'&limit=1'); if(r.ok) setLive(l=>l&&l.username===u?{username:u,s:(r.data.sessions||[])[0]||null}:l)}
 tick(); const i=setInterval(tick,10000); return()=>clearInterval(i)
},[live?.username])

// every logged-in person: tell the server we are still here (every 30s)
const startGeo=()=>{
 if(typeof navigator==='undefined'||!('geolocation' in navigator)){gpsRef.current={status:'unavailable'}; setLocState('unavailable'); return}
 if(watchRef.current!==null) navigator.geolocation.clearWatch(watchRef.current)
 let first=true
 watchRef.current=navigator.geolocation.watchPosition(
  p=>{gpsRef.current={status:'granted',lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}; setLocState('granted'); if(first){first=false; sendPing()}},
  e=>{if(e.code===1){gpsRef.current={status:'denied'}; setLocState('denied')} else if(e.code===2){gpsRef.current={status:'unavailable'}; setLocState('unavailable')}},
  {enableHighAccuracy:true,maximumAge:10000,timeout:30000})
}
const sendPing=()=>{fetch('/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(gpsRef.current||{status:'pending'})}).then(r=>{if(r.status===401) setIsLogin(false)}).catch(()=>{})}
useEffect(()=>{
 if(!isLogin||!role) return
 sendPing(); const i=setInterval(sendPing,30000)
 // if the browser already has permission, start straight away (no prompt); otherwise the banner button asks
 let permStatus:any=null
 try{(navigator as any).permissions?.query({name:'geolocation'}).then((ps:any)=>{permStatus=ps; if(ps.state==='granted') startGeo(); else if(ps.state==='denied'){gpsRef.current={status:'denied'}; setLocState('denied')}; ps.onchange=()=>{if(ps.state==='granted') startGeo()}}).catch(()=>{})}catch(e){}
 return()=>{clearInterval(i); if(permStatus) permStatus.onchange=null; if(watchRef.current!==null&&typeof navigator!=='undefined'){navigator.geolocation.clearWatch(watchRef.current); watchRef.current=null}}
},[isLogin,role])
const loadDrivers=async()=>{const p=new URLSearchParams(); if(drvSearch.trim()) p.set('search',drvSearch.trim()); if(drvFilter!=='all') p.set('status',drvFilter); const r=await api('/api/admin/drivers?'+p.toString()); if(r.ok) setDrivers(r.data.drivers||[])}
useEffect(()=>{if(isLogin&&tab==='drivers'){const t=setTimeout(loadDrivers,250); return()=>clearTimeout(t)}},[isLogin,tab,drvSearch,drvFilter])
const uploadImg=async(dataUrl:string,folder:string)=>{const r=await api('/api/admin/upload','POST',{dataUrl,folder}); if(!r.ok) throw new Error(r.data.error||'Upload fail'); return r.data.path as string}
const pickImage=(field:string,folder:string)=>async(e:any)=>{
 const file=e.target.files?.[0]; if(!file) return
 try{
  const dataUrl=await compress(file)
  setDrvErr(''); setDrvBusy(true)
  const path=await uploadImg(dataUrl,folder)
  setDrvForm((f:any)=>({...f,[field]:path})); setDrvPreview(p=>({...p,[path]:dataUrl}))
 }catch(err:any){setDrvErr(err.message||'Tasveer upload nahi hui')}
 setDrvBusy(false); e.target.value=''
}
const addCarImage=(e:any)=>{
 const file=e.target.files?.[0]; if(!file) return
 (async()=>{try{const dataUrl=await compress(file); setDrvBusy(true); const path=await uploadImg(dataUrl,'drivers'); setDrvForm((f:any)=>({...f,carImages:[...f.carImages,path]})); setDrvPreview(p=>({...p,[path]:dataUrl}))}catch(err:any){setDrvErr(err.message||'Tasveer upload nahi hui')} setDrvBusy(false)})()
 e.target.value=''
}
const removeCarImage=(path:string)=>setDrvForm((f:any)=>({...f,carImages:f.carImages.filter((x:string)=>x!==path)}))
const fetchingMedia=useRef<Set<string>>(new Set())
const imgSrc=(path:string)=>{
 if(!path) return ''
 if(drvPreview[path]) return drvPreview[path]
 if(!fetchingMedia.current.has(path)){
  fetchingMedia.current.add(path)
  api('/api/admin/drivers/media?path='+encodeURIComponent(path)).then(r=>{if(r.ok) setDrvPreview(p=>({...p,[path]:r.data.url}))}).finally(()=>fetchingMedia.current.delete(path))
 }
 return ''
}
const emptyDrvForm=()=>({firstName:'',lastName:'',gender:'male',countryCode:'+92',phone:'',username:'',password:'',confirm:'',
 selfieUrl:'',idFrontUrl:'',idBackUrl:'',licFrontUrl:'',licBackUrl:'',carImages:[] as string[],
 carCompany:CAR_COMPANIES[0],carName:CAR_DATA[CAR_COMPANIES[0]][0],carModel:''})
const openDriverWizard=()=>{setDrvForm(emptyDrvForm()); setDrvEditId(''); setDrvStep(1); setDrvErr(''); setDrvOtp(''); setDrvDevOtp(''); setDrvDone(false); setDrvWiz(true)}
const drvStep1Ok=()=>drvForm.firstName.trim()&&drvForm.lastName.trim()&&drvForm.username.trim().length>=3&&drvForm.password.length>=8&&drvForm.password===drvForm.confirm
const sendDriverOtp=async()=>{
 setDrvErr('')
 if(!drvStep1Ok()){setDrvErr('Pehla/aakhri naam, username, password (kam az kam 8) aur confirm password theek bharein'); return}
 if(drvForm.phone.replace(/\D/g,'').length<6){setDrvErr('Phone number likhein'); return}
 setDrvBusy(true)
 const r=await api('/api/admin/drivers/otp','POST',{countryCode:drvForm.countryCode,phone:drvForm.phone})
 setDrvBusy(false)
 if(!r.ok){setDrvErr(r.data.error||'OTP nahi bheja ja saka'); return}
 setDrvDevOtp(r.data.devCode||''); setDrvStep(4)
}
const submitDriver=async()=>{
 if(!/^\d{6}$/.test(drvOtp)){setDrvErr('6 digit OTP likhein'); return}
 setDrvErr(''); setDrvBusy(true)
 const r=await api('/api/admin/drivers','POST',{
  firstName:drvForm.firstName,lastName:drvForm.lastName,gender:drvForm.gender,
  countryCode:drvForm.countryCode,phone:drvForm.phone,username:drvForm.username,password:drvForm.password,
  selfieUrl:drvForm.selfieUrl,idFrontUrl:drvForm.idFrontUrl,idBackUrl:drvForm.idBackUrl,
  licFrontUrl:drvForm.licFrontUrl,licBackUrl:drvForm.licBackUrl,carImages:drvForm.carImages,
  carCompany:drvForm.carCompany,carName:drvForm.carName,carModel:drvForm.carModel,otp:drvOtp,
 })
 setDrvBusy(false)
 if(!r.ok){setDrvErr(r.data.error||'Registration nahi ho saki'); return}
 setDrvDone(true); setDrvStep(5); loadDrivers()
}
const toggleDriver=async(d:any)=>{const r=await api('/api/admin/drivers','PATCH',{id:d.id,status:d.status==='blocked'?'active':'blocked'}); if(!r.ok) alert(r.data.error||'Update nahi hua'); loadDrivers()}
const deleteDriver=async(d:any)=>{if(!confirm('"'+d.first_name+' '+d.last_name+'" ki ID delete karni hai?')) return; const r=await api('/api/admin/drivers','DELETE',{id:d.id}); if(!r.ok) alert(r.data.error||'Delete nahi hui'); loadDrivers()}
const toggleDriverPass=async(d:any)=>{if(drvShown[d.username]!==undefined){const n={...drvShown}; delete n[d.username]; setDrvShown(n); return} const r=await api('/api/admin/drivers?reveal='+encodeURIComponent(d.username)); if(r.ok) setDrvShown(s=>({...s,[d.username]:r.data.password||''}))}
const openEditDriver=(d:any)=>{
 setDrvEditId(d.id)
 setDrvForm({firstName:d.first_name,lastName:d.last_name,gender:d.gender,countryCode:d.country_code,phone:d.phone,username:d.username,password:'',confirm:'',
  selfieUrl:d.selfie_url||'',idFrontUrl:d.id_front_url||'',idBackUrl:d.id_back_url||'',licFrontUrl:d.lic_front_url||'',licBackUrl:d.lic_back_url||'',
  carImages:d.car_images||[],carCompany:d.car_company||CAR_COMPANIES[0],carName:d.car_name||'',carModel:d.car_model||''})
 setDrvErr(''); setDrvWiz(true); setDrvStep(0)
}
const saveDriverEdit=async()=>{
 if(!drvForm.firstName.trim()||!drvForm.lastName.trim()){setDrvErr('Naam likhein'); return}
 if(drvForm.password && drvForm.password.length<8){setDrvErr('Naya password kam az kam 8 characters ka ho'); return}
 if(drvForm.password && drvForm.password!==drvForm.confirm){setDrvErr('Password match nahi karta'); return}
 setDrvErr(''); setDrvBusy(true)
 const r=await api('/api/admin/drivers','PATCH',{id:drvEditId,firstName:drvForm.firstName,lastName:drvForm.lastName,gender:drvForm.gender,
  newPassword:drvForm.password||undefined,carCompany:drvForm.carCompany,carName:drvForm.carName,carModel:drvForm.carModel,
  selfieUrl:drvForm.selfieUrl,idFrontUrl:drvForm.idFrontUrl,idBackUrl:drvForm.idBackUrl,licFrontUrl:drvForm.licFrontUrl,licBackUrl:drvForm.licBackUrl,carImages:drvForm.carImages})
 setDrvBusy(false)
 if(!r.ok){setDrvErr(r.data.error||'Save nahi hua'); return}
 setDrvWiz(false); setDrvEditId(''); loadDrivers()
}
const ImgBox=({label,field,folder}:{label:string,field:string,folder:string})=>{
 const path=(drvForm as any)[field] as string
 return(<label className="block">
  <span className="text-xs font-semibold text-white/80">{label}</span>
  <div className="mt-1.5 relative h-28 rounded-xl border border-white/30 bg-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/15">
   {path?<img src={imgSrc(path)} className="w-full h-full object-cover"/>:<span className="text-white/50 text-xs">+ Tasveer lagayen</span>}
   <input type="file" accept="image/*" onChange={pickImage(field,folder)} className="absolute inset-0 opacity-0 cursor-pointer"/>
  </div>
 </label>)
}

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
  let device:any={}
  try{
   const nav:any=navigator; let hints:any={}
   if(nav.userAgentData){const h=await nav.userAgentData.getHighEntropyValues(['platformVersion','model']); hints={platform:nav.userAgentData.platform,mobile:nav.userAgentData.mobile,platformVersion:h.platformVersion,model:h.model}}
   device={hints,touch:navigator.maxTouchPoints||0,screen:screen.width+'x'+screen.height,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}
  }catch(e){}
  const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:adminUser,password:adminPass,device})})
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
   <p className="text-[10px] text-gray-400 text-center">Login par aap ki device ki maloomat aur location (browser ki ijazat se) record hoti hai</p>
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
{locState!=='granted'&&(<div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-bold text-sm text-amber-900">📍 Location abhi band hai</p><p className="text-xs text-amber-800 mt-1">{locState==='denied'?'Browser ne location block ki hui hai. Chrome ka ⋮ menu → Settings → Site settings → Location mein is site ko Allow karein, phir neeche button dabayen.':locState==='unavailable'?'Is device par location available nahi (GPS band ho sakta hai).':'Admin ko aap ki location dikhane ke liye browser ki ijazat chahiye. Button dabayen aur "Allow" chunen.'}</p><p className="text-[11px] text-amber-700 mt-1">Agar "This site can&apos;t ask for your permission" aaye to doosri apps ke floating bubbles/overlay (Messenger, Snapchat wagaira) band karke "Try again" dabayen.</p></div><button onClick={startGeo} className="shrink-0 bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-full">Location ON karein</button></div>)}
{tab==='dashboard'&&(
<>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
 <div onClick={()=>{setDrvFilter('all'); setTab('drivers')}} className="bg-white p-5 rounded-2xl border text-center cursor-pointer hover:shadow-md transition"><p className="text-xs text-gray-500">Total Drivers</p><p className="text-3xl font-bold mt-2">{totalDrivers}</p></div>
 <div onClick={()=>setTab('passengers')} className="bg-white p-5 rounded-2xl border text-center cursor-pointer hover:shadow-md transition"><p className="text-xs text-gray-500">Passengers</p><p className="text-3xl font-bold mt-2">{totalPassengers || totalDrivers}</p></div>
 <div onClick={()=>{setDrvFilter('active'); setTab('drivers')}} className="bg-white p-5 rounded-2xl border text-center cursor-pointer hover:shadow-md transition"><p className="text-xs text-gray-500">Online</p><p className="text-3xl font-bold mt-2 text-green-600">{online}</p></div>
 <div onClick={()=>{setDrvFilter('blocked'); setTab('drivers')}} className="bg-white p-5 rounded-2xl border text-center cursor-pointer hover:shadow-md transition"><p className="text-xs text-gray-500">Blocked</p><p className="text-3xl font-bold mt-2 text-red-600">{blocked}</p></div>
 <div onClick={()=>{setDrvFilter('all'); setTab('drivers')}} className="bg-white p-5 rounded-2xl border text-center cursor-pointer hover:shadow-md transition"><p className="text-xs text-gray-500">Pending</p><p className="text-3xl font-bold mt-2 text-yellow-600">{pending}</p></div>
</div>
<div className="grid md:grid-cols-2 gap-4">
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Live Map</h3><div className="bg-[#eef2ff] h-[320px] rounded-xl overflow-hidden"><iframe className="w-full h-full border-0" src="https://www.openstreetmap.org/export/embed.html?bbox=71.3%2C33.9%2C71.7%2C34.1&layer=mapnik&marker=34.0151%2C71.5249"></iframe></div></div>
 <div className="bg-white rounded-2xl border p-5"><h3 className="font-bold mb-3">Recent Drivers - Click for route</h3><div className="space-y-3">{filtered.filter((u:any)=>u.is_driver).slice(0,6).map((u:any)=><div key={u.id} onClick={()=>openDetails(u,'driver')} className="flex justify-between items-center border-b pb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"><div><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.phone} • {getUserRides(u).length} rides</p></div><span className="text-[10px] px-2 py-1 rounded-full bg-gray-100">{u.status}</span></div>)}</div></div>
</div>
</>
)}
{tab==='drivers'&&(<div className="bg-white rounded-2xl border p-4 overflow-x-auto">
<div className="flex flex-wrap justify-between items-center gap-3 mb-4">
 <h2 className="font-bold">Drivers</h2>
 <div className="flex flex-wrap gap-2 items-center">
  <input value={drvSearch} onChange={e=>setDrvSearch(e.target.value)} placeholder="List # ya phone se search karein" className="border rounded-full px-4 py-1.5 text-sm w-56"/>
  <select value={drvFilter} onChange={e=>setDrvFilter(e.target.value as any)} className="border rounded-full px-3 py-1.5 text-sm"><option value="all">Sab</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
  <button onClick={openDriverWizard} className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">＋ Create New ID</button>
 </div>
</div>
<table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">#</th><th className="p-3 text-left">Driver</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Password</th><th className="p-3 text-left">Car</th><th className="p-3 text-center">Rating</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Action</th></tr></thead><tbody>
{drivers.map((d:any)=><tr key={d.id} className="border-t hover:bg-gray-50 align-top">
 <td className="p-3 text-xs text-gray-500">{d.list_no}</td>
 <td className="p-3"><div className="flex gap-2 items-center"><div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">{d.selfie_url?<img src={imgSrc(d.selfie_url)} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-xs">👤</div>}</div><div><p className="font-medium">{d.first_name} {d.last_name}</p><p className="text-xs text-gray-500">{d.gender==='male'?'Male':'Female'}</p></div></div></td>
 <td className="p-3 text-xs">{d.country_code} {d.phone}</td>
 <td className="p-3"><div className="flex items-center gap-2"><span className="font-mono text-sm">{drvShown[d.username]!==undefined?drvShown[d.username]:'******'}</span><button onClick={()=>toggleDriverPass(d)} className="text-gray-500 hover:text-black"><EyeIcon open={drvShown[d.username]!==undefined}/></button></div></td>
 <td className="p-3 text-xs">{d.car_company}<br/>{d.car_name} {d.car_model}</td>
 <td className="p-3 text-center text-xs">⭐ {d.rating||0} <span className="text-gray-400">({d.rating_count||0})</span></td>
 <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${d.status==='blocked'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{d.status==='blocked'?'Blocked':'Active'}</span></td>
 <td className="p-3"><div className="flex gap-2 justify-center flex-wrap"><button onClick={()=>openEditDriver(d)} className="px-3 py-1 rounded-lg text-xs font-bold border">Edit</button><button onClick={()=>toggleDriver(d)} className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${d.status==='blocked'?'bg-blue-600':'bg-red-600'}`}>{d.status==='blocked'?'Unblock':'Block'}</button><button onClick={()=>deleteDriver(d)} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-900 text-white">Delete</button></div></td>
</tr>)}
</tbody></table>
{drivers.length===0&&<p className="text-sm text-gray-400 p-4 text-center">Koi driver nahi mila</p>}
<p className="text-[11px] text-gray-400 mt-3">Online status, live location aur ride ka route driver app se connect hone ke baad yahan dikhega — abhi sirf ID, images aur car ki maloomat yahan save hoti hai.</p>
</div>)}
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
<div className="bg-white rounded-2xl border p-6 max-w-6xl">
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
{!tracking&&<p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">Activity record ke liye Supabase mein lib/admin_sessions.sql run karna baqi hai.</p>}
{accounts.length===0&&!main?(<p className="text-sm text-gray-400">Abhi koi user ID nahi banai</p>):(
<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs"><tr><th className="p-3 text-left">#</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Password</th><th className="p-3 text-left">Created</th><th className="p-3 text-left">Activity</th><th className="p-3 text-left">Device</th><th className="p-3 text-left">Location</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Action</th></tr></thead><tbody>
{main&&(<tr className="border-t bg-blue-50/50"><td className="p-3 text-xs text-gray-500">★</td><td className="p-3 font-medium">{main.username}<span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white">Main Admin</span></td><td className="p-3 text-xs text-gray-400">Vercel mein</td><td className="p-3 text-xs text-gray-400">—</td>{actCell(main.activity,main.username)}{devCell(main.activity)}{locCell(main.activity,main.username)}<td className="p-3 text-center"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Main</span></td><td className="p-3 text-center text-xs text-gray-400">—</td></tr>)}
{accounts.map((a,i)=><tr key={a.username} className="border-t"><td className="p-3 text-xs text-gray-500">{i+1}</td><td className="p-3 font-medium">{a.username}</td><td className="p-3"><div className="flex items-center gap-2"><span className="font-mono text-sm">{shown[a.username]!==undefined?shown[a.username]:'******'}</span><button onClick={()=>toggleShow(a.username)} className="text-gray-500 hover:text-black" title={shown[a.username]!==undefined?'Hide':'Show'}><EyeIcon open={shown[a.username]!==undefined}/></button></div></td><td className="p-3 text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
{actCell(a.activity,a.username)}{devCell(a.activity)}{locCell(a.activity,a.username)}
<td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${a.blocked?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{a.blocked?'Blocked':'Active'}</span></td><td className="p-3"><div className="flex gap-2 justify-center"><button onClick={()=>openEdit(a)} className="px-3 py-1 rounded-lg text-xs font-bold border">Edit</button><button onClick={()=>toggleAccount(a)} className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${a.blocked?'bg-blue-600':'bg-red-600'}`}>{a.blocked?'Unblock':'Block'}</button><button onClick={()=>deleteAccount(a.username)} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-900 text-white">Delete</button></div></td></tr>)}
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
{hist && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950/70 via-slate-900/60 to-fuchsia-950/60 backdrop-blur-md" onClick={()=>setHist(null)}>
 <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-2xl max-h-[88vh] overflow-auto rounded-3xl border border-white/30 bg-white/15 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-6 text-white">
  <div className="flex justify-between items-start"><div><h3 className="text-xl font-bold">Login History</h3><p className="text-xs text-white/60 mt-1">{hist.username} · aakhri 20 logins</p></div><button onClick={()=>setHist(null)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-sm">✕</button></div>
  <div className="mt-5 space-y-3">
   {hist.rows===null&&<p className="text-sm text-white/60">Load ho raha hai...</p>}
   {hist.rows&&hist.rows.length===0&&<p className="text-sm text-white/60">Koi login record nahi</p>}
   {hist.rows&&hist.rows.map((r:any,i:number)=>{const end=r.logout_at||r.last_seen; const c=coords(r); return(
    <div key={i} className="rounded-2xl bg-white/10 border border-white/20 p-4 text-sm">
     <div className="flex justify-between items-center flex-wrap gap-2"><span className={`text-xs font-bold px-2 py-1 rounded-full ${r.online?'bg-green-400/30 text-green-200':'bg-white/15 text-white/70'}`}>{r.online?'● Online':r.logout_at?'Logout kiya':'Offline'}</span><span className="text-xs text-white/60">{dur(r.login_at,end)}</span></div>
     <p className="mt-2 font-semibold">{fmt(r.login_at)} <span className="text-white/50">→</span> {r.online?'abhi tak':fmt(end)}</p>
     <p className="text-xs text-white/70 mt-1">{devIcon(r.device_type)} {r.device_type}{r.device_model?' · '+r.device_model:''} · {r.os} {r.os_version} · {r.browser} {r.browser_version}{r.screen?' · '+r.screen:''}</p>
     <p className="text-xs text-white/70 mt-1">📍 {place(r)}{r.ip?' · '+r.ip:''}{c&&<> · <a className="underline text-blue-200" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${c.lat},${c.lon}`}>{c.gps?'GPS map':'Approx map'}</a></>}</p>
    </div>)})}
  </div>
 </div>
</div>
)}
{live && (()=>{ const s=live.s; const c=coords(s); const d=c&&c.gps?0.004:0.12; return(
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950/70 via-slate-900/60 to-fuchsia-950/60 backdrop-blur-md" onClick={()=>setLive(null)}>
 <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-2xl max-h-[92vh] overflow-auto rounded-3xl border border-white/30 bg-white/15 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-6 text-white">
  <div className="flex justify-between items-start"><div><h3 className="text-xl font-bold">Live Location</h3><p className="text-xs text-white/60 mt-1">{live.username}{s&&<> · <span className={s.online?'text-green-300 font-bold':'text-white/70'}>{s.online?'● Online':'Offline'}</span></>}</p></div><button onClick={()=>setLive(null)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-sm">✕</button></div>
  {!s?<p className="text-sm text-white/60 mt-5">Load ho raha hai...</p>:!c?<p className="text-sm text-white/70 mt-5">Is ID ki location abhi maloom nahi.</p>:(
  <>
   <div className="mt-4 rounded-2xl overflow-hidden border border-white/30 h-[300px] bg-white/10"><iframe key={c.lat+','+c.lon} className="w-full h-full border-0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.lon-d}%2C${c.lat-d}%2C${c.lon+d}%2C${c.lat+d}&layer=mapnik&marker=${c.lat}%2C${c.lon}`}></iframe></div>
   <div className="mt-3 rounded-2xl bg-white/10 border border-white/20 p-4 text-sm space-y-1">
    <p><b>{c.gps?'GPS location (exact)':'Approx location (IP se, sirf shehar ke qareeb)'}</b></p>
    {c.gps&&<p className="text-xs text-white/70">Sahi-pan: ±{Math.round(s.gps_accuracy||0)} meter · Update: {ago(s.gps_at)}</p>}
    {!c.gps&&s.gps_status==='denied'&&<p className="text-xs text-amber-200">User ne browser mein location ki ijazat band ki hui hai.</p>}
    {!c.gps&&s.gps_status==='unavailable'&&<p className="text-xs text-amber-200">Is device par GPS location available nahi.</p>}
    {!c.gps&&(s.gps_status==='pending'||!s.gps_status)&&<p className="text-xs text-white/70">GPS ka intezar hai (user ki ijazat ya signal).</p>}
    <p className="text-xs text-white/70">📍 {place(s)}{s.ip?' · IP '+s.ip:''}</p>
    {!s.online&&<p className="text-xs text-amber-200">User abhi offline hai, aakhri maloom location dikha rahe hain ({ago(s.last_seen)}).</p>}
    <p className="text-xs text-white/50">Har 10 second mein khud update hoti hai (jab tak user ka page khula ho).</p>
    <a className="inline-block mt-2 text-xs font-bold underline text-blue-200" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${c.lat},${c.lon}`}>Google Maps mein kholen</a>
   </div>
  </>)}
 </div>
</div>)})()}
</>)}
</div>
)}
</div>

{drvWiz && (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950/70 via-slate-900/60 to-fuchsia-950/60 backdrop-blur-md" onClick={()=>{if(drvBusy) return; setDrvWiz(false); setDrvEditId('')}}>
 <div onClick={e=>e.stopPropagation()} className="relative w-full max-w-2xl max-h-[92vh] overflow-auto rounded-3xl border border-white/30 bg-white/15 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-6 text-white">
  <div className="flex justify-between items-start">
   <div><h3 className="text-xl font-bold">{drvEditId?'Driver ki ID edit karein':drvStep===5?'Mubarak ho! 🎉':'Create New Driver ID'}</h3><p className="text-xs text-white/60 mt-1">{drvEditId?drvForm.firstName+' '+drvForm.lastName:drvStep<5?'Step '+drvStep+' of 4':'Registration mukammal ho gayi'}</p></div>
   <button onClick={()=>{setDrvWiz(false); setDrvEditId('')}} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-sm">✕</button>
  </div>

  {drvErr&&<p className="text-xs text-red-300 bg-red-500/20 border border-red-300/30 rounded-xl px-3 py-2 mt-4">{drvErr}</p>}

  {/* ---- EDIT MODE: everything on one screen ---- */}
  {drvEditId?(<>
   <div className="grid sm:grid-cols-2 gap-3 mt-5">
    <label className="block"><span className="text-xs font-semibold text-white/80">First Name</span><input value={drvForm.firstName} onChange={e=>setDrvForm((f:any)=>({...f,firstName:e.target.value}))} className="w-full mt-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"/></label>
    <label className="block"><span className="text-xs font-semibold text-white/80">Last Name</span><input value={drvForm.lastName} onChange={e=>setDrvForm((f:any)=>({...f,lastName:e.target.value}))} className="w-full mt-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"/></label>
   </div>
   <label className="block mt-3"><span className="text-xs font-semibold text-white/80">Gender</span><div className="flex gap-3 mt-1.5">{['male','female'].map(g=><button key={g} onClick={()=>setDrvForm((f:any)=>({...f,gender:g}))} className={`flex-1 py-2 rounded-full text-sm font-bold border ${drvForm.gender===g?'bg-white text-black':'bg-white/10 border-white/30'}`}>{g==='male'?'Male':'Female'}</button>)}</div></label>
   <div className="grid sm:grid-cols-2 gap-3 mt-3">
    <label className="block"><span className="text-xs font-semibold text-white/80">Naya Password (khali = purana)</span><div className="flex items-center mt-1.5 bg-white/10 border border-white/30 rounded-full pl-5 pr-4 py-2.5"><input value={drvForm.password} onChange={e=>setDrvForm((f:any)=>({...f,password:e.target.value}))} type={showP?'text':'password'} className="flex-1 min-w-0 bg-transparent text-sm outline-none"/><button type="button" onClick={()=>setShowP(!showP)} className="ml-2 text-white/70"><EyeIcon open={showP}/></button></div></label>
    <label className="block"><span className="text-xs font-semibold text-white/80">Confirm Password</span><div className="flex items-center mt-1.5 bg-white/10 border border-white/30 rounded-full pl-5 pr-4 py-2.5"><input value={drvForm.confirm} onChange={e=>setDrvForm((f:any)=>({...f,confirm:e.target.value}))} type={showC?'text':'password'} className="flex-1 min-w-0 bg-transparent text-sm outline-none"/><button type="button" onClick={()=>setShowC(!showC)} className="ml-2 text-white/70"><EyeIcon open={showC}/></button></div></label>
   </div>
   <p className="text-xs font-bold mt-5">Car</p>
   <div className="grid sm:grid-cols-3 gap-3 mt-2">
    <select value={drvForm.carCompany} onChange={e=>setDrvForm((f:any)=>({...f,carCompany:e.target.value,carName:CAR_DATA[e.target.value][0]}))} className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none">{CAR_COMPANIES.map(c=><option key={c} className="text-black" value={c}>{c}</option>)}</select>
    <select value={drvForm.carName} onChange={e=>setDrvForm((f:any)=>({...f,carName:e.target.value}))} className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none">{(CAR_DATA[drvForm.carCompany]||[]).map(c=><option key={c} className="text-black" value={c}>{c}</option>)}</select>
    <input value={drvForm.carModel} onChange={e=>setDrvForm((f:any)=>({...f,carModel:e.target.value}))} placeholder="Model / year" className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none placeholder-white/40"/>
   </div>
   <p className="text-xs font-bold mt-5">Tasveerein</p>
   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
    <ImgBox label="Selfie" field="selfieUrl" folder="drivers"/>
    <ImgBox label="ID Card (Front)" field="idFrontUrl" folder="drivers"/>
    <ImgBox label="ID Card (Back)" field="idBackUrl" folder="drivers"/>
    <ImgBox label="License (Front)" field="licFrontUrl" folder="drivers"/>
    <ImgBox label="License (Back)" field="licBackUrl" folder="drivers"/>
   </div>
   <p className="text-xs font-bold mt-5">Car ki tasveerein</p>
   <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
    {drvForm.carImages.map((p:string)=>(<div key={p} className="relative h-24 rounded-xl overflow-hidden border border-white/30"><img src={imgSrc(p)} className="w-full h-full object-cover"/><button onClick={()=>removeCarImage(p)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-xs">✕</button></div>))}
    <label className="h-24 rounded-xl border border-dashed border-white/40 flex items-center justify-center text-xs text-white/60 cursor-pointer relative">+ Add<input type="file" accept="image/*" onChange={addCarImage} className="absolute inset-0 opacity-0 cursor-pointer"/></label>
   </div>
   <button onClick={saveDriverEdit} disabled={drvBusy} className="w-full mt-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500 disabled:opacity-50">{drvBusy?'Please wait...':'Save Changes'}</button>
  </>):drvStep===5?(<>
   <div className="mt-6 text-center py-6"><p className="text-5xl">🎉</p><p className="mt-4 font-bold">Sahi OTP milne par registration mukammal ho gayi hai, mubarak ho!</p><p className="text-xs text-white/60 mt-2">List # mil gaya hai, driver ab list mein nazar aa raha hai.</p></div>
   <button onClick={()=>{setDrvWiz(false); setDrvDone(false)}} className="w-full py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500">Theek hai</button>
  </>):(<>
   {/* ---- CREATE WIZARD ---- */}
   {drvStep===1&&(<>
    <div className="grid sm:grid-cols-2 gap-3 mt-5">
     <label className="block"><span className="text-xs font-semibold text-white/80">First Name</span><input value={drvForm.firstName} onChange={e=>setDrvForm((f:any)=>({...f,firstName:e.target.value}))} className="w-full mt-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"/></label>
     <label className="block"><span className="text-xs font-semibold text-white/80">Last Name</span><input value={drvForm.lastName} onChange={e=>setDrvForm((f:any)=>({...f,lastName:e.target.value}))} className="w-full mt-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"/></label>
    </div>
    <label className="block mt-3"><span className="text-xs font-semibold text-white/80">Gender</span><div className="flex gap-3 mt-1.5">{['male','female'].map(g=><button key={g} onClick={()=>setDrvForm((f:any)=>({...f,gender:g}))} className={`flex-1 py-2 rounded-full text-sm font-bold border ${drvForm.gender===g?'bg-white text-black':'bg-white/10 border-white/30'}`}>{g==='male'?'Male':'Female'}</button>)}</div></label>
    <label className="block mt-3"><span className="text-xs font-semibold text-white/80">Username</span><input value={drvForm.username} onChange={e=>setDrvForm((f:any)=>({...f,username:e.target.value}))} className="w-full mt-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none"/></label>
    <div className="grid sm:grid-cols-2 gap-3 mt-3">
     <label className="block"><span className="text-xs font-semibold text-white/80">Password</span><div className="flex items-center mt-1.5 bg-white/10 border border-white/30 rounded-full pl-5 pr-4 py-2.5"><input value={drvForm.password} onChange={e=>setDrvForm((f:any)=>({...f,password:e.target.value}))} type={showP?'text':'password'} className="flex-1 min-w-0 bg-transparent text-sm outline-none"/><button type="button" onClick={()=>setShowP(!showP)} className="ml-2 text-white/70"><EyeIcon open={showP}/></button></div></label>
     <label className="block"><span className="text-xs font-semibold text-white/80">Confirm Password</span><div className="flex items-center mt-1.5 bg-white/10 border border-white/30 rounded-full pl-5 pr-4 py-2.5"><input value={drvForm.confirm} onChange={e=>setDrvForm((f:any)=>({...f,confirm:e.target.value}))} type={showC?'text':'password'} className="flex-1 min-w-0 bg-transparent text-sm outline-none"/><button type="button" onClick={()=>setShowC(!showC)} className="ml-2 text-white/70"><EyeIcon open={showC}/></button></div></label>
    </div>
    <button onClick={()=>{if(!drvStep1Ok()){setDrvErr('Sab fields theek bharen, password kam az kam 8 characters aur confirm se match ho'); return} setDrvErr(''); setDrvStep(2)}} className="w-full mt-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500">Agay Barhein</button>
   </>)}
   {drvStep===2&&(<>
    <p className="text-xs font-bold mt-5">Tasveerein</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
     <ImgBox label="Selfie" field="selfieUrl" folder="drivers"/>
     <ImgBox label="ID Card (Front)" field="idFrontUrl" folder="drivers"/>
     <ImgBox label="ID Card (Back)" field="idBackUrl" folder="drivers"/>
     <ImgBox label="License (Front)" field="licFrontUrl" folder="drivers"/>
     <ImgBox label="License (Back)" field="licBackUrl" folder="drivers"/>
    </div>
    <p className="text-xs font-bold mt-5">Car ki tasveerein (Front/Back/Left/Right, jitni chahiye)</p>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
     {drvForm.carImages.map((p:string)=>(<div key={p} className="relative h-24 rounded-xl overflow-hidden border border-white/30"><img src={imgSrc(p)} className="w-full h-full object-cover"/><button onClick={()=>removeCarImage(p)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-xs">✕</button></div>))}
     <label className="h-24 rounded-xl border border-dashed border-white/40 flex items-center justify-center text-xs text-white/60 cursor-pointer relative">+ Add<input type="file" accept="image/*" onChange={addCarImage} className="absolute inset-0 opacity-0 cursor-pointer"/></label>
    </div>
    <div className="flex gap-3 mt-6"><button onClick={()=>setDrvStep(1)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-white/10 border border-white/30">Pichay</button><button onClick={()=>setDrvStep(3)} className="flex-1 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500">Agay Barhein</button></div>
   </>)}
   {drvStep===3&&(<>
    <p className="text-xs font-bold mt-5">Car ki tafseel</p>
    <div className="grid sm:grid-cols-3 gap-3 mt-2">
     <select value={drvForm.carCompany} onChange={e=>setDrvForm((f:any)=>({...f,carCompany:e.target.value,carName:CAR_DATA[e.target.value][0]}))} className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none">{CAR_COMPANIES.map(c=><option key={c} className="text-black" value={c}>{c}</option>)}</select>
     <select value={drvForm.carName} onChange={e=>setDrvForm((f:any)=>({...f,carName:e.target.value}))} className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none">{(CAR_DATA[drvForm.carCompany]||[]).map(c=><option key={c} className="text-black" value={c}>{c}</option>)}</select>
     <input value={drvForm.carModel} onChange={e=>setDrvForm((f:any)=>({...f,carModel:e.target.value}))} placeholder="Model / year" className="bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none placeholder-white/40"/>
    </div>
    <p className="text-xs font-bold mt-5">Phone Number</p>
    <div className="flex gap-2 mt-2">
     <select value={drvForm.countryCode} onChange={e=>setDrvForm((f:any)=>({...f,countryCode:e.target.value}))} className="bg-white/10 border border-white/30 rounded-full px-3 py-2.5 text-sm outline-none w-32">{COUNTRIES.map(c=><option key={c.iso2} className="text-black" value={c.dial}>{flagEmoji(c.iso2)} {c.dial}</option>)}</select>
     <input value={drvForm.phone} onChange={e=>setDrvForm((f:any)=>({...f,phone:e.target.value.replace(/\D/g,'')}))} placeholder="3001234567" className="flex-1 bg-white/10 border border-white/30 rounded-full px-4 py-2.5 text-sm outline-none placeholder-white/40"/>
    </div>
    <div className="flex gap-3 mt-6"><button onClick={()=>setDrvStep(2)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-white/10 border border-white/30">Pichay</button><button onClick={sendDriverOtp} disabled={drvBusy} className="flex-1 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500 disabled:opacity-50">{drvBusy?'Please wait...':'OTP Bhejein'}</button></div>
   </>)}
   {drvStep===4&&(<>
    <div className="mt-6"><p className="text-sm text-white/80">{drvForm.countryCode}{drvForm.phone} par OTP bheja gaya hai.</p>
     {drvDevOtp&&<p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-300/30 rounded-xl px-3 py-2 mt-2">SMS account abhi connect nahi hai, isliye test OTP yahan dikhaya ja raha hai: <b>{drvDevOtp}</b></p>}
     <input value={drvOtp} onChange={e=>setDrvOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="6 digit OTP" className="w-full mt-4 bg-white/10 border border-white/30 rounded-full px-4 py-3 text-center tracking-[0.5em] text-lg outline-none placeholder-white/40"/>
    </div>
    <div className="flex gap-3 mt-6"><button onClick={()=>setDrvStep(3)} className="flex-1 py-3 rounded-full text-sm font-semibold bg-white/10 border border-white/30">Pichay</button><button onClick={submitDriver} disabled={drvBusy} className="flex-1 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-fuchsia-500 disabled:opacity-50">{drvBusy?'Please wait...':'Verify aur Register'}</button></div>
   </>)}
  </>)}
 </div>
</div>
)}

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
