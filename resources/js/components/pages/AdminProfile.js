import React, {useEffect, useState} from 'react'

export default function AdminProfile(){
  const [tab,setTab]=useState('personal');
  const [showEdit,setShowEdit]=useState(false);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');
  const [toast,setToast]=useState('');
  const [errors,setErrors]=useState({});
  const [apiUser,setApiUser]=useState(null);
  const [form,setForm]=useState({
    name:'',
    email:'',
    phone:'',
    role:'',
    current_password:'',
    new_password:'',
    new_password_confirmation:''
  });
  const inputStyle={width:'100%',boxSizing:'border-box',border:'1px solid #E5E7EB',borderRadius:10,padding:'10px 12px',outline:'none'};
  const labelStyle={display:'block',fontSize:12,color:'#6B7280',marginBottom:4};

  useEffect(()=>{
    const fetchUser=async()=>{
      try{
        const res=await fetch('/api/user',{credentials:'include',headers:{Accept:'application/json'}});
        if(!res.ok) return;
        const u=await res.json();
        setApiUser(u);
        setForm(f=>({...f,name:u.name||'',email:u.email||'',phone:u.phone||'',role:u.role||''}));
      }catch(e){}
    };
    fetchUser();
  },[]);

  const Badge=({value})=> (
    <span style={{display:'inline-block',padding:'2px 8px',borderRadius:9999,fontSize:12,fontWeight:600,background:'#F3F4F6',border:'1px solid #E5E7EB'}}>{value}</span>
  );

  const InfoRow=({label,value})=> (
    <div style={{display:'grid',gridTemplateColumns:'160px 1fr',padding:'8px 0',borderBottom:'1px solid #F3F4F6'}}>
      <div style={{color:'#6B7280'}}>{label}</div>
      <div>{value||'—'}</div>
    </div>
  );

  const SectionCard=({children})=> (
    <div style={{background:'#fff',border:'1px solid #E5E7EB',borderRadius:12,padding:16,boxShadow:'0 1px 2px rgba(0,0,0,0.04)'}}>{children}</div>
  );

  const renderTab=()=>{
    if(tab==='personal') return (
      <div>
        <InfoRow label="Name" value={apiUser?.name}/>
        <InfoRow label="Email" value={apiUser?.email}/>
      </div>
    );
    if(tab==='contact') return (
      <div>
        <InfoRow label="Email" value={apiUser?.email}/>
        <InfoRow label="Phone" value={apiUser?.phone||'—'}/>
      </div>
    );
    return (
      <div>
        <InfoRow label="Password" value="••••••••"/>
        <InfoRow label="Two-Factor Auth" value="Disabled"/>
      </div>
    );
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>Admin Profile</div>
          <div style={{color:'#6B7280',fontSize:13}}>Manage your administrative profile and account settings</div>
        </div>
        <button onClick={()=>setShowEdit(true)} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#111827',color:'#fff',borderRadius:9999,padding:'8px 14px',fontWeight:700}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Edit Profile
        </button>
      </div>

      <div style={{display:'flex',gap:20,marginTop:16}}>
        <SectionCard>
          <div style={{width:280}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              {apiUser?.avatar_path ? (
                <img src={(apiUser.avatar_url)||(`/storage/${String(apiUser.avatar_path).replace(/^storage\//,'')}`)} alt="avatar" style={{width:120,height:120,borderRadius:'50%',objectFit:'cover',border:'1px solid #E5E7EB'}}/>
              ):(
                <div style={{width:120,height:120,borderRadius:'50%',background:'#E5E7EB'}}/>
              )}
              <label style={{fontSize:12}}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                  if(!e.target.files?.[0]) return;
                  setLoading(true); setToast(''); setMessage('');
                  try{
                    const csrf=document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||'';
                    const fd=new FormData();
                    fd.append('avatar', e.target.files[0]);
                    const res=await fetch('/api/profile/avatar',{method:'POST',credentials:'include',headers:{'X-CSRF-TOKEN':csrf,Accept:'application/json'},body:fd});
                    if(!res.ok){
                      const err=await res.json().catch(()=>({message:'Failed to upload avatar'}));
                      setToast(err.message||'Failed to upload avatar');
                    }else{
                      const data=await res.json();
                      setApiUser(u=>({...u,avatar_path:data.path,avatar_url:data.url}));
                      setToast('Avatar uploaded successfully');
                    }
                  }catch(_e){
                    setToast('Network error while uploading');
                  }finally{ setLoading(false);} 
                }}/>
                <span style={{cursor:'pointer',color:'#111827',fontWeight:600,background:'#F3F4F6',border:'1px solid #E5E7EB',padding:'6px 10px',borderRadius:9999,display:'inline-block'}}>Change Avatar</span>
              </label>
              <div style={{fontWeight:700}}>{apiUser?.name||'—'}</div>
              <Badge value={'System Administrator'}/>
            </div>
            <div style={{height:1,background:'#E5E7EB',margin:'12px 0'}}/>
            <div style={{display:'grid',gap:10}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" fill="none"/><path d="M22 6L12 13 2 6"/></svg>
                <span>{apiUser?.email||'—'}</span>
              </div>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0  0 1-6-6A19.86 19.86 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.87.3 1.72.57 2.54a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.54-1.14a2 2 0 0 1 2.11-.45c.82.27 1.67.45 2.54.57A2 2 0 0 1 22 16.92z"/></svg>
                <span>{apiUser?.phone}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <div style={{flex:1}}>
          <SectionCard>
            <div style={{marginBottom:10}}>
              <div style={{border:'1px solid #E5E7EB',padding:6,borderRadius:9999,display:'inline-flex',gap:6,background:'#F3F4F6'}}>
                <button onClick={()=>setTab('personal')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='personal'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Personal Info</button>
                <button onClick={()=>setTab('contact')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='contact'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Contact Details</button>
                <button onClick={()=>setTab('security')} style={{padding:'8px 14px',borderRadius:9999,background:tab==='security'?'#fff':'transparent',fontWeight:600,color:'#111827'}}>Security</button>
              </div>
            </div>
            {renderTab()}
          </SectionCard>
        </div>
      </div>

      {showEdit && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:12}}>
          <div style={{width:'100%',maxWidth:640,background:'#fff',borderRadius:12,border:'1px solid #E5E7EB',padding:20,boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontWeight:800,fontSize:16}}>Edit Profile</div>
              <button onClick={()=>{setShowEdit(false);setMessage('')}} style={{background:'transparent',border:'none',fontSize:18}}>×</button>
            </div>

            {(toast||message) && (
              <div style={{marginBottom:10,color: (toast||message).includes('success')?'#065F46':'#991B1B',background: (toast||message).includes('success')?'#ECFDF5':'#FEF2F2',border:'1px solid #E5E7EB',padding:8,borderRadius:8}}>{toast||message}</div>
            )}

            <form onSubmit={async(e)=>{
              e.preventDefault();
              setLoading(true);
              setMessage(''); setToast(''); setErrors({});
              try{
                const csrf=document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||'';
                const res=await fetch('/api/profile',{
                  method:'PUT',
                  headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':csrf},
                  credentials:'include',
                  body:JSON.stringify(form)
                });
                if(!res.ok){
                  const err=await res.json().catch(()=>({message:'Failed to update'}));
                  if(err?.errors) setErrors(err.errors);
                  setMessage(err.message||'Failed to update');
                }else{
                  const data=await res.json();
                  setMessage(data.message||'Updated successfully');
                  setApiUser(u=>({...u,name:form.name,email:form.email,phone:form.phone,role:form.role}));
                  setForm(f=>({...f,current_password:'',new_password:'',new_password_confirmation:''}));
                }
              }catch(_e){
                setMessage('Network error');
              }finally{
                setLoading(false);
              }
            }}>
              <div style={{display:'grid',gap:12}}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={inputStyle}/>
                  {errors.name && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.name[0]}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required style={inputStyle}/>
                  {errors.email && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.email[0]}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputStyle}/>
                  {errors.phone && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.phone[0]}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={inputStyle}/>
                  {errors.role && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.role[0]}</div>}
                </div>
                <div style={{height:1,background:'#F3F4F6',margin:'6px 0'}}/>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" value={form.current_password} onChange={e=>setForm({...form,current_password:e.target.value})} placeholder="Only required when changing password" style={inputStyle}/>
                  {errors.current_password && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.current_password[0]}</div>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'start'}}>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <input type="password" value={form.new_password} onChange={e=>setForm({...form,new_password:e.target.value})} style={inputStyle}/>
                    {errors.new_password && <div style={{color:'#B91C1C',fontSize:12,marginTop:4}}>{errors.new_password[0]}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input type="password" value={form.new_password_confirmation} onChange={e=>setForm({...form,new_password_confirmation:e.target.value})} style={inputStyle}/>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:16}}>
                <button type="button" onClick={()=>{setShowEdit(false);setMessage('')}} style={{padding:'10px 16px',border:'1px solid #E5E7EB',borderRadius:9999,background:'#fff',fontWeight:700,color:'#111827'}}>Cancel</button>
                <button type="submit" disabled={loading} style={{padding:'10px 16px',borderRadius:9999,background:'#111827',color:'#fff',fontWeight:700,opacity:loading?0.7:1}}>{loading?'Saving...':'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
