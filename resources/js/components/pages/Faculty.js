import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Badge from '../Badge';

const IconButton=({title,onClick,children})=> (
  <button onClick={onClick} title={title} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:34,height:34,borderRadius:8,background:'#111827',color:'#fff',border:'1px solid #111827'}}>
    {children}
  </button>
);
const iconProps={width:16,height:16,fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'};
const PencilIcon=()=> (
  <svg {...iconProps} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);
const ArchiveIcon=()=> (
  <svg {...iconProps} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="4" rx="1"/>
    <path d="M7 7v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"/>
    <path d="M10 12h4"/>
  </svg>
);

export default function Faculty(){
  const [list,setList]=useState([]);
  const [depts,setDepts]=useState([]);
  const [q,setQ]=useState('');
  const [deptFilter,setDeptFilter]=useState('all');
  const [showModal,setShowModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const blank={name:'',email:'',department_id:'',position:'',experience:'',gender:'',contact_number:'',address:'',employment_type:'',status:'Active'};
  const [form,setForm]=useState(blank);
  const [error,setError]=useState('');
  const navigate = useNavigate();

  const toArray=(resp)=>{
    const data = resp && resp.data;
    if(Array.isArray(data)) return data;
    if(data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchAll=async()=>{
    const [f,d]=await Promise.all([
      axios.get('/faculties',{ params: { q, department_id: deptFilter==='all'?undefined:deptFilter } }),
      axios.get('/departments'),
    ]);
    const fac = toArray(f);
    setList(fac);
    setDepts(toArray(d));
  };
  useEffect(()=>{fetchAll()},[q,deptFilter])

  const filtered=list.filter(x=>{
    const matchQ=(x.name||'').toLowerCase().includes(q.toLowerCase());
    const matchDept=deptFilter==='all'||String(x.department_id)===String(deptFilter);
    return matchQ&&matchDept;
  });

  const StatusPill=({value})=> <Badge value={value}/>;

  const ensureDeptsLoaded = async ()=>{
    if(!depts || depts.length===0){
      try{
        const res = await axios.get('/departments');
        setDepts(res.data||[]);
        return res.data||[];
      }catch{
        return [];
      }
    }
    return depts;
  };

  const openAdd=async()=>{ 
    const list = await ensureDeptsLoaded();
    const defaultDept = (list && list.length>0) ? list[0].id : '';
    setForm({...blank, department_id: defaultDept}); 
    setEditing(null); 
    setShowModal(true); 
  };
  const openEdit=(f)=>{ setForm({...blank,...f}); setEditing(f); setShowModal(true); };
  const closeModal=()=>{ setShowModal(false); setEditing(null); };

  const save=async()=>{
    setError('');
    const name=(form.name||'').trim();
    const email=(form.email||'').trim();
    const department_id = form.department_id===''? null : Number(form.department_id);
    const position=(form.position||'').trim();
    const experienceRaw = (form.experience ?? '').toString().trim();
    const experience = experienceRaw === '' ? null : Number.parseInt(experienceRaw,10);

    if(!name || !email || !department_id){
      setError('Name, Email, and Department are required.');
      return;
    }
    const emailOk = /.+@.+\..+/.test(email);
    if(!emailOk){ setError('Please enter a valid email address.'); return; }

    const payload={
      ...form,
      name,
      email,
      department_id,
      position: position || null,
      experience: (experience===null || Number.isNaN(experience) || experience < 0) ? null : experience,
      gender: (form.gender||'') || null,
      contact_number: (form.contact_number||'').trim() || null,
      address: (form.address||'').trim() || null,
      employment_type: (form.employment_type||'') || null,
    };

    try{
      if(editing){ await axios.put(`/faculties/${editing.id}`, payload); }
      else { await axios.post('/faculties', payload); }
      closeModal(); await fetchAll();
    }catch(e){
      if(e.response){
        if(e.response.status===419){ setError('Session/CSRF mismatch (419). Please refresh the page and try again.'); return; }
        if(e.response.data){
          const data = e.response.data;
          const serverMsg = typeof data === 'string' ? data : (data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Validation error'));
          setError(serverMsg);
          return;
        }
      }
      setError('Network or server error.');
    }
  };
  const remove=async(f)=>{ if(confirm('Archive faculty?')){ await axios.delete(`/faculties/${f.id}`); navigate('/settings?tab=archived'); } };

  return (
    <div>
      <h2>Faculty Management</h2>
      <div style={{marginTop:12}}>
        <div style={{border:'1px solid #e5e7eb',padding:12,borderRadius:6}}>
          <div style={{marginBottom:8,display:'flex',gap:12,alignItems:'center'}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Faculty..." style={{width:300,padding:8,borderRadius:20,border:'1px solid #e5e7eb'}}/>
            <select value={deptFilter} onChange={e=>{setDeptFilter(e.target.value);}} style={{padding:8,borderRadius:8,border:'1px solid #e5e7eb'}}>
              <option value="all">All Department</option>
              {(Array.isArray(depts)?depts:[]).map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={openAdd} style={{marginLeft:'auto',background:'#000',color:'#fff',borderRadius:8,padding:'6px 10px'}}>+ Add Faculty</button>
          </div>

          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8fafc'}}>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Faculty Member</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Department</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Position</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Gender</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Experience</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Employment Type</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Status</th>
                <th style={{padding:8,border:'1px solid #e5e7eb'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(filtered)?filtered:[]).length===0?(
                <tr><td colSpan={6} style={{padding:16,textAlign:'center'}}>No faculty yet.</td></tr>
              ):(
                (Array.isArray(filtered)?filtered:[]).map(f=> {
                  const d=depts.find(x=>x.id===f.department_id);
                  return (
                    <tr key={f.id}>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.name|| 'Unnamed'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{d?d.name:'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.position||'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.gender||'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.experience??'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>{f.employment_type||'—'}</td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}><StatusPill value={f.status}/></td>
                      <td style={{padding:8,border:'1px solid #e5e7eb'}}>
                        <span style={{display:'inline-flex',gap:6}}>
                          <IconButton title="Edit" onClick={()=>openEdit(f)}><PencilIcon/></IconButton>
                          <IconButton title="Archive" onClick={()=>remove(f)}><ArchiveIcon/></IconButton>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls removed per request */}

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',overflowY:'auto',overflowX:'hidden',padding:'24px 12px'}}>
          <div style={{background:'#fff',padding:16,borderRadius:8,width:'min(90vw, 720px)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <h3>{editing?'Edit Faculty':'Add Faculty'}</h3>
              <button onClick={closeModal}>✖</button>
            </div>
            {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#991B1B',padding:8,borderRadius:6,marginBottom:8,fontSize:12}}>{error}</div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <select value={form.department_id||''} onChange={e=>{
                const v=e.target.value; setForm({...form,department_id: v===''? '': Number(v)});
              }} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Department</option>
                {(Array.isArray(depts)?depts:[]).map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={form.position||''} onChange={e=>setForm({...form,position:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Position</option>
                <option>Dean</option>
                <option>Head</option>
                <option>Professor</option>
                <option>Associate Professor</option>
                <option>Assistant Professor</option>
                <option>Lecturer</option>
                <option>Instructor</option>
                <option>Adjunct</option>
                <option>Coordinator</option>
                <option>Staff</option>
                <option>Other</option>
              </select>
              <select value={form.gender||''} onChange={e=>setForm({...form,gender:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <input placeholder="Contact number" value={form.contact_number||''} onChange={e=>setForm({...form,contact_number:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <input type="number" min="0" step="1" placeholder="Experience (years)" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} style={{minWidth:0,width:'100%'}}/>
              <select value={form.employment_type||''} onChange={e=>setForm({...form,employment_type:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option value="">Select Employment Type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{minWidth:0,width:'100%'}}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <textarea placeholder="Address" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} style={{gridColumn:'1 / span 2',minWidth:0,width:'100%'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button onClick={closeModal}>Cancel</button>
              <button onClick={save} disabled={!((form.name||'').trim() && (form.email||'').trim() && (form.position||'').trim() && form.department_id!=='' && form.department_id!=null && (form.experience!=='' && form.experience!=null))} style={{background:'#000',color:'#fff',borderRadius:6,padding:'6px 10px',opacity: !((form.name||'').trim() && (form.email||'').trim() && (form.position||'').trim() && form.department_id!=='' && form.department_id!=null && (form.experience!=='' && form.experience!=null))? .6: 1,cursor: !((form.name||'').trim() && (form.email||'').trim() && (form.position||'').trim() && form.department_id!=='' && form.department_id!=null && (form.experience!=='' && form.experience!=null))? 'not-allowed':'pointer'}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
